<template>
  <ElDialog
    custom-class="agent-guide-dialog"
    :width="style['dialog']"
    :visible.sync="visible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
  >
    <section class="agent-guide-main flex" style="height: 646px">
      <!--第一步-->
      <div class="agent-guide-left mt-110" :style="{ 'margin-top': style['top'] }" v-if="step === 1">
        <header class="agent-guide-header mb-32">
          {{ $t('dfs_agent_download_agentguidedialog_huanyingshiyongT') }}
        </header>
        <div class="agent-guide-desc mb-4">{{ $t('dfs_agent_download_agentguidedialog_dianjixiafangde') }}</div>
        <div class="agent-guide-txt mb-4">{{ $t('dfs_agent_download_agentguidedialog_ninyaotongbude') }}</div>
        <div class="agent-guide-link flex">
          <div
            class="item mr-4 cursor-pointer"
            :style="{ width: style['item'] }"
            :class="{ active: current === 'extranet' }"
            @click="changeImg('extranet')"
          >
            <VIcon size="30" class="color-primary">extranet</VIcon>
            <div class="txt mt-2">{{ $t('dfs_agent_download_agentguidedialog_womendeshuju') }}</div>
          </div>
          <div
            class="item cursor-pointer"
            :style="{ width: style['item'] }"
            :class="{ active: current === 'intranet' }"
            @click="changeImg('intranet')"
          >
            <VIcon size="30" class="color-primary">intranet</VIcon>
            <div class="txt mt-2">{{ $t('dfs_agent_download_agentguidedialog_neiwang') }}</div>
          </div>
        </div>
        <!-- 提示-->
        <div class="mt-4" style="height: 20px">
          <span v-if="showTip">
            <VIcon size="14" class="color-danger mr-1">info</VIcon
            >{{ $t('dfs_agent_download_agentguidedialog_qingdianjibushu') }}</span
          >
        </div>
        <div class="footer mt-6">
          <el-button class="step-button" type="primary" @click="goStep()">{{
            $t('dfs_agent_download_agentguidedialog_xiayibu')
          }}</el-button>
        </div>
      </div>
      <!--第二步 -->
      <div class="agent-guide-left mt-32" v-if="step === 2" style="margin-top: 100px">
        <header class="step-2-guide-header mb-39">
          {{ $t('dfs_agent_download_agentguidedialog_lijiquanzhuang') }}
        </header>
        <div class="agent-guide-step-2">
          <!--半托管云模式 – 仅需安装 Agent -->
          <div class="step mb-39" :style="{ width: style['step'] }">
            <div class="step-header mb-2">
              <VIcon size="18" class="color-primary mr-2">demoInstall</VIcon
              >{{ $t('dfs_agent_download_agentguidedialog_bantuoguanyunmo') }}
            </div>
            <div class="step-content">{{ $t('dfs_agent_download_agentguidedialog_ninkeyigenzhe') }}</div>
            <el-button type="primary" class="mb-2 step-button" @click="openAgentDownloadModal()">{{
              $t('dfs_agent_download_agentguidedialog_anzhuang')
            }}</el-button>
          </div>
          <!--线下模式 – 自主安装全套软件 -->
          <div class="step mb-39" :style="{ width: style['step'] }" v-if="current === 'intranet'">
            <div class="step-header mb-2">
              <VIcon size="16" class="color-primary mr-2">offline-install</VIcon
              >{{ $t('dfs_agent_download_agentguidedialog_xianxiamoshizi') }}
            </div>
            <div class="step-content">{{ $t('dfs_agent_download_agentguidedialog_zainindeshuju') }}</div>
            <el-button type="primary" class="mb-2" @click="goOnPrem()">{{
              $t('dfs_agent_download_agentguidedialog_huoquwanzhengshi')
            }}</el-button>
          </div>
          <!--全托管云模式 – 直接云中部署 -->
          <div class="step mb-39" :style="{ width: style['step'] }" v-if="current === 'extranet'">
            <div class="step-header mb-2">
              <VIcon size="16" class="color-primary mr-2">cloud-install</VIcon
              >{{ $t('dfs_agent_download_agentguidedialog_quantuoguanyunmo') }}
            </div>
            <div class="step-content">{{ $t('dfs_agent_download_agentguidedialog_shiyongTap') }}</div>
            <el-button type="info" disabled class="mb-2" @click="openAgentDownloadModal()">{{
              $t('dfs_agent_download_agentguidedialog_jijiangshangxian')
            }}</el-button>
          </div>
          <!--demo -->
          <!--          <div class="step" :style="{ width: style['step'] }">-->
          <!--            <div class="step-header mb-2">-->
          <!--              <VIcon size="16" class="color-primary mr-2">selfInstall</VIcon-->
          <!--              >{{ $t('dfs_agent_download_agentguidedialog_tiyanDem') }}-->
          <!--            </div>-->
          <!--            <div class="step-content">{{ $t('dfs_agent_download_agentguidedialog_buxianganzhuanghuo') }}</div>-->
          <!--            <el-button type="primary" class="mb-2 step-button" @click="goDemo()">{{-->
          <!--              $t('dfs_agent_download_agentguidedialog_tiyan')-->
          <!--            }}</el-button>-->
          <!--            <span class="inline-block userPassword">-->
          <!--              <span class="inline-block"-->
            <!--                >{{ $t('dfs_agent_download_agentguidedialog_yonghumingde') }}<span>demo@tapdata.io</span></span-->
          <!--              >-->
          <!--              <br />-->
          <!--              <span class="inline-block"-->
            <!--                >{{ $t('dfs_agent_download_agentguidedialog_mimatap') }}-->
          <!--                <span style="margin-left: 10px">tapdata</span></span-->
          <!--              >-->
          <!--            </span>-->
          <!--          </div>-->
        </div>
        <VIcon size="18" class="agent-download-icon" v-if="showClose" @click="close">close</VIcon>
      </div>
      <div class="agent-guide-init" v-show="type === 'init'">
        <div class="agent-guide-right-txt">{{ $t('dfs_agent_download_agentguidedialog_tapda') }}</div>
      </div>
      <!--外网切换 -->
      <div class="agent-guide-sync" v-show="type === 'extranet-sync'">
        <div class="switch" :style="{ width: style['switch'] }">
          <span class="current cursor-pointer" :style="{ width: style['current'] }">{{
            $t('dfs_agent_download_agentguidedialog_shujutongbu')
          }}</span>
          <span class="ordinary cursor-pointer" @click="changeType('extranet-login')">{{
            $t('dfs_agent_download_agentguidedialog_ruhurucang')
          }}</span>
        </div>
      </div>
      <div class="agent-guide-login" v-show="type === 'extranet-login'">
        <div class="switch" :style="{ width: style['switch'] }">
          <span
            class="ordinary-suffix cursor-pointer"
            :style="{ width: style['current-suffix'] }"
            @click="changeType('extranet-sync')"
            >{{ $t('dfs_agent_download_agentguidedialog_shujutongbu') }}</span
          >
          <span class="current-suffix cursor-pointer" :style="{ width: style['ordinary-suffix'] }">{{
            $t('dfs_agent_download_agentguidedialog_ruhurucang')
          }}</span>
        </div>
      </div>
      <!--内网切换 -->
      <div class="agent-guide-intranet-sync" v-show="type === 'intranet-sync'">
        <div class="switch" :style="{ width: style['switch'] }">
          <span class="current cursor-pointer" :style="{ width: style['current'] }">{{
            $t('dfs_agent_download_agentguidedialog_shujutongbu')
          }}</span>
          <span class="ordinary cursor-pointer" @click="changeType('intranet-login')">{{
            $t('dfs_agent_download_agentguidedialog_ruhurucang')
          }}</span>
        </div>
      </div>
      <div class="agent-guide-intranet-login" v-show="type === 'intranet-login'">
        <div class="switch" :style="{ width: style['switch'] }">
          <span
            class="ordinary-suffix cursor-pointer"
            :style="{ width: style['current-suffix'] }"
            @click="changeType('intranet-sync')"
            >{{ $t('dfs_agent_download_agentguidedialog_shujutongbu') }}</span
          >
          <span class="current-suffix cursor-pointer" :style="{ width: style['ordinary-suffix'] }">{{
            $t('dfs_agent_download_agentguidedialog_ruhurucang')
          }}</span>
        </div>
      </div>
    </section>
  </ElDialog>
