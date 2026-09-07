import { onBeforeUnmount, ref, watch } from 'vue'
import { useDocumentVisibility } from '@vueuse/core'
import { useWindowContext } from './useWindowContext'

/** rAF loop with delta seconds; pauses while the window is unfocused/minimized or the tab hidden. */
export function useGameLoop(step: (dt: number) => void) {
    const { focused, minimized } = useWindowContext()
    const visibility = useDocumentVisibility()
    const running = ref(false)
    const userPaused = ref(false)
    let handle = 0
    let last = 0

    const paused = () =>
        userPaused.value || !focused.value || minimized.value || visibility.value === 'hidden'

    function frame(now: number) {
        if (!running.value) return
        if (!paused()) {
            // clamp so a long pause (tab switch, breakpoint) can't teleport the game state
            const dt = Math.min(0.05, (now - last) / 1000)
            step(dt)
        }
        last = now
        handle = requestAnimationFrame(frame)
    }

    function start() {
        if (running.value) return
        running.value = true
        last = performance.now()
        handle = requestAnimationFrame(frame)
    }

    function stop() {
        running.value = false
        cancelAnimationFrame(handle)
    }

    // resuming must not hand the next frame the whole pause as its delta
    watch([focused, minimized, visibility], () => {
        last = performance.now()
    })
    onBeforeUnmount(stop)

    return { start, stop, userPaused, isPaused: paused }
}
