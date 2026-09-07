<script setup lang="ts">
import { Trash2 } from 'lucide-vue-next'
</script>

<template>
    <div class="flex h-full flex-col items-center justify-center gap-3 p-10 text-center text-mute">
        <Trash2 :size="48" class="text-ash" />
        <p class="text-lg font-semibold text-ink dark:text-foreground">Trash is empty</p>
        <p class="max-w-xs text-sm">Even a thorough code review couldn't find anything in here to delete.</p>
    </div>
</template>
