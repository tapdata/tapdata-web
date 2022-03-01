<template>
  <ElDialog
    custom-class="agent-download-dialog"
    width="1000px"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    :show-close="false"
  >
    <section class="fast-download down-page">
      <main class="page-main block">
        <div class="title">{{ $t('agent_deploy_title') }}</div>
        <p class="title-text pt-6">
          {{ $t('agent_deploy_select_tip') }}
        </p>

        <div class="down-type">
          <div
            v-for="down in downType"
            :key="down.value"
            :class="{ active: downLoadType === down.value }"
            @click="chooseDownLoadType(down.value)"
          >
            <span>{{ down.name }}</span>
          </div>
        </div>
        <template v-if="downLoadType === 'windows'">
          <ul class="ul-style">
            <li>
              {{ $t('agent_deploy_start_install_windows_first') }}
              <ElLink type="primary" @click="handleDownLoad">{{
                $t('agent_deploy_start_install_windows_first_download')
              }}</ElLink>
            </li>
            <li class="mt-3">
              {{ $t('agent_deploy_start_install_windows_second') }}
            </li>
            <li class="mt-3">
              {{ $t('agent_deploy_start_install_windows_third') }}
            </li>
            <li class="mt-3">
              {{ $t('agent_deploy_start_install_windows_fourth') }}
            </li>
            <li class="box title-text mt-2">
              <span class="link-line">{{ windowsLink }}</span>
              <ElTooltip
                placement="top"
                manual
                :content="$t('agent_deploy_start_install_button_copied')"
                popper-class="copy-tooltip"
                :value="showTooltip"
              >
                <span
                  class="operaKey"
                  v-clipboard:copy="windowsLink"
                  v-clipboard:success="onCopy"
                  @mouseleave="showTooltip = false"
                >
                  <i class="click-style">{{ $t('agent_deploy_start_install_button_copy') }}</i>
                </span>
              </ElTooltip>
            </li>
            <li class="mt-3">
              <span>{{ $t('agent_deploy_start_install_windows_fifth') }}</span>
            </li>
          </ul>
        </template>
        <template v-if="downLoadType === 'Linux'">
          <ul class="ul-style">
            <li>
              <span>{{ $t('agent_deploy_before_prepare_linux_first') }}</span>
              <ElLink type="primary" @click="linuxToJava">{{
                $t('agent_deploy_before_prepare_linux_first_link')
              }}</ElLink>
            </li>
            <li>2.在您的Linux服务器下新建目录tapdata用来安装部署Tapdata Agent</li>
            <li class="box title-text my-2">mkdir tapdata</li>
            <li>3.复制下方命令并在tapdata目录下执行，其包含 Tapdata Agent 的下载、自动部署及启动。</li>
            <li class="box title-text my-2">
              <span class="link-line">{{ linuxLink }}</span>
              <ElTooltip
                placement="top"
                manual
                :content="$t('agent_deploy_start_install_button_copied')"
                popper-class="copy-tooltip"
                :value="showTooltip"
              >
                <span
                  class="operaKey"
                  v-clipboard:copy="linuxLink"
                  v-clipboard:success="onCopy"
                  @mouseleave="showTooltip = false"
                >
                  <i class="click-style">{{ $t('agent_deploy_start_install_button_copy') }}</i>
                </span>
              </ElTooltip>
            </li>
            <li>4.等待命令执行完成，即可完成Tapdata Agent的安装和启动。</li>
          </ul>
        </template>
        <template v-if="downLoadType === 'Docker'">
          <ul class="ul-style">
            <li>
              <span>1.您的部署环境必须已经安装并启动Docker才可使用Docker方式安装，如未安装可参考</span>
              <ElLink type="primary" @click="dockerToInstall">{{
                $t('agent_deploy_before_prepare_docker_install_link')
              }}</ElLink>
              <span>{{ $t('agent_deploy_before_prepare_docker_second_install') }}</span>
            </li>
            <li>
              <div class="my-5 text-style">{{ $t('agent_deploy_start_install') }}</div>
            </li>
            <li>2.复制下方命令并在tapdata目录下执行，其包含镜像的下载及运行，Tapdata Agent 的下载、自动部署及启动</li>
            <li class="box title-text my-2">
              <span class="link-line">{{ dockerLink }}</span>
              <ElTooltip
                placement="top"
                manual
                :content="$t('agent_deploy_start_install_button_copied')"
                popper-class="copy-tooltip"
                :value="showTooltip"
              >
                <span
                  class="operaKey"
                  v-clipboard:copy="dockerLink"
                  v-clipboard:success="onCopy"
                  @mouseleave="showTooltip = false"
                >
                  <i class="click-style">{{ $t('agent_deploy_start_install_button_copy') }}</i>
                </span>
              </ElTooltip>
            </li>
            <li>3.等待命令执行完成，即可完成Tapdata Agent的安装和启动。</li>
          </ul>
        </template>
        <div class="result-item mt-4 text-center">
          <div v-if="isFinished" class="loading-item">
            <VIcon class="v-icon animation-rotate color-success" size="24" color="rgb(61, 156, 64)"
              >loading-circle</VIcon
            >
            <div class="mt-4 pb-10">部署状态检测中</div>
          </div>
          <div v-else class="finish-item">
            <VIcon class="v-icon color-success" size="24" color="rgb(61, 156, 64)">check</VIcon>
            <div class="mt-4">恭喜您，完成部署！</div>
            <div class="flex justify-content-between mt-4">
              <ElLink type="primary" @click="toConnection">开始创建连接</ElLink>
              <ElLink type="primary" @click="toWorkbench">进入工作台</ElLink>
            </div>
          </div>
        </div>
      </main>
    </section>
  </ElDialog>
