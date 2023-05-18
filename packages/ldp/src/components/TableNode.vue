<template>
  <div class="position-absolute table-node border rounded-lg bg-white overflow-hidden" :style="nodeStyle">
    <div class="px-3 py-2" @click="mouseClick">
      <div class="ellipsis">{{ data.name }}</div>
      <div class="mt-1 flex align-center gap-1 font-color-light ellipsis">
        <NodeIcon :node="data" :size="14"></NodeIcon>
        连接名称
      </div>
    </div>
    <!--<div class="columns-wrap px-3 py-2">
      <div>查看字段</div>
      <div></div>
    </div>-->
    <!--<BaseNode :node="data" class="node&#45;&#45;data">
      <template #text="{ text }">
        <div class="w-100">
          <div :title="text" class="df-node-text">{{ text }}</div>
          <div class="font-color-light">连接名称</div>
        </div>
      </template>
    </BaseNode>-->
  </div>
</template>

<script>
import { BaseNode, NodeIcon } from '@tap/dag'
import { sourceEndpoint, targetEndpoint } from '@tap/dag/src/style'
import i18n from '@tap/i18n'
import { NODE_PREFIX } from '@tap/dag'
import { Time } from '@tap/shared'
import { OverflowTooltip, VIcon } from '@tap/component'
import { mapGetters, mapMutations } from 'vuex'

export default {
  name: 'TableNode',
  props: {
    data: Object,
    nodeId: {
      type: String,
      required: true
    },
    jsPlumbIns: Object
  },

  components: { VIcon, OverflowTooltip, BaseNode, NodeIcon },

  data() {
    return {
      id: this.$attrs.id
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

    nodeStyle() {
      const [left = 0, top = 0] = this.data.attrs?.position || []
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
    }
  }
}
</script>

<style scoped lang="scss">
.table-node {
  width: 200px;
  z-index: 5;
  ::v-deep {
    .df-node {
      position: static;

      .df-node-text {
        font-size: $fontBaseTitle;
      }

      .df-node-text-tooltip {
        transform: translateY(-6px);
      }

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
  }

  .columns-wrap {
    background-color: #f5f8fe;
  }
}
</style>
