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
		global.fetch = mockFetch;
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
});
