import { action, define, observable, toJS } from '@formily/reactive'
import { uid, isFn } from '@tap/shared'
import {
  InsertBeforeEvent,
  InsertAfterEvent,
  InsertChildrenEvent,
  PrependNodeEvent,
  AppendNodeEvent,
  WrapNodeEvent,
  UpdateChildrenEvent,
  RemoveNodeEvent,
  UpdateNodePropsEvent,
  CloneNodeEvent,
  FromNodeEvent,
} from '../events'
import { GlobalRegistry } from '../registry'
import { mergeLocales } from '../internals'

// 资源的节点Node
const TreeNodes = new Map()

// 设计器可以编辑的属性
const CommonDesignerPropsMap = new Map()

const removeNode = (node) => {
  if (node.parent) {
    node.parent.children = node.parent.children.filter((child) => child !== node)
  }
}

const resetNodesParent = (nodes, parent) => {
  const resetDepth = (node) => {
    node.depth = node.parent ? node.parent.depth + 1 : 0
    node.children.forEach(resetDepth)
  }

  const shallowReset = (node) => {
    node.parent = parent
    node.root = parent.root
    resetDepth(node)
  }

  const deepReset = (node) => {
    shallowReset(node)
    resetNodesParent(node.children, node)
  }

  return nodes.map((node) => {
    if (node === parent) return node
    if (!parent.isSourceNode) {
      if (node.isSourceNode) {
        node = node.clone(parent)
        resetDepth(node)
      } else if (!node.isRoot && node.isInOperation) {
        node.root.operation.selection.remove(node)
        removeNode(node)
        shallowReset(node)
      } else {
        deepReset(node)
      }
    } else {
      deepReset(node)
    }
    if (!TreeNodes.has(node.id)) {
      TreeNodes.set(node.id, node)
      CommonDesignerPropsMap.set(node.componentName, node.designerProps)
    }
    return node
  })
}

const resetParent = (node, parent) => {
  return resetNodesParent([node], parent)[0]
}

const resolveDesignerProps = (node, props) => {
  if (isFn(props)) return props(node)
  return props
}

export class TreeNode {
  parent

  root

  operation

  id

  depth = 0

  hidden = false

  componentName = 'NO_NAME_COMPONENT'

  sourceName = ''

  props = {}

  children = []

  isSelfSourceNode

  constructor(node, parent) {
    if (node instanceof TreeNode) {
      return node
    }
    this.id = node.id || uid()
    if (parent) {
      this.parent = parent
      this.depth = parent.depth + 1
      this.root = parent.root
      TreeNodes.set(this.id, this)
    } else {
      this.root = this
      this.operation = node.operation
      this.isSelfSourceNode = node.isSourceNode || false
      TreeNodes.set(this.id, this)
    }
    if (node) {
      this.from(node)
    }
    this.makeObservable()
  }

  makeObservable() {
    define(this, {
      componentName: observable.ref,
      props: observable,
      hidden: observable.ref,
      children: observable.shallow,
      designerProps: observable.computed,
      designerLocales: observable.computed,
      wrap: action,
      prepend: action,
      append: action,
      insertAfter: action,
      insertBefore: action,
      remove: action,
      setProps: action,
      setChildren: action,
      setComponentName: action,
    })
  }

  get designerProps() {
    const behaviors = GlobalRegistry.getDesignerBehaviors(this)
    const designerProps = behaviors.reduce((buf, pattern) => {
      if (!pattern.designerProps) return buf
      Object.assign(buf, resolveDesignerProps(this, pattern.designerProps))
      return buf
    }, {})
    return designerProps
  }

  get designerLocales() {
    const behaviors = GlobalRegistry.getDesignerBehaviors(this)
    const designerLocales = behaviors.reduce((buf, pattern) => {
      if (!pattern.designerLocales) return buf
      mergeLocales(buf, pattern.designerLocales)
      return buf
    }, {})
    return designerLocales
  }

