import { reactive, readonly } from 'vue'

type WindowDef = {
    id: string
    title: string
    contentLoader?: () => Promise<any>
    // props handed to the lazily loaded content component (e.g. a pre-filter)
    contentProps?: Record<string, unknown>
    minimized: boolean
    z: number
    x?: number
    y?: number
    width?: number
    height?: number
    isLoaded: boolean
}

const state = reactive({
    zCounter: 100,
    windows: [] as WindowDef[],
})

export function useWindowManager() {
    function find(id: string) {
        return state.windows.find(w => w.id === id)
    }

    function openWindow(payload: { id: string; title: string; contentLoader?: () => Promise<any>; contentProps?: Record<string, unknown>; x?: number; y?: number; width?: number; height?: number }) {
        const existing = find(payload.id)
        if (existing) {
            // A re-open may carry new content props (e.g. a different pre-filter).
            // Merge them in — the windows array is reactive, so the mounted content
            // sees the change; a payload without props leaves the old ones alone.
            if (payload.contentProps) existing.contentProps = payload.contentProps
            focusWindow(payload.id)
            existing.minimized = false
            return existing
        }
        const w: WindowDef = {
            id: payload.id,
            title: payload.title,
            contentLoader: payload.contentLoader,
            contentProps: payload.contentProps,
            minimized: false,
            z: ++state.zCounter,
            x: payload.x,
            y: payload.y,
            width: payload.width,
            height: payload.height,
            isLoaded: false,
        }
        state.windows.push(w)
        return w
    }

    function closeWindow(id: string) {
        const idx = state.windows.findIndex(w => w.id === id)
        if (idx !== -1) state.windows.splice(idx, 1)
    }

    function focusWindow(id: string) {
        const w = find(id)
        if (!w) return
        w.z = ++state.zCounter
        w.minimized = false
    }

    function toggleMinimize(id: string) {
        const w = find(id)
        if (!w) return
        w.minimized = !w.minimized
    }

    function markLoaded(id: string) {
        const w = find(id)
        if (!w) return
        w.isLoaded = true
    }

    function updateWindow(id: string, partial: Partial<WindowDef>) {
        const w = find(id)
        if (!w) return
        Object.assign(w, partial)
    }

    // the focused window = top-most (highest z) that isn't minimized
    function activeWindow() {
        const visible = state.windows.filter(w => !w.minimized)
        if (!visible.length) return undefined
        return visible.reduce((top, w) => (w.z > top.z ? w : top))
    }

    // bring the bottom-most visible window to the front (cycles through the stack)
    function cycleWindows() {
        const visible = state.windows.filter(w => !w.minimized)
        if (visible.length < 2) return
        const lowest = visible.reduce((lo, w) => (w.z < lo.z ? w : lo))
        focusWindow(lowest.id)
    }

    return {
        windows: readonly(state.windows),
        openWindow,
        closeWindow,
        focusWindow,
        toggleMinimize,
        markLoaded,
        updateWindow,
        activeWindow,
        cycleWindows,
    }
}
