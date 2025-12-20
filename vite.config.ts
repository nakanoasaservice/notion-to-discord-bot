import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [cloudflare()],
	esbuild: {
		jsxImportSource: "hono/jsx/dom",
	},
});
