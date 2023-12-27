<template>
  <div>
    <div
      v-show="showGuideIcon"
      v-loading="guideLoading"
      element-loading-background="rgba(255, 255, 255, 0.4)"
      id="user-guide-icon"
      class="user-guide-icon clickable"
    >
      <ElImage @click.native="handleOpenGuide" :src="iconSrc"></ElImage>
    </div>
    <ElDialog
      ref="dialogWrapper"
      class="guide-dialog"
      :visible="visible"
      :top="'10vh'"
      width="1000px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :before-close="beforeClose"
      @update:visible="handleVisible"
    >
      <div class="guide-wrap flex justify-content-center">
        <div class="nav-wrap p-10">
          <div class="guide-header font-color-dark fw-bold fs-5 mb-4 mt-4">
            {{ $t('dfs_guide_index_huanyingshiyongT') }}
          </div>
          <div class="guide-desc font-color-dark mb-10">
            {{ $t('dfs_guide_index_tapda') }}
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
          <StepGroups :active="activeKey" class="main flex-1 overflow-hidden">
            <StepItem name="Account">
              <!--绑定手机号-->
              <Account ref="bindPhone" @next="next"></Account>
            </StepItem>
            <StepItem name="Scenes">
              <!--使用场景-->
              <Scenes ref="scenes" :scenes="scenes" @handleScenes="handleScenes"></Scenes>
            </StepItem>
            <StepItem name="DeploymentMethod">
              <!--部署方式-->
              <DeploymentMethod
                ref="deploymentMethod"
                :platform="platform"
                @changePlatform="changePlatform"
              ></DeploymentMethod>
            </StepItem>
            <StepItem name="Spec">
              <!--选择实例规格-->
              <Spec ref="spec" :platform="platform" @changeSpec="changeSpec"></Spec>
            </StepItem>
            <StepItem name="Deploy">
              <!--部署实例-->
              <Deploy :agentId="agentId" @behavior="handleBehavior"></Deploy>
            </StepItem>
            <StepItem name="Pay">
              <!--费用清单-->
              <pay v-if="subscribeStatus === 'incomplete'" refs="pay" :subscribes="subscribes" @refresh="refresh"></pay>
              <Details v-else ref="details" :orderInfo="orderInfo" :email="email"></Details>
            </StepItem>
          </StepGroups>
          <div
            v-if="subscribeStatus !== 'incomplete' && !isUnDeploy"
            class="guide-footer flex my-5"
            :class="[activeStep === 1 ? 'justify-content-end' : 'justify-content-between']"
          >
            <ElButton size="default" v-if="activeStep > 1" @click="previous()"
              >{{ $t('public_button_previous') }}
            </ElButton>
            <ElButton
              size="default"
              type="primary"
              @click="submitConfirm()"
              v-if="this.activeStep === this.steps.length"
              :loading="submitLoading"
              >{{ $t('public_button_next') }}
            </ElButton>

            <!--绑定手机号单独一个提交按钮 -->
            <VButton
              size="default"
              type="primary"
              auto-loading
              @click="submitConfirm(arguments[0])"
              v-else-if="this.activeStep === 1 && bindPhoneVisible"
              >{{ $t('public_button_next') }}
            </VButton>
            <ElButton
              size="default"
              type="primary"
              :disabled="activeKey === 'Scenes' && !scenes.length"
              @click="submitConfirm()"
              v-else
              >{{ $t('public_button_next') }}
            </ElButton>
          </div>
          <div v-else-if="isUnDeploy" class="guide-footer flex my-5 justify-content-between">
            <ElButton :loading="unsubscribeIng" size="default" @click="handleUnsubscribe"
              >{{ $t('public_button_previous') }}
            </ElButton>
          </div>
        </div>
      </div>
    </ElDialog>
  </div>
</template>
<script>
import i18n from '@/i18n'

import Account from './Account.vue'
import DeploymentMethod from './DeploymentMethod.vue'
import Scenes from './Scenes.vue'
import Spec from './Spec.vue'
import Deploy from './Deploy.vue'
import Details from './Details.vue'
import Pay from './Pay.vue'
import user_guide_cn from '@/assets/image/user_guide_cn.png'
import user_guide_en from '@/assets/image/user_guide_en.png'
import { mapGetters, mapMutations } from 'vuex'

