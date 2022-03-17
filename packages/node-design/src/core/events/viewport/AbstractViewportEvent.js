export class AbstractViewportEvent {
  data
  context
  constructor(data) {
    this.data = data || {
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      width: window.innerWidth,
      height: window.innerHeight,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      view: window,
      target: window
    }
  }
}
