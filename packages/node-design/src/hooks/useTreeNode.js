import { useContext } from '@daas/shared'
import { TreeNodeContext } from '../context'

export const useTreeNode = () => {
  return useContext(TreeNodeContext)
}