</template>
<script>
import { buried } from '@/plugins/buried'
import Cookie from '@tap/shared/src/cookie'
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
      step: 1,
      style: {},
      showClose: false, //关闭按钮
      showTip: false
    }
  },
  mounted() {
    this.getEnStyle()
  },
  methods: {
    getEnStyle() {
      const { locale } = this.$i18n
      this.style =
        locale === 'en'
          ? {
              current: '200px',
              'current-suffix': '200px',
              switch: '543px',
              item: '221px',
              dialog: '1100px',
              top: '20px',
              'ordinary-suffix': '365px',
              step: '448px'
            }
          : {
              current: '135px',
              'current-suffix': '130px',
              switch: '265px',
              item: '186px',
              dialog: '1035px',
              top: '110px',
              'ordinary-suffix': '130px',
              step: '382px'
            }
    },
    changeImg(type) {
      buried('agentGuide' + type)
      this.showTip = false
      this.current = type //extranet外网  intranet 内网
      this.type = type + '-sync' //init 初始化  sync 数据同步 login 入湖边入仓
    },
    changeType(type) {
      buried('agentGuide' + type)
      this.type = type //init 初始化  sync 数据同步 login 入湖边入仓
    },
    //下一步
    goStep() {
      if (this.current === '') {
        this.showTip = true
        return
      }
      buried('agentGuideNext')
      this.step = 2
    },
    //关闭当前弹窗-弹出agent下载页面
    openAgentDownloadModal() {
      buried('agentGuideInstall')
      this.$emit('openAgentDownload')
    },
    close() {
      Cookie.set('deployLater', 1)
      let user = window.__USER_INFO__
      Cookie.set('deployLaterUser', user.userId)
      this.$emit('update:visible', false)
    },
    //去官网报价
    goOnPrem() {
      buried('agentGuideTapdataOnPrem')
      this.showClose = true
      window.open('https://tapdata.net/tapdata-on-prem/demo.html')
    },
    //去demo环境体验
    goDemo() {
      buried('agentGuideDemo')
      this.showClose = true
      window.open('https://demo.cloud.tapdata.net/console/v3/')
    }
  }
}
</script>
<style lang="scss" scoped>
.agent-guide-main {
  .mt-110 {
    margin-top: 110px;
  }
  .mb-32 {
    margin-bottom: 32px;
  }
  .mb-39 {
    margin-bottom: 24px;
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
    height: 80px;
  }
  .footer {
    margin-bottom: 58px;
  }
  .agent-download-icon {
    position: absolute;
    top: 20px;
    right: 20px;
    color: #fff;
  }
  .item {
    width: 175px;
    padding: 14px 20px;
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
    width: 600px;
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
    width: 265px;
    height: 33px;
    border: 2px solid #ffffff;
    border-radius: 100px;
    margin: 0 auto;
    margin-top: 40px;
  }
  .current {
    display: inline-block;
    text-align: center;
    line-height: 30px;
    width: 135px;
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
    width: 130px;
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
  .step-2-guide-header {
    font-size: 20px;
    font-weight: 600;
    letter-spacing: 0px;
    text-align: left;
  }
  .step {
    width: 380px;
    height: 160px;
    border: 1px solid #f2f2f2;
    padding: 12px;
    background: #f4f6fb;
    border-radius: 8px;
  }
  .step-content {
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    height: 44px;
    margin: 15px 0;
    color: #86909c;
  }
  .step-header {
    font-weight: 600;
    font-size: 18px;
    color: #333c4a;
  }
  .step-button {
    width: 120px;
  }
  .userPassword {
    vertical-align: middle;
    margin-left: 16px;
    line-height: 18px;
    font-size: 12px;
  }
}
::v-deep {
  .agent-guide-dialog {
    margin-top: 9vh !important;
    .el-button {
      font-size: 16px;
    }
    .el-dialog__header {
      padding: 0;
    }
    .el-dialog__body {
      padding: 0;
    }
  }
}
</style>
