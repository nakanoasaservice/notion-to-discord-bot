import type {
	PageObjectResponse,
	PartialUserObjectResponse,
	RichTextItemResponse,
	UserObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

type RemoveId<T> = T extends unknown ? Omit<T, "id"> : never;
type Property = RemoveId<PageObjectResponse["properties"][number]>;

function formatPerson(
	person: PartialUserObjectResponse | UserObjectResponse,
): string {
	if ("name" in person) {
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

function formatRichText(richText: RichTextItemResponse): string {
	switch (richText.type) {
		case "text":
			if (richText.text.link) {
				return `[${richText.text.content}](${richText.text.link.url})`;
			}
			return richText.text.content;
		case "mention":
			switch (richText.mention.type) {
				case "user":
					return formatPerson(richText.mention.user);
				case "date":
					return formatDate(richText.mention.date);
				case "link_preview":
					return `[${richText.plain_text}](${richText.mention.link_preview.url})`;
				case "template_mention":
					return richText.plain_text;
				case "page":
					return `[${richText.plain_text}](https://www.notion.so/${richText.mention.page.id.replaceAll("-", "")})`;
				case "database":
					return `[${richText.plain_text}](https://www.notion.so/${richText.mention.database.id.replaceAll("-", "")})`;
				default:
					return "[Unsupported Mention Type]";
			}
		case "equation":
			return richText.plain_text;
		default:
			return `[Unsupported Rich Text Type: ${JSON.stringify(richText, null, 2)}]`;
	}
}

export function formatProperty(property: Property): string {
	switch (property.type) {
		case "title":
			return property.title.map(formatRichText).join("") || "[Empty Title]";
		case "rich_text":
			return property.rich_text.map(formatRichText).join("") || "[Empty Text]";
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
