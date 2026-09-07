<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { KeyRound } from 'lucide-vue-next'
import { defaultScoreKey, findGame, gameDefinitions } from '@/games/registry'
import { createHighscoreStore, type Scoring } from '@/games/useHighscores'
import { useSecrets } from '@/games/useCheatCodes'
import { useWindowContext } from '@/games/useWindowContext'
import { SECRET_SCOPES, secrets } from '@/games/secrets'
import { openAppWindow } from '@/data/apps'
import { useWindowManager } from '@/composables/useWindowManager'
import { useIsMobile } from '@/composables/useIsMobile'

const wm = useWindowManager()
const isMobile = useIsMobile()
const { found, isFound, unlock } = useSecrets()
const { focused } = useWindowContext()

const showSecrets = ref(false)

// localStorage isn't reactive, so the tiles re-read their board whenever the
// folder comes back to the front (i.e. after a game window wrote a new score)
const scoreVersion = ref(0)
watch(focused, isFocused => {
    if (isFocused) scoreVersion.value++
})

function formatBest(value: number | null, scoring: Scoring) {
    if (value === null) return '—'
    if (scoring !== 'time') return value.toLocaleString('en-GB')
    const minutes = Math.floor(value / 60)
    const seconds = Math.floor(value % 60)
    return `${minutes}:${String(seconds).padStart(2, '0')}`
}

const tiles = computed(() => {
    void scoreVersion.value
    return gameDefinitions.map(game => ({
        ...game,
        best: formatBest(
            createHighscoreStore(defaultScoreKey(game.id), game.scoring).best(),
            game.scoring,
        ),
    }))
})

// tap on touch, double-click on the desktop — same idiom as the desktop icons
function open(id: string) {
    openAppWindow(wm, id)
}

const groupedSecrets = computed(() => {
    const out: { name: string; items: typeof secrets }[] = []
    for (const secret of secrets) {
        const name = SECRET_SCOPES[secret.game] ?? findGame(secret.game)?.title ?? secret.game
        let group = out.find(g => g.name === name)
        if (!group) {
            group = { name, items: [] }
            out.push(group)
        }
        group.items.push(secret)
    }
    return out
})

function foundAt(id: string) {
    const entry = found.value.find(f => f.id === id)
    if (!entry) return ''
    const d = new Date(entry.foundAt)
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-GB')
}

// clicking the heading seven times inside three seconds spins every icon once
const SPIN_CLICKS = 7
const SPIN_WINDOW = 3000
const spinning = ref(false)
let clicks: number[] = []

function onTitleClick() {
    const now = Date.now()
    clicks = [...clicks, now].filter(t => now - t < SPIN_WINDOW)
    if (clicks.length < SPIN_CLICKS) return
    clicks = []
    spinning.value = true
    unlock('games-spin')
    window.setTimeout(() => (spinning.value = false), 600)
}
</script>

<template>
    <div class="flex h-full min-h-0 flex-col bg-card">
        <div class="flex items-center justify-between border-b border-hairline px-4 py-2">
            <h2
                class="cursor-default select-none text-sm font-semibold text-ink dark:text-foreground"
                @click="onTitleClick"
            >
                Games
            </h2>
            <button
                class="press flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1 text-xs text-ink dark:text-foreground"
                :class="showSecrets ? 'ring-2 ring-brand' : ''"
                :aria-pressed="showSecrets"
                @click="showSecrets = !showSecrets"
            >
                <KeyRound :size="14" />
                Secrets
                <span class="text-mute">{{ found.length }}/{{ secrets.length }}</span>
            </button>
        </div>

        <div class="min-h-0 flex-1 overflow-auto">
            <ul v-if="!showSecrets" class="grid list-none grid-cols-3 gap-4 p-6">
                <li v-for="game in tiles" :key="game.id">
                    <button
                        class="press flex w-full flex-col items-center gap-1.5 rounded-md border border-hairline bg-secondary p-3 text-center"
                        :title="`Open ${game.title}`"
                        @click="isMobile && open(game.id)"
                        @dblclick="!isMobile && open(game.id)"
                    >
                        <component
                            :is="game.icon"
                            :size="40"
                            class="text-brand"
                            :class="spinning ? 'games-spin' : ''"
                        />
                        <span class="text-sm font-medium text-ink dark:text-foreground">
                            {{ game.title }}
                        </span>
                        <span class="text-xs text-mute">Best: {{ game.best }}</span>
                    </button>
                </li>
            </ul>

            <div v-else class="space-y-4 p-6">
                <p class="text-xs text-mute">
                    Every game hides at least one. Found ones show their name; the rest only give a hint.
                </p>
                <section v-for="group in groupedSecrets" :key="group.name">
                    <h3 class="mb-1.5 text-xs font-semibold uppercase tracking-wide text-mute">
                        {{ group.name }}
                    </h3>
                    <ul class="space-y-1.5">
                        <li
                            v-for="secret in group.items"
                            :key="secret.id"
                            class="rounded-md border border-hairline px-3 py-2 text-xs"
                            :class="isFound(secret.id) ? 'bg-pastel-green-soft' : 'bg-secondary'"
                        >
                            <template v-if="isFound(secret.id)">
                                <span class="font-semibold text-ink dark:text-foreground">
                                    {{ secret.name }}
                                </span>
                                <span class="text-mute"> — found {{ foundAt(secret.id) }}</span>
                            </template>
                            <template v-else>
                                <span class="font-semibold text-ink dark:text-foreground">???</span>
                                <span class="text-mute"> — {{ secret.hint }}</span>
                            </template>
                        </li>
                    </ul>
                </section>
            </div>
        </div>
    </div>
</template>

<style scoped>
.games-spin {
    animation: games-spin 600ms ease-in-out 1;
}

@keyframes games-spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

@media (prefers-reduced-motion: reduce) {
    .games-spin {
        animation: none;
    }
}
</style>
