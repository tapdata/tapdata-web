<template>
  <div
    class="df-node flex align-center"
    :class="nodeClass"
    :style="nodeStyle"
    @mousedown="mouseDown"
    @click="mouseClick"
  >
    <div class="df-node-icon ml-2">
      <ElImage draggable="false" :src="`static/editor/o-${ins.icon}.svg`"></ElImage>
    </div>
    <div class="df-node-text text-truncate mx-2 lh-1">{{ data.name }}</div>
    <div class="df-node-action"></div>
  </div>
</template>

<script>
import { sourceEndpoint, targetEndpoint } from '@/views/dataflow/style'
import { mapGetters, mapMutations } from 'vuex'
import deviceSupportHelpers from '@/mixins/deviceSupportHelpers'
import { NODE_PREFIX } from '@/views/dataflow/constants'

export default {
  name: 'DFNode',

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
    ...mapGetters('dataflow', ['nodeById', 'isActionActive', 'isNodeActive', 'isNodeSelected']),

    data() {
      return this.nodeById(this.nodeId)
    },

    ins() {
      return this.data.__Ctor
    },

    nodeClass() {
      const list = []
      if (this.isNodeActive(this.nodeId)) list.push('active')
      if (this.isNodeSelected(this.nodeId)) list.push('jtk-drag-selected')
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

      // this.jsPlumbIns.makeSource(id, targetEndpoint)
      // this.jsPlumbIns.makeTarget(id, sourceEndpoint)

      this.jsPlumbIns.draggable(this.$el, {
        containment: 'parent',
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
        stop: params => {
          console.log('node-drag-stop', params)
          // 更新节点坐标
          this.isNotMove = false
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

            let newNodePosition
            moveNodes.forEach(node => {
              const nodeElement = NODE_PREFIX + node.id
              const element = document.getElementById(nodeElement)
              if (element === null) {
                return
              }

              newNodePosition = [parseFloat(element.style.left), parseFloat(element.style.top)]

              const updateInformation = {
                id: node.id,
                properties: {
                  position: newNodePosition
                }
              }

              this.updateNodeProperties(updateInformation)
            })
          }

          this.$emit('drag-stop', params)
        }
      })

      this.jsPlumbIns.addEndpoint(this.$el, targetEndpoint, {
        uuid: id + '_target'
      })

      this.jsPlumbIns.addEndpoint(this.$el, sourceEndpoint, {
        uuid: id + '_source'
      })
    },

    mouseDown() {
      // this.addActiveAction('dragActive')
      console.log('DFNode.mouseDown')
    },

    mouseClick(e) {
      // console.log('DFNode.mouseClick', this.isActionActive('dragActive'))
      if (this.isActionActive('dragActive')) {
        this.removeActiveAction('dragActive')
        if (this.isNotMove) this.$emit('nodeSelected', this.nodeId, true)
      } else {
        if (this.isCtrlKeyPressed(e) === false) {
          // 如果不是多选模式则取消所有节点选中
          this.$emit('deselectAllNodes')
        }

        console.log('this.isNodeSelected(this.nodeId)', this.isNodeSelected(this.nodeId))
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

.df-node {
  position: absolute;
  width: 160px;
  height: 36px;
  background-color: #fff;
  border: 1px solid var(--primary);
  border-radius: 20px;
  box-sizing: border-box;

  &-icon {
    .el-image {
      width: 30px;
      height: 30px;
      vertical-align: middle;
    }
  }

  &-text {
    //display: -webkit-box;
    //-webkit-box-orient: vertical;
    //-webkit-line-clamp: 2;
    //overflow: hidden;
    //word-break: break-all; // 暂时封印，英文换行看起来有点怪
    font-size: 12px;
  }

  &.active,
  &.jtk-drag-selected {
    background-color: var(--primary-hover-l);
  }
}
</style>
