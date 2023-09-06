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
.paid-upgrade-dialog {
  .paid-upgrade-desc {
    font-weight: 400;
    font-size: 14px;
    color: map-get($fontColor, light);
  }
  .paid-upgrade-ul li {
    width: 420px;
    border-radius: 8px;
  }
  .paid-upgrade-left {
    border: 1px solid map-get($borderColor, sslight);
    &.disabled {
      cursor: not-allowed;
    }
  }
  .paid-upgrade-right {
    &:hover {
      //box-shadow: 0 1px 4px rgba(0, 0, 0, 0.09);
    }
  }
  .paid-upgrade-right-border {
    border-top-right-radius: 8px;
    border-top-left-radius: 8px;
  }
  .current {
    font-weight: 400;
    font-size: 10px;
    line-height: 14px;
    color: map-get($color, lprimary);
    border: 1px solid map-get($color, disprimary);
    border-radius: 2px;
    padding: 2px;
  }
  .version {
    font-weight: 600;
    font-size: 16px;
    //line-height: 21px;
    max-width: 252px;
    color: map-get($fontColor, dark);
  }
  .link {
    border-bottom: 1px solid map-get($borderColor, light);
  }
  .free {
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    color: gray;
  }
  .pay {
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    color: #ff7d00;
  }
  .desc {
    font-weight: 400;
    font-size: 14px;
    line-height: 17px;
    max-width: 300px;
    color: map-get($color, light);
  }
  .desc_professional {
    font-weight: 400;
    font-size: 16px;
    line-height: 17px;
    max-width: 300px;
    color: #5684ff;
  }

  .discount {
    color: #ff7d00;
    background: rgba(255, 125, 0, 0.1);
    border-radius: 4px;
    padding: 1px 5px;
    margin-left: 10px;
    //position: fixed;
  }
  .bg {
    background: url('../../assets/images/subscription_img_zyb.png');
    background-repeat: no-repeat;
    background-position: right;
    background-position-y: top;
  }
  .paid-upgrade-height {
    height: 38px;
    margin-top: 30px;
  }
  .paid-upgrade-cn-height {
    height: 38px;
    margin-top: 30px;
  }
  .paid-upgrade-l-height {
    height: 38px;
    margin-top: 30px;
  }
  .content {
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    color: map-get($color, normal);
  }
  .paid-upgrade-mb16 {
    margin-bottom: 16px;
  }
  .paid-upgrade-mt32 {
    margin-top: 32px;
  }
  .paid-upgrade-mb45 {
    margin-bottom: 45px;
  }
  .text {
    font-size: 12px;
  }
  .left-bold {
    -moz-transform: rotate(-180deg);
    -webkit-transform: rotate(-180deg);
  }
  .currentList {
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    color: map-get($color, dark);
  }
  .footer {
    height: 40px;
    background: #f5f7fa;
    border-bottom-right-radius: 8px;
    border-bottom-left-radius: 8px;
  }
  .footer-right {
    height: 40px;
    background: map-get($color, primary);
    color: map-get($color, white);
    border-bottom-right-radius: 8px;
    border-bottom-left-radius: 8px;
    &:hover {
      background: #5684ff;
      border-color: #5684ff;
      color: #ffffff;
    }
  }
}
.copilot-pricing-card-container:hover .copilot-pricing-card-bg-glow {
  opacity: 1;
  transform: scale(1.28);
  transition-duration: 0.3s;
}

.copilot-pricing-card-container .copilot-pricing-card-bg-glow {
  opacity: 1;
  transform: scale(1);
  transition-duration: 0.5s;
}

.copilot-pricing-card-bg-glow {
  opacity: 0.4;
  transform: scale(1.2);
}
.d-block {
  display: block !important;
}
.height-full {
  height: 100% !important;
}
.width-full {
  width: 100% !important;
}
.left-0 {
  left: 0 !important;
}
.top-0 {
  top: 0 !important;
}
.position-absolute {
  position: absolute !important;
}
.copilot-pricing-card-glow-border1 {
  padding: 1.5px;
  z-index: 2;
  border-radius: 8px;
  background: -webkit-linear-gradient(135deg, #a3e4d7, #a77bf3);
  background: linear-gradient(135deg, #a3e4d7, #a77bf3);
}
::v-deep {
  .el-dialog__body {
    padding: 0 20px 30px 20px;
  }
}

//.item__title {
//  background-color: #ebeef5;
//}

.dialog__ul {
  max-height: 400px;
  overflow-y: auto;
}

.content__row {
  margin-top: -1px;
}
</style>
