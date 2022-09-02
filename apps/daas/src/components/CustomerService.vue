<template>
  <el-card class="customer-service-wrap" v-if="value">
    <!-- 客服 -->
    <header>
      <span>{{ $t('app_qa') }}</span>
      <i class="btn-close el-icon-close" @click="close"></i>
    </header>
    <main>
      <div class="panel">
        <div class="title">
          {{ $t('app_customerService_technicalSupport') }}
        </div>
        <div class="content">
          <span>{{ $t('app_customerService_technicalSupportText') }}</span>
          {{ $t('app_customerService_userSupport') }}
          <span>{{ $t('app_customerService_technicalSupportText1') }}</span>
        </div>
      </div>
      <div class="panel">
        <div class="title">{{ $t('app_customerService_otherDmands') }}</div>
        <div class="content">
          <span>{{ $t('app_customerService_otherDmandsText') }}</span>
        </div>
      </div>
      <div class="panel">
        <img src="../assets/images/tapdateQR.png" class="code" />
      </div>
    </main>
  </el-card>
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
<style>
.customer-service-wrap .el-card__body {
  padding: 0;
}
</style>
<style lang="scss" scoped>
.customer-service-wrap {
  position: fixed;
  bottom: 0;
  right: 0;
  z-index: 100;
  width: 360px;
  height: 540px;
  color: map-get($fontColor, dark);
  font-size: 14px;
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
        color: map-get($color, primary);
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
