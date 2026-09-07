import { onBeforeUnmount, onMounted, type Ref } from 'vue'

export type SwipeDirection = 'up' | 'down' | 'left' | 'right'

const THRESHOLD = 24

/** Pointer-based four-direction swipe; the dominant axis wins. */
export function useSwipe(el: Ref<HTMLElement | null>, onSwipe: (d: SwipeDirection) => void) {
    let start: { x: number; y: number } | null = null

    const down = (e: PointerEvent) => {
        start = { x: e.clientX, y: e.clientY }
    }
    const up = (e: PointerEvent) => {
        if (!start) return
        const dx = e.clientX - start.x
        const dy = e.clientY - start.y
        start = null
        if (Math.max(Math.abs(dx), Math.abs(dy)) < THRESHOLD) return
        onSwipe(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up')
    }

    onMounted(() => {
        el.value?.addEventListener('pointerdown', down)
        el.value?.addEventListener('pointerup', up)
    })
    onBeforeUnmount(() => {
        el.value?.removeEventListener('pointerdown', down)
        el.value?.removeEventListener('pointerup', up)
    })
}

const CANCEL_EVENTS = ['pointerup', 'pointerleave', 'pointercancel'] as const

/**
 * Calls `onLongPress` once if the pointer stays down for `ms`; returns a cleanup.
 * Element-scoped rather than a directive so it can be attached per cell in a v-for.
 */
export function attachLongPress(
    el: HTMLElement,
    onLongPress: (e: PointerEvent) => void,
    ms = 500,
) {
    let timer = 0
    const down = (e: PointerEvent) => {
        timer = window.setTimeout(() => onLongPress(e), ms)
    }
    const cancel = () => clearTimeout(timer)

    el.addEventListener('pointerdown', down)
    for (const ev of CANCEL_EVENTS) el.addEventListener(ev, cancel)

    return () => {
        el.removeEventListener('pointerdown', down)
        for (const ev of CANCEL_EVENTS) el.removeEventListener(ev, cancel)
    }
}
