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
    AppWindow
} from "lucide-vue-next"
import Desktop from '@/components/Desktop.vue';
import CommandPalette from '@/components/CommandPalette.vue';
import Toaster from '@/components/Toaster.vue';
import { useWindowManager } from '@/composables/useWindowManager';
import { useWindowShortcuts } from '@/composables/useWindowShortcuts';
import { useSessionPersistence } from '@/composables/useSessionPersistence';
import { ref } from 'vue';

const wm = useWindowManager();

const paletteOpen = ref(false);
function togglePalette() {
    paletteOpen.value = !paletteOpen.value;
}

useWindowShortcuts(wm, { toggle: togglePalette, isOpen: () => paletteOpen.value });
useSessionPersistence(wm);
</script>

<template>
    <Head title="Welcome">
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
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
                        <MenubarItem>
                            New Tab <MenubarShortcut>⌘T</MenubarShortcut>
                        </MenubarItem>
                        <MenubarItem>
                            New Window
                        </MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem>
                            Share
                        </MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem>
                            Print
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger>3D Printing</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem>
                            New Tab
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger>Socials</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem>
                            New Tab
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger>More</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem>
                            New Tab
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
                        <MenubarItem>
                            New Tab
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
