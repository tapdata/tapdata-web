<template>
  <el-drawer :visible="visible" size="calc(100% - 260px)" :with-header="false" @update:visible="handleUpdateVisible">
    <div class="h-100 flex flex-column">
      <header class="px-4 h-48 flex align-center">
        <div class="fs-6 font-color-dark">构建物化视图</div>
      </header>
      <PaperScroller v-if="showPaper" class="flex-1" ref="paperScroller">
        <Node
          v-for="node in nodes"
          :key="node.id"
          :node="node"
          :id="node.id"
          :node-id="node.id"
          :js-plumb-ins="jsPlumbIns"
        ></Node>
        <TargetNode :node="targetNode"></TargetNode>
      </PaperScroller>
    </div>
  </el-drawer>
</template>

<script>
import { mapGetters } from 'vuex'
import PaperScroller from '../PaperScroller'
import Node from './Node'
import TargetNode from './TargetNode'
import { config, jsPlumb } from '../../instance'

export default {
  name: 'MaterializedView',

  props: {
    visible: Boolean
  },

  components: { PaperScroller, TargetNode, Node },

  data() {
    return {
      nodes: [],
      jsPlumbIns: jsPlumb.getInstance(config)
    }
  },

  computed: {
    ...mapGetters('dataflow', [
      'allNodes',
      'allEdges',
      'activeType',
      'activeNode',
      'isActionActive',
      'nodeById',
      'stateIsDirty',
      'stateIsReadonly',
      'processorNodeTypes',
      'hasNodeError'
    ]),

    showPaper() {
      return this.visible && this.activeNode?.type === 'merge_table_processor'
    },

    targetNode() {
      const { $outputs } = this.activeNode

      if (!$outputs.length) return

      return this.nodeById($outputs[0])
    }
  },

  watch: {
    visible(val) {
      if (!val) return
      this.transformToDag()
    }
  },

  methods: {
    handleUpdateVisible(val) {
      this.$emit('update:visible', val)
    },

    transformToDag() {
      const { mergeProperties } = this.activeNode
      const nodes = []
      const edges = []
      const traverse = (children, target) => {
        for (const item of children) {
          nodes.push(this.nodeById(item.id))
          target && edges.push({ source: item.id, target })

          if (item.children?.length) {
            traverse(item.children, item.id)
          }
        }
      }

      traverse(mergeProperties, this.targetNode?.id)

      this.nodes = nodes
      console.log('transformToDag', nodes, edges)
    }
  }
}
</script>

<style scoped lang="scss">
.h-48 {
  height: 48px;
}
</style>
