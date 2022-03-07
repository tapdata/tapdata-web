import Vue from 'vue'
import { isObject, uuid } from '@daas/shared'
import { Task } from '@daas/api'
import { debounce } from 'lodash'
import { AddDagCommand } from './command'

const taskApi = new Task()

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
  nodeErrorState: {}, // 节点错误状态
  processorNodeTypes: [
    {
      icon: 'javascript',
      name: 'JavaScript',
      type: 'js_processor',
      constructor: 'JavaScript'
    },
    {
      icon: 'field-processor',
      name: '字段处理',
      type: 'field_processor',
      constructor: 'FieldProcessor'
    },
    {
      icon: 'aggregator',
      name: '聚合',
      type: 'aggregation_processor',
      constructor: 'Aggregate'
    },
    {
      icon: 'row-filter',
      name: 'Row Filter',
      type: 'row_filter_processor',
      constructor: 'RowFilter'
    },
    {
      icon: 'join',
      name: '连接',
      type: 'join',
      constructor: 'Join'
    },
    {
      icon: 'join',
      name: '主从合并',
      type: 'merge_table_processor',
      constructor: 'MergeTable'
    }
    // {
    //   icon: 'joint-cache',
    //   name: '关联缓存',
    //   type: 'cache_lookup_processor',
    //   constructor: 'JointCache'
    // }
  ],
  nodeViewOffsetPosition: [0, 0],
  paperMoveInProgress: false,
  ctorTypes: {}, // 所有节点构造类型
  activeNodeId: null, // 当前激活的节点ID
  activeConnection: null, // 当前激活的连接
  activeActions: [], // 激活的动作
  selectedNodes: [], // 选中的节点
  activeType: null,
  formSchema: null,
  taskId: null,
  transformStatus: '', //推演状态 loading, error, finished
  dag: {
    nodes: [], // 节点数据
    edges: [] // 连线数据
  },

  dagPromise: null,
  editVersion: null
})

