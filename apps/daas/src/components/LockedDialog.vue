<script>
export default {
  name: 'LockedDialog',
  props: {
    visible: Boolean,
  },
  methods: {
    handleClose() {
      this.$emit('update:visible', false)
    },
    goOP() {
      this.handleClose()
      window.open('https://tapdata.mike-x.com/lV5o0?m=3VXe4lCHe9LjBsda')
    },
    goCloud() {
      this.handleClose()
      window.open('https://cloud.tapdata.io')
    },
  },
}
</script>

<template>
  <ElDialog
    :model-value="visible"
    width="640px"
    custom-class="pro-dialog"
    @close="handleClose"
  >
    <template #header>
      <div class="fs-6 fw-sub font-color-dark flex align-center">
        <VIcon class="mr-2" size="24">lock-circle</VIcon>
        <span>{{ $t('daas_feature_unavailable') }}</span>
      </div>
    </template>
    <div class="locked-dialog-content lh-base">
      <p class="mb-2">{{ $t('daas_feature_unavailable_subtitle') }}</p>
      <p class="mb-2">{{ $t('daas_feature_unavailable_upgrade_dec') }}</p>
      <div class="upgrading-content p-3 border rounded-lg bg-subtle">
        <ul class="font-color-dark flex flex-column gap-2">
          <li class="flex align-start">
            <VIcon class="mr-2 color-primary mt-1">check-bold</VIcon>
            <div>
              <div>{{ $t('daas_feature_unavailable_upgrade_dec_li1') }}</div>
              <div class="font-color-sslight fs-7.5 mt-1">
                {{ $t('daas_feature_unavailable_upgrade_dec_li1_desc') }}
              </div>
            </div>
          </li>
          <li class="flex align-start">
            <VIcon class="mr-2 color-primary mt-1">check-bold</VIcon>
            <div>
              <div>{{ $t('daas_feature_unavailable_upgrade_dec_li2') }}</div>
              <div class="font-color-sslight fs-7.5 mt-1">
                {{ $t('daas_feature_unavailable_upgrade_dec_li2_desc') }}
              </div>
            </div>
          </li>
          <li class="flex align-start">
            <VIcon class="mr-2 mt-1 color-primary">check-bold</VIcon>
            <div>
              <div>{{ $t('daas_feature_unavailable_upgrade_dec_li3') }}</div>
              <div class="font-color-sslight fs-7.5 mt-1">
                {{ $t('daas_feature_unavailable_upgrade_dec_li3_desc') }}
              </div>
            </div>
          </li>
          <li class="flex align-start">
            <VIcon class="mr-2 mt-1 color-primary">check-bold</VIcon>
            <div>
              <div>{{ $t('daas_feature_unavailable_upgrade_dec_li4') }}</div>
              <div class="font-color-sslight fs-7.5 mt-1">
                {{ $t('daas_feature_unavailable_upgrade_dec_li4_desc') }}
              </div>
            </div>
          </li>
          <li class="flex align-start">
            <VIcon class="mr-2 mt-1 color-primary">check-bold</VIcon>
            <div>
              <div>{{ $t('daas_feature_unavailable_upgrade_dec_li5') }}</div>
              <div class="font-color-sslight fs-7.5 mt-1">
                {{ $t('daas_feature_unavailable_upgrade_dec_li5_desc') }}
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <template #footer>
      <div class="flex align-center">
        <ElLink
          type="primary"
          href="https://tapdata.io/pricing"
          target="_blank"
        >
          <span class="align-middle">{{
            $t('daas_feature_unavailable_go_to_compare')
          }}</span>
          <VIcon class="ml-1 align-middle" size="16">open-in-new</VIcon></ElLink
        >
        <div class="flex-grow-1" />
        <ElButton type="primary" @click="goOP">{{
          $t('daas_feature_unavailable_get_enterprise')
        }}</ElButton>
        <ElButton type="warning" @click="goCloud">{{
          $t('daas_feature_unavailable_get_cloud')
        }}</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<style lang="scss">
.locked-dialog-content {
  li {
    //margin-left: 20px;
    //padding-left: 4px;
    //list-style-type: disc;
  }
}
</style>
