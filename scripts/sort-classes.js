import { readFileSync, writeFileSync } from 'fs'
import { globSync } from 'glob'

// ========== КОНФИГ ==========
const CONFIG = {
  // Теги, которые НЕ обрабатываем
  excludedTags: [],

  // Минимальная длина класса для раскладки (если меньше — только сортируем в одну строку)
  minLengthToExpand: 50,

  // Отступ по умолчанию (если не удалось определить)
  defaultIndent: '    ',
}

// Категории для сортировки
const BLOCKS = [
  /^(section(-\d+)?)$/,                                            // section, section-1, section-2 и т.д.
  /^(d-(block|flex|none|inline|inline-block|grid|inline-flex))$/,  // Блочность
  /^(justify-|align-|flex-)/,                                      // Flex
  /^row(-.*)?$/,                                                   // Row
  /^col(-.*)?$/,                                                   // Col
  /^(rounded(-(top|bottom|full|circle|\d+))?|shadow|border|brdc-|opacity-|overflow-|object-)/, // Visual
  /^(bgc-|c-|brdc-)/,                                              // Colors
  /^(fz-|text-|lh-|fw-|font-|whitespace-|underline|uppercase|capitalize|lowercase)/, // Typography
  /^(w-|h-|min-|max-|gap-|gx-|gy-|rounded-\d+)/,                   // Sizes
  /^(position-|top-|right-|bottom-|left-|inset-|z-)/,              // Position
  /^p([trblxy]?)-\d+$/,                                            // Padding
  /^m([trblxy]?)-\d+$/,                                            // Margin
  /^l:/,                                                           // l: (идут после своих категорий)
  /^m:/,                                                           // m: (идут после l:)
]

// Сортировка группы: обычные → l: → m:
function sortGroup(classes, filter) {
  const normal = classes.filter(c => filter.test(c) && !/^[lm]:/.test(c))
  const lVar = classes.filter(c => filter.test(c) && /^l:/.test(c))
  const mVar = classes.filter(c => filter.test(c) && /^m:/.test(c))
  return [...normal, ...lVar, ...mVar]
}

function unique(arr) { return [...new Set(arr)] }

function sortClasses(classString) {
  const items = classString.split(/\s+/).filter(Boolean)
  let used = new Set()
  let sorted = []

  BLOCKS.forEach(re => {
    const group = sortGroup(items, re).filter(c => !used.has(c))
    group.forEach(c => used.add(c))
    sorted = [...sorted, ...group]
  })

  // Остальные (не попавшие в категории) — в конце по алфавиту
  const leftovers = items.filter(c => !used.has(c)).sort()
  sorted = [...sorted, ...leftovers]

  return unique(sorted)
}

function processFile(file) {
  let content = readFileSync(file, 'utf8')
  let changed = false

  // Регулярка для поиска тегов с class
  content = content.replace(/<(\w+)([^>]*?)class=(["'])([\s\S]*?)\3([^>]*?)>/g,
    (fullMatch, tagName, beforeClass, quote, classValue, afterClass) => {
      // Пропускаем исключённые теги
      if (CONFIG.excludedTags.includes(tagName.toLowerCase())) {
        return fullMatch
      }

      // Определяем отступ строки, где находится открывающий тег
      const lines = content.substring(0, content.indexOf(fullMatch)).split('\n')
      const lastLine = lines[lines.length - 1]
      const indent = lastLine.match(/^(\s*)/)[1] || CONFIG.defaultIndent

      // Сортируем классы
      const sorted = sortClasses(classValue)

      // Проверка длины: если меньше минимума — оставляем в одну строку
      const totalLength = sorted.join(' ').length
      if (totalLength < CONFIG.minLengthToExpand) {
        const compactClasses = sorted.join(' ')
        changed = true
        return `<${tagName}${beforeClass}class=${quote}${compactClasses}${quote}${afterClass}>`
      }

      // Раскладываем на несколько строк с правильным отступом
      const expandedClasses = sorted
        .map(cls => `${indent}    ${cls}`)
        .join('\n')

      changed = true
      return `<${tagName}${beforeClass}class=${quote}\n${expandedClasses}\n${indent}${quote}${afterClass}>`
    }
  )

  if (changed) writeFileSync(file, content)
}

const files = globSync('**/*.{html,vue,tpl}', {
  ignore: ['**/node_modules/**', '**/dist/**', '**/scripts/**']
})
files.forEach(processFile)
console.log(`✅ Отсортировано: ${files.length} файлов`)
