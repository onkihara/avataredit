const path = require('path')
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), cssInjectedByJsPlugin()],
  resolve: {
    preserveSymlinks: true,
    alias: {
        vue: 'vue/dist/vue.esm-bundler.js'
    }
  },
  base : './',
  server : {
    host : '192.168.10.10',
    port : 3001
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'lib/main.js'),
      name: 'avatareditor',
      fileName: (format) => `avatareditor.${format}.js`
    }
  }
})
