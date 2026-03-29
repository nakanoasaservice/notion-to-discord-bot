# Notion to Discord Bot

> Forward Notion webhook events to Discord channels as beautifully formatted embeds.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https%3A%2F%2Fgithub.com%2Fnakanoasaservice%2Fnotion-to-discord-bot)

A lightweight Cloudflare Worker that bridges Notion and Discord. Set up an automation in Notion to send a webhook when a database entry is created or updated, and this bot will format the page properties and post them to your Discord channel as a rich embed — complete with a direct link back to the Notion page.

- 🔄 **Real-time**: Notion automation triggers → Discord message, instantly.
- 🎨 **Rich embeds**: All major property types formatted beautifully.
- 🔗 **Direct links**: Every embed includes an "Open in Notion" button.
- ⚙️ **URL-based config**: Webhook URL = settings page. No account needed.
- 🚀 **Serverless**: Runs on Cloudflare Workers — zero maintenance.

## Quick Start

1. **Invite the bot** to your Discord server: [Click here to authorize](https://discord.com/oauth2/authorize?client_id=1314524073170042962&permissions=2048&integration_type=0&scope=bot)

2. **Get your Channel ID**: Enable Developer Mode in Discord (User Settings → Advanced → Developer Mode), then right-click the channel you want notifications in and select "Copy Channel ID".

3. **Generate your webhook URL**: Open [notion-to-discord-bot.naas.workers.dev](https://notion-to-discord-bot.naas.workers.dev), enter the Channel ID and an optional title, then copy the generated URL.

4. **Configure Notion**: In your Notion database, go to Settings → Automations → New action → Send webhook, and paste the URL.

That's it. When Notion triggers the webhook, the bot will post a formatted embed to your channel.

## URL as Configuration

The webhook URL is also a settings page. Every parameter is encoded in the URL itself:

```
https://notion-to-discord-bot.naas.workers.dev/1234567890123456789?title=Task%20Updates
```

If you need to check or change your settings later, just open the URL in a browser — the form will load pre-filled with your current values. Edit the fields, and the URL updates live. Copy the new URL and replace the one in Notion.

No account, no stored state. Everything lives in the URL.

**URL parameters:**
- `{DISCORD_CHANNEL_ID}` (path, required): The Discord channel to post to.
- `title` (query, optional): Custom title shown at the top of the embed. Defaults to the Notion page title.

## Self-Hosting

If you want your own private instance with a custom domain or your own Discord bot token:

### One-Click Deploy
Click the **"Deploy to Cloudflare"** button at the top of this page and follow the instructions. When prompted for secret variables, enter your Discord Bot Token as `DISCORD_BOT_TOKEN`.

### Manual Deploy
```bash
git clone https://github.com/nakanoasaservice/notion-to-discord-bot.git
cd notion-to-discord-bot
pnpm install
wrangler secret put DISCORD_BOT_TOKEN
pnpm run deploy
```

> You'll need to create your own Discord Application and Bot at the [Discord Developer Portal](https://discord.com/developers/applications) to get a Bot Token.

## Supported Notion Properties

- **Text**: Title, Rich Text, URL, Email, Phone Number
- **Select**: Select, Multi-select, Status
- **Date**: Date, Created Time, Last Edited Time
- **People**: People, Created By, Last Edited By
- **Numbers**: Number, Formula (number)
- **Boolean**: Checkbox, Formula (boolean)
- **Relations**: Relation, Rollup
- **Files**: Files (internal & external)
- **Other**: Unique ID, Verification, Button

## Development

```bash
pnpm install       # Install dependencies
pnpm run start     # Start development server
pnpm run test      # Run tests
pnpm run check-types   # Type checking
pnpm run check:fix     # Lint & format
```

**Project structure:**
- `src/index.ts` — Main Hono application & Discord integration
- `src/formatter.ts` — Notion property formatting logic
- `src/client.tsx` — Client-side webhook URL generator UI

## Contributing

Contributions are welcome. Please feel free to submit a Pull Request.

## Acknowledgments

Built with [Hono](https://hono.dev/), powered by [Cloudflare Workers](https://workers.cloudflare.com/).
