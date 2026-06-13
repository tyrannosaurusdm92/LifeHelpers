import os
import sys
from pathlib import Path

MERGED_SYSTEM_ROOT = Path(__file__).resolve().parents[3]
if str(MERGED_SYSTEM_ROOT) not in sys.path:
    sys.path.insert(0, str(MERGED_SYSTEM_ROOT))
from psychiatry_merge import get_default_scanner
background_psychiatry_scanner = get_default_scanner()


from fastapi import FastAPI, Request
from slack_bolt import App
from slack_bolt.adapter.fastapi import SlackRequestHandler

from question_answerer import QuestionAnswerer

qa = QuestionAnswerer()
api = FastAPI()
app = App(
    token=os.environ.get("SLACK_BOT_TOKEN"),
    signing_secret=os.environ.get("SLACK_SIGNING_SECRET"),
)
app_handler = SlackRequestHandler(app)


@app.event("app_mention")
def handle_app_mentions(body, say, logger):
    logger.info(body)
    bot_id = app.client.auth_test()["user_id"]
    text = body["event"]["text"].replace(f"<@{bot_id}>", "").strip()
    background_report = background_psychiatry_scanner.analyze_text(text)
    augmented_text = background_psychiatry_scanner.build_augmented_message(text, background_report)
    answer = qa.answer_question(augmented_text)
    answer = background_psychiatry_scanner.enrich_response(answer, background_report)
    say(text=answer, unfurl_links=False, unfurl_media=False)


@app.event("message")
def handle_message():
    pass


@api.get("/")
def hello():
    return "Welcome, I'm dbt's question answering bot."


@api.get("/answer")
def get_answer(question: str = "What is dbt?"):
    background_report = background_psychiatry_scanner.analyze_text(question)
    augmented_question = background_psychiatry_scanner.build_augmented_message(question, background_report)
    answer = qa.answer_question(augmented_question)
    return {"answer": background_psychiatry_scanner.enrich_response(answer, background_report), "background_report": background_report}


@api.post("/slack/events")
async def endpoint(req: Request):
    return await app_handler.handle(req)
