import i18n from '@tap/i18n'
import * as Vue from 'vue'
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
      instance,
    }
    this.commands = []
    this.undoCommands = []
  }

  async exec(command, notExec, isRedo) {
    if (!notExec) {
      await command.exec(this.state)
    }
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
    throw new Error(i18n.t('packages_dag_src_command_qingshixianex'))
  }

  undo() {
    throw new Error(i18n.t('packages_dag_src_command_qingshixianun'))
  }
}

class NodeCommand extends Command {
  constructor(nodes) {
    super()
    this.nodes = nodes
    this.elIds = this.nodes.map((n) => NODE_PREFIX + n.id)
    this.nodeIds = this.nodes.map((n) => n.id)
  }

  removeNode(state) {
    const managedElements = state.instance.getManagedElements()

    state.instance.setSuspendDrawing(true)

    this.elIds.forEach((id) => {
      const el = document.querySelector('#' + id)
      state.instance.removeAllEndpoints(id)
      state.instance.destroyDraggable(el)
      state.instance.destroyDroppable(el)
      delete managedElements[id] // 删除managed可以出发锚点位置更新

      // remove 暂时不用了，会引发vue的虚拟dom更新错误
      // state.instance.remove(NODE_PREFIX + node.id)
    })

    state.store.commit('dataflow/batchRemoveNode', this.nodeIds)

    Vue.nextTick(() => {
      state.instance.setSuspendDrawing(false, true)
    })
  }
}

/**
 * 添加节点
 */
class AddNodeCommand extends NodeCommand {
  constructor(node) {
    super(Array.isArray(node) ? node : [node])
  }

  exec(state) {
    state.store.commit('dataflow/addNodes', this.nodes)
  }

  undo(state) {
    this.removeNode(state)
  }
}

/**
 * 删除节点
 */
class RemoveNodeCommand extends NodeCommand {
  constructor(node) {
    super(Array.isArray(node) ? node : [node])
  }

  async exec(state) {
    this.connections = state.instance
      .getConnections('*')
      .filter(
        (c) =>
          this.elIds.includes(c.targetId) || this.elIds.includes(c.sourceId)
      )
      .map((c) => ({
        sourceId: c.sourceId,
        targetId: c.targetId,
      }))

    this.removeNode(state)
  }

  undo(state) {
    state.instance.setSuspendDrawing(true)
    state.store.commit('dataflow/addNodes', this.nodes)

    Vue.nextTick(() => {
      this.connections?.forEach((c) => {
        state.instance.connect({
          uuids: [c.sourceId + '_source', c.targetId + '_target'],
        })
        state.store.commit('dataflow/addConnection', {
          source: getRealId(c.sourceId),
          target: getRealId(c.targetId),
        })
      })
      state.instance.setSuspendDrawing(false, true)
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
      target: NODE_PREFIX + connection.target,
    }
    this.uuids = [
      this.connectionData.source + '_source',
      this.connectionData.target + '_target',
    ]
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

  /**
   * 执行更新节点坐标
   * @param state
   * @param properties
   */
  updatePosition(state, properties) {
    state.instance.setSuspendDrawing(true)
    properties.forEach((info) => {
      state.store.commit('dataflow/updateNodeProperties', info)
    })

    Vue.nextTick(() => {
      state.instance.setSuspendDrawing(false, true)
      // state.store.dispatch('dataflow/updateDag') // 自动保存
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
      this.add(
        state,
        [this.connectionData.source + '_source', nodeId + '_target'],
        {
          source: this.connection.source,
          target: this.node.id,
        }
      )
      this.add(
        state,
        [nodeId + '_source', this.connectionData.target + '_target'],
        {
          source: this.node.id,
          target: this.connection.target,
        }
      )
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
class QuickAddTargetCommand extends ConnectionCommand {
  constructor(source, node) {
    super({
      source,
      target: node.id,
    })
    this.node = node
  }

  exec(state) {
    state.store.commit('dataflow/addNode', this.node)
    Vue.nextTick(() => {
      this.add(state)
    })
  }

  undo(state) {
    const { node } = this
    state.instance.remove(NODE_PREFIX + node.id)
    state.store.commit('dataflow/removeNode', node)
  }
}

/**
 * 添加dag，包含节点和连线
 */
class AddDagCommand extends NodeCommand {
  constructor(dag) {
    super(dag.nodes)
    this.edges = dag.edges
  }

  async exec(state) {
    state.store.commit('dataflow/addNodes', this.nodes)
    state.store.commit('dataflow/addEdges', this.edges)
    await Vue.nextTick()
    this.edges.forEach(({ source, target }) => {
      state.instance.connect({
        uuids: [
          `${NODE_PREFIX}${source}_source`,
          `${NODE_PREFIX}${target}_target`,
        ],
      })
    })
  }

  undo(state) {
    this.removeNode(state)
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
  QuickAddTargetCommand,
  AddDagCommand,
}
