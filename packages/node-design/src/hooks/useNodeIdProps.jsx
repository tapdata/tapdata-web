import { useDesigner } from './useDesigner'
import { useTreeNode } from './useTreeNode'

export const useNodeIdProps = (node) => {
  const target = useTreeNode()
  const designer = useDesigner()
  return {
    [designer.props.nodeIdAttrName]: node ? node.id : target.id,
  }
}
