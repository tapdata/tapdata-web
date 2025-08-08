import { computed, unref } from 'vue'
import { useLayout } from './useLayout'

export const usePrefix = (after = '') => {
  const layoutRef = useLayout()
  const usePrefixContext = computed(() => unref(layoutRef)?.prefixCls + after)
  return usePrefixContext
}
