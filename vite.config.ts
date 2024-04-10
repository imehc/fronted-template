import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ["vue"],
      resolvers: [
        IconsResolver({
          prefix: "Icon",
        }),
      ],
      eslintrc: {
        enabled: true,
      },
    }),
    Components({
      resolvers: [IconsResolver()],
    }),
    Icons({
      // https://icones.netlify.app/
      compiler: "vue3",
      autoInstall: true,
    }),
  ],
  server: {
    port: 6012,
    host: "0.0.0.0",
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
    },
  },
});
