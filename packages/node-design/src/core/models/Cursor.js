import { action, define, observable } from '@formily/reactive'

const globalThisPolyfill = window

export const CursorStatus = {
  Normal: 'NORMAL',
  DragStart: 'DRAG_START',
  Dragging: 'DRAGGING',
  DragStop: 'DRAG_STOP'
}

export const CursorType = {
  Move: 'MOVE',
  Selection: 'SELECTION'
}

const DEFAULT_POSITION = {
  pageX: 0,
  pageY: 0,
  clientX: 0,
  clientY: 0,
  topPageX: 0,
  topPageY: 0,
  topClientX: 0,
  topClientY: 0
}

const DEFAULT_SCROLL_OFFSET = {
  scrollX: 0,
  scrollY: 0
}

const setCursorStyle = (contentWindow, style) => {
  const currentRoot = document?.getElementsByTagName?.('html')?.[0]
  const root = contentWindow?.document?.getElementsByTagName('html')?.[0]
  if (root && root.style.cursor !== style) {
    root.style.cursor = style
  }
  if (currentRoot && currentRoot.style.cursor !== style) {
    currentRoot.style.cursor = style
  }
}

export class Cursor {
  engine

  type = CursorType.Move

  status = CursorStatus.Normal

  position = DEFAULT_POSITION

  dragStartPosition = DEFAULT_POSITION

  dragStartScrollOffset = DEFAULT_SCROLL_OFFSET

  dragEndPosition = DEFAULT_POSITION

  dragEndScrollOffset = DEFAULT_SCROLL_OFFSET

  view = globalThisPolyfill

  constructor(engine) {
    this.engine = engine
    this.makeObservable()
  }

  makeObservable() {
    define(this, {
      type: observable.ref,
      status: observable.ref,
      position: observable.ref,
      dragStartPosition: observable.ref,
      dragStartScrollOffset: observable.ref,
      dragEndPosition: observable.ref,
      dragEndScrollOffset: observable.ref,
      view: observable.ref,
      setStyle: action,
      setPosition: action,
      setStatus: action,
      setType: action
    })
  }

  setStatus(status) {
    this.status = status
  }

  setType(type) {
    this.type = type
  }

  setStyle(style) {
    this.engine.workbench.eachWorkspace(workspace => {
      setCursorStyle(workspace.viewport.contentWindow, style)
    })
  }

  setPosition(position) {
    this.position = {
      ...this.position,
      ...position
    }
  }
  setDragStartPosition(position) {
    this.dragStartPosition = {
      ...this.dragStartPosition,
      ...position
    }
  }
  setDragEndPosition(position) {
    this.dragEndPosition = {
      ...this.dragEndPosition,
      ...position
    }
  }
  setDragStartScrollOffset(offset) {
    this.dragStartScrollOffset = {
      ...this.dragStartScrollOffset,
      ...offset
    }
  }
  setDragEndScrollOffset(offset) {
    this.dragEndScrollOffset = {
      ...this.dragEndScrollOffset,
      ...offset
    }
  }
}
