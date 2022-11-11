<template>
  <section :class="['fast-download', 'down-page']">
    <TheHeader></TheHeader>
    <main class="page-main block">
      <div class="title">{{ $t('agent_deploy_title') }}</div>
      <p class="title-text box link-line my-2">
        {{ $t('agent_deploy_select_tip') }}
      </p>
      <div class="text-style mt-6">{{$t('dfs_agent_download_agentdownloadmodal_yaoanzhuangAg')}}</div>
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
        <ul class="pt-5 ul-style">
          <!--          <li class="flex">-->
          <!--            <span>{{ $t('agent_deploy_before_prepare_windows_first') }}</span>-->
          <!--            <ElLink class="ml-3" type="primary" @click="windowsToJava">{{-->
          <!--              $t('agent_deploy_before_prepare_windows_first_link')-->
          <!--            }}</ElLink>-->
          <!--          </li>-->
          <!--          <li>{{ $t('agent_deploy_before_prepare_windows_second') }}</li>-->
          <!--          <li>{{ $t('agent_deploy_before_prepare_windows_third') }}</li>-->
          <!--          <li>{{ $t('agent_deploy_before_prepare_windows_four') }}</li>-->
          <!--          <li>-->
          <!--            <ElButton class="mt-5" type="primary" @click="handleDownLoad">{{-->
          <!--              $t('agent_deploy_before_prepare_windows_second_download')-->
          <!--            }}</ElButton>-->
          <!--          </li>-->
          <li>
            <div class="my-5 text-style">{{ $t('agent_deploy_start_install') }}</div>
          </li>
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
        <div class="text-style">{{ $t('agent_deploy_before_prepare_title') }}</div>
        <ul class="pt-5 ul-style">
          <li>
            <span>{{ $t('agent_deploy_before_prepare_linux_first') }}</span>
            <ElLink type="primary" @click="linuxToJava">{{
              $t('agent_deploy_before_prepare_linux_first_link')
            }}</ElLink>
          </li>
          <li>{{ $t('agent_deploy_before_prepare_linux_second') }}</li>
          <li>{{ $t('agent_deploy_before_prepare_linux_third') }}</li>
          <li>
            <div class="my-5 text-style">{{ $t('agent_deploy_start_install') }}</div>
          </li>
          <li>{{ $t('agent_deploy_start_install_linux_first') }}</li>
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
            <span>{{ $t('agent_deploy_start_install_linux_second') }}</span>
            <img class="mt-2 block" :src="getImg('downloadLinux')" alt="" />
          </li>
          <li>
            <span>{{ $t('agent_deploy_start_install_linux_third') }}</span>
            <ElLink type="primary" @click="linuxToAgent">{{ $t('agent_deploy_link_agent_operation') }}</ElLink>
            <span>{{ $t('agent_deploy_link_agent_operation_desc') }}</span>
          </li>
        </ul>
      </template>
      <template v-if="downLoadType === 'Docker'">
        <div class="text-style">{{ $t('agent_deploy_before_prepare_title') }}</div>
        <ul class="pt-5 ul-style">
          <li>{{ $t('agent_deploy_before_prepare_docker_first') }}</li>
          <li>
            <span>{{ $t('agent_deploy_before_prepare_docker_second') }}</span>
            <ElLink type="primary" @click="dockerToInstall">{{
              $t('agent_deploy_before_prepare_docker_install_link')
            }}</ElLink>
            <span>{{ $t('agent_deploy_before_prepare_docker_second_install') }}</span>
          </li>
          <li>
            <div class="my-5 text-style">{{ $t('agent_deploy_start_install') }}</div>
          </li>
          <li>{{ $t('agent_deploy_start_install_docker_first') }}</li>
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
            <span>{{ $t('agent_deploy_start_install_docker_second') }}</span>
            <img class="mt-2 block" :src="getImg('downloadDocker')" alt="" />
          </li>
          <li class="flex">
            <span>{{ $t('agent_deploy_start_install_docker_third') }}</span>
            <ElLink type="primary" @click="dockerToAgent">{{ $t('agent_deploy_link_agent_operation') }}</ElLink>
            <span>{{ $t('agent_deploy_link_agent_operation_desc') }}</span>
          </li>
        </ul>
      </template>
      <template v-if="downLoadType === 'AliComputenest'">
        <ul class="ul-style">
          <li>
            <span
              >{{$t('dfs_agent_download_fastdownload_jisuanchaoCo')}}</span
            >
          </li>
          <li>
            <div class="my-5 text-style">{{$t('agent_deploy_before_prepare_title')}}</div>
          </li>
          <li>{{$t('dfs_agent_download_agentdownloadmodal_zhunbeiguanliyun')}}</li>
          <li>
            <div class="my-5 text-style">{{$t('agent_deploy_start_install')}}</div>
          </li>
          <li>{{$t('dfs_agent_download_fastdownload_ninkeyixuanze')}}<div class="my-4">
              <el-link :href="trialUrl" target="_blank" class="mr-4 url-btn"><div>{{$t('dfs_agent_download_agentdownloadmodal_santianshiyong')}}</div></el-link>
              <el-link :href="url" target="_blank" class="url-btn"><div>{{$t('dfs_agent_download_agentdownloadmodal_fufeibushu')}}</div></el-link>
            </div>
          </li>
          <li>{{$t('dfs_agent_download_agentdownloadmodal_womenyijingwei')}}</li>
          <li>
            <div class="my-2 text-style">{{$t('dfs_agent_download_agentdownloadmodal_shilibanben')}}</div>
          </li>
          <li class="box title-text my-2">{{ version }}</li>
          <li>
            <div class="my-2 text-style">{{$t('dfs_agent_download_agentdownloadmodal_shilitok')}}</div>
          </li>
          <li class="box title-text link-line my-2">
            {{ token }}
          </li>
          <li>{{$t('dfs_agent_download_agentdownloadmodal_querenjisuanchao')}}</li>
          <li>
            <el-image :src="getImg('alicomputenest_instance')" alt="" />
          </li>
          <li class="my-2">{{$t('dfs_agent_download_fastdownload_bushuwanchenghou')}}</li>
          <li>
            <el-image :src="getImg('alicomputenest_agent')" alt="" />
          </li>
        </ul>
      </template>
    </main>
    <footer class="footer">
      <ElButton type="primary" @click="handleNextStep()">{{ $t('button_finish') }}</ElButton>
    </footer>
  </section>
