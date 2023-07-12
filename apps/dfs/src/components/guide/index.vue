<template>
  <ElDialog
    class="guide-dialog"
    :visible.sync="visible"
    width="1000px"
    :top="'5vh'"
    :show-close="false"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :before-close="close"
  >
    <div class="guide-wrap flex justify-content-center">
      <div class="nav-wrap px-6 py-6">
        <div class="guide-header font-color-dark fw-bold fs-5 mb-4 mt-4">欢迎使用Tapdata Cloud 服务</div>
        <div class="guide-desc font-color-dark">
          Tapdata Cloud 专业的数据集成与服务平台, 在开始使用之前, 我们需要完成以下使用引导。
        </div>
        <el-steps class="guide-steps bg-transparent mx-auto" :active="activeStep" direction="vertical">
          <el-step v-for="(step, i) in steps" :key="i" :title="step.title">
            <span slot="icon">{{ i + 1 }}</span>
          </el-step>
        </el-steps>
      </div>
      <div class="guide-main flex-1 flex flex-column overflow-hidden ml-8 mt-4 mr-8">
        <div class="main flex-1">
          <template v-if="[1].includes(activeStep)">
            <!--绑定手机号-->
            <Account v-if="bindPhoneVisible" ref="bindPhone" @next="next"></Account>
          </template>
          <template
            v-if="([2].includes(activeStep) && bindPhoneVisible) || ([1].includes(activeStep) && !bindPhoneVisible)"
          >
            <!--使用场景-->
            <Scenes ref="scenes" :scenes="scenes" @handleScenes="handleScenes"></Scenes>
          </template>
          <template
            v-if="([3].includes(activeStep) && bindPhoneVisible) || ([2].includes(activeStep) && !bindPhoneVisible)"
          >
            <!--部署方式-->
            <DeploymentMethod
              ref="deploymentMethod"
              :platform="platform"
              @changePlatform="changePlatform"
            ></DeploymentMethod>
          </template>
          <template
            v-if="([4].includes(activeStep) && bindPhoneVisible) || ([3].includes(activeStep) && !bindPhoneVisible)"
          >
            <!--选择实例规格-->
            <Spec ref="spec" :platform="platform" @changePlatform="changePlatform"></Spec>
          </template>
          <template
            v-if="([5].includes(activeStep) && bindPhoneVisible) || ([4].includes(activeStep) && !bindPhoneVisible)"
          >
            <!--费用清单-->
            <pay v-if="subscribeStatus === 'incomplete'" refs="pay" :subscribes="subscribes" @refresh="refresh"></pay>
            <Details v-else ref="details" :orderInfo="orderInfo"></Details>
          </template>
          <template
            v-if="([6].includes(activeStep) && bindPhoneVisible) || ([5].includes(activeStep) && !bindPhoneVisible)"
          >
            <!--部署实例-->
            <Deploy :agentId="agentId"></Deploy>
          </template>
        </div>
        <div
          v-if="subscribeStatus !== 'incomplete'"
          class="guide-footer flex mb-5"
          :class="[activeStep === 1 ? 'justify-content-end' : 'justify-content-between']"
        >
          <VButton v-if="activeStep > 1" @click="previous()">{{ $t('public_button_previous') }}</VButton>
          <VButton
            type="primary"
            @click="submitConfirm()"
            v-if="this.activeStep === this.steps.length"
            :loading="submitLoading"
            >{{ $t('public_button_next') }}</VButton
          >
          <VButton type="primary" @click="submitConfirm()" v-else>{{ $t('public_button_next') }}</VButton>
        </div>
      </div>
    </div>
  </ElDialog>
</template>
<script>
import Account from './Account.vue'
import DeploymentMethod from './DeploymentMethod.vue'
import Scenes from './Scenes.vue'
import Spec from './Spec.vue'
import Deploy from './Deploy.vue'
import Details from './Details.vue'
import Pay from './Pay.vue'

