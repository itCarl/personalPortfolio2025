import { useMediaQuery } from '@vueuse/core'
import type { Ref } from 'vue'

/**
 * Single source of truth for the "the desktop metaphor doesn't fit" breakpoint.
 *
 * Below Tailwind's `md` (768px) icons are laid out as a flowing grid instead of
 * absolute positions and windows fill the desktop area. Nothing else may
 * hard-code this media query — import this composable instead.
 */
export const MOBILE_MEDIA_QUERY = '(max-width: 767px)'

export function useIsMobile(): Ref<boolean> {
    return useMediaQuery(MOBILE_MEDIA_QUERY)
}
