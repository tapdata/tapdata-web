import { isArr } from '@tap/shared'
import { TreeNode, Engine } from './models'
import { mergeLocales } from './internals'
import { untracked } from '@formily/reactive'
import { DEFAULT_DRIVERS, DEFAULT_EFFECTS } from './presets'

export const isBehaviorHost = (val) =>
  val?.Behavior && isBehaviorList(val.Behavior)

export const isBehaviorList = (val) =>
  Array.isArray(val) && val.every(isBehavior)

export const isBehavior = (val) =>
  val?.name ||
  val?.selector ||
  val?.extends ||
  val?.designerProps ||
  val?.designerLocales

export const isResourceHost = (val) =>
  val?.Resource && isResourceList(val.Resource)

export const isResourceList = (val) =>
  Array.isArray(val) && val.every(isResource)

export const isResource = (val) =>
  val?.node && !!val.node.isSourceNode && val.node instanceof TreeNode

export const createLocales = (...packages) => {
  const results = {}
  packages.forEach((locales) => {
    mergeLocales(results, locales)
  })
  return results
}

export const createBehavior = (...behaviors) => {
  return behaviors.reduce((buf, behavior) => {
    if (isArr(behavior)) return buf.concat(createBehavior(...behavior))
    const { selector } = behavior || {}
    if (!selector) return buf
    if (typeof selector === 'string') {
      behavior.selector = (node) => node.componentName === selector
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
        children: source.elements || [],
      }),
    })
  }, [])
}

export const createDesigner = (props = {}) => {
  const drivers = props.drivers || []
  const effects = props.effects || []
  const shortcuts = props.shortcuts || []
  return untracked(
    () =>
      new Engine({
        ...props,
        effects: [...effects, ...DEFAULT_EFFECTS],
        drivers: [...drivers, ...DEFAULT_DRIVERS],
        shortcuts: [...shortcuts],
      })
  )
}
