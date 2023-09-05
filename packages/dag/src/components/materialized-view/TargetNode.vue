<template>
  <div class="materialized-view-node --target position-absolute rounded-lg bg-white">
    <div class="flex gap-2 p-2 bg-primary node-header">
      <AsyncSelect
        v-model="node.connectionId"
        placeholder="请选择存储数据库"
        :method="loadDatabases"
        itemValue="id"
        itemQuery="name"
      ></AsyncSelect>
      <TableSelect
        v-model="node.tableName"
        placeholder="请选择存储表"
        :method="loadTable"
        :connectionId="node.connectionId"
        itemType="object"
        itemQuery="value"
      ></TableSelect>
    </div>
    <div class="p-2">
      <code class="color-success-light-5">{</code>
      <ElTree></ElTree>
      <code class="color-success-light-5">}</code>
    </div>
  </div>
</template>

<script>
import { merge } from 'lodash'
import { mapMutations } from 'vuex'
import { connectionsApi, metadataInstancesApi } from '@tap/api'
import { CONNECTION_STATUS_MAP } from '@tap/business/src/shared'
import { Time } from '@tap/shared'
import { AsyncSelect } from '@tap/form'
import i18n from '@tap/i18n'
import { TableSelect } from '../form'
import { sourceEndpoint, targetEndpoint } from '../../style'
import { NODE_PREFIX } from '../../constants'
export default {
  name: 'TargetNode',

  props: {
    node: Object,
    data: Object,
    nodeId: {
      type: String,
      required: true
    },
    jsPlumbIns: Object
  },

  components: {
    AsyncSelect,
    TableSelect
  },

  methods: {
    ...mapMutations('dataflow', [
      'setActiveNode',
      'addActiveAction',
      'removeActiveAction',
      'updateNodeProperties',
      'resetSelectedNodes',
      'setNodeError',
      'clearNodeError'
    ]),

    __init() {
      const { id, nodeId } = this

      const targetParams = {
        ...targetEndpoint
      }

      // this.jsPlumbIns.makeSource(id, { filter: '.sourcePoint', ...sourceEndpoint })

      this.jsPlumbIns.makeTarget(id, targetParams)

      this.jsPlumbIns.draggable(this.$el, {
        // containment: 'parent',
        start: params => {
          this.onMouseDownAt = Time.now()
          // console.log('node-drag-start', params.pos)
          if (params.e && !this.isNodeSelected(this.nodeId)) {
            // 只有直接拖动的节点params才会有事件
            // 检查当前拖动的节点是否被选中，如果未选中则clearDragSelection
            this.jsPlumbIns.clearDragSelection()
            this.resetSelectedNodes()
          }

          this.addActiveAction('dragActive')

          this.$emit('drag-start', params)
          return true
        },
        drag: params => {
          // console.log('node-drag-move', params.pos)
          params.id = nodeId // 增加id参数
          this.isDrag = true // 拖动标记
          this.$emit('drag-move', params)
        },
        stop: () => {
          // console.log('node-drag-stop', params)
          // 更新节点坐标
          this.isNotMove = false
          const { position } = this.data.attrs
          const newProperties = []
          const oldProperties = []

          if (this.isActionActive('dragActive')) {
            const moveNodes = [...this.$store.getters['dataflow/getSelectedNodes']]

            if (!this.isNodeSelected(this.nodeId)) {
              moveNodes.push(this.data)
            }
            /*const selectedNodeNames = moveNodes.map(node => node.id)

            if (!selectedNodeNames.includes(this.data.id)) {
              moveNodes.push(this.data)
            }*/

            let x = parseFloat(this.$el.style.left)
            let y = parseFloat(this.$el.style.top)

            const distance = Math.sqrt(Math.pow(x - position[0], 2) + Math.pow(y - position[1], 2))

            if (x === position[0] && y === position[1]) {
              // 拖拽结束后位置没有改变
              console.log('NotMove') // eslint-disable-line
              this.isNotMove = true
              this.removeActiveAction('dragActive')
            }

            if (distance < 4 || Time.now() - this.onMouseDownAt < 10) {
              console.log(
                i18n.t('packages_dag_components_dfnode_tuodongshijianduan'),
                Time.now() - this.onMouseDownAt,
                distance
              ) // eslint-disable-line
              this.removeActiveAction('dragActive')
            }

            moveNodes.forEach(node => {
              const nodeElement = NODE_PREFIX + node.id
              const element = document.getElementById(nodeElement)
              if (element === null) {
                return
              }

              let newNodePosition = [parseFloat(element.style.left), parseFloat(element.style.top)]

              const updateInformation = {
                id: node.id,
                properties: {
                  attrs: { position: newNodePosition }
                }
              }

              oldProperties.push({
                id: node.id,
                properties: {
                  attrs: { position }
                }
              })
              newProperties.push(updateInformation)
            })
          }

          this.onMouseDownAt = undefined
          this.$emit('drag-stop', this.isNotMove, oldProperties, newProperties)
        }
      })

      this.targetPoint = this.jsPlumbIns.addEndpoint(this.$el, targetParams, {
        uuid: id + '_target'
      })

      this.jsPlumbIns.addEndpoint(
        this.$el,
        {
          ...sourceEndpoint,
          enabled: false
        },
        {
          uuid: id + '_source'
        }
      )
    },

    mouseClick(e) {
      if (this.isActionActive('dragActive')) {
        this.removeActiveAction('dragActive')
      } else {
        if (!this.ins) return
        if (this.isCtrlKeyPressed(e) === false) {
          // 如果不是多选模式则取消所有节点选中
          this.$emit('deselectAllNodes')
        }

        if (this.isNodeSelected(this.nodeId)) {
          this.$emit('deselectNode', this.nodeId)
        } else {
          // 选中节点并且active
          this.$emit('nodeSelected', this.nodeId, true)
        }
      }
    },

    async loadDatabases(filter) {
      try {
        const { isSource, isTarget } = filter
        const _filter = {
          where: {
            createType: {
              $ne: 'System'
            }
          },
          fields: {
            name: 1,
            id: 1,
            database_type: 1,
            connection_type: 1,
            status: 1,
            accessNodeType: 1,
            accessNodeProcessId: 1,
            accessNodeProcessIdList: 1,
            pdkType: 1,
            pdkHash: 1,
            capabilities: 1
          },
          order: ['status DESC', 'name ASC']
        }
        // 过滤连接类型
        if (isSource && isTarget) {
          _filter.where.connection_type = 'source_and_target'
        } else if (isSource) {
          _filter.where.connection_type = {
            like: 'source',
            options: 'i'
          }
        } else if (isTarget) {
          _filter.where.connection_type = {
            like: 'target',
            options: 'i'
          }
        }
        let result = await connectionsApi.get({
          filter: JSON.stringify(merge(filter, _filter))
        })

        result.items = result.items.map(item => {
          return {
            id: item.id,
            name: item.name,
            label: `${item.name} ${item.status ? `(${CONNECTION_STATUS_MAP[item.status]?.text || item.status})` : ''}`,
            value: item.id,
            databaseType: item.database_type,
            connectionType: item.connection_type,
            accessNodeProcessId: item.accessNodeProcessId
          }
        })

        return result
      } catch (e) {
        console.log('catch', e) // eslint-disable-line
        return { items: [], total: 0 }
      }
    },

    async loadTable(filter, config) {
      filter.where &&
        Object.assign(filter.where, {
          meta_type: {
            in: ['collection', 'table', 'view'] //,
          },
          is_deleted: false,
          sourceType: 'SOURCE'
        })
      Object.assign(filter, {
        fields: {
          original_name: true
        },
        order: ['original_name ASC']
      })
      if (filter.where?.value) {
        filter.where.original_name = filter.where?.value
        delete filter.where.value
      } else {
        filter.where.original_name = {
          // regexp: '^[^\\s]+$'
          neq: ''
        }
      }
      const data = await metadataInstancesApi.get({ filter: JSON.stringify(filter) }, config)
      data.items = data.items.map(item => {
        return {
          label: item.original_name + (item.comment ? `(${item.comment})` : ''),
          value: item.original_name
        }
      })
      const table = filter.where.original_name?.like
      if (table && !data.items.some(t => t.value.includes(table))) {
        const res = await metadataInstancesApi.checkTableExist({
          connectionId: filter.where['source.id'],
          tableName: table
        })
        if (res?.exist) {
          data.items.unshift({
            label: table,
            value: table
          })
        }
      }
      return data
    }
  }
}
</script>

<style scoped lang="scss">
.materialized-view-node {
  width: 300px;

  &.--target {
    border: 2px solid map-get($color, primary);
  }

  code {
    font-family: $codeFontFamily;
  }

  .node-header {
    border-top-left-radius: inherit;
    border-top-right-radius: inherit;
  }
}
.color-success-light-5 {
  color: #009a29;
}
</style>
