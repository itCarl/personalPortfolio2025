<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronRight, ExternalLink } from 'lucide-vue-next'
import { projects, type Project } from '@/data/projects'

type Filter = Project['category'] | 'all'

const props = withDefaults(defineProps<{ initialFilter?: Filter }>(), {
    initialFilter: 'all',
})

const filters: { value: Filter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'web', label: 'Web' },
    { value: 'tools', label: 'Tools' },
    { value: '3d-printing', label: '3D printing' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'games', label: 'Games' },
]

const categoryLabels: Record<Project['category'], string> = {
    web: 'Web',
    tools: 'Tools',
    '3d-printing': '3D printing',
    electronics: 'Electronics',
    games: 'Games',
}

// One pastel per category so a card is recognisable at a glance.
const categoryBadge: Record<Project['category'], string> = {
    web: 'bg-pastel-blue-soft',
    tools: 'bg-pastel-purple-soft',
    '3d-printing': 'bg-pastel-green-soft',
    electronics: 'bg-pastel-red-soft',
    games: 'bg-secondary',
}

const activeFilter = ref<Filter>(props.initialFilter)
const expanded = ref<string | null>(null)

const visibleProjects = computed(() =>
    activeFilter.value === 'all'
        ? projects
        : projects.filter((project) => project.category === activeFilter.value)
)

function setFilter(value: Filter) {
    activeFilter.value = value
    expanded.value = null
}

function toggle(slug: string) {
    expanded.value = expanded.value === slug ? null : slug
}
</script>

<template>
    <div class="space-y-4 p-6 text-body dark:text-foreground">
        <header class="space-y-1">
            <h2 class="text-xl font-bold text-ink dark:text-foreground">Projects</h2>
            <p class="text-sm text-mute">
                Things I built and finished — click a card for the story behind it.
            </p>
        </header>

        <ul class="flex flex-wrap gap-2">
            <li v-for="filter in filters" :key="filter.value">
                <button
                    type="button"
                    class="press rounded-full border border-hairline px-3 py-1 text-xs font-medium"
                    :class="
                        activeFilter === filter.value
                            ? 'bg-brand text-ink'
                            : 'bg-secondary text-ink hover:bg-accent dark:text-foreground'
                    "
                    :aria-pressed="activeFilter === filter.value"
                    @click="setFilter(filter.value)"
                >
                    {{ filter.label }}
                </button>
            </li>
        </ul>

        <div class="space-y-3">
            <article
                v-for="project in visibleProjects"
                :key="project.slug"
                class="overflow-hidden rounded-md border border-hairline bg-card"
            >
                <button
                    type="button"
                    class="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-accent"
                    :aria-expanded="expanded === project.slug"
                    @click="toggle(project.slug)"
                >
                    <ChevronRight
                        :size="16"
                        class="mt-1 shrink-0 text-mute transition-transform"
                        :class="{ 'rotate-90': expanded === project.slug }"
                    />
                    <span class="min-w-0 flex-1 space-y-2">
                        <span class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                            <span class="font-semibold text-ink dark:text-foreground">{{ project.title }}</span>
                            <span class="text-xs text-mute">{{ project.year }}</span>
                            <span
                                class="rounded-full px-2 py-0.5 text-[11px] font-medium text-ink"
                                :class="categoryBadge[project.category]"
                            >
                                {{ categoryLabels[project.category] }}
                            </span>
                        </span>
                        <span class="block text-sm">{{ project.summary }}</span>
                        <span class="flex flex-wrap gap-1">
                            <span
                                v-for="tag in project.tags"
                                :key="tag"
                                class="rounded-full border border-hairline bg-secondary px-2 py-0.5 text-[11px] text-ink dark:text-foreground"
                            >
                                {{ tag }}
                            </span>
                        </span>
                    </span>
                </button>

                <div
                    v-if="expanded === project.slug"
                    class="space-y-3 border-t border-hairline px-4 py-3"
                >
                    <p class="text-sm">{{ project.description }}</p>

                    <img
                        v-if="project.image"
                        :src="project.image"
                        :alt="project.title"
                        loading="lazy"
                        class="block w-full rounded-md border border-hairline bg-surface-soft"
                    />

                    <div v-if="project.links?.length" class="flex flex-wrap gap-2">
                        <a
                            v-for="link in project.links"
                            :key="link.href"
                            :href="link.href"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="press inline-flex items-center gap-1.5 rounded-md border border-hairline bg-secondary px-3 py-1.5 text-xs font-medium text-ink hover:bg-accent dark:text-foreground"
                        >
                            <ExternalLink :size="13" />
                            {{ link.label }}
                        </a>
                    </div>
                </div>
            </article>
        </div>
    </div>
</template>
