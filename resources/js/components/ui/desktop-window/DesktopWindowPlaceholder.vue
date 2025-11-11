<script setup lang="ts">
    const props = defineProps<{
    title?: string
    }>()
</script>

<template>
    <div class="p-4 flex flex-col items-center justify-center min-h-[200px]">
        <h2 class="text-xl mb-4">{{ title || 'Coming Soon' }}</h2>
        <p class="text-gray-600">This window is under development</p>
    </div>
</template>
