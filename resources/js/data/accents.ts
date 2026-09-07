/**
 * Accent colours for the OS. Each swatch is a `--primary` /
 * `--primary-foreground` pair; `applySettings()` writes them as inline custom
 * properties on `<html>`, where they win over the `:root` / `.dark` blocks in
 * `app.css`.
 *
 * The foreground is always one of the two inks already used by the design —
 * the olive `#23251d` or the off-white `#eeefe9` — and every pair clears
 * WCAG AA (>= 4.5:1). Measured ratios are noted per swatch.
 */

export type AccentId = 'brand' | 'blue' | 'green' | 'purple' | 'pink' | 'teal'

export type Accent = {
    id: AccentId
    name: string
    /** value for `--primary` */
    primary: string
    /** value for `--primary-foreground` */
    primaryForeground: string
}

const INK = '#23251d'
const OFF_WHITE = '#eeefe9'

export const accents: Accent[] = [
    // 7.64:1 — the original brand yellow-orange
    { id: 'brand', name: 'Brand', primary: '#f7a501', primaryForeground: INK },
    // 5.79:1
    { id: 'blue', name: 'Blue', primary: '#1d4ed8', primaryForeground: OFF_WHITE },
    // 5.26:1
    { id: 'green', name: 'Green', primary: '#16704a', primaryForeground: OFF_WHITE },
    // 5.61:1
    { id: 'purple', name: 'Purple', primary: '#7c44a6', primaryForeground: OFF_WHITE },
    // 6.78:1
    { id: 'pink', name: 'Pink', primary: '#f28cb4', primaryForeground: INK },
    // 6.86:1
    { id: 'teal', name: 'Teal', primary: '#3fbfb0', primaryForeground: INK },
]

export const DEFAULT_ACCENT: AccentId = 'brand'

export function findAccent(id: string): Accent {
    return accents.find(a => a.id === id) ?? accents[0]
}

export function isAccentId(id: unknown): id is AccentId {
    return typeof id === 'string' && accents.some(a => a.id === id)
}
