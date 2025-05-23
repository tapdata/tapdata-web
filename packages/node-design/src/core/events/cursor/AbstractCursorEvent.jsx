export class AbstractCursorEvent {
  data

  context

  constructor(data) {
    this.data = data || {
      clientX: 0,
      clientY: 0,
      pageX: 0,
      pageY: 0,
      target: null,
      view: window,
    }
    this.transformCoordinates()
  }

  transformCoordinates() {
    const { frameElement } = this.data?.view || {}
    if (frameElement && this.data.view !== window) {
      const frameRect = frameElement.getBoundingClientRect()
      const scale = frameRect.width / frameElement['offsetWidth']
      this.data.topClientX = this.data.clientX * scale + frameRect.x
      this.data.topClientY = this.data.clientY * scale + frameRect.y
      this.data.topPageX = this.data.pageX + frameRect.x - this.data.view.scrollX
      this.data.topPageY = this.data.pageY + frameRect.y - this.data.view.scrollY
      const topElement = document.elementFromPoint(this.data.topPageX, this.data.topClientY)
      if (topElement !== frameElement) {
        this.data.target = topElement
      }
    } else {
      this.data.topClientX = this.data.clientX
      this.data.topClientY = this.data.clientY
      this.data.topPageX = this.data.pageX
      this.data.topPageY = this.data.pageY
    }
  }
}
