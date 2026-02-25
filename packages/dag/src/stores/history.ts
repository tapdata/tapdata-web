import type { useDataflowStore } from './dataflow.store'

// Command names don't serve any particular purpose in the app
// but they make it easier to identify each command on stack
// when debugging
export enum COMMANDS {
  MOVE_NODE = 'moveNode',
  ADD_NODE = 'addNode',
  REMOVE_NODE = 'removeNode',
  ADD_CONNECTION = 'addConnection',
  REMOVE_CONNECTION = 'removeConnection',
  ENABLE_NODE_TOGGLE = 'enableNodeToggle',
  RENAME_NODE = 'renameNode',
}

export type XYPosition = [number, number]

export interface Connection {
  source: string
  target: string
}

export type DataflowStore = ReturnType<typeof useDataflowStore>

export abstract class Undoable {
  abstract getTimestamp(): number
}

export abstract class Command extends Undoable {
  readonly name: string
  readonly timestamp: number

  constructor(name: string, timestamp: number) {
    super()
    this.name = name
    this.timestamp = timestamp
  }

  abstract getReverseCommand(timestamp: number): Command
  abstract isEqualTo(anotherCommand: Command): boolean
  abstract revert(store: DataflowStore): Promise<void>

  getTimestamp(): number {
    return this.timestamp
  }
}

export class BulkCommand extends Undoable {
  commands: Command[]

  constructor(commands: Command[]) {
    super()
    this.commands = commands
  }

  async revert(store: DataflowStore): Promise<void> {
    // Revert commands in reverse order
    for (let i = this.commands.length - 1; i >= 0; i--) {
      const command = this.commands[i]
      if (command) {
        await command.revert(store)
      }
    }
  }

  getTimestamp(): number {
    return Math.max(0, ...this.commands.map((command) => command.timestamp))
  }
}

export class MoveNodeCommand extends Command {
  nodeId: string
  oldPosition: XYPosition
  newPosition: XYPosition

  constructor(
    nodeId: string,
    oldPosition: XYPosition,
    newPosition: XYPosition,
    timestamp: number,
  ) {
    super(COMMANDS.MOVE_NODE, timestamp)
    this.nodeId = nodeId
    // 深拷贝位置数组，避免引用问题
    this.newPosition = [...newPosition] as XYPosition
    this.oldPosition = [...oldPosition] as XYPosition
  }

  getReverseCommand(timestamp: number): Command {
    return new MoveNodeCommand(
      this.nodeId,
      this.newPosition,
      this.oldPosition,
      timestamp,
    )
  }

  isEqualTo(anotherCommand: Command): boolean {
    return (
      anotherCommand instanceof MoveNodeCommand &&
      anotherCommand.nodeId === this.nodeId &&
      anotherCommand.oldPosition[0] === this.oldPosition[0] &&
      anotherCommand.oldPosition[1] === this.oldPosition[1] &&
      anotherCommand.newPosition[0] === this.newPosition[0] &&
      anotherCommand.newPosition[1] === this.newPosition[1]
    )
  }

  async revert(store: DataflowStore): Promise<void> {
    store.setNodePositionById(this.nodeId, this.oldPosition)
  }
}

// 深拷贝节点数据（用于历史记录）
function cloneNodeForHistory(node: any): any {
  return {
    ...node,
    // 深拷贝 attrs 对象，特别是 position
    attrs: {
      ...node.attrs,
      position: node.attrs?.position ? [...node.attrs.position] : [0, 0],
    },
    // 深拷贝输入输出数组
    $inputs: node.$inputs ? [...node.$inputs] : [],
    $outputs: node.$outputs ? [...node.$outputs] : [],
  }
}

export class AddNodeCommand extends Command {
  node: any
  nodeId: string

  constructor(node: any, timestamp: number) {
    super(COMMANDS.ADD_NODE, timestamp)
    // 保存节点ID用于后续操作
    this.nodeId = node.id
    // 深拷贝节点数据，避免引用问题
    this.node = cloneNodeForHistory(node)
  }

  getReverseCommand(timestamp: number): Command {
    return new RemoveNodeCommand(this.node, timestamp)
  }

  isEqualTo(anotherCommand: Command): boolean {
    return (
      anotherCommand instanceof AddNodeCommand &&
      anotherCommand.nodeId === this.nodeId
    )
  }