export default {
  name: 'guide',
  props: ['visible', 'agent', 'subscribes', 'step', 'isUnDeploy', 'guideLoading'],
  components: {
    Account,
    Scenes,
    DeploymentMethod,
    Spec,
    Deploy,
    Details,
    Pay,
    StepGroups: {
      props: {
        active: String
      },
      render() {
        return <div>{this.$slots.default}</div>
      }
    },
    StepItem: {
      props: {
        name: String
      },
      render() {
        return this.$parent.active === this.name && this.$slots.default
      }
    }
  },
  inject: ['buried'],
  data() {
    return {
      ok: true,
      timer: null,
      activeStep: this.step ? this.step : 1,
      scenes: [], //使用场景
      platform: 'fullManagement',
      agentId: '',
      orderId: '',
      orderInfo: '',
      bindPhoneVisible: false,
      submitLoading: false,
      subscribeId: '',
      subscribeStatus: '',
      email: '',
      steps: [],
      agentStatus: '',
      //是否有支付页面
      isPay: false,
      behavior: [],
      behaviorAt: null,
      unsubscribeIng: false
    }
  },
  mounted() {
    //初始化第一步
    this.checkWechatPhone()
  },
  computed: {
    ...mapGetters(['startingGuide', 'pausedGuide', 'completedTour']),
    userId() {
      return this.$store.state.user.id
    },

    activeKey() {
      return this.steps[this.activeStep - 1]?.key
    },

    iconSrc() {
      return this.$store.getters.isDomesticStation ? user_guide_cn : user_guide_en
    },

    showGuideIcon() {
      return this.pausedGuide && !this.completedTour
    }
  },
  watch: {
    visible(v) {
      if (v) {
        if (this.pausedGuide) {
          const icon = document.getElementById('user-guide-icon')
          const iconRect = icon.$el.getBoundingClientRect()
          const iconX = iconRect.x + iconRect.width / 2
          const iconY = iconRect.y + iconRect.height / 2
          const dialog = this.$refs.dialogWrapper.$refs.dialog
          const computedStyle = window.getComputedStyle(dialog)
          const windowWidth = document.documentElement.clientWidth
          let width = computedStyle.width
          if (width.endsWith('px')) {
            width = parseInt(width)
          } else if (width.endsWith('%')) {
            width = (parseInt(width) / 100) * windowWidth
          }
          const transformOriginX = iconX - (windowWidth - width) / 2
          const transformOriginY = iconY - parseInt(computedStyle.marginTop)
          dialog.style.transformOrigin = `${transformOriginX}px ${transformOriginY}px`
        }

        this.initGuide()
      }
    },
    step(val) {
      this.activeStep = val
      this.getSteps()
    },
    agent(val) {
      this.agentId = val?.id
      this.checkAgentStatus()
    },
    subscribes(val) {
      this.subscribeId = val?.id
      this.subscribeStatus = val?.status
    }
    // isUnDeploy(val) {
    //   if (val) {
    //     this.initGuide()
    //   }
    // }
  },
  beforeDestroy() {
    // this.postGuide()
    clearTimeout(this.timer)
  },
  methods: {
    ...mapMutations(['setExpand', 'pauseGuide', 'startGuide']),

    beforeClose(done) {
      if (this.bindPhoneVisible && this.activeStep === 1) {
        this.$message.info(this.$t('dfs_components_taskalarmtour_account_zhuanghao'))
        return
      }
      done()
      this.pauseGuide()
      this.$axios.post('api/tcm/user_guide', {
        expand: this.$store.state.guide.expand
      })
      // this.postGuide()
    },
    postGuide() {
      let params = {
        installStep: this.activeStep,
        demand: this.scenes,
        selectAgentType: this.platform,
        agentId: this.agentId,
        steps: this.steps,
        subscribeId: this.subscribeId,
        spec: JSON.stringify(this.orderInfo),
        behavior: JSON.stringify(this.behavior),
        behaviorAt: this.behaviorAt,
        tour: this.$store.state.replicationTour
      }
      return this.$axios.post('api/tcm/user_guide', params)
    },
    next() {
      this.activeStep++
      this.postGuide()
    },
    previous() {
      let step = this.steps[this.activeStep - 1]
      //去掉支付
      if (step.key === 'Spec') {
        let index = this.steps.findIndex(it => it.key === 'Pay')
        if (index > -1) {
          this.steps.splice(index, 1)
        }
      }
      this.activeStep--
    },
    //步骤控制
    getSteps() {
      if (!this.bindPhoneVisible) {
        this.steps = [
          {
            key: 'Scenes',
            title: i18n.t('dfs_guide_index_quedingshiyongchang')
          },
          {
            key: 'DeploymentMethod',
            title: i18n.t('dfs_guide_index_shezhishujuku')
          },
          {
            key: 'Spec',
            title: i18n.t('dfs_guide_index_xuanzejisuanyin')
          }
        ]
      } else {
        this.steps = [
          {
            key: 'Account',
            title: i18n.t('dfs_guide_index_zhanghaoanquanbang')
          },
          {
            key: 'Scenes',
            title: i18n.t('dfs_guide_index_quedingshiyongchang')
          },
          {
            key: 'DeploymentMethod',
            title: i18n.t('dfs_guide_index_shezhishujuku')
          },
          {
            key: 'Spec',
            title: i18n.t('dfs_guide_index_xuanzejisuanyin')
          }
        ]
      }
    },
    //检查Agent状态
    checkAgentStatus() {
      if (this.agentId) {
        this.$axios.get('api/tcm/agent').then(data => {
          let items = data?.items || []
          this.agentStatus = items.find(i => i.id === this.agentId)?.status
          if (this.agentStatus !== 'Running') {
            clearTimeout(this.timer)
            this.timer = setTimeout(() => {
              this.checkAgentStatus()
            }, 10000)
          } else {
            clearTimeout(this.timer)
            this.$emit('update:visible', false)
            this.$router.push({
              name: 'migrate'
            })
          }
        })
      }
    },
    //确认提交
    submitConfirm(res) {
      let step = this.steps[this.activeStep - 1]
      let isPay = this.steps.find(it => it.key === 'Pay')
      if (step.key === 'Spec') {
        this.getOrderInfo()
        //没有支付页-直接付款
        if (!isPay) {
          this.submitOrder()
          return
        }
      } else if (step.key === 'Pay') {
        //当前是支付页面-提交支付
        this.submitOrder()
        return
      }
      if (this.bindPhoneVisible && this.activeStep === 1) {
        this.bindPhoneConfirm(res)
        return
      }
      if (step.key === 'Scenes' && (!this.scenes || this.scenes?.length === 0)) {
        this.$message.error(i18n.t('dfs_guide_index_qingxuanzeninxiang'))
        return
      }
      this.next()
    },
    //绑定手机号
    bindPhoneConfirm(res) {
      this.$refs?.bindPhone?.bindPhoneConfirm(res)
    },
    //选择使用场景
    handleScenes(val) {
      console.log('handleScenes', val) // eslint-disable-line
      this.scenes = val
    },
    changePlatform(val) {
      this.platform = val
      let index = this.steps.findIndex(it => it.key === 'Deploy')
      if (val === 'selfHost' && index === -1) {
        this.steps.push({
          key: 'Deploy',
          title: i18n.t('dfs_guide_index_bushujisuanyin')
        })
      } else if (val !== 'selfHost') {
        //移除
        if (index > -1) {
          this.steps.splice(index, 1)
        }
      }
    },
    //切换实例
    changeSpec(item) {
      let index = this.steps.findIndex(it => it.key === 'Pay')
      let len = this.steps?.length - 1
      this.isDepaly = false
      if (item?.price !== 0) {
        const payStep = {
          key: 'Pay',
          title: i18n.t('public_payment')
        }
        if (this.platform !== 'selfHost' && index === -1) {
          this.steps.push(payStep)
        } else if (this.platform === 'selfHost' && index === -1) {
          this.steps.splice(len, 0, payStep)
        }
      } else {
        //移除
        if (index > -1) {
          this.steps.splice(index, 1)
        }
        this.isDepaly = true
      }
    },
    //检查是否有手机号
    checkWechatPhone() {
      let user = window.__USER_INFO__
      if (window.__config__?.disabledBindingPhone) {
        //海外版不强制绑定手机号
        this.bindPhoneVisible = false
      } else {
        this.bindPhoneVisible =
          ['basic:email', 'basic:email-code', 'social:wechatmp-qrcode'].includes(user?.registerSource) &&
          !user?.telephone
      }
      // this.initGuide()
      if (this.steps?.length === 0) {
        this.getSteps()
      }
      return this.bindPhoneVisible
    },
    getOrderInfo() {
      this.orderInfo = this.$refs?.spec?.submit()
    },
    //获取存储部署
    initGuide() {
      this.$store.commit('setReplicationTour', {
        enable: true,
        activeIndex: null,
        behavior: '',
        status: '',
        view: 'board'
      })
      const { guide } = this.$store.state
      // this.getSteps()
      if (guide.steps?.length) {
        this.steps = guide.steps

        this.platform = guide.selectAgentType
        this.subscribeId = guide.subscribeId
        this.activeStep = guide.installStep
        this.scenes = guide.demand || []
        this.agentId = guide.agentId
        try {
          this.behavior = guide.behavior ? JSON.parse(guide.behavior) : []
          this.behaviorAt = guide.behaviorAt
        } catch (e) {
          this.behavior = []
        }

        const step = guide.steps[guide.installStep - 1]

        if (step) {
          let { key } = step
          if (key === 'Pay' && !guide.subscribeId) {
            // 走到支付，但是没有提交订阅
            guide.installStep = --this.activeStep
            this.postGuide()
          } else if (this.isUnDeploy && key !== 'Deploy') {
            guide.installStep = this.activeStep = guide.steps.findIndex(step => step.key === 'Deploy') + 1
            this.postGuide()
          }
        }
      }
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
      this.$axios
        .post('api/tcm/orders/subscribeV2', this.orderInfo)
        .then(data => {
          this.agentId = data?.subscribeItems?.[0].resourceId
          this.subscribe = data?.subscribe
          this.subscribeId = data?.subscribe
          if (data.status === 'incomplete') {
            //订单需要付款
            //在线支付 打开付款页面
            this.postGuide()
            window.open(data?.payUrl, '_self')
          } else {
            //免费半托管 - 新人引导部署页面
            if (this.platform === 'selfHost') {
              this.$emit('changeIsUnDeploy', true)
              this.next()
              this.$nextTick(() => {
                this.checkAgentStatus()
              })
            } else {
              this.postGuide()
              //订单不需要付款，只需对应跳转不同页面
              this.$emit('update:visible', false)
              this.$router.push({
                name: 'Instance'
              })
            }
          }

          this.$store.commit('setGuide', {
            installStep: this.activeStep,
            steps: this.steps,
            subscribeId: this.subscribeId,
            agentId: this.agentId
          })
        })
        .catch(() => {
          this.submitLoading = false
        })
    },

    handleBehavior(behavior) {
      this.behavior.push(behavior)
      this.behaviorAt = Date.now()
      this.postGuide()
    },

    async handleUnsubscribe() {
      this.buried('unsubscribeAgentStripe', '', {
        isGuide: true
      })
      this.unsubscribeIng = true

      await this.$axios.post('api/tcm/subscribe/cancel', {
        subscribeId: this.subscribeId,
        resourceId: this.agentId,
        refundReason: '',
        refundDescribe: ''
      })

      this.buried('unsubscribeAgentStripe', '', {
        result: true
      })

      this.agentId = ''
      this.subscribeId = ''
      await this.postGuide()

      this.$emit('changeIsUnDeploy', false)
      this.unsubscribeIng = false
      // 退回到部署方式
      this.activeStep = this.steps.findIndex(step => step.key === 'DeploymentMethod') + 1
    },

    handleVisible(val) {
      this.$emit('update:visible', val)
    },

    handleOpenGuide() {
      this.$emit('open-guide')
    }
  }
}
</script>

