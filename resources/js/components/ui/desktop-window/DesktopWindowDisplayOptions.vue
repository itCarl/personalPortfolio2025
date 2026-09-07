<script setup lang="ts">
import AppearanceTabs from '@/components/AppearanceTabs.vue';
</script>

<template>
    <div class="p-2">
        <fieldset class="pt-2 px-3 pb-3 border border-primary rounded ">
            <legend class="text-sm px-1 -mx-1">Display</legend>
            <div class="flex flex-col gap-1">
                <div class="grid grid-cols-2 gap-2">
                    <label class="pt-1.5 text-[15px] block mb-1">Color mode</label>
                    <AppearanceTabs />
                </div>
            </div>
        </fieldset>
    </div>
</template>
