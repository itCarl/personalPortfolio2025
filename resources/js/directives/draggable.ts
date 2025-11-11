import type { Directive, DirectiveBinding } from 'vue'

type BindingValue = boolean | { bounce?: boolean; mode?: 'center' | 'topleft'; handle?: string }

const cleanupMap = new WeakMap<HTMLElement, () => void>()

const Draggable: Directive<HTMLElement, BindingValue> = {
    mounted(el: HTMLElement, binding: DirectiveBinding<BindingValue>) {
        if (binding.value === false) return

        const options = typeof binding.value === 'object' ? binding.value : {}
        const handleSelector = options.handle || 'header'
        const handleEl = el.querySelector(handleSelector) as HTMLElement ?? el;

        if (!handleEl) return console.warn(`Draggable: handle element '${handleSelector}' not found`)

        let isDragging = false
        let startX = 0
        let startY = 0
        let lastX = 0
        let lastY = 0

        const onMouseDown = (e: MouseEvent) => {
            // only start drag if mousedown on handle
            if (e.button !== 0) return
            isDragging = true
            startX = e.clientX - lastX
            startY = e.clientY - lastY
            handleEl.style.cursor = 'grabbing'
        }

        const onMouseMove = (e: MouseEvent) => {
            if (!isDragging) return
            e.preventDefault()

            const newX = e.clientX - startX
            const newY = e.clientY - startY

            if (options.bounce && el.parentElement) {
                const rect = el.getBoundingClientRect()
                const parentRect = el.parentElement.getBoundingClientRect()

                if (newX < 0 || newX + rect.width > parentRect.width) return
                if (newY < 0 || newY + rect.height > parentRect.height) return
            }

            lastX = newX
            lastY = newY

            if (options.mode === 'center') {
                el.style.transform = `translate(-50%, -50%) translate(${newX}px, ${newY}px)`
            } else {
                el.style.transform = `translate(${newX}px, ${newY}px)`
            }
        }

        const onMouseUp = () => {
            isDragging = false
            handleEl.style.cursor = 'grab'
        }

        // Initial styles
        handleEl.style.cursor = 'grab'
        // el.style.touchAction = 'none'
        // el.style.userSelect = 'none'
        el.style.position = 'absolute'

        if (options.mode === 'center') {
            el.style.left = '50%'
            el.style.top = '50%'
            el.style.transform = 'translate(-50%, -50%)'
        }

        handleEl.addEventListener('mousedown', onMouseDown)
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)

        const cleanup = () => {
            handleEl.removeEventListener('mousedown', onMouseDown)
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
        }

        cleanupMap.set(el, cleanup)
    },

    unmounted(el: HTMLElement) {
        const cleanup = cleanupMap.get(el)
        if (cleanup) {
            cleanup()
            cleanupMap.delete(el)
        }
    }
}

export default Draggable
