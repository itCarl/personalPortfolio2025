import { describe, expect, it } from 'vitest'
import { KONAMI, createCheatMatcher } from './useCheatCodes'

describe('cheat matcher', () => {
    it('fires when the buffer ends with a code, case-insensitively, once per completion', () => {
        const hits: string[] = []
        const m = createCheatMatcher({ xyzzy: () => hits.push('x'), boom: () => hits.push('b') })
        for (const k of 'abcXyZzY') m.feed(k)
        expect(hits).toEqual(['x'])
        for (const k of 'boom') m.feed(k)
        expect(hits).toEqual(['x', 'b'])
        m.feed('m')
        expect(hits).toEqual(['x', 'b'])
    })

    it('matches arrow-token sequences such as the Konami code', () => {
        let fired = 0
        const m = createCheatMatcher({ [KONAMI]: () => fired++ })
        for (const k of ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']) m.feed(k)
        expect(fired).toBe(1)
    })

    it('ignores modifier keys and keeps only the last 16 tokens', () => {
        let fired = 0
        const m = createCheatMatcher({ hiddentest: () => fired++ })
        for (const k of ['Shift', 'Control', ...'hidden test']) m.feed(k)   // space is dropped
        expect(fired).toBe(1)
        expect(m.buffer().length).toBeLessThanOrEqual(16)
    })
})
