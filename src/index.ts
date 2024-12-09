import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { RESTPostAPIChannelMessageJSONBody } from "discord-api-types/v10";
import type {
	PartialUserObjectResponse,
	UserObjectResponse,
	PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

type RemoveId<T> = T extends unknown ? Omit<T, "id"> : never;
type Property = PageObjectResponse["properties"][number];

interface NotionWebhookBody {
	data: PageObjectResponse;
}

interface Env {
	DISCORD_BOT_TOKEN: string;
}

interface DiscordErrorResponse {
	code: number;
	message: string;
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
		const errorBody = (await response.json()) as DiscordErrorResponse;
		console.error(errorBody);

		throw new Error(
			`Discord API error: ${response.status} - ${errorBody.message}`,
		);
	}

	return response;
}

function isUserObjectResponse(
	user: PartialUserObjectResponse | UserObjectResponse,
): user is UserObjectResponse {
	return "type" in user;
}

function formatProperty(property: RemoveId<Property>): string {
	if (!property || !("type" in property)) {
		return "[Invalid Property]";
	}

	switch (property.type) {
		case "title":
			return property.title?.[0]?.plain_text ?? "[Empty Title]";
		case "rich_text":
			return property.rich_text?.[0]?.plain_text ?? "[Empty Text]";
		case "url":
			return property.url ?? "[No URL]";
		case "select":
			return property.select?.name ?? "[No Selection]";
		case "multi_select":
			return (
				property.multi_select?.map((select) => select.name).join(", ") ??
				"[No Selections]"
			);
		case "date":
			if (!property.date) return "[No Date]";
			return property.date.end
				? `${property.date.start} - ${property.date.end}`
				: (property.date.start ?? "[Invalid Date]");
		case "checkbox":
			return property.checkbox ? "✅" : "❌";
		case "email":
			return property.email ?? "[No Email]";
		case "phone_number":
			return property.phone_number ?? "[No Phone]";
		case "number":
			return property.number?.toString() ?? "[No Number]";
		case "status":
			return property.status?.name ?? "[No Status]";
		case "created_time":
			return property.created_time ?? "[No Time]";
		case "unique_id":
			return property.unique_id.number === null
				? "[No ID]"
				: property.unique_id.prefix === null
					? property.unique_id.number.toString()
					: `${property.unique_id.prefix}-${property.unique_id.number}`;
		case "relation":
			return (
				property.relation.map((relation) => relation.id).join(", ") ||
				"[No Relations]"
			);
		case "people":
			return (
				property.people
					?.map((person) => {
						if (isUserObjectResponse(person)) {
							return person.name ?? person.id;
						}
						return person.id;
					})
					.join(", ") ?? "[No People]"
			);
		case "rollup":
			if (!property.rollup) return "[No Rollup]";
			switch (property.rollup.type) {
				case "number":
					return property.rollup.number?.toString() ?? "[No Rollup Number]";
				case "array":
					return (
						property.rollup.array?.map(formatProperty).join(", ") ??
						"[Empty Rollup Array]"
					);
				case "date":
					return property.rollup.date?.start
						? `${property.rollup.date.start} - ${property.rollup.date.end}`
						: (property.rollup.date?.start ?? "[Invalid Date]");
				default:
					return "[Unsupported Rollup Type]";
			}
		default:
			return `[Unsupported Type: ${JSON.stringify(property, null, 2)}]`;
	}
}

const app = new Hono<{ Bindings: Env }>();

app.post("/:discordChannelId", async (c) => {
	try {
		if (!c.env.DISCORD_BOT_TOKEN) {
			throw new Error("Discord bot token is not configured");
		}

		const discordChannelId = c.req.param("discordChannelId");
		const body = await c.req.json<NotionWebhookBody>();

		const title = c.req.query("title");

		const formattedProperties = Object.entries(body.data.properties)
			.map(([key, property]) => `${key}: ${formatProperty(property)}`)
			.join("\n");

		await sendDiscordMessage(c.env.DISCORD_BOT_TOKEN, discordChannelId, {
			content: [
				title,
				formattedProperties || "[No properties to display]",
				body.data.url,
			]
				.filter(Boolean)
				.join("\n"),
		});

		return c.json({ message: "ok" });
	} catch (error) {
		console.error("Error processing webhook:", error);

		if (error instanceof HTTPException) {
			return c.json(
				{
					error: error.message,
				},
				{
					status: error.status,
				},
			);
		}

		return c.json(
			{
				error: "Internal Server Error",
				message:
					error instanceof Error ? error.message : "Unknown error occurred",
			},
			{
				status: 500,
			},
		);
	}
});

export default app;
