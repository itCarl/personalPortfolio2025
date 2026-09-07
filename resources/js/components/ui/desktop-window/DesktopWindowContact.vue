<script setup lang="ts">
import { Mail, Globe, Github, Codepen, Briefcase, Box, Copy } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'

const { toast } = useToast()

const links = [
    { icon: Mail, label: 'contact@maximilian-mewes.de', href: 'mailto:contact@maximilian-mewes.de', copy: 'contact@maximilian-mewes.de' },
    { icon: Globe, label: 'maximilian-mewes.de', href: 'https://maximilian-mewes.de' },
    { icon: Github, label: 'github.com/itCarl', href: 'https://github.com/itCarl' },
    { icon: Codepen, label: 'codepen.io/itcarl', href: 'https://codepen.io/itcarl' },
    { icon: Briefcase, label: 'Xing', href: 'https://www.xing.com/profile/Maximilian_Mewes2/cv' },
    { icon: Box, label: 'Thangs (3D models)', href: 'https://thangs.com/it.Carl' },
]

function copy(text: string) {
    navigator.clipboard?.writeText(text)
    toast('Email copied to clipboard')
}
</script>

<template>
    <div class="space-y-4 p-6 text-body dark:text-foreground">
        <h2 class="text-xl font-bold text-ink dark:text-foreground">Talk to a human</h2>
        <p>Got a project, a question, or just want to say hi? Pick a channel:</p>

        <div class="space-y-2">
            <div
                v-for="link in links"
                :key="link.href"
                class="press flex items-center rounded-md border border-hairline bg-card hover:bg-accent"
            >
                <a
                    :href="link.href"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex flex-1 items-center gap-3 px-4 py-3"
                >
                    <component :is="link.icon" :size="20" class="text-brand" />
                    <span class="text-ink dark:text-foreground">{{ link.label }}</span>
                </a>
                <button
                    v-if="link.copy"
                    class="px-3 py-3 text-mute hover:text-brand"
                    title="Copy email"
                    @click="copy(link.copy)"
                >
                    <Copy :size="16" />
                </button>
            </div>
        </div>
    </div>
</template>
