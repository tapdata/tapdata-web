import { useContext } from '@daas/shared'
import { DesignerComponentsContext } from '../context'
export const useComponents = () => useContext(DesignerComponentsContext)
