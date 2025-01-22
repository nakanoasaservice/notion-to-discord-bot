import type {
	PageObjectResponse,
	PartialUserObjectResponse,
	UserObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type { RESTPostAPIChannelMessageJSONBody } from "discord-api-types/v10";
import { Hono } from "hono";

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

function formatPerson(
	person: PartialUserObjectResponse | UserObjectResponse,
): string {
	if ("type" in person) {
		return person.name ?? person.id;
	}
	return person.id;
}

function formatDate(
	date: { start: string; end: string | null } | null,
): string {
	if (!date) return "[No Date]";

	if (date.end) {
		return `${date.start} - ${date.end}`;
	}

	return date.start;
}

function formatProperty(property: RemoveId<Property>): string {
	switch (property.type) {
		case "title":
			return (
				property.title.map((title) => title.plain_text).join("") ||
				"[Empty Title]"
			);
		case "rich_text":
			return (
				property.rich_text.map((text) => text.plain_text).join("") ||
				"[Empty Text]"
			);
		case "url":
			return property.url ?? "[No URL]";
		case "select":
			return property.select?.name ?? "[No Selection]";
		case "multi_select":
			return (
				property.multi_select?.map((select) => select.name).join(", ") ||
				"[No Selections]"
			);
		case "date":
			return formatDate(property.date);
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
		case "last_edited_time":
			return property.last_edited_time ?? "[No Time]";
		case "created_by":
			return formatPerson(property.created_by);
		case "last_edited_by":
			return formatPerson(property.last_edited_by);
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
			return property.people.map(formatPerson).join(", ") || "[No People]";
		case "formula":
			switch (property.formula.type) {
				case "string":
					return property.formula.string ?? "[No Formula String]";
				case "number":
					return property.formula.number?.toString() ?? "[No Formula Number]";
				case "boolean":
					return property.formula.boolean === null
						? "[No Formula Boolean]"
						: property.formula.boolean
							? "✅"
							: "❌";
				case "date":
					return formatDate(property.formula.date);
				default:
					return "[Unsupported Formula Type]";
			}
		case "files":
			return (
				property.files
					.map((file) => {
						switch (file.type) {
							case "file":
								return `[${file.name}](${file.file.url})`;
							case "external":
								return `[${file.name}](${file.external.url})`;
							default:
								return file.name;
						}
					})
					.join(", ") || "[No Files]"
			);
		case "rollup":
			switch (property.rollup.type) {
				case "number":
					return property.rollup.number?.toString() ?? "[No Rollup Number]";
				case "date":
					return formatDate(property.rollup.date);
				case "array":
					return (
						property.rollup.array?.map(formatProperty).join(", ") ??
						"[Empty Rollup Array]"
					);
				default:
					return "[Unsupported Rollup Type]";
			}
		default:
			return `[Unsupported Type: ${JSON.stringify(property, null, 2)}]`;
	}
}

const app = new Hono<{ Bindings: Env }>();

app.get("/", (c) => {
	return c.json({ message: "ok" }, 200);
});

app.post("/:discordChannelId", async (c) => {
	if (!c.env.DISCORD_BOT_TOKEN) {
		throw new Error("DISCORD_BOT_TOKEN is not set");
	}

	const title = c.req.query("title");
	const discordChannelId = c.req.param("discordChannelId");
	const body = await c.req.json<NotionWebhookBody>();

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

	return c.body(null, 204);
});

export default app;
