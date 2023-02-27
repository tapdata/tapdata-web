<template>
  <el-dialog :visible.sync="visible" :close-on-click-modal="false" :show-close="false">
    <section>
      <main v-if="type === 'checkCode'">
        <header class="header">
          {{ showNextProcessing ? '您的授权码即将到期，请尽快延长有效期' : '您的授权码已到期，请尽快延长有效期' }}
        </header>
        <ul class="step mt-4">
          <li v-if="current[0]">
            您的授权码 <span>{{ current[0].licenseCode }}</span> 有效期至
            <span>{{ current[0].expiredTime }}</span>
            请到阿里云市场延长授权码有效期
          </li>
        </ul>
      </main>
      <main v-else>
        <header class="header">未激活授权码</header>
        <ul class="step mt-4">
          <li>您还没有激活授权码，请到阿里云市场复制授权码并在授权码激活页面激活</li>
        </ul>
      </main>
    </section>
    <span slot="footer">
      <div v-if="type === 'checkCode'">
        <el-button class="mt-4" v-if="showNextProcessing" @click="visible = false">下一次延期处理</el-button>
        <el-button class="mt-4" type="primary" @click="goAliyun()">延长授权码有效期</el-button>
      </div>
      <div v-else>
        <el-button class="mt-4" type="primary" @click="goLicense()">激活授权码</el-button>
      </div>
    </span>
  </el-dialog>
</template>

<script>
import dayjs from 'dayjs'

export default {
  name: 'CheckLicense',
  props: ['user', 'visible'],
  data() {
    return {
      licenseCode: '',
      showNextProcessing: true,
      type: 'checkCode',
      current: []
    }
  },
  watch: {
    visible(v) {
      if (v) {
        var licenseCodes = this.user?.licenseCodes || []
        let verify = licenseCodes.filter(it => it.nearExpiration) //是否有临近过期的
        if (!this.user?.licenseValid && licenseCodes?.length > 0) {
          this.showNextProcessing = false //过期
          //找出已过期的
          this.current = licenseCodes.filter(it => it.licenseStatus === 'EXPIRED')
          this.current = this.current.map(item => {
            item.expiredTime = item.expiredTime ? dayjs(item.expiredTime).format('YYYY-MM-DD HH:mm:ss') : ''
            return item
          })
        } else if (verify.length > 0) {
          //找出临近过期的
          this.current = verify.map(item => {
            item.expiredTime = item.expiredTime ? dayjs(item.expiredTime).format('YYYY-MM-DD HH:mm:ss') : ''
            return item
          })
        }
        if (!this.user?.licenseValid && licenseCodes?.length === 0) {
          //未激活
          this.type = 'license'
        }
      }
    }
  },
  methods: {
    goAliyun() {
      window.open('https://market.console.aliyun.com/imageconsole/index.htm')
    },
    goLicense() {
      this.$router.push({
        name: 'aliyunMarketLicense'
      })
    }
  }
}
</script>

<style scoped lang="scss">
.license-warp {
  height: 230px;
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
