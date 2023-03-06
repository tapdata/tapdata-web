<template>
  <ElDialog
    custom-class="agent-download-dialog"
    width="1000px"
    v-model:visible="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
  >
    <section class="fast-download down-page">
      <main class="page-main block">
        <div class="title">{{ $t('agent_deploy_title') }}</div>
        <p class="title-text pt-6">
          {{ $t('agent_deploy_select_tip') }}
        </p>
        <div class="content">
          <div class="text-style mt-6">
            {{ $t('dfs_agent_download_agentdownloadmodal_yaoanzhuangAg') }}
          </div>
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
              <li>{{ $t('agent_download_AgentDownloadModal_zaiNinDeLI') }}</li>
              <li class="box title-text my-2">mkdir tapdata</li>
              <li>
                {{ $t('agent_download_AgentDownloadModal_fuZhiXiaFangMing2') }}
              </li>
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
              <li>
                {{ $t('agent_download_AgentDownloadModal_dengDaiMingLingZhi2') }}
              </li>
            </ul>
          </template>
          <template v-if="downLoadType === 'Docker'">
            <ul class="ul-style">
              <li>
                <span>{{ $t('agent_download_AgentDownloadModal_ninDeBuShuHuan') }}</span>
                <ElLink type="primary" @click="dockerToInstall">{{
                  $t('agent_deploy_before_prepare_docker_install_link')
                }}</ElLink>
                <span>{{ $t('agent_deploy_before_prepare_docker_second_install') }}</span>
              </li>
              <li>
                <div class="my-5 text-style">
                  {{ $t('agent_deploy_start_install') }}
                </div>
              </li>
              <li>
                {{ $t('agent_download_AgentDownloadModal_fuZhiXiaFangMing') }}
              </li>
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
              <li>
                {{ $t('agent_download_AgentDownloadModal_dengDaiMingLingZhi') }}
              </li>
            </ul>
          </template>
          <template v-if="downLoadType === 'AliComputenest'">
            <ul class="ul-style">
              <li>
                <span>{{ $t('dfs_agent_download_agentdownloadmodal_jisuanchaoCo') }}</span>
              </li>
              <li>
                <div class="my-5 text-style">
                  {{ $t('agent_deploy_before_prepare_title') }}
                </div>
              </li>
              <li>
                {{ $t('dfs_agent_download_agentdownloadmodal_zhunbeiguanliyun') }}
              </li>
              <li>
                <div class="my-5 text-style">
                  {{ $t('agent_deploy_start_install') }}
                </div>
              </li>
              <li>
                {{ $t('dfs_agent_download_agentdownloadmodal_ninkeyixuanze') }}
                <div class="my-4">
                  <el-link :href="trialUrl" target="_blank" class="mr-4 url-btn"
                    ><div>
                      {{ $t('dfs_agent_download_agentdownloadmodal_santianshiyong') }}
                    </div></el-link
                  >
                  <el-link :href="url" target="_blank" class="url-btn"
                    ><div>
                      {{ $t('dfs_agent_download_agentdownloadmodal_fufeibushu') }}
                    </div></el-link
                  >
                </div>
              </li>
              <li>
                {{ $t('dfs_agent_download_agentdownloadmodal_womenyijingwei') }}
              </li>
              <li>
                <div class="my-2 text-style">
                  {{ $t('dfs_agent_download_agentdownloadmodal_shilibanben') }}
                </div>
              </li>
              <li class="box title-text my-2">{{ version }}</li>
              <li>
                <div class="my-2 text-style">
                  {{ $t('dfs_agent_download_agentdownloadmodal_shilitok') }}
                </div>
              </li>
              <li class="box title-text link-line my-2">
                {{ token }}
              </li>
              <li>
                {{ $t('dfs_agent_download_agentdownloadmodal_querenjisuanchao') }}
              </li>
              <li>
                <el-image :src="getImg('alicomputenest_instance')" alt="" />
              </li>
              <li class="my-2">
                {{ $t('dfs_agent_download_agentdownloadmodal_bushuwanchenghou') }}
              </li>
              <li>
                <el-image :src="getImg('alicomputenest_agent')" alt="" />
              </li>
            </ul>
          </template>
        </div>
      </main>
    </section>
    <template v-slot:footer>
      <span>
        <div class="result-item text-center flex justify-content-end align-items-center">
          <div v-if="!isFinished" class="loading-item flex align-items-center">
            <div class="flex align-items-center agent_download_status_icon">
              <VIcon class="v-icon animation-rotate color-success" size="18" color="rgb(61, 156, 64)"
                >loading-circle-blue</VIcon
              >
              <div class="ml-4">
                {{ $t('agent_download_AgentDownloadModal_buShuZhuangTaiJian') }}
              </div>
            </div>
            <div class="agent_download_status_btn">
              <div @click="recordUserBehavior">
                {{ $t('agent_button_deploy_later') }}
              </div>
            </div>
          </div>
          <div v-else class="finish-item">
            <VIcon class="v-icon color-success" size="24" color="rgb(61, 156, 64)">check</VIcon>
            <div class="mt-4">
              {{ $t('agent_download_AgentDownloadModal_gongXiNinWanCheng') }}
            </div>
            <div class="flex justify-content-between mt-4">
              <ElLink type="primary" @click="toConnection">{{
                $t('agent_download_AgentDownloadModal_kaiShiChuangJianLian')
              }}</ElLink>
              <ElLink type="primary" @click="toWorkbench">{{
                $t('agent_download_AgentDownloadModal_jinRuGongZuoTai')
              }}</ElLink>
            </div>
          </div>
        </div>
      </span>
    </template>
  </ElDialog>
