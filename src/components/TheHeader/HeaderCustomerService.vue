<template>
  <div class="customer-service-wrap" v-if="value">
    <header>
      <span> 用户支持 </span>
      <i class="btn-close el-icon-close" @click="close"></i>
    </header>
    <main class="block">
      <div class="panel">
        <div class="title">邮件支持</div>
        <div class="content">
          <span
            >在使用过程中，有任何问题，请发送邮件到 cloud@tapdata.io
            ，我们会尽快答复。</span
          >
        </div>
      </div>
      <div class="panel">
        <div class="title">微信用户群</div>
        <div class="content">
          <span>请扫描下方企业微信二维码, 联系我们进入微信用户群</span>
        </div>
      </div>
      <div class="panel">
        <img src="../../assets/image/LarkQR.jpeg" class="code" />
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'CustomerService',
  props: {
    value: Boolean
  },
  methods: {
    close() {
      this.$emit('input', false)
    }
  }
}
</script>
<style lang="scss" scoped>
.customer-service-wrap {
  position: fixed;
  bottom: 0;
  right: 0;
  z-index: 100;
  width: 360px;
  height: 540px;
  color: #333;
  font-size: 14px;
  background-color: #fff;
  header {
    position: relative;
    text-align: center;
    background: #f2f2f2;
    height: 50px;
    line-height: 50px;
    font-weight: bold;
    .btn-close {
      position: absolute;
      right: 15px;
      top: 50%;
      transform: translate(0, -50%);
      font-size: 16px;
      cursor: pointer;
    }
  }
  main {
    .panel {
      padding: 15px;
      .title {
        margin-bottom: 15px;
        font-weight: bold;
      }
      .content .btn {
        color: #1976d2;
        cursor: pointer;
      }
      .code {
        display: block;
        width: 200px;
        height: 200px;
        margin: 0 auto;
        object-fit: contain;
      }
    }
  }
}
</style>
