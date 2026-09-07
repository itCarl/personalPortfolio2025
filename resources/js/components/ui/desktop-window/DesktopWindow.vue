<script setup lang="ts">
import { ref, defineAsyncComponent, Suspense } from 'vue'

const props = withDefaults(defineProps<{
    title: string
    contentLoader?: () => Promise<any>
    minimized?: boolean
    z?: number
    width?: number
    height?: number
}>(), { minimized: false, z: 40, width: 640, height: 440 })

const emit = defineEmits(['close', 'minimize', 'request-focus'])

const fullscreen = ref(false)

const MIN_W = 280
const MIN_H = 160

// Size starts from the per-widget default; position centers with a small cascade
// so stacked windows don't perfectly overlap.
const width = ref(props.width)
const height = ref(props.height)
const cascade = (props.z % 6) * 28
const left = ref(Math.max(16, window.innerWidth / 2 - props.width / 2) + cascade)
const top = ref(Math.max(16, window.innerHeight / 2 - props.height / 2) + cascade)

const isResizing = ref(false)

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
    <teleport to="body">
        <div
            v-draggable="{ bounce: true, mode: 'topleft', handle: 'header' }"
            @mousedown="requestFocus"
            :style="{
                position: fullscreen ? 'fixed' : 'absolute',
                left: fullscreen ? '0' : `${left}px`,
                top: fullscreen ? '0' : `${top}px`,
                width: fullscreen ? '100%' : `${width}px`,
                height: fullscreen ? '100%' : `${height}px`,
                minHeight: '120px',
                zIndex: fullscreen ? 9999 : props.z,
                display: minimized ? 'none' : undefined
            }"
            class="bg-card border-2 border-ink dark:border-white/80 shadow-sticker rounded-md overflow-hidden select-text"
        >
            <header
                class="flex items-center justify-between px-3 py-2 bg-secondary border-b border-hairline"
            >
                <div class="flex items-center gap-2">
                    <div class="w-2.5 h-2.5 bg-brand rounded-full"></div>
                    <div class="w-2.5 h-2.5 bg-pastel-green rounded-full"></div>
                    <div class="w-2.5 h-2.5 bg-pastel-red rounded-full"></div>
                    <div class="ml-3 font-semibold text-sm text-foreground">{{ title }}</div>
                </div>

                <div class="flex items-center gap-1">
                    <button @click="toggleMinimize" class="press px-2 py-1 rounded hover:bg-accent" title="Minimize">—</button>
                    <button @click="toggleFullscreen" class="press px-2 py-1 rounded hover:bg-accent" title="Fullscreen">▢</button>
                    <button @click="closeWindow" class="press px-2 py-1 rounded hover:bg-pastel-red hover:text-white" title="Close">✕</button>
                </div>
            </header>

            <!-- kept mounted while minimized so window content state is preserved -->
            <main class="bg-card text-body dark:text-foreground h-full overflow-auto relative">
                <Suspense>
                    <template #default>
                        <component :is="AsyncContent" />
                    </template>
                    <template #fallback>
                        <div class="p-6 text-center text-sm text-gray-500 dark:text-gray-400">Loading…</div>
                    </template>
                </Suspense>
            </main>

            <!-- Resize handles: 4 edges + 4 corners -->
            <template v-if="!fullscreen">
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
