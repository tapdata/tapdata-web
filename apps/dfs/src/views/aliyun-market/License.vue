<template>
  <section class="license-warp flex justify-content-center align-items-center flex-column">
    <main class="main">
      <header class="header header-wrap pl-4">{{ $t('dfs_aliyun_market_license_jihuoaliyun') }}</header>
      <main style="padding: 24px">
        <div class="flex justify-content-center align-items-center">
          <img class="text-center" :src="getImg('aliyun-license-code')" />
        </div>
        <ul class="step mt-4">
          <li class="flex align-items-center">
            <span>{{ $t('dfs_aliyun_market_license_dianjidakai') }}</span>
            <a
              class="color-primary text-decoration-underline"
              href="https://market.aliyun.com/products/56024006/cmgj00061912.html?spm=5176.730005.result.4.519c3524QzKxHM&innerSource=search_tapdata#sku=yuncode5591200001"
              target="_blank"
              >{{ $t('dfs_aliyun_market_license_aliyunshichang') }}</a
            >
          </li>
          <li>{{ $t('dfs_aliyun_market_license_chuangjianshouquanma') }}</li>
          <li>{{ $t('dfs_aliyun_market_license_niantiedaoxiafang') }}</li>
        </ul>
        <div class="flex mt-4">
          <span class="label mb-2">{{ $t('dfs_aliyun_market_license_shouquanma') }}</span>
          <el-input v-model="licenseCode" type="textarea" rows="2" autofocus></el-input>
        </div>
        <div class="mt-8 pt-4 text-end">
          <el-button class="mr-4" @click="$router.go(-1)">{{ $t('public_button_back') }}</el-button>
          <a v-if="showGoDashboard" type="primary" href="./">{{
            $t('dfs_aliyun_market_license_qianwanggongzuotai')
          }}</a>
          <el-button v-else :loading="saveLoading" type="primary" @click="save">{{
            $t('dfs_aliyun_market_license_jihuo')
          }}</el-button>
        </div>
      </main>
    </main>
  </section>
</template>

<script>
import i18n from '@/i18n'

export default {
  name: 'License',
  data() {
    return {
      licenseCode: '',
      showGoDashboard: false,
      saveLoading: false
    }
  },
  mounted() {
    //标记用户为云市场渠道来源
    this.$axios.get('api/tcm/aliyun/market/license')
  },
  methods: {
    save() {
      this.saveLoading = true
      this.$axios
        .post('api/tcm/aliyun/market/license/activate', { licenseCode: this.licenseCode })
        .then(data => {
          if (data.licenseStatus === 'ACTIVATED') {
            this.$message.success(i18n.t('dfs_aliyun_market_license_jihuochenggongS'))
            this.showGoDashboard = true
            this.$axios.get('api/tcm/user').then(data => {
              window.__USER_INFO__ = data
            })
            setTimeout(() => {
              window.location.href = 'index.html'
            }, 30000)
          }
        })
        .finally(() => {
          this.saveLoading = false
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
