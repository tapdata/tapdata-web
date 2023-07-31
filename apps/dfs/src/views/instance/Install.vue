<template>
  <section class="agent-install flex flex-column gap-4 overflow-hidden">
    <div class="bg-white rounded-lg p-4">
      <div class="flex align-center">
        <IconButton @click="$router.push({ name: 'Instance' })">left</IconButton>
        <span class="fs-5 ml-2">部署计算引擎</span>
      </div>
    </div>
    <main class="bg-white rounded-lg px-6 py-4 flex-1 overflow-auto">
      <div class="fs-6 font-color-dark fw-sub mb-4">
        <span> {{ $t('dfs_components_taskalarmtour_deployment_zhunbei') }}</span>
        <el-link
          type="primary"
          class="fs-6 align-top ml-2"
          href="https://salesiq.zoho.com.cn/signaturesupport.ls?widgetcode=39c2c81d902fdf4fbcc9b55f1268168c6d58fe89b1de70d9adcb5c4c13d6ff4d604d73c57c92b8946ff9b4782f00d83f"
          >{{ $t('dfs_components_taskalarmtour_deployment_zixun') }}</el-link
        >
      </div>

      <div class="mb-4">
        <div class="fw-sub mb-2 text-label font-color-dark">{{ $t('dfs_agent_download_type') }}</div>
        <ElRadioGroup v-model="downLoadType" @input="chooseDownLoadType" size="default" class="flex gap-4 mb-4">
          <ElRadio
            v-for="(item, index) in downType"
            :key="index"
            :label="item.value"
            border
            class="payment-radio m-0 px-3 py-0 inline-flex align-center"
          >
            <div class="flex align-center gap-2">
              <VIcon size="24">{{ item.value }}</VIcon>
              <span>{{ item.name }}</span>
            </div>
          </ElRadio>
        </ElRadioGroup>
      </div>

      <div class="text-label fw-sub font-color-dark mb-2">{{ $t('agent_deploy_start_install') }}</div>
      <ul v-if="downLoadType === 'windows'" class="ul-style">
        <li class="flex justify-content-start align-items-center">
          {{ $t('agent_deploy_start_install_windows_first') }}
          <ElLink class="mx-2" type="primary" @click="handleDownLoad">{{
            $t('agent_deploy_start_install_windows_first_download')
          }}</ElLink>
          {{ $t('dfs_agent_download_fastdownload_he')
          }}<ElLink class="mx-2" type="primary" @click="handleDownLoadApplication">application.yml </ElLink>
        </li>
        <li class="mt-3">{{ $t('dfs_agent_download_fastdownload_jiangwenjianta') }}</li>
        <li class="mt-3">{{ $t('dfs_agent_download_fastdownload_shuangjizhixingt') }}</li>
      </ul>
      <section v-else>
        <div class="font-color-light fw-normal mb-4">{{ textMap[downLoadType] }}</div>
        <ElTooltip
          placement="top"
          manual
          :content="$t('agent_deploy_start_install_button_copied')"
          popper-class="copy-tooltip"
          :value="showTooltip"
        >
          <el-button
            type="primary"
            class="operaKey mb-4"
            v-clipboard:copy="links[downLoadType]"
            v-clipboard:success="onCopy"
            @mouseleave.native="showTooltip = false"
            @click="handleCopy"
          >
            <VIcon class="mr-2">copy</VIcon>
            <i>{{ $t('public_button_copy') }}</i>
          </el-button>
        </ElTooltip>
        <div class="box px-4 py-3 rounded-4 text-white text-label ellipsis">
          {{ links[downLoadType] }}
        </div>
      </section>
      <div class="box-card rounded-lg mt-4 flex flex-column justify-content-center align-items-center">
        <template v-if="success">
          <VIcon size="64" class="text-primary">check-circle-fill</VIcon>
          <div class="fs-5 font-color-dark mt-4 mb-2">{{ $t('dfs_agent_deploy_success') }}</div>
          <div class="text-label font-color-light mb-2">{{ $t('dfs_agent_deploy_success_subtitle') }}</div>
        </template>
        <template v-else>
          <div class="dot-pulse mt-2 mb-6"></div>
          <div class="fs-5 font-color-dark mb-2">{{ $t('dfs_guide_index_dengdaibushu') }}</div>
        </template>
      </div>
    </main>
  </section>
