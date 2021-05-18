<template>
  <div class="e-entity" ref="entityDom">
    <div class="header e-port e-port-out" v-if="schema" ref="outPort">
      <el-checkbox
        v-if="filterFields"
        v-model="isCheckAll"
        :indeterminate="isIndeterminate"
        @change="handleCheckAllChange"
      ></el-checkbox>
      <span style="margin-left: 5px">{{ schema.name }}</span>
    </div>
    <div class="main">
      <el-tree
        default-expand-all
        ref="tree"
        icon-class="icon-none"
        :indent="0"
        :data="fields || []"
        :node-key="nodeKey"
        :show-checkbox="!!filterFields"
        @node-expand="handlerNodeExpand"
        @node-collapse="handlerNodeCollapse"
        @check="checkHandler"
      >
        <div
          class="tree-node"
          :style="{
            color: data.color
          }"
          :class="{
            'has-children': data.children && data.children.length,
            'active-delete': isRemove(data.id),
            'active-retained': isRetained(data.id)
          }"
          slot-scope="{ node, data }"
        >
          <span
            class="e-port e-port-in"
            style="position: absolute; left: 0"
            :ref="getInportRef(data)"
          ></span>
          <span
            class="parent-node-icon"
            v-for="l in data.level - 1"
            :key="l"
          ></span>
          <span class="node-icon">
            <i class="icon-expand"></i>
          </span>
          <template v-if="data.type">
            <el-tooltip
              class="item"
              effect="dark"
              :content="data.type"
              placement="left"
            >
              <img :src="getImgByType(data.type) || getImgByType('Default')" />
            </el-tooltip>
          </template>
          <img
            class="pk"
            v-if="data.primary_key_position > 0"
            src="../../../assets/images/PK.png"
          />
          <span class="node-label">{{ node.label }}</span>
        </div>
      </el-tree>
    </div>
  </div>
</template>

<script>
import log from '../../../log'
import { removeDeleted } from '../../util/Schema'
export default {
  name: 'Entity',
  props: {
    schema: {
      required: true,
      value: [Object, Array, null, undefined]
    },
    nodeKey: {
      type: String,
      default: 'id'
    },
    tableNameKey: {
      type: String,
      default: 'table_name'
    },
    filterFields: Array,
    operations: {
      type: Array
    }
  },

  watch: {
    schema(schema) {
      this.tableMap = {}
      if (schema && schema.fields && this.filterFields) {
        let checkedKeys = []
        schema.fields.forEach(f => {
          checkedKeys.push(f[this.nodeKey])
        })
        this.$refs.tree.setCheckedKeys(checkedKeys)
        this.$nextTick(() => {
          this.defaultChecked = this.$refs.tree.getCheckedKeys()
          this.filterFields.forEach(f => {
            this.$refs.tree.setChecked(f[this.nodeKey], false)
          })
        })
      }
      //过滤被删除的数据
      if (schema && schema.fields) {
        schema.fields = removeDeleted(schema.fields)
        //延时加载
        let fields = schema.fields
        let total = fields.length
        let size = total < 5 ? total : 10
        let index = 0
        this.fields = []
        let interval = this.interval
        if (interval) {
          clearInterval(interval)
          this.interval = null
        }
        this.$nextTick(() => {
          let load = () => {
            this.fields.push(
              ...fields.slice((index + 0) * size, (index + 1) * size)
            )
            index++
          }
          this.interval = setInterval(() => {
            if (index * size < total) {
              load()
            } else {
              clearInterval(this.interval)
              this.interval = null
            }
          }, 500)
        })
      } else {
        this.fields = []
      }

      log('Entity Schema Change:', schema)
    }
  },

  data() {
    return {
      editable: true,
      isCheckAll: true,
      isIndeterminate: false,
      tableMap: {},
      defaultChecked: [],
      typeMap: {},
      fields: [],
      interval: null
    }
  },

  methods: {
    getImgByType(type) {
      return require(`@/assets/images/types/${type.toLowerCase()}.png`)
    },
    getCheckedKeys(fields) {
      let ids = []
      fields.forEach(f => {
        ids.push(f[this.nodeKey])
        if (f.children) {
          ids.push(...this.getCheckedKeys(f.children))
        }
      })
      return ids
    },
    isRemove(id) {
      let ops = this.operations
        ? this.operations.filter(v => v.id === id && v.op === 'DELETE')
        : []
      return ops && ops.length > 0
    },
    isRetained(id) {
      let ops = this.operations
        ? this.operations.filter(v => v.id === id && v.op === 'RETAINED')
        : []
      return ops && ops.length > 0
    },
    checkHandler(data, checkedInfo) {
      this.isIndeterminate =
        this.defaultChecked.length !== checkedInfo.checkedKeys.length &&
        checkedInfo.checkedKeys.length
      this.isCheckAll =
        this.defaultChecked.length === checkedInfo.checkedKeys.length
      this.$emit(
        'check',
        checkedInfo.checkedNodes.concat(checkedInfo.halfCheckedNodes)
      )
    },
    handleCheckAllChange(val) {
      let checkKeys = val ? this.defaultChecked : []
      this.$refs.tree.setCheckedKeys(checkKeys)
      this.isIndeterminate = false
      this.$nextTick(() => {
        this.$emit('check', this.$refs.tree.getCheckedNodes())
      })
    },
    handlerNodeExpand(data) {
      this.$emit('expand', data)
    },
    handlerNodeCollapse(data) {
      this.$emit('collapse', data)
    },
    getTableName(node) {
      let tableName = node[this.tableNameKey]
      if (tableName) tableName = tableName.replace(/[\\.,]/g, '_')
      return tableName
    },
    getInportRef(data) {
      let tableName = this.getTableName(data)
      let count = this.tableMap[tableName] || 0
      count += 1
      this.tableMap[tableName] = count
      return tableName + '_' + count
    },
    getOutPort() {
      return this.$refs.outPort
    },
    getInPort(table) {
      let tableName = this.getTableName(table)
      return this.$refs[tableName + '_' + 1]
    }
  }
}
</script>

