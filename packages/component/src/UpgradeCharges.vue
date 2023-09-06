<template>
  <section>
    <el-dialog
      title="订阅升级"
      :visible.sync="visible"
      :append-to-body="true"
      width="880px"
      custom-class="paid-upgrade-dialog"
      :before-close="handleClose"
    >
      <div v-if="tooltip" class="py-2 px-4 bg-warning-light flex align-items-center">
        <VIcon size="20" class="color-warning">info</VIcon>
        <span class="ml-2 color-warning">{{ tooltip }}</span>
      </div>

      <ul class="dialog__ul mt-6">
        <li v-for="(item, index) in list" :key="index" class="mb-6">
          <ElRow class="pl-2 py-2 bg-light border">
            <ElCol :span="6">当前规格</ElCol>
            <ElCol :span="6">可用任务数</ElCol>
            <ElCol :span="6">订阅方式</ElCol>
            <ElCol :span="6">操作</ElCol>
          </ElRow>

          <ElRow class="content__row pl-2 py-2 border">
            <ElCol :span="6"> {{ item.specLabel }} </ElCol>
            <ElCol :span="6"> {{ item.canUsedNum }}/{{ item.taskNum }} </ElCol>
            <ElCol :span="6"> {{ item.subscriptionMethodLabel }} </ElCol>
            <ElCol :span="6">
              <ElLink type="primary" :disabled="item.isMaximal" @click="openChangeSubscribe(item)">升级规格</ElLink>
            </ElCol>
          </ElRow>
        </li>
      </ul>

      <div slot="footer" class="dialog-footer">
        <ElButton type="primary" @click="submit" size="mini">订阅新引擎</ElButton>
      </div>
    </el-dialog>
    <!--变更-->
    <OrderChange ref="ChangeSubscribeDetailDialog"></OrderChange>
  </section>
</template>

<script>
import { VIcon } from '@tap/component'
import { getSpec, getPaymentMethod } from '@tap/business/src/shared/util'
import OrderChange from '@tap/business/src/views/order/Change'

export default {
  name: 'UpgradeDetollDialog',
  components: { VIcon, OrderChange },

  props: ['visible', 'tooltip', 'goPage'],

  data() {
    return {
      list: []
    }
  },

  watch: {
    visible(v) {
      if (v) {
        this.loadData()
      }
    }
  },

  methods: {
    loadData() {
      let filter = {
        where: {},
        size: 100,
        page: 1
        // sort: [this.order]
      }
      this.$axios.get('api/tcm/agent?filter=' + encodeURIComponent(JSON.stringify(filter))).then(async data => {
        this.list =
          data.items?.map(t => {
            const specLabel = getSpec(t.spec)
            const taskNum = (t.tags?.[0].split('limitScheduleTask:')[1] || 0) * 1
            const canUsedNum = taskNum - (t.metric?.runningTaskNum || 0)
            const isMaximal = t.spec.name === '8xlarge'
            const { subscribeDto = {}, license = {}, chargeProvider } = t.orderInfo || {}
            const { periodUnit, subscribeType, paymentMethod } = subscribeDto

            let subscriptionMethodLabel = '-'
            if (chargeProvider === 'FreeTier') {
              subscriptionMethodLabel = this.$t('dfs_instance_instance_mianfei')
            } else if (t.publicAgent) {
              subscriptionMethodLabel = this.$t('dfs_instance_instance_gongyongshili')
            } else if (['Stripe', 'Balance'].includes(chargeProvider)) {
              subscriptionMethodLabel =
                getPaymentMethod(
                  { periodUnit: periodUnit, type: subscribeType },
                  paymentMethod || 'Stripe',
                  chargeProvider
                ) || '-'
            }

            return Object.assign({}, t, {
              specLabel,
              taskNum,
              canUsedNum,
              subscriptionMethodLabel,
              isMaximal
            })
          }) || []
      })
    },

    handleClose() {
      this.$emit('update:visible', false)
    },

    //变更
    openChangeSubscribe(row) {
      this.handleClose()
      this.$refs?.ChangeSubscribeDetailDialog.openChange(row)
    },

    submit() {
      this.handleClose()
      if (this.goPage) {
        this.goPage()
        return
      }
      this.$router.push({
        name: 'createAgent'
      })
    }
  }
}
</script>

<style scoped lang="scss">
::v-deep {
  .el-dialog__body {
    padding: 0 20px 30px 20px;
  }
}

.dialog__ul {
  max-height: 400px;
  overflow-y: auto;
}

.content__row {
  margin-top: -1px;
}
</style>
