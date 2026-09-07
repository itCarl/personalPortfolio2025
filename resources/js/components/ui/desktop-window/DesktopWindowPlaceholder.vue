<script setup lang="ts">
    const props = defineProps<{
    title?: string
    }>()
</script>

<template>
    <div class="p-6 flex flex-col gap-4">
        <h2 class="text-xl font-bold text-ink dark:text-foreground">{{ title || 'Coming Soon' }}</h2>
        <div class="rounded-md bg-pastel-blue-soft text-ink px-4 py-3 text-sm">
            💡 This window is under development — check back soon.
        </div>
    </div>
</template>
