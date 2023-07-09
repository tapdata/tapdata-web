<template>
  <ElDialog class="guide-dialog" :visible.sync="visible" width="1000px" :show-close="false">
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
      <div class="guide-main flex-1 align-items-center ml-8 mt-4 mr-8">
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
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <VButton type="primary" auto-loading @click="submitConfirm(arguments[0])">{{ $t('public_button_next') }}</VButton>
    </span>
  </ElDialog>
</template>
<script>
import Account from './Account.vue'
import DeploymentMethod from './DeploymentMethod.vue'
import Scenes from './Scenes.vue'
import Spec from './Spec.vue'

export default {
  name: 'guide',
  props: ['visible'],
  components: {
    Account,
    Scenes,
    DeploymentMethod,
    Spec
  },
  data() {
    return {
      activeStep: 1,
      steps: [
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
      ],
      scenes: ['12'], //使用场景
      platform: 'selfHost'
    }
  },
  methods: {
    next() {
      this.activeStep++
    },
    //确认提交
    submitConfirm(res) {
      switch (this.activeStep) {
        case 1:
          this.bindPhoneConfirm(res)
          break
        case 2:
        case 3:
          res?.() //结束loading
          this.next(res)
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
  background: linear-gradient(146deg, rgba(44, 116, 255, 0.07) 0%, rgba(44, 101, 255, 0.01) 100%);
}
.guide-steps {
  height: 200px;
}
.guide-desc {
  margin-bottom: 60px;
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
