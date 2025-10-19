<script>
import CreateAgent from '../instance/CreateAgent.vue'

export default {
  name: 'SubscriptionModelDialog',
  components: { CreateAgent },
  inject: ['buried'],
  props: {
    visible: {
      type: Boolean,
    },
    showClose: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['update:visible'],
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="showClose"
    top="4vh"
    :title="$t('dfs_agent_download_subscriptionmodeldialog_peizhishishishu')"
    width="1200px"
    class="tap-dialog"
    @input="$emit('update:visible', $event)"
  >
    <CreateAgent
      class="subscriptionModelDialog"
      type="newDialog"
      @close-visible="$emit('update:visible', false)"
    />
  </el-dialog>
</template>

<style lang="scss">
.subscriptionModelDialog {
  height: 642px;
  .main {
    padding: 0;
  }
}
</style>
