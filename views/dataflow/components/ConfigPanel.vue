<template>
  <!--监控模式下，常驻显示-->
  <section
    v-if="isMonitor || activeType"
    v-resize.top="{
      minHeight: 300,
      maxHeight: 800
    }"
    class="config-panel border-top"
  >
    <slot>
      <FormPanel v-on="$listeners"></FormPanel>
    </slot>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import '@/directives/resize/index.scss'
import resize from '@/directives/resize'
import FormPanel from '@/views/dataflow/components/FormPanel'

export default {
  name: 'ConfigPanel',

  directives: {
    resize
  },

  props: {
    isMonitor: Boolean
  },

  components: { FormPanel },

  computed: {
    ...mapGetters('dataflow', ['activeType'])
  }
}
</script>

<style lang="scss">
.databaseLinkDialog {
  .e-row {
    padding: 0 50px;
  }
  .text {
    padding: 0 50px;
    color: #666;
  }
}
</style>
<style scoped lang="scss">
.config-panel {
  position: relative;
  z-index: 10;
  height: 300px;
  overflow: auto;
  transition: height 0.24s;
  will-change: height;
}
</style>
