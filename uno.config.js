// uno.config.js
import { defineConfig } from 'unocss'
import { readFileSync } from 'fs'
import { glob } from 'glob'

// Брейкпоинты для префиксов l: и m:
const bp = {
    l: '1440.98px',
    m: '767.98px',
}

// === СКАНИРОВАНИЕ ИСПОЛЬЗУЕМЫХ ЧИСЕЛ ===
// Ищет все числа в HTML-классах и SASS v() функциях
function scanUsedNumbers() {
    const usedNumbers = new Set()
    const usedNegatives = new Set()

    // Сканируем HTML файлы (классы типа mt-24, l:p-40, fz-130)
    const htmlFiles = glob.sync('./**/*.html', { ignore: ['./node_modules/**', './dist/**'] })
    htmlFiles.forEach(file => {
        const content = readFileSync(file, 'utf-8')

        // Положительные: mt-24, p-40, l:fz-130, m:w-200
        const positiveMatches = content.matchAll(/(?:[lm]:)?(?:m[tblrxy]?|p[tblrxy]?|fz|w|h|gap|g[xy])-(\d+)/g)
        for (const match of positiveMatches) {
            usedNumbers.add(parseInt(match[1]))
        }

        // Отрицательные: -ml-20, l:-mt-40
        const negativeMatches = content.matchAll(/(?:[lm]:)?-m[tblrxy]?-(\d+)/g)
        for (const match of negativeMatches) {
            usedNegatives.add(parseInt(match[1]))
        }
    })

    // Сканируем SASS/SCSS файлы (v(24), v(-20))
    const sassFiles = glob.sync('./sass/**/*.{sass,scss}', { ignore: ['./node_modules/**', './dist/**'] })
    sassFiles.forEach(file => {
        const content = readFileSync(file, 'utf-8')

        // v(130), v(24)
        const vMatches = content.matchAll(/v\((\d+)\)/g)
        for (const match of vMatches) {
            usedNumbers.add(parseInt(match[1]))
        }

        // v(-20), v(-40)
        const vNegMatches = content.matchAll(/v\(-(\d+)\)/g)
        for (const match of vNegMatches) {
            usedNegatives.add(parseInt(match[1]))
        }
    })

    return {
        positive: Array.from(usedNumbers).sort((a, b) => a - b),
        negative: Array.from(usedNegatives).sort((a, b) => a - b)
    }
}

// === ГЕНЕРАЦИЯ CSS ПЕРЕМЕННЫХ ===
// Создаёт var(--N) с 4 брейкпоинтами: база px, min 1920, max 1440, max 767
function generateFluidVars(numbers, negatives) {
    // Базовые переменные, которые всегда нужны для grid/утилит
    const baseNumbers = [0, 1, 2, 4, 8, 10, 12, 14, 16, 18, 20, 24, 30, 40, 50, 60, 80, 100]
    const baseNegatives = [1, 2, 4, 8, 10, 12, 16, 20, 24, 40]

    // Объединяем найденные + базовые (Set убирает дубли)
    const allNumbers = Array.from(new Set([...baseNumbers, ...numbers])).sort((a, b) => a - b)
    const allNegatives = Array.from(new Set([...baseNegatives, ...negatives])).sort((a, b) => a - b)

    let css = ''

    // 1) БАЗА: px для 1441-1920 (без медиа-запроса)
    css += ':root {\n'
    allNumbers.forEach(n => {
        css += `  --${n}: ${n}px;\n`
    })
    allNegatives.forEach(n => {
        css += `  ---${n}: -${n}px;\n`
    })
    css += '}\n\n'

    // 2) MIN-WIDTH 1920.02px: vw от 1920 (фиксация для огромных экранов)
    css += '@media (min-width: 1920.02px) {\n  :root {\n'
    allNumbers.forEach(n => {
        const vw = ((n / 1920) * 100).toFixed(10)
        css += `    --${n}: ${vw}vw;\n`
    })
    allNegatives.forEach(n => {
        const vw = ((n / 1920) * 100).toFixed(10)
        css += `    ---${n}: -${vw}vw;\n`
    })
    css += '  }\n}\n\n'

    // 3) MAX-WIDTH 1440.98px: vw от 1440 (l: префикс)
    css += '@media (max-width: 1440.98px) {\n  :root {\n'
    allNumbers.forEach(n => {
        const vw = ((n / 1440) * 100).toFixed(10)
        css += `    --${n}: ${vw}vw;\n`
    })
    allNegatives.forEach(n => {
        const vw = ((n / 1440) * 100).toFixed(10)
        css += `    ---${n}: -${vw}vw;\n`
    })
    css += '  }\n}\n\n'

    // 4) MAX-WIDTH 767.98px: vw от 375 (m: префикс)
    css += '@media (max-width: 767.98px) {\n  :root {\n'
    allNumbers.forEach(n => {
        const vw = ((n / 375) * 100).toFixed(10)
        css += `    --${n}: ${vw}vw;\n`
    })
    allNegatives.forEach(n => {
        const vw = ((n / 375) * 100).toFixed(10)
        css += `    ---${n}: -${vw}vw;\n`
    })
    css += '  }\n}'

    return css
}


