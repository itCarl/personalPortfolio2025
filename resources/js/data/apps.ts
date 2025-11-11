import { AnyFn } from '@vueuse/core'
import {
    FileText,
    MessageSquareMore,
    CalculatorIcon,
    MailOpen,
    Trash2,
    FolderOpen,
    Settings
} from 'lucide-vue-next'

type AppDefinition = {
    id: string
    title: string
    icon: any
    contentLoader?: AnyFn
}

function makeApp(title: string, icon: any, contentLoader?: AnyFn): AppDefinition {
    const id = title
        .replace(/\s+([a-zA-Z])/g, (_, c) => c.toUpperCase())
        .replace(/\s+/g, '')
        .replace(/^([A-Z])/, (_, c) => c.toLowerCase())
    return {
        id,
        title,
        icon,
        contentLoader
    }
}

export const appDefinitions = [
    makeApp(
        'home.md',
        FileText,
        () => import('@/components/ui/desktop-window/DesktopWindowPlaceholder.vue')
    ),
    makeApp(
        'Portfolio OS',
        FolderOpen,
        () => import('@/components/ui/desktop-window/DesktopWindowPlaceholder.vue')
    ),
    makeApp(
        'Calculator',
        CalculatorIcon,
        () => import('@/components/ui/desktop-window/DesktopWindowPlaceholder.vue')
    ),
    makeApp(
        'Ask a question',
        MessageSquareMore,
        () => import('@/components/ui/desktop-window/DesktopWindowPlaceholder.vue')
    ),
    makeApp(
        'Talk to a human',
        MailOpen,
        () => import('@/components/ui/desktop-window/DesktopWindowPlaceholder.vue')
    ),
    makeApp(
        'Images',
        FolderOpen,
        () => import('@/components/ui/desktop-window/DesktopWindowPlaceholder.vue')
    ),
    makeApp(
        'Display Options',
        Settings,
        () => import('@/components/ui/desktop-window/DesktopWindowDisplayOptions.vue')
    ),
    makeApp(
        'Trash',
        Trash2,
        () => import('@/components/ui/desktop-window/DesktopWindowPlaceholder.vue')
    ),
]
