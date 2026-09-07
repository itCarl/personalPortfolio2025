<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { wallpapers, type Wallpaper } from '@/data/wallpapers'
import { useSettings } from '@/composables/useSettings'

const { settings, setWallpaper } = useSettings()

/** The tile is the preset itself: same `background` value the desktop gets. */
function tileStyle(wallpaper: Wallpaper): CSSProperties {
    return {
        background: wallpaper.css,
        backgroundSize: wallpaper.size ?? 'auto',
    }
}
</script>

<template>
    <section class="space-y-3">
        <h3 class="text-xs font-semibold uppercase tracking-wide text-mute">
            Wallpaper
        </h3>

        <ul class="flex flex-wrap gap-3">
            <li v-for="wallpaper in wallpapers" :key="wallpaper.id">
                <button
                    class="press flex flex-col items-center gap-1.5"
                    :aria-pressed="settings.wallpaper === wallpaper.id"
                    @click="setWallpaper(wallpaper.id)"
                >
                    <span
                        class="block h-10 w-16 rounded-md border border-hairline"
                        :class="
                            settings.wallpaper === wallpaper.id &&
                            'ring-2 ring-primary ring-offset-1 ring-offset-card'
                        "
                        :style="tileStyle(wallpaper)"
                    ></span>
                    <span class="text-[11px] font-medium text-mute">
                        {{ wallpaper.name }}
                    </span>
                </button>
            </li>
        </ul>

        <p class="text-xs text-mute">
            Every preset is mixed from the theme colors, so it follows light and
            dark mode and the accent you picked.
        </p>
    </section>
</template>
