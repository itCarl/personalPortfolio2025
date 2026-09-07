import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useWindowContext } from './useWindowContext'

/** The classic sequence, written with arrow glyphs so it can live in a plain string. */
export const KONAMI = '↑↑↓↓←→←→ba'

const ARROWS: Record<string, string> = {
    ArrowUp: '↑',
    ArrowDown: '↓',
    ArrowLeft: '←',
    ArrowRight: '→',
}
const IGNORED = new Set(['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape', 'Enter'])
const BUFFER = 16

/** Pure matcher: feed key names, get callbacks when the buffer ends with a code. */
export function createCheatMatcher(codes: Record<string, () => void>) {
    let buf = ''
    // codes are written for humans ("hidden test"); match them without spaces or case
    const normalized = Object.entries(codes).map(
        ([code, fn]) => [code.replace(/\s+/g, '').toLowerCase(), fn] as const,
    )

    return {
        feed(key: string) {
            if (IGNORED.has(key) || key === ' ') return
            const token = ARROWS[key] ?? (key.length === 1 ? key.toLowerCase() : '')
            if (!token) return
            buf = (buf + token).slice(-BUFFER)
            for (const [code, fn] of normalized) {
                if (buf.endsWith(code)) {
                    // clear the buffer so holding the last key can't re-fire the code
                    fn()
                    buf = ''
                    return
                }
            }
        },
        buffer: () => buf,
    }
}

/** Listens while the game window is focused; same gating as useGameKeys but never preventDefault. */
export function useCheatCodes(codes: Record<string, () => void>) {
    const { focused, minimized } = useWindowContext()
    const matcher = createCheatMatcher(codes)
    const handler = (e: KeyboardEvent) => {
        if (focused.value && !minimized.value) matcher.feed(e.key)
    }
    onMounted(() => window.addEventListener('keydown', handler))
    onBeforeUnmount(() => window.removeEventListener('keydown', handler))
}

const SECRETS_KEY = 'portfolio-os:secrets'

export type FoundSecret = { id: string; foundAt: string }

// module-level so every Secrets panel and every game share one list
const found = ref<FoundSecret[]>(read())

function read(): FoundSecret[] {
    try {
        const parsed = JSON.parse(localStorage.getItem(SECRETS_KEY) ?? '[]') as unknown
        return Array.isArray(parsed) ? (parsed as FoundSecret[]) : []
    } catch {
        return []
    }
}

function write(list: FoundSecret[]) {
    try {
        localStorage.setItem(SECRETS_KEY, JSON.stringify(list))
    } catch {
        // private mode / quota — the secret still counts for this session
    }
}

export function useSecrets() {
    return {
        found,
        isFound: (id: string) => found.value.some(f => f.id === id),
        /** Returns true only the first time a secret is unlocked. */
        unlock(id: string) {
            if (found.value.some(f => f.id === id)) return false
            found.value = [...found.value, { id, foundAt: new Date().toISOString() }]
            write(found.value)
            return true
        },
    }
}