// === КОНФИГ UNOCSS ===
export default defineConfig({
    // БЕЗ presetUno() - чистый лист, только твои правила
    presets: [],
    configDeps: [
    'sass/**/*.sass',
    'sass/**/*.scss',
  ],
    // Генерация переменных при сборке
    preflights: [
        {
            layer: 'preflights',
            getCSS: () => {
                const used = scanUsedNumbers()
                console.log(`[UnoCSS] Генерируем: ${used.positive.length} положительных, ${used.negative.length} отрицательных`)
                return generateFluidVars(used.positive, used.negative)
            }
        }
    ],

    preflight: false,
    // Префиксы l: и m: для responsive классов
    variants: [
        // l:класс → @media (max-width: 1440.98px)
        (matcher) => {
            const m = matcher.match(/^l:(.+)/)
            if (!m) return matcher
            return {
                matcher: m[1],
                parent: `@media (max-width: ${bp.l})`,
            }
        },
        // m:класс → @media (max-width: 767.98px)
        (matcher) => {
            const m = matcher.match(/^m:(.+)/)
            if (!m) return matcher
            return {
                matcher: m[1],
                parent: `@media (max-width: ${bp.m})`,
            }
        },
    ],

    rules: [
        // === ОТСТУПЫ (используют var) ===

        // Margin: m-24, mt-40, mx-20, my-30
        [/^m-(\d+)$/, ([, n]) => ({ margin: `var(--${n})` })],
        [/^mt-(\d+)$/, ([, n]) => ({ 'margin-top': `var(--${n})` })],
        [/^mb-(\d+)$/, ([, n]) => ({ 'margin-bottom': `var(--${n})` })],
        [/^ml-(\d+)$/, ([, n]) => ({ 'margin-left': `var(--${n})` })],
        [/^mr-(\d+)$/, ([, n]) => ({ 'margin-right': `var(--${n})` })],
        [/^mx-(\d+)$/, ([, n]) => ({ 'margin-left': `var(--${n})`, 'margin-right': `var(--${n})` })],
        [/^my-(\d+)$/, ([, n]) => ({ 'margin-top': `var(--${n})`, 'margin-bottom': `var(--${n})` })],

        // Margin отрицательные: -ml-20, -mt-40
        [/^-m-(\d+)$/, ([, n]) => ({ margin: `var(---${n})` })],
        [/^-mt-(\d+)$/, ([, n]) => ({ 'margin-top': `var(---${n})` })],
        [/^-mb-(\d+)$/, ([, n]) => ({ 'margin-bottom': `var(---${n})` })],
        [/^-ml-(\d+)$/, ([, n]) => ({ 'margin-left': `var(---${n})` })],
        [/^-mr-(\d+)$/, ([, n]) => ({ 'margin-right': `var(---${n})` })],
        [/^-mx-(\d+)$/, ([, n]) => ({ 'margin-left': `var(---${n})`, 'margin-right': `var(---${n})` })],
        [/^-my-(\d+)$/, ([, n]) => ({ 'margin-top': `var(---${n})`, 'margin-bottom': `var(---${n})` })],

        // Padding: p-24, pt-40, px-20, py-30
        [/^p-(\d+)$/, ([, n]) => ({ padding: `var(--${n})` })],
        [/^pt-(\d+)$/, ([, n]) => ({ 'padding-top': `var(--${n})` })],
        [/^pb-(\d+)$/, ([, n]) => ({ 'padding-bottom': `var(--${n})` })],
        [/^pl-(\d+)$/, ([, n]) => ({ 'padding-left': `var(--${n})` })],
        [/^pr-(\d+)$/, ([, n]) => ({ 'padding-right': `var(--${n})` })],
        [/^px-(\d+)$/, ([, n]) => ({ 'padding-left': `var(--${n})`, 'padding-right': `var(--${n})` })],
        [/^py-(\d+)$/, ([, n]) => ({ 'padding-top': `var(--${n})`, 'padding-bottom': `var(--${n})` })],

        // === РАЗМЕРЫ (используют var) ===

        // Font-size: fz-24, l:fz-20, m:fz-16
        [/^fz-(\d+)$/, ([, n]) => ({ 'font-size': `var(--${n})` })],

        // Width / Height: w-100, h-200
        [/^w-(\d+)$/, ([, n]) => ({ width: `var(--${n})` })],
        [/^h-(\d+)$/, ([, n]) => ({ height: `var(--${n})` })],

        // Gap: gap-24, gx-20, gy-30
        [/^gap-(\d+)$/, ([, n]) => ({ gap: `var(--${n})` })],
        [/^gx-(\d+)$/, ([, n]) => ({ 'column-gap': `var(--${n})` })],
        [/^gy-(\d+)$/, ([, n]) => ({ 'row-gap': `var(--${n})` })],

        // === BOOTSTRAP GRID ===

        // В uno.config.js оставь только для генерации col-6, col-12 и т.д.
        [/^col-(\d{1,2})$/, ([, d]) => {
            const width = (Number(d) / 12 * 100).toFixed(6)
            return {
                'flex': `0 0 auto`,
                'width': `${width}%`,
            }
        }],


        // Offset: offset-1 до offset-11
        [/^offset-(\d{1,2})$/, ([, d]) => {
            const ml = (Number(d) / 12 * 100).toFixed(6)
            return { 'margin-left': `${ml}%` }
        }],

        // === DISPLAY ===

        ['d-none', { display: 'none' }],
        ['d-block', { display: 'block' }],
        ['d-inline', { display: 'inline' }],
        ['d-inline-block', { display: 'inline-block' }],
        ['d-flex', { display: 'flex' }],
        ['d-inline-flex', { display: 'inline-flex' }],
        ['d-grid', { display: 'grid' }],

        // === FLEXBOX ===

        // Direction
        ['flex-row', { 'flex-direction': 'row' }],
        ['flex-row-reverse', { 'flex-direction': 'row-reverse' }],
        ['flex-column', { 'flex-direction': 'column' }],
        ['flex-column-reverse', { 'flex-direction': 'column-reverse' }],

        // Wrap
        ['flex-wrap', { 'flex-wrap': 'wrap' }],
        ['flex-nowrap', { 'flex-wrap': 'nowrap' }],
        ['flex-wrap-reverse', { 'flex-wrap': 'wrap-reverse' }],

        // Justify Content
        ['justify-content-start', { 'justify-content': 'flex-start' }],
        ['justify-content-end', { 'justify-content': 'flex-end' }],
        ['justify-content-center', { 'justify-content': 'center' }],
        ['justify-content-between', { 'justify-content': 'space-between' }],
        ['justify-content-around', { 'justify-content': 'space-around' }],
        ['justify-content-evenly', { 'justify-content': 'space-evenly' }],

        // Align Items
        ['align-items-start', { 'align-items': 'flex-start' }],
        ['align-items-end', { 'align-items': 'flex-end' }],
        ['align-items-center', { 'align-items': 'center' }],
        ['align-items-baseline', { 'align-items': 'baseline' }],
        ['align-items-stretch', { 'align-items': 'stretch' }],

        // Align Content
        ['align-content-start', { 'align-content': 'flex-start' }],
        ['align-content-end', { 'align-content': 'flex-end' }],
        ['align-content-center', { 'align-content': 'center' }],
        ['align-content-between', { 'align-content': 'space-between' }],
        ['align-content-around', { 'align-content': 'space-around' }],
        ['align-content-stretch', { 'align-content': 'stretch' }],

        // Align Self
        ['align-self-start', { 'align-self': 'flex-start' }],
        ['align-self-end', { 'align-self': 'flex-end' }],
        ['align-self-center', { 'align-self': 'center' }],
        ['align-self-baseline', { 'align-self': 'baseline' }],
        ['align-self-stretch', { 'align-self': 'stretch' }],

        // Flex Grow/Shrink
        ['flex-fill', { 'flex': '1 1 auto' }],
        ['flex-grow-0', { 'flex-grow': '0' }],
        ['flex-grow-1', { 'flex-grow': '1' }],
        ['flex-shrink-0', { 'flex-shrink': '0' }],
        ['flex-shrink-1', { 'flex-shrink': '1' }],

        // Order
        [/^order-(\d+)$/, ([, n]) => ({ order: n })],
        ['order-first', { order: '-1' }],
        ['order-last', { order: '9999' }],

        // === ТИПОГРАФИКА ===

        // Text Align
        ['text-left', { 'text-align': 'left' }],
        ['text-center', { 'text-align': 'center' }],
        ['text-right', { 'text-align': 'right' }],
        ['text-justify', { 'text-align': 'justify' }],

        // Font Weight
        ['fw-100', { 'font-weight': '100' }],
        ['fw-200', { 'font-weight': '200' }],
        ['fw-300', { 'font-weight': '300' }],
        ['fw-400', { 'font-weight': '400' }],
        ['fw-500', { 'font-weight': '500' }],
        ['fw-600', { 'font-weight': '600' }],
        ['fw-700', { 'font-weight': '700' }],
        ['fw-800', { 'font-weight': '800' }],
        ['fw-900', { 'font-weight': '900' }],
        ['fw-bold', { 'font-weight': 'bold' }],
        ['fw-normal', { 'font-weight': 'normal' }],

        // Line Height
        ['lh-1', { 'line-height': '1' }],
        ['lh-sm', { 'line-height': '1.25' }],
        ['lh-base', { 'line-height': '1.5' }],
        ['lh-lg', { 'line-height': '2' }],

        // Text Transform
        ['text-uppercase', { 'text-transform': 'uppercase' }],
        ['text-lowercase', { 'text-transform': 'lowercase' }],
        ['text-capitalize', { 'text-transform': 'capitalize' }],

        // === УТИЛИТЫ ===

        // Width / Height специальные
        ['w-100', { 'width': '100%' }],
        ['w-auto', { 'width': 'auto' }],
        ['h-100', { 'height': '100%' }],
        ['h-auto', { 'height': 'auto' }],

        // Margin специальные
        ['mb-0', { 'margin-bottom': '0' }],
        ['mt-0', { 'margin-top': '0' }],
        ['mx-auto', { 'margin-left': 'auto', 'margin-right': 'auto' }],
        ['my-auto', { 'margin-top': 'auto', 'margin-bottom': 'auto' }],

        // === POSITION ===

        ['position-static', { position: 'static' }],
        ['position-relative', { position: 'relative' }],
        ['position-absolute', { position: 'absolute' }],
        ['position-fixed', { position: 'fixed' }],
        ['position-sticky', { position: 'sticky' }],

        // Top/Right/Bottom/Left с var
        [/^top-(\d+)$/, ([, n]) => ({ top: `var(--${n})` })],
        [/^right-(\d+)$/, ([, n]) => ({ right: `var(--${n})` })],
        [/^bottom-(\d+)$/, ([, n]) => ({ bottom: `var(--${n})` })],
        [/^left-(\d+)$/, ([, n]) => ({ left: `var(--${n})` })],
        ['top-0', { top: '0' }],
        ['right-0', { right: '0' }],
        ['bottom-0', { bottom: '0' }],
        ['left-0', { left: '0' }],
        ['inset-0', { top: '0', right: '0', bottom: '0', left: '0' }],

        // === OVERFLOW ===

        ['overflow-hidden', { overflow: 'hidden' }],
        ['overflow-auto', { overflow: 'auto' }],
        ['overflow-visible', { overflow: 'visible' }],
        ['overflow-scroll', { overflow: 'scroll' }],
        ['overflow-x-hidden', { 'overflow-x': 'hidden' }],
        ['overflow-y-hidden', { 'overflow-y': 'hidden' }],
        ['overflow-x-auto', { 'overflow-x': 'auto' }],
        ['overflow-y-auto', { 'overflow-y': 'auto' }],

        // === VISIBILITY ===

        ['visible', { visibility: 'visible' }],
        ['invisible', { visibility: 'hidden' }],

        // === Z-INDEX ===

        [/^z-(\d+)$/, ([, n]) => ({ 'z-index': n })],
        ['z-0', { 'z-index': '0' }],
        ['z-10', { 'z-index': '10' }],
        ['z-20', { 'z-index': '20' }],
        ['z-30', { 'z-index': '30' }],
        ['z-40', { 'z-index': '40' }],
        ['z-50', { 'z-index': '50' }],
        ['z-auto', { 'z-index': 'auto' }],

        // === BORDER RADIUS ===

        [/^rounded-(\d+)$/, ([, n]) => ({ 'border-radius': `var(--${n})` })],
        ['rounded-0', { 'border-radius': '0' }],
        ['rounded', { 'border-radius': '4px' }],
        ['rounded-full', { 'border-radius': '9999px' }],
        ['rounded-circle', { 'border-radius': '50%' }],
        ['rounded-top', { 'border-top-left-radius': '4px', 'border-top-right-radius': '4px' }],
        ['rounded-bottom', { 'border-bottom-left-radius': '4px', 'border-bottom-right-radius': '4px' }],

        // === OPACITY ===

        [/^opacity-(\d+)$/, ([, n]) => ({ opacity: `0.${n}` })],
        ['opacity-0', { opacity: '0' }],
        ['opacity-25', { opacity: '0.25' }],
        ['opacity-50', { opacity: '0.5' }],
        ['opacity-75', { opacity: '0.75' }],
        ['opacity-100', { opacity: '1' }],

        // === OBJECT FIT (для изображений) ===

        ['object-cover', { 'object-fit': 'cover' }],
        ['object-contain', { 'object-fit': 'contain' }],
        ['object-none', { 'object-fit': 'none' }],

        // === CURSOR ===

        ['cursor-pointer', { cursor: 'pointer' }],
        ['cursor-default', { cursor: 'default' }],

        // === POINTER EVENTS ===

        ['pointer-events-none', { 'pointer-events': 'none' }],
        ['pointer-events-auto', { 'pointer-events': 'auto' }],

        // === TEXT DECORATION ===

        ['text-underline', { 'text-decoration': 'underline' }],
        ['text-line-through', { 'text-decoration': 'line-through' }],
        ['text-no-underline', { 'text-decoration': 'none' }],
        ['underline', { 'text-decoration': 'underline' }],
        ['no-underline', { 'text-decoration': 'none' }],

        // === WHITE SPACE & WORD BREAK ===

        ['whitespace-nowrap', { 'white-space': 'nowrap' }],
        ['whitespace-normal', { 'white-space': 'normal' }],

        // === MAX WIDTH ===

        ['max-w-full', { 'max-width': '100%' }],
        ['max-w-none', { 'max-width': 'none' }],
        ['max-w-1140px', { 'max-width': '1140px' }],
        [/^max-w-(\d+)$/, ([, n]) => ({ 'max-width': `var(--${n})` })],

        // === MIN WIDTH/HEIGHT ===

        ['min-w-0', { 'min-width': '0' }],
        ['min-w-full', { 'min-width': '100%' }],
        ['min-h-0', { 'min-height': '0' }],
        ['min-h-full', { 'min-height': '100%' }],
        ['min-h-screen', { 'min-height': '100vh' }],
    ],

    // Shortcuts для частых комбинаций
    shortcuts: {

    },
})
