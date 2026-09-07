import { computed, ref } from 'vue'

export type Scoring = 'high' | 'time' | 'moves'
export type HighscoreEntry = { value: number; date: string; label?: string }

const MAX_ENTRIES = 10
const KEY_PREFIX = 'portfolio-os:highscores:'

/**
 * Framework-free store so it can be unit-tested with an injected Storage.
 *
 * `gameId` is the storage key suffix, not necessarily a registry id — games with
 * difficulties/sizes keep one board per variant (e.g. `minesweeper:beginner`).
 */
export function createHighscoreStore(
    gameId: string,
    scoring: Scoring,
    storage: Storage | null = defaultStorage(),
) {
    const key = KEY_PREFIX + gameId
    // "high" wants the largest value first, "time"/"moves" the smallest.
    const better = (a: number, b: number) => (scoring === 'high' ? a > b : a < b)

    function read(): HighscoreEntry[] {
        try {
            const raw = storage?.getItem(key)
            const parsed = raw ? (JSON.parse(raw) as unknown) : []
            return Array.isArray(parsed) ? parsed.filter(isEntry) : []
        } catch {
            // corrupt JSON or unavailable storage — start from an empty board
            return []
        }
    }

    function write(entries: HighscoreEntry[]) {
        try {
            storage?.setItem(key, JSON.stringify(entries))
        } catch {
            // private mode / quota — high scores are a nicety, never a hard failure
        }
    }

    function sort(entries: HighscoreEntry[]) {
        return [...entries].sort((a, b) =>
            better(a.value, b.value) ? -1 : better(b.value, a.value) ? 1 : 0,
        )
    }

    return {
        entries: () => sort(read()),
        best: (): number | null => sort(read())[0]?.value ?? null,
        isHighscore(value: number) {
            const list = sort(read())
            return list.length < MAX_ENTRIES || better(value, list[list.length - 1].value)
        },
        add(value: number, label?: string) {
            const entry: HighscoreEntry = {
                value,
                date: new Date().toISOString(),
                ...(label ? { label } : {}),
            }
            write(sort([...read(), entry]).slice(0, MAX_ENTRIES))
            return entry
        },
        clear: () => write([]),
    }
}

function isEntry(e: unknown): e is HighscoreEntry {
    return typeof e === 'object' && e !== null && typeof (e as HighscoreEntry).value === 'number'
}

function defaultStorage(): Storage | null {
    try {
        return typeof localStorage === 'undefined' ? null : localStorage
    } catch {
        return null
    }
}

/**
 * Reactive wrapper for components. The underlying storage isn't reactive, so
 * `refresh()` is exposed for readers (e.g. the shell's score panel) that need to
 * pick up writes made through a different store instance.
 */
export function useHighscores(gameId: string, scoring: Scoring) {
    const store = createHighscoreStore(gameId, scoring)
    const entries = ref(store.entries())
    const refresh = () => {
        entries.value = store.entries()
    }
    return {
        entries,
        best: computed(() => entries.value[0]?.value ?? null),
        isHighscore: store.isHighscore,
        refresh,
        add(value: number, label?: string) {
            const e = store.add(value, label)
            refresh()
            return e
        },
        clear() {
            store.clear()
            refresh()
        },
    }
}
