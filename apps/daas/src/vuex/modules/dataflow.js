import Vue from 'vue'
import { isObject } from '@/utils/util'

const find = (obj, nameParts, conditions) => {
  if (!nameParts.length) return obj

  let value = obj[nameParts.shift()]
  let condition = conditions.shift()

  if (Array.isArray(value) && condition) {
    value = findByCod(value, condition)
  }
  return find(value, nameParts, conditions)
}

const findByCod = (arr, cond) => {
  return arr.find(item => {
    if (isObject(item)) {
      let flag = true
      for (let k of Object.keys(cond)) {
        if (!(k in item) || item[k] !== cond[k]) {
          flag = false
          break
        }
      }
      return flag
    }
  })
}

// 初始化 state
const state = () => ({
  stateIsDirty: false, // 状态是否被污染，标识数据改变
  stateIsReadonly: false, // 状态是否被污染，标识数据改变
  nodeTypes: [], // 所有节点类型
  nodeViewOffsetPosition: [0, 0],
  paperMoveInProgress: false,
  ctorTypes: {}, // 所有节点构造类型
  activeNode: null, // 当前激活的节点ID
  activeConnection: null, // 当前激活的连接
  activeActions: [], // 激活的动作
  selectedNodes: [], // 选中的节点
  activeType: null,
  formSchema: null,
  dataflow: {
    id: '',
    name: '',
    settings: {},
    // 编辑器配置
    nodes: [] // 画布上的所有节点
  }
})

// getters
const getters = {
  getStateIsDirty: state => {
    return state.stateIsDirty
  },
  stateIsReadonly: state => {
    return state.stateIsReadonly
  },

  dataflowName: state => {
    return state.dataflow.name
  },

  dataflowId: state => {
    return state.dataflow.id
  },

  dataflowSettings: state => {
    if (state.dataflow.settings === undefined) {
      return {}
    }
    return state.dataflow.settings
  },

  // 判断action是否被标记
  isActionActive: state => action => {
    return state.activeActions.includes(action)
  },

  // 获取所有节点类型
  allNodeTypes: state => {
    return state.nodeTypes
  },

  nodeType: state => node => {
    const nodeType = node.type
    let foundType
    if (nodeType === 'database') {
      const dbType = node.databaseType
      foundType = state.nodeTypes.find(typeData => typeData.type === nodeType && typeData.attr.databaseType === dbType)
    } else {
      foundType = state.nodeTypes.find(typeData => typeData.type === nodeType)
    }

    if (foundType === undefined) return null

    return foundType
  },

  // 获取画布所有节点
  allNodes: state => {
    return state.dataflow.nodes
  },

  // 根据id获取节点
  nodeById: state => id => {
    const foundNode = state.dataflow.nodes.find(node => node.id === id)

    if (foundNode === undefined) {
      return null
    }
    return foundNode
  },

  // 获取激活的节点
  activeNode: (state, getters) => {
    return state.activeNode ? getters.nodeById(state.activeNode) : null
  },

  // 获取激活的线
  activeConnection: state => {
    return state.activeConnection
  },

  // 判断节点是否激活
  isNodeActive: state => nodeId => {
    return state.activeNode === nodeId
  },

  // 判断节点是否选中
  isNodeSelected: state => nodeId => {
    return !!state.selectedNodes.find(n => n.id === nodeId)
  },

  // 获取选中的节点
  getSelectedNodes: state => {
    return state.selectedNodes
  },

  // 获取节点构造类
  getCtor: state => type => state.ctorTypes[type],

  getNodeViewOffsetPosition: state => {
    return state.nodeViewOffsetPosition
  },

  isPaperMoveInProgress: state => {
    return state.paperMoveInProgress
  },

  activeType: state => {
    return state.activeType
  },

  formSchema: state => state.formSchema
}

// actions
const actions = {}

