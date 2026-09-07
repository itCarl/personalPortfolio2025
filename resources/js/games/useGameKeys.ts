import { onBeforeUnmount, onMounted } from 'vue'
import { useWindowContext } from './useWindowContext'

export type KeyMap = Record<string, (e: KeyboardEvent) => void>

/** Keys reach the game only while its window is on top and no text field has focus. */
export function useGameKeys(map: KeyMap, onKeyUp?: KeyMap) {
    const { focused, minimized } = useWindowContext()

    const isTyping = (t: EventTarget | null) =>
        t instanceof HTMLElement &&
        (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)

    // matched on `key` first (so 'ArrowUp'/'a' work) and on `code` second
    // (so 'KeyA'/'Space' work regardless of layout)
    const handler = (m: KeyMap) => (e: KeyboardEvent) => {
        if (!focused.value || minimized.value || isTyping(e.target)) return
        const fn = m[e.key] ?? m[e.code]
        if (fn) {
            e.preventDefault()
            fn(e)
        }
    }

    const down = handler(map)
    const up = onKeyUp ? handler(onKeyUp) : null

    onMounted(() => {
        window.addEventListener('keydown', down)
        if (up) window.addEventListener('keyup', up)
    })
    onBeforeUnmount(() => {
        window.removeEventListener('keydown', down)
        if (up) window.removeEventListener('keyup', up)
    })
}
