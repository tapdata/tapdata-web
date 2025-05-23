import { observable, define, action } from '@formily/reactive'
import { calcDistanceOfPointToRect, calcDistancePointToEdge, isNearAfter, isPointInRect } from '@tap/shared'
import { DragNodeEvent, DropNodeEvent } from '../events'

export const ClosestPosition = {
  Before: 'BEFORE',
  ForbidBefore: 'FORBID_BEFORE',
  After: 'After',
  ForbidAfter: 'FORBID_AFTER',
  Upper: 'UPPER',
  ForbidUpper: 'FORBID_UPPER',
  Under: 'UNDER',
  ForbidUnder: 'FORBID_UNDER',
  Inner: 'INNER',
  ForbidInner: 'FORBID_INNER',
  InnerAfter: 'INNER_AFTER',
  ForbidInnerAfter: 'FORBID_INNER_AFTER',
  InnerBefore: 'INNER_BEFORE',
  ForbidInnerBefore: 'FORBID_INNER_BEFORE',
  Forbid: 'FORBID',
}

export class Dragon {
  operation

  rootNode

  dragNodes = []

  touchNode = null

  dropNode = null

  closestNode = null

  closestRect = null

  closestOffsetRect = null

  closestDirection = null

  sensitive = true

  forceBlock = false

  viewport = null

  constructor(props) {
    this.operation = props.operation
    this.viewport = props.viewport
    this.sensitive = props.sensitive
    this.forceBlock = props.forceBlock
    this.rootNode = this.operation.tree
    this.makeObservable()
  }

  getClosestLayout() {
    return this.viewport.getValidNodeLayout(this.closestNode)
  }

  /**
   * 相对最近节点的位置
   */
  getClosestPosition(point) {
    const closestNode = this.closestNode
    if (!closestNode) return ClosestPosition.Forbid
    const closestRect = this.viewport.getValidNodeRect(closestNode)
    const isInline = this.getClosestLayout() === 'horizontal'
    if (!closestRect) {
      return
    }
    const isAfter = isNearAfter(point, closestRect, this.forceBlock ? false : isInline)
    const getValidParent = (node) => {
      if (!node) return
      if (node.parent?.allowSibling(this.dragNodes)) return node.parent
      return getValidParent(node.parent)
    }
    if (isPointInRect(point, closestRect, this.sensitive)) {
      if (!closestNode.allowAppend(this.dragNodes)) {
        if (!closestNode.allowSibling(this.dragNodes)) {
          const parentClosestNode = getValidParent(closestNode)
          if (parentClosestNode) {
            this.closestNode = parentClosestNode
          }
          if (isInline) {
            if (parentClosestNode) {
              if (isAfter) {
                return ClosestPosition.After
              }
              return ClosestPosition.Before
            }
            if (isAfter) {
              return ClosestPosition.ForbidAfter
            }
            return ClosestPosition.ForbidBefore
          } else {
            if (parentClosestNode) {
              if (isAfter) {
                return ClosestPosition.Under
              }
              return ClosestPosition.Upper
            }
            if (isAfter) {
              return ClosestPosition.ForbidUnder
            }
            return ClosestPosition.ForbidUpper
          }
        } else {
          if (isInline) {
            return isAfter ? ClosestPosition.After : ClosestPosition.Before
          } else {
            return isAfter ? ClosestPosition.Under : ClosestPosition.Upper
          }
        }
      }
      if (closestNode.contains(...this.dragNodes)) {
        if (isAfter) {
          return ClosestPosition.InnerAfter
        }
        return ClosestPosition.InnerBefore
      } else {
        return ClosestPosition.Inner
      }
    } else if (closestNode === closestNode.root) {
      return isAfter ? ClosestPosition.InnerAfter : ClosestPosition.InnerBefore
    } else {
      if (!closestNode.allowSibling(this.dragNodes)) {
        const parentClosestNode = getValidParent(closestNode)
        if (parentClosestNode) {
          this.closestNode = parentClosestNode
        }
        if (isInline) {
          if (parentClosestNode) {
            if (isAfter) {
              return ClosestPosition.After
            }
            return ClosestPosition.Before
          }
          return isAfter ? ClosestPosition.ForbidAfter : ClosestPosition.ForbidBefore
        } else {
          if (parentClosestNode) {
            if (isAfter) {
              return ClosestPosition.Under
            }
            return ClosestPosition.Upper
          }
          return isAfter ? ClosestPosition.ForbidUnder : ClosestPosition.ForbidUpper
        }
      }
      if (isInline) {
        return isAfter ? ClosestPosition.After : ClosestPosition.Before
      } else {
        return isAfter ? ClosestPosition.Under : ClosestPosition.Upper
      }
    }
  }

