import { EventDriver } from '@daas/shared'
import { MouseClickEvent, MouseDoubleClickEvent } from '../events'

export class MouseClickDriver extends EventDriver {
  onMouseClick = e => {
    const target = e.target
    if (target?.closest(`*[${this.engine.props.clickStopPropagationAttrName}]`)) {
      return
    }
    this.dispatch(
      new MouseClickEvent({
        clientX: e.clientX,
        clientY: e.clientY,
        pageX: e.pageX,
        pageY: e.pageY,
        target: e.target,
        view: e.view
      })
    )
  }

  onMouseDoubleClick = e => {
    const target = e.target
    if (target?.closest(`*[${this.engine.props.clickStopPropagationAttrName}]`)) {
      return
    }
    this.dispatch(
      new MouseDoubleClickEvent({
        clientX: e.clientX,
        clientY: e.clientY,
        pageX: e.pageX,
        pageY: e.pageY,
        target: e.target,
        view: e.view
      })
    )
  }

  attach() {
    this.addEventListener('click', this.onMouseClick, {
      mode: 'onlyChild'
    })
    this.addEventListener('dblclick', this.onMouseDoubleClick, {
      mode: 'onlyChild'
    })
  }

  detach() {
    this.removeEventListener('click', this.onMouseClick, {
      mode: 'onlyChild'
    })
    this.removeEventListener('dblclick', this.onMouseDoubleClick, {
      mode: 'onlyChild'
    })
  }
}
