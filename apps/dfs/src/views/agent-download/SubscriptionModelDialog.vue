<template>
  <el-dialog
    :visible.sync="visible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="showClose"
    :top="'4vh'"
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
  height: 642px;
  .main {
    padding: 0;
  }
}
</style>