  async revert(store: DataflowStore): Promise<void> {
    // 使用 nodeId 查找当前节点并删除
    // 注意：不使用 store.deleteNode 因为它会执行 connectAdjacentNodes 等副作用
    // 连线的删除由 AddConnectionCommand.revert() 单独处理
    store.removeNodeById(this.nodeId)
  }
}

export class RemoveNodeCommand extends Command {
  node: any
  nodeId: string

  constructor(node: any, timestamp: number) {
    super(COMMANDS.REMOVE_NODE, timestamp)
    this.nodeId = node.id
    // 深拷贝节点数据，避免引用问题
    this.node = cloneNodeForHistory(node)
  }

  getReverseCommand(timestamp: number): Command {
    return new AddNodeCommand(this.node, timestamp)
  }

  isEqualTo(anotherCommand: Command): boolean {
    return (
      anotherCommand instanceof RemoveNodeCommand &&
      anotherCommand.nodeId === this.nodeId
    )
  }

  async revert(store: DataflowStore): Promise<void> {
    // 添加节点时使用深拷贝的数据
    store.addNode(cloneNodeForHistory(this.node))
  }
}

export class AddConnectionCommand extends Command {
  connection: Connection

  constructor(connection: Connection, timestamp: number) {
    super(COMMANDS.ADD_CONNECTION, timestamp)
    // 深拷贝连接对象
    this.connection = { ...connection }
  }

  getReverseCommand(timestamp: number): Command {
    return new RemoveConnectionCommand(this.connection, timestamp)
  }

  isEqualTo(anotherCommand: Command): boolean {
    return (
      anotherCommand instanceof AddConnectionCommand &&
      anotherCommand.connection.source === this.connection.source &&
      anotherCommand.connection.target === this.connection.target
    )
  }

  async revert(store: DataflowStore): Promise<void> {
    store.deleteConnection(this.connection)
  }
}

export class RemoveConnectionCommand extends Command {
  connection: Connection

  constructor(connection: Connection, timestamp: number) {
    super(COMMANDS.REMOVE_CONNECTION, timestamp)
    // 深拷贝连接对象
    this.connection = { ...connection }
  }

  getReverseCommand(timestamp: number): Command {
    return new AddConnectionCommand(this.connection, timestamp)
  }

  isEqualTo(anotherCommand: Command): boolean {
    return (
      anotherCommand instanceof RemoveConnectionCommand &&
      anotherCommand.connection.source === this.connection.source &&
      anotherCommand.connection.target === this.connection.target
    )
  }

  async revert(store: DataflowStore): Promise<void> {
    store.addConnection(this.connection)
  }
}

export class EnableNodeToggleCommand extends Command {
  nodeId: string
  oldState: boolean
  newState: boolean

  constructor(
    nodeId: string,
    oldState: boolean,
    newState: boolean,
    timestamp: number,
  ) {
    super(COMMANDS.ENABLE_NODE_TOGGLE, timestamp)
    this.nodeId = nodeId
    this.newState = newState
    this.oldState = oldState
  }

  getReverseCommand(timestamp: number): Command {
    return new EnableNodeToggleCommand(
      this.nodeId,
      this.newState,
      this.oldState,
      timestamp,
    )
  }

  isEqualTo(anotherCommand: Command): boolean {
    return (
      anotherCommand instanceof EnableNodeToggleCommand &&
      anotherCommand.nodeId === this.nodeId
    )
  }

  async revert(): Promise<void> {
    // TODO: Implement node enable/disable toggle in store
    // For now, this command is not fully implemented
  }
}

export class RenameNodeCommand extends Command {
  nodeId: string
  currentName: string
  newName: string

  constructor(
    nodeId: string,
    currentName: string,
    newName: string,
    timestamp: number,
  ) {
    super(COMMANDS.RENAME_NODE, timestamp)
    this.nodeId = nodeId
    this.currentName = currentName
    this.newName = newName
  }

  getReverseCommand(timestamp: number): Command {
    return new RenameNodeCommand(
      this.nodeId,
      this.newName,
      this.currentName,
      timestamp,
    )
  }

  isEqualTo(anotherCommand: Command): boolean {
    return (
      anotherCommand instanceof RenameNodeCommand &&
      anotherCommand.nodeId === this.nodeId &&
      anotherCommand.currentName === this.currentName &&
      anotherCommand.newName === this.newName
    )
  }

  async revert(): Promise<void> {
    // TODO: Implement node rename in store
    // For now, this command is not fully implemented
  }
}
