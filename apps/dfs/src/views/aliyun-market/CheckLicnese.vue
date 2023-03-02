<template>
  <el-dialog :visible.sync="visible" :close-on-click-modal="false" :show-close="false" width="550px">
    <section>
      <main v-if="user.licenseType === 'checkCode'">
        <header class="header flex">
          <VIcon class="color-warning mr-2" size="16">warning</VIcon>
          {{
            user.showNextProcessing
              ? $t('dfs_aliyun_market_checklicnese_nindeshouquanma3')
              : $t('dfs_aliyun_market_checklicnese_nindeshouquanma2')
          }}
        </header>
        <ul class="step mt-4">
          <li v-if="user.data[0]">
            <div class="mt-2">{{ $t('dfs_aliyun_market_checklicnese_nindeshouquanma') }}</div>
            <div class="mt-2 mb-2">{{ user.data[0].licenseCode }}</div>
            {{ $t('dfs_aliyun_market_checklicnese_youxiaoqizhi') }}
            <span class="ml-2 mr-2">{{ user.data[0].expiredTime }}</span>
            {{ $t('dfs_aliyun_market_checklicnese_qingdaoaliyun') }}
          </li>
        </ul>
      </main>
      <main v-else>
        <VIcon class="color-warning">warning</VIcon>
        <header class="header">{{ $t('dfs_aliyun_market_checklicnese_weijihuoshouquan') }}</header>
        <ul class="step mt-4">
          <li>{{ $t('dfs_aliyun_market_checklicnese_ninhaimeiyouji') }}</li>
        </ul>
      </main>
    </section>
    <span slot="footer">
      <div v-if="user.licenseType === 'checkCode'">
        <el-button class="mt-4" v-if="user.showNextProcessing" @click="$emit('update:visible', false)">{{
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
import { VIcon } from '@tap/component'

export default {
  name: 'CheckLicense',
  props: ['user', 'visible'],
  components: { VIcon },
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
  font-size: 14px;
  font-weight: 500;
  color: map-get($fontColor, dark);
}
.step li {
  color: map-get($fontColor, light);
  margin-bottom: 8px;
}
::v-deep {
  .el-dialog__header {
    padding: 0;
    padding-bottom: 0;
  }
}
</style>
