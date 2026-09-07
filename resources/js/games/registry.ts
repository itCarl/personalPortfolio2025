import { defineComponent, h, type Component } from 'vue'
import { Bomb, Club, Grid2x2, Images, Rocket, Worm } from 'lucide-vue-next'
import type { Scoring } from './useHighscores'

/**
 * Placeholder loader used until a game's own component exists. Wrapping the
 * shared ComingSoon panel keeps the game title bound here instead of leaking a
 * stray `title` prop into the real components later.
 */
const comingSoon =
    (title: string): (() => Promise<Component>) =>
    () =>
        import('./ComingSoon.vue').then(m =>
            defineComponent({ name: 'ComingSoonGame', setup: () => () => h(m.default, { title }) }),
        )

export type GameDefinition = {
    id: string
    title: string
    icon: Component
    loader: () => Promise<Component>
    width: number
    height: number
    /** whether the game has usable touch controls (all six are meant to) */
    touch: boolean
    scoring: Scoring
}

/**
 * Every game's window shape and scoring in one place. `findApp()` in
 * `@/data/apps` folds these into the app id space, so a game opens through the
 * same window manager call as an app.
 *
 * Loaders currently point at the shared "Coming soon" placeholder; each game's
 * own task swaps in its component (`() => import('./snake/Snake.vue')`).
 */
export const gameDefinitions: GameDefinition[] = [
    {
        id: 'minesweeper',
        title: 'Minesweeper',
        icon: Bomb,
        loader: comingSoon('Minesweeper'),
        width: 420,
        height: 520,
        touch: true,
        scoring: 'time',
    },
    {
        id: 'game2048',
        title: '2048',
        icon: Grid2x2,
        loader: comingSoon('2048'),
        width: 420,
        height: 540,
        touch: true,
        scoring: 'high',
    },
    {
        id: 'snake',
        title: 'Snake',
        icon: Worm,
        loader: comingSoon('Snake'),
        width: 480,
        height: 560,
        touch: true,
        scoring: 'high',
    },
    {
        id: 'memory',
        title: 'Memory',
        icon: Images,
        loader: comingSoon('Memory'),
        width: 520,
        height: 600,
        touch: true,
        scoring: 'moves',
    },
    {
        id: 'solitaire',
        title: 'Solitaire',
        icon: Club,
        loader: comingSoon('Solitaire'),
        width: 720,
        height: 560,
        touch: true,
        scoring: 'moves',
    },
    {
        id: 'pinball',
        title: 'Pinball',
        icon: Rocket,
        loader: comingSoon('Pinball'),
        width: 460,
        height: 760,
        touch: true,
        scoring: 'high',
    },
]

export const findGame = (id: string) => gameDefinitions.find(g => g.id === id)

/**
 * Storage key for a game's default high-score board. Games with variants keep one
 * board per variant, so the folder tile has to ask for the same suffix the game writes.
 */
export function defaultScoreKey(id: string) {
    if (id === 'minesweeper') return 'minesweeper:beginner'
    if (id === 'memory') return 'memory:4x4'
    return id
}
