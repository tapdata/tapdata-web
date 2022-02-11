<template>
  <!--监控模式下，常驻显示-->
  <aside
    v-if="isMonitor || activeType"
    v-resize.left="{
      minWidth: 500,
      maxWidth: 800
    }"
    class="layout-sidebar --right border-start"
  >
    <slot>
      <FormPanel v-on="$listeners"></FormPanel>
    </slot>
  </aside>
</template>

<script>
import { mapGetters } from 'vuex'
import '@/directives/resize/index.scss'
import resize from '@/directives/resize'
import FormPanel from '@/views/dataflow/components/FormPanel'

export default {
  name: 'RightSidebar',

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