  get previous() {
    // eslint-disable-next-line getter-return
    if (this.parent === this || !this.parent) return
    return this.parent.children[this.index - 1]
  }

  get next() {
    // eslint-disable-next-line getter-return
    if (this.parent === this || !this.parent) return
    return this.parent.children[this.index + 1]
  }

  get siblings() {
    if (this.parent) {
      return this.parent.children.filter((node) => node !== this)
    }
    return []
  }

  get index() {
    if (this.parent === this || !this.parent) return 0
    return this.parent.children.indexOf(this)
  }

  get descendants() {
    return this.children.reduce((buf, node) => {
      return buf.concat(node).concat(node.descendants)
    }, [])
  }

  get isRoot() {
    return this === this.root
  }

  get isInOperation() {
    return !!this.root?.operation
  }

  get lastChild() {
    return this.children[this.children.length - 1]
  }

  get firstChild() {
    return this.children[0]
  }

  get isSourceNode() {
    return this.root.isSelfSourceNode
  }

  getPrevious(step = 1) {
    return this.parent.children[this.index - step]
  }

  getAfter(step = 1) {
    return this.parent.children[this.index + step]
  }

  getSibling(index = 0) {
    return this.parent.children[index]
  }

  getParents(node) {
    const _node = node || this
    return _node?.parent ? [_node.parent].concat(this.getParents(_node.parent)) : []
  }

  getParentByDepth(depth = 0) {
    let parent = this.parent
    if (parent?.depth === depth) {
      return parent
    } else {
      return parent?.getParentByDepth(depth)
    }
  }

  getMessage(token) {
    return GlobalRegistry.getDesignerMessage(token, this.designerLocales)
  }

  isMyAncestor(node) {
    if (node === this || this.parent === node) return false
    return node.contains(this)
  }

  isMyParent(node) {
    return this.parent === node
  }

  isMyParents(node) {
    if (node === this) return false
    return this.isMyParent(node) || this.isMyAncestor(node)
  }

  isMyChild(node) {
    return node.isMyParent(this)
  }

  isMyChildren(node) {
    return node.isMyParents(this)
  }

  takeSnapshot(type) {
    if (this.root?.operation) {
      this.root.operation.snapshot(type)
    }
  }

  triggerMutation(event, callback, defaults) {
    if (this.root?.operation) {
      const result = this.root.operation.dispatch(event, callback) || defaults
      this.takeSnapshot(event?.type)
      return result
    } else if (isFn(callback)) {
      return callback()
    }
  }

  find(finder) {
    if (finder(this)) {
      return this
    } else {
      let finded = undefined
      this.eachChildren((node) => {
        if (finder(node)) {
          finded = node
          return false
        }
      })
      return finded
    }
  }

  findAll(finder) {
    const results = []
    if (finder(this)) {
      results.push(this)
    }
    this.eachChildren((node) => {
      if (finder(node)) {
        results.push(node)
      }
    })
    return results
  }

  distanceTo(node) {
    if (this.root !== node.root) {
      return Infinity
    }
    if (this.parent !== node.parent) {
      return Infinity
    }
    return Math.abs(this.index - node.index)
  }

  crossSiblings(node) {
    if (this.parent !== node.parent) return []
    const minIndex = Math.min(this.index, node.index)
    const maxIndex = Math.max(this.index, node.index)
    const results = []
    for (let i = minIndex + 1; i < maxIndex; i++) {
      results.push(this.parent.children[i])
    }
    return results
  }

  allowSibling(nodes) {
    if (this.designerProps?.allowSiblings?.(this, nodes) === false) return false
    return this.parent?.allowAppend(nodes)
  }

  allowDrop(parent) {
    if (!isFn(this.designerProps.allowDrop)) return true
    return this.designerProps.allowDrop(parent)
  }

