import { useEffect, useState } from "hono/jsx";
import { render } from "hono/jsx/dom";

export default function App() {
	const [channelId, setChannelId] = useState("");
	const [title, setTitle] = useState("");
	const [generatedUrl, setGeneratedUrl] = useState("");
	const [origin, setOrigin] = useState("");
	const [isValid, setIsValid] = useState(true);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		setOrigin(window.location.origin);
	}, []);

	useEffect(() => {
		// Validation: Check if channelId contains only digits and is 18-19 characters long
		// Allow empty string to avoid error on initial load
		const isIdValid = channelId === "" || /^\d{18,19}$/.test(channelId);
		setIsValid(isIdValid);

		const baseUrl = origin || "https://your-worker.workers.dev";
		const idPart = channelId || "{DISCORD_CHANNEL_ID}";
		let url = `${baseUrl}/${idPart}`;
		if (title) {
			url += `?title=${encodeURIComponent(title)}`;
		}
		setGeneratedUrl(url);
	}, [channelId, title, origin]);

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
