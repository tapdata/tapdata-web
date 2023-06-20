<template>
  <el-dialog
    :visible.sync="visible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="showClose"
    :title="$t('dfs_agent_download_subscriptionmodeldialog_peizhishishishu')"
    width="1200px"
    custom-class="tap-dialog"
  >
    <CreateAgent
      class="subscriptionModelDialog"
      type="newDialog"
      @closeVisible="$emit('update:visible', false)"
    ></CreateAgent>
  </el-dialog>
</template>

<script>
import CreateAgent from '../instance/CreateAgent.vue'

export default {
  name: 'subscriptionModelDialog',
  computed: {
    dialog() {
      return dialog
    }
  },
  inject: ['buried'],
  components: { CreateAgent },
  props: {
    visible: {
      type: Boolean
    },
    showClose: {
      type: Boolean,
      default: true
    }
  }
}
</script>

<style lang="scss">
.subscriptionModelDialog {
  height: 695px;
  .main {
    padding: 0;
  }
}
</style>
