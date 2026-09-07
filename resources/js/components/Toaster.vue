<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts } = useToast()
</script>

<template>
    <teleport to="body">
        <div class="fixed bottom-4 right-4 z-[10001] flex flex-col items-end gap-2">
            <transition-group name="toast">
                <div
                    v-for="t in toasts"
                    :key="t.id"
                    class="rounded-md border-2 border-ink bg-card px-4 py-2 text-sm font-medium text-ink shadow-sticker-sm dark:border-white/80 dark:text-foreground"
                >
                    {{ t.message }}
                </div>
            </transition-group>
        </div>
    </teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
    transition: all 0.2s ease;
}
.toast-enter-from,
.toast-leave-to {
    opacity: 0;
    transform: translateY(8px);
}
</style>
