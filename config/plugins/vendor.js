import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync } from 'fs';

export function vendorPlugin(mode, currentBase) {
  return [
    {
      name: 'copy-vendor',
      closeBundle() {
        try {
          const outDir = `dist/${mode}`;
          const sourcePath = resolve(process.cwd(), 'js/vendor.min.js');

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
          const vendorPath = currentBase === './'
            ? './js/vendor.min.js'
            : `${currentBase}js/vendor.min.js`;

          return html.replace(
            /src="\/js\/vendor\.min\.js"/g,
            `src="${vendorPath}"`
          );
        }
      }
    }
  ];
}
