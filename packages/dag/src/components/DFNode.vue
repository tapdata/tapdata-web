<template>
  <div class="df-node-wrap position-absolute" :class="wrapClass" :style="nodeStyle">
    <BaseNode :node="data" :class="nodeClass" @click="mouseClick">
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
        <div
          class="node-option"
          :title="$t('packages_dag_components_dfnode_tianjiajiedian')"
          @click.stop="$emit('show-node-popover', 'node', data, $event.currentTarget || $event.target)"
        >
          <VIcon>plus</VIcon>
        </div>
        <div
          @click.stop="$emit('delete', data.id)"
          class="node-option"
          :title="$t('packages_dag_components_dfnode_shanchujiedian')"
        >
          <VIcon>close</VIcon>
        </div>
      </div>
      <ElTooltip v-if="hasNodeError(data.id)" :content="nodeErrorMsg" placement="top">
        <VIcon class="mr-2" size="14" color="#FF7474">warning</VIcon>
      </ElTooltip>
      <div class="node-anchor input"></div>
      <div v-show="allowTarget" class="node-anchor output"></div>
    </BaseNode>
    <slot></slot>
  </div>
</template>

<script>
import i18n from '@tap/i18n'

import { mapGetters, mapMutations, mapState } from 'vuex'
import deviceSupportHelpers from '@tap/component/src/mixins/deviceSupportHelpers'
import { sourceEndpoint, targetEndpoint } from '../style'
import { NODE_PREFIX } from '../constants'
import BaseNode from './BaseNode'
import { VIcon, OverflowTooltip } from '@tap/component'

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
      id: this.$attrs.id
    }
  },

  computed: {
    ...mapState('dataflow', ['canBeConnectedNodeIds']),
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

    data() {
      return this.nodeById(this.nodeId)
    },

    ins() {
      return this.data.__Ctor
    },

    allowTarget() {
      if (typeof this.ins?.allowTarget === 'boolean') {
        return this.ins.allowTarget
      }
      return true
    },

    wrapClass() {
      if (this.canBeConnectedNodeIds.includes(this.nodeId)) return 'can-be-connected'
      return ''
    },

    nodeClass() {
      const list = []
      if (this.isNodeActive(this.nodeId) && this.activeType === 'node') list.push('active')
      if (this.isNodeSelected(this.nodeId)) list.push('selected')
      this.ins && list.push(`node--${this.ins.group}`)
      return list
    },

    nodeStyle() {
      const [left = 0, top = 0] = this.data.attrs?.position || []
      return {
        left: left + 'px',
        top: top + 'px'
      }
    },

    nodeErrorMsg() {
      const res = this.hasNodeError(this.data.id)
      if (res) {
        return typeof res === 'string' ? res : i18n.t('packages_dag_components_dfnode_qingjianchajiedian')
      }
      return null
    }
  },

  mounted() {
    if (this.data && this.ins) {
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

      const targetParams = {
        ...targetEndpoint
      }

      // this.jsPlumbIns.makeSource(id, { filter: '.sourcePoint', ...sourceEndpoint })

      this.jsPlumbIns.makeTarget(id, targetParams)

      this.jsPlumbIns.draggable(this.$el, {
        // containment: 'parent',
        start: params => {
          this.onMouseDownAt = Date.now()
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

            if (distance < 4 || Date.now() - this.onMouseDownAt < 10) {
              console.log(
                i18n.t('packages_dag_components_dfnode_tuodongshijianduan'),
                Date.now() - this.onMouseDownAt,
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

      // if (this.data.type !== 'table') {
      //   this.targetPoint.setType('warn')
      // }

      console.log('targetPoint', this.targetPoint) // eslint-disable-line

      const maxOutputs = this.ins.maxOutputs ?? -1

      this.allowTarget &&
        this.jsPlumbIns.addEndpoint(
          this.$el,
          {
            ...sourceEndpoint,
            // enabled: !this.stateIsReadonly,
            maxConnections: maxOutputs,
            dragOptions: {
              beforeStart: ({ el }) => {
                if (this.stateIsReadonly) return false
                // 源point没有onMaxConnections事件回调，故用次事件内提示
                if (maxOutputs !== -1 && el._jsPlumb.connections.length >= maxOutputs) {
                  this.$message.error(i18n.t('packages_dag_components_dfnode_gaijiedianth', { val1: this.data.name }))
                }
              }
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

.df-node {
  &.jtk-drag {
    &:after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
    }
  }

  .node-anchor {
    display: none;
    width: 16px;
    height: 16px;
    border-color: inherit;
    position: absolute;
    cursor: crosshair;
    left: 100%;
    transform: translateX(-50%);
    place-content: center;
    place-items: center;

    &:before {
      content: '';
      position: absolute;
      border-width: 1px;
      border-style: solid;
      border-color: inherit;
      border-radius: 50%;
      background: #fff;
      width: 12px;
      height: 12px;
    }

    &.input {
      left: 0;
    }

    //&:hover:before {
    //  border-width: 2px;
    //  width: 16px;
    //  height: 16px;
    //}
  }

  &:hover .node-anchor.output {
    display: flex;
  }
}
</style>

<style lang="scss">
.df-node-wrap {
  z-index: 5;
  &.can-be-connected {
    .node-anchor.input {
      display: flex;

      &:before {
        content: '';
        position: absolute;
        border-width: 2px;
        border-style: solid;
        border-color: #2c65ff;
        border-radius: 50%;
        background: #c0d1ff;
        width: 14px;
        height: 14px;
      }
    }

    &.dropHover .node-anchor.input {
      &:before {
        width: 16px;
        height: 16px;
        border-color: #2c65ff;
      }
    }

    &.dropHover ~ svg.jtk-connector.jtk-dragging {
      path:nth-child(2) {
        stroke: #2c65ff;
      }
      path:nth-child(3) {
        fill: #2c65ff;
        stroke: #2c65ff;
      }
    }
  }
  .df-node {
    position: static;
  }

  &.options-active {
    .df-node-options {
      display: flex;
    }
  }
}
</style>
