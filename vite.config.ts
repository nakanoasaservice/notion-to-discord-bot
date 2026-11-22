import { cloudflare } from "@cloudflare/vite-plugin";
import { cloudflareTest } from "@cloudflare/vitest-plugin";
import { defineConfig, lazyPlugins } from "vite-plus";

export default defineConfig(({ mode }) => ({
	fmt: {
		useTabs: true,
		ignorePatterns: [
			"dist/**",
			".wrangler/**",
			"worker-configuration.d.ts",
			"skills-lock.json",
			".agents/**",
			".claude/**",
			"pnpm-lock.yaml",
		],
	},
	lint: {
		ignorePatterns: [
			"dist/**",
			".wrangler/**",
			"worker-configuration.d.ts",
			"skills-lock.json",
			".agents/**",
			".claude/**",
		],
		jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
		rules: {
			"vite-plus/prefer-vite-plus-imports": "error",
			"typescript/no-non-null-assertion": "warn",
		},
		options: { typeAware: true, typeCheck: true },
	},
	plugins: lazyPlugins(() =>
		mode === "test"
			? [cloudflareTest({ wrangler: { configPath: "./wrangler.jsonc" } })]
			: [cloudflare()],
	),
}));
