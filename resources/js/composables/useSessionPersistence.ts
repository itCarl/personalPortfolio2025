import { onMounted, watch } from 'vue'
import { appDefinitions } from '@/data/apps'
import { useWindowManager } from '@/composables/useWindowManager'

type Wm = ReturnType<typeof useWindowManager>

export const SESSION_STORAGE_KEY = 'portfolio-os:session'

type SavedWindow = { id: string; minimized: boolean }

/**
 * Persists which app windows are open (and whether they're minimized) to
 * localStorage, and restores that session on the next load.
 *
 * Note: live position/size aren't persisted — windows reopen at their default
 * geometry — because that lives in the window component, not the manager.
 */
export function useSessionPersistence(wm: Wm) {
    function restore() {
        try {
            const raw = localStorage.getItem(SESSION_STORAGE_KEY)
            if (!raw) return
            const saved = JSON.parse(raw) as SavedWindow[]
            saved.forEach(({ id, minimized }) => {
                const app = appDefinitions.find(a => a.id === id)
                if (!app) return
                wm.openWindow({
                    id: app.id,
                    title: app.title,
                    contentLoader: app.contentLoader,
                    width: app.width,
                    height: app.height,
                })
                if (minimized) wm.toggleMinimize(app.id)
            })
        } catch {
            // ignore corrupt/unavailable storage
        }
    }

    function save() {
        try {
            const data: SavedWindow[] = wm.windows.map(w => ({ id: w.id, minimized: w.minimized }))
            localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data))
        } catch {
            // ignore storage failures (private mode, quota, …)
        }
    }

    onMounted(() => {
        restore()
        // re-save whenever the set of windows or their minimized state changes
        watch(
            () => wm.windows.map(w => `${w.id}:${w.minimized}`).join(','),
            save,
        )
    })
}