<style scoped lang="scss">
.nav-wrap {
  width: 348px;
  height: 640px;
  gap: 20px;
  flex-shrink: 0;
  background: url('../../assets/image/guide-bg.png');
}

.box-card {
  display: flex;
  padding: 24px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  border-radius: 4px;
  background: var(--color-blur-gary-light-9, #f4f5f7);
}

.guide-steps {
  height: 200px;
}

.guide-main {
  height: 680px;
}

.guide-desc {
  margin-bottom: 60px;
}

.guide-footer {
  //height: 30px;
}

.guide-dialog {
  ::v-deep {
    .el-dialog__body,
    .el-dialog__header {
      padding: 0;
    }

    .el-step__title.is-process {
      color: #c9cdd4;
      font-weight: normal;
    }

    .el-step__head.is-process {
      color: #c9cdd4;
      border-color: #c9cdd4;
    }
  }
}
</style>

<style>
@keyframes dialog-open {
  0% {
    opacity: 0;
    transform: scale(0.2);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes dialog-close {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0);
  }
}

// 遮罩层动画
@keyframes fade-out {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
// 遮罩层动画
@keyframes fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.guide-dialog {
  &.dialog-fade-enter-active {
    animation: fade-in 0.3s;
    .el-dialog {
      animation: dialog-open 0.3s cubic-bezier(0.32, 0.14, 0.15, 0.86);
    }
  }

  &.dialog-fade-leave-active {
    animation: fade-out 0.3s;
    .el-dialog {
      animation: dialog-close 0.3s cubic-bezier(0.78, 0.14, 0.15, 0.86);
    }
  }
}

@keyframes guideIconZoomIn {
  from {
    opacity: 0;
    transform: scale(0.4);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}
.user-guide-icon {
  position: fixed;
  left: 94px;
  bottom: 10px;
  width: 60px;
  height: 60px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  transform-origin: center center;
  animation: 0.3s guideIconZoomIn;
  .el-loading-spinner {
    margin-top: -12px;
    .circular {
      width: 24px;
      height: 24px;
    }
  }
}
</style>
