<script setup lang="ts">
import { computed } from 'vue'
import DesktopElement from '@/components/ui/desktop-element/DesktopElement.vue';
import Window from '@/components/ui/desktop-window/DesktopWindow.vue';
import { appDefinitions, openAppWindow } from '@/data/apps';
import { useWindowManager } from '@/composables/useWindowManager';
import { useIsMobile } from '@/composables/useIsMobile';

const ICON_SPACING_Y = 80
const ICON_SPACING_X = 110
const ICONS_PER_COLUMN = 6

const wm = useWindowManager()
const isMobile = useIsMobile()

// Part of every child key: crossing the breakpoint remounts icons and windows so
// the v-draggable directive (which reads its binding once, on mount) picks up the
// new layout mode instead of staying draggable / static from the previous one.
const layoutKey = computed(() => (isMobile.value ? 'mobile' : 'desktop'))

// Only the top-most non-minimized window is visible in mobile mode.
const activeWindowId = computed(() => wm.activeWindow()?.id)

// include contentLoader on each icon so Desktop can spawn windows.
// Desktop: Trash is pinned to the bottom-right corner; everything else flows
// top-left in columns. Mobile: no anchors at all — the icons flow in a CSS grid.
const icons = computed(() =>
    appDefinitions.map((app, index) => {
        const isTrash = app.id === 'trash'
        const row = index % ICONS_PER_COLUMN
        const col = Math.floor(index / ICONS_PER_COLUMN)
        const positioned = !isMobile.value
        return {
            id: app.id,
            title: app.title,
            icon: app.icon,
            top: positioned && !isTrash ? 60 + row * ICON_SPACING_Y : undefined,
            left: positioned && !isTrash ? 70 + col * ICON_SPACING_X : undefined,
            right: positioned && isTrash ? 20 : undefined,
            bottom: positioned && isTrash ? 24 : undefined,
            open: false,
            contentLoader: app.contentLoader, // may be undefined
            width: app.width,
            height: app.height,
        }
    })
)

// handler when DesktopElement emits open (id)
function onIconOpen(id: string) {
    openAppWindow(wm, id)
}
</script>

<template>
    <ul :class="isMobile ? 'grid grid-cols-3 gap-4 p-4 list-none' : 'absolute inset-0 list-none'">
        <DesktopElement
            v-for="app in icons"
            :key="`${app.id}-${layoutKey}`"
            :id="app.id"
            :title="app.title"
            :icon="app.icon"
            :top="app.top"
            :left="app.left"
            :right="app.right"
            :bottom="app.bottom"
            :content-loader="app.contentLoader"
            @open="onIconOpen"
        />
    </ul>

    <!-- windows owned by window manager -->
    <div aria-hidden="false">
        <Window
            v-for="w in wm.windows"
            :key="`${w.id}-${layoutKey}`"
            :title="w.title"
            :content-loader="w.contentLoader"
            :content-props="w.contentProps"
            :minimized="w.minimized"
            :active="w.id === activeWindowId"
            :z="w.z"
            :width="w.width"
            :height="w.height"
            @close="wm.closeWindow(w.id)"
            @minimize="wm.toggleMinimize(w.id)"
            @request-focus="wm.focusWindow(w.id)"
        />
    </div>
</template>