  allowAppend(nodes) {
    if (!this.designerProps?.droppable) return false
    if (this.designerProps?.allowAppend?.(this, nodes) === false) return false
    if (nodes.some((node) => !node.allowDrop(this))) return false
    if (this.root === this) return true
    return true
  }

  allowClone() {
    if (this === this.root) return false
    return this.designerProps.cloneable ?? true
  }

  allowDrag() {
    if (this === this.root && !this.isSourceNode) return false
    return this.designerProps.draggable ?? true
  }

  allowResize() {
    if (this === this.root && !this.isSourceNode) return false
    const { resizable } = this.designerProps
    if (!resizable) return false
    if (resizable.width && resizable.height) return ['x', 'y']
    if (resizable.width) return ['x']
    return ['y']
  }

  allowTranslate() {
    if (this === this.root && !this.isSourceNode) return false
    const { translatable } = this.designerProps
    if (translatable?.x && translatable?.y) return true
    return false
  }

  allowDelete() {
    if (this === this.root) return false
    return this.designerProps.deletable ?? true
  }

  findById(id) {
    if (!id) return
    if (this.id === id) return this
    if (this.children?.length > 0) {
      return TreeNodes.get(id)
    }
  }

  contains(...nodes) {
    return nodes.every((node) => {
      if (node === this || node?.parent === this || node?.getParentByDepth(this.depth) === this) {
        return true
      }
      return false
    })
  }

  eachChildren(callback) {
    if (isFn(callback)) {
      for (let i = 0; i < this.children.length; i++) {
        const node = this.children[i]
        if (callback(node) === false) return
        node.eachChildren(callback)
      }
    }
  }

  resetNodesParent(nodes, parent) {
    return resetNodesParent(
      nodes.filter((node) => node !== this),
      parent,
    )
  }

  setProps(props) {
    return this.triggerMutation(
      new UpdateNodePropsEvent({
        target: this,
        source: null,
      }),
      () => {
        Object.assign(this.props, props)
      },
    )
  }

  setComponentName(componentName) {
    this.componentName = componentName
  }

  prepend(...nodes) {
    if (nodes.some((node) => node.contains(this))) return []
    const originSourceParents = nodes.map((node) => node.parent)
    const newNodes = this.resetNodesParent(nodes, this)
    if (!newNodes.length) return []
    return this.triggerMutation(
      new PrependNodeEvent({
        originSourceParents,
        target: this,
        source: newNodes,
      }),
      () => {
        this.children = newNodes.concat(this.children)
        return newNodes
      },
      [],
    )
  }

  append(...nodes) {
    if (nodes.some((node) => node.contains(this))) return []
    const originSourceParents = nodes.map((node) => node.parent)
    const newNodes = this.resetNodesParent(nodes, this)
    if (!newNodes.length) return []
    return this.triggerMutation(
      new AppendNodeEvent({
        originSourceParents,
        target: this,
        source: newNodes,
      }),
      () => {
        this.children = this.children.concat(newNodes)
        return newNodes
      },
      [],
    )
  }

  wrap(wrapper) {
    if (wrapper === this) return
    const parent = this.parent
    return this.triggerMutation(
      new WrapNodeEvent({
        target: this,
        source: wrapper,
      }),
      () => {
        resetParent(this, wrapper)
        resetParent(wrapper, parent)
        return wrapper
      },
    )
  }

  insertAfter(...nodes) {
    const parent = this.parent
    if (nodes.some((node) => node.contains(this))) return []
    if (parent?.children?.length) {
      const originSourceParents = nodes.map((node) => node.parent)
      const newNodes = this.resetNodesParent(nodes, parent)
      if (!newNodes.length) return []

      return this.triggerMutation(
        new InsertAfterEvent({
          originSourceParents,
          target: this,
          source: newNodes,
        }),
        () => {
          parent.children = parent.children.reduce((buf, node) => {
            if (node === this) {
              return buf.concat([node]).concat(newNodes)
            } else {
              return buf.concat([node])
            }
          }, [])
          return newNodes
        },
        [],
      )
    }
    return []
  }

