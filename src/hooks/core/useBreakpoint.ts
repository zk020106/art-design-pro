import { useBreakpoints } from '@vueuse/core'
import { ColProps } from 'element-plus'
import { type ComputedRef, computed } from 'vue'

type ColBreakpoint = Pick<ColProps, 'xs' | 'sm' | 'md' | 'lg' | 'xl'>
type Breakpoint = keyof ColBreakpoint

export function useBreakpoint() {
  const breakpoints = useBreakpoints({
    xs: 576, // <576
    sm: 576, // >= 576
    md: 768, // >=768
    lg: 992, // >=992
    xl: 1200, // >=1200
    xxl: 1600 // >=1600
  })

  const arr = breakpoints.current() as ComputedRef<Breakpoint[]>
  const breakpoint = computed(() => {
    return arr.value.length ? arr.value[arr.value.length - 1] : 'xs'
  })

  return { breakpoint }
}
