/**
 * Cursor sets.
 *
 * `classic` uses the browser's native cursors and ships no assets. Every other
 * set has one 32x32 SVG per role in `public/cursors/<id>/<role>.svg`, drawn with
 * a contrasting outline so it reads on light and dark backgrounds.
 *
 * `applySettings()` only writes `data-cursor="<id>"` to `<html>`; the actual
 * `cursor: url(...) x y` rules are hand-written in `resources/css/app.css`.
 * The hotspots below are the numbers used there — change one, change both.
 */

export type CursorId = 'classic' | 'pixel' | 'rounded' | 'crosshair'

export type CursorRole =
    | 'default'
    | 'pointer'
    | 'text'
    | 'move'
    | 'nwse-resize'
    | 'nesw-resize'
    | 'ew-resize'
    | 'ns-resize'

export type Hotspot = { x: number; y: number }

export type CursorSet = {
    id: CursorId
    name: string
    description: string
    /** false for `classic`, which relies on the native cursors */
    hasAssets: boolean
}

export const cursorRoles: CursorRole[] = [
    'default',
    'pointer',
    'text',
    'move',
    'nwse-resize',
    'nesw-resize',
    'ew-resize',
    'ns-resize',
]

/**
 * Hotspot per role. Arrow-shaped art is anchored at its tip, everything else at
 * the centre of the 32x32 canvas. Mirrored verbatim in `app.css`.
 */
export const cursorHotspots: Record<CursorRole, Hotspot> = {
    default: { x: 2, y: 2 },
    pointer: { x: 6, y: 2 },
    text: { x: 16, y: 16 },
    move: { x: 16, y: 16 },
    'nwse-resize': { x: 16, y: 16 },
    'nesw-resize': { x: 16, y: 16 },
    'ew-resize': { x: 16, y: 16 },
    'ns-resize': { x: 16, y: 16 },
}

/**
 * The `crosshair` set draws a centred cross for *every* role, including the two
 * arrow roles, so it anchors those at the centre instead of the tip.
 */
export const cursorHotspotOverrides: Partial<
    Record<CursorId, Partial<Record<CursorRole, Hotspot>>>
> = {
    crosshair: {
        default: { x: 16, y: 16 },
        pointer: { x: 16, y: 16 },
    },
}

export const cursorSets: CursorSet[] = [
    {
        id: 'classic',
        name: 'Classic',
        description: 'Your system cursors, untouched.',
        hasAssets: false,
    },
    {
        id: 'pixel',
        name: 'Pixel',
        description: '1-bit hard edges, straight out of 1995.',
        hasAssets: true,
    },
    {
        id: 'rounded',
        name: 'Rounded',
        description: 'Soft modern arrow with a light drop shadow.',
        hasAssets: true,
    },
    {
        id: 'crosshair',
        name: 'Crosshair',
        description: 'Thin precision cross, centred on the target.',
        hasAssets: true,
    },
]

export const DEFAULT_CURSOR: CursorId = 'classic'

export function findCursorSet(id: string): CursorSet {
    return cursorSets.find(c => c.id === id) ?? cursorSets[0]
}

export function isCursorId(id: unknown): id is CursorId {
    return typeof id === 'string' && cursorSets.some(c => c.id === id)
}

/** Public path of a set's asset for one role. */
export function cursorAsset(id: CursorId, role: CursorRole): string {
    return `/cursors/${id}/${role}.svg`
}

export function hotspotFor(id: CursorId, role: CursorRole): Hotspot {
    return cursorHotspotOverrides[id]?.[role] ?? cursorHotspots[role]
}

/** Ready-made `cursor` value, used for the per-card hover preview. */
export function cursorValue(
    id: CursorId,
    role: CursorRole,
    fallback = 'auto'
): string {
    if (!findCursorSet(id).hasAssets) return fallback
    const { x, y } = hotspotFor(id, role)
    return `url('${cursorAsset(id, role)}') ${x} ${y}, ${fallback}`
}