  insertBefore(...nodes) {
    const parent = this.parent
    if (nodes.some((node) => node.contains(this))) return []
    if (parent?.children?.length) {
      const originSourceParents = nodes.map((node) => node.parent)
      const newNodes = this.resetNodesParent(nodes, parent)
      if (!newNodes.length) return []
      return this.triggerMutation(
        new InsertBeforeEvent({
          originSourceParents,
          target: this,
          source: newNodes,
        }),
        () => {
          parent.children = parent.children.reduce((buf, node) => {
            if (node === this) {
              return buf.concat(newNodes).concat([node])
            } else {
              return buf.concat([node])
            }
          }, [])
          return newNodes
        },
        [],
      )
    }
    return []
  }

  insertChildren(start, ...nodes) {
    if (nodes.some((node) => node.contains(this))) return []
    if (this.children?.length) {
      const originSourceParents = nodes.map((node) => node.parent)
      const newNodes = this.resetNodesParent(nodes, this)
      if (!newNodes.length) return []
      return this.triggerMutation(
        new InsertChildrenEvent({
          originSourceParents,
          target: this,
          source: newNodes,
        }),
        () => {
          this.children = this.children.reduce((buf, node, index) => {
            if (index === start) {
              return buf.concat(newNodes).concat([node])
            }
            return buf.concat([node])
          }, [])
          return newNodes
        },
        [],
      )
    }
    return []
  }

  setChildren(...nodes) {
    const originSourceParents = nodes.map((node) => node.parent)
    const newNodes = this.resetNodesParent(nodes, this)
    return this.triggerMutation(
      new UpdateChildrenEvent({
        originSourceParents,
        target: this,
        source: newNodes,
      }),
      () => {
        this.children = newNodes
        return newNodes
      },
      [],
    )
  }

  /**
   * @deprecated
   * please use `setChildren`
   */
  setNodeChildren(...nodes) {
    return this.setChildren(...nodes)
  }

  remove() {
    return this.triggerMutation(
      new RemoveNodeEvent({
        target: this,
        source: null,
      }),
      () => {
        removeNode(this)
        TreeNodes.delete(this.id)
      },
    )
  }

  clone(parent) {
    const newNode = new TreeNode(
      {
        id: uid(),
        componentName: this.componentName,
        sourceName: this.sourceName,
        props: toJS(this.props),
        children: [],
      },
      parent ? parent : this.parent,
    )
    newNode.children = resetNodesParent(
      this.children.map((child) => {
        return child.clone(newNode)
      }),
      newNode,
    )
    return this.triggerMutation(
      new CloneNodeEvent({
        target: this,
        source: newNode,
      }),
      () => newNode,
    )
  }

  from(node) {
    if (!node) return
    return this.triggerMutation(
      new FromNodeEvent({
        target: this,
        source: node,
      }),
      () => {
        if (node.id && node.id !== this.id) {
          TreeNodes.delete(this.id)
          TreeNodes.set(node.id, this)
          this.id = node.id
        }
        if (node.componentName) {
          this.componentName = node.componentName
        }
        this.props = node.props ?? {}
        if (node.hidden) {
          this.hidden = node.hidden
        }
        if (node.children) {
          this.children =
            node.children?.map?.((node) => {
              return new TreeNode(node, this)
            }) || []
        }
      },
    )
  }

  serialize() {
    return {
      id: this.id,
      componentName: this.componentName,
      sourceName: this.sourceName,
      props: toJS(this.props),
      hidden: this.hidden,
      children: this.children.map((treeNode) => {
        return treeNode.serialize()
      }),
    }
  }

  static create(node, parent) {
    return new TreeNode(node, parent)
  }

  static findById(id) {
    return TreeNodes.get(id)
  }
}
