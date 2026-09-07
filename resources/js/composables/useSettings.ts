import { reactive, readonly } from 'vue'
import {
    DEFAULT_ACCENT,
    findAccent,
    isAccentId,
    type AccentId,
} from '@/data/accents'
import { DEFAULT_CURSOR, isCursorId, type CursorId } from '@/data/cursors'
import {
    DEFAULT_WALLPAPER,
    findWallpaper,
    isWallpaperId,
    type WallpaperId,
} from '@/data/wallpapers'

export const SETTINGS_STORAGE_KEY = 'portfolio-os:settings'

export type Settings = {
    cursor: CursorId
    wallpaper: WallpaperId
    accent: AccentId
}

function defaults(): Settings {
    return {
        cursor: DEFAULT_CURSOR,
        wallpaper: DEFAULT_WALLPAPER,
        accent: DEFAULT_ACCENT,
    }
}

/**
 * Reads the stored settings. Only ids are persisted (never CSS values), and
 * every id is validated against the data files, so an old or hand-edited entry
 * degrades to the default instead of writing garbage into the document.
 */
function read(): Settings {
    const settings = defaults()
    try {
        const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
        if (!raw) return settings
        const saved = JSON.parse(raw) as Partial<Settings>
        if (isCursorId(saved.cursor)) settings.cursor = saved.cursor
        if (isWallpaperId(saved.wallpaper)) settings.wallpaper = saved.wallpaper
        if (isAccentId(saved.accent)) settings.accent = saved.accent
    } catch {
        // ignore corrupt/unavailable storage
    }
    return settings
}

function write(settings: Settings) {
    try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
    } catch {
        // ignore storage failures (private mode, quota, …)
    }
}

// module-level singleton: every window/section edits the same OS settings
const state = reactive<Settings>(read())

/**
 * Pushes the current settings onto `<html>`: `data-cursor` / `data-wallpaper`
 * for the CSS hooks and the `--wallpaper` / `--primary` custom properties as
 * inline styles (inline wins over the `:root` / `.dark` blocks in `app.css`).
 *
 * Touches nothing but `document.documentElement`, so it is safe to call before
 * the Vue app mounts — and it is idempotent, so calling it again just rewrites
 * the same values.
 */
export function applySettings() {
    if (typeof document === 'undefined') return

    const root = document.documentElement
    const wallpaper = findWallpaper(state.wallpaper)
    const accent = findAccent(state.accent)

    root.setAttribute('data-cursor', state.cursor)
    root.setAttribute('data-wallpaper', wallpaper.id)
    root.style.setProperty('--wallpaper', wallpaper.css)
    root.style.setProperty('--wallpaper-size', wallpaper.size ?? 'auto')
    root.style.setProperty('--primary', accent.primary)
    root.style.setProperty('--primary-foreground', accent.primaryForeground)
}

function persistAndApply() {
    write(state)
    applySettings()
}

export function useSettings() {
    function setCursor(id: CursorId) {
        state.cursor = id
        persistAndApply()
    }

    function setWallpaper(id: WallpaperId) {
        state.wallpaper = id
        persistAndApply()
    }

    function setAccent(id: AccentId) {
        state.accent = id
        persistAndApply()
    }

    /** Back to the shipped look: drops the stored key and the inline overrides. */
    function reset() {
        Object.assign(state, defaults())
        try {
            localStorage.removeItem(SETTINGS_STORAGE_KEY)
        } catch {
            // ignore unavailable storage (private mode, blocked cookies, …)
        }
        if (typeof document !== 'undefined') {
            const root = document.documentElement
            root.setAttribute('data-cursor', state.cursor)
            root.setAttribute('data-wallpaper', state.wallpaper)
            root.style.removeProperty('--wallpaper')
            root.style.removeProperty('--wallpaper-size')
            root.style.removeProperty('--primary')
            root.style.removeProperty('--primary-foreground')
        }
    }

    return {
        /** read-only view — go through the setters so changes get persisted */
        settings: readonly(state),
        setCursor,
        setWallpaper,
        setAccent,
        reset,
    }
}
