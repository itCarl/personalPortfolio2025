import { beforeEach, describe, expect, it } from 'vitest'
import { createHighscoreStore } from './useHighscores'

function memoryStorage(): Storage {
    const m = new Map<string, string>()
    return {
        getItem: k => m.get(k) ?? null,
        setItem: (k, v) => void m.set(k, v),
        removeItem: k => void m.delete(k),
        clear: () => m.clear(),
        key: i => [...m.keys()][i] ?? null,
        get length() { return m.size },
    }
}

describe('highscore store', () => {
    let storage: Storage
    beforeEach(() => { storage = memoryStorage() })

    it('keeps the top 10 descending for "high" scoring', () => {
        const s = createHighscoreStore('snake', 'high', storage)
        for (let i = 1; i <= 12; i++) s.add(i)
        expect(s.entries().map(e => e.value)).toEqual([12, 11, 10, 9, 8, 7, 6, 5, 4, 3])
        expect(s.best()).toBe(12)
        expect(s.isHighscore(2)).toBe(false)
        expect(s.isHighscore(13)).toBe(true)
    })

    it('sorts ascending for "time" and "moves"', () => {
        const s = createHighscoreStore('minesweeper:beginner', 'time', storage)
        s.add(42); s.add(17); s.add(60)
        expect(s.entries().map(e => e.value)).toEqual([17, 42, 60])
        expect(s.best()).toBe(17)
        expect(s.isHighscore(10)).toBe(true)
    })

    it('persists under the documented key and survives corrupt data', () => {
        const s = createHighscoreStore('game2048', 'high', storage)
        s.add(512, 'first')
        expect(storage.getItem('portfolio-os:highscores:game2048')).toContain('"value":512')
        storage.setItem('portfolio-os:highscores:game2048', '{not json')
        expect(createHighscoreStore('game2048', 'high', storage).entries()).toEqual([])
    })
})
