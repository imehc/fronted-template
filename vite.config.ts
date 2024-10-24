import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools'
import Icons from 'unplugin-icons/vite';
import IconsResolver from 'unplugin-icons/resolver';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import Inspect from 'vite-plugin-inspect'
import { fileURLToPath } from 'node:url';

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		vueDevTools(),
		Inspect(),
		AutoImport({
			imports: ['vue', 'vue-router', '@vueuse/core', 'pinia'],
			resolvers: [
				IconsResolver({
					prefix: 'Icon',
				}),
			],
			dirs: [
				'./components',
				'./views'
			],
			eslintrc: {
				enabled: false,
			},
		}),
		Components({
			resolvers: [IconsResolver({
				// prefix:false,
				// enabledCollections: ['ep', 'mdi']
			})],
		}),
		Icons({
			// https://icones.netlify.app/
			compiler: 'vue3',
			autoInstall: true,
		}),
	],
	server: {
		port: 6012,
		host: '0.0.0.0',
	},
	resolve: {
		alias: {
			'~': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
});
