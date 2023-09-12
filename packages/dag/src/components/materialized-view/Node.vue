<template>
  <div
    class="materialized-view-node position-absolute rounded-lg bg-white"
    :class="nodeClass"
    :style="nodeStyle"
    @click="mouseClick"
  >
    <div class="p-2 node-header">
      <div class="flex gap-2 mb-2">
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
          :disabled="!node.connectionId"
          :method="loadTable"
          :connectionId="node.connectionId"
          itemType="object"
          itemQuery="value"
        ></TableSelect>
      </div>
      <ElForm class="node-form" label-position="top">
        <ElFormItem>
          <div slot="label" class="flex align-center justify-content-between">
            <span>{{ $t('packages_dag_nodes_mergetable_guanliantiaojian') }}</span>
            <ElLink type="primary" size="mini">
              <VIcon>add</VIcon>
              {{ $t('public_button_add') }}</ElLink
            >
          </div>
          <div class="flex align-center gap-2">
            <FieldSelect :options="schema"></FieldSelect>
            <span>=</span>
            <FieldSelect></FieldSelect>
            <IconButton>delete</IconButton>
          </div>
        </ElFormItem>

        <ElFormItem :label="$t('packages_dag_nodes_mergetable_guanlianhouxieru')">
          <ElInput></ElInput>
        </ElFormItem>

        <ElFormItem :label="$t('packages_dag_nodes_mergetable_neiqianshuzupi')">
          <ElInput></ElInput>
        </ElFormItem>
      </ElForm>
    </div>
    <ElDivider class="my-0" />
    <div class="p-2 node-body">
      <code class="color-success-light-5">{</code>
      <ElTree :indent="8" :data="treeData" :render-content="renderContent"></ElTree>
      <code class="color-success-light-5">}</code>
    </div>
  </div>
</template>

<script>
import { merge } from 'lodash'
import { mapGetters, mapMutations } from 'vuex'
import { connectionsApi, metadataInstancesApi } from '@tap/api'
import { CONNECTION_STATUS_MAP } from '@tap/business/src/shared'
import { Time } from '@tap/shared'
import { AsyncSelect, FieldSelect } from '@tap/form'
import { IconButton } from '@tap/component'
import i18n from '@tap/i18n'
import { TableSelect } from '../form'
import { sourceEndpoint, targetEndpoint } from '../../style'
import BaseNode from '../BaseNode.vue'
export default {
  name: 'Node',

  props: {
    position: Array,
    schema: Array,
    node: {
      type: Object,
      default: () => ({})
    },
    data: Object,
    nodeId: {
      type: String,
      required: true
    },
    jsPlumbIns: Object
  },

  components: {
    AsyncSelect,
    TableSelect,
    FieldSelect,
    IconButton
  },

  data() {
    return {
      loading: false,
      params: {
        where: { database_type: 'MongoDB' }
      }
    }
  },

  computed: {
    ...mapGetters('dataflow', [
      'nodeById',
      'isActionActive',
      'isNodeActive',
      'isNodeSelected',
      'isMultiSelect',
      'processorNodeTypes',
      'hasNodeError',
      'stateIsReadonly',
      'activeType'
    ]),

    ins() {
      return this.node?.__Ctor || {}
    },

    nodeClass() {
      const list = []
      this.ins && list.push(`node--${this.ins.group}`)
      return list
    },

    nodeStyle() {
      const [left = 0, top = 0] = this.position || []
      return {
        left: left + 'px',
        top: top + 'px'
      }
    },

    treeData() {
      console.log('computed:treeData')
      return this.schema ? this.createTree(this.schema) : []
    }
  },

  mounted() {
    // this.node.id && this.loadSchema()
    if (this.node && this.ins) {
      this.__init()
    }
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
      // const { id, nodeId } = this
      const { id } = this.node
      const nodeId = id

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
          const { position } = this.node.attrs
          const newProperties = []
          const oldProperties = []

          if (this.isActionActive('dragActive')) {
            this.position.splice(0, 2, parseFloat(this.$el.style.left), parseFloat(this.$el.style.top))
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
          connectorStyle: {
            strokeWidth: 1,
            stroke: '#9f9f9f',
            outlineStroke: 'transparent',
            outlineWidth: 20
          }
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
        /*if (this.isCtrlKeyPressed(e) === false) {
          // 如果不是多选模式则取消所有节点选中
          this.$emit('deselectAllNodes')
        }*/

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
    },

    createTree(data) {
      const root = { children: [] }

      for (const item of data) {
        if (item.is_deleted) continue

        const { field_name } = item
        let parent = root
        const fields = field_name.split('.')

        for (let i = 0; i < fields.length; i++) {
          const field = fields[i]
          let child = parent.children.find(c => c.field_name === field)

          if (!child) {
            child = { field_name: field, children: [] }
            parent.children.push(child)
          }

          parent = child

          if (i === fields.length - 1) {
            Object.assign(parent, item, {
              field_name: field
            })
          }
        }
      }

      return root.children
    },

    async loadSchema() {
      this.loading = true
      const params = {
        nodeId: this.node.id,
        fields: ['original_name', 'fields', 'qualified_name'],
        page: 1,
        pageSize: 20
      }
      const {
        items: [schema = {}]
      } = await metadataInstancesApi.nodeSchemaPage(params)
      const { fields = [], indices = [] } = schema

      let columnsMap = indices.reduce((map, item) => {
        item.columns.forEach(({ columnName }) => (map[columnName] = true))
        return map
      }, {})

      this.treeData = this.createTree(
        fields.sort((a, b) => a.columnPosition - b.columnPosition),
        columnsMap
      )
      this.loading = false
    },

    renderContent(h, { node, data, store }) {
      let icon

      if (data.primary_key_position > 0) {
        icon = (
          <VIcon size="12" class="field-icon position-absolute">
            key
          </VIcon>
        )
      } else if (data.indicesUnique) {
        icon = (
          <VIcon size="12" class="field-icon position-absolute">
            fingerprint
          </VIcon>
        )
      }

      return (
        <div class="flex flex-1 min-w-0 justify-content-between align-center gap-2 pr-2 position-relative">
          {icon}
          <span class="ellipsis">{data.field_name}</span>
          <span class="ml-1 font-color-slight">{data.dataType}</span>
        </div>
      )
    }
  }
}
</script>

<style scoped lang="scss">
.materialized-view-node {
  width: 300px;

  code {
    font-family: $codeFontFamily;
  }

  .node-header {
    border-top-left-radius: inherit;
    border-top-right-radius: inherit;
    border-top: 6px solid map-get($color, primary);
  }

  .node-body {
    ::v-deep {
      .field-icon {
        left: -18px;
        top: 50%;
        transform: translateY(-50%);
      }
    }
  }

  &.--target {
    .node-header {
      border-top-left-radius: inherit;
      border-top-right-radius: inherit;
      border: 2px solid map-get($color, primary);

      ::v-deep {
        .el-input .el-input__inner {
          border-color: transparent;
        }
      }
    }

    .node-body {
      border-bottom-left-radius: inherit;
      border-bottom-right-radius: inherit;
      border: 2px solid map-get($color, primary);
      border-top: none;
    }
  }
}
.color-success-light-5 {
  color: #009a29;
}
.node-form {
  ::v-deep {
    .el-form-item {
      margin-bottom: 8px;

      .el-form-item__label {
        width: 100%;
        line-height: 20px;
        padding-bottom: 0;
        margin-bottom: 6px;
      }
    }
  }
}
</style>
