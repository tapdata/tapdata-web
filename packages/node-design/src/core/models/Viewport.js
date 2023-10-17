import {
  calcBoundingRect,
  calcElementLayout,
  isHTMLElement,
  isPointInRect,
  requestIdle,
  cancelIdle,
} from '@tap/shared'
import { action, define, observable } from '@formily/reactive'
import { Selector } from './Selector'

/**
 * 视口模型
 */
export class Viewport {
  workspace

  selector

  engine

  contentWindow

  viewportElement

  scrollX = 0

  scrollY = 0

  width = 0

  height = 0

  attachRequest

  nodeIdAttrName

  constructor(props) {
    this.workspace = props.workspace
    this.engine = props.engine
    this.viewportElement = props.viewportElement
    this.contentWindow = props.contentWindow
    this.nodeIdAttrName = props.nodeIdAttrName
    this.selector = new Selector()
    this.digestViewport()
    this.makeObservable()
    this.attachEvents()
  }

  get isScrollLeft() {
    return this.scrollX === 0
  }

  get isScrollTop() {
    return this.scrollY === 0
  }

  get isScrollRight() {
    if (this.isIframe) {
      return (
        this.width + this.scrollX >=
        this.contentWindow?.document?.body?.scrollWidth
      )
    } else if (this.viewportElement) {
      return this.width + this.scrollX >= this.viewportElement?.scrollWidth
    }
  }

  get isScrollBottom() {
    if (this.isIframe) {
      return (
        this.height + this.scrollY >=
        this.contentWindow?.document?.body?.scrollHeight
      )
    } else if (this.viewportElement) {
      return this.height + this.scrollY >= this.viewportElement?.scrollHeight
    }
  }

  get viewportRoot() {
    return this.isIframe
      ? this.contentWindow?.document?.body
      : this.viewportElement
  }

  get isMaster() {
    return this.contentWindow === window
  }

  get isIframe() {
    return !!this.contentWindow?.frameElement && !this.isMaster
  }

  get scrollContainer() {
    return this.isIframe ? this.contentWindow : this.viewportElement
  }

  get rect() {
    const viewportElement = this.viewportElement
    if (viewportElement) return this.getElementRect(viewportElement)
  }

  get innerRect() {
    const rect = this.rect
    return (
      typeof DOMRect !== 'undefined' &&
      new DOMRect(0, 0, rect?.width, rect?.height)
    )
  }

  get offsetX() {
    const rect = this.rect
    if (!rect) return 0
    return rect.x
  }

  get offsetY() {
    const rect = this.rect
    if (!rect) return 0
    return rect.y
  }

  get scale() {
    if (!this.viewportElement) return 1
    const clientRect = this.viewportElement.getBoundingClientRect()
    const offsetWidth = this.viewportElement.offsetWidth
    return Math.round(clientRect.width / offsetWidth)
  }

  digestViewport() {
    if (this.isIframe) {
      this.scrollX = this.contentWindow?.scrollX || 0
      this.scrollY = this.contentWindow?.scrollY || 0
      this.width = this.contentWindow?.innerWidth || 0
      this.height = this.contentWindow?.innerHeight || 0
    } else if (this.viewportElement) {
      this.scrollX = this.viewportElement?.scrollLeft || 0
      this.scrollY = this.viewportElement?.scrollTop || 0
      this.width = this.viewportElement?.clientWidth || 0
      this.height = this.viewportElement?.clientHeight || 0
    }
  }

  elementFromPoint(point) {
    if (this.contentWindow?.document) {
      return this.contentWindow.document.elementFromPoint(point.x, point.y)
    }
  }

  matchViewport(target) {
    if (this.isIframe) {
      return (
        target === this.viewportElement ||
        target === this.contentWindow ||
        target === this.contentWindow?.document
      )
    } else {
      return target === this.viewportElement
    }
  }

  attachEvents() {
    const engine = this.engine
    cancelIdle(this.attachRequest)
    this.attachRequest = requestIdle(() => {
      if (!engine) return
      if (this.isIframe) {
        this.workspace.attachEvents(this.contentWindow, this.contentWindow)
      } else if (isHTMLElement(this.viewportElement)) {
        this.workspace.attachEvents(this.viewportElement, this.contentWindow)
      }
    })
  }

  detachEvents() {
    if (this.isIframe) {
      this.workspace.detachEvents(this.contentWindow)
      this.workspace.detachEvents(this.viewportElement)
    } else if (this.viewportElement) {
      this.workspace.detachEvents(this.viewportElement)
    }
  }

  onMount(element, contentWindow) {
    this.viewportElement = element
    this.contentWindow = contentWindow
    this.attachEvents()
    this.digestViewport()
  }

  onUnmount() {
    this.detachEvents()
  }

  isPointInViewport(point, sensitive) {
    if (!this.rect) return false
    if (!this.containsElement(document.elementFromPoint(point.x, point.y)))
      return false
    return isPointInRect(point, this.rect, sensitive)
  }

  isPointInViewportArea(point, sensitive) {
    if (!this.rect) return false
    return isPointInRect(point, this.rect, sensitive)
  }

  isOffsetPointInViewport(point, sensitive) {
    if (!this.innerRect) return false
    if (!this.containsElement(document.elementFromPoint(point.x, point.y)))
      return false
    return isPointInRect(point, this.innerRect, sensitive)
  }

