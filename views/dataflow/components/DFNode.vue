<template>
  <BaseNode :node="data" :class="nodeClass" :style="nodeStyle" @click="mouseClick">
    <div class="df-node-options" @click.stop>
      <el-popover
        v-model="showAddMenu"
        placement="bottom"
        width="88"
        trigger="click"
        popper-class="min-width-unset rounded-xl"
      >
        <div slot="reference" class="node-option" titlmoue="添加节点">
          <VIcon>plus</VIcon>
        </div>
        <div class="df-menu-list">
          <div v-for="(n, ni) in processorNodeTypes" :key="ni" class="df-menu-item" @click="handleClickMenuItem(n)">
            {{ n.name }}
          </div>
        </div>
      </el-popover>
      <div @click.stop="$emit('delete', data.id)" class="node-option" title="删除节点">
        <VIcon>close</VIcon>
      </div>
    </div>
  </BaseNode>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import deviceSupportHelpers from '@/mixins/deviceSupportHelpers'
import { sourceEndpoint, targetEndpoint } from 'web-core/views/dataflow/style'
import { NODE_PREFIX } from 'web-core/views/dataflow/constants'
import BaseNode from 'web-core/views/dataflow/components/BaseNode'
import VIcon from '@/components/VIcon'

export default {
  name: 'DFNode',
  components: { VIcon, BaseNode },
  props: {
    nodeId: {
      type: String,
      required: true
    },
    jsPlumbIns: Object
  },

  mixins: [deviceSupportHelpers],

  data() {
    return {
      id: this.$attrs.id,
      showAddMenu: false
    }
  },

  computed: {
    ...mapGetters('dataflow', [
      'nodeById',
      'isActionActive',
      'isNodeActive',
      'isNodeSelected',
      'isMultiSelect',
      'processorNodeTypes'
    ]),

    data() {
      return this.nodeById(this.nodeId)
    },

    ins() {
      return this.data.__Ctor
    },

    nodeClass() {
      const list = []
      if (this.isNodeActive(this.nodeId)) list.push('active')
      // 多个节点选中显示高亮效果
      // if (this.isNodeSelected(this.nodeId) && this.isMultiSelect) list.push('jtk-drag-selected')
      if (this.isNodeSelected(this.nodeId)) list.push('jtk-drag-selected')
      if (this.showAddMenu) list.push('options-active')
      list.push(`node--${this.ins.group}`)
      return list
    },

    nodeStyle() {
      return {
        left: this.data.position[0] + 'px',
        top: this.data.position[1] + 'px'
      }
    }
  },

  mounted() {
    if (this.data) {
      this.__init()
    }
  },

  methods: {
    ...mapMutations('dataflow', [
      'setActiveNode',
      'addActiveAction',
      'removeActiveAction',
      'updateNodeProperties',
      'resetSelectedNodes'
    ]),

    __init() {
      const { id, nodeId } = this

      console.log('sourceEndpoint, targetEndpoint', sourceEndpoint, targetEndpoint)

      this.jsPlumbIns.makeSource(id, { filter: '.sourcePoint', ...sourceEndpoint })

      this.jsPlumbIns.makeTarget(id, targetEndpoint)

      this.jsPlumbIns.draggable(this.$el, {
        // containment: 'parent',
        start: params => {
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
          const newProperties = []
          const oldProperties = []

          if (this.isActionActive('dragActive')) {
            const moveNodes = this.$store.getters['dataflow/getSelectedNodes']
            const selectedNodeNames = moveNodes.map(node => node.id)

            if (!selectedNodeNames.includes(this.data.id)) {
              moveNodes.push(this.data)
            }

            let x = parseFloat(this.$el.style.left)
            let y = parseFloat(this.$el.style.top)

            if (x === this.data.position[0] && y === this.data.position[1]) {
              // 拖拽结束后位置没有改变
              console.log('没有移动')
              this.isNotMove = true
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
                  position: newNodePosition
                }
              }

              oldProperties.push({
                id: node.id,
                properties: {
                  position: node.position
                }
              })
              newProperties.push(updateInformation)

              this.updateNodeProperties(updateInformation)
            })
          }

          this.$emit('drag-stop', this.isNotMove, oldProperties, newProperties)
        }
      })

      this.jsPlumbIns.addEndpoint(this.$el, targetEndpoint, {
        uuid: id + '_target'
      })

      this.jsPlumbIns.addEndpoint(this.$el, sourceEndpoint, {
        uuid: id + '_source'
      })
    },

    mouseClick(e) {
      if (this.isActionActive('dragActive')) {
        this.removeActiveAction('dragActive')
      } else {
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

    handleClickMenuItem(n) {
      this.showAddMenu = false
      this.$emit('quick-add-node', this.data, n)
    }
  }
}
</script>

<style lang="scss">
.layout-content .df-node {
  cursor: move;
}

.min-width-unset {
  min-width: unset;
}

.df-node {
  position: absolute;
  display: flex;
  align-items: center;
  width: 180px;
  height: 48px;
  background-color: #fff;
  border: 1px solid #2c65ff;
  border-radius: 10px;
  box-sizing: border-box;

  &-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 45px;
    height: 100%;
    background-color: rgba(44, 101, 255, 0.2);
    border-right-style: solid;
    border-right-width: inherit;
    border-color: inherit;
    border-top-left-radius: inherit;
    border-bottom-left-radius: inherit;

    .v-icon {
      color: #2c65ff;
      font-size: 24px;
    }
  }

  &-text {
    margin: 0 10px;
    flex: auto;
    width: 0;
    font-size: 14px;
    line-height: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &-options {
    position: absolute;
    top: 100%;
    display: none;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 32px;
  }

  .node-option {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 6px;
    width: 20px;
    height: 20px;
    background-color: #9bb6ff;
    border-radius: 100%;
    cursor: pointer;
    .v-icon {
      width: 16px;
      height: 16px;
      font-size: 12px;
      background-color: #2c65ff;
      color: #fff;
      border-radius: 100%;
      &__svg {
        width: 1em;
        height: 1em;
      }
    }
  }

  &.node--data {
    border-color: #6236ff;
    .df-node-icon {
      background-color: rgba(98, 54, 255, 0.2);
      .v-icon {
        width: 34px !important;
        height: 34px !important;
        background-color: #6236ff;
        color: #fff;
        font-size: 14px;
        border-radius: 100%;
        .v-icon__svg {
          width: 1em;
          height: 1em;
        }
      }
    }
  }

  &.active {
    border-width: 2px;
  }

  &.active,
  &.jtk-drag-selected {
    border-color: #fa6303;
  }

  &:hover,
  &.options-active {
    .df-node-options {
      display: flex;
    }
  }
}

.df-menu-list {
  margin: -6px;
  .df-menu-item {
    margin-bottom: 2px;
    padding: 0 16px;
    height: 32px;
    line-height: 32px;
    font-size: 12px;
    border-radius: 6px;
    cursor: pointer;
    &:hover {
      background-color: #eef3ff;
    }
  }
}
</style>
