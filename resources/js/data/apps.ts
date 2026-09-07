import { AnyFn } from '@vueuse/core'
import {
    FileText,
    Gamepad2,
    MessageSquareMore,
    CalculatorIcon,
    MailOpen,
    Trash2,
    Folder,
    FolderOpen,
    Settings
} from 'lucide-vue-next'
import { gameDefinitions } from '@/games/registry'
import type { useWindowManager } from '@/composables/useWindowManager'

export type AppDefinition = {
    id: string
    title: string
    icon: any
    contentLoader?: AnyFn
    width?: number
    height?: number
}

function makeApp(
    title: string,
    icon: any,
    contentLoader?: AnyFn,
    size?: { width: number; height: number }
): AppDefinition {
    const id = title
        .replace(/\s+([a-zA-Z])/g, (_, c) => c.toUpperCase())
        .replace(/\s+/g, '')
        .replace(/^([A-Z])/, (_, c) => c.toLowerCase())
    return {
        id,
        title,
        icon,
        contentLoader,
        width: size?.width,
        height: size?.height,
    }
}

export const appDefinitions = [
    makeApp(
        'home.md',
        FileText,
        () => import('@/components/ui/desktop-window/DesktopWindowHome.vue'),
        { width: 560, height: 470 }
    ),
    makeApp(
        'Portfolio OS',
        FolderOpen,
        () => import('@/components/ui/desktop-window/DesktopWindowAbout.vue'),
        { width: 460, height: 410 }
    ),
    makeApp(
        'Calculator',
        CalculatorIcon,
        () => import('@/components/ui/desktop-window/DesktopWindowCalculator.vue'),
        { width: 360, height: 480 }
    ),
    makeApp(
        'Ask a question',
        MessageSquareMore,
        () => import('@/components/ui/desktop-window/DesktopWindowAsk.vue'),
        { width: 440, height: 340 }
    ),
    makeApp(
        'Talk to a human',
        MailOpen,
        () => import('@/components/ui/desktop-window/DesktopWindowContact.vue'),
        { width: 440, height: 500 }
    ),
    makeApp(
        'Images',
        FolderOpen,
        () => import('@/components/ui/desktop-window/DesktopWindowImages.vue'),
        { width: 760, height: 560 }
    ),
    makeApp(
        'Projects',
        Folder,
        () => import('@/components/ui/desktop-window/DesktopWindowProjects.vue'),
        { width: 640, height: 520 }
    ),
    makeApp(
        'Settings',
        Settings,
        () => import('@/components/ui/desktop-window/DesktopWindowSettings.vue'),
        { width: 640, height: 460 }
    ),
    makeApp(
        'Games',
        Gamepad2,
        () => import('@/components/ui/desktop-window/DesktopWindowGames.vue'),
        { width: 560, height: 420 }
    ),
    makeApp(
        'Trash',
        Trash2,
        () => import('@/components/ui/desktop-window/DesktopWindowTrash.vue'),
        { width: 360, height: 240 }
    ),
]

/**
 * Apps and games share one id space; games are looked up second, so an app id
 * always wins. This is the only place that resolves an id to a window shape —
 * icons, the palette, the menubar and session restore all go through it.
 */
export function findApp(id: string): AppDefinition | undefined {
    const app = appDefinitions.find(a => a.id === id)
    if (app) return app
    const game = gameDefinitions.find(g => g.id === id)
    if (!game) return undefined
    return {
        id: game.id,
        title: game.title,
        icon: game.icon,
        contentLoader: game.loader,
        width: game.width,
        height: game.height,
    }
}

/**
 * Opens the app or game with the given id in the window manager. `contentProps`
 * is handed to the window content on mount and, on a re-open, merged into the
 * already open window; a call without it leaves existing props in place.
 */
export function openAppWindow(
    wm: ReturnType<typeof useWindowManager>,
    id: string,
    contentProps?: Record<string, unknown>,
) {
    const app = findApp(id)
    if (!app) return
    wm.openWindow({
        id: app.id,
        title: app.title,
        contentLoader: app.contentLoader,
        contentProps,
        width: app.width,
        height: app.height,
    })
}