// getters
const getters = {
  stateIsDirty: state => {
    return state.stateIsDirty
  },

  stateIsReadonly: state => {
    return state.stateIsReadonly
  },

  // 判断action是否被标记
  isActionActive: state => action => {
    return state.activeActions.includes(action)
  },

  // 获取所有节点类型
  allNodeTypes: state => {
    return [...state.nodeTypes, ...state.processorNodeTypes]
  },

  processorNodeTypes: state => {
    return state.processorNodeTypes
  },

  nodeType: state => node => {
    const nodeType = node.type
    let foundType
    const allNodeTypes = [...state.nodeTypes, ...state.processorNodeTypes]
    if (nodeType === 'database') {
      const dbType = node.databaseType
      foundType = allNodeTypes.find(typeData => typeData.type === nodeType && typeData.attr.databaseType === dbType)
    } else {
      foundType = allNodeTypes.find(typeData => typeData.type === nodeType)
    }

    if (foundType === undefined) return null

    return foundType
  },

  dag: state => state.dag,

  // 获取画布所有节点
  allNodes: state => state.dag.nodes,

  // 所有连线
  allEdges: state => state.dag.edges,

  // 根据id获取节点
  nodeById: state => id => {
    const foundNode = state.dag.nodes.find(node => node.id === id)

    if (foundNode === undefined) {
      return null
    }
    return foundNode
  },

  // 获取激活的节点
  activeNode: (state, getters) => {
    return state.activeNodeId ? getters.nodeById(state.activeNodeId) : null
  },

  // 获取激活的线
  activeConnection: state => {
    return state.activeConnection
  },

  // 判断节点是否激活
  isNodeActive: state => nodeId => {
    return state.activeNodeId === nodeId
  },

  // 判断节点是否选中
  isNodeSelected: state => nodeId => {
    return !!state.selectedNodes.find(n => n.id === nodeId)
  },

  // 获取选中的节点
  getSelectedNodes: state => {
    return state.selectedNodes
  },

  isMultiSelect: state => {
    return state.selectedNodes.length > 1
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

  formSchema: state => state.formSchema,

  hasNodeError: state => id => state.nodeErrorState[id]
}

// actions
const actions = {
  updateDag: debounce(async function ({ state, commit }) {
    const data = await taskApi.patch({
      id: state.taskId,
      editVersion: state.editVersion,
      dag: state.dag
    })
    commit('setEditVersion', data.editVersion)
  }, 300),

  async addNodeAsync({ dispatch, commit }, nodeData) {
    commit('addNode', nodeData)
    await dispatch('updateDag')
  }
}

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
    console.log('setActiveNode', nodeId) // eslint-disable-line
    state.activeNodeId = nodeId
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
    state.dag.nodes.push(nodeData)
  },

  addNodes(state, nodes) {
    state.dag.nodes.push(...nodes)
  },

  // 更新节点属性
  updateNodeProperties(state, updateInformation) {
    console.log('updateInformation', updateInformation) // eslint-disable-line
    const node = state.dag.nodes.find(node => node.id === updateInformation.id)

    const updateObjVal = (target, obj) => {
      Object.entries(obj).forEach(([key, value]) => {
        if (isObject(value) && target[key]) {
          updateObjVal(target[key], value)
        } else {
          Vue.set(target, key, value)
        }
      })
    }

    if (node) {
      updateObjVal(node, updateInformation.properties)
      /*Object.entries(updateInformation.properties).forEach(([key, value]) => {
        if (isObject(value)) {
        } else {
          Vue.set(node, key, value)
        }
      })*/
      /*for (const key of Object.keys(updateInformation.properties)) {
        Vue.set(node, key, updateInformation.properties[key])
      }*/
    }
  },

  // 选择节点
  addSelectedNode(state, node) {
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
    state.selectedNodes = []
  },

  // 针对数组，修改某个项的值
  setNodeValueByConditions(state, updateInformation) {
    const node = state.dag.nodes.find(node => node.id === updateInformation.id)
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
    const node = state.dag.nodes.find(node => node.id === updateInformation.id)
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
    const node = state.dag.nodes.find(node => node.id === updateInformation.id)

    if (node === undefined || node === null) {
      throw new Error('未找到节点')
    }

    state.stateIsDirty = true
    Vue.set(node, updateInformation.key, updateInformation.value)
  },

  // 添加连接，设置input、output
  addConnection(state, connection) {
    const { source, target } = connection
    const index = state.dag.edges.findIndex(item => item.source === source && item.target === target)

    if (!~index) state.dag.edges.push(connection)
  },

  // 删除连接，清空input中的sourceId、output中的targetId
  removeConnection(state, connection) {
    const { source, target } = connection
    const index = state.dag.edges.findIndex(item => item.source === source && item.target === target)

    if (~index) state.dag.edges.splice(index, 1)
  },

  // 移除节点
  removeNode(state, node) {
    const { nodes, edges } = state.dag
    const nodeId = node.id
    const index = nodes.findIndex(n => n.id === nodeId)

    if (!~index) return

    if (state.activeNodeId === nodes[index].id && state.activeType === 'node') {
      state.activeType = null
    }

    nodes.splice(index, 1)

    state.dag.edges = edges.filter(({ source, target }) => nodeId !== source && nodeId !== target)

    state.stateIsDirty = true
  },

  // 移除所有节点
  removeAllNodes(state, data) {
    if (data?.setStateDirty === true) {
      state.stateIsDirty = true
    }
    state.dag.nodes.splice(0, state.dag.nodes.length)
  },

  setFormSchema(state, schema) {
    Vue.set(state, 'formSchema', schema)
    console.log('state', state) // eslint-disable-line
  },

  /**
   * 标记节点错误状态
   * @param state
   * @param id
   */
  setNodeError(state, id) {
    Vue.set(state.nodeErrorState, id, true)
  },

  /**
   * 清除节点错误状态
   * @param state
   * @param id
   */
  clearNodeError(state, id) {
    Vue.delete(state.nodeErrorState, id)
  },

  /**
   * 重置任务
   * @param state
   */
  reset(state) {
    state.taskId = null
    state.dag.nodes = []
    state.dag.edges = []
  },

  setEdges(state, edges) {
    state.dag.edges = edges
  },

  addEdges(state, edges) {
    state.dag.edges.push(...edges)
  },

  /**
   * 设置任务ID
   * @param state
   * @param id
   */
  setTaskId(state, id) {
    state.taskId = id
  },

  /**
   * 设置推演状态
   * @param state
   * @param status
   */
  setTransformStatus(state, status) {
    state.transformStatus = status
  },

  setDagPromise(state, promise) {
    state.dagPromise = promise
  },

  setEditVersion(state, editVersion) {
    state.editVersion = editVersion
  },

  /**
   * 复制节点，如果节点直接有连线，也会一并复制
   * @param state
   */
  copyNodes: state => {
    const nodes = state.selectedNodes
    const edges = state.dag.edges
    let copyEdges = []

    if (nodes.length) {
      const nodeMap = nodes.reduce((map, node) => ((map[node.id] = true), map), {})
      copyEdges = edges.filter(item => nodeMap[item.source] && nodeMap[item.target])
    }

    localStorage['DAG_CLIPBOARD'] = JSON.stringify({
      nodes,
      edges: copyEdges
    })
  },

  /**
   * 粘贴节点
   * @param state
   * @param command
   */
  pasteNodes: async (state, command) => {
    const DAG_CLIPBOARD = localStorage['DAG_CLIPBOARD']
    if (DAG_CLIPBOARD) {
      const dag = JSON.parse(DAG_CLIPBOARD)
      const { nodes, edges } = dag

      if (!nodes.length) return

      const allNodeTypes = [...state.nodeTypes, ...state.processorNodeTypes]
      const nodeTypesMap = allNodeTypes.reduce((res, item) => ((res[item.type] = item), res), {})
      const sourceMap = {},
        targetMap = {}

      edges.forEach(item => {
        let _source = sourceMap[item.source]
        let _target = targetMap[item.target]

        if (!_source) {
          sourceMap[item.source] = [item]
        } else {
          _source.push(item)
        }

        if (!_target) {
          targetMap[item.target] = [item]
        } else {
          _target.push(item)
        }
      })

      nodes.forEach(node => {
        const oldId = node.id
        node.id = uuid() // 生成新的ID
        node.attrs.position[0] += 20
        node.attrs.position[1] += 20

        // 替换连线里绑定的ID
        if (sourceMap[oldId]) {
          sourceMap[oldId].forEach(item => (item.source = node.id))
        }
        // 替换连线里绑定的ID
        if (targetMap[oldId]) {
          targetMap[oldId].forEach(item => (item.target = node.id))
        }

        const nodeType = nodeTypesMap[node.type]

        if (nodeType) {
          const Ctor = state.ctorTypes[nodeType.constructor]
          const ins = new Ctor(nodeType)

          Object.defineProperty(node, '__Ctor', {
            value: ins,
            enumerable: false
          })
        }
      })

      // 执行添加dag命令，可以撤销/重做
      await command.exec(new AddDagCommand(dag))

      // 选中粘贴的节点
      const jsPlumbIns = command.state.instance
      jsPlumbIns.clearDragSelection()
      nodes.forEach(node => jsPlumbIns.addToDragSelection(`node-${node.id}`))
      state.selectedNodes = nodes

      // 存储
      localStorage['DAG_CLIPBOARD'] = JSON.stringify(dag)
    }
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
