<template>
  <ElDialog :visible="visible" width="520px" @close="handleClose">
    <template #title>
      <div class="fs-6 fw-sub font-color-dark flex align-center">
        <VIcon class="mr-2" size="24">lock-circle</VIcon>
        <span>功能暂不可用</span>
      </div>
    </template>
    <div class="locked-dialog-content">
      <p class="mb-4">抱歉，当前版本暂不支持该功能，您可申请升级到企业版本或者直接注册云版使用该功能。</p>
      <p class="mb-2">升级版本，您将获得：</p>
      <ul>
        <li>数据校验（仅企业版）</li>
        <li>共享挖掘</li>
        <li>告警设置</li>
        <li>权限管理（仅企业版）</li>
        <li>更多数据源</li>
      </ul>
    </div>
    <template #footer>
      <div>
        <ElButton type="primary" @click="goOP">申请企业版</ElButton>
        <ElButton type="primary" @click="goCloud">免费使用云版</ElButton>
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
    margin-left: 20px;
    padding-left: 4px;
    list-style-type: disc;
  }
}
</style>
