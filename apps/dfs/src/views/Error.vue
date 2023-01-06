<template>
  <section class="error-page-wrap">
    <TheHeader></TheHeader>
    <div class="body">
      <!-- 其他错误都按照服务器错误 -->
      <div v-if="$route.path === '/error'" class="box">
        <img class="img" src="../assets/image/error.png" />
        <p class="text">{{ $route.query.message || $t('views_Error_fuWuQiNeiBu') }}</p>
        <ElButton class="mt-5" type="primary" @click="toHome()">{{ $t('views_Error_fanHuiShouYe') }}</ElButton>
      </div>
      <div v-if="$route.path === '/invalid'" class="box">
        <img class="img" src="../assets/image/invalid.png" />
        <p class="text">{{ $t('views_Error_zhangHuZanWuQuan') }}</p>
        <ElButton class="mt-5" type="primary" @click="toHome()">{{ $t('views_Error_fanHuiShouYe') }}</ElButton>
      </div>
      <div v-if="$route.path === '/freeze'" class="box">
        <img class="img" src="../assets/image/freeze.png" />
        <p class="label">{{ $t('views_Error_zhangHuYiBeiDong') }}</p>
        <p class="text">{{ $t('views_Error_ninDeZhangHuYi') }}</p>
        <ElButton class="mt-5" type="primary" @click="toHome()">{{ $t('views_Error_fanHuiShouYe') }}</ElButton>
      </div>
      <div v-if="$route.path === '/off'" class="box">
        <img class="img" src="../assets/image/off_shelf.png" />
        <p class="label">{{ $t('views_Error_chanPinYiXiaJia') }}</p>
        <p class="text">{{ $t('views_Error_feiChangBaoQianChan') }}</p>
        <ElButton class="mt-5" type="primary" @click="toHome()">{{ $t('views_Error_fanHuiShouYe') }}</ElButton>
      </div>
      <div v-if="$route.path === '/404'" class="box img-wrap position-relative">
        <img class="img" src="../assets/image/404.png" />
        <div class="position-absolute p-content text-start">
          <p class="p-text">OOPS!</p>
          <p class="label">找不到页面</p>
          <ElButton class="mt-5" type="primary" @click="toHome()">{{ $t('views_Error_fanHuiShouYe') }}</ElButton>
        </div>
      </div>
      <div v-if="$route.path === '/500'" class="box img-wrap position-relative">
        <img class="img" src="../assets/image/500.png" />
        <div class="position-absolute p-content text-start">
          <p class="p-text">OOPS!</p>
          <p class="label">Internal Server Error</p>
          <p class="label">服务器遇到一个妨碍它为请求提供服务的错误。</p>
          <ElButton class="mt-5" type="primary" @click="toHome()">{{ $t('views_Error_fanHuiShouYe') }}</ElButton>
        </div>
      </div>
      <div v-if="$route.path === '/502'" class="box img-wrap position-relative">
        <img class="img" src="../assets/image/502.png" />
        <div class="position-absolute p-content text-start">
          <p class="p-text">OOPS!</p>
          <p class="label">Bad Gateway</p>
          <p class="label">作为代理或网关使用的服务器从请求响应链的下一条链路上收到了一条伪响应。</p>
          <ElButton class="mt-5" type="primary" @click="toHome()">{{ $t('views_Error_fanHuiShouYe') }}</ElButton>
        </div>
      </div>
      <div v-if="$route.path === '/504'" class="box img-wrap position-relative">
        <img class="img" src="../assets/image/504.png" />
        <div class="position-absolute p-content text-start">
          <p class="p-text">OOPS!</p>
          <p class="label">Gateway Timeout</p>
          <ElButton class="mt-5" type="primary" @click="toHome()">{{ $t('views_Error_fanHuiShouYe') }}</ElButton>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import TheHeader from '@/components/the-header'

export default {
  components: {
    TheHeader
  },
  methods: {
    toHome() {
      let baseUrl = process.env.BASE_URL || ''
      location.href = baseUrl
    }
  }
}
</script>

<style lang="scss" scoped>
.error-page-wrap {
  padding-top: 52px;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 600px;
  min-width: 800px;
  overflow: auto;
  .header {
    padding: 0 20px;
    line-height: 60px;
    background: #fff;
    font-size: 14px;
    font-weight: 700;
  }
  .body {
    flex: 1;
    position: relative;
    margin: 20px;
    border-radius: 2px;
    background: #fff;
    overflow: hidden;
    .box {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
    }
    .img {
      margin: 0 auto;
      display: block;
      width: 400px;
      height: 171px;
      object-fit: contain;
    }
    .img-wrap {
      .img {
        margin: 0 auto;
        display: block;
        width: 400px;
        height: 400px;
        object-fit: contain;
      }
    }
    .p-text {
      font-style: normal;
      font-weight: 400;
      font-size: 30px;
      line-height: 36px;
      color: #1d2129;
    }
    .p-content {
      top: 10%;
      left: 52%;
    }
    .label {
      margin-top: 12px;
      font-size: 18px;
      color: #333;
    }
    .text {
      margin-top: 10px;
      font-size: 14px;
      color: map-get($fontColor, light);
    }
  }
}
</style>
