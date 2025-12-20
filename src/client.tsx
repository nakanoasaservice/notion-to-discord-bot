import { useMemo, useState } from "hono/jsx";
import { render } from "hono/jsx/dom";

export default function App() {
	const [channelId, setChannelId] = useState("");
	const [title, setTitle] = useState("");
	const [copied, setCopied] = useState(false);

	const isValid = useMemo(
		() => channelId === "" || /^\d{18,19}$/.test(channelId),
		[channelId],
	);

	const generatedUrl = useMemo(() => {
		const origin = typeof window !== "undefined" ? window.location.origin : "";
		const baseUrl = origin || "https://your-worker.workers.dev";
		const idPart = channelId || "{DISCORD_CHANNEL_ID}";
		let url = `${baseUrl}/${idPart}`;
		if (title) {
			url += `?title=${encodeURIComponent(title)}`;
		}
		return url;
	}, [channelId, title]);

	const handleCopy = () => {
		if (channelId && isValid && generatedUrl) {
			navigator.clipboard.writeText(generatedUrl);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	return (
		<div
			style={{
				fontFamily:
					'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
				maxWidth: "800px",
				margin: "0 auto",
				padding: "2rem",
				color: "#37352f",
			}}
		>
			<header style={{ marginBottom: "2rem", textAlign: "center" }}>
				<h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
					Notion to Discord Bot
				</h1>
				<div
					style={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						gap: "1rem",
						marginBottom: "1rem",
					}}
				>
					<a
						href="https://github.com/nakanoasaservice/notion-to-discord-bot"
						target="_blank"
						rel="noreferrer"
						style={{
							display: "inline-flex",
							alignItems: "center",
							color: "#37352f",
							textDecoration: "none",
							transition: "opacity 0.2s",
						}}
						onMouseEnter={(e) => {
							(e.currentTarget as HTMLElement).style.opacity = "0.7";
						}}
						onMouseLeave={(e) => {
							(e.currentTarget as HTMLElement).style.opacity = "1";
						}}
					>
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="currentColor"
							style={{ display: "block" }}
							aria-label="GitHub Repository"
						>
							<title>GitHub Repository</title>
							<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
						</svg>
					</a>
					<a
						href="https://deploy.workers.cloudflare.com/?url=https%3A%2F%2Fgithub.com%2Fnakanoasaservice%2Fnotion-to-discord-bot"
						target="_blank"
						rel="noreferrer"
						style={{ display: "inline-block" }}
					>
						<img
							src="https://deploy.workers.cloudflare.com/button"
							alt="Deploy to Cloudflare Workers"
							style={{
								height: "32px",
								width: "auto",
								border: "none",
							}}
						/>
					</a>
				</div>
				<p
					style={{
						fontSize: "0.9rem",
						color: "#666",
						marginBottom: "0.5rem",
					}}
				>
					👆 Click to deploy your own private instance to Cloudflare Workers
					instantly.
				</p>
				<p style={{ fontSize: "1.2rem", color: "#666" }}>
					Automatically forward Notion webhook events to Discord channels with
					beautifully formatted embeds.
				</p>
			</header>

			<section style={{ marginBottom: "3rem" }}>
				<h2 style={{ borderBottom: "1px solid #eee", paddingBottom: "0.5rem" }}>
					How it works
				</h2>
				<p>
					This bot acts as a bridge between Notion and Discord. When you
					configure a webhook in Notion (e.g., from a database automation), it
					sends data to this worker, which formats it and posts it to your
					specified Discord channel.
				</p>
			</section>

			<section style={{ marginBottom: "3rem" }}>
				<h2 style={{ borderBottom: "1px solid #eee", paddingBottom: "0.5rem" }}>
					Setup Guide
				</h2>
				<ol style={{ paddingLeft: "1.5rem" }}>
					<li style={{ marginBottom: "0.5rem" }}>
						<strong>Invite the Bot:</strong>{" "}
						<a
							href="https://discord.com/oauth2/authorize?client_id=1314524073170042962&permissions=2048&integration_type=0&scope=bot"
							target="_blank"
							rel="noreferrer"
							style={{ color: "#0066cc", textDecoration: "none" }}
						>
							Click here to invite the bot to your Discord server
						</a>
						.
					</li>
					<li style={{ marginBottom: "0.5rem" }}>
						<strong>Get Channel ID:</strong> Enable Developer Mode in Discord,
						right-click your desired channel, and select "Copy Channel ID".
					</li>
					<li style={{ marginBottom: "0.5rem" }}>
						<strong>Generate Webhook URL:</strong> Use the form below to create
						your webhook URL.
					</li>
					<li style={{ marginBottom: "0.5rem" }}>
						<strong>Configure Notion:</strong> In your Notion database, go to
						Settings → Connections → Webhooks → Add webhook, and paste the
						generated URL.
					</li>
				</ol>
			</section>

			<section
				style={{
					backgroundColor: "#f7f7f5",
					padding: "2rem",
					borderRadius: "8px",
					border: "1px solid #e0e0e0",
				}}
			>
				<h2
					style={{
						marginTop: 0,
						borderBottom: "1px solid #e0e0e0",
						paddingBottom: "0.5rem",
						marginBottom: "1.5rem",
					}}
				>
					Webhook URL Generator
				</h2>

				<div
					style={{
						display: "flex",
						gap: "1.5rem",
						flexWrap: "wrap",
						marginBottom: "1.5rem",
					}}
				>
					<div style={{ flex: "1 1 300px" }}>
						<label
							htmlFor="channelId"
							style={{
								display: "block",
								marginBottom: "0.5rem",
								fontWeight: "bold",
							}}
						>
							Discord Channel ID <span style={{ color: "red" }}>*</span>
						</label>
						<input
							type="text"
							id="channelId"
							placeholder="e.g. 1234567890123456789"
							value={channelId}
							onInput={(e) =>
								setChannelId((e.target as HTMLInputElement).value)
							}
							style={{
								width: "100%",
								padding: "0.75rem",
								borderRadius: "4px",
								border: `1px solid ${isValid ? "#ccc" : "#d32f2f"}`,
								fontSize: "1rem",
								boxSizing: "border-box",
							}}
						/>
						<small
							style={{
								color: "#666",
								display: "block",
								marginTop: "0.25rem",
							}}
						>
							Right-click channel → "Copy Channel ID"
						</small>
					</div>

					<div style={{ flex: "1 1 300px" }}>
						<label
							htmlFor="title"
							style={{
								display: "block",
								marginBottom: "0.5rem",
								fontWeight: "bold",
							}}
						>
							Custom Title (Optional)
						</label>
						<textarea
							id="title"
							placeholder="e.g. Task Updated"
							value={title}
							onInput={(e) => {
								const target = e.target as HTMLTextAreaElement;
								setTitle(target.value);
								target.style.height = "auto";
								target.style.height = `${target.scrollHeight}px`;
							}}
							rows={1}
							style={{
								width: "100%",
								padding: "0.75rem",
								borderRadius: "4px",
								border: "1px solid #ccc",
								fontSize: "1rem",
								boxSizing: "border-box",
								resize: "none",
								overflow: "hidden",
								minHeight: "42px",
								fontFamily: "inherit",
							}}
						/>
						<small
							style={{
								color: "#666",
								display: "block",
								marginTop: "0.25rem",
							}}
						>
							A title to display at the top of the Discord embed.
						</small>
					</div>
				</div>

				<div style={{ marginTop: "2rem" }}>
					<label
						htmlFor="generatedUrl"
						style={{
							display: "block",
							marginBottom: "0.5rem",
							fontWeight: "bold",
							color: isValid ? "#2e7d32" : "#d32f2f",
						}}
					>
						{isValid ? "Your Webhook URL" : "Invalid Channel ID"}
					</label>
					<div
						style={{
							display: "flex",
							gap: "0.5rem",
						}}
					>
						<input
							type="text"
							id="generatedUrl"
							readOnly
							value={
								isValid
									? generatedUrl
									: "Please enter a valid 18-19 digit Channel ID"
							}
							onClick={handleCopy}
							style={{
								flex: 1,
								padding: "0.75rem",
								borderRadius: "4px",
								border: `1px solid ${isValid ? "#2e7d32" : "#d32f2f"}`,
								backgroundColor: isValid ? "#e8f5e9" : "#ffebee",
								color: isValid ? "#1b5e20" : "#c62828",
								fontFamily: "monospace",
								fontSize: "0.9rem",
								cursor: channelId && isValid ? "pointer" : "not-allowed",
							}}
						/>
						<button
							type="button"
							onClick={handleCopy}
							disabled={!channelId || !isValid}
							style={{
								padding: "0.75rem 1.5rem",
								backgroundColor: !channelId || !isValid ? "#a5d6a7" : "#2e7d32",
								color: "white",
								border: "none",
								borderRadius: "4px",
								cursor: !channelId || !isValid ? "not-allowed" : "pointer",
								fontWeight: "bold",
							}}
						>
							Copy
						</button>
					</div>
					<small
						style={{
							color: "#2e7d32",
							display: "block",
							marginTop: "0.5rem",
							fontWeight: "bold",
							visibility: copied ? "visible" : "hidden",
							opacity: copied ? 1 : 0,
							transition: "opacity 0.2s ease-in-out",
							minHeight: "1.2rem",
						}}
					>
						Copied!
					</small>
				</div>
			</section>

			<footer
				style={{
					marginTop: "4rem",
					textAlign: "center",
					color: "#999",
					fontSize: "0.9rem",
				}}
			>
				<p>
					<a
						href="https://github.com/nakanoasaservice/notion-to-discord-bot"
						target="_blank"
						rel="noreferrer"
						style={{ color: "#999" }}
					>
						GitHub Repository
					</a>
				</p>
			</footer>
		</div>
	);
}

const root = document.getElementById("root");
if (root) {
	render(<App />, root);
}
