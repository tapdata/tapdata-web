<template>
  <div class="tree-transfer flex">
    <div class="tree-box">
      <div class="tree-box_title py-2 px-4">
        <el-checkbox v-model="selectAllLeft" @change="changeSelectAllLeft"></el-checkbox>
        <span class="ml-2">{{ leftTitle }}</span>
      </div>
      <el-tree
        ref="leftTree"
        v-bind="$attrs"
        :data="leftData"
        :node-key="nodeKey"
        show-checkbox
        default-expand-all
        :expand-on-click-node="false"
        :filter-node-method="filterNodeMethod"
        @check-change="checkChangeLeft"
      >
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span class="flex align-center">{{ data.name }}</span>
        </span>
      </el-tree>
    </div>

    <div class="opertion flex flex-column align-center justify-center mx-5">
      <div>
        <el-button class="flex justify-center" type="primary" @click="toRight" :disabled="disabledBtnLeft">
          <i class="el-icon-right"></i>
        </el-button>
      </div>
      <div class="flex justify-center mt-4 none">
        <el-button @click="toLeft">
          <i class="el-icon-back"></i>
        </el-button>
      </div>
    </div>
    <div class="tree-box">
      <div class="tree-box_title py-2 px-4">
        <el-checkbox v-model="selectAllRight" @change="changeSelectAllRight"></el-checkbox>
        <span class="ml-2">{{ rightTitle }}</span>
      </div>
      <el-tree
        ref="rightTree"
        v-bind="$attrs"
        :data="rightData"
        :node-key="nodeKey"
        show-checkbox
        :draggable="draggableRight"
        default-expand-all
        :expand-on-click-node="false"
        :allow-drop="allowDropRight"
        @check-change="checkChangeRight"
      >
        <div class="custom-tree-node flex justify-between" slot-scope="{ node, data }">
          <slot name="right-tree" :data="data" :node="node"></slot>
        </div>
      </el-tree>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TreeTransfer',
  props: {
    leftData: {
      type: Array,
      default: () => {
        return []
      }
    },
    rightData: {
      type: Array,
      default: () => {
        return []
      }
    },
    nodeKey: {
      type: String,
      default: 'id'
    },
    // 可以移动到右侧的判断
    toRightKey: {
      type: String,
      default: ''
    },
    draggableRight: {
      type: Boolean,
      default: false
    },
    filterNodeMethod: Function,
    leftTitle: [Number, String],
    rightTitle: [Number, String]
  },
  data() {
    return {
      selectAllLeft: false, // 全选，左树
      selectAllRight: false, // 全选，右树
      disabledBtnLeft: true
    }
  },
  methods: {
    toRight() {
      // 移到右侧
      let getCheckedNodesRight = this.getCheckedNodesRight()
      if (getCheckedNodesRight.length) {
        this.toRightNode()
      } else {
        this.toRightTree()
      }

      // 删除勾选的节点
      let getCheckedNodesLeft = this.getCheckedNodesLeft()
      getCheckedNodesLeft.forEach(el => {
        let getNode = this.getNodeLeft(el?.key)
        this.$refs.leftTree.remove(getNode)
      })
    },
    // 移动到右侧树
    toRightTree() {
      let getCheckedNodesLeft = this.getCheckedNodesLeft()
      let result = [...this.rightData, ...getCheckedNodesLeft]
      this.$emit('change-right-data', result)
    },
    // 移动到右侧节点下
    toRightNode(data = null) {
      let getCheckedNodesLeft = this.getCheckedNodesLeft()
      let getCheckedNodesRight = this.getCheckedNodesRight()
      let parentNode
      getCheckedNodesRight.forEach(el => {
        if (!parentNode && ((this.toRightKey && el[this.toRightKey]) || this.toRightKey === '')) {
          parentNode = el
        }
      })
      if (data) {
        this.$refs.rightTree.append(data, parentNode)
      } else {
        getCheckedNodesLeft.forEach(el => {
          this.$refs.rightTree.append(el, parentNode)
        })
      }
      this.$emit('change-right-data', [...this.rightData])
    },
    toLeft() {},
    // 获取节点-左树
    getNodeLeft(key) {
      return this.$refs.leftTree.getNode(key)
    },
    // 获取选中的节点-左树
    getCheckedNodesLeft() {
      return this.$refs.leftTree.getCheckedNodes()
    },
    // 设置选中的节点-左树
    setCheckedKeysLeft(keys = []) {
      this.$refs.leftTree.setCheckedKeys(keys)
    },
    // 当前操作的节点-左树
    checkChangeLeft() {
      this.resetBtnDisabled()
    },
    // 重置按钮的禁用
    resetBtnDisabled() {
      let getCheckedNodesLeft = this.getCheckedNodesLeft()
      this.disabledBtnLeft = !(getCheckedNodesLeft?.length > 0)
    },
    // 获取节点-右树
    getNodeRight(key) {
      return this.$refs.rightTree.getNode(key)
    },
    // 获取选中的节点-右树
    getCheckedNodesRight() {
      return this.$refs.rightTree.getCheckedNodes()
    },
    // 设置选中的节点-左树
    setCheckedKeysRight(keys = []) {
      this.$refs.rightTree.setCheckedKeys(keys)
    },
    // 当前操作的节点-右树
    checkChangeRight() {
      this.resetBtnDisabled()
    },
    // 是否被拖拽进入
    allowDropRight(draggingNode, dropNode, type) {
      let data = dropNode.data
      if (type !== 'inner') {
        return true
      } else {
        return !!((this.toRightKey && data[this.toRightKey]) || this.toRightKey === '')
      }
    },
    changeSelectAllLeft(value) {
      let result = this.leftData.map(item => item.key)
      // 全选
      if (value) {
        this.setCheckedKeysLeft(result)
      } else {
        // 取消全选
        this.setCheckedKeysLeft()
      }
    },
    changeSelectAllRight(value) {
      let result = this.rightData.map(item => item.key)
      // 全选
      if (value) {
        this.setCheckedKeysRight(result)
      } else {
        // 取消全选
        this.setCheckedKeysRight()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.tree-transfer {
  height: 100%;
  .tree-box {
    flex: 1;
    .tree-box_title {
      background-color: #f5f7fa;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
      border: 1px solid #efefef;
    }
    .el-tree {
      min-width: 200px;
      overflow-y: auto;
      height: 100%;
      border: 1px solid #efefef;
      border-top: none;
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 4px;
    }
  }

  .opertion {
    .el-button {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }
  }
  .custom-tree-node {
    width: 100%;
  }
}
</style>
