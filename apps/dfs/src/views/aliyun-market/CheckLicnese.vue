<template>
  <el-dialog :visible.sync="visible" :close-on-click-modal="false" :show-close="false">
    <section>
      <main v-if="user.licenseType === 'checkCode'">
        <header class="header">
          {{
            user.showNextProcessing
              ? $t('dfs_aliyun_market_checklicnese_nindeshouquanma3')
              : $t('dfs_aliyun_market_checklicnese_nindeshouquanma2')
          }}
        </header>
        <ul class="step mt-4">
          <li v-if="user.data[0]">
            {{ $t('dfs_aliyun_market_checklicnese_nindeshouquanma')
            }}<span class="error">{{ user.data[0].licenseCode }}</span
            >{{ $t('dfs_aliyun_market_checklicnese_youxiaoqizhi')
            }}<span class="ml-2 mr-2">{{ user.data[0].expiredTime }}</span
            >{{ $t('dfs_aliyun_market_checklicnese_qingdaoaliyun') }}
          </li>
        </ul>
      </main>
      <main v-else>
        <header class="header">{{ $t('dfs_aliyun_market_checklicnese_weijihuoshouquan') }}</header>
        <ul class="step mt-4">
          <li>{{ $t('dfs_aliyun_market_checklicnese_ninhaimeiyouji') }}</li>
        </ul>
      </main>
    </section>
    <span slot="footer">
      <div v-if="user.licenseType === 'checkCode'">
        <el-button class="mt-4" v-if="user.showNextProcessing" @click="visible = false">{{
          $t('dfs_aliyun_market_checklicnese_xiayiciyanqi')
        }}</el-button>
        <el-button class="mt-4" type="primary" @click="goAliyun()">{{
          $t('dfs_aliyun_market_checklicnese_yanchangshouquanma')
        }}</el-button>
      </div>
      <div v-else>
        <el-button class="mt-4" type="primary" @click="goLicense()">{{
          $t('dfs_aliyun_market_checklicnese_jihuoshouquanma')
        }}</el-button>
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
      current: []
    }
  },
  watch: {
    visible(v) {
      if (v) {
        this.user.data = this.user?.data.map(item => {
          item.expiredTime = item.expiredTime ? dayjs(item.expiredTime).format('YYYY-MM-DD HH:mm:ss') : ''
          return item
        })
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
.error {
  color: map-get($color, warning);
}
.main {
  width: 800px;
}
.step li {
  color: map-get($fontColor, light);
  margin-bottom: 8px;
}
</style>
