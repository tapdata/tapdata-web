<template>
  <BaseNode :node="data" :class="nodeClass" :style="nodeStyle" @click="mouseClick">
    <template #text="{ text }">
      <OverflowTooltip
        class="df-node-text"
        :text="text"
        popper-class="df-node-text-tooltip"
        placement="top"
        :open-delay="400"
      />
    </template>
    <div v-if="!stateIsReadonly" class="df-node-options" @click.stop>
      <el-popover v-model="showAddMenu" placement="bottom" trigger="click" popper-class="min-width-unset rounded-xl">
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
    <ElTooltip v-if="hasNodeError(data.id)" content="请检查节点配置" placement="top">
      <VIcon class="mr-2" size="14" color="#FF7474">warning</VIcon>
    </ElTooltip>
  </BaseNode>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import deviceSupportHelpers from 'web-core/mixins/deviceSupportHelpers'
import { sourceEndpoint, targetEndpoint } from '../style'
import { NODE_PREFIX } from '../constants'
import BaseNode from './BaseNode'
import VIcon from 'web-core/components/VIcon'
import OverflowTooltip from 'web-core/components/overflow-tooltip'

export default {
  name: 'DFNode',
  components: {
    OverflowTooltip,
    VIcon,
    BaseNode
  },
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
      'processorNodeTypes',
      'hasNodeError',
      'stateIsReadonly'
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
      if (this.isNodeSelected(this.nodeId)) list.push('selected')
      if (this.showAddMenu) list.push('options-active')
      list.push(`node--${this.ins.group}`)
      return list
    },

    nodeStyle() {
      const [left, top] = this.data.attrs.position
      return {
        left: left + 'px',
        top: top + 'px'
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
      'resetSelectedNodes',
      'setNodeError',
      'clearNodeError'
    ]),

    __init() {
      const { id, nodeId } = this

      // console.log('sourceEndpoint, targetEndpoint', sourceEndpoint, targetEndpoint) // eslint-disable-line
      const targetParams = { ...targetEndpoint, maxConnections: this.ins.attr.maxInputs || -1 }

      // this.jsPlumbIns.makeSource(id, { filter: '.sourcePoint', ...sourceEndpoint })

      this.jsPlumbIns.makeTarget(id, targetParams)

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

            if (x === position[0] && y === position[1]) {
              // 拖拽结束后位置没有改变
              console.log('没有移动') // eslint-disable-line
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

              // this.updateNodeProperties(updateInformation)
            })
          }

          this.$emit('drag-stop', this.isNotMove, oldProperties, newProperties)
        }
      })

      this.jsPlumbIns.addEndpoint(this.$el, targetParams, {
        uuid: id + '_target'
      })

      this.jsPlumbIns.addEndpoint(
        this.$el,
        {
          ...sourceEndpoint,
          enabled: !this.stateIsReadonly,
          maxConnections: this.ins.attr.maxOutputs || -1
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

.df-node-text {
  font-size: 12px;
}

.df-node-text-tooltip {
  transform: translateY(-6px);
}

.df-node.jtk-drag {
  &:after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
  }
}
</style>
