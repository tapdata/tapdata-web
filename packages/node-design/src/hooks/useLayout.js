import { useContext } from '@tap/shared'
import { DesignerLayoutContext } from '../context'

export const useLayout = () => {
  return useContext(DesignerLayoutContext)
}
