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
      <div class="guide-main flex-1 align-items-center ml-8 mt-4">
        <template v-if="[1].includes(activeStep)">
          <!--绑定手机号-->
          <Account></Account>
        </template>
      </div>
    </div>
  </ElDialog>
</template>
<script>
import Account from './Account.vue'

export default {
  name: 'guide',
  props: ['visible'],
  components: {
    Account
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
      ]
    }
  },
  methods: {}
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
