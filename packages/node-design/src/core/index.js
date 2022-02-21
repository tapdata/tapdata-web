import { isArr } from '@daas/shared'
import { TreeNode } from './models'

export const createBehavior = (...behaviors) => {
  return behaviors.reduce((buf, behavior) => {
    if (isArr(behavior)) return buf.concat(createBehavior(...behavior))
    const { selector } = behavior || {}
    if (!selector) return buf
    if (typeof selector === 'string') {
      behavior.selector = node => node.componentName === selector
    }
    return buf.concat(behavior)
  }, [])
}

export const createResource = (...sources) => {
  return sources.reduce((buf, source) => {
    return buf.concat({
      ...source,
      node: new TreeNode({
        componentName: '$$ResourceNode$$',
        isSourceNode: true,
        children: source.elements || []
      })
    })
  }, [])
}
