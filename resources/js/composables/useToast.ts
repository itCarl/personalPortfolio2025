import { reactive, readonly } from 'vue'

type Toast = { id: number; message: string }

let counter = 0
const state = reactive({
    toasts: [] as Toast[],
})

export function useToast() {
    function dismiss(id: number) {
        const i = state.toasts.findIndex(t => t.id === id)
        if (i !== -1) state.toasts.splice(i, 1)
    }

    function toast(message: string, duration = 2200) {
        const id = ++counter
        state.toasts.push({ id, message })
        setTimeout(() => dismiss(id), duration)
        return id
    }

    return {
        toasts: readonly(state.toasts),
        toast,
        dismiss,
    }
}
