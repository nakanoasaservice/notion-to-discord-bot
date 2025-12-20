# Notion to Discord Bot

> Automatically forward Notion webhook events to Discord channels with beautifully formatted embeds.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https%3A%2F%2Fgithub.com%2Fnakanoasaservice%2Fnotion-to-discord-bot)

_👆 Click to deploy your own private instance to Cloudflare Workers instantly._

A lightweight Cloudflare Worker that bridges Notion and Discord. When Notion sends webhook events (from database updates, button actions, etc.), this bot automatically formats and sends them to your Discord channels as rich embeds.

## ✨ Features

- 🔄 **Real-time Sync**: Automatically forwards Notion webhook events to Discord.
- 🎨 **Rich Embeds**: Beautifully formatted Discord embeds supporting all property types.
- 🔗 **Interactive**: Direct links to Notion pages with clickable buttons.
- 🚀 **Serverless**: Built on Cloudflare Workers for zero-maintenance, global edge deployment.

## 🚀 Getting Started

Choose the method that best fits your needs.

### Path A: Quick Usage (Public Instance)
Use our pre-deployed worker without any setup.

1. **Invite the Bot**: [Click here to invite the bot to your Discord server](https://discord.com/oauth2/authorize?client_id=1314524073170042962&permissions=2048&integration_type=0&scope=bot).
2. **Skip Deployment**: Go directly to the [Configuration](#%EF%B8%8F-configuration) section below.

### Path B: Self-Hosting
Host your own instance on Cloudflare Workers for full control and custom domains.

#### Option 1: One-Click Deploy
1. Click the **"Deploy to Cloudflare"** button at the top of this page.
2. Follow the on-screen instructions to authorize Cloudflare Workers.
3. When prompted for **Secret Variables**, enter your **Discord Bot Token** as `DISCORD_BOT_TOKEN`.

#### Option 2: Manual Deploy
1. Clone the repository:
   ```bash
   git clone https://github.com/nakanoasaservice/notion-to-discord-bot.git
   cd notion-to-discord-bot
   pnpm install
   ```
2. Set your Discord Bot Token:
   ```bash
   wrangler secret put DISCORD_BOT_TOKEN
   ```
3. Deploy:
   ```bash
   pnpm run deploy
   ```

> **Note for Self-Hosters**: You will need to create your own Discord Application and Bot in the [Discord Developer Portal](https://discord.com/developers/applications) to get a Bot Token.

## ⚙️ Configuration

Follow these steps to connect Notion to Discord.

### 1. Prepare Discord

1. **Get Channel ID**:
   - Enable **Developer Mode** in Discord (User Settings → Advanced → Developer Mode).
   - Right-click the channel you want notifications in and select **"Copy Channel ID"**.
2. **Ensure Permissions**: Make sure the bot has `Send Messages` permissions in that channel.

### 2. Configure Notion Webhook

Construct your Webhook URL using one of the formats below.

**For Public Instance Users:**
```
https://notion-to-discord-bot.yoshinani.workers.dev/{DISCORD_CHANNEL_ID}?title={OPTIONAL_TITLE}
```

**For Self-Hosted Users:**
```
https://your-worker-name.your-subdomain.workers.dev/{DISCORD_CHANNEL_ID}?title={OPTIONAL_TITLE}
```

**Parameters:**
- `{DISCORD_CHANNEL_ID}`: The ID you copied from Discord.
- `title` (optional): Custom title for the embed (defaults to the Notion page title).

**Example:**
```
https://notion-to-discord-bot.yoshinani.workers.dev/1234567890123456789?title=Task Updates
```

**Where to set this URL:**
- **Database Webhooks**: Settings → Connections → Webhooks → Add webhook
- **Button Actions**: Configure a button to send a webhook to this URL
- **Other Integrations**: Any service that supports Notion webhooks

## 📋 Supported Properties

This bot supports formatting for all major Notion property types:

- ✅ **Text**: Title, Rich Text, URL, Email, Phone Number
- ✅ **Select**: Select, Multi-select, Status
- ✅ **Date**: Date, Created Time, Last Edited Time
- ✅ **People**: People, Created By, Last Edited By
- ✅ **Numbers**: Number, Formula (number)
- ✅ **Boolean**: Checkbox, Formula (boolean)
- ✅ **Relations**: Relation, Rollup
- ✅ **Files**: Files (internal & external)
- ✅ **Other**: Unique ID, Verification, Button

## 🛠️ Development

If you want to contribute or modify the code:

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run start

# Run tests
pnpm run test

# Type checking & Linting
pnpm run check-types
pnpm run check:fix
```

### Project Structure
- `src/index.ts`: Main Hono application & Discord integration
- `src/formatter.ts`: Notion property formatting logic
- `src/client.tsx`: Client-side code

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is private and not licensed for public use.

## 🙏 Acknowledgments

- Built with [Hono](https://hono.dev/)
- Powered by [Cloudflare Workers](https://workers.cloudflare.com/)
