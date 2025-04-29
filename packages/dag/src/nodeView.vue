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
        :key="n.id"
        :node-id="n.id"
        :id="NODE_PREFIX + n.id"
        :js-plumb-ins="jsPlumbIns"
      ></DFNode>
    </PaperScroller>
  </div>
</template>

<script>
import { config, jsPlumb } from './instance'
import PaperScroller from './components/PaperScroller'
import DFNode from './components/DFNode'
import { NODE_PREFIX } from './constants'
import editor from './mixins/editor'
import { allResourceIns } from './nodes/loader'

export default {
  name: 'NodeViewer',
  props: ['dag', 'id'],
  components: {
    PaperScroller,
    DFNode,
  },
  mixins: [editor],
  data() {
    return {
      NODE_PREFIX,
      loading: false,
      navLines: [],
      jsPlumbIns: jsPlumb.getInstance(config),
    }
  },
  mounted() {
    this.initNodeType()
    this.jsPlumbIns.ready(async () => {
      try {
        await this.openDataflow()
      } catch (error) {
        console.error(error) // eslint-disable-line
      }
    })
  },
  watch: {
    dag() {
      this.jsPlumbIns.reset()
      this.resetState()
      this.initNodeType()
      this.openDataflow()
    },
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
