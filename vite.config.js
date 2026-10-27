import { defineConfig } from "vite";
import pugPlugin from "vite-plugin-pug";
import { resolve } from "path";

const options = { pretty: true };
const locals = { name: "KANDINSKY Odesa Residence" };

export default defineConfig({
	plugins: [pugPlugin(options, locals)],
	build: {
		minify: false,
		rollupOptions: {
			input: {
				main: resolve(import.meta.dirname, "index.html"),
				calculator: resolve(import.meta.dirname, "calculator.html"),
				"new-request": resolve(import.meta.dirname, "new-request.html"),
				"my-requests": resolve(import.meta.dirname, "my-requests.html"),
			},
			output: {
				assetFileNames: "assets/[name].[ext]",
			},
		},
	},
});