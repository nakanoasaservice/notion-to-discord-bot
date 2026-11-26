# AGENTS.md

## Project

A Cloudflare Worker (Hono) that receives Notion automation webhooks and posts them to a Discord channel as embeds via a Discord bot. The landing page is also a webhook URL generator.

- `src/index.ts`: Worker entry, Hono routes, and Discord API calls
- `src/formatter.ts`: Notion property → Discord text formatting
- `src/client.tsx`: Landing page / URL generator UI (`hono/jsx/dom`), served from `dist` as an SPA
- `test/`: Tests that run in the Workers runtime

Sister project: [Notion to Discord Relay](https://notion-to-discord-relay.naas.workers.dev/) works with a Discord Webhook URL instead of a bot.

## Commands

```bash
pnpm install --frozen-lockfile
pnpm run dev         # Local development
pnpm run check       # Format, lint, and type check (Vite+)
pnpm run check:fix   # Auto-fix formatting and lint issues
pnpm run test        # Run tests
pnpm run build       # Build
pnpm run cf-typegen  # Regenerate Worker binding types
```

Run `pnpm run check` and `pnpm run test` before committing.

## Conventions

- Import from `vite-plus`, not `vite` (enforced by lint).
- The URL is the configuration: the channel ID is in the path and `title` is a query parameter. Don't add server-side state.
- `DISCORD_BOT_TOKEN` is the only required secret.

## Language

Write issues, pull requests, and commit messages in English.