</template>
<script>
import i18n from '@/i18n'

import TheHeader from '@/components/the-header'
export default {
  name: 'FastDownload',
  components: { TheHeader },
  data() {
    return {
      downLoadType: 'Linux',
      downType: [
        { name: 'Linux (64 bit)', value: 'Linux' },
        { name: 'Docker', value: 'Docker' },
        { name: 'Windows (64 bit)', value: 'windows' },
        { name: i18n.t('dfs_agent_download_agentdownloadmodal_aliyunjisuan'), value: 'AliComputenest' }
      ],
      showTooltip: false,
      windowsLink: '',
      linuxLink: '',
      dockerLink: '',
      downloadUrl: '',
      token: '',
      version: '',
      trialUrl: '',
      url: '',
      agentId: ''
    }
  },
  created() {
    this.getUrl()
    this.loadChat()
  },
  methods: {
    getUrl() {
      this.$axios.get('api/tcm/productRelease/deploy/' + this.$route.query?.id).then(async data => {
        this.downloadUrl = data.downloadUrl || ''
        this.token = data.token || ''
        this.version = data.version || ''
        let links = data.links || []
        links.forEach(el => {
          if (el?.os === 'AliComputenest') {
            this.trialUrl = el?.trialUrl
            this.url = el?.url
          }
          this[el.os + 'Link'] = el.command
        })
      })
    },
    // windows下载
    handleDownLoad() {
      window.location = `${this.downloadUrl}tapdata.exe`
    },
    // 选择下载安装类型
    chooseDownLoadType(val) {
      this.downLoadType = val
    },
    // 复制命令行
    onCopy() {
      this.showTooltip = true
    },
    handleNextStep() {
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
      window.open('https://sourl.cn/MK6mXF', '_blank')
    },
    dockerToInstall() {
      window.open('https://docs.docker.com/get-docker/', '_blank')
    },
    dockerToAgent() {
      window.open('https://sourl.cn/MK6mXF', '_blank')
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
  padding-top: 68px;
  overflow: hidden;
  background-color: #fff;
  box-sizing: border-box;
  .page-main {
    width: 100%;
    height: calc(100% - 80px);
    margin: 0 auto;
    padding: 0 20% 100px;
    box-sizing: border-box;
    overflow: auto;

    .title {
      padding-top: 60px;
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
  .footer {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 80px;
    margin: auto;
    border-top: 1px solid #dedee4;
    background-color: #fff;
    .el-button {
      width: 250px;
      height: 42px;
      font-size: 14px;
    }
    .el-button + .el-button {
      margin-left: 30px;
      background-color: map-get($color, primary);
    }
    .el-button + .el-button:hover {
      background-color: map-get($color, lprimary);
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
}
</style>
