# Notion to Discord Bot

A simple bot that forwards Notion database updates to Discord channels via webhooks. When changes are made to your Notion database, the bot automatically sends formatted messages to your specified Discord channels.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https%3A%2F%2Fgithub.com%2Fnakanoasaservice%2Fnotion-to-discord-bot)

## Invitation Link

```text
https://discord.com/oauth2/authorize?client_id=1314524073170042962&permissions=2048&integration_type=0&scope=bot
```

## How to use

Set the following URL as the webhook URL of your Notion database.

```text
https://notion-to-discord-bot.yoshinani.workers.dev/{{Discord Channel ID}}?title={{Title (Optional)}}
```
