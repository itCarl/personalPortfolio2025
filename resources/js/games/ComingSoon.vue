<script setup lang="ts">
import { Gamepad2 } from 'lucide-vue-next'

defineProps<{ title?: string }>()
</script>

<template>
    <div class="flex h-full flex-col items-center justify-center gap-3 p-10 text-center text-mute">
        <Gamepad2 :size="48" class="text-ash" />
        <p class="text-lg font-semibold text-ink dark:text-foreground">{{ title ?? 'This game' }}</p>
        <p class="max-w-xs text-sm">Coming soon.</p>
    </div>
</template>
