import { observable, define, action } from '@formily/reactive'
import { HoverNodeEvent } from '../events'

export class Hover {
  node = null
  operation
  constructor(props) {
    this.operation = props?.operation
    this.makeObservable()
  }

  setHover(node) {
    if (node) {
      this.node = node
    } else {
      this.node = null
    }
    this.trigger()
  }

  clear() {
    this.node = null
  }

  trigger() {
    if (this.operation) {
      return this.operation.dispatch(
        new HoverNodeEvent({
          target: this.operation.tree,
          source: this.node
        })
      )
    }
  }

  makeObservable() {
    define(this, {
      node: observable.ref,
      setHover: action,
      clear: action
    })
  }
}