<style lang="scss">
$color: #4aaf47;

.e-entity {
  margin: 0 auto;
  width: 100%;
  max-width: 300px;
  border: 1px solid $color;
  text-align: left;
  border-radius: 3px;
  overflow: hidden;
  box-sizing: border-box;
  .header {
    height: 24px;
    padding-top: 4px;
    background: $color;
    font-size: 12px;
    color: #fff;
  }
  .el-tree-node__content {
    height: 24px;
  }
  .el-tree-node:focus > .el-tree-node__content,
  .el-tree-node__content:hover {
    background: #fff !important;
  }
  .el-tree
    > .el-tree-node:nth-last-child(2)
    > .el-tree-node__content
    > .tree-node
    > .node-icon::before,
  .el-tree-node:last-child
    > .el-tree-node__content
    > .tree-node
    > .node-icon::before {
    border: none;
    border-top: 1px solid #e1e1e1;
    left: -1px;
    height: 50%;
    background: #fff;
  }
  .el-tree
    > .is-expanded:nth-last-child(2)
    > .el-tree-node__content
    > .has-children
    > .node-icon::before,
  .is-expanded:last-child
    > .el-tree-node__content
    > .has-children
    > .node-icon::before {
    border: none;
    border-bottom: 1px solid #e1e1e1;
    left: 0;
    height: 0;
  }
  .is-expanded
    > .el-tree-node__content
    > .tree-node.has-children
    .icon-expand::before {
    transform: translate(-50%, -50%) rotate(0);
  }
  .tree-node {
    display: flex;
    align-items: center;
    flex: 1;
    padding: 0 5px;
    font-size: 12px;
    color: #666;
    height: 100%;
    overflow: hidden;
    &.active-delete {
      background: rgba(0, 0, 0, 0.2);
    }
    &.active-retained {
      background: #b4f18d;
    }
    &.has-children {
      .icon-expand {
        position: absolute;
        display: block;
        width: 12px;
        height: 12px;
        top: 50%;
        left: 0;
        transform: translate(-50%, -50%);
        border: 1px solid #ccc;
        background: #fff;
        box-sizing: border-box;
        &::before,
        &::after {
          content: '';
          position: absolute;
          width: 6px;
          height: 2px;
          background: #ccc;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          transition: transform 0.3s ease 0s;
        }
        &::before {
          transform: translate(-50%, -50%) rotate(90deg);
        }
        &:hover {
          border: 1px solid $color;
          &::before,
          &::after {
            background: $color;
          }
        }
      }
    }
    .pk {
      margin-left: 5px;
    }
    .node-label {
      flex: 1;
      overflow: hidden;
      padding: 0 5px;
      box-sizing: border-box;
    }
    .node-icon {
      position: relative;
      margin-right: 15px;
      height: 100%;
      line-height: 1;
      border-left: 1px solid #e1e1e1;
      &::before {
        display: block;
        content: '';
        width: 10px;
        border-bottom: 1px solid #e1e1e1;
        position: absolute;
        top: 50%;
      }
    }
    .parent-node-icon {
      margin-right: 15px;
      height: 100%;
      line-height: 1;
      border-left: 1px solid #e1e1e1;
    }
  }
}
</style>
