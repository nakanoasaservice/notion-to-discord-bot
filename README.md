# Notion to Discord Bot

A simple bot that forwards Notion database updates to Discord channels via webhooks. When changes are made to your Notion database, the bot automatically sends formatted messages to your specified Discord channels.

## Invitation Link

```text
https://discord.com/oauth2/authorize?client_id=1314524073170042962&permissions=2048&integration_type=0&scope=bot
```

## How to use

Set the following URL as the webhook URL of your Notion database.

```text
https://notion-to-discord-bot.yoshinani.workers.dev/{{Discord Channel ID}}?title={{Title (Optional)}}
```
