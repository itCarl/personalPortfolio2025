<script setup lang="ts">
import { ref } from 'vue'
import DesktopElement from '@/components/ui/desktop-element/DesktopElement.vue';
import Window from '@/components/ui/desktop-window/DesktopWindow.vue';
import { appDefinitions } from '@/data/apps';
import { useWindowManager } from '@/composables/useWindowManager';

const ICON_SPACING_Y = 80
const ICONS_PER_COLUMN = 10

const wm = useWindowManager()

// include contentLoader on each icon so Desktop can spawn windows
const icons = ref(
    appDefinitions.map((app, index) => {
        const row = index % ICONS_PER_COLUMN
        return {
            id: app.id,
            title: app.title,
            icon: app.icon,
            top: 60 + row * ICON_SPACING_Y,
            left: 70,
            open: false,
            contentLoader: app.contentLoader, // may be undefined
        }
    })
)

// handler when DesktopElement emits open (id)
function onIconOpen(id: string) {
    const app = icons.value.find(a => a.id === id)
    if (!app) return
    wm.openWindow({ id: app.id, title: app.title, contentLoader: app.contentLoader, x: app.left, y: app.top })
}
</script>

<template>
    <ul class="relative list-none grid sm:grid-cols-4 grid-cols-3 gap-2">
        <DesktopElement
            v-for="(app, i) in icons"
            :key="app.id"
            :id="app.id"
            :title="app.title"
            :icon="app.icon"
            :top="icons[i].top"
            :left="icons[i].left"
            :content-loader="app.contentLoader"
            @open="onIconOpen"
        />
    </ul>

    <!-- windows owned by window manager -->
    <div aria-hidden="false">
        <Window
            v-for="w in wm.windows"
            :key="w.id"
            :title="w.title"
            :content-loader="w.contentLoader"
            :minimized="w.minimized"
            :z="w.z"
            @close="wm.closeWindow(w.id)"
            @minimize="wm.toggleMinimize(w.id)"
            @request-focus="wm.focusWindow(w.id)"
        />
    </div>
</template>
