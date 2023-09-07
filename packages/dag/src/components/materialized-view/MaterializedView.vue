<template>
  <el-drawer :visible="visible" size="calc(100% - 260px)" :with-header="false" @update:visible="handleUpdateVisible">
    <div class="h-100 flex flex-column">
      <header class="px-4 h-48 flex align-center">
        <div class="fs-6 font-color-dark">构建物化视图</div>
      </header>
      <PaperScroller v-if="showPaper" class="flex-1" ref="paperScroller">
        <TargetNode :node="targetNode"></TargetNode>
      </PaperScroller>
    </div>
  </el-drawer>
</template>

<script>
import { mapGetters } from 'vuex'
import PaperScroller from '../PaperScroller'
import TargetNode from './TargetNode'

export default {
  name: 'MaterializedView',

  props: {
    visible: Boolean
  },

  components: { PaperScroller, TargetNode },

  data() {
    return {
      drawerVisible: false
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

  methods: {
    handleUpdateVisible(val) {
      this.$emit('update:visible', val)

      console.log(this.allNodes)
    }
  }
}
</script>

<style scoped lang="scss">
.h-48 {
  height: 48px;
}
</style>
