import { observable, define, action } from '@formily/reactive'
import { SelectNodeEvent, UnSelectNodeEvent } from '../events'
import { isStr, isArr } from '@daas/shared'

export class Selection {
  operation
  selected = []

  constructor(props) {
    if (props.selected) {
      this.selected = props.selected
    }
    if (props.operation) {
      this.operation = props.operation
    }
    this.makeObservable()
  }

  makeObservable() {
    define(this, {
      selected: observable,
      select: action,
      batchSelect: action,
      add: action,
      remove: action,
      clear: action,
      crossAddTo: action
    })
  }

  trigger(type = SelectNodeEvent, fromUser = false) {
    return this.operation.dispatch(
      new type({
        target: this.operation.tree,
        source: this.operation.getSelectedNodes(),
        extra: {
          fromUser
        }
      })
    )
  }

  select(id, fromUser) {
    if (isStr(id)) {
      if (this.selected.length === 1 && this.selected.includes(id)) {
        this.trigger(SelectNodeEvent, fromUser)
        return
      }
      this.selected = [id]
      this.trigger(SelectNodeEvent, fromUser)
    } else {
      this.select(id?.id, fromUser)
    }
  }

  safeSelect(id, fromUser) {
    if (!id) return
    this.select(id, fromUser)
  }

  mapIds(ids) {
    return isArr(ids) ? ids.map(node => (isStr(node) ? node : node?.id)) : []
  }

  batchSelect(ids, fromUser) {
    this.selected = this.mapIds(ids)
    this.trigger(SelectNodeEvent, fromUser)
  }

  batchSafeSelect(ids, fromUser) {
    if (!ids?.length) return
    this.batchSelect(ids, fromUser)
  }

  // eslint-disable-next-line getter-return
  get first() {
    if (this.selected && this.selected.length) return this.selected[0]
  }

  // eslint-disable-next-line getter-return
  get last() {
    if (this.selected && this.selected.length) return this.selected[this.selected.length - 1]
  }

  get length() {
    return this.selected.length
  }

  add(...ids) {
    this.mapIds(ids).forEach(id => {
      if (isStr(id)) {
        if (!this.selected.includes(id)) {
          this.selected.push(id)
        }
      } else {
        this.add(id?.id)
      }
    })
    this.trigger()
  }

  crossAddTo(node) {
    if (node.parent) {
      const selectedNodes = this.operation.getSelectedNodes()
      if (this.has(node)) {
        this.remove(node)
      } else {
        const minDistanceNode = selectedNodes.reduce((minDistanceNode, item) => {
          return item.distanceTo(node) < minDistanceNode.distanceTo(node) ? item : minDistanceNode
        }, selectedNodes[0])
        if (minDistanceNode) {
          const crossNodes = node.crossSiblings(minDistanceNode)
          crossNodes.forEach(node => {
            if (!this.selected.includes(node.id)) {
              this.selected.push(node.id)
            }
          })
        }
        if (!this.selected.includes(node.id)) {
          this.selected.push(node.id)
        }
      }
    }
  }

  remove(...ids) {
    this.mapIds(ids).forEach(id => {
      if (isStr(id)) {
        this.selected = this.selected.filter(item => item !== id)
      } else {
        this.remove(id?.id)
      }
    })
    this.trigger(UnSelectNodeEvent)
  }

  has(...ids) {
    return this.mapIds(ids).some(id => {
      if (isStr(id)) {
        return this.selected.includes(id)
      } else {
        if (!id?.id) return false
        return this.has(id?.id)
      }
    })
  }

  clear() {
    this.selected = []
    this.trigger(UnSelectNodeEvent)
  }
}
