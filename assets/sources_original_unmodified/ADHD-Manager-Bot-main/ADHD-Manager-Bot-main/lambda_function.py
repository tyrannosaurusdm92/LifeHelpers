import os
import json
import requests
import openai
import redis
from langchain import PromptTemplate
from langchain.chat_models import ChatOpenAI
from langchain.memory import RedisChatMessageHistory
from langchain.memory import ConversationBufferWindowMemory
from langchain.chains import ConversationChain
from langchain.schema import SystemMessage, HumanMessage
from langchain.agents import initialize_agent
from langchain.agents import AgentType
from langchain.prompts import PromptTemplate
from langchain.agents import ZeroShotAgent, Tool, AgentExecutor
from langchain import LLMChain
TELEGRAM_TOKEN = os.environ['TELEGRAM_TOKEN']
TELEGRAM_URL = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/"
ZILLIZ_CLOUD_URI = os.environ["ZILLIZ_CLOUD_URI"]
ZILLIZ_CLOUD_API_KEY = os.environ["ZILLIZ_CLOUD_API_KEY"] 
os.environ["OPENAI_API_KEY"] = os.environ["OPENAI_API_KEY"]

#convert voice messages sent to bot to texts to send it to AI as text
def voice_to_text(voice_file_path):
    with open(voice_file_path, "rb") as f:
        transcript = openai.Audio.transcribe("whisper-1", f)
    return transcript["text"]

def lambda_handler(event, context):
    tgmessage = json.loads(event['body'])
    
