/**
 * The catalogue behind the Games folder's Secrets panel.
 *
 * Every row of the design spec's secrets table appears here exactly once. The
 * panel shows `name` once a secret has been found and `???` plus `hint` before
 * that, so **hints must never spell out the trigger** — they nudge, they don't
 * tell. The trigger itself only ever lives in the game that implements it.
 */
export type SecretType = 'cheat' | 'egg'

export type Secret = {
    id: string
    /** a registry game id, or 'desktop' / 'games' for the two shell-level secrets */
    game: string
    name: string
    hint: string
    type: SecretType
}

export const secrets: Secret[] = [
    {
        id: 'konami',
        game: 'desktop',
        name: 'Konami code',
        hint: 'Thirty lives, on a grey console, in 1986. Your fingers remember it.',
        type: 'egg',
    },
    {
        id: 'xyzzy',
        game: 'minesweeper',
        name: 'xyzzy',
        hint: 'A magic word from a very old cave. Then hold a modifier and watch the top-left pixel.',
        type: 'cheat',
    },
    {
        id: 'boom',
        game: 'minesweeper',
        name: 'Boom',
        hint: 'Say what happens when you lose, and every mine says hello for a second.',
        type: 'cheat',
    },
    {
        id: '2048-tile',
        game: 'game2048',
        name: 'Big spawn',
        hint: 'Type the name of the game itself and the next tile arrives grown up.',
        type: 'cheat',
    },
    {
        id: '2048-konami',
        game: 'game2048',
        name: 'Endless undo',
        hint: 'The oldest cheat sequence in gaming buys you infinite second chances here.',
        type: 'cheat',
    },
    {
        id: 'nokia',
        game: 'snake',
        name: 'Monochrome LCD',
        hint: 'Name the phone brand that made this game famous and the screen turns green.',
        type: 'egg',
    },
    {
        id: 'ghost',
        game: 'snake',
        name: 'Walls off',
        hint: 'Type what walks through walls and the edges stop being fatal.',
        type: 'cheat',
    },
    {
        id: 'peek',
        game: 'memory',
        name: 'Peek',
        hint: 'A short word for a quick look — two seconds of every card face up.',
        type: 'cheat',
    },
    {
        id: 'solitaire-altshift2',
        game: 'solitaire',
        name: 'Instant win',
        hint: 'Two modifier keys and a digit, exactly as in the Windows original. The cards bounce.',
        type: 'cheat',
    },
    {
        id: 'deal',
        game: 'solitaire',
        name: 'Friendly deal',
        hint: 'Ask for a new one by name and the aces are suspiciously easy to reach.',
        type: 'cheat',
    },
    {
        id: 'hidden-test',
        game: 'pinball',
        name: 'Hidden test',
        hint: 'Space Cadet engineers used this to drag the ball around. Two words.',
        type: 'cheat',
    },
    {
        id: '1max',
        game: 'pinball',
        name: 'Extra ball',
        hint: 'One of four Space Cadet codes ending in the same three letters. This one is worth a single ball.',
        type: 'cheat',
    },
    {
        id: 'bmax',
        game: 'pinball',
        name: 'Unlimited balls',
        hint: 'Same three-letter ending; the leading letter stands for the thing you never run out of.',
        type: 'cheat',
    },
    {
        id: 'gmax',
        game: 'pinball',
        name: 'Gravity wells',
        hint: 'Same three-letter ending; the leading letter stands for what pulls the ball for twenty seconds.',
        type: 'cheat',
    },
    {
        id: 'rmax',
        game: 'pinball',
        name: 'Higher multiplier',
        hint: 'Same three-letter ending; the leading letter stands for the rank your score climbs by one.',
        type: 'cheat',
    },
    {
        id: 'games-spin',
        game: 'games',
        name: 'Spinning icons',
        hint: 'Keep clicking the folder heading. Seven times, quickly.',
        type: 'egg',
    },
]

/** Display label for the `game` field, including the two non-game scopes. */
export const SECRET_SCOPES: Record<string, string> = {
    desktop: 'Desktop',
    games: 'Games folder',
}

export const findSecret = (id: string) => secrets.find(s => s.id === id)
