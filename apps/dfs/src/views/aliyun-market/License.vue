<template>
  <section class="license-warp flex justify-content-center align-items-center flex-column">
    <main class="main">
      <header class="header">{{ $t('dfs_aliyun_market_license_jihuoaliyun') }}</header>
      <ul class="step mt-4">
        <li>{{ $t('dfs_aliyun_market_license_dakaialiyun') }}</li>
        <li>{{ $t('dfs_aliyun_market_license_chuangjianshouquanma') }}</li>
        <li>{{ $t('dfs_aliyun_market_license_niantiedaoxiafang') }}</li>
      </ul>
      <div class="mt-4 mb-2">{{ $t('dfs_aliyun_market_license_shouquanma') }}</div>
      <el-input v-model="licenseCode" type="textarea" rows="6" autofocus></el-input>
      <el-button v-if="showGoDashboard" class="mt-4 float-end" type="primary" @click="goDashboard">{{
        $t('dfs_aliyun_market_license_qianwanggongzuotai')
      }}</el-button>
      <el-button v-else class="mt-4 float-end" type="primary" @click="save">{{
        $t('dfs_aliyun_market_license_jihuo')
      }}</el-button>
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
    goDashboard() {
      this.$router.push({
        name: 'Home'
      })
    }
  }
}
</script>

<style scoped lang="scss">
.license-warp {
  height: 730px;
}
.header {
  font-size: 34px;
  font-weight: 500;
  color: map-get($fontColor, dark);
}
.main {
  width: 800px;
}
.step li {
  color: map-get($fontColor, light);
  margin-bottom: 8px;
}
</style>
