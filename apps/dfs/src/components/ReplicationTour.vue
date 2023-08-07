<template>
  <ElDialog
    :visible.sync="visible"
    width="812px"
    :show-close="false"
    :close-on-click-modal="false"
    custom-class="tour-dialog"
  >
    <template v-if="!finish">
      <div class="text-center title-cover" slot="title">
        <ElImage :src="require('@/assets/image/tour-cover.png')"></ElImage>
      </div>

      <div class="lh-base font-color-dark text-center mt-n4">
        <h1 class="fs-5 fw-sub font-color-dark mb-2">Welcome to Tapdata Cloud.</h1>
        <p class="lh-base">在开始数据复制任务之前，您需要创建源数据库和目标数据库连接。</p>
        <p>我们将引导您完成：</p>
        <ul class="flex align-center justify-center fw-sub my-2">
          <li>创建源数据库连接</li>
          <ElDivider direction="vertical"></ElDivider>
          <li>创建目标数据库连接</li>
          <ElDivider direction="vertical"></ElDivider>
          <li>配置数据复制任务</li>
        </ul>
        <p>现在让我们开始创建您的连接并设置数据复制任务。</p>
      </div>

      <div slot="footer" class="text-center">
        <el-button @click="$emit('start')" type="primary">Start</el-button>
      </div>
    </template>

    <template v-else>
      <div class="text-center title-cover" slot="title">🎉</div>

      <div class="lh-base font-color-dark text-center mt-n4">
        <h1 class="fs-5 fw-sub font-color-dark mb-2">恭喜您已经完成复制任务的引导</h1>
      </div>

      <div slot="footer" class="text-center">
        <el-button @click="$emit('finish')" type="primary">完成</el-button>
      </div>
    </template>
  </ElDialog>
</template>

<script>
import i18n from '@/i18n'

import { driver } from 'driver.js'

export default {
  name: 'ReplicationTour',
  props: {
    value: Boolean,
    finish: Boolean
  },

  data() {
    return {
      visible: this.value
    }
  },

  computed: {
    userId() {
      return this.$store.state.user.id
    },
    noEmail() {
      return !this.$store.state.user.email
    },
    startingGuide() {
      return this.$store.state.startingGuide
    }
  },

  watch: {
    visible(v) {
      this.$emit('input', v)
    },

    value(v) {
      this.visible = v
    }
  },

  methods: {
    cancel() {
      localStorage[`completeAlarm-${this.userId}`] = Date.now()
      this.visible = false
    },
    gotoSettings() {
      const name = 'SystemNotice'
      this.visible = false
      localStorage[`completeAlarm-${this.userId}`] = Date.now()
      this.$router.push({ name }).then(() => {
        let driverObj = driver()
        const destroy = () => {
          driverObj?.destroy()
          driverObj = null
        }
        driverObj.highlight({
          element: '#alarm-settings',
          onHighlightStarted: (element, step, options) => {
            element.addEventListener('click', destroy)
          },
          onDeselected: (element, step, options) => {
            element.removeEventListener('click', destroy)
          },
          popover: {
            description: i18n.t('dfs_components_taskalarmtour_dianjicichushe')
          }
        })

        const unwatch = this.$watch('$route', () => {
          destroy()
          unwatch()
        })
      })
    },

    gotoBindEmail() {
      this.visible = false
      this.$router.push({
        name: 'userCenter',
        query: {
          bind: 'email'
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.title-cover {
  font-size: 104px;
}
</style>

<style lang="scss">
.tour-dialog {
  overflow: hidden;
  .el-dialog__header {
    padding: 0;
  }
}
</style>
