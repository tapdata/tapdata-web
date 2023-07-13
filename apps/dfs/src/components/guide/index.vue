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
        <div class="guide-header font-color-dark fw-bold fs-5 mb-4 mt-4">欢迎使用 Tapdata Cloud 数据服务</div>
        <div class="guide-desc font-color-dark">
          Tapdata Cloud 是专业的数据集成与服务平台, 为了让您更流畅地使用产品, 请跟随我们的引导, 开始一步步操作吧
        </div>
        <el-steps
          class="guide-steps bg-transparent mx-auto"
          :active="activeStep"
          style="height: 300px"
          direction="vertical"
        >
          <el-step v-for="(step, i) in steps" :key="i" :title="step.title">
            <span slot="icon">{{ i + 1 }}</span>
          </el-step>
        </el-steps>
      </div>
      <div class="guide-main flex-1 flex flex-column overflow-hidden ml-8 mt-4 mr-8">
        <div class="main flex-1">
          <section v-if="bindPhoneVisible">
            <template v-if="[1].includes(activeStep)">
              <!--绑定手机号-->
              <Account ref="bindPhone" @next="next"></Account>
            </template>
            <template v-if="[2].includes(activeStep)">
              <!--使用场景-->
              <Scenes ref="scenes" :scenes="scenes" @handleScenes="handleScenes"></Scenes>
            </template>
            <template v-if="[3].includes(activeStep)">
              <!--部署方式-->
              <DeploymentMethod
                ref="deploymentMethod"
                :platform="platform"
                @changePlatform="changePlatform"
              ></DeploymentMethod>
            </template>
            <template v-if="[4].includes(activeStep)">
              <!--选择实例规格-->
              <Spec ref="spec" :platform="platform" @changePlatform="changePlatform"></Spec>
            </template>
            <template v-if="[5].includes(activeStep)">
              <!--费用清单-->
              <pay v-if="subscribeStatus === 'incomplete'" refs="pay" :subscribes="subscribes" @refresh="refresh"></pay>
              <Details v-else ref="details" :orderInfo="orderInfo" :email="email"></Details>
            </template>
            <template v-if="[6].includes(activeStep)">
              <!--部署实例-->
              <Deploy :agentId="agentId"></Deploy>
            </template>
          </section>
          <section v-else>
            <template v-if="[1].includes(activeStep)">
              <!--使用场景-->
              <Scenes ref="scenes" :scenes="scenes" @handleScenes="handleScenes"></Scenes>
            </template>
            <template v-if="[2].includes(activeStep)">
              <!--部署方式-->
              <DeploymentMethod
                ref="deploymentMethod"
                :platform="platform"
                @changePlatform="changePlatform"
              ></DeploymentMethod>
            </template>
            <template v-if="[3].includes(activeStep)">
              <!--选择实例规格-->
              <Spec ref="spec" :platform="platform" @changePlatform="changePlatform"></Spec>
            </template>
            <template v-if="[4].includes(activeStep)">
              <!--费用清单-->
              <pay v-if="subscribeStatus === 'incomplete'" refs="pay" :subscribes="subscribes" @refresh="refresh"></pay>
              <Details v-else ref="details" :orderInfo="orderInfo" :email="email"></Details>
            </template>
            <template v-if="[5].includes(activeStep)">
              <!--部署实例-->
              <Deploy :agentId="agentId"></Deploy>
            </template>
          </section>
        </div>
        <div
          v-if="subscribeStatus !== 'incomplete' && !isUnDepaly"
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
          <!--绑定手机号单独一个提交按钮 -->
          <VButton
            type="primary"
            auto-loading
            @click="submitConfirm(arguments[0])"
            v-else-if="this.activeStep === 1 && bindPhoneVisible"
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
  props: ['visible', 'agent', 'subscribes', 'step', 'isUnDepaly'],
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
      scenes: [], //使用场景
      platform: 'selfHost',
      agentId: '64aa97004be8ea3b8e02e39a',
      orderId: '',
      orderInfo: '',
      bindPhoneVisible: false,
      submitLoading: false,
      subscribeId: '',
      subscribeStatus: '',
      email: ''
    }
  },
  mounted() {
    //初始化第一步
    this.email = window.__USER_INFO__.email
    this.checkWechatPhone()
    this.close()
  },
  watch: {
    step(val) {
      this.activeStep = val
    },
    agent(val) {
      this.agentId = val?.id
      this.isUnDepaly = val?.isUnDepaly
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
            title: '确定使用场景'
          },
          {
            title: '设置数据库网络环境'
          },
          {
            title: '选择计算引擎规格'
          },
          {
            title: '支付'
          },
          {
            title: '部署计算引擎'
          }
        ]
      }

      if (!this.bindPhoneVisible && this.platform === 'fullManagement') {
        return [
          {
            title: '确定使用场景'
          },
          {
            title: '设置数据库网络环境'
          },
          {
            title: '选择计算引擎规格'
          },
          {
            title: '支付'
          }
        ]
      }

      return [
        {
          title: '账号安全绑定'
        },
        {
          title: '确定使用场景'
        },
        {
          title: '设置数据库网络环境'
        },
        {
          title: '选择计算引擎规格'
        },
        {
          title: '支付'
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
    submitConfirm(res) {
      if (
        (this.activeStep === this.steps?.length && (this.platform === 'fullManagement' || this.bindPhoneVisible)) ||
        (this.activeStep === this.steps?.length - 1 && this.platform === 'selfHost' && !this.bindPhoneVisible)
      ) {
        //最后一步提交支付
        this.submitOrder()
        return
      }
      if (this.bindPhoneVisible && this.activeStep === 1) {
        this.bindPhoneConfirm(res)
        return
      }
      this.next()
      switch (this.activeStep) {
        case 1:
        case 2:
        case 3:
          break
        case 4:
          if (!this.bindPhoneVisible) {
            this.getOrderInfo()
          }
          break
        case 5:
          if (this.bindPhoneVisible) {
            this.getOrderInfo()
          }
          break
      }
    },
    //绑定手机号
    bindPhoneConfirm(res) {
      this.$refs?.bindPhone?.bindPhoneConfirm(res)
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
          if (this.bindPhoneVisible) {
            this.activeStep = 6
          } else {
            this.activeStep = 5
          }
        } else if (this.subscribeStatus === 'active' && item?.[0]?.platform === 'fullManagement') {
          this.$emit('update:visible', false)
        }
      })
    },
    submitOrder() {
      this.orderInfo.email = this.email
      this.$axios
        .post('api/tcm/orders/subscribeV2', this.orderInfo)
        .then(data => {
          this.subscribe = data?.subscribe
          this.close()
          if (data.status === 'incomplete') {
            //订单需要付款
            //在线支付 打开付款页面
            window.open(data?.payUrl, '_self')
          } else {
            //免费半托管 - 新人引导 - 弹窗
            if (this.platform === 'selfHost') {
              this.agentId = data?.subscribeItems?.[0].resourceId
              this.next()
            } else {
              //订单不需要付款，只需对应跳转不同页面
              this.$emit('update:visible', false)
              this.$router.push({
                name: 'Instance'
              })
            }
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
