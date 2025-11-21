import { basename, dirname, relative } from 'path';

export function pageClassPlugin() {
  return {
    name: 'add-page-class',
    transformIndexHtml: {
      order: 'pre',
      handler(html, { filename }) {
        // Получаем относительный путь от корня проекта
        const relativePath = relative(process.cwd(), filename);

        // Генерируем имя на основе полного пути
        let pageName = relativePath
          .replace(/\.html?$/i, '')         // Убираем .html
          .replace(/\\/g, '/')              // Windows: \ → /
          .replace(/\//g, '-')              // / → -
          .replace(/[^a-z0-9-_]/gi, '-')    // Чистим спецсимволы
          || 'index';

        return html.replace(
          /<body([^>]*)>/i,
          (match, attrs) => {
            return `<body${attrs} data-page="${pageName}">`;
          }
        );
      }
    }
  };
}
