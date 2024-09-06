<template>
  <ElDialog
    :visible.sync="visible"
    width="812px"
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :custom-class="customClass"
  >
    <div class="text-center font-color-dark">
      <VIcon size="64" class="color-success mt-3">check-circle-fill</VIcon>
      <div class="mt-4 fs-5 color-primary">恭喜您创建了第一个复制任务</div>
      <div class="mt-2">接下来可以使用我们的产品进行数据库的复制、迁移等工作啦。</div>
    </div>

    <template #footer>
      <div class="text-center">
        <el-button key="doneBtn" @click="handleDone" type="primary">进入首页</el-button>
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
      visible: this.value,
      continueUse: '',
      suggestion: ''
    }
  },

  computed: {
    userId() {
      return this.$store.state.user.id
    },
    noEmail() {
      return !this.$store.state.user.email
    },
    customClass() {
      if (this.finish) {
        return 'tour-dialog is-finish'
      }
      return 'tour-dialog'
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
    },

    handleDone() {
      this.$emit('finish')
      /*this.$emit('finish')

      const { expand } = this.$store.state.guide

      Object.assign(expand, { continueUse: this.continueUse, suggestion: this.suggestion })

      this.$axios.post('api/tcm/user_guide', {
        expand
      })*/

      this.$router.push('/')
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

  &.is-finish {
    background-image: url('../assets/image/teaching_completion_bg.png');
    background-repeat: no-repeat;
    background-size: cover;
  }
}
</style>
