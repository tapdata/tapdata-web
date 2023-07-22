<script>
export default {
  name: 'Pay',
  props: ['subscribes'],
  methods: {
    goPay() {
      window.open(this.subscribes?.payUrl, '_self')
    }
  }
}
</script>
<template>
  <section class="flex flex-column justify-content-center align-items-center">
    <div class="fs-6 font-color-dark fw-sub mb-4 mt-4">请尽快完成支付，如遇问题可 咨询客服</div>
    <div class="dot-pulse mt-2 mb-6"></div>
    <div>等待支付</div>
    <div class="mt-4 mb-4">
      <el-button size="mini" @click="$emit('refresh')">刷新</el-button>
      <el-button size="mini" type="primary" @click="goPay">继续支付</el-button>
    </div>
    <div class="box-card mt-4">
      <div>进度展示</div>
      <el-steps :active="1" finish-status="success" class="w-75">
        <el-step title="提交支付"></el-step>
        <el-step title="等待支付"></el-step>
      </el-steps>
    </div>
  </section>
</template>

<style scoped lang="scss">
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
