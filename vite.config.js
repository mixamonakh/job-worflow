import { defineConfig } from 'vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { resolve } from 'path';
import { glob } from 'glob';
import UnoCSS from 'unocss/vite'
import { copyFileSync, mkdirSync, existsSync } from 'fs';

// Функция для автоматического поиска всех HTML файлов
function getHtmlEntries() {
  const htmlFiles = glob.sync('*.html');
  const entries = {};

  htmlFiles.forEach(file => {
    const name = file.replace('.html', '');
    entries[name] = resolve(__dirname, file);
  });

  return entries;
}

export default defineConfig(({ mode }) => {
  // Настройка путей для разных окружений
  const baseConfig = {
    development: './',  // dev режим — относительные пути
    test: '/vystavka-karikaturistov/',  // тест — /folder-project/
    production: '/'  // прод — от корня
  };
  const currentBase = baseConfig[mode] || './';

  return {
    base: currentBase,

    // Папка с исходниками
    root: './',

    // Папка для собранных файлов
    build: {
      outDir: `dist/${mode}`,
      emptyOutDir: true,

      rollupOptions: {
        input: getHtmlEntries(),

        output: {
          // Структура файлов после сборки
          assetFileNames: (assetInfo) => {
            // Картинки в папку i/
            if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(assetInfo.name)) {
              return 'i/[name][extname]';
            }
            // CSS в папку css/
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

    // Настройки dev-сервера
    server: {
      port: 3000,
      open: true
    },

    // Плагины
    plugins: [
      {
        name: 'copy-vendor',
        closeBundle() {
          try {
            const outDir = `dist/${mode}`;
            const sourcePath = resolve(__dirname, 'js/vendor.min.js');

            if (!existsSync(sourcePath)) {
              console.warn('⚠️  vendor.min.js не найден в js/');
              return;
            }

            mkdirSync(`${outDir}/js`, { recursive: true });
            copyFileSync(sourcePath, `${outDir}/js/vendor.min.js`);
            console.log(`✓ vendor.min.js → ${outDir}/js/`);
          } catch (err) {
            console.error('⚠️  Копирование vendor.min.js:', err.message);
          }
        }
      },
      {
        name: 'transform-vendor-path',
        transformIndexHtml: {
          order: 'post',
          handler(html) {
            // Формируем правильный путь с учётом base
            const vendorPath = currentBase === './'
              ? './js/vendor.min.js'
              : `${currentBase}js/vendor.min.js`;

            return html.replace(
              /src="\/js\/vendor\.min\.js"/g,
              `src="${vendorPath}"`
            );
          }
        }
      },

      UnoCSS(),
      ViteImageOptimizer({
        // Оптимизация PNG
        png: {
          quality: 85
        },
        // Оптимизация JPEG
        jpeg: {
          quality: 85
        },
        // Оптимизация WebP
        webp: {
          quality: 85
        },
        // SVG оптимизация
        svg: {
          multipass: true,
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: {
                  removeViewBox: false,
                  cleanupIds: false
                }
              }
            }
          ]
        }
      })
    ],

    // Настройка алиасов для импортов
    resolve: {
      alias: {
      }
    },

    // CSS настройки
    css: {
      preprocessorOptions: {
        sass: {
        }
      }
    }
  };
});
