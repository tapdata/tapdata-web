<template>
  <ElDialog :visible="visible" width="520px" @close="handleClose">
    <template #title>
      <div class="fs-6 fw-sub font-color-dark flex align-center">
        <VIcon class="mr-2" size="24">lock-circle</VIcon>
        <span>{{ $t('daas_feature_unavailable') }}</span>
      </div>
    </template>
    <div class="locked-dialog-content lh-base">
      <p class="mb-4">{{ $t('daas_feature_unavailable_subtitle') }}</p>
      <div class="upgrading-content p-3 border rounded-lg bg-subtle">
        <p class="mb-2">{{ $t('daas_feature_unavailable_upgrade_dec') }}</p>
        <ul class="font-color-dark">
          <li class="flex align-center">
            <VIcon class="mr-2 color-primary">check-bold</VIcon>{{ $t('daas_feature_unavailable_upgrade_dec_li1') }}
          </li>
          <li class="flex align-center">
            <VIcon class="mr-2 color-primary">check-bold</VIcon>{{ $t('daas_feature_unavailable_upgrade_dec_li2') }}
          </li>
          <li class="flex align-center">
            <VIcon class="mr-2 color-primary">check-bold</VIcon>{{ $t('daas_feature_unavailable_upgrade_dec_li3') }}
          </li>
          <li class="flex align-center">
            <VIcon class="mr-2 color-primary">check-bold</VIcon>{{ $t('daas_feature_unavailable_upgrade_dec_li4') }}
          </li>
          <li class="flex align-center">
            <VIcon class="mr-2 color-primary">check-bold</VIcon>{{ $t('daas_feature_unavailable_upgrade_dec_li5') }}
          </li>

          <li class="mt-2">
            <ElLink type="primary" href="https://tapdata.io/pricing" target="_blank">{{
              $t('daas_feature_unavailable_go_to_compare')
            }}</ElLink>
          </li>
        </ul>
      </div>
    </div>
    <template #footer>
      <div>
        <ElButton type="primary" @click="goOP">{{ $t('daas_feature_unavailable_get_enterprise') }}</ElButton>
        <ElButton type="primary" @click="goCloud">{{ $t('daas_feature_unavailable_get_cloud') }}</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script>
export default {
  name: 'LockedDialog',
  props: {
    visible: Boolean
  },
  methods: {
    handleClose() {
      this.$emit('update:visible', false)
    },
    goOP() {
      this.handleClose()
      window.open('https://tapdata.mike-x.com/xDQ0K')
    },
    goCloud() {
      this.handleClose()
      window.open('https://cloud.tapdata.io')
    }
  }
}
</script>

<style lang="scss">
.locked-dialog-content {
  li {
    //margin-left: 20px;
    //padding-left: 4px;
    //list-style-type: disc;
  }
}
</style>
