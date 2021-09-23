import Vue from 'vue'
import { NODE_PREFIX } from '@/views/dataflow/constants'

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

  exec(command, flag, isRedo) {
    !flag && command.exec(this.state)
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
      })
    })
  }
}

/**
 * 添加连线
 */
class AddConnectionCommand extends Command {
  constructor(connection) {
    super()
    this.connection = connection
    this.connectionData = {
      sourceId: getRealId(connection.source),
      targetId: getRealId(connection.target)
    }
    this.uuids = [connection.source + '_source', connection.target + '_target']
  }

  exec(state) {
    state.instance.connect({ uuids: this.uuids })
  }

  undo(state) {
    const connection = state.instance.getConnections(this.connection)[0]
    state.instance.deleteConnection(connection)
    state.store.commit('dataflow/removeConnection', this.connectionData)
  }
}

/**
 * 删除连线
 */
class RemoveConnectionCommand extends Command {
  constructor(connection) {
    super()
    this.connection = connection
    this.connectionData = {
      sourceId: getRealId(connection.source),
      targetId: getRealId(connection.target)
    }
    this.uuids = [connection.source + '_source', connection.target + '_target']
  }

  exec(state) {
    const connection = state.instance.getConnections(this.connection)[0]
    state.instance.deleteConnection(connection)
    state.store.commit('dataflow/removeConnection', {
      sourceId: this.sourceId,
      targetId: this.targetId
    })
  }

  undo(state) {
    state.instance.connect({ uuids: this.uuids })
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
class AddNodeOnConnectionCommand extends Command {
  constructor(connection, node) {
    super()
    this.node = node
    this.connection = connection
    this.sourceId = getRealId(connection.source)
    this.targetId = getRealId(connection.target)
    this.uuids = [connection.source + '_source', connection.target + '_target']
  }

  exec(state) {
    const connection = state.instance.getConnections(this.connection)[0]
    state.instance.deleteConnection(connection)
    state.store.commit('dataflow/removeConnection', {
      sourceId: this.sourceId,
      targetId: this.targetId
    })
    state.store.commit('dataflow/addNode', this.node)
    Vue.nextTick(() => {
      const nodeId = NODE_PREFIX + this.node.id
      state.instance.connect({ uuids: [this.connection.source + '_source', nodeId + '_target'] })
      state.instance.connect({ uuids: [nodeId + '_source', this.connection.target + '_target'] })
    })
  }

  undo(state) {
    state.instance.connect({ uuids: this.uuids })
    state.instance.remove(NODE_PREFIX + this.node.id)
    state.store.commit('dataflow/removeNode', this.node)
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
