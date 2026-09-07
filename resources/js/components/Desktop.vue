<script setup lang="ts">
import { ref } from 'vue'
import DesktopElement from '@/components/ui/desktop-element/DesktopElement.vue';
import Window from '@/components/ui/desktop-window/DesktopWindow.vue';
import { appDefinitions } from '@/data/apps';
import { useWindowManager } from '@/composables/useWindowManager';

const ICON_SPACING_Y = 80
const ICON_SPACING_X = 110
const ICONS_PER_COLUMN = 6

const wm = useWindowManager()

// include contentLoader on each icon so Desktop can spawn windows.
// Trash is pinned to the bottom-right corner; everything else flows top-left in columns.
const icons = ref(
    appDefinitions.map((app, index) => {
        const isTrash = app.id === 'trash'
        const row = index % ICONS_PER_COLUMN
        const col = Math.floor(index / ICONS_PER_COLUMN)
        return {
            id: app.id,
            title: app.title,
            icon: app.icon,
            top: isTrash ? undefined : 60 + row * ICON_SPACING_Y,
            left: isTrash ? undefined : 70 + col * ICON_SPACING_X,
            right: isTrash ? 20 : undefined,
            bottom: isTrash ? 24 : undefined,
            open: false,
            contentLoader: app.contentLoader, // may be undefined
            width: app.width,
            height: app.height,
        }
    })
)

// handler when DesktopElement emits open (id)
function onIconOpen(id: string) {
    const app = icons.value.find(a => a.id === id)
    if (!app) return
    wm.openWindow({
        id: app.id,
        title: app.title,
        contentLoader: app.contentLoader,
        width: app.width,
        height: app.height,
    })
}
</script>

<template>
    <ul class="absolute inset-0 list-none">
        <DesktopElement
            v-for="(app, i) in icons"
            :key="app.id"
            :id="app.id"
            :title="app.title"
            :icon="app.icon"
            :top="icons[i].top"
            :left="icons[i].left"
            :right="icons[i].right"
            :bottom="icons[i].bottom"
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
            :width="w.width"
            :height="w.height"
            @close="wm.closeWindow(w.id)"
            @minimize="wm.toggleMinimize(w.id)"
            @request-focus="wm.focusWindow(w.id)"
        />
    </div>
</template>
