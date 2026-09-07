import { inject, ref, type InjectionKey, type Ref } from 'vue'

export type WindowContext = { focused: Ref<boolean>; minimized: Ref<boolean> }

export const WINDOW_CONTEXT_KEY: InjectionKey<WindowContext> = Symbol('desktop-window')

/** Falls back to "always focused" when rendered outside a DesktopWindow (e.g. tests). */
export function useWindowContext(): WindowContext {
    return inject(WINDOW_CONTEXT_KEY, { focused: ref(true), minimized: ref(false) })
}
