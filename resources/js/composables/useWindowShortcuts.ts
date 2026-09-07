import { onMounted, onUnmounted } from 'vue'
import { useWindowManager } from '@/composables/useWindowManager'

type Wm = ReturnType<typeof useWindowManager>

/**
 * Global window-management shortcuts.
 *  ⌘/Ctrl + K  → toggle command palette
 *  Esc         → close the focused window
 *  ⌘/Ctrl + `  → cycle windows
 *  ⌘/Ctrl + ↓  → minimize the focused window
 *
 * Note: ⌘W and ⌘M are intentionally avoided — browsers/macOS reserve them
 * (closing the tab / minimizing the browser) and won't reliably let a page
 * preventDefault them.
 */
export function useWindowShortcuts(
    wm: Wm,
    palette: { toggle: () => void; isOpen: () => boolean },
) {
    function isTyping(e: KeyboardEvent) {
        const t = e.target as HTMLElement | null
        return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)
    }

    function onKey(e: KeyboardEvent) {
        const mod = e.metaKey || e.ctrlKey

        if (mod && e.key.toLowerCase() === 'k') {
            e.preventDefault()
            palette.toggle()
            return
        }

        // while the palette is open it owns the keyboard
        if (palette.isOpen()) return

        const active = wm.activeWindow()

        if (mod && e.key === '`') {
            e.preventDefault()
            wm.cycleWindows()
            return
        }
        if (mod && e.key === 'ArrowDown') {
            if (active) {
                e.preventDefault()
                wm.toggleMinimize(active.id)
            }
            return
        }
        if (e.key === 'Escape' && !isTyping(e)) {
            if (active) wm.closeWindow(active.id)
        }
    }

    onMounted(() => window.addEventListener('keydown', onKey))
    onUnmounted(() => window.removeEventListener('keydown', onKey))
}
