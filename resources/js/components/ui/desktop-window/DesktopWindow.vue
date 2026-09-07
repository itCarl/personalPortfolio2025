<script setup lang="ts">
import { ref, computed, defineAsyncComponent, Suspense, type CSSProperties } from 'vue'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/composables/useIsMobile'

const props = withDefaults(defineProps<{
    title: string
    contentLoader?: () => Promise<any>
    contentProps?: Record<string, unknown>
    minimized?: boolean
    /** mobile only: whether this is the top-most non-minimized window */
    active?: boolean
    z?: number
    width?: number
    height?: number
}>(), { minimized: false, active: true, z: 40, width: 640, height: 440 })

const emit = defineEmits(['close', 'minimize', 'request-focus'])

const fullscreen = ref(false)
const isMobile = useIsMobile()

const MIN_W = 360
const MIN_H = 240

// Size starts from the per-widget default, clamped to the minimums so a too-small
// default can never bypass them; position centers with a small cascade so stacked
// windows don't perfectly overlap.
const width = ref(Math.max(MIN_W, props.width))
const height = ref(Math.max(MIN_H, props.height))
const cascade = (props.z % 6) * 28
const left = ref(Math.max(16, window.innerWidth / 2 - width.value / 2) + cascade)
const top = ref(Math.max(16, window.innerHeight / 2 - height.value / 2) + cascade)

const isResizing = ref(false)

// Desktop: free-floating, cascaded, resizable box. Mobile: the window fills the
// desktop area, and only the top-most non-minimized one is visible (the rest stay
// mounted, so their content keeps its state — same trick as `minimized`).
const windowStyle = computed<CSSProperties>(() => {
    if (isMobile.value) {
        return {
            position: 'absolute',
            inset: '0',
            width: '100%',
            height: '100%',
            zIndex: props.z,
            display: props.minimized || !props.active ? 'none' : undefined,
        }
    }
    return {
        position: fullscreen.value ? 'fixed' : 'absolute',
        left: fullscreen.value ? '0' : `${left.value}px`,
        top: fullscreen.value ? '0' : `${top.value}px`,
        width: fullscreen.value ? '100%' : `${width.value}px`,
        height: fullscreen.value ? '100%' : `${height.value}px`,
        minHeight: '120px',
        zIndex: fullscreen.value ? 9999 : props.z,
        display: props.minimized ? 'none' : undefined,
    }
})

const AsyncContent = props.contentLoader
    ? defineAsyncComponent(props.contentLoader)
    : defineAsyncComponent(() => Promise.resolve({
        template: `<div class="p-4 text-sm">No content provided for "{{ title }}"</div>`
    }))

function toggleMinimize() {
    emit('minimize')
}

function toggleFullscreen() {
    fullscreen.value = !fullscreen.value
}

function closeWindow() {
    emit('close')
}

function requestFocus() {
    emit('request-focus')
}

type ResizeDir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

