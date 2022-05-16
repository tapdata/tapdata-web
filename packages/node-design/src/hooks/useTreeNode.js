import { useContext } from '@tap/shared'
import { TreeNodeContext } from '../context'

export const useTreeNode = () => {
  return useContext(TreeNodeContext)
}
