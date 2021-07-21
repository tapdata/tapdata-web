<template>
  <div v-if="$route.name === 'NoviceGuide'" v-loading="loading" class="novice-guide-wrapper main-container">
    <div class="container-title">
      <span class="fs-5 fw-bolder">新手引导</span>
      <span class="sub-title ml-4"></span>
    </div>
    <div class="container-section mt-6 p-6">
      <el-steps class="pb-6" :active="step" process-status="process" finish-status="success" align-center>
        <el-step title="安装 Agent"></el-step>
        <el-step title="创建源连接"></el-step>
        <el-step title="创建目标连接"></el-step>
        <el-step title="配置同步任务"></el-step>
      </el-steps>
      <!--   第1步   -->
      <div v-if="step === 0" class="step-content mt-7">
        <div class="step-content__title fs-6 fw-bolder">安装 Agent</div>
        <div class="step-content__desc mt-6">
          <div>
            TapData Cloud 需本地安装 Agent
            以确保连接数据库和数据传输服务的正常运行，为了更好了体验新手引导模式，我们将为您提供了Agent测试环境，可用于直接测试数据源。
          </div>
          <div class="mt-2">点击启用agent开始下一步吧！</div>
        </div>
        <div class="agent-info flex justify-between mt-6 p-4">
          <div>
            <div class="agent-status fs-7">待启动</div>
            <div class="agent-desc mt-4">描述：--</div>
            <div class="agent-btn mt-4">
              <el-button type="text" class="color-primary">启动测试Agent</el-button>
            </div>
          </div>
          <div class="flex justify-center align-center">
            <el-progress type="circle" :percentage="100" status="success"></el-progress>
          </div>
        </div>
      </div>
      <!--   第2步   -->
      <!--   第3步   -->
      <!--   第4步   -->
      <div class="operation mt-7">
        <el-button v-if="step !== 0" class="mr-4" size="mini" @click="toPrev">上一步</el-button>
        <el-button type="primary" size="mini" @click="toNext">下一步</el-button>
      </div>
    </div>
  </div>
  <RouterView v-else></RouterView>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
      step: 0
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.loading = false
    },
    toPrev() {
      if (this.step-- < 0) this.step = 0
    },
    toNext() {
      if (this.step++ > 3) this.step = 0
    }
  }
}
</script>

<style lang="scss" scoped>
.novice-guide-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  .container-section {
    flex: 1;
  }
}
.container-title {
  .sub-title {
    color: #7a7a7a;
  }
}
.container-section {
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.02);
  border-radius: 4px;
  background: #fff;
  .el-steps {
    border-bottom: 1px solid #f2f2f2;
  }
  .agent-info {
    background: rgba(44, 101, 255, 0.1);
    border-radius: 2px;
    .el-button {
      &:hover,
      &:focus {
        background-color: transparent;
        color: unset;
        border-color: transparent;
      }
    }
    .el-progress {
      ::v-deep {
        .el-progress-circle {
          width: 57px !important;
          height: 57px !important;
        }
      }
    }
  }
}
</style>
