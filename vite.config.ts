import { resolve } from 'path';
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [preact()],
	server: {
		port: 9000,
	},
	// https://medium.com/@pushplaybang/absolutely-dont-use-relative-paths-imports-in-your-vite-react-project-c8593f93bbea
	resolve: {
		alias: {
			src: "/src",
		},
	},
	build: {
		rollupOptions: {
			input: {
				index: resolve(__dirname, 'index.html'),
				game: resolve(__dirname, 'game/index.html'),
			},
		},
	},
});