// Resize from any edge/corner; the opposite edge stays anchored, like a real OS window.
function startResize(e: MouseEvent, dir: ResizeDir) {
    e.preventDefault()
    e.stopPropagation()
    requestFocus()
    isResizing.value = true
    document.body.style.userSelect = 'none'

    const startX = e.clientX
    const startY = e.clientY
    const startLeft = left.value
    const startTop = top.value
    const startWidth = width.value
    const startHeight = height.value

    function onMove(ev: MouseEvent) {
        const dx = ev.clientX - startX
        const dy = ev.clientY - startY

        if (dir.includes('e')) {
            width.value = Math.max(MIN_W, startWidth + dx)
        }
        if (dir.includes('s')) {
            height.value = Math.max(MIN_H, startHeight + dy)
        }
        if (dir.includes('w')) {
            const proposed = startWidth - dx
            if (proposed >= MIN_W) {
                width.value = proposed
                left.value = startLeft + dx
            } else {
                width.value = MIN_W
                left.value = startLeft + (startWidth - MIN_W)
            }
        }
        if (dir.includes('n')) {
            const proposed = startHeight - dy
            if (proposed >= MIN_H) {
                height.value = proposed
                top.value = startTop + dy
            } else {
                height.value = MIN_H
                top.value = startTop + (startHeight - MIN_H)
            }
        }
    }

    function onUp() {
        isResizing.value = false
        document.body.style.userSelect = ''
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
}
</script>

<template>
    <!-- disabled on mobile: the window then renders in place, inside #desktop -->
    <teleport to="body" :disabled="isMobile">
        <div
            v-draggable="isMobile ? false : { bounce: true, mode: 'topleft', handle: 'header' }"
            @mousedown="requestFocus"
            :style="windowStyle"
            :class="cn(
                'bg-card border-2 border-ink dark:border-white/80 shadow-sticker rounded-md overflow-hidden select-text',
                isMobile && 'flex flex-col',
            )"
        >
            <!-- `desktop-window-titlebar` is the hook the cursor sets in app.css use -->
            <header
                class="desktop-window-titlebar flex items-center justify-between px-3 py-2 bg-secondary border-b border-hairline"
            >
                <div class="flex items-center gap-2">
                    <div class="w-2.5 h-2.5 bg-brand rounded-full"></div>
                    <div class="w-2.5 h-2.5 bg-pastel-green rounded-full"></div>
                    <div class="w-2.5 h-2.5 bg-pastel-red rounded-full"></div>
                    <div class="ml-3 font-semibold text-sm text-foreground">{{ title }}</div>
                </div>

                <div class="flex items-center gap-1">
                    <button @click="toggleMinimize" class="press px-2 py-1 rounded hover:bg-accent" title="Minimize">—</button>
                    <button v-if="!isMobile" @click="toggleFullscreen" class="press px-2 py-1 rounded hover:bg-accent" title="Fullscreen">▢</button>
                    <button @click="closeWindow" class="press px-2 py-1 rounded hover:bg-pastel-red hover:text-white" title="Close">✕</button>
                </div>
            </header>

            <!-- kept mounted while minimized so window content state is preserved -->
            <main :class="cn(
                'bg-card text-body dark:text-foreground overflow-auto relative',
                isMobile ? 'flex-1 min-h-0' : 'h-full',
            )">
                <Suspense>
                    <template #default>
                        <component :is="AsyncContent" v-bind="contentProps" />
                    </template>
                    <template #fallback>
                        <div class="p-6 text-center text-sm text-gray-500 dark:text-gray-400">Loading…</div>
                    </template>
                </Suspense>
            </main>

            <!-- Resize handles: 4 edges + 4 corners -->
            <template v-if="!fullscreen && !isMobile">
                <div @mousedown="startResize($event, 'n')" class="absolute top-0 inset-x-0 h-1.5 cursor-n-resize select-none z-20"></div>
                <div @mousedown="startResize($event, 's')" class="absolute bottom-0 inset-x-0 h-1.5 cursor-s-resize select-none z-20"></div>
                <div @mousedown="startResize($event, 'w')" class="absolute inset-y-0 left-0 w-1.5 cursor-w-resize select-none z-20"></div>
                <div @mousedown="startResize($event, 'e')" class="absolute inset-y-0 right-0 w-1.5 cursor-e-resize select-none z-20"></div>

                <div @mousedown="startResize($event, 'nw')" class="absolute top-0 left-0 w-3 h-3 cursor-nw-resize select-none z-30"></div>
                <div @mousedown="startResize($event, 'ne')" class="absolute top-0 right-0 w-3 h-3 cursor-ne-resize select-none z-30"></div>
                <div @mousedown="startResize($event, 'sw')" class="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize select-none z-30"></div>

                <!-- SE corner with a visible grip -->
                <div
                    @mousedown="startResize($event, 'se')"
                    class="absolute bottom-0 right-0 w-4 h-4 p-0.5 cursor-se-resize select-none z-30 text-mute hover:text-brand transition-colors"
                    title="Drag to resize"
                >
                    <svg class="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                        <line x1="21" y1="9" x2="9" y2="21"></line>
                        <line x1="21" y1="15" x2="15" y2="21"></line>
                    </svg>
                </div>
            </template>
        </div>
    </teleport>
</template>
