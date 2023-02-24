import { Workspace } from './Workspace'
import { observable, define, action } from '@formily/reactive'
import {
  AddWorkspaceEvent,
  RemoveWorkspaceEvent,
  SwitchWorkspaceEvent,
} from '../events'
export class Workbench {
  workspaces

  currentWorkspace

  activeWorkspace

  engine

  type = 'DESIGNABLE'

  constructor(engine) {
    this.engine = engine
    this.workspaces = []
    this.currentWorkspace = null
    this.activeWorkspace = null
    this.makeObservable()
  }

  makeObservable() {
    define(this, {
      currentWorkspace: observable.ref,
      workspaces: observable.shallow,
      activeWorkspace: observable.ref,
      type: observable.ref,
      switchWorkspace: action,
      addWorkspace: action,
      removeWorkspace: action,
      setActiveWorkspace: action,
      setWorkbenchType: action,
    })
  }

  getEventContext() {
    return {
      engine: this.engine,
      workbench: this.engine.workbench,
      workspace: null,
      viewport: null,
    }
  }

  switchWorkspace(id) {
    const finded = this.findWorkspaceById(id)
    if (finded) {
      this.currentWorkspace = finded
      this.engine.dispatch(new SwitchWorkspaceEvent(finded))
    }
    return this.currentWorkspace
  }

  setActiveWorkspace(workspace) {
    this.activeWorkspace = workspace
    return workspace
  }

  setWorkbenchType(type) {
    this.type = type
  }

  addWorkspace(props) {
    const finded = this.findWorkspaceById(props.id)
    if (!finded) {
      this.currentWorkspace = new Workspace(this.engine, props)
      this.workspaces.push(this.currentWorkspace)
      this.engine.dispatch(new AddWorkspaceEvent(this.currentWorkspace))
      return this.currentWorkspace
    }
    return finded
  }

  removeWorkspace(id) {
    const findIndex = this.findWorkspaceIndexById(id)
    if (findIndex > -1 && findIndex < this.workspaces.length) {
      const findedWorkspace = this.workspaces[findIndex]
      findedWorkspace.viewport.detachEvents()
      this.workspaces.splice(findIndex, 1)
      if (findedWorkspace === this.currentWorkspace) {
        if (this.workspaces.length && this.workspaces[findIndex]) {
          this.currentWorkspace = this.workspaces[findIndex]
        } else {
          this.currentWorkspace = this.workspaces[this.workspaces.length - 1]
        }
      }
      this.engine.dispatch(new RemoveWorkspaceEvent(findedWorkspace))
    }
  }

  ensureWorkspace(props = {}) {
    const workspace = this.findWorkspaceById(props.id)
    if (workspace) return workspace
    this.addWorkspace(props)
    return this.currentWorkspace
  }

  findWorkspaceById(id) {
    return this.workspaces.find((item) => item.id === id)
  }

  findWorkspaceIndexById(id) {
    return this.workspaces.findIndex((item) => item.id === id)
  }

  mapWorkspace(callbackFn) {
    return this.workspaces.map(callbackFn)
  }

  eachWorkspace(callbackFn) {
    this.workspaces.forEach(callbackFn)
  }
}
