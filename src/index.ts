import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type {
	ButtonStyle,
	ComponentType,
	RESTPostAPIChannelMessageJSONBody,
} from "discord-api-types/v10";
import { Hono } from "hono";
import { formatProperty } from "./formatter";

interface NotionWebhookBody {
	data: PageObjectResponse;
}

function truncate(text: string, maxLength: number): string {
	const chars = [...text]; // Avoid splitting surrogate pairs
	if (chars.length <= maxLength) return text;
	return `${chars.slice(0, maxLength - 1).join("")}…`;
}

async function sendDiscordMessage(
	token: string,
	channelId: string,
	message: RESTPostAPIChannelMessageJSONBody,
) {
	const response = await fetch(
		`https://discord.com/api/v10/channels/${channelId}/messages`,
		{
			method: "POST",
			headers: {
				Authorization: `Bot ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(message),
		},
	);

	if (!response.ok) {
		const errorBody = await response.text();
		console.error(errorBody);

		throw new Error(`Discord API error`, { cause: errorBody });
	}

	return response;
}

const app = new Hono<{ Bindings: Env }>();

app.post("/:discordChannelId", async (c) => {
	if (!c.env.DISCORD_BOT_TOKEN) {
		throw new Error("DISCORD_BOT_TOKEN is not set");
	}

	const title = c.req.query("title");
	const discordChannelId = c.req.param("discordChannelId");
	const body = await c.req.json<NotionWebhookBody>();

	await sendDiscordMessage(c.env.DISCORD_BOT_TOKEN, discordChannelId, {
		embeds: [
			{
				title: title === undefined ? undefined : truncate(title, 256),
				color: 0x2f3437,
				url: body.data.url,
				fields: Object.entries(body.data.properties).map(([key, property]) => ({
					name: truncate(key, 256),
					value: truncate(formatProperty(property), 1024),
					inline: true,
				})),
			},
		],
		components: [
			{
				type: 1 satisfies ComponentType.ActionRow,
				components: [
					{
						type: 2 satisfies ComponentType.Button,
						label: "Open in Notion",
						style: 5 satisfies ButtonStyle.Link,
						url: body.data.url,
					},
				],
			},
		],
	});

	return c.body(null, 204);
});

export default app;
