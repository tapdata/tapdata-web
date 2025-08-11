// import { useContext } from '@tap/shared'
// import { DesignerLayoutContext } from '../context'

// export const useLayout = () => {
//   return useContext(DesignerLayoutContext)
// }

import { inject, ref, type ComputedRef } from 'vue'
import { DesignerLayoutSymbol } from '../context'
import type { IDesignerLayoutContext } from '../types'

export const useLayout = (): ComputedRef<IDesignerLayoutContext> => {
  return window.__DESIGNABLE_LAYOUT__
    ? ref(window.__DESIGNABLE_LAYOUT__)
    : inject(DesignerLayoutSymbol, ref())
}