</template>
<script>
import i18n from '@/i18n'

import TheHeader from '@/components/the-header'
import { IconButton } from '@tap/component'
export default {
  name: 'Install',
  components: { IconButton },
  inject: ['buried'],
  data() {
    return {
      links: {
        linux: '',
        docker: ''
      },
      downLoadType: 'linux',
      downType: [
        { name: 'Linux (64 bit)', value: 'linux' },
        { name: 'Docker', value: 'docker' },
        { name: 'Windows (64 bit)', value: 'windows' }
      ],
      showTooltip: false,
      showTooltipVersion: false,
      windowsLink: '',
      linuxLink: '',
      dockerLink: '',
      downloadUrl: '',
      token: '',
      version: '',
      trialUrl: '',
      url: '',
      timer: null,
      activeName: '1',
      showAllCode: true,
      textMap: {
        linux: i18n.t('dfs_guide_deploy_qingfuzhixiafang2'),
        docker: i18n.t('dfs_guide_deploy_wanchengdoc'),
        windows: i18n.t('dfs_guide_deploy_qingfuzhixiafang')
      },
      success: false
    }
  },

  computed: {
    agentId() {
      return this.$route.params.id
    }
  },

  created() {
    this.getUrl()
    if (!window.__config__?.disabledOnlineChat) {
      this.loadChat()
    }
    if (window.__config__?.disabledAlibabaCloudComputingNest) {
      this.downType = [
        { name: 'Linux (64 bit)', value: 'Linux' },
        { name: 'Docker', value: 'Docker' },
        { name: 'Windows (64 bit)', value: 'windows' }
      ]
    }
    this.getInstance()
  },
  destroyed() {
    this.timer = null
    clearTimeout(this.timer)
  },
  methods: {
    //获取当前实例状态
    getInstance() {
      this.timer = null
      clearTimeout(this.timer)
      this.$axios.get('api/tcm/agent/' + this.agentId).then(data => {
        if (data?.status !== 'Creating') {
          this.timer = null
          clearTimeout(this.timer)
          this.open(data?.status)
        } else {
          let self = this
          this.timer = setTimeout(function () {
            self.getInstance()
          }, 5000)
        }
      })
    },
    open() {
      this.success = true
      setTimeout(() => {
        this.$router.push('/instance')
      }, 5000)
    },
    getUrl() {
      this.$axios.get('api/tcm/productRelease/deploy/' + this.agentId).then(async data => {
        this.downloadUrl = data.downloadUrl || ''
        this.token = data.token || ''
        this.version = data.version || ''
        let links = data.links || []
        links.forEach(el => {
          this.links[el.os] = el.command
        })
      })
    },
    // windows下载
    handleDownLoad() {
      window.location = `${this.downloadUrl}tapdata.exe`
      this.buried('downloadTapdataExe')
    },
    //windows 下载
    handleDownLoadApplication() {
      window.location = location.origin + location.pathname + 'api/tcm/agent/' + this.agentId + '/config'
    },
    // 选择下载安装类型
    chooseDownLoadType(val) {
      this.downLoadType = val
    },
    //显示隐藏完整命令
    handleShowAllCode(type) {
      this.showAllCode = type
    },
    // 复制命令行
    onCopy() {
      this.showTooltip = true
    },
    // 复制命令行
    onCopyVersion() {
      this.showTooltipVersion = true
    },
    handleNextStep() {
      clearTimeout(this.timer)
      this.$router.push({ name: 'Instance' })
    },
    getImg(name) {
      return require(`../../../public/images/agent/${name}.png`)
    },
    windowsToJava() {
      window.open(
        'https://www.yuque.com/tapdata/cloud/chan-pin-shou-ce_shi-li-guan-li_xia-zai-an-zhuang_windows-huan-jing-xia-zai-yu-an-zhuang#MjqcX',
        '_blank'
      )
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
    linuxToAgent() {
      window.open('https://docs.tapdata.io/cloud/user-guide/manage-agent/', '_blank')
    },
    dockerToInstall() {
      window.open('https://docs.docker.com/get-docker/', '_blank')
    },
    dockerToAgent() {
      window.open('https://docs.tapdata.io/cloud/user-guide/manage-agent/', '_blank')
    },
    //在线小助手
    hideCustomTip() {
      setTimeout(() => {
        let tDom = document.getElementById('titlediv')
        if (tDom) {
          tDom.style.display = 'none'
        } else {
          this.hideCustomTip()
        }
      }, 5000)
    },
    loadChat() {
      let $zoho = $zoho || {}
      $zoho.salesiq = $zoho.salesiq || {
        widgetcode: '39c2c81d902fdf4fbcc9b55f1268168c6d58fe89b1de70d9adcb5c4c13d6ff4d604d73c57c92b8946ff9b4782f00d83f',
        values: {},
        ready: function () {}
      }
      window.$zoho = $zoho
      let d = document
      let s = d.createElement('script')
      s.type = 'text/javascript'
      s.id = 'zsiqscript'
      s.defer = true
      s.src = 'https://salesiq.zoho.com.cn/widget'
      let t = d.getElementsByTagName('script')[0]
      t.parentNode.insertBefore(s, t)
      this.hideCustomTip()

      $zoho.salesiq.ready = function () {
        const user = window.__USER_INFO__
        $zoho.salesiq.visitor.contactnumber(user.telephone)
        $zoho.salesiq.visitor.info({
          tapdata_username: user.nickname || user.username,
          tapdata_phone: user.telephone,
          tapdata_email: user.email
        })
      }
    },
    handleCopy() {
      const MAP = {
        linux: 'copyTokenInLinux',
        docker: 'copyTokenInDocker',
        windows: 'copyTokenInWindows'
      }
      this.buried(MAP[this.downLoadType])
    }
  }
}
</script>
<style lang="scss" scoped>
.text-label {
  font-size: 0.875rem;
  line-height: 22px;
}
.agent-install {
  .title {
    padding-top: 60px;
    font-size: 28px !important;
    font-weight: bold;
    color: #333;
    text-align: center;
  }
  .title-text {
    line-height: 22px;
    font-size: $fontBaseTitle;
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
      font-size: 14px;
    }
  }
  .link-line {
    word-break: break-all;
  }
  .box {
    background: var(--unnamed, #333c4a);
  }
  .box.title-text {
    padding: 10px 20px;
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
  .url-btn {
    div {
      position: relative;
      display: inline-block;
      overflow: hidden;
      margin-right: 20px;
      padding: 10px 50px;
      font-size: $fontBaseTitle;
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

  .wx-img {
    position: fixed;
    right: 40px;
    bottom: 100px;
    padding: 4px;
    border: 1px solid #dcdcdc;
    background-color: #fff;
    width: 220px;
  }
  .fast-icon {
    -moz-transform: rotate(-180deg);
    -webkit-transform: rotate(-180deg);
  }
  .hidden-all-code {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    width: 100%;
  }
  .li-show-code {
    border: 1px solid #f3f3f3;
    border-bottom: none;
  }
  .down-show-code {
    border: 1px solid #f3f3f3;
    border-top: none;
  }
  ::v-deep {
    .el-collapse-item__header {
      font-size: $fontSubtitle;
    }
  }
}
</style>