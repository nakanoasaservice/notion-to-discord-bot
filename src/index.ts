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

const app = new Hono();

class DiscordAPIError extends Error {
	constructor(
		public status: number,
		public body: unknown,
	) {
		super(`Discord API error: ${status}`);
		this.name = "DiscordAPIError";
	}
}

async function discordCreateMessage(
	channelId: string,
	message: RESTPostAPIChannelMessageJSONBody,
) {
	if (!channelId) {
		throw new Error("Discord channel ID is required");
	}

	const response = await fetch(
		`https://discord.com/api/v10/channels/${channelId}/messages`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(message),
		},
	);

	if (!response.ok) {
		const errorBody = await response.json();
		throw new DiscordAPIError(response.status, errorBody);
	}

	return response;
}

interface NotionWebhookBody {
	properties: Record<string, Property>;
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
			return property.unique_id?.number?.toString() ?? "[No ID]";
		case "relation":
			return (
				property.relation?.map((relation) => relation.id).join(", ") ??
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
				default:
					return "[Unsupported Rollup Type]";
			}
		default:
			return `[Unsupported Type: ${(property as unknown as { type: string }).type}]`;
	}
}

// send message to discord channel
app.post("/:discordChannelId", async (c) => {
	try {
		const discordChannelId = c.req.param("discordChannelId");
		const body = await c.req.json<NotionWebhookBody>();

		const formattedProperties = Object.entries(body.properties)
			.map(([key, property]) => `${key}: ${formatProperty(property)}`)
			.join("\n");

		await discordCreateMessage(discordChannelId, {
			content: formattedProperties || "[No properties to display]",
		});

		return c.json({ message: "ok" });
	} catch (error) {
		console.error("Error processing webhook:", error);

		if (error instanceof DiscordAPIError) {
			return c.json(
				{
					error: "Discord API Error",
					status: error.status,
					details: error.body,
				},
				{
					status: error.status,
				},
			);
		}

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
