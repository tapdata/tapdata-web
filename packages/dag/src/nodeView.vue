<script>
import DFNode from './components/DFNode'
import PaperScroller from './components/PaperScroller'
import { NODE_PREFIX } from './constants'
import { config, jsPlumb } from './instance'
import editor from './mixins/editor'
import { allResourceIns } from './nodes/loader'

export default {
  name: 'NodeViewer',
  components: {
    PaperScroller,
    DFNode,
  },
  mixins: [editor],
  props: ['dag', 'id'],
  data() {
    return {
      NODE_PREFIX,
      loading: false,
      navLines: [],
      jsPlumbIns: jsPlumb.getInstance(config),
    }
  },
  watch: {
    dag() {
      this.jsPlumbIns.reset()
      this.resetState()
      this.initNodeType()
      this.openDataflow()
    },
  },
  mounted() {
    this.initNodeType()
    this.jsPlumbIns.ready(async () => {
      try {
        await this.openDataflow()
      } catch (error) {
        console.error(error)
      }
    })
  },
  methods: {
    async openDataflow() {
      const data = this.dag
      if (data) {
        const { edges } = data
        this.setTaskId(data.id)
        this.setEdges(edges)
        await this.$nextTick()
        await this.addNodes(data)
        await this.$nextTick()
        this.$refs.paperScroller.initVisibleArea()
        this.$refs.paperScroller.autoResizePaper()
        this.handleCenterContent()
      }
    },
    initNodeType() {
      this.addResourceIns(allResourceIns)
    },
  },
}
</script>

<template>
  <div style="height: 270px">
    <PaperScroller
      ref="paperScroller"
      :nav-lines="navLines"
      @add-node="handleAddNodeToPos"
      @mouse-select="handleMouseSelect"
      @change-scale="handleChangeScale"
    >
      <DFNode
        v-for="n in allNodes"
        :id="NODE_PREFIX + n.id"
        :key="n.id"
        :node-id="n.id"
        :js-plumb-ins="jsPlumbIns"
      />
    </PaperScroller>
  </div>
</template>
