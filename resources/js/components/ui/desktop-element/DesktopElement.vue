<script setup lang="ts">
import type { Component } from '@vue/runtime-core'
import { HTMLAttributes, computed, CSSProperties } from 'vue'
import { cn } from '@/lib/utils'
import { FileText } from "lucide-vue-next"
import draggable from '../../../directives/draggable.js';

const emit = defineEmits(['open'])

const props = withDefaults(defineProps<{
    id: string
    title: string
    icon?: Component
    top?: number
    left?: number
    class?: HTMLAttributes['class']
    contentLoader?: () => Promise<any>
}>(), { icon: FileText, top: 100, left: 80, contentLoader: undefined })

const iconStyle = computed<CSSProperties>(() => ({
    position: 'absolute',
    top: `${props.top}px`,
    left: `${props.left}px`,
    transform: `translate(-50%, -50%)`,
}));

// emit id on double click so parent (Desktop.vue) / manager can open by id
function open() {
    emit('open', props.id)
}
</script>

<template>
    <li v-draggable
        :style="iconStyle"
        class="group w-28 flex items-center justify-center hover:z-10 select-none"
    >
        <div
            :class="cn(
                'flex flex-col items-center justify-center',
                props.class,
            )"
            @dblclick="open"
        >
            <component :is="icon" :size="30"/>
            <p class="px-0.5 mt-1 text-sm bg-[#e1d7c2] group-hover:bg-[#eeefe9] transition-colors duration-100">{{ title }}</p>
        </div>
    </li>
</template>
