<script setup lang="ts">
const stack = ['Laravel 12', 'Inertia 2', 'Vue 3', 'TypeScript', 'Tailwind 4', 'shadcn-vue']
</script>

<template>
    <div class="space-y-4 p-6 text-body dark:text-foreground">
        <header class="space-y-1">
            <h2 class="text-xl font-bold text-ink dark:text-foreground">Portfolio OS</h2>
            <p class="text-sm text-mute">A desktop you can drive in the browser · v0.1</p>
        </header>

        <p>
            This whole portfolio is a tiny operating system: a window manager, draggable
            icons and apps, built from scratch as Vue components.
        </p>

        <div>
            <h3 class="mb-2 text-sm font-semibold uppercase tracking-wide text-mute">Built with</h3>
            <ul class="flex flex-wrap gap-2">
                <li
                    v-for="tech in stack"
                    :key="tech"
                    class="rounded-full border border-hairline bg-secondary px-3 py-1 text-xs font-medium text-ink dark:text-foreground"
                >
                    {{ tech }}
                </li>
            </ul>
        </div>

        <div class="rounded-md bg-pastel-blue-soft px-4 py-3 text-sm text-ink">
            💡 Drag windows by their title bar, resize from the corner, and use the
            <strong>—</strong> button to minimize. They stay inside the desktop.
        </div>
    </div>
</template>
