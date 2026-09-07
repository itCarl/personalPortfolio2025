<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { Search } from 'lucide-vue-next'
import { appDefinitions } from '@/data/apps'
import { useWindowManager } from '@/composables/useWindowManager'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits(['close'])

const wm = useWindowManager()
const query = ref('')
const selected = ref(0)
const inputEl = ref<HTMLInputElement | null>(null)

const results = computed(() => {
    const q = query.value.trim().toLowerCase()
    if (!q) return appDefinitions
    return appDefinitions.filter(
        a => a.title.toLowerCase().includes(q) || a.id.toLowerCase().includes(q),
    )
})

watch(() => props.open, async (isOpen) => {
    if (isOpen) {
        query.value = ''
        selected.value = 0
        await nextTick()
        inputEl.value?.focus()
    }
})

watch(results, () => {
    selected.value = 0
})

function close() {
    emit('close')
}

function openApp(app: (typeof appDefinitions)[number]) {
    wm.openWindow({
        id: app.id,
        title: app.title,
        contentLoader: app.contentLoader,
        width: app.width,
        height: app.height,
    })
    close()
}

function onKeydown(e: KeyboardEvent) {
    const count = results.value.length
    if (e.key === 'ArrowDown') {
        e.preventDefault()
        selected.value = count ? (selected.value + 1) % count : 0
    } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        selected.value = count ? (selected.value - 1 + count) % count : 0
    } else if (e.key === 'Enter') {
        e.preventDefault()
        const app = results.value[selected.value]
        if (app) openApp(app)
    } else if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        close()
    }
}
</script>

<template>
    <teleport to="body">
        <div
            v-if="open"
            class="fixed inset-0 z-[10000] flex items-start justify-center bg-black/30 pt-[15vh]"
            @mousedown.self="close"
        >
            <div
                class="w-full max-w-lg overflow-hidden rounded-md border-2 border-ink bg-card shadow-sticker dark:border-white/80"
                @keydown="onKeydown"
            >
                <div class="flex items-center gap-2 border-b border-hairline px-3">
                    <Search :size="18" class="text-mute" />
                    <input
                        ref="inputEl"
                        v-model="query"
                        type="text"
                        placeholder="Search apps…"
                        class="w-full bg-transparent py-3 text-ink outline-none placeholder:text-mute dark:text-foreground"
                    />
                    <kbd class="rounded bg-secondary px-1.5 py-0.5 text-xs text-mute">esc</kbd>
                </div>
                <ul class="max-h-72 overflow-auto p-2">
                    <li v-for="(app, i) in results" :key="app.id">
                        <button
                            class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors"
                            :class="i === selected ? 'bg-accent' : 'hover:bg-accent/60'"
                            @click="openApp(app)"
                            @mousemove="selected = i"
                        >
                            <component :is="app.icon" :size="18" class="text-brand" />
                            <span class="text-ink dark:text-foreground">{{ app.title }}</span>
                        </button>
                    </li>
                    <li v-if="!results.length" class="px-3 py-6 text-center text-sm text-mute">
                        No apps found
                    </li>
                </ul>
            </div>
        </div>
    </teleport>
</template>
