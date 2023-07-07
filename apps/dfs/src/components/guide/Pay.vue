<script>
export default {
  name: 'Pay'
}
</script>
<template>
  <section>
    <div>5、请尽快完成支付，如遇问题可 咨询客服</div>
    <VIcon>guide-loading</VIcon>
    <div>等待支付</div>
    <div>请尽快完成支付，对公转账后一天内, 我们将会为您开通服务</div>
    <el-button>刷新</el-button>
    <div></div>
    <span>进度展示</span>
    <el-steps :space="200" :active="1" finish-status="success">
      <el-step title="提交支付"></el-step>
      <el-step title="支付中"></el-step>
    </el-steps>
  </section>
</template>

<style scoped lang="scss"></style>
