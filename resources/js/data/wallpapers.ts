/**
 * Desktop wallpapers.
 *
 * `css` is a full `background` shorthand **value** — `applySettings()` writes it
 * to `--wallpaper`, and `.desktop` in `app.css` reads it as
 * `background: var(--wallpaper, var(--background))`. Patterns that need a tile
 * size add `size`, which lands in `--wallpaper-size` and is applied by the
 * `background-size` declaration right after the shorthand (the shorthand would
 * otherwise reset it).
 *
 * Every colour is derived from the theme tokens via
 * `color-mix(in oklab, var(--background), <tint> N%)` or `var(--primary)`, so a
 * preset works in light and dark mode and follows the chosen accent.
 *
 * `applySettings()` also mirrors the id to `data-wallpaper` on `<html>`; the
 * `aurora` preset uses that hook in `app.css` for its keyframe animation
 * (static under `prefers-reduced-motion: reduce`), and the `default` preset
 * uses it to keep the fleck texture overlay on `#desktop`.
 */

export type WallpaperId =
    | 'default'
    | 'sand'
    | 'slate'
    | 'moss'
    | 'dawn'
    | 'dusk'
    | 'halo'
    | 'grid'
    | 'dots'
    | 'stripes'
    | 'aurora'

export type WallpaperKind = 'theme' | 'solid' | 'gradient' | 'pattern'

export type Wallpaper = {
    id: WallpaperId
    name: string
    kind: WallpaperKind
    /** full `background` shorthand value */
    css: string
    /** optional `background-size`, applied after the shorthand */
    size?: string
}

/** shorthand for the tint helper used all over the presets below */
const mix = (tint: string, amount: number) =>
    `color-mix(in oklab, var(--background), ${tint} ${amount}%)`

const INK = 'var(--foreground)'
const BRAND = 'var(--primary)'
const BLUE = '#2c84e0'
const GREEN = '#2c8c66'
const PURPLE = '#7c44a6'

export const wallpapers: Wallpaper[] = [
    {
        id: 'default',
        name: 'Theme',
        kind: 'theme',
        css: 'var(--background)',
    },

    // --- solids ---------------------------------------------------------
    { id: 'sand', name: 'Sand', kind: 'solid', css: mix(BRAND, 14) },
    { id: 'slate', name: 'Slate', kind: 'solid', css: mix(BLUE, 14) },
    { id: 'moss', name: 'Moss', kind: 'solid', css: mix(GREEN, 16) },

    // --- gradients ------------------------------------------------------
    {
        id: 'dawn',
        name: 'Dawn',
        kind: 'gradient',
        css: `linear-gradient(160deg, ${mix(BRAND, 28)} 0%, var(--background) 70%)`,
    },
    {
        id: 'dusk',
        name: 'Dusk',
        kind: 'gradient',
        css: `linear-gradient(200deg, ${mix(PURPLE, 30)} 0%, ${mix(BLUE, 16)} 100%)`,
    },
    {
        id: 'halo',
        name: 'Halo',
        kind: 'gradient',
        css: `radial-gradient(120% 90% at 30% 10%, ${mix(BRAND, 22)} 0%, var(--background) 65%)`,
    },

    // --- patterns -------------------------------------------------------
    {
        id: 'grid',
        name: 'Grid',
        kind: 'pattern',
        css: `linear-gradient(${mix(INK, 12)} 1px, transparent 1px), linear-gradient(90deg, ${mix(INK, 12)} 1px, transparent 1px), var(--background)`,
        size: '32px 32px',
    },
    {
        id: 'dots',
        name: 'Dots',
        kind: 'pattern',
        css: `radial-gradient(${mix(INK, 22)} 1.5px, transparent 1.6px), var(--background)`,
        size: '22px 22px',
    },
    {
        id: 'stripes',
        name: 'Stripes',
        kind: 'pattern',
        css: `repeating-linear-gradient(45deg, ${mix(INK, 9)} 0 3px, transparent 3px 16px), var(--background)`,
    },

    // --- animated -------------------------------------------------------
    {
        id: 'aurora',
        name: 'Aurora',
        kind: 'gradient',
        css: `linear-gradient(120deg, ${mix(BRAND, 26)} 0%, var(--background) 45%, ${mix(BLUE, 24)} 100%)`,
        // the gradient is oversized so `wallpaper-drift` in app.css has room to pan
        size: '300% 300%',
    },
]

export const DEFAULT_WALLPAPER: WallpaperId = 'default'

export function findWallpaper(id: string): Wallpaper {
    return wallpapers.find(w => w.id === id) ?? wallpapers[0]
}

export function isWallpaperId(id: unknown): id is WallpaperId {
    return typeof id === 'string' && wallpapers.some(w => w.id === id)
}
