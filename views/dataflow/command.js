import Vue from 'vue'
import { NODE_PREFIX } from './constants'

function getRealId(str) {
  return str.replace(new RegExp(`^${NODE_PREFIX}`), '')
}

/**
 * 命令控制
 */
class CommandManager {
  constructor(store, instance) {
    this.state = {
      store,
      instance
    }
    this.commands = []
    this.undoCommands = []
  }

  exec(command, notExec, isRedo) {
    !notExec && command.exec(this.state)
    this.commands.push(command)
    !isRedo && (this.undoCommands = [])
  }

  undo() {
    const command = this.commands.pop()
    if (command) {
      command.undo(this.state)
      this.undoCommands.push(command)
      return true
    }
  }

  redo() {
    const command = this.undoCommands.pop()
    if (command) {
      this.exec(command, false, true)
      return true
    }
  }
}

/**
 *  命令抽象类
 */
class Command {
  exec() {
    throw new Error('请实现exec方法！')
  }

  undo() {
    throw new Error('请实现undo方法！')
  }
}

/**
 * 添加节点
 */
class AddNodeCommand extends Command {
  constructor(node) {
    super()
    this.node = node
  }

  exec(state) {
    state.store.commit('dataflow/addNode', this.node)
  }

  undo(state) {
    state.instance.remove(NODE_PREFIX + this.node.id)
    state.store.commit('dataflow/removeNode', this.node)
  }
}

/**
 * 删除节点
 */
class RemoveNodeCommand extends Command {
  constructor(node) {
    super()
    this.nodes = Array.isArray(node) ? node : [node]
    this.nodeIds = this.nodes.map(n => NODE_PREFIX + n.id)
  }

  exec(state) {
    this.connections = state.instance
      .getConnections('*')
      .filter(c => this.nodeIds.includes(c.targetId) || this.nodeIds.includes(c.sourceId))
    this.nodeIds.forEach((id, i) => {
      state.instance.remove(id)
      state.store.commit('dataflow/removeNode', this.nodes[i])
    })
  }

  undo(state) {
    this.nodes.forEach(node => state.store.commit('dataflow/addNode', node))
    Vue.nextTick(() => {
      this.connections?.forEach(c => {
        state.instance.connect({ uuids: [c.sourceId + '_source', c.targetId + '_target'] })
        state.store.commit('dataflow/addConnection', { source: getRealId(c.sourceId), target: getRealId(c.targetId) })
      })
    })
  }
}

/**
 * 连接通用命令
 */
class ConnectionCommand extends Command {
  constructor(connection) {
    super()
    this.connection = connection
    this.connectionData = {
      source: NODE_PREFIX + connection.source,
      target: NODE_PREFIX + connection.target
    }
    this.uuids = [this.connectionData.source + '_source', this.connectionData.target + '_target']
  }

  add(state, uuids = this.uuids, connection = this.connection) {
    state.instance.connect({ uuids })
    state.store.commit('dataflow/addConnection', connection)
  }

  remove(state) {
    const connectionIns = state.instance.getConnections(this.connectionData)[0]
    state.instance.deleteConnection(connectionIns)
    state.store.commit('dataflow/removeConnection', this.connection)
  }
}

/**
 * 添加连线
 */
class AddConnectionCommand extends ConnectionCommand {
  constructor(connection) {
    super(connection)
  }

  exec(state) {
    this.add(state)
  }

  undo(state) {
    this.remove(state)
  }
}

/**
 * 删除连线
 */
class RemoveConnectionCommand extends ConnectionCommand {
  constructor(connection) {
    super(connection)
  }

  exec(state) {
    this.remove(state)
  }

  undo(state) {
    this.add(state)
  }
}

/**
 * 移动节点位置
 */
class MoveNodeCommand extends Command {
  constructor(oldProperties, newProperties) {
    super()
    this.oldProperties = oldProperties
    this.newProperties = newProperties
  }

  updatePosition(state, properties) {
    state.instance.setSuspendDrawing(true)
    properties.forEach(info => {
      state.store.commit('dataflow/updateNodeProperties', info)
    })
    Vue.nextTick(() => {
      state.instance.setSuspendDrawing(false, true)
    })
  }

  exec(state) {
    this.updatePosition(state, this.newProperties)
  }

  undo(state) {
    this.updatePosition(state, this.oldProperties)
  }
}

/**
 * 在两个节点的连线上添加节点
 */
class AddNodeOnConnectionCommand extends ConnectionCommand {
  constructor(connection, node) {
    super(connection)
    this.node = node
  }

  exec(state) {
    this.remove(state)
    state.store.commit('dataflow/addNode', this.node)
    Vue.nextTick(() => {
      const nodeId = NODE_PREFIX + this.node.id
      this.add(state, [this.connectionData.source + '_source', nodeId + '_target'], {
        source: this.connection.source,
        target: this.node.id
      })
      this.add(state, [nodeId + '_source', this.connectionData.target + '_target'], {
        source: this.node.id,
        target: this.connection.target
      })
    })
  }

  undo(state) {
    state.instance.remove(NODE_PREFIX + this.node.id)
    state.store.commit('dataflow/removeNode', this.node)
    this.add(state)
  }
}

/**
 * 快速添加目标节点
 */
class QuickAddTargetCommand extends Command {
  constructor(sourceId, node) {
    super()
    this.node = node
    this.uuids = [NODE_PREFIX + sourceId + '_source', NODE_PREFIX + node.id + '_target']
  }

  exec(state) {
    state.store.commit('dataflow/addNode', this.node)
    Vue.nextTick(() => {
      state.instance.connect({ uuids: this.uuids })
    })
  }

  undo(state) {
    const { node } = this
    state.instance.remove(NODE_PREFIX + node.id)
    state.store.commit('dataflow/removeNode', node)
  }
}

export {
  CommandManager,
  AddNodeCommand,
  RemoveNodeCommand,
  AddConnectionCommand,
  RemoveConnectionCommand,
  MoveNodeCommand,
  AddNodeOnConnectionCommand,
  QuickAddTargetCommand
}
