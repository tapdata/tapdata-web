<template>
  <section class="license-warp flex justify-content-center align-items-center flex-column">
    <TheHeader ref="theHeader" class="layout-header"></TheHeader>
    <main class="main">
      <header class="header header-wrap pl-4">{{ $t('dfs_aliyun_market_license_jihuoaliyun') }}</header>
      <main style="padding: 24px">
        <div class="flex justify-content-center align-items-center">
          <img class="text-center" :src="getImg('aliyun-license-code')" />
        </div>
        <ul class="step mt-4">
          <li>{{ $t('dfs_aliyun_market_license_dakaialiyun') }}</li>
          <li>{{ $t('dfs_aliyun_market_license_chuangjianshouquanma') }}</li>
          <li>{{ $t('dfs_aliyun_market_license_niantiedaoxiafang') }}</li>
        </ul>
        <div class="flex mt-4">
          <span class="label mb-2">{{ $t('dfs_aliyun_market_license_shouquanma') }}</span>
          <el-input v-model="licenseCode" type="textarea" rows="1" autofocus></el-input>
        </div>
        <div class="mt-8">
          <a v-if="showGoDashboard" class="mt-4 float-end button" type="primary" href="index.html">{{
            $t('dfs_aliyun_market_license_qianwanggongzuotai')
          }}</a>
          <el-button v-else class="mt-4 float-end" type="primary" @click="save">{{
            $t('dfs_aliyun_market_license_jihuo')
          }}</el-button>
        </div>
      </main>
    </main>
  </section>
</template>

<script>
import i18n from '@/i18n'
import TheHeader from '@/components/the-header'

export default {
  name: 'License',
  components: { TheHeader },
  data() {
    return {
      licenseCode: '',
      showGoDashboard: false
    }
  },
  mounted() {
    //标记用户为云市场渠道来源
    this.$axios.get('api/tcm/aliyun/market/license')
  },
  methods: {
    save() {
      this.$axios.post('api/tcm/aliyun/market/license/activate', { licenseCode: this.licenseCode }).then(data => {
        if (data.licenseStatus === 'ACTIVATED') {
          this.$message.success(i18n.t('dfs_aliyun_market_license_jihuochenggongS'))
          this.showGoDashboard = true
          this.$axios.get('api/tcm/user').then(data => {
            window.__USER_INFO__ = data
          })
          setTimeout(() => {
            this.goDashboard()
          }, 30000)
        }
      })
    },
    getImg(name) {
      return require(`../../../public/images/dashboard/${name}.svg`)
    }
  }
}
</script>

<style scoped lang="scss">
.license-warp {
  height: 100%;
}
.header {
  font-weight: 500;
  font-size: 18px;
  color: map-get($color, white);
}
.main {
  width: 686px;
  height: 673px;
  background: map-get($color, white);
  box-shadow: 0px 4px 4px rgba(198, 198, 198, 0.25);
  border-radius: 8px;
}
.header-wrap {
  width: 686px;
  height: 57px;
  line-height: 57px;
  background: map-get($color, primary);
  border-bottom: 1px solid #f2f2f2;
  border-radius: 8px 8px 0px 0px;
}
.label {
  width: 70px;
}
.step li {
  color: map-get($fontColor, light);
  margin-bottom: 8px;
}
.button {
  color: map-get($color, white);
  background: map-get($color, primary);
  display: inline-block;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  border: 1px solid rgba(221, 221, 221, 0.4);
  border-color: #f2f3f5;
  -webkit-appearance: none;
  text-align: center;
  box-sizing: border-box;
  outline: none;
  margin: 0;
  transition: 0.1s;
  font-weight: 400;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  padding: 12px 20px;
  font-size: 14px;
  border-radius: 4px;
}
</style>
