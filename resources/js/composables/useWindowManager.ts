import { reactive, readonly } from 'vue'

type WindowDef = {
    id: string
    title: string
    contentLoader?: () => Promise<any>
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

    function openWindow(payload: { id: string; title: string; contentLoader?: () => Promise<any>; x?: number; y?: number }) {
        const existing = find(payload.id)
        if (existing) {
            focusWindow(payload.id)
            existing.minimized = false
            return existing
        }
        const w: WindowDef = {
            id: payload.id,
            title: payload.title,
            contentLoader: payload.contentLoader,
            minimized: false,
            z: ++state.zCounter,
            x: payload.x,
            y: payload.y,
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

    return {
        windows: readonly(state.windows),
        openWindow,
        closeWindow,
        focusWindow,
        toggleMinimize,
        markLoaded,
        updateWindow,
    }
}
