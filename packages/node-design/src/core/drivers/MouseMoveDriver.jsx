import { EventDriver } from '@tap/shared'
import { MouseMoveEvent } from '../events'
export class MouseMoveDriver extends EventDriver {
  request = null

  onMouseMove = (e) => {
    this.request = requestAnimationFrame(() => {
      cancelAnimationFrame(this.request)
      this.dispatch(
        new MouseMoveEvent({
          clientX: e.clientX,
          clientY: e.clientY,
          pageX: e.pageX,
          pageY: e.pageY,
          target: e.target,
          view: e.view,
        }),
      )
    })
  }

  attach() {
    this.addEventListener('mousemove', this.onMouseMove, {
      mode: 'onlyOne',
    })
  }

  detach() {
    this.removeEventListener('mousemove', this.onMouseMove, {
      mode: 'onlyOne',
    })
  }
}
