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
    this.sourceId = getRealId(connection.sourceId)
    this.targetId = getRealId(connection.targetId)
    this.uuids = [connection.sourceId + '_source', connection.targetId + '_target']
  }

  exec(state) {
    state.instance.connect({ uuids: this.uuids })
  }

  undo(state) {
    const connection = state.instance.getConnections({
      uuids: this.uuids
    })[0]
    state.instance.deleteConnection(connection)
    state.store.commit('dataflow/removeConnection', {
      sourceId: this.sourceId,
      targetId: this.targetId
    })
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

export { CommandManager, AddNodeCommand, RemoveNodeCommand, AddConnectionCommand, MoveNodeCommand }
