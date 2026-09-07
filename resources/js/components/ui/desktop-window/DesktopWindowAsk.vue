<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '@/composables/useToast'

const { toast } = useToast()
const question = ref('')

function send() {
    const text = question.value.trim()
    if (!text) return
    const subject = encodeURIComponent('Question from Portfolio OS')
    const body = encodeURIComponent(text)
    window.location.href = `mailto:contact@maximilian-mewes.de?subject=${subject}&body=${body}`
    toast('Opening your email app…')
}
</script>

<template>
    <div class="space-y-3 p-6 text-body dark:text-foreground">
        <h2 class="text-xl font-bold text-ink dark:text-foreground">Ask a question</h2>
        <p class="text-sm text-mute">Type your question and hit send — it opens a pre-filled email.</p>

        <textarea
            v-model="question"
            rows="5"
            placeholder="What would you like to know?"
            class="w-full resize-none rounded-md border border-hairline bg-card p-3 text-ink outline-none focus:border-brand dark:text-foreground"
        ></textarea>

        <button
            class="press rounded-md bg-brand px-4 py-2 font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!question.trim()"
            @click="send"
        >
            Send →
        </button>
    </div>
</template>
