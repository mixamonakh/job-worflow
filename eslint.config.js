import unocssPlugin from '@unocss/eslint-plugin';
import htmlParser from '@html-eslint/parser';  // Парсер для HTML (извлекает class="...")

export default [
  {
    files: ['**/*.html'],
    languageOptions: {
      parser: htmlParser,  // Ключ: теперь ESLint парсит HTML, а не JS
    },
    plugins: {
      '@unocss': unocssPlugin,
    },
    rules: {
      '@unocss/order': 'error',  // Сортировка по uno.config.js (подхватит presets как wind)
    },
  },
  {
    ignores: ['**/node_modules/**', '**/dist/**'],
  },
];
