<script setup lang="ts">
import { login } from '@/routes';
import { Head, Link, router } from '@inertiajs/vue3';
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
import { useWindowManager } from '@/composables/useWindowManager';
import AppearanceTabs from '@/components/AppearanceTabs.vue';

const handleLogout = () => {
    router.flushAll();
};

const wm = useWindowManager();
</script>

<template>
    <Head title="Welcome">
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
    </Head>
    <div class="flex min-h-screen flex-col bg-[#e1d7c2]">
        <header class="flex justify-between text-xl z-50 bg-background border-b">
            <Menubar>
                <MenubarMenu>
                    <div class="px-2">
                        <LayoutDashboard class="text-primary" />
                    </div>
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
                    <MenubarTrigger class="px-1 flex items-center gap-2">
                        <AppWindow :size="20" />
                        <span
                            v-if="wm.windows.length > 0"
                            class="inline-flex items-center justify-center min-w-[20px] h-5 px-2 text-xs font-medium text-white bg-red-600 rounded-full"
                            aria-live="polite"
                        >{{ wm.windows.length }}</span>
                    </MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem>
                            New Tab
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger class="px-1">
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

        <main id="desktop" class="relative flex-grow w-full bg-[#e1d7c2]">
            <Desktop />
        </main>
    </div>
</template>