</template>
<script>
import VIcon from '@/components/VIcon'

export default {
  name: 'FastDownload',
  components: { VIcon },
  data() {
    return {
      downLoadType: 'Linux',
      downType: [
        { name: 'Linux (64 bit)', value: 'Linux' },
        { name: 'Docker', value: 'Docker' },
        { name: 'Windows (64 bit)', value: 'windows' }
      ],
      showTooltip: false,
      windowsLink: '',
      linuxLink: '',
      dockerLink: '',
      downloadUrl: '',
      timer: null,
      agentId: '',
      dialogVisible: false,
      isFinished: false
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.setTimer()
      this.$once('hook:beforeDestroy', () => {
        this.clearTimer()
      })
      this.checkAgent()
    },
    setTimer() {
      this.timer = setInterval(() => {}, 10000)
    },
    clearTimer() {
      this.timer && clearInterval(this.timer)
    },
    checkAgent() {
      this.$axios.get('api/tcm/orders/checkAgent').then(data => {
        if (data.agentId) {
          this.dialogVisible = true
          data.deployInfo.links.forEach(el => {
            this[el.os + 'Link'] = el.command
          })
        }
      })
    },
    handleDownLoad() {
      window.location = `${this.downloadUrl}tapdata.exe`
    },
    chooseDownLoadType(val) {
      this.downLoadType = val
    },
    onCopy() {
      this.showTooltip = true
    },
    windowsToAgent() {
      window.open('https://sourl.cn/MK6mXF', '_blank')
    },
    linuxToJava() {
      window.open(
        'https://www.yuque.com/tapdata/cloud/chan-pin-shou-ce_shi-li-guan-li_xia-zai-an-zhuang_linux-huan-jing-xia-zai-yu-an-zhuang#46215ffa',
        '_blank'
      )
    },
    dockerToInstall() {
      window.open('https://docs.docker.com/get-docker/', '_blank')
    },
    closeModal() {
      this.dialogVisible = false
      this.clearTimer()
    },
    toConnection() {
      this.closeModal()
      this.$router.push({
        name: 'Connection'
      })
    },
    toWorkbench() {
      this.closeModal()
      this.$router.push({
        name: 'Workbench'
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.fast-download {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-size: 12px;
  background-color: #fff;
  box-sizing: border-box;
  .page-main {
    margin: 0 auto;
    width: 800px;
    //height: calc(100% - 80px);
    box-sizing: border-box;
    overflow: auto;

    .title {
      font-size: 28px !important;
      font-weight: bold;
      color: #333;
      text-align: center;
    }
    .title-text {
      line-height: 22px;
      font-size: 12px;
      color: #666;
    }
    .text-style {
      font-size: 12px;
      color: #333;
      font-weight: bold;
    }
    .ul-style {
      li {
        padding: 3px 0;
        overflow-x: auto;
      }
    }
    .link-line {
      word-break: break-all;
    }
    .box {
      padding: 10px 20px;
      background-color: #fafafa;
    }
    .box.title-text {
      padding: 10px 20px;
    }
    .click-style {
      padding-left: 10px;
      font-size: 12px;
      font-style: normal;
      color: map-get($color, primary);
      font-weight: normal;
      cursor: pointer;
    }
    .text-style {
      font-size: 12px;
      color: #333;
      font-weight: bold;
    }
    .down-type {
      padding: 18px 0;
      div {
        position: relative;
        display: inline-block;
        overflow: hidden;
        margin-right: 20px;
        padding: 10px 50px;
        font-size: 12px;
        cursor: pointer;
        color: #666;
        border: 1px solid #dedee4;
        border-radius: 3px;
      }
      .active {
        border: 1px solid map-get($color, primary);
        background-color: map-get($color, primary);
        color: #fff;
      }
    }
    .line {
      margin: 20px 0 0 15px;
      border-left: 3px solid map-get($color, primary);
      p {
        padding-top: 5px;
      }
    }
  }
}
.result-item {
  height: 100px;
}
.finish-item {
  margin: 0 auto;
  width: 200px;
}
::v-deep {
  .agent-download-dialog {
    .el-dialog__header {
      display: none;
    }
  }
}
</style>
