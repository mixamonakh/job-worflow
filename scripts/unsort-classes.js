import { readFileSync, writeFileSync } from 'fs'
import { globSync } from 'glob'

// Тот же конфиг для сортировки
const BLOCKS = [
  /^(section(-\d+)?)$/,
  /^(d-(block|flex|none|inline|inline-block|grid|inline-flex))$/,
  /^(justify-|align-|flex-)/,
  /^row(-.*)?$/,
  /^col(-.*)?$/,
  /^(rounded(-(top|bottom|full|circle|\d+))?|shadow|border|brdc-|opacity-|overflow-|object-)/,
  /^(bgc-|c-|brdc-)/,
  /^(fz-|text-|lh-|fw-|font-|whitespace-|underline|uppercase|capitalize|lowercase)/,
  /^(w-|h-|min-|max-|gap-|gx-|gy-|rounded-\d+)/,
  /^(position-|top-|right-|bottom-|left-|inset-|z-)/,
  /^p([trblxy]?)-\d+$/,
  /^m([trblxy]?)-\d+$/,
  /^l:/,
  /^m:/,
]

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

  const leftovers = items.filter(c => !used.has(c)).sort()
  sorted = [...sorted, ...leftovers]

  return unique(sorted)
}

function processFile(file) {
  let content = readFileSync(file, 'utf8')
  let changed = false

  // Склеиваем многострочные классы в одну строку И сортируем
  content = content.replace(/class=(["'])([\s\S]*?)\1/g, (match, quote, classValue) => {
    // Убираем все переносы и лишние пробелы
    const cleaned = classValue.replace(/\s+/g, ' ').trim()

    // Сортируем
    const sorted = sortClasses(cleaned).join(' ')

    changed = true
    return `class=${quote}${sorted}${quote}`
  })

  if (changed) writeFileSync(file, content)
}

const files = globSync('**/*.{html,vue,tpl}', {
  ignore: ['**/node_modules/**', '**/dist/**', '**/scripts/**']
})
files.forEach(processFile)
console.log(`✅ Склеено в одну строку: ${files.length} файлов`)
