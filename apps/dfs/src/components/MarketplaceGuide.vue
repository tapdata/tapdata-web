<template>
  <ElDialog
    :visible="visible"
    width="812px"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    custom-class="marketplace-guide-dialog"
  >
    <div class="rounded-xl p-6" style="border: 1px #fff solid">
      <div class="font-color-dark fw-sub mb-4 fs-5">
        {{ $t('dfs_marketplace_guide_title') }}
      </div>
      <el-steps :space="56" :active="0" direction="vertical" process-status="finish">
        <el-step :title="$t('dfs_marketplace_guide_step_1')"></el-step>
        <el-step :title="$t('dfs_marketplace_guide_step_2')"></el-step>
        <el-step :title="$t('dfs_marketplace_guide_step_3')"></el-step>
      </el-steps>
    </div>

    <template #footer>
      <el-button @click="handleClose">{{ $t('dfs_marketplace_guide_cancel') }}</el-button>
      <el-button :loading="loading" @click="handleRefresh" type="primary"
        >{{ $t('dfs_marketplace_guide_ok') }}
      </el-button>
    </template>
  </ElDialog>
</template>

<script>
export default {
  name: 'MarketplaceGuide',
  props: {
    visible: Boolean,
    loading: Boolean,
  },
  methods: {
    handleClose() {
      this.$emit('update:visible', false)
    },

    async handleRefresh() {
      this.$emit('refresh')
    },
  },
}
</script>

<style lang="scss" scoped></style>

<style lang="scss">
.marketplace-guide-dialog {
  overflow: hidden;
  background-image: url('../assets/image/teaching_completion_bg.png');
  background-repeat: no-repeat;
  background-size: cover;

  .el-dialog__header {
    padding: 0;
  }
}
</style>
