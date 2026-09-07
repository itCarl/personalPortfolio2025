<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { Search } from 'lucide-vue-next'
import { appDefinitions, openAppWindow } from '@/data/apps'
import { gameDefinitions } from '@/games/registry'
import { useWindowManager } from '@/composables/useWindowManager'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits(['close'])

type PaletteEntry = { id: string; title: string; icon: unknown; group: 'Apps' | 'Games' }

const wm = useWindowManager()
const query = ref('')
const selected = ref(0)
const inputEl = ref<HTMLInputElement | null>(null)

// apps first, then games — the same order the groups render in
const entries = computed<PaletteEntry[]>(() => [
    ...appDefinitions.map(a => ({ id: a.id, title: a.title, icon: a.icon, group: 'Apps' as const })),
    ...gameDefinitions.map(g => ({ id: g.id, title: g.title, icon: g.icon, group: 'Games' as const })),
])

const results = computed(() => {
    const q = query.value.trim().toLowerCase()
    if (!q) return entries.value
    return entries.value.filter(
        e => e.title.toLowerCase().includes(q) || e.id.toLowerCase().includes(q),
    )
})

// grouped for rendering, each item carrying its index in `results` so arrow-key
// selection stays one flat list across the group headings
const groups = computed(() => {
    const out: { name: string; items: (PaletteEntry & { index: number })[] }[] = []
    results.value.forEach((entry, index) => {
        let group = out.find(g => g.name === entry.group)
        if (!group) {
            group = { name: entry.group, items: [] }
            out.push(group)
        }
        group.items.push({ ...entry, index })
    })
    return out
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

function openEntry(entry: PaletteEntry) {
    openAppWindow(wm, entry.id)
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
        const entry = results.value[selected.value]
        if (entry) openEntry(entry)
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
                        placeholder="Search apps and games…"
                        class="w-full bg-transparent py-3 text-ink outline-none placeholder:text-mute dark:text-foreground"
                    />
                    <kbd class="rounded bg-secondary px-1.5 py-0.5 text-xs text-mute">esc</kbd>
                </div>
                <ul class="max-h-72 overflow-auto p-2">
                    <template v-for="group in groups" :key="group.name">
                        <li class="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-mute">
                            {{ group.name }}
                        </li>
                        <li v-for="item in group.items" :key="item.id">
                            <button
                                class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors"
                                :class="item.index === selected ? 'bg-accent' : 'hover:bg-accent/60'"
                                @click="openEntry(item)"
                                @mousemove="selected = item.index"
                            >
                                <component :is="item.icon" :size="18" class="text-brand" />
                                <span class="text-ink dark:text-foreground">{{ item.title }}</span>
                            </button>
                        </li>
                    </template>
                    <li v-if="!results.length" class="px-3 py-6 text-center text-sm text-mute">
                        No apps found
                    </li>
                </ul>
            </div>
        </div>
    </teleport>
</template>
