<template>
  <div style="height: 300px">
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
import i18n from '@tap/i18n'
import { taskApi } from '@tap/api'
import PaperScroller from './components/PaperScroller'
import DFNode from './components/DFNode'
import { NODE_PREFIX } from './constants'
import editor from './mixins/editor'
import { allResourceIns } from './nodes/loader'

export default {
  name: 'NodeViewer',
  components: {
    PaperScroller,
    DFNode
  },
  mixins: [editor],
  data() {
    return {
      NODE_PREFIX,
      loading: false,
      navLines: [],
      jsPlumbIns: jsPlumb.getInstance(config)
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
  methods: {
    async loadDataflow() {
      this.loading = true
      try {
        return await taskApi.get('632acdcff9f531293779058c')
      } catch (e) {
        console.log(i18n.t('packages_dag_mixins_editor_renwujiazaichu'), e) // eslint-disable-line
      } finally {
        this.loading = false
      }
    },
    async openDataflow() {
      const data = await this.loadDataflow()

      if (data) {
        const { dag } = data
        this.setTaskId(data.id)
        this.setEdges(dag.edges)
        await this.$nextTick()
        await this.addNodes(dag)
        await this.$nextTick()
        this.$refs.paperScroller.initVisibleArea()
        this.$refs.paperScroller.autoResizePaper()
        this.handleCenterContent()
      }
    },
    initNodeType() {
      this.addResourceIns(allResourceIns)
    }
  }
}
</script>

<style scoped></style>
