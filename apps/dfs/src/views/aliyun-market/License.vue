<template>
  <section class="license-warp flex justify-content-center align-items-center flex-column">
    <main class="main">
      <header class="header">激活阿里云市场授权码</header>
      <ul class="step mt-4">
        <li>1. 打开阿里云市场</li>
        <li>2. 创建授权码并复制</li>
        <li>3. 粘贴到下方授权文本框并验证</li>
      </ul>
      <div class="mt-4 mb-2">授权码：</div>
      <el-input v-model="licenseCode" type="textarea" rows="6" autofocus></el-input>
      <el-button v-if="showGoDashboard" class="mt-4 float-end" type="primary" @click="goDashboard"
        >前往工作台</el-button
      >
      <el-button v-else class="mt-4 float-end" type="primary" @click="save">激活</el-button>
    </main>
  </section>
</template>

<script>
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
          this.$message.success('激活成功，30S后跳转到工作台')
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
