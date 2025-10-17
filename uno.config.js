import { defineConfig } from 'unocss'
import { presetUno, presetAttributify } from 'unocss'

export default defineConfig({
    presets: [
        presetUno(),
        presetAttributify(),
    ],
    rules: [
        [/^m-([\.\d]+)$/, ([_, num]) => ({ margin: `${num}px` })],
    ],
})