  setClosestPosition(direction) {
    this.closestDirection = direction
  }

  /**
   * 拖拽过程中最近的节点
   */
  getClosestNode(point) {
    if (this.touchNode) {
      const touchNodeRect = this.viewport.getValidNodeRect(this.touchNode)
      if (!touchNodeRect) return
      if (this.touchNode?.children?.length) {
        const touchDistance = calcDistancePointToEdge(point, touchNodeRect)
        let minDistance = touchDistance
        let minDistanceNode = this.touchNode
        this.touchNode.eachChildren((node) => {
          const rect = this.viewport.getElementRectById(node.id)
          if (!rect) return
          const distance = isPointInRect(point, rect, this.sensitive) ? 0 : calcDistanceOfPointToRect(point, rect)
          if (distance <= minDistance) {
            minDistance = distance
            minDistanceNode = node
          }
        })
        return minDistanceNode
      } else {
        return this.touchNode
      }
    }
    return null
  }

  setClosestNode(node) {
    this.closestNode = node
  }

  /**
   * 从最近的节点中计算出节点矩形
   */
  getClosestRect() {
    const closestNode = this.closestNode
    const closestDirection = this.closestDirection
    if (!closestNode || !closestDirection) return
    const closestRect = this.viewport.getValidNodeRect(closestNode)
    if (closestDirection === ClosestPosition.InnerAfter || closestDirection === ClosestPosition.InnerBefore) {
      return this.viewport.getChildrenRect(closestNode)
    } else {
      return closestRect
    }
  }

  setClosestRect(rect) {
    this.closestRect = rect
  }

  getClosestOffsetRect() {
    const closestNode = this.closestNode
    const closestDirection = this.closestDirection
    if (!closestNode || !closestDirection) return
    const closestRect = this.viewport.getValidNodeOffsetRect(closestNode)
    if (closestDirection === ClosestPosition.InnerAfter || closestDirection === ClosestPosition.InnerBefore) {
      return this.viewport.getChildrenOffsetRect(closestNode)
    } else {
      return closestRect
    }
  }

  setClosestOffsetRect(rect) {
    this.closestOffsetRect = rect
  }

  setDragNodes(dragNodes = []) {
    this.dragNodes = dragNodes
    this.trigger(
      new DragNodeEvent({
        target: this.operation.tree,
        source: dragNodes,
      }),
    )
  }

  setTouchNode(node) {
    this.touchNode = node
    if (!node) {
      this.closestNode = null
      this.closestDirection = null
      this.closestOffsetRect = null
      this.closestRect = null
    }
  }

  calculate(props) {
    const { point, touchNode, closestNode, closestDirection } = props
    this.setTouchNode(touchNode)
    this.closestNode = closestNode || this.getClosestNode(point)
    this.closestDirection = closestDirection || this.getClosestPosition(point)
    this.closestRect = this.getClosestRect()
    this.closestOffsetRect = this.getClosestOffsetRect()
  }

  setDropNode(node) {
    this.dropNode = node
    this.trigger(
      new DropNodeEvent({
        target: this.operation.tree,
        source: node,
      }),
    )
  }

  trigger(event) {
    if (this.operation) {
      return this.operation.dispatch(event)
    }
  }

  clear() {
    this.dragNodes = []
    this.touchNode = null
    this.dropNode = null
    this.closestNode = null
    this.closestDirection = null
    this.closestOffsetRect = null
    this.closestRect = null
  }

  makeObservable() {
    define(this, {
      dragNodes: observable.shallow,
      touchNode: observable.ref,
      closestNode: observable.ref,
      closestDirection: observable.ref,
      closestRect: observable.ref,
      setDragNodes: action,
      setTouchNode: action,
      setDropNode: action,
      setClosestNode: action,
      setClosestPosition: action,
      setClosestOffsetRect: action,
      setClosestRect: action,
      clear: action,
      calculate: action,
    })
  }
}
