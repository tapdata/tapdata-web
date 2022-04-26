import { Viewport } from './Viewport'
import { Operation } from './Operation'
import { uid } from '@daas/shared'

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
