import { useContext } from '@tap/shared'
import { DesignerEngineContext } from '../context'

export const useDesigner = () => {
  return useContext(DesignerEngineContext)
}
