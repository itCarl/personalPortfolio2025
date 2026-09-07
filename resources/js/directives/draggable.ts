import type { Directive, DirectiveBinding } from 'vue'

type DragMode = 'center' | 'topleft'

type BindingValue =
    | boolean
    | {
          /** keep the element inside its offset parent while dragging */
          bounce?: boolean
          /** 'center' preserves a translate(-50%, -50%) base transform */
          mode?: DragMode
          /** CSS selector for the drag handle inside the element (defaults to the element itself) */
          handle?: string
      }

// movement (px) required before a press is treated as a drag — lets click / dblclick through
const DRAG_THRESHOLD = 3

const clamp = (v: number, min: number, max: number) => (min > max ? v : Math.min(Math.max(v, min), max))

const cleanupMap = new WeakMap<HTMLElement, () => void>()

const Draggable: Directive<HTMLElement, BindingValue> = {
    mounted(el: HTMLElement, binding: DirectiveBinding<BindingValue>) {
        if (binding.value === false) return

        const options = typeof binding.value === 'object' && binding.value !== null ? binding.value : {}
        const mode: DragMode = options.mode ?? 'topleft'
        const bounce = !!options.bounce
        const handleEl = (options.handle ? el.querySelector<HTMLElement>(options.handle) : null) ?? el

        // current translation, owned entirely by this directive
        let x = 0
        let y = 0

        // per-drag scratch state
        let pointerId: number | null = null
        let dragging = false
        let startClientX = 0
        let startClientY = 0
        let originX = 0
        let originY = 0
        let minX = -Infinity
        let maxX = Infinity
        let minY = -Infinity
        let maxY = Infinity

        const base = mode === 'center' ? 'translate(-50%, -50%) ' : ''
        const apply = () => {
            el.style.transform = `${base}translate(${x}px, ${y}px)`
        }

        const onPointerMove = (e: PointerEvent) => {
            if (e.pointerId !== pointerId) return
            const dx = e.clientX - startClientX
            const dy = e.clientY - startClientY

            if (!dragging) {
                if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return
                // promote to an actual drag
                dragging = true
                handleEl.style.cursor = 'grabbing'
                document.body.style.userSelect = 'none'
            }

            e.preventDefault()
            x = clamp(originX + dx, minX, maxX)
            y = clamp(originY + dy, minY, maxY)
            apply()
        }

        const endDrag = (e: PointerEvent) => {
            if (e.pointerId !== pointerId) return
            document.removeEventListener('pointermove', onPointerMove)
            document.removeEventListener('pointerup', endDrag)
            document.removeEventListener('pointercancel', endDrag)
            if (dragging) {
                document.body.style.userSelect = ''
                handleEl.style.cursor = 'grab'
            }
            pointerId = null
            dragging = false
        }

        const onPointerDown = (e: PointerEvent) => {
            if (e.button !== 0 || pointerId !== null) return
            // don't hijack clicks on interactive controls inside the handle
            const target = e.target as HTMLElement
            if (target.closest('button, a, input, textarea, select, [data-no-drag]')) return

            pointerId = e.pointerId
            dragging = false
            startClientX = e.clientX
            startClientY = e.clientY
            originX = x
            originY = y

            if (bounce && el.parentElement) {
                const rect = el.getBoundingClientRect()
                const parent = el.parentElement.getBoundingClientRect()
                minX = originX + (parent.left - rect.left)
                maxX = originX + (parent.right - rect.right)
                minY = originY + (parent.top - rect.top)
                maxY = originY + (parent.bottom - rect.bottom)
            } else {
                minX = minY = -Infinity
                maxX = maxY = Infinity
            }

            document.addEventListener('pointermove', onPointerMove)
            document.addEventListener('pointerup', endDrag)
            document.addEventListener('pointercancel', endDrag)
            // note: no preventDefault here, so click / dblclick still fire when there's no drag
        }

        // initial styles
        el.style.position = 'absolute'
        handleEl.style.cursor = 'grab'
        handleEl.style.touchAction = 'none'
        apply()

        handleEl.addEventListener('pointerdown', onPointerDown)

        cleanupMap.set(el, () => {
            handleEl.removeEventListener('pointerdown', onPointerDown)
            document.removeEventListener('pointermove', onPointerMove)
            document.removeEventListener('pointerup', endDrag)
            document.removeEventListener('pointercancel', endDrag)
            document.body.style.userSelect = ''
        })
    },

    unmounted(el: HTMLElement) {
        const cleanup = cleanupMap.get(el)
        if (cleanup) {
            cleanup()
            cleanupMap.delete(el)
        }
    },
}

export default Draggable
