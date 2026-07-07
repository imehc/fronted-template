import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import unocss from 'unocss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite'


// https://vitejs.dev/config/
export default defineConfig({
  // https://github.com/vitejs/awesome-vite#plugins
  plugins: [
    unocss(),
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react()
  ],
  server: {
    host: '0.0.0.0',
    port: 6012,
  },

  resolve: {
    alias: {
      // 设置别名后如果是typescript则必须在tsconfig.json中配置baseUrl和paths，否者ts类型会报错
      '~': resolve(__dirname, 'src'),
      '#': resolve(__dirname, 'styled-system'),
    },
  },
});
