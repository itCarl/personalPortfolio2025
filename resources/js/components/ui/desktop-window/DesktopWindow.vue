<script setup lang="ts">
import { ref, defineAsyncComponent, Suspense } from 'vue'

const props = defineProps<{
    title: string
    contentLoader?: () => Promise<any>
}>()

const emit = defineEmits(['close'])

const minimized = ref(false)
const fullscreen = ref(false)

// Position and size
const left = ref(window.innerWidth / 2 - 384) // initial center
const top = ref(window.innerHeight / 2 - 200)
const width = ref(768)
const height = ref(400)

const isResizing = ref(false)

const AsyncContent = props.contentLoader
    ? defineAsyncComponent(props.contentLoader)
    : defineAsyncComponent(() => Promise.resolve({
        template: `<div class="p-4 text-sm">No content provided for "{{ title }}"</div>`
    }))

function toggleMinimize() {
    minimized.value = !minimized.value
}

function toggleFullscreen() {
    fullscreen.value = !fullscreen.value
}

function closeWindow() {
    emit('close')
}

// ✅ Resize behavior: keeps top-left corner fixed
function startResize(e: MouseEvent) {
    e.preventDefault()
    isResizing.value = true
    const startX = e.clientX
    const startY = e.clientY
    const startWidth = width.value
    const startHeight = height.value

    function handleMouseMove(moveEvent: MouseEvent) {
        if (!isResizing.value) return
        const deltaX = moveEvent.clientX - startX
        const deltaY = moveEvent.clientY - startY
        width.value = Math.max(300, startWidth + deltaX)
        height.value = Math.max(120, startHeight + deltaY)
    }

    function handleMouseUp() {
        isResizing.value = false
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
}
</script>

<template>
    <teleport to="body">
        <div
            v-draggable="{ bounce: false, mode: 'topleft', handle: 'header' }"
            :style="{
                position: fullscreen ? 'fixed' : 'absolute',
                left: fullscreen ? '0' : `${left}px`,
                top: fullscreen ? '0' : `${top}px`,
                width: fullscreen ? '100%' : `${width}px`,
                height: fullscreen ? '100%' : `${height}px`,
                minHeight: '120px',
                zIndex: fullscreen ? 50 : 40
            }"
            class="bg-white dark:bg-gray-900 border shadow-lg rounded-md overflow-hidden select-text"
        >
            <header
                class="flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-gray-800 border-b"
            >
                <div class="flex items-center gap-2">
                    <div class="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                    <div class="w-2 h-2 bg-red-400 rounded-full"></div>
                    <div class="ml-3 font-medium text-sm text-gray-800 dark:text-gray-100">{{ title }}</div>
                </div>

                <div class="flex items-center gap-2">
                    <button @click="toggleMinimize" class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700" title="Minimize">—</button>
                    <button @click="toggleFullscreen" class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700" title="Fullscreen">▢</button>
                    <button @click="closeWindow" class="px-2 py-1 rounded hover:bg-red-600 hover:text-white" title="Close">✕</button>
                </div>
            </header>

            <transition name="fade">
                <main v-if="!minimized" class="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 h-full overflow-auto relative">
                    <Suspense>
                        <template #default>
                            <component :is="AsyncContent" />
                        </template>
                        <template #fallback>
                            <div class="p-6 text-center text-sm text-gray-500 dark:text-gray-400">Loading…</div>
                        </template>
                    </Suspense>
                </main>
            </transition>

            <!-- Resize handle -->
            <div
                v-if="!fullscreen"
                @mousedown="startResize"
                class="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize select-none text-background hover:text-gray-400 dark:hover:text-gray-500 transition-colors"
                title="Drag to resize"
            >
                <svg class="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <line x1="6" y1="18" x2="18" y2="6"></line>
                </svg>
            </div>
        </div>
    </teleport>
</template>
