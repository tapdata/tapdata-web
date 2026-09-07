import type { TreeOptionProps as ElementPlusTreeOptionProps } from 'element-plus/es/components/tree-v2/src/types'

export type {
  Tree,
  TreeData,
  TreeKey,
  TreeNode,
  TreeNodeData,
  TreeProps,
} from 'element-plus/es/components/tree-v2/src/types'

export type TreeOptionProps = ElementPlusTreeOptionProps & {
  isLeaf?: string
}

export type NodeDropType = 'before' | 'after' | 'inner' | 'none'
