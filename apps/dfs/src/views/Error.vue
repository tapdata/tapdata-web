<template>
  <section class="error-page-wrap" :class="[{ 'error-page-purchase': $route.meta.isPurchase }]">
    <TheHeader></TheHeader>
    <div class="header">{{ 'Tapdata Cloud' }}</div>
    <div class="body">
      <div v-if="$route.path === '/500'" class="box">
        <img class="img" src="../assets/image/500.png" />
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
.error-page-purchase {
  padding: 0;
}
.error-page-wrap {
  padding-top: 68px;
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
