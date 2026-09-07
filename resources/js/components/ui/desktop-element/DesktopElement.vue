<script setup lang="ts">
import type { Component } from '@vue/runtime-core'
import { HTMLAttributes, computed, CSSProperties } from 'vue'
import { cn } from '@/lib/utils'
import { FileText } from "lucide-vue-next"
import { useIsMobile } from '@/composables/useIsMobile'

const emit = defineEmits(['open'])

const props = withDefaults(defineProps<{
    id: string
    title: string
    icon?: Component
    top?: number
    left?: number
    right?: number
    bottom?: number
    class?: HTMLAttributes['class']
    contentLoader?: () => Promise<any>
}>(), { icon: FileText, top: undefined, left: undefined, right: undefined, bottom: undefined, contentLoader: undefined })

const isMobile = useIsMobile()

// Without any anchor the icon isn't placed on a canvas — it flows inside a layout
// (the mobile grid), so it stays in normal flow instead of being taken out of it.
const isStatic = computed(() =>
    props.top === undefined && props.left === undefined && props.right === undefined && props.bottom === undefined
)

// NOTE: the `transform` (incl. centering) is owned by the v-draggable directive
// (center mode), so it isn't set here — otherwise Vue would reset drag position.
// Anchor from right/bottom when provided (e.g. the Trash icon), else top/left.
const iconStyle = computed<CSSProperties>(() => {
    if (isStatic.value) return { position: 'relative' }
    const style: CSSProperties = { position: 'absolute' }
    if (props.right !== undefined) style.right = `${props.right}px`
    else style.left = `${props.left ?? 80}px`
    if (props.bottom !== undefined) style.bottom = `${props.bottom}px`
    else style.top = `${props.top ?? 100}px`
    return style
});

// Dragging icons around only makes sense on the absolute desktop canvas.
const dragOptions = computed(() =>
    isMobile.value || isStatic.value ? false : { mode: 'center' as const, bounce: true }
)

// emit id on double click so parent (Desktop.vue) / manager can open by id
function open() {
    emit('open', props.id)
}

// double-click isn't discoverable on touch, so a single tap opens on mobile
function onClick() {
    if (isMobile.value) open()
}
</script>

<template>
    <li v-draggable="dragOptions"
        :style="iconStyle"
        :class="cn(
            'group flex items-center justify-center hover:z-10 select-none',
            isStatic ? 'w-full' : 'w-28',
        )"
    >
        <div
            :class="cn(
                'press flex flex-col items-center justify-center text-ink dark:text-foreground',
                props.class,
            )"
            @click="onClick"
            @dblclick="open"
        >
            <component :is="icon" :size="30"/>
            <p class="px-1 mt-1 text-sm rounded bg-background group-hover:bg-surface-soft transition-colors duration-100">{{ title }}</p>
        </div>
    </li>
</template>