export default {
  name: 'guide',
  props: ['visible', 'agent', 'subscribes', 'step'],
  components: {
    Account,
    Scenes,
    DeploymentMethod,
    Spec,
    Deploy,
    Details,
    Pay
  },
  data() {
    return {
      activeStep: this.step ? this.step : 1,
      scenes: ['Real-time synchronization of cross-cloud data'], //使用场景
      platform: 'selfHost',
      agentId: '64aa97004be8ea3b8e02e39a',
      orderId: '',
      orderInfo: '',
      bindPhoneVisible: false,
      submitLoading: false,
      subscribeId: '',
      subscribeStatus: ''
    }
  },
  mounted() {
    //初始化第一步
    this.close()
  },
  watch: {
    step(val) {
      this.activeStep = val
    },
    agent(val) {
      this.agentId = val
    },
    subscribes(val) {
      this.subscribeId = val?.id
      this.subscribeStatus = val?.status
    }
  },
  computed: {
    steps() {
      if (!this.bindPhoneVisible && this.platform === 'selfHost') {
        return [
          {
            title: '选择使用场景'
          },
          {
            title: '数据库环境'
          },
          {
            title: '选择计算引擎'
          },
          {
            title: '支付结算'
          },
          {
            title: '计算引擎部署'
          }
        ]
      }

      if (!this.bindPhoneVisible && this.platform === 'fullManagement') {
        return [
          {
            title: '选择使用场景'
          },
          {
            title: '数据库环境'
          },
          {
            title: '选择计算引擎'
          },
          {
            title: '支付结算'
          }
        ]
      }

      return [
        {
          title: '账号安全绑定'
        },
        {
          title: '选择使用场景'
        },
        {
          title: '数据库环境'
        },
        {
          title: '选择计算引擎'
        }
      ]
    }
  },
  beforeDestroy() {
    this.close()
  },
  methods: {
    close() {
      let params = {
        installStep: this.activeStep,
        demand: this.scenes,
        selectAgentType: this.platform,
        subscribe: this.subscribe,
        agentId: this.agentId
      }
      this.$axios.patch('api/tcm/user', { params })
    },
    next() {
      this.activeStep++
      this.close()
    },
    previous() {
      this.activeStep--
    },
    //确认提交
    submitConfirm() {
      if (
        (this.activeStep === this.steps?.length && this.platform === 'fullManagement') ||
        (this.activeStep === this.steps?.length - 1 && this.platform === 'selfHost')
      ) {
        //最后一步提交支付
        this.submitOrder()
        return
      }
      this.next()
      switch (this.activeStep) {
        case 1:
          this.bindPhoneConfirm()
          break
        case 2:
        case 3:
          break
        case 4:
          if (!this.bindPhoneVisible) {
            this.getOrderInfo()
          }
          break
      }
    },
    //绑定手机号
    bindPhoneConfirm() {
      this.$refs?.bindPhone?.bindPhoneConfirm()
    },
    //选择使用场景
    handleScenes(val) {
      this.scenes = val
    },
    changePlatform(val) {
      this.platform = val
    },
    //检查是否有手机号
    checkWechatPhone() {
      let user = window.__USER_INFO__
      if (window.__config__?.disabledBindingPhone) {
        //海外版不强制绑定手机号
        return
      }
      this.bindPhoneVisible =
        ['basic:email', 'basic:email-code', 'social:wechatmp-qrcode'].includes(user?.registerSource) && !user?.telephone
      return this.bindPhoneVisible
    },
    getOrderInfo() {
      this.orderInfo = this.$refs?.spec?.submit()
    },
    //刷新支付状态
    refresh() {
      let filter = {
        where: {
          id: this.subscribes?.id
        }
      }
      this.$axios.get(`api/tcm/subscribe?filter=${encodeURIComponent(JSON.stringify(filter))}`).then(data => {
        let item = data.items || []
        this.subscribeStatus = item?.[0]?.status
        if (this.subscribeStatus === 'active' && item?.[0]?.platform === 'selfHost') {
          //部署页面
          this.activeStep = 5
        } else if (this.subscribeStatus === 'active' && item?.[0]?.platform === 'fullManagement') {
          this.$emit('update:visible', false)
        }
      })
    },
    submitOrder() {
      this.orderInfo.email = this.$refs.details?.getEmail()
      this.$axios
        .post('api/tcm/orders/subscribeV2', this.orderInfo)
        .then(data => {
          this.subscribe = data?.subscribe
          this.agentId = data?.agentId
          this.close()
          if (data.status === 'incomplete') {
            //订单需要付款
            //在线支付 打开付款页面
            window.open(data?.payUrl, '_self')
          } else {
            //订单不需要付款，只需对应跳转不同页面
            this.$router.push({
              name: 'Instance'
            })
          }
        })
        .catch(() => {
          this.submitLoading = false
        })
    }
  }
}
</script>

<style scoped lang="scss">
.nav-wrap {
  width: 348px;
  height: 716px;
  gap: 20px;
  flex-shrink: 0;
  background: linear-gradient(146deg, rgba(44, 116, 255, 0.07) 0%, rgba(44, 101, 255, 0.01) 100%);
}
.guide-steps {
  height: 200px;
}
.guide-main {
  height: 716px;
}
.guide-desc {
  margin-bottom: 60px;
}
.guide-footer {
  height: 30px;
}
.guide-dialog {
  ::v-deep {
    .el-dialog__body,
    .el-dialog__header {
      padding: 0;
    }
  }
}
</style>
