<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from '@/components/ui/menubar';
import {
    LayoutDashboard,
    CircleUserRound,
    AppWindow,
    Github,
    Codepen,
    FileUser,
    Box
} from "lucide-vue-next"
import Desktop from '@/components/Desktop.vue';
import CommandPalette from '@/components/CommandPalette.vue';
import Toaster from '@/components/Toaster.vue';
import { appDefinitions } from '@/data/apps';
import { useWindowManager } from '@/composables/useWindowManager';
import { useWindowShortcuts } from '@/composables/useWindowShortcuts';
import { useSessionPersistence, SESSION_STORAGE_KEY } from '@/composables/useSessionPersistence';
import { useToast } from '@/composables/useToast';
import { nextTick, ref } from 'vue';

const wm = useWindowManager();
const { toast } = useToast();

const paletteOpen = ref(false);
function togglePalette() {
    paletteOpen.value = !paletteOpen.value;
}

useWindowShortcuts(wm, { toggle: togglePalette, isOpen: () => paletteOpen.value });
useSessionPersistence(wm);

const description =
    'Portfolio of Maximilian Mewes — developer from Brandenburg an der Havel building web apps with Vue, Laravel and TypeScript, 3D-printing tools and the occasional dartboard robot.';

/**
 * Opens the app with the given id from the shared registry, using the same
 * window shape the desktop icons use. `contentProps` is handed to the window
 * content on first mount — an already open window is only focused, so its
 * current state is never overwritten.
 */
function openApp(id: string, contentProps?: Record<string, unknown>) {
    const app = appDefinitions.find(a => a.id === id);
    if (!app) return;
    wm.openWindow({
        id: app.id,
        title: app.title,
        contentLoader: app.contentLoader,
        contentProps,
        width: app.width,
        height: app.height,
    });
}

async function resetSession() {
    wm.windows.map(w => w.id).forEach(id => wm.closeWindow(id));
    // the persistence watcher re-saves on the next tick, so drop the key after it ran
    await nextTick();
    try {
        localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
        // ignore unavailable storage (private mode, blocked cookies, …)
    }
    toast('Session reset');
}
</script>

<template>
    <Head title="Portfolio OS">
        <meta name="description" :content="description" />
        <meta property="og:title" content="Portfolio OS - Maximilian Mewes" />
        <meta property="og:description" :content="description" />
        <meta property="og:type" content="website" />
    </Head>
    <div class="flex min-h-screen flex-col bg-background">
        <header class="flex justify-between text-xl z-50 bg-background border-b">
            <Menubar>
                <MenubarMenu>
                    <button class="press px-2" title="Search apps (⌘K)" @click="togglePalette">
                        <LayoutDashboard class="text-primary" />
                    </button>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger>Portfolio OS</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem @select="openApp('portfolioOS')">
                            About Portfolio OS
                        </MenubarItem>
                        <MenubarItem @select="openApp('displayOptions')">
                            Display Options…
                        </MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem @select="resetSession">
                            Reset session
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger>3D Printing</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem @select="openApp('projects', { initialFilter: '3d-printing' })">
                            3D-print projects
                        </MenubarItem>
                        <MenubarItem as-child class="flex items-center gap-2">
                            <a href="https://thangs.com/it.Carl" target="_blank" rel="noopener noreferrer">
                                <Box :size="16" />
                                Models on Thangs
                            </a>
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger>Socials</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem as-child class="flex items-center gap-2">
                            <a href="https://github.com/itCarl" target="_blank" rel="noopener noreferrer">
                                <Github :size="16" />
                                GitHub
                            </a>
                        </MenubarItem>
                        <MenubarItem as-child class="flex items-center gap-2">
                            <a href="https://codepen.io/itcarl" target="_blank" rel="noopener noreferrer">
                                <Codepen :size="16" />
                                CodePen
                            </a>
                        </MenubarItem>
                        <MenubarItem as-child class="flex items-center gap-2">
                            <a href="https://www.xing.com/profile/Maximilian_Mewes2/cv" target="_blank" rel="noopener noreferrer">
                                <FileUser :size="16" />
                                Xing
                            </a>
                        </MenubarItem>
                        <MenubarItem as-child class="flex items-center gap-2">
                            <a href="https://thangs.com/it.Carl" target="_blank" rel="noopener noreferrer">
                                <Box :size="16" />
                                Thangs
                            </a>
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger>More</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem @select="openApp('askAQuestion')">
                            Ask a question
                        </MenubarItem>
                        <MenubarItem @select="openApp('talkToAHuman')">
                            Talk to a human
                        </MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem @select="togglePalette">
                            Search apps <MenubarShortcut>⌘K</MenubarShortcut>
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
            </Menubar>
            <Menubar>
                <MenubarMenu>
                    <MenubarTrigger class="press px-1 flex items-center gap-2">
                        <AppWindow :size="20" />
                        <span
                            v-if="wm.windows.length > 0"
                            class="inline-flex items-center justify-center min-w-[20px] h-5 px-2 text-xs font-semibold text-primary-foreground bg-primary rounded-full"
                            aria-live="polite"
                        >{{ wm.windows.length }}</span>
                    </MenubarTrigger>
                    <MenubarContent class="min-w-56">
                        <template v-if="wm.windows.length > 0">
                            <MenubarItem
                                v-for="w in wm.windows"
                                :key="w.id"
                                class="flex items-center justify-between gap-3"
                                @select="wm.focusWindow(w.id)"
                            >
                                <span class="flex items-center gap-2 min-w-0">
                                    <span
                                        class="w-1.5 h-1.5 rounded-full shrink-0"
                                        :class="w.minimized ? 'bg-ash' : 'bg-pastel-green'"
                                    ></span>
                                    <span class="truncate">{{ w.title }}</span>
                                    <span v-if="w.minimized" class="text-xs text-mute shrink-0">(minimized)</span>
                                </span>
                                <button
                                    class="press shrink-0 text-mute hover:text-pastel-red"
                                    title="Close window"
                                    @click.stop.prevent="wm.closeWindow(w.id)"
                                >✕</button>
                            </MenubarItem>
                        </template>
                        <MenubarItem v-else disabled class="text-mute">
                            No open windows
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger class="press px-1">
                        <CircleUserRound :size="20" />
                    </MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem @select="openApp('home.md')">
                            home.md
                        </MenubarItem>
                        <MenubarItem @select="openApp('talkToAHuman')">
                            Talk to a human
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
            </Menubar>
        </header>

        <main id="desktop" class="relative flex-grow w-full bg-background">
            <Desktop />
        </main>

        <CommandPalette :open="paletteOpen" @close="paletteOpen = false" />
        <Toaster />
    </div>
</template>
