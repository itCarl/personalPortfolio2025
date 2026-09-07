<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Circle, Diamond, Heart, Sparkle, Square, Star, Triangle, Zap } from 'lucide-vue-next'

const DURATION = 2000
const COUNT = 24
const GLYPHS = [Sparkle, Star, Heart, Circle, Square, Triangle, Diamond, Zap]
const COLORS = [
    'text-brand',
    'text-pastel-blue',
    'text-pastel-green',
    'text-pastel-red',
    'text-pastel-purple',
]

const emit = defineEmits<{ (e: 'done'): void }>()

// laid out once so the animation doesn't reshuffle on every render
const pieces = Array.from({ length: COUNT }, (_, i) => ({
    id: i,
    icon: GLYPHS[i % GLYPHS.length],
    color: COLORS[i % COLORS.length],
    left: Math.round((i / COUNT) * 96 + Math.random() * 4),
    delay: Math.round(Math.random() * 500),
    duration: 1200 + Math.round(Math.random() * 700),
    drift: Math.round(Math.random() * 80 - 40),
    spin: Math.round(Math.random() * 720 - 360),
}))

const visible = ref(true)
let timer = 0

onMounted(() => {
    timer = window.setTimeout(() => {
        visible.value = false
        emit('done')
    }, DURATION)
})
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
    <teleport to="body">
        <div v-if="visible" class="pointer-events-none fixed inset-0 z-[10002] overflow-hidden" aria-hidden="true">
            <component
                :is="p.icon"
                v-for="p in pieces"
                :key="p.id"
                :size="20"
                class="confetti-piece absolute"
                :class="p.color"
                :style="{
                    left: `${p.left}%`,
                    animationDelay: `${p.delay}ms`,
                    animationDuration: `${p.duration}ms`,
                    '--drift': `${p.drift}px`,
                    '--spin': `${p.spin}deg`,
                }"
            />
        </div>
    </teleport>
</template>

<style scoped>
.confetti-piece {
    top: -32px;
    animation-name: confetti-fall;
    animation-timing-function: ease-in;
    animation-fill-mode: forwards;
}

@keyframes confetti-fall {
    from {
        transform: translate3d(0, 0, 0) rotate(0deg);
        opacity: 1;
    }
    to {
        transform: translate3d(var(--drift, 0), 105vh, 0) rotate(var(--spin, 180deg));
        opacity: 0.2;
    }
}

@media (prefers-reduced-motion: reduce) {
    .confetti-piece {
        animation: none;
        display: none;
    }
}
</style>
