<script setup lang="ts">
import { ref } from 'vue'

const display = ref('0')
const acc = ref<number | null>(null)
const pendingOp = ref<string | null>(null)
const overwrite = ref(true)

function inputDigit(d: string) {
    if (overwrite.value) {
        display.value = d
        overwrite.value = false
    } else {
        display.value = display.value === '0' ? d : display.value + d
    }
}

function inputDot() {
    if (overwrite.value) {
        display.value = '0.'
        overwrite.value = false
        return
    }
    if (!display.value.includes('.')) display.value += '.'
}

function clearAll() {
    display.value = '0'
    acc.value = null
    pendingOp.value = null
    overwrite.value = true
}

function toggleSign() {
    display.value = formatNum(parseFloat(display.value) * -1)
}

function percent() {
    display.value = formatNum(parseFloat(display.value) / 100)
}

function compute(a: number, b: number, op: string): number {
    switch (op) {
        case '+': return a + b
        case '−': return a - b
        case '×': return a * b
        case '÷': return b === 0 ? NaN : a / b
    }
    return b
}

function setOp(op: string) {
    const current = parseFloat(display.value)
    if (acc.value !== null && pendingOp.value && !overwrite.value) {
        const result = compute(acc.value, current, pendingOp.value)
        acc.value = result
        display.value = formatNum(result)
    } else {
        acc.value = current
    }
    pendingOp.value = op
    overwrite.value = true
}

function equals() {
    if (pendingOp.value === null || acc.value === null) return
    const result = compute(acc.value, parseFloat(display.value), pendingOp.value)
    display.value = formatNum(result)
    acc.value = null
    pendingOp.value = null
    overwrite.value = true
}

function formatNum(n: number): string {
    if (!isFinite(n)) return 'Error'
    return String(Math.round(n * 1e10) / 1e10)
}

// buttons stretch to fill their grid cell, so the pad scales with the window
const numKey = 'press rounded-md bg-card border border-hairline text-lg font-medium hover:bg-accent'
const fnKey = 'press rounded-md bg-secondary border border-hairline text-lg font-medium hover:bg-accent'
const opKey = 'press rounded-md bg-brand text-primary-foreground text-lg font-semibold'
</script>

<template>
    <div class="flex h-full flex-col gap-2 p-3 select-none">
        <div class="flex shrink-0 items-center justify-end overflow-x-auto rounded-md bg-surface-dark px-4 py-4 text-right font-mono text-4xl text-white">
            {{ display }}
        </div>
        <div class="grid min-h-0 flex-1 grid-cols-4 grid-rows-5 gap-2">
            <button :class="fnKey" @click="clearAll">C</button>
            <button :class="fnKey" @click="toggleSign">±</button>
            <button :class="fnKey" @click="percent">%</button>
            <button :class="opKey" @click="setOp('÷')">÷</button>

            <button :class="numKey" @click="inputDigit('7')">7</button>
            <button :class="numKey" @click="inputDigit('8')">8</button>
            <button :class="numKey" @click="inputDigit('9')">9</button>
            <button :class="opKey" @click="setOp('×')">×</button>

            <button :class="numKey" @click="inputDigit('4')">4</button>
            <button :class="numKey" @click="inputDigit('5')">5</button>
            <button :class="numKey" @click="inputDigit('6')">6</button>
            <button :class="opKey" @click="setOp('−')">−</button>

            <button :class="numKey" @click="inputDigit('1')">1</button>
            <button :class="numKey" @click="inputDigit('2')">2</button>
            <button :class="numKey" @click="inputDigit('3')">3</button>
            <button :class="opKey" @click="setOp('+')">+</button>

            <button :class="numKey" class="col-span-2" @click="inputDigit('0')">0</button>
            <button :class="numKey" @click="inputDot">.</button>
            <button :class="opKey" @click="equals">=</button>
        </div>
    </div>
</template>
