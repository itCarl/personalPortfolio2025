<script setup lang="ts">
import { computed } from 'vue'
import AppearanceTabs from '@/components/AppearanceTabs.vue'
import { accents, findAccent } from '@/data/accents'
import { useSettings } from '@/composables/useSettings'

const { settings, setAccent } = useSettings()

const selected = computed(() => findAccent(settings.accent))
</script>

<template>
    <section class="space-y-6">
        <div class="space-y-2">
            <h3
                class="text-xs font-semibold uppercase tracking-wide text-mute"
            >
                Color mode
            </h3>
            <AppearanceTabs />
        </div>

        <div class="space-y-2">
            <h3
                class="text-xs font-semibold uppercase tracking-wide text-mute"
            >
                Accent color
            </h3>
            <ul class="flex flex-wrap gap-3">
                <li v-for="accent in accents" :key="accent.id">
                    <button
                        class="press h-8 w-8 rounded-full border border-hairline"
                        :class="
                            settings.accent === accent.id &&
                            'ring-2 ring-primary ring-offset-2 ring-offset-card'
                        "
                        :style="{ background: accent.primary }"
                        :title="accent.name"
                        :aria-label="accent.name"
                        :aria-pressed="settings.accent === accent.id"
                        @click="setAccent(accent.id)"
                    ></button>
                </li>
            </ul>
            <p class="text-xs text-mute">
                {{ selected.name }} — used for highlights, badges and buttons
                across the whole OS.
            </p>
        </div>
    </section>
</template>