  makeObservable() {
    define(this, {
      scrollX: observable.ref,
      scrollY: observable.ref,
      width: observable.ref,
      height: observable.ref,
      digestViewport: action,
      viewportElement: observable.ref,
      contentWindow: observable.ref,
    })
  }

  findElementById(id) {
    return this.selector.query(
      this.viewportRoot,
      `*[${this.nodeIdAttrName}='${id}']
      `
    )
  }

  findElementsById(id) {
    if (!id) return []
    return this.selector.queryAll(
      this.viewportRoot,
      `*[${this.nodeIdAttrName}='${id}']
      `
    )
  }

  containsElement(element) {
    let root = this.viewportElement
    if (root === element) return true
    return root?.contains(element)
  }

  getOffsetPoint(topPoint) {
    if (this.isIframe) {
      return {
        x: topPoint.x - this.offsetX + (this.contentWindow?.scrollX ?? 0),
        y: topPoint.y - this.offsetY + (this.contentWindow?.scrollY ?? 0),
      }
    } else {
      return {
        x: topPoint.x - this.offsetX + (this.viewportElement?.scrollLeft ?? 0),
        y: topPoint.y - this.offsetY + (this.viewportElement?.scrollTop ?? 0),
      }
    }
  }

  getElementRect(element) {
    const rect = element.getBoundingClientRect()
    const offsetWidth = element['offsetWidth']
      ? element['offsetWidth']
      : rect.width
    const offsetHeight = element['offsetHeight']
      ? element['offsetHeight']
      : rect.height
    return (
      typeof DOMRect !== 'undefined' &&
      new DOMRect(
        rect.x,
        rect.y,
        this.scale !== 1 ? offsetWidth : rect.width,
        this.scale !== 1 ? offsetHeight : rect.height
      )
    )
  }

  /**
   * 相对于主屏幕
   * @param id
   */
  getElementRectById(id) {
    const elements = this.findElementsById(id)
    const rect = calcBoundingRect(
      elements.map((element) => this.getElementRect(element))
    )
    if (rect) {
      if (this.isIframe) {
        return (
          typeof DOMRect !== 'undefined' &&
          new DOMRect(
            rect.x + this.offsetX,
            rect.y + this.offsetY,
            rect.width,
            rect.height
          )
        )
      } else {
        return (
          typeof DOMRect !== 'undefined' &&
          new DOMRect(rect.x, rect.y, rect.width, rect.height)
        )
      }
    }
  }

  /**
   * 相对于视口
   * @param id
   */
  getElementOffsetRectById(id) {
    const elements = this.findElementsById(id)
    if (!elements.length) return
    const elementRect = calcBoundingRect(
      elements.map((element) => this.getElementRect(element))
    )
    if (elementRect) {
      if (this.isIframe) {
        return (
          typeof DOMRect !== 'undefined' &&
          new DOMRect(
            elementRect.x + this.contentWindow.scrollX,
            elementRect.y + this.contentWindow.scrollY,
            elementRect.width,
            elementRect.height
          )
        )
      } else {
        return (
          typeof DOMRect !== 'undefined' &&
          new DOMRect(
            (elementRect.x - this.offsetX + this.viewportElement.scrollLeft) /
              this.scale,
            (elementRect.y - this.offsetY + this.viewportElement.scrollTop) /
              this.scale,
            elementRect.width,
            elementRect.height
          )
        )
      }
    }
  }

  getValidNodeElement(node) {
    const getNodeElement = (node) => {
      if (!node) return
      const ele = this.findElementById(node.id)
      if (ele) {
        return ele
      } else {
        return getNodeElement(node.parent)
      }
    }
    return getNodeElement(node)
  }

  getChildrenRect(node) {
    if (!node?.children?.length) return

    return calcBoundingRect(
      node.children.reduce((buf, child) => {
        const rect = this.getValidNodeRect(child)
        if (rect) {
          return buf.concat(rect)
        }
        return buf
      }, [])
    )
  }

  getChildrenOffsetRect(node) {
    if (!node?.children?.length) return

    return calcBoundingRect(
      node.children.reduce((buf, child) => {
        const rect = this.getValidNodeOffsetRect(child)
        if (rect) {
          return buf.concat(rect)
        }
        return buf
      }, [])
    )
  }

  getValidNodeRect(node) {
    if (!node) return
    const rect = this.getElementRectById(node.id)
    if (node && node === node.root) {
      if (!rect) return this.rect
      return calcBoundingRect([this.rect, rect])
    }

    if (rect) {
      return rect
    } else {
      return this.getChildrenRect(node)
    }
  }

  getValidNodeOffsetRect(node) {
    if (!node) return

    const rect = this.getElementOffsetRectById(node.id)
    if (node && node === node.root) {
      if (!rect) return this.innerRect
      return calcBoundingRect([this.innerRect, rect])
    }
    if (rect) {
      return rect
    } else {
      return this.getChildrenOffsetRect(node)
    }
  }

  getValidNodeLayout(node) {
    if (!node) return 'vertical'
    if (node.parent?.designerProps?.inlineChildrenLayout) return 'horizontal'
    return calcElementLayout(this.findElementById(node.id))
  }
}
