<script setup lang="ts">
import { MousePointer2 } from 'lucide-vue-next'
import { cursorAsset, cursorSets, cursorValue, type CursorId } from '@/data/cursors'
import { useSettings } from '@/composables/useSettings'

const { settings, setCursor } = useSettings()

/**
 * Preview: the card itself uses the set's cursor, so hovering a card shows what
 * you would get without applying it to the whole OS yet.
 */
function previewCursor(id: CursorId) {
    return cursorValue(id, 'default', 'pointer')
}
</script>

<template>
    <section class="space-y-3">
        <h3 class="text-xs font-semibold uppercase tracking-wide text-mute">
            Cursor
        </h3>

        <ul class="space-y-2">
            <li v-for="set in cursorSets" :key="set.id">
                <button
                    class="press flex w-full items-center gap-3 rounded-md border border-hairline bg-secondary p-2.5 text-left"
                    :class="
                        settings.cursor === set.id && 'ring-2 ring-primary'
                    "
                    :style="{ cursor: previewCursor(set.id) }"
                    :aria-pressed="settings.cursor === set.id"
                    @click="setCursor(set.id)"
                >
                    <span
                        class="flex h-10 w-16 shrink-0 items-center justify-center gap-1 rounded border border-hairline bg-card"
                    >
                        <template v-if="set.hasAssets">
                            <img
                                :src="cursorAsset(set.id, 'default')"
                                alt=""
                                class="h-6 w-6"
                            />
                            <img
                                :src="cursorAsset(set.id, 'pointer')"
                                alt=""
                                class="h-6 w-6"
                            />
                        </template>
                        <MousePointer2 v-else :size="18" class="text-mute" />
                    </span>
                    <span class="min-w-0">
                        <span
                            class="block text-sm font-semibold text-ink dark:text-foreground"
                        >
                            {{ set.name }}
                        </span>
                        <span class="block text-xs text-mute">
                            {{ set.description }}
                        </span>
                    </span>
                </button>
            </li>
        </ul>

        <p class="text-xs text-mute">
            Applies to the whole desktop, including the window title bars and
            resize handles.
        </p>
    </section>
</template>