</template>

<script>
import { $on, $off, $once, $emit } from '../../utils/gogocodeTransfer'
import i18n from '@/i18n'

import { VIcon } from '@tap/component'
import Cookie from '@tap/shared/src/cookie'

export default {
  name: 'FastDownload',
  components: { VIcon },
  props: {
    visible: {
      type: Boolean
    },
    source: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      downLoadType: 'Linux',
      downType: [
        { name: 'Linux (64 bit)', value: 'Linux' },
        { name: 'Docker', value: 'Docker' },
        { name: 'Windows (64 bit)', value: 'windows' },
        {
          name: i18n.global.t('dfs_agent_download_agentdownloadmodal_aliyunjisuan'),
          value: 'AliComputenest'
        }
      ],
      showTooltip: false,
      windowsLink: '',
      linuxLink: '',
      dockerLink: '',
      downloadUrl: '',
      timer: null,
      agentId: '',
      dialogVisible: false,
      isFinished: false,
      token: '',
      version: '',
      trialUrl: '',
      url: ''
    }
  },
  watch: {
    visible(v) {
      this.dialogVisible = !!v
    },
    source: {
      deep: true,
      handler(v) {
        v && this.loadData()
      }
    }
  },
  methods: {
    setTimer() {
      this.timer = setInterval(() => {
        this.getAgentStatus()
      }, 10000)
    },
    clearTimer() {
      this.timer && clearInterval(this.timer)
    },
    getAgentStatus() {
      let filter = {
        where: {
          id: this.agentId
        },
        limit: 10
      }
      this.$axios.get('api/tcm/agent?filter=' + encodeURIComponent(JSON.stringify(filter))).then(data => {
        this.isFinished = data?.items[0]?.status === 'Running'
      })
    },
    loadData() {
      let data = Object.assign({}, this.source)
      this.agentId = data.agentId
      // this.dialogVisible = true
      data.deployInfo.links.forEach(el => {
        if (el?.os === 'AliComputenest') {
          this.trialUrl = el?.trialUrl
          this.url = el?.url
        }
        this[el.os + 'Link'] = el.command
      })
      this.downloadUrl = data.deployInfo?.downloadUrl
      this.token = data.deployInfo?.token || ''
      this.version = data.deployInfo?.version || ''
      this.getAgentStatus()
      this.setTimer()
      $once(this, 'hook:beforeDestroy', () => {
        this.clearTimer()
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
        name: 'connections'
      })
    },
    toWorkbench() {
      this.closeModal()
      this.$router.push({
        name: 'Workbench'
      })
    },
    getImg(name) {
      return require(`../../../public/images/agent/${name}.png`)
    },
    recordUserBehavior() {
      Cookie.set('deployLater', 1)
      let user = window.__USER_INFO__
      Cookie.set('deployLaterUser', user.userId)
      this.closeModal()
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
  overflow: auto;
  .page-main {
    margin: 0 48px;
    box-sizing: border-box;

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
      font-size: 16px;
      font-weight: 500;
      line-height: 21px;
      letter-spacing: 0px;
      text-align: left;
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
      font-size: 16px;
      font-weight: 500;
      line-height: 21px;
      letter-spacing: 0px;
      text-align: left;
    }
    .down-type {
      padding: 16px 0 16px 0;
    }
    .down-type,
    .agent_download_status_btn,
    .url-btn {
      div {
        position: relative;
        display: inline-block;
        overflow: hidden;
        margin-right: 20px;
        padding: 10px 50px;
        font-size: 12px;
        cursor: pointer;
        color: map-get($iconFillColor, normal);
        background: map-get($bgColor, main);
        border-radius: 4px;
        &:hover {
          background-color: #e5e8ee;
          border-color: #e5e8ee;
        }
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
.agent_download_status_btn {
  div {
    position: relative;
    display: inline-block;
    overflow: hidden;
    margin-right: 20px;
    padding: 5px 20px;
    font-size: 12px;
    cursor: pointer;
    color: map-get($iconFillColor, normal);
    background: map-get($bgColor, main);
    border-radius: 4px;
    &:hover {
      background-color: #e5e8ee;
      border-color: #e5e8ee;
    }
  }
  .active {
    border: 1px solid map-get($color, primary);
    background-color: map-get($color, primary);
    color: #fff;
  }
}
.content {
  overflow: auto;
  max-height: 400px;
  padding-right: 30px;
}
.agent_download_status_icon {
  margin-right: 315px;
}
.agent_download_status_btn {
  margin-right: 65px;
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
    .el-dialog__footer {
      padding: 10px 0;
    }
    .el-dialog__body {
      padding: 30px 20px 0 30px;
    }
  }
}
</style>
