// test/index.spec.ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import app from "../src/index";

describe("Notion to Discord Bot worker", () => {
	let mockFetch: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		mockFetch = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			text: async () => "",
		});
		global.fetch = mockFetch as unknown as typeof global.fetch;
	});

	it("responds with 204 No Content", async () => {
		const channelId = "1234567890123456789";
		const response = await app.request(
			`/${channelId}`,
			{
				method: "POST",
				body: JSON.stringify({
					data: {
						url: "https://example.com",
						properties: {
							name: {
								type: "title",
								title: [
									{
										type: "text",
										text: { content: "Test", link: null },
										annotations: {
											bold: false,
											italic: false,
											strikethrough: false,
											underline: false,
											code: false,
											color: "default",
										},
										plain_text: "Test",
										href: null,
									},
								],
							},
						},
					},
				}),
			},
			{
				DISCORD_BOT_TOKEN: "dummy-token",
			},
		);

		expect(response.status).toBe(204);
		expect(mockFetch).toHaveBeenCalledTimes(1);
		expect(mockFetch).toHaveBeenCalledWith(
			`https://discord.com/api/v10/channels/${channelId}/messages`,
			expect.objectContaining({
				method: "POST",
				headers: expect.objectContaining({
					Authorization: "Bot dummy-token",
					"Content-Type": "application/json",
				}),
			}),
		);
	});

	it("truncates embed fields that exceed Discord length limits", async () => {
		const channelId = "1234567890123456789";
		const longText = "a".repeat(2000);
		const longFieldName = "n".repeat(300);
		const longTitle = "t".repeat(300);

		const response = await app.request(
			`/${channelId}?title=${encodeURIComponent(longTitle)}`,
			{
				method: "POST",
				body: JSON.stringify({
					data: {
						url: "https://example.com",
						properties: {
							[longFieldName]: {
								type: "rich_text",
								rich_text: [
									{
										type: "text",
										text: { content: longText, link: null },
										annotations: {
											bold: false,
											italic: false,
											strikethrough: false,
											underline: false,
											code: false,
											color: "default",
										},
										plain_text: longText,
										href: null,
									},
								],
							},
						},
					},
				}),
			},
			{
				DISCORD_BOT_TOKEN: "dummy-token",
			},
		);

		expect(response.status).toBe(204);

		const [, requestInit] = mockFetch.mock.calls[0] as [
			string,
			{ body: string },
		];
		const message = JSON.parse(requestInit.body) as {
			embeds: Array<{
				title: string;
				fields: Array<{ name: string; value: string }>;
			}>;
		};

		expect(message.embeds[0].title).toHaveLength(256);
		expect(message.embeds[0].title.endsWith("…")).toBe(true);
		expect(message.embeds[0].fields[0].name).toHaveLength(256);
		expect(message.embeds[0].fields[0].name.endsWith("…")).toBe(true);
		expect(message.embeds[0].fields[0].value).toHaveLength(1024);
		expect(message.embeds[0].fields[0].value.endsWith("…")).toBe(true);
	});
});