// mutations
const mutations = {
  /**
   * 设置数据脏状态
   * @param state
   * @param dirty
   */
  setStateDirty(state, dirty) {
    state.stateIsDirty = dirty
  },
  setStateReadonly(state, readonly) {
    state.stateIsReadonly = readonly
  },
  // Id
  setDataflowId(state, id) {
    state.dataflow.id = id
  },

  // Name
  setDataflowName(state, data) {
    if (data.setStateDirty === true) {
      state.stateIsDirty = true
    }
    state.dataflow.name = data.newName
  },

  // Settings
  setDataflowSettings(state, dataflowSettings) {
    Vue.set(state.dataflow, 'settings', dataflowSettings)
  },

  /**
   * 标记action
   * @param state
   * @param action
   */
  addActiveAction(state, action) {
    if (!state.activeActions.includes(action)) {
      state.activeActions.push(action)
    }
  },

  /**
   * 删除action标记
   * @param state
   * @param action
   */
  removeActiveAction(state, action) {
    const actionIndex = state.activeActions.indexOf(action)
    if (~actionIndex) {
      state.activeActions.splice(actionIndex, 1)
    }
  },

  setPaperMoveInProgress(state, value) {
    state.paperMoveInProgress = value
  },

  setNodeViewOffsetPosition(state, data) {
    state.nodeViewOffsetPosition = data.newOffset
  },

  // 加载所有节点类型
  setNodeTypes(state, nodeTypes) {
    Vue.set(state, 'nodeTypes', nodeTypes)
  },

  setCtorTypes(state, ctorTypes) {
    Vue.set(state, 'ctorTypes', ctorTypes)
  },

  // 设置激活节点
  setActiveNode(state, nodeId) {
    console.log('setActiveNode', nodeId)
    state.activeNode = nodeId
    state.activeType = nodeId ? 'node' : null
  },

  // 设置激活连接
  setActiveConnection(state, connection) {
    Vue.set(state, 'activeConnection', connection)
    state.activeType = connection ? 'connection' : null
  },

  // 激活类型，用作判断
  setActiveType(state, type) {
    state.activeType = type
  },

  // 添加节点
  addNode(state, nodeData) {
    state.dataflow.nodes.push(nodeData)
  },

  // 更新节点属性
  updateNodeProperties(state, updateInformation) {
    console.log('updateInformation', updateInformation)
    const node = state.dataflow.nodes.find(node => {
      return node.id === updateInformation.id
    })

    if (node) {
      for (const key of Object.keys(updateInformation.properties)) {
        Vue.set(node, key, updateInformation.properties[key])
      }
    }
  },

  // 选择节点
  addSelectedNode(state, node) {
    console.log('addSelectedNode', state.selectedNodes)
    state.selectedNodes.push(node)
  },

  // 将节点从选中移除
  removeNodeFromSelection(state, node) {
    const { selectedNodes } = state
    const index = selectedNodes.findIndex(n => n.id === node.id)
    ~index && selectedNodes.splice(index, 1)
  },

  // 重置选择的节点
  resetSelectedNodes(state) {
    Vue.set(state, 'selectedNodes', [])
    console.log('resetSelectedNodes', state.selectedNodes)
  },

  // 针对数组，修改某个项的值
  setNodeValueByConditions(state, updateInformation) {
    const node = state.dataflow.nodes.find(node => node.id === updateInformation.id)
    const nameParts = updateInformation.key.split('.')
    const key = nameParts[nameParts.length - 1]
    const { conditions } = updateInformation

    if (node === undefined || node === null) {
      throw new Error('未找到节点')
    }

    let target = find(node, nameParts, conditions)

    state.stateIsDirty = true
    target && Vue.set(target, key, updateInformation.value)
  },

  // 通过Path[k1.k2]更新节点
  setNodeValueByPath(state, updateInformation) {
    const node = state.dataflow.nodes.find(node => node.id === updateInformation.id)
    const nameParts = updateInformation.path.split('.')
    const key = nameParts.pop()
    const { conditions = [] } = updateInformation

    if (node === undefined || node === null) {
      throw new Error('未找到节点')
    }

    let target = find(node, nameParts, conditions)

    state.stateIsDirty = true
    target && Vue.set(target, key, updateInformation.value)
  },

  // 更新节点value
  setNodeValue(state, updateInformation) {
    const node = state.dataflow.nodes.find(node => node.id === updateInformation.id)

    if (node === undefined || node === null) {
      throw new Error('未找到节点')
    }

    state.stateIsDirty = true
    Vue.set(node, updateInformation.key, updateInformation.value)
  },

  // 添加连接，设置input、output
  addConnection(state, connection) {
    const { sourceId, targetId } = connection
    const sourceNode = state.dataflow.nodes.find(node => {
      return node.id === sourceId
    })
    const targetNode = state.dataflow.nodes.find(node => {
      return node.id === targetId
    })
    const { outputLanes = [] } = sourceNode
    const { inputLanes = [] } = targetNode

    if (!outputLanes.includes(targetId)) {
      outputLanes.push(targetId)
      Vue.set(sourceNode, 'outputLanes', outputLanes)
    }

    if (!inputLanes.includes(sourceId)) {
      inputLanes.push(sourceId)
      Vue.set(targetNode, 'inputLanes', inputLanes)
    }
  },

  // 删除连接，清空input中的sourceId、output中的targetId
  removeConnection(state, connection) {
    const { sourceId, targetId } = connection
    const sourceNode = state.dataflow.nodes.find(node => {
      return node.id === sourceId
    })
    const targetNode = state.dataflow.nodes.find(node => {
      return node.id === targetId
    })

    const { outputLanes = [] } = sourceNode
    const { inputLanes = [] } = targetNode

    const ti = outputLanes.indexOf(targetId)
    const si = inputLanes.indexOf(sourceId)

    if (~ti) outputLanes.splice(ti, 1)
    if (~si) inputLanes.splice(si, 1)

    Vue.set(sourceNode, 'outputLanes', outputLanes)
    Vue.set(targetNode, 'inputLanes', inputLanes)
  },

  // 移除节点
  removeNode(state, node) {
    const { nodes } = state.dataflow
    const nodeId = node.id
    const index = nodes.findIndex(n => n.id === nodeId)

    if (index === -1) return

    nodes.splice(index, 1)

    if (node.outputLanes?.length || node.inputLanes?.length) {
      nodes.forEach(n => {
        if (n.outputLanes?.length) {
          const ti = n.outputLanes.indexOf(nodeId)
          if (~ti) n.outputLanes.splice(ti, 1)
        }

        if (n.inputLanes?.length) {
          const si = n.inputLanes.indexOf(nodeId)
          if (~si) n.inputLanes.splice(si, 1)
        }
      })
    }

    state.stateIsDirty = true
  },

  // 移除所有节点
  removeAllNodes(state, data) {
    if (data?.setStateDirty === true) {
      state.stateIsDirty = true
    }
    state.dataflow.nodes.splice(0, state.dataflow.nodes.length)
  },

  setFormSchema(state, schema) {
    Vue.set(state, 'formSchema', schema)
    console.log('state', state)
  }
}

export default {
  // 加上命名空间
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
