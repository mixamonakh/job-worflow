import { defineConfig } from 'vite';
import { resolve } from 'path';
import { glob } from 'glob';
import UnoCSS from 'unocss/vite';
import { vendorPlugin, pageClassPlugin } from './config/plugins/index.js';

// Функция для автоматического поиска всех HTML файлов
function getHtmlEntries() {
  const htmlFiles = glob.sync('*.html');
  const entries = {};

  htmlFiles.forEach(file => {
    const name = file.replace('.html', '');
    entries[name] = resolve(process.cwd(), file);
  });

  return entries;
}

export default defineConfig(({ mode }) => {
  // Настройка путей для разных окружений
  const baseConfig = {
    development: './',
    test: '/spec-workflow/',
    production: '/'
  };
  const currentBase = baseConfig[mode] || './';

  return {
    base: currentBase,
    root: './',

    build: {
      outDir: `dist/${mode}`,
      emptyOutDir: true,

      rollupOptions: {
        input: getHtmlEntries(),

        output: {
          assetFileNames: (assetInfo) => {
            if (/\.css$/i.test(assetInfo.name)) {
              return 'css/[name][extname]';
            }
            return 'assets/[name][extname]';
          },

          chunkFileNames: 'js/[name].js',
          entryFileNames: 'js/[name].js',
        }
      },

      minify: false,
    },

    server: {
      port: 3000,
      open: true
    },

    // Плагины — чистый и короткий список
    plugins: [
      ...vendorPlugin(mode, currentBase),
      pageClassPlugin(),
      UnoCSS()
    ],

    resolve: {
      alias: {}
    },

    css: {
      preprocessorOptions: {
        sass: {}
      }
    }
  };
});
