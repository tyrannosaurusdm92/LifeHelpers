# ADHD-Manager-Bot

# Try it yourself!!! 
https://t.me/ADHD_Manager_Bot

The bot also supports short voice messages!

A Telegram bot designed to help people with ADHD manage their tasks, time, and daily activities. Built with LangChain and GPT-4, this bot provides a friendly, conversational interface for task management and productivity support.

## Intallation
To install the bot, you need to create AWS lambda, add layers, environment variables, and API endpoint and create a Telegram bot webhook
change destination_url and destination_url2 to your lambda URL

## Features
### 🎯 Task Management
- Maintain and manage ToDo lists
- Natural language task input
- View current tasks anytime
### ⏰ Pomodoro Timer
- /pomodoro - Start a 25-minute focus session
- /short - Take a 5-minute break
- /long - Take a 15-minute break
- /aboutpomodoro - Learn about the Pomodoro Technique
### ⏰ Reminder System
- Set timed reminders for tasks
- Flexible time formats (e.g., "10m", "1h")
- Automatic reminder notifications
### 🗣️ Voice Message Support
- Send voice messages for task management
- Automatic speech-to-text transcription
- Natural language processing of voice commands
### 💬 Conversational Interface
- Friendly, casual chat experience
- Natural language understanding
- Context-aware responses
## Environment Variables Required
- TELEGRAM_TOKEN - Your Telegram Bot Token
- OPENAI_API_KEY - OpenAI API Key
- REDIS_URL - Redis connection URL
- QSTASH_TOKEN - QStash Token for reminders
## Getting Started
1. Start a chat with the bot
2. Use /start to get an introduction
3. Start adding tasks or use the Pomodoro timer
4. Chat naturally with the bot about your tasks and needs
## Commands
- /start - Initialize the bot and get started
- /pomodoro - Start a 25-minute Pomodoro session
- /short - Start a 5-minute break
- /long - Start a 15-minute break
- /aboutpomodoro - Learn about the Pomodoro Technique

