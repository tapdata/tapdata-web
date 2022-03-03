import { Engine } from './Engine'
import { Viewport } from './Viewport'
import { Operation } from './Operation'
// import { History } from './History'
import { uid } from '@daas/shared'
import { HistoryGotoEvent, HistoryRedoEvent, HistoryUndoEvent, HistoryPushEvent } from '../events'

//工作区模型
export class Workspace {
  id

  title

  description

  engine

  viewport

  outline

  operation

  history

  props

  constructor(engine, props) {
    this.engine = engine
    this.props = props
    this.id = props.id || uid()
    this.title = props.title
    this.description = props.description
    this.viewport = new Viewport({
      engine: this.engine,
      workspace: this,
      viewportElement: props.viewportElement,
      contentWindow: props.contentWindow,
      nodeIdAttrName: this.engine.props.nodeIdAttrName
    })
    this.outline = new Viewport({
      engine: this.engine,
      workspace: this,
      viewportElement: props.viewportElement,
      contentWindow: props.contentWindow,
      nodeIdAttrName: this.engine.props.outlineNodeIdAttrName
    })
    this.operation = new Operation(this)
    // this.history = new History(this, {
    //   onPush: item => {
    //     this.operation.dispatch(new HistoryPushEvent(item))
    //   },
    //   onRedo: item => {
    //     this.operation.hover.clear()
    //     this.operation.dispatch(new HistoryRedoEvent(item))
    //   },
    //   onUndo: item => {
    //     this.operation.hover.clear()
    //     this.operation.dispatch(new HistoryUndoEvent(item))
    //   },
    //   onGoto: item => {
    //     this.operation.hover.clear()
    //     this.operation.dispatch(new HistoryGotoEvent(item))
    //   }
    // })
  }

  getEventContext() {
    return {
      workbench: this.engine.workbench,
      workspace: this,
      engine: this.engine,
      viewport: this.viewport
    }
  }

  attachEvents(container, contentWindow) {
    this.engine.attachEvents(container, contentWindow, this.getEventContext())
  }

  detachEvents(container) {
    this.engine.detachEvents(container)
  }

  dispatch(event) {
    return this.engine.dispatch(event, this.getEventContext())
  }

  serialize() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      operation: this.operation.serialize()
    }
  }

  from(workspace) {
    if (!workspace) return
    if (workspace.operation) {
      this.operation.from(workspace.operation)
    }
    if (workspace.id) {
      this.id = workspace.id
    }
    if (workspace.title) {
      this.title = workspace.title
    }
    if (workspace.description) {
      this.description = workspace.description
    }
  }
}
