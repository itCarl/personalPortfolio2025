import type { Directive, DirectiveBinding } from 'vue'

type BindingValue = boolean | { bounce?: boolean; mode?: 'center' | 'topleft' }

const cleanupMap = new WeakMap<HTMLElement, () => void>()

const Draggable: Directive<HTMLElement, BindingValue> = {
    mounted(el: HTMLElement, binding: DirectiveBinding<BindingValue>) {
        const raw = binding?.value
        const bounce = typeof raw === 'boolean' ? raw : (raw?.bounce ?? true)
        const explicitMode = typeof raw === 'object' && raw?.mode ? raw.mode : undefined

        const initialInlineTransform = el.style.transform || ''

        el.style.position = el.style.position || 'absolute'
        el.style.cursor = 'grab'
        el.style.transition = 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'

        let startX = 0, startY = 0
        let startCenterX = 0, startCenterY = 0
        let isDragging = false
        const DRAG_THRESHOLD = 4

        let parent: HTMLElement | null = null
        let parentRect: DOMRect | null = null
        let width = 0, height = 0
        let currentPointerId: number | null = null
        let hadOvershoot = false

        // grab offsets so element doesn't jump to cursor
        let grabOffsetX = 0
        let grabOffsetY = 0

        function preventSelection(on: boolean) {
            document.body.style.userSelect = on ? 'none' : ''
            document.body.style.webkitUserSelect = on ? 'none' : ''
        }

        function clamp(v: number, a: number, b: number) {
            return Math.max(a, Math.min(b, v))
        }

        function getClientCoords(e: PointerEvent | TouchEvent | MouseEvent) {
            if ('clientX' in e && typeof (e as PointerEvent).clientX === 'number') {
                return { x: (e as PointerEvent).clientX, y: (e as PointerEvent).clientY }
            }
            const t = (e as TouchEvent).touches?.[0] ?? (e as TouchEvent).changedTouches?.[0]
            return { x: t?.clientX ?? 0, y: t?.clientY ?? 0 }
        }

        // Prefer #desktop container; fallback to documentElement/body
        function refreshParentRect() {
            const desktopEl = document.getElementById('desktop')
            if (desktopEl instanceof HTMLElement) parent = desktopEl
            else if (document.documentElement instanceof HTMLElement) parent = document.documentElement
            else parent = document.body
            parentRect = parent.getBoundingClientRect()
        }

        function computeSizes() {
            const rect = el.getBoundingClientRect()
            width = rect.width; height = rect.height
        }

        function usesCenteringTransform(): boolean {
            if (explicitMode === 'center') return true
            if (explicitMode === 'topleft') return false
            return initialInlineTransform.includes('-50%')
        }

        function applyElasticTransform(oversX: number, oversY: number) {
            const resistance = 0.25
            const tx = Math.round(oversX * resistance)
            const ty = Math.round(oversY * resistance)
            el.style.transform = initialInlineTransform
                ? `${initialInlineTransform} translate(${tx}px, ${ty}px) scale(1.02)`
                : `translate(${tx}px, ${ty}px) scale(1.02)`
            hadOvershoot = Math.abs(tx) > 0 || Math.abs(ty) > 0
        }

        function clearElasticTransform(withBounce = true) {
            el.style.transition = withBounce
                ? 'transform 360ms cubic-bezier(0.22, 1, 0.36, 1)'
                : 'transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1)'
            if (withBounce) {
                el.style.transform = initialInlineTransform
                    ? `${initialInlineTransform} scale(1.03)`
                    : 'scale(1.03)'
                setTimeout(() => {
                    el.style.transition = 'transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1)'
                    el.style.transform = initialInlineTransform
                }, 220)
            } else {
                el.style.transform = initialInlineTransform
            }
            hadOvershoot = false
        }

        function clampCurrentPosition() {
            if (!parentRect) return
            computeSizes()
            const rect = el.getBoundingClientRect()
            const usesCenter = usesCenteringTransform()

            if (usesCenter) {
                const computedLeft = parseFloat(getComputedStyle(el).left)
                const currentCenterX = Number.isFinite(computedLeft) ? computedLeft : (rect.left - parentRect.left + width / 2)
                const computedTop = parseFloat(getComputedStyle(el).top)
                const currentCenterY = Number.isFinite(computedTop) ? computedTop : (rect.top - parentRect.top + height / 2)

                const minCX = width / 2
                const maxCX = Math.max(minCX, parentRect.width - width / 2)
                const minCY = height / 2
                const maxCY = Math.max(minCY, parentRect.height - height / 2)

                el.style.left = `${Math.round(clamp(currentCenterX, minCX, maxCX))}px`
                el.style.top = `${Math.round(clamp(currentCenterY, minCY, maxCY))}px`
            } else {
                const computedLeft = parseFloat(getComputedStyle(el).left)
                const currentLeft = Number.isFinite(computedLeft) ? computedLeft : (rect.left - parentRect.left)
                const computedTop = parseFloat(getComputedStyle(el).top)
                const currentTop = Number.isFinite(computedTop) ? computedTop : (rect.top - parentRect.top)

                const minL = 0
                const maxL = Math.max(0, parentRect.width - width)
                const minT = 0
                const maxT = Math.max(0, parentRect.height - height)

                el.style.left = `${Math.round(clamp(currentLeft, minL, maxL))}px`
                el.style.top = `${Math.round(clamp(currentTop, minT, maxT))}px`
            }
        }

        function onPointerDown(ev: PointerEvent) {
            if (ev.button !== undefined && ev.button !== 0 && ev.pointerType !== 'touch') return
            ev.preventDefault()

            refreshParentRect()
            const rect = el.getBoundingClientRect()
            computeSizes()

            const usesCenter = usesCenteringTransform()

            // compute centers / positions relative to parent
            startCenterX = rect.left - (parentRect?.left ?? 0) + width / 2
            startCenterY = rect.top - (parentRect?.top ?? 0) + height / 2

            const coords = getClientCoords(ev)
            const mouseRelX = coords.x - (parentRect?.left ?? 0)
            const mouseRelY = coords.y - (parentRect?.top ?? 0)

            // compute grab offset so element won't jump
            if (usesCenter) {
                // Bei center-mode: Offset relativ zum visuellen Zentrum
                const rect = el.getBoundingClientRect()
                const elementCenterX = rect.left + width / 2
                const elementCenterY = rect.top + height / 2

                grabOffsetX = coords.x - elementCenterX
                grabOffsetY = coords.y - elementCenterY
            } else {
                // Bei topleft-mode: Offset relativ zur oberen linken Ecke
                const computedLeft = parseFloat(getComputedStyle(el).left)
                const currentLeft = Number.isFinite(computedLeft) ? computedLeft : (rect.left - (parentRect?.left ?? 0))
                const computedTop = parseFloat(getComputedStyle(el).top)
                const currentTop = Number.isFinite(computedTop) ? computedTop : (rect.top - (parentRect?.top ?? 0))
                grabOffsetX = mouseRelX - currentLeft
                grabOffsetY = mouseRelY - currentTop
            }

            startX = mouseRelX
            startY = mouseRelY
            isDragging = false

            el.style.transition = 'none'
            el.style.transform = initialInlineTransform ? `${initialInlineTransform} scale(1)` : 'scale(1)'
            el.style.cursor = 'grabbing'
            preventSelection(true)

            currentPointerId = (ev.pointerId ?? null)
            try { (ev.target as Element).setPointerCapture?.(ev.pointerId) } catch {}

            document.addEventListener('pointermove', onPointerMove)
            document.addEventListener('pointerup', onPointerUp)
        }

        function onPointerMove(ev: PointerEvent) {
            if (currentPointerId != null && ev.pointerId !== undefined && ev.pointerId !== currentPointerId) return

            const coords = getClientCoords(ev)
            if (coords.x == null || coords.y == null) return
            if (!parentRect) refreshParentRect()
            if (!parentRect) return

            const mouseX = coords.x - parentRect.left
            const mouseY = coords.y - parentRect.top

            const dx = mouseX - startX
            const dy = mouseY - startY

            if (!isDragging && Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) {
                return
            }
            if (!isDragging) isDragging = true

            computeSizes()
            const usesCenter = usesCenteringTransform()

            if (usesCenter) {
                // Bei center-mode: Position basiert auf Mausposition minus Offset zum Zentrum
                const elementCenterX = coords.x - grabOffsetX - (parentRect?.left ?? 0)
                const elementCenterY = coords.y - grabOffsetY - (parentRect?.top ?? 0)

                const minCX = width / 2
                const maxCX = Math.max(minCX, parentRect.width - width / 2)
                const clampedCX = clamp(elementCenterX, minCX, maxCX)
                el.style.left = `${Math.round(clampedCX)}px`

                const minCY = height / 2
                const maxCY = Math.max(minCY, parentRect.height - height / 2)
                const clampedCY = clamp(elementCenterY, minCY, maxCY)
                el.style.top = `${Math.round(clampedCY)}px`

                const oversX = elementCenterX - clampedCX
                const oversY = elementCenterY - clampedCY
                if (bounce && (Math.abs(oversX) > 0 || Math.abs(oversY) > 0)) {
                    applyElasticTransform(oversX, oversY)
                } else {
                    el.style.transform = initialInlineTransform ? `${initialInlineTransform} scale(1)` : 'scale(1)'
                }
            } else {
                // desired top-left preserves grabOffset
                const desiredLeft = mouseX - grabOffsetX
                const desiredTop = mouseY - grabOffsetY

                const minL = 0
                const maxL = Math.max(0, parentRect.width - width)
                const clampedL = clamp(desiredLeft, minL, maxL)
                el.style.left = `${Math.round(clampedL)}px`

                const minT = 0
                const maxT = Math.max(0, parentRect.height - height)
                const clampedT = clamp(desiredTop, minT, maxT)
                el.style.top = `${Math.round(clampedT)}px`

                const oversX = desiredLeft - clampedL
                const oversY = desiredTop - clampedT
                if (bounce && (Math.abs(oversX) > 0 || Math.abs(oversY) > 0)) applyElasticTransform(oversX, oversY)
                else el.style.transform = initialInlineTransform ? `${initialInlineTransform} scale(1)` : 'scale(1)'
            }
        }

        function onPointerUp(ev: PointerEvent) {
            document.removeEventListener('pointermove', onPointerMove)
            document.removeEventListener('pointerup', onPointerUp)
            try { (ev.target as Element).releasePointerCapture?.(ev.pointerId) } catch {}

            preventSelection(false)
            el.style.cursor = 'grab'

            if (isDragging && bounce && hadOvershoot) clearElasticTransform(true)
            else if (isDragging && bounce) clearElasticTransform(true)
            else clearElasticTransform(false)

            isDragging = false
            currentPointerId = null
        }

        // ensure element starts inside parent bounds
        refreshParentRect()
        clampCurrentPosition()

        // keep inside on window resize
        const onWindowResize = () => {
            refreshParentRect()
            clampCurrentPosition()
        }
        window.addEventListener('resize', onWindowResize)

        el.addEventListener('pointerdown', onPointerDown, { passive: false })

        // store cleanup
        cleanupMap.set(el, () => {
            el.removeEventListener('pointerdown', onPointerDown)
            document.removeEventListener('pointermove', onPointerMove)
            document.removeEventListener('pointerup', onPointerUp)
            window.removeEventListener('resize', onWindowResize)
            cleanupMap.delete(el)
        })
    },

    beforeUnmount(el: HTMLElement) {
        const fn = cleanupMap.get(el)
        if (fn) fn()
    },
}

export default Draggable
