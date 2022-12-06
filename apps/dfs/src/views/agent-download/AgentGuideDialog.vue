<template>
  <ElDialog
    custom-class="agent-guide-dialog"
    width="1017px"
    :visible.sync="visible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
  >
    <section class="agent-guide-main flex">
      <div class="agent-guide-left mt-110" v-if="step === 1">
        <header class="agent-guide-header mb-32">欢迎使用Tapdata</header>
        <div class="agent-guide-desc mb-4">点击下方的场景查看我们推荐的部署方案：</div>
        <div class="agent-guide-txt mb-4">
          您要同步的数据源/目标库是否能够给外网开放端口？（通过防火增、SSH Tunnel、VPN或其他方式）
        </div>
        <div class="agent-guide-link mb-8 flex">
          <div
            class="item mr-4 cursor-pointer"
            :class="{ active: current === 'extranet' }"
            @click="changeImg('extranet')"
          >
            <VIcon size="18" class="color-primary">extranet</VIcon>
            <div class="txt mt-2">我们的数据源和目标 可以被外网服务访问</div>
          </div>
          <div class="item cursor-pointer" :class="{ active: current === 'intranet' }" @click="changeImg('intranet')">
            <VIcon size="18" class="color-primary">intranet</VIcon>
            <div class="txt mt-2">我们的数据源和目标 可以被外网服务访问</div>
          </div>
        </div>
        <div class="footer">
          <el-button type="primary" @click="step = 2">下一步</el-button>
        </div>
      </div>
      <div class="agent-guide-left mt-32" v-if="step === 2">
        <header class="agent-guide-header mb-39">立即去安装</header>
        <div class="agent-guide-step-2">
          <div class="step mb-39">
            <div class="color-primary step-header mb-2">自助安装</div>
            <div class="flex mb-4 step-content">
              <div class="mr-4">您需要根据引导的操作，将Tapdata的数据计算引擎Agent安装可以访问您数据的机器上。</div>
              <VIcon size="40" class="color-primary">selfInstall</VIcon>
            </div>
            <el-button type="primary" @click="openAgentDownloadModal()">安装</el-button>
          </div>
          <div class="step">
            <div class="color-primary step-header mb-2">体验Demo(无需安装）</div>
            <div class="flex mb-4 step-content">
              <div class="mr-4">
                我们提供了体检Demo环境，您无需安装Agent即可查看和体验Tapdata强大的数据同步和处理能力。
              </div>
              <VIcon size="40" class="color-primary">demoInstall</VIcon>
            </div>
            <el-button type="primary">体验</el-button>
          </div>
        </div>
      </div>
      <div class="agent-guide-init" v-show="type === 'init'">
        <div class="agent-guide-right-txt">tapdata可以满足异构数据库实时同步、数据入湖入仓、云中数据ETL等多类场景</div>
      </div>
      <!--外网切换 -->
      <div class="agent-guide-sync" v-show="type === 'extranet-sync'">
        <div class="switch">
          <span class="current cursor-pointer">数据同步</span>
          <span class="ordinary cursor-pointer" @click="changeType('extranet-login')">入湖入仓</span>
        </div>
      </div>
      <div class="agent-guide-login" v-show="type === 'extranet-login'">
        <div class="switch">
          <span class="ordinary-suffix cursor-pointer" @click="changeType('extranet-sync')">数据同步</span>
          <span class="current-suffix cursor-pointer">入湖入仓</span>
        </div>
      </div>
      <!--内网切换 -->
      <div class="agent-guide-intranet-sync" v-show="type === 'intranet-sync'">
        <div class="switch">
          <span class="current cursor-pointer">数据同步</span>
          <span class="ordinary cursor-pointer" @click="changeType('intranet-login')">入湖入仓</span>
        </div>
      </div>
      <div class="agent-guide-intranet-login" v-show="type === 'intranet-login'">
        <div class="switch">
          <span class="ordinary-suffix cursor-pointer" @click="changeType('intranet-sync')">数据同步</span>
          <span class="current-suffix cursor-pointer">入湖入仓</span>
        </div>
      </div>
    </section>
  </ElDialog>
</template>
<script>
import { VIcon } from '@tap/component'

export default {
  name: 'AgentGuideDialog',
  components: { VIcon },
  props: {
    visible: {
      type: Boolean
    }
  },
  data() {
    return {
      current: '',
      type: 'init',
      step: 1
    }
  },
  methods: {
    changeImg(type) {
      this.current = type //extranet外网  intranet 内网
      this.type = type + '-sync' //init 初始化  sync 数据同步 login 入湖边入仓
    },
    changeType(type) {
      this.type = type //init 初始化  sync 数据同步 login 入湖边入仓
    },
    //关闭当前弹窗-弹出agent下载页面
    openAgentDownloadModal() {
      this.$emit('openAgentDownload')
    }
  }
}
</script>
<style lang="scss" scoped>
.agent-guide-main {
  .mt-110 {
    margin-top: 115px;
  }
  .mb-32 {
    margin-bottom: 32px;
  }
  .mb-39 {
    margin-bottom: 39px;
  }
  .agent-guide-header {
    font-size: 32px;
    font-weight: 600;
    letter-spacing: 0px;
    text-align: left;
  }
  .agent-guide-desc {
    font-size: 18px;
    font-weight: 500;
    letter-spacing: 0px;
    text-align: left;
  }
  .agent-guide-txt {
    font-size: 16px;
    font-weight: 400;
    letter-spacing: 0px;
    text-align: left;
  }
  .item {
    width: 175px;
    padding: 20px;
    box-sizing: border-box;
    background: #fff;
    /* 主题色 */
    border: 2px solid #f2f2f2;
    border-radius: 3px;
  }
  .agent-guide-link {
    .active {
      border: 2px solid map-get($color, primary);
      background: #2c65ff1a;
    }
  }
  .txt {
    font-weight: 400;
    font-size: 14px;
    /* 次要信息 */
    color: #535f72;
  }
  .agent-guide-right-txt {
    font-size: 14px;
    font-weight: 600;
    text-align: center;
    color: #fff;
    margin-top: 72px;
  }
  .agent-guide-left {
    width: 550px;
    padding: 24px 32px;
  }
  .agent-guide-init {
    width: 100%;
    background: url('../../../public/images/agent/agent-guide-welcome.png');
    background-repeat: no-repeat;
  }
  .agent-guide-login {
    width: 100%;
    background: url('../../../public/images/agent/agent-guide-login.png');
    background-repeat: no-repeat;
  }
  .agent-guide-sync {
    width: 100%;
    background: url('../../../public/images/agent/agent-guide-sync.png');
    background-repeat: no-repeat;
  }
  .agent-guide-intranet-login {
    width: 100%;
    background: url('../../../public/images/agent/agent-guide-intranet-login.png');
    background-repeat: no-repeat;
  }
  .agent-guide-intranet-sync {
    width: 100%;
    background: url('../../../public/images/agent/agent-guide-intranet-sync.png');
    background-repeat: no-repeat;
  }
  .switch {
    width: 187px;
    height: 33px;
    border: 2px solid #ffffff;
    border-radius: 100px;
    margin: 28px auto;
  }
  .current {
    display: inline-block;
    text-align: center;
    line-height: 30px;
    width: 90px;
    height: 31px;
    color: #2c65ff;
    background: #ffffff;
    border-radius: 100px;
    margin-left: -1px;
    margin-top: -1px;
  }
  .ordinary {
    color: #ffffff;
    margin-left: 18px;
  }
  .current-suffix {
    display: inline-block;
    text-align: center;
    line-height: 30px;
    width: 92px;
    height: 31px;
    color: #2c65ff;
    background: #ffffff;
    border-radius: 100px;
    margin-right: -5px;
    margin-top: -1px;
  }
  .ordinary-suffix {
    color: #ffffff;
    margin-right: 18px;
    margin-left: 18px;
  }

  //step-2
  .step {
    width: 365px;
    height: 178px;
    background: #ffffff;
    /* 分割线 */
    border: 1px solid #f2f2f2;
    padding: 16px;
  }
  .step-content {
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    height: 80px;
    color: #535f72;
  }
  .step-header {
    font-weight: 400;
    font-size: 18px;
  }
}
::v-deep {
  .agent-guide-dialog {
    .el-dialog__header {
      padding: 0;
    }
    .el-dialog__body {
      padding: 0;
    }
  }
}
</style>
