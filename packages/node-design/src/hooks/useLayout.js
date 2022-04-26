import { useContext } from '@daas/shared'
import { DesignerLayoutContext } from '../context'

export const useLayout = () => {
  return useContext(DesignerLayoutContext)
}
