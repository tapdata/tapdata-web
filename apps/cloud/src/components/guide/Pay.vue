<template>
  <section class="flex flex-column justify-content-center align-items-center">
    <div class="fs-6 font-color-dark fw-sub mb-4 mt-4">
      {{ $t('dfs_instance_pay_wait_title') }}
    </div>
    <div class="dot-pulse mt-2 mb-6"></div>
    <div>{{ $t('dfs_instance_pay_wait_subtitle') }}</div>
    <div class="mt-4 mb-4">
      <el-button @click="$emit('refresh')">{{ $t('public_button_refresh') }}</el-button>
      <el-button type="primary" @click="goPay">{{ $t('dfs_instance_pay_wait_continue') }}</el-button>
    </div>
    <div class="box-card mt-4">
      <div class="mb-4">{{ $t('dfs_instance_pay_wait_step_title') }}</div>
      <el-steps :active="1" finish-status="success" class="w-75">
        <el-step :title="$t('dfs_instance_pay_wait_submit')"></el-step>
        <el-step :title="$t('dfs_instance_pay_wait')"></el-step>
      </el-steps>
    </div>
  </section>
</template>

<script>
export default {
  name: 'Pay',
  props: ['subscribes'],
  methods: {
    goPay() {
      window.open(this.subscribes?.payUrl, '_self')
    },
  },
  emits: ['refresh'],
}
</script>

<style lang="scss" scoped>
.box-card {
  display: flex;
  padding: 24px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 500px;
  border-radius: 4px;
  background: var(--color-blur-gary-light-9, #f4f5f7);
}
</style>
