import { AnyFn } from '@vueuse/core'
import {
    FileText,
    MessageSquareMore,
    CalculatorIcon,
    MailOpen,
    Trash2,
    Folder,
    FolderOpen,
    Settings
} from 'lucide-vue-next'

type AppDefinition = {
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
        { width: 320, height: 480 }
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
        'Display Options',
        Settings,
        () => import('@/components/ui/desktop-window/DesktopWindowDisplayOptions.vue'),
        { width: 420, height: 270 }
    ),
    makeApp(
        'Trash',
        Trash2,
        () => import('@/components/ui/desktop-window/DesktopWindowTrash.vue'),
        { width: 340, height: 240 }
    ),
]
