<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { CircleHelp, Pause, Play, RotateCcw, Trophy } from 'lucide-vue-next'
import { useHighscores, type Scoring } from './useHighscores'

const props = withDefaults(
    defineProps<{
        /** high-score storage key — a registry id, or an id plus variant like `minesweeper:beginner` */
        gameId: string
        scoring: Scoring
        /** rendered as `key: value` pills in the status bar (score, time, mines left, …) */
        status?: Record<string, string | number>
        paused?: boolean
        helpText: string
        /** a cheat was used in the running game: scores don't count until a new game */
        cheated?: boolean
    }>(),
    { status: () => ({}), paused: false, cheated: false },
)

const emit = defineEmits<{ (e: 'new-game'): void; (e: 'toggle-pause'): void }>()

const { entries, refresh } = useHighscores(props.gameId, props.scoring)
const panel = ref<'scores' | 'help' | null>(null)

// the board is written by the game's own store instance, so re-read it whenever
// the panel opens or the shell is pointed at a different board (a difficulty switch)
function togglePanel(which: 'scores' | 'help') {
    panel.value = panel.value === which ? null : which
    if (panel.value === 'scores') refresh()
}
watch(() => props.gameId, refresh)

const statusPills = computed(() => Object.entries(props.status))

function formatValue(value: number) {
    if (props.scoring !== 'time') return value.toLocaleString('en-GB')
    const minutes = Math.floor(value / 60)
    const seconds = Math.floor(value % 60)
    return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function formatDate(iso: string) {
    const d = new Date(iso)
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-GB')
}
</script>

<template>
    <div class="flex h-full min-h-0 flex-col bg-card">
        <!-- toolbar -->
        <div class="flex flex-wrap items-center gap-2 border-b border-hairline px-3 py-2">
            <button
                class="press flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1 text-sm font-medium text-primary-foreground"
                @click="emit('new-game')"
            >
                <RotateCcw :size="15" />
                New game
            </button>
            <button
                class="press flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1 text-sm text-ink dark:text-foreground"
                @click="emit('toggle-pause')"
            >
                <component :is="paused ? Play : Pause" :size="15" />
                {{ paused ? 'Resume' : 'Pause' }}
            </button>
            <button
                class="press flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1 text-sm text-ink dark:text-foreground"
                :class="panel === 'scores' ? 'ring-2 ring-brand' : ''"
                @click="togglePanel('scores')"
            >
                <Trophy :size="15" />
                Scores
            </button>
            <button
                class="press flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1 text-sm text-ink dark:text-foreground"
                :class="panel === 'help' ? 'ring-2 ring-brand' : ''"
                @click="togglePanel('help')"
            >
                <CircleHelp :size="15" />
                Help
            </button>

            <div class="ml-auto flex items-center gap-2">
                <slot name="controls" />
            </div>
        </div>

        <!-- status bar -->
        <div
            v-if="statusPills.length || cheated"
            class="flex flex-wrap items-center gap-2 border-b border-hairline px-3 py-1.5 text-xs"
        >
            <span
                v-for="[key, value] in statusPills"
                :key="key"
                class="rounded-full bg-secondary px-2 py-0.5 text-mute"
            >
                {{ key }}: <span class="font-semibold text-ink dark:text-foreground">{{ value }}</span>
            </span>
            <span
                v-if="cheated"
                class="rounded-full bg-pastel-red-soft px-2 py-0.5 font-semibold text-pastel-red"
                title="High scores are not recorded while cheats are on"
            >
                cheats on
            </span>
        </div>

        <!-- play area + panels -->
        <div class="relative min-h-0 flex-1 overflow-auto">
            <slot />

            <div
                v-if="paused"
                class="absolute inset-0 z-20 flex items-center justify-center bg-background/70 text-lg font-semibold text-ink dark:text-foreground"
            >
                Paused
            </div>

            <aside
                v-if="panel === 'scores'"
                class="absolute inset-y-0 right-0 z-30 w-56 overflow-auto border-l border-hairline bg-card p-3"
            >
                <h3 class="mb-2 text-sm font-semibold text-ink dark:text-foreground">High scores</h3>
                <ol v-if="entries.length" class="space-y-1 text-xs">
                    <li
                        v-for="(entry, i) in entries"
                        :key="`${entry.date}-${i}`"
                        class="flex items-baseline justify-between gap-2"
                    >
                        <span class="text-mute">{{ i + 1 }}.</span>
                        <span class="font-semibold text-ink dark:text-foreground">
                            {{ formatValue(entry.value) }}
                        </span>
                        <span class="text-mute">{{ entry.label ?? formatDate(entry.date) }}</span>
                    </li>
                </ol>
                <p v-else class="text-xs text-mute">No scores yet.</p>
            </aside>

            <aside
                v-if="panel === 'help'"
                class="absolute inset-y-0 right-0 z-30 w-56 overflow-auto border-l border-hairline bg-card p-3"
            >
                <h3 class="mb-2 text-sm font-semibold text-ink dark:text-foreground">How to play</h3>
                <p class="whitespace-pre-line text-xs text-mute">{{ helpText }}</p>
                <p class="mt-3 text-xs italic text-mute">There are secrets here.</p>
            </aside>
        </div>
    </div>
</template>
