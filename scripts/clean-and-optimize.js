import { readFileSync, readdirSync, unlinkSync, statSync, writeFileSync } from 'fs';
import { join, relative } from 'path';
import sharp from 'sharp';
import { optimize } from 'svgo';

// Папка билда
const distDir = process.argv[2] || 'dist/test';
const imagesDir = join(distDir, 'i');

// 1. Собираем все ссылки на картинки из HTML/CSS/JS
function findUsedImages(dir) {
  const usedImages = new Set();
  const files = readdirSync(dir, { recursive: true });

  files.forEach(file => {
    const fullPath = join(dir, file);
    if (statSync(fullPath).isFile() && /\.(html|css|js)$/i.test(file)) {
      const content = readFileSync(fullPath, 'utf-8');

      // Ищем все варианты путей:
      // /i/image.png
      // ./i/image.png
      // /vystavka-karikaturistov/i/image.png
      // url(/i/...)
      const patterns = [
        // HTML: src="/i/..." или src="./i/..."
        /(?:src|href)=["'](?:\.)?\/(?:[^"']*\/)?i\/([\w\-./]+\.(png|jpe?g|gif|svg|webp|avif|ico))["']/gi,
        // CSS: url(/i/...) или url(./i/...)
        /url\(["']?(?:\.)?\/(?:[^)"']*\/)?i\/([\w\-./]+\.(png|jpe?g|gif|svg|webp|avif|ico))["']?\)/gi,
        // JS: '/i/...' или "/i/..."
        /["'](?:\.)?\/(?:[^"']*\/)?i\/([\w\-./]+\.(png|jpe?g|gif|svg|webp|avif|ico))["']/gi
      ];

      patterns.forEach(pattern => {
        const matches = content.matchAll(pattern);
        for (const match of matches) {
          const imagePath = match[1].replace(/\\/g, '/'); // Нормализуем слеши
          usedImages.add(imagePath);
        }
      });
    }
  });

  return usedImages;
}

// 2. Удаляем неиспользуемые картинки
function cleanUnused(imagesDir, usedImages) {
  const allFiles = readdirSync(imagesDir, { recursive: true });
  let removedCount = 0;

  allFiles.forEach(file => {
    const fullPath = join(imagesDir, file);
    if (statSync(fullPath).isFile()) {
      const relativePath = relative(imagesDir, fullPath).replace(/\\/g, '/');

      // Игнорируем служебные файлы
      if (file === '.DS_Store') {
        unlinkSync(fullPath);
        removedCount++;
        return;
      }

      if (!usedImages.has(relativePath)) {
        console.log(`🗑️  Удаляем неиспользуемый: ${relativePath}`);
        unlinkSync(fullPath);
        removedCount++;
      }
    }
  });

  console.log(`✓ Удалено ${removedCount} неиспользуемых файлов`);
}

// 3. Оптимизируем оставшиеся картинки
async function optimizeImages(imagesDir) {
  const files = readdirSync(imagesDir, { recursive: true });
  let optimizedCount = 0;

  for (const file of files) {
    const fullPath = join(imagesDir, file);
    if (!statSync(fullPath).isFile()) continue;

    const ext = file.split('.').pop().toLowerCase();

    try {
      if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
        const buffer = readFileSync(fullPath);
        const originalSize = buffer.length;

        let optimized;
        if (ext === 'png') optimized = await sharp(buffer).png({ quality: 85 }).toBuffer();
        else if (['jpg', 'jpeg'].includes(ext)) optimized = await sharp(buffer).jpeg({ quality: 85 }).toBuffer();
        else if (ext === 'webp') optimized = await sharp(buffer).webp({ quality: 85 }).toBuffer();

        if (optimized && optimized.length < originalSize) {
          await sharp(optimized).toFile(fullPath);
          const saved = ((1 - optimized.length / originalSize) * 100).toFixed(1);
          console.log(`🖼️  ${file} -${saved}%`);
          optimizedCount++;
        }
      } else if (ext === 'svg') {
        const content = readFileSync(fullPath, 'utf-8');
        const result = optimize(content, {
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
        });
        if (result.data !== content) {
          writeFileSync(fullPath, result.data);
          console.log(`🖼️  ${file} оптимизирован`);
          optimizedCount++;
        }
      }
    } catch (err) {
      console.warn(`⚠️  Ошибка оптимизации ${file}:`, err.message);
    }
  }

  console.log(`✓ Оптимизировано ${optimizedCount} файлов`);
}

// Запуск
(async () => {
  console.log(`\n🔍 Анализ ${distDir}...\n`);
  const usedImages = findUsedImages(distDir);
  console.log(`✓ Найдено ${usedImages.size} используемых картинок`);

  if (usedImages.size > 0) {
    console.log('\nИспользуемые файлы:');
    [...usedImages].sort().forEach(img => console.log(`  - ${img}`));
  }
  console.log();

  cleanUnused(imagesDir, usedImages);
  console.log();

  await optimizeImages(imagesDir);
  console.log('\n✅ Готово!\n');
})();
