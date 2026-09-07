<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { Image, Palette, MousePointer2, RotateCcw } from 'lucide-vue-next'
import AppearanceSection from './settings/AppearanceSection.vue'
import WallpaperSection from './settings/WallpaperSection.vue'
import CursorSection from './settings/CursorSection.vue'
import { useSettings } from '@/composables/useSettings'
import { useToast } from '@/composables/useToast'

const { reset } = useSettings()
const { toast } = useToast()

/**
 * Custom cursors are a pointer-device feature — on a touch screen there is no
 * cursor to restyle, so the whole section is left out.
 */
const isCoarsePointer = useMediaQuery('(pointer: coarse)')

const sections = computed(() => [
    { id: 'appearance', label: 'Appearance', icon: Palette, component: AppearanceSection },
    { id: 'wallpaper', label: 'Wallpaper', icon: Image, component: WallpaperSection },
    ...(isCoarsePointer.value
        ? []
        : [{ id: 'cursor', label: 'Cursor', icon: MousePointer2, component: CursorSection }]),
])

const activeId = ref('appearance')
// falls back to the first section if the active one disappears (touch screens)
const active = computed(
    () => sections.value.find(s => s.id === activeId.value) ?? sections.value[0]
)

function resetAll() {
    reset()
    toast('Settings reset')
}
</script>

<template>
    <div class="flex h-full text-body dark:text-foreground">
        <nav
            class="w-36 shrink-0 space-y-1 border-r border-hairline bg-secondary p-2"
            aria-label="Settings sections"
        >
            <button
                v-for="section in sections"
                :key="section.id"
                class="press flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm font-medium"
                :class="
                    active?.id === section.id
                        ? 'border border-hairline bg-card text-ink shadow-sticker-sm dark:text-foreground'
                        : 'text-mute hover:bg-accent'
                "
                :aria-pressed="active?.id === section.id"
                @click="activeId = section.id"
            >
                <component :is="section.icon" :size="16" />
                {{ section.label }}
            </button>
        </nav>

        <div class="flex min-w-0 flex-1 flex-col">
            <div class="flex-1 overflow-auto p-5">
                <component :is="active?.component" />
            </div>

            <footer
                class="flex items-center justify-between gap-3 border-t border-hairline px-5 py-3"
            >
                <p class="text-[11px] text-mute">
                    Saved in this browser only.
                </p>
                <button
                    class="press inline-flex shrink-0 items-center gap-1.5 rounded-md border border-hairline bg-secondary px-3 py-1.5 text-xs font-medium text-ink hover:bg-accent dark:text-foreground"
                    @click="resetAll"
                >
                    <RotateCcw :size="14" />
                    Reset to defaults
                </button>
            </footer>
        </div>
    </div>
</template>