# QStash reminder: {"message": "...", "chat_id": ...}
    if "update_id" not in tgmessage:
        source = tgmessage.get("source", "")
        
        # if it is Pomodoro reminder → send it to user without agent
        if source == "qstash-pomodoro":
            print("QStash Pomodoro reminder triggered")
            msg = tgmessage.get("message", "")
            chat_id = tgmessage.get("chat_id")
            if chat_id:
                send_telegram_message(chat_id, f"⏰ Reminder: {msg}")
            else:
                print("chat_id missing in QStash payload")
            return {
                'statusCode': 200,
                'body': json.dumps("Pomodoro reminder processed")
            }
        
        # if it is a qstash reminder which was set up by the agent → send it to user without agent
        else:
            print("Generic QStash reminder triggered")
            msg = tgmessage.get("message", "")
            chat_id = tgmessage.get("chat_id")
            if chat_id:
                send_telegram_message(chat_id, f"⏰ Reminder: {msg}")
            else:
                print("chat_id missing in generic QStash payload")
            return {
                'statusCode': 200,
                'body': json.dumps("Reminder processed")
            }

    # Telegram event
    chat_id = tgmessage['message']['chat']['id']

    # Define the tool for managing the ToDo list
    def get_todo_list(_: str = "") -> str:
        r = redis.from_url(os.environ["REDIS_URL"])
        key = f"todo:{chat_id}"
        current = r.get(key)
        if not current:
            return "📝 Your ToDo list is currently empty."
        return f"📝 Your current ToDo list:\n{current.decode('utf-8')}"

    # Define the tool for managing the ToDo list
    def manage_todo_list(action_input: str) -> str:
        r = redis.from_url(os.environ['REDIS_URL'])
        key = f"todo:{chat_id}"
        value = action_input.strip()

        if not value or any(x in value.lower() for x in ["memory", "final answer", ":"]):
            return "❌ Invalid ToDo input. Nothing changed."

        if "\n" in value:
            cleaned = value.strip()
        else:
            # most likely agent returned only one task
            # we don't clear the list and just add the new task
            cleaned = value.strip()
            current = r.get(key)
            current_list = current.decode("utf-8") if current else ""
            if value.lower() not in current_list.lower():
                cleaned = current_list + "\n" + value
            else:
                cleaned = current_list  # the task alredy exists, we are not duplicating it

        r.set(key, cleaned.strip())
        return "✅ ToDo updated."

    # Define the tool for managing long-term memories
    def manage_memory(action_input: str) -> str:
        r2 = redis.from_url("rediss://default:AZL4AAIjcDFjMWY5YTg5NTI5ZjQ0NTJlYmRmNTkzYzZkYWI2MzIyM3AxMA@growing-leech-37624.upstash.io:6379")
        key = f"long-term_memory:{chat_id}"  # chat_id доступен в handler'е

        current2 = r2.get(key)
        current_list2 = current2.decode("utf-8") if current2 else "No memories yet."

        # the current list is shown to the agent and the agent returns the updated list 
        response2 = f"Current memory list:\n{current_list2}\n\nPlease return the updated list exactly as you want it to be saved. If you change it start the message from Memory updated: if you don't change it, please start with Memory:"
        r2.set(key, action_input.strip())
        return response2

    # Define the tool for scheduling reminders
    def schedule_delayed_reminder(action_input: str) -> str:
        qstash_token = os.environ["QSTASH_TOKEN"]
        try:
            message, delay = action_input.split("||")
        except ValueError:
            return "❌ Invalid format. Use: message||delay (e.g. 'Позвонить||10m')"

        headers = {
            "Authorization": f"Bearer {qstash_token}",
            "Content-Type": "application/json",
            "Upstash-Delay": delay.strip()
        }

        body = {
            "message": message.strip(),
            "chat_id": chat_id  # ты можешь передавать глобально из handler
        }

        destination_url = "YOUR LAMBDA URL"
        response = requests.post(f"https://qstash.upstash.io/v2/publish/{destination_url}", headers=headers, json=body)

        if response.status_code in (200, 201):
            return f"✅ Reminder scheduled for {delay.strip()}."
        return f"❌ Failed: {response.status_code} - {response.text}"

    # Define the tools
    tools = [
        Tool(
            name="Remind",
            func=schedule_delayed_reminder,
            description=(
                "Use this tool ONLY if the user explicitly asks to set a timed reminder. "
                "You must pass the reminder as `message||delay` where delay is something like '10m' or '1h'. "
                "Do NOT use this tool unless time is clearly specified by the user."
            )
        ),
        Tool(
            name="ToDoManager",
            func=manage_todo_list,
            description=(
                "Use this tool to update the human's ToDo list. "
                "You will be shown the current list. Return the Full updated list as plain text. "
                "If you don't change anything, just return the same text"
                "The tool overwrites the to do list. You need to return the full list including the previous items"
            )
        ),
        Tool(
            name="Long_term_memory",
            func=manage_memory,
            description=(
                "Use this tool to store long-term memories for the human."
                "ONLY use it to save meaningful facts or notes if the human asks to remember something. or if you think it is reasonable "
                "If you don't change anything, just return the same text"
                "You will be shown the current list. Return the FULL updated memory as plain text. "
                "The tool overwrites the memory. You need to return the full memory including the previous memories"
            )
        ),
        Tool(
            name="GetToDoList",
            func=get_todo_list,
            description=(
                "Use this tool to retrieve the user's current ToDo list. "
                "Call it if the user asks something like 'my tasks', 'what do I have', 'what's on my list', etc."
            )
        )
    ]
    prefix = """ADHD Bot is a friendly and casual chat bot based on a large language model trained by OpenAI.

    ADHD Bot is designed to be your buddy in managing ADHD and daily tasks. It can handle both casual chats and task management with a friendly, informal tone. The bot understands slang and casual language, making conversations feel natural and comfortable.

    You have access to the tools.

    Only use tools if absolutely necessary. If you can respond to the user's message directly, do so.

    IMPORTANT:
    - For casual greetings or chat, respond directly without tools
    - Use tools only for specific ADHD management actions
    - Keep responses friendly, informal, natural, human-like and match the user's casual tone 
    - you must avoid using emojis in every message !!!
    - If the user asks about their current tasks, use the GetToDoList tool
    - Don't overthink casual messages - respond naturally

    When you get a message, you can either:
    - Use a tool to perform a specific action
    - Respond directly with a casual, friendly message

    You MUST respond in this format:
    If you want to use a tool:
    Thought: [your reasoning]
    Action: [tool name]
    Action Input: [input to the tool]

    If you want to respond directly:
    Thought: I'll respond casually
    Final Answer: [your friendly reply]

    For casual chat, always use 'Final Answer' format!
    """

    suffix = """
    Begin!
    {chat_history}
    Question: {input}

    {agent_scratchpad}

    Remember: For casual chat, your response MUST be in this exact format:
    Thought: I'll respond casually
    Final Answer: [your friendly reply]
    """
    prompt = ZeroShotAgent.create_prompt(
        tools=tools,
        prefix=prefix,
        suffix=suffix,
        input_variables=["input", "agent_scratchpad", "chat_history"]
    )
    # Log the received event for debugging
    print("Received event: ", json.dumps(event, indent=4))
    
    # Check if 'message' key exists in the event
    if 'message' in tgmessage:
        #extract chat_id and text from the message
        chat_id = tgmessage['message']['chat']['id']
        text = tgmessage['message'].get('text', '')
        requests.post(
            f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendChatAction",
            data={"chat_id": chat_id, "action": "typing"}
        )
        
        #define redis history
        REDIS_URL = "rediss://default:AZL4AAIjcDFjMWY5YTg5NTI5ZjQ0NTJlYmRmNTkzYzZkYWI2MzIyM3AxMA@growing-leech-37624.upstash.io:6379"
        history = RedisChatMessageHistory(
            session_id=str(chat_id),
            url=REDIS_URL,
            key_prefix="RedisHistory"
        )
     
        #define llm, memory and the agent chain
        llm = ChatOpenAI(model_name='gpt-4o', temperature=0.4, max_tokens=256)
        llm_chain = LLMChain(llm=llm, prompt=prompt)
        agent = ZeroShotAgent(llm_chain=llm_chain, tools=tools, verbose=True)

        memory = ConversationBufferWindowMemory(
            k=5,
            memory_key="chat_history",
            chat_memory=history,   # ← ключевая строка
            return_messages=True,
            output_key="output"
        )

        agent_chain = AgentExecutor.from_agent_and_tools(
            agent=agent,
            tools=tools,
            verbose=True,
            memory=memory
        )

        #welcome message on /start
        if text == '/start':
            start_message = "Hi!\nI'm your ADHD Personal Manager. I'm here to help you to manage your life. \n\n🗨️ Chat Style: Feel free to talk to me like you would to a friend.\nYou can tell me about your tasks anytime so I can prioritize them and remind you \n\n🤔 First Things First: please tell me about yourself and about your tasks. You can write just a few words and we will settle everything else later"
            send_telegram_message(chat_id, start_message)
            history.add_message(HumanMessage(content="/start"))
            history.add_message(SystemMessage(content=start_message))
        #pomodoro timer
        elif text == '/pomodoro':
            send_telegram_message(chat_id, "⏰ Pomodoro timer for 25 minutes started! Focus time begins now.\nYou’ll receive a notification when it’s time for a break.")
            qstash_token = os.environ["QSTASH_TOKEN"]
            message2 = "✅ Your Pomodoro session is complete. Take a short break or a long break after 4 sessions." 
            delay2 = "25m"
            headers = {
                "Authorization": f"Bearer {qstash_token}",
                "Content-Type": "application/json",
                "Upstash-Delay": delay2
            }

            body = {
                "source": "qstash-pomodoro",
                "message": message2,
                "chat_id": chat_id 
            }
            history.add_message(SystemMessage(content=message2))
            destination_url2 = "YOUR LAMBDA URL"
            response2 = requests.post(f"https://qstash.upstash.io/v2/publish/{destination_url2}", headers=headers, json=body)

            if response2.status_code in (200, 201):
                return {
                    "statusCode": 200,
                    "body": json.dumps("Pomodoro timer set")
                } 
        #short break timer
        elif text == '/short':
             send_telegram_message(chat_id, "⏰ A Short Break timer for 5 minutes started!\nI’ll notify you when the break is over.")
             history.add_message(HumanMessage(content="/short"))
             history.add_message(SystemMessage(content="⏰ A Short Break timer for 5 minutes started!\nI’ll notify you when the break is over."))
        #long break timer
        elif text == '/long':
             long_break = "⏰ A Long Break timer for 15 minutes started!\nI’ll notify you when the break is over."
             history.add_message(HumanMessage(content="/long"))
             history.add_message(SystemMessage(content=long_break))
             send_telegram_message(chat_id, long_break)
             qstash_token = os.environ["QSTASH_TOKEN"]
             message2 = "✅ Your Long Break is complete. Take 4 more Pomodoro sessions or have some rest" 
             delay2 = "1m"
             headers = {
                 "Authorization": f"Bearer {qstash_token}",
                 "Content-Type": "application/json",
                 "Upstash-Delay": delay2
             }

             body = {
                 "source": "qstash-pomodoro",
                 "message": message2,
                 "chat_id": chat_id 
             }
             history.add_message(SystemMessage(content=message2))
             destination_url2 = "YOUR LAMBDA URL"
             response2 = requests.post(f"https://qstash.upstash.io/v2/publish/{destination_url2}", headers=headers, json=body)
 
             if response2.status_code in (200, 201):
                 return {
                     "statusCode": 200,
                     "body": json.dumps("Pomodoro timer set")
                } 
        #about pomodoro
        elif text == '/aboutpomodoro':
             about_pomodoro = "The Pomodoro Technique is a time management method which also helps people with ADHD to complete tasks.\n1. Decide on the task to be done.\n2. Set the Pomodoro timer and work on the task for 25 minutes.\n3. End work when the time is over.\n4. Start a Short Break timer (5 minutes).\n5. Go back to Step 2 and repeat until you complete four pomodori timers.\n6. After four pomodori are done, take a Long Break (25 minutes) instead of a short break. Once the long break is finished, return to step 2 or end your work if you are tired."
             send_telegram_message(chat_id, about_pomodoro) 
             history.add_message(HumanMessage(content="/aboutpomodoro"))
             history.add_message(SystemMessage(content=about_pomodoro))
        #elif the message is voice
        elif 'voice' in tgmessage['message']:
            try:
                # Get voice file details
                voice_file_id = tgmessage['message']['voice']['file_id']
                voice_file_path = f"/tmp/voice_message_{chat_id}.ogg"
                
                # Download the voice file from Telegram
                voice_file_url = TELEGRAM_URL + f"getFile?file_id={voice_file_id}"
                tgresponse = requests.get(voice_file_url)
                
                if not tgresponse.ok:
                    raise Exception(f"Failed to get file info: {tgresponse.status_code}")
                    
                file_path = tgresponse.json()['result']['file_path']
                download_url = f"https://api.telegram.org/file/bot{TELEGRAM_TOKEN}/{file_path}"
                
                # Download and save the voice file
                voice_response = requests.get(download_url)
                if not voice_response.ok:
                    raise Exception(f"Failed to download file: {voice_response.status_code}")
                    
                with open(voice_file_path, 'wb') as f:
                    f.write(voice_response.content)

                # Convert to text
                text = voice_to_text(voice_file_path)
                if text is None:
                    send_telegram_message(chat_id, "❌ Sorry, I couldn't transcribe the audio. Could you try again?")
                    return {
                        'statusCode': 200,
                        'body': json.dumps("Transcription failed")
                    }

                # Process the transcribed text
                text_content = text.strip() if isinstance(text, str) else str(text)
                
                # Always show what was transcribed
                send_telegram_message(chat_id, f"You said: {text_content}")
                
                try:
                    print("=== PROMPT ===")
                    print(prompt)

                    result = agent_chain.run(input=text)
                    send_telegram_message(chat_id, result)

                except Exception as e:
                    raw_output = str(e)
                    if "Could not parse LLM output:" in raw_output:
                        # Fallback: вытаскиваем текст, даже если он не в нужном формате
                        fallback = raw_output.split("Could not parse LLM output:")[1].strip(" `\n")
                        send_telegram_message(chat_id, fallback)
                        return {
                            'statusCode': 200,
                            'body': json.dumps("Fallback response sent")
                        }

                    print(f"Agent processing error: {str(e)}")
                    send_telegram_message(
                        chat_id,
                        "I heard you but I'm having trouble understanding. Could you try rephrasing that?"
                    )
                    return {
                        'statusCode': 200,
                        'body': json.dumps("Agent error")
                    }
                    
            except Exception as e:
                print(f"Voice message processing error: {str(e)}")
                send_telegram_message(
                    chat_id,
                    "❌ Sorry, I couldn't process the voice message. Please try again or send your message as text."
                )
            finally:
                # Cleanup temporary file
                try:
                    if os.path.exists(voice_file_path):
                        os.remove(voice_file_path)
                except Exception as e:
                    print(f"Failed to cleanup voice file: {str(e)}")
            
            return {
                'statusCode': 200,
                'body': json.dumps("Voice message processed")
            }

        #if the message is any text from a user
        else:
            #send to ai
            print("=== PROMPT ===")
            print(prompt)

            result = agent_chain.run(input=text)
            #send a response to a user
            send_telegram_message(chat_id, result)

    #if the event does not contain 'message'
    else:
        print("No 'message' key found in the received event")
        return {
            'statusCode': 400,
            'body': json.dumps("Bad Request: No 'message' key")
        }

    return {
        'statusCode': 200
    }

#send a message back to a user
def send_telegram_message(chat_id, tgmessage):
    url = TELEGRAM_URL + f"sendMessage?chat_id={chat_id}&text={tgmessage}"
    requests.get(url)
