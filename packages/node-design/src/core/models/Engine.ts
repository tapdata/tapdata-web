import { TreeNode } from './TreeNode'
import { Workbench } from './Workbench'
import { Cursor } from './Cursor'
import { Keyboard } from './Keyboard'
import { Screen } from './Screen'
import { uid, Event } from '@tap/shared'

const globalThisPolyfill = window

/**
 * 设计器引擎
 */

export class Engine extends Event {
  id

  props

  cursor

  workbench

  keyboard

  screen

  constructor(props) {
    super(props)
    this.props = {
      ...Engine.defaultProps,
      ...props,
    }
    this.init()
    this.id = uid()
  }

  init() {
    this.workbench = new Workbench(this)
    this.screen = new Screen(this)
    this.cursor = new Cursor(this)
    this.keyboard = new Keyboard(this)
  }

  setCurrentTree(tree) {
    if (this.workbench.currentWorkspace) {
      this.workbench.currentWorkspace.operation.tree.from(tree)
    }
  }

  getCurrentTree() {
    return this.workbench?.currentWorkspace?.operation?.tree
  }

  getAllSelectedNodes() {
    let results = []
    for (let i = 0; i < this.workbench.workspaces.length; i++) {
      const workspace = this.workbench.workspaces[i]
      results = results.concat(workspace.operation.getSelectedNodes())
    }
    return results
  }

  findNodeById(id) {
    return TreeNode.findById(id)
  }

  findDraggingNodes() {
    const results = []
    this.workbench.eachWorkspace((workspace) => {
      workspace.operation.viewportDragon.dragNodes?.forEach((node) => {
        if (!results.includes(node)) {
          results.push(node)
        }
      })
    })
    return results
  }

  createNode(node, parent) {
    return new TreeNode(node, parent)
  }

  mount() {
    this.attachEvents(globalThisPolyfill)
  }

  unmount() {
    this.detachEvents()
  }

  static defaultProps = {
    shortcuts: [],
    effects: [],
    drivers: [],
    rootComponentName: 'Root',
    sourceIdAttrName: 'data-designer-source-id',
    nodeIdAttrName: 'data-designer-node-id',
    contentEditableAttrName: 'data-content-editable',
    contentEditableNodeIdAttrName: 'data-content-editable-node-id',
    clickStopPropagationAttrName: 'data-click-stop-propagation',
    nodeSelectionIdAttrName: 'data-designer-node-helpers-id',
    nodeDragHandlerAttrName: 'data-designer-node-handler',
    nodeResizeHandlerAttrName: 'data-designer-node-resize-handler',
    outlineNodeIdAttrName: 'data-designer-outline-node-id',
    nodeTranslateAttrName: 'data-designer-node-translate-handler',
    defaultScreenTypeType: 'PC',
  }
}
