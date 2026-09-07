<script setup lang="ts">
import type { Component } from '@vue/runtime-core'
import { HTMLAttributes, computed, CSSProperties } from 'vue'
import { cn } from '@/lib/utils'
import { FileText } from "lucide-vue-next"

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

// NOTE: the `transform` (incl. centering) is owned by the v-draggable directive
// (center mode), so it isn't set here — otherwise Vue would reset drag position.
// Anchor from right/bottom when provided (e.g. the Trash icon), else top/left.
const iconStyle = computed<CSSProperties>(() => {
    const style: CSSProperties = { position: 'absolute' }
    if (props.right !== undefined) style.right = `${props.right}px`
    else style.left = `${props.left ?? 80}px`
    if (props.bottom !== undefined) style.bottom = `${props.bottom}px`
    else style.top = `${props.top ?? 100}px`
    return style
});

// emit id on double click so parent (Desktop.vue) / manager can open by id
function open() {
    emit('open', props.id)
}
</script>

<template>
    <li v-draggable="{ mode: 'center', bounce: true }"
        :style="iconStyle"
        class="group w-28 flex items-center justify-center hover:z-10 select-none"
    >
        <div
            :class="cn(
                'press flex flex-col items-center justify-center text-ink dark:text-foreground',
                props.class,
            )"
            @dblclick="open"
        >
            <component :is="icon" :size="30"/>
            <p class="px-1 mt-1 text-sm rounded bg-background group-hover:bg-surface-soft transition-colors duration-100">{{ title }}</p>
        </div>
    </li>
</template>
