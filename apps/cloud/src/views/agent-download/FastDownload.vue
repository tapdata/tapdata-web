<script>
import TheHeader from '@/components/layout/Header.vue'

import i18n from '@/i18n'
export default {
  name: 'FastDownload',
  components: { TheHeader },
  inject: ['buried'],
  data() {
    return {
      downLoadType: 'Linux',
      downType: [
        { name: 'Linux (64 bit)', value: 'Linux' },
        { name: 'Docker', value: 'Docker' },
        { name: 'Windows (64 bit)', value: 'windows' },
        {
          name: i18n.t('dfs_agent_download_agentdownloadmodal_aliyunjisuan'),
          value: 'AliComputenest',
        },
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
      agentId: '',
      timer: null,
      activeName: '1',
      showAllCode: true,
    }
  },
  created() {
    this.getUrl()
    if (!this.$store.state.config?.disabledOnlineChat) {
      this.loadChat()
    }
    if (this.$store.state.config?.disabledAlibabaCloudComputingNest) {
      this.downType = [
        { name: 'Linux (64 bit)', value: 'Linux' },
        { name: 'Docker', value: 'Docker' },
        { name: 'Windows (64 bit)', value: 'windows' },
      ]
    }
    this.getInstance()
  },
  unmounted() {
    this.timer = null
    clearTimeout(this.timer)
  },
  methods: {
    //获取当前实例状态
    getInstance() {
      this.timer = null
      clearTimeout(this.timer)
      this.$axios.get(`api/tcm/agent/${this.$route.query?.id}`).then((data) => {
        if (data?.status !== 'Creating') {
          this.timer = null
          clearTimeout(this.timer)
          this.open(data?.status)
        } else {
          const self = this
          this.timer = setTimeout(function () {
            self.getInstance()
          }, 5000)
        }
      })
    },
    open(status) {
      this.$confirm(
        this.$t('task_mapping_dialog_hint'),
        status !== 'Running'
          ? this.$t('dfs_agent_down_tishi')
          : this.$t('dfs_agent_down_tishi_running'),
        {
          confirmButtonText: this.$t('dfs_agent_down_goback'),
          showCancelButton: false,
        },
      ).then(() => {
        this.$router.push('/instance')
      })
    },
    getUrl() {
      this.$axios
        .get(`api/tcm/productRelease/deploy/${this.$route.query?.id}`)
        .then(async (data) => {
          this.downloadUrl = data.downloadUrl || ''
          this.token = data.token || ''
          this.version = data.version || ''
          const links = data.links || []
          links.forEach((el) => {
            if (el?.os === 'AliComputenest') {
              this.trialUrl = el?.trialUrl
              this.url = el?.url
            }
            this[`${el.os}Link`] = el.command
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
      window.location = `${location.origin + location.pathname}api/tcm/agent/${
        this.$route.query?.id
      }/config`
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
        '_blank',
      )
    },
    windowsToAgent() {
      window.open('https://sourl.cn/MK6mXF', '_blank')
    },
    linuxToJava() {
      window.open(
        'https://www.yuque.com/tapdata/cloud/chan-pin-shou-ce_shi-li-guan-li_xia-zai-an-zhuang_linux-huan-jing-xia-zai-yu-an-zhuang#46215ffa',
        '_blank',
      )
    },
    linuxToAgent() {
      window.open('https://docs.tapdata.io/user-guide/manage-agent/', '_blank')
    },
    dockerToInstall() {
      window.open('https://docs.docker.com/get-docker/', '_blank')
    },
    dockerToAgent() {
      window.open('https://docs.tapdata.io/user-guide/manage-agent/', '_blank')
    },
    //在线小助手
    hideCustomTip() {
      setTimeout(() => {
        const tDom = document.querySelector('#titlediv')
        if (tDom) {
          tDom.style.display = 'none'
        } else {
          this.hideCustomTip()
        }
      }, 5000)
    },
    loadChat() {
      const $zoho = $zoho || {}
      $zoho.salesiq = $zoho.salesiq || {
        widgetcode:
          '39c2c81d902fdf4fbcc9b55f1268168c6d58fe89b1de70d9adcb5c4c13d6ff4d604d73c57c92b8946ff9b4782f00d83f',
        values: {},
        ready() {},
      }
      window.$zoho = $zoho
      const d = document
      const s = d.createElement('script')
      s.type = 'text/javascript'
      s.id = 'zsiqscript'
      s.defer = true
      s.src = 'https://salesiq.zoho.com.cn/widget'
      const t = d.querySelectorAll('script')[0]
      t.parentNode.insertBefore(s, t)
      this.hideCustomTip()

      $zoho.salesiq.ready = function () {
        const user = window.__USER_INFO__
        $zoho.salesiq.visitor.contactnumber(user.telephone)
        $zoho.salesiq.visitor.info({
          tapdata_username: user.nickname || user.username,
          tapdata_phone: user.telephone,
          tapdata_email: user.email,
        })
      }
    },
    handleCopy() {
      const MAP = {
        Linux: 'copyTokenInLinux',
        Docker: 'copyTokenInDocker',
        windows: 'copyTokenInWindows',
        AliComputenest: 'copyTokenInAliComputenest',
      }
      this.buried(MAP[this.downLoadType])
    },
  },
}
</script>

<template>
  <section :class="['fast-download', 'down-page']">
    <TheHeader />
    <main class="page-main block">
      <div class="title">{{ $t('agent_deploy_title') }}</div>
      <p class="title-text box link-line my-2">
        {{ $t('agent_deploy_select_tip') }}
      </p>
      <div class="text-style mt-6">
        {{ $t('dfs_agent_download_agentdownloadmodal_yaoanzhuangAg') }}
      </div>
      <ElRadioGroup
        v-model="downLoadType"
        class="flex gap-4 mt-4 mb-4"
        @input="chooseDownLoadType"
      >
        <ElRadio
          v-for="(item, index) in downType"
          :key="index"
          :label="item.value"
          border
          class="rounded-4 subscription-radio m-0 position-relative"
        >
          <span>{{ item.name }}</span>
        </ElRadio>
      </ElRadioGroup>
      <template v-if="downLoadType === 'windows'">
        <el-collapse v-model="activeName">
          <el-collapse-item
            :title="$t('dfs_agent_download_fastdownload_shiyongpeizhiwen')"
            name="1"
          >
            <ul class="pt-5 ul-style">
              <li>
                <div class="my-5 text-style">
                  {{ $t('agent_deploy_start_install') }}
                </div>
              </li>
              <li class="flex align-items-center">
                <span class="mr-2">{{
                  $t('agent_deploy_start_install_windows_first')
                }}</span>
                <ElLink type="primary" @click="handleDownLoad">{{
                  $t('agent_deploy_start_install_windows_first_download')
                }}</ElLink>
                <span class="mx-2">{{
                  $t('dfs_agent_download_fastdownload_he')
                }}</span>
                <ElLink type="primary" @click="handleDownLoadApplication"
                  >application.yml
                </ElLink>
              </li>
              <li class="mt-3">
                {{ $t('dfs_agent_download_fastdownload_jiangwenjianta') }}
              </li>
              <li class="mt-3">
                {{ $t('dfs_agent_download_fastdownload_shuangjizhixingt') }}
              </li>
            </ul>
          </el-collapse-item>
          <el-collapse-item
            :title="$t('dfs_agent_download_fastdownload_fuzhiTok')"
            name="2"
          >
            <ul class="pt-5 ul-style">
              <!--          <li class="flex">-->
              <!--            <span>{{ $t('agent_deploy_before_prepare_windows_first') }}</span>-->
              <!--            <ElLink class="ml-3" type="primary" @click="windowsToJava">{{-->
              <!--              $t('agent_deploy_before_prepare_windows_first_link')-->
              <!--            }}-->
              <!--          </li>-->
              <!--          <li>{{ $t('agent_deploy_before_prepare_windows_second') }}</li>-->
              <!--          <li>{{ $t('agent_deploy_before_prepare_windows_third') }}</li>-->
              <!--          <li>{{ $t('agent_deploy_before_prepare_windows_four') }}</li>-->
              <!--          <li>-->
              <!--            <ElButton class="mt-5" type="primary" @click="handleDownLoad">{{-->
              <!--              $t('agent_deploy_before_prepare_windows_second_download')-->
              <!--            }}-->
              <!--          </li>-->
              <li>
                <div class="my-5 text-style">
                  {{ $t('agent_deploy_start_install') }}
                </div>
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
                <ElTooltip
                  placement="top"
                  manual
                  :content="$t('agent_deploy_start_install_button_copied')"
                  popper-class="copy-tooltip"
                  :visible="showTooltip"
                >
                  <el-button
                    v-clipboard:copy="windowsLink"
                    v-clipboard:success="onCopy"
                    class="operaKey"
                    type="primary"
                    @mouseleave="showTooltip = false"
                    @click="handleCopy"
                  >
                    <VIcon class="mr-2">copy</VIcon>
                    <i>{{ $t('public_button_copy') }}</i>
                  </el-button>
                </ElTooltip>
              </li>
              <li
                class="box title-text mt-2"
                :class="{ 'overflow-hidden': showAllCode }"
              >
                <span
                  class="link-line"
                  :class="{ 'hidden-all-code': showAllCode }"
                  >{{ windowsLink }}</span
                >
              </li>
              <div
                v-if="showAllCode"
                class="down-show-code text-center cursor-pointer color-primary bg-white mt-2 pb-2"
                @click="handleShowAllCode(false)"
              >
                <VIcon class="mr-2">arrow-down-fill</VIcon
                ><span>{{
                  $t('dfs_agent_download_fastdownload_xianshiwanzhengming')
                }}</span>
              </div>
              <div
                v-else
                class="down-show-code text-center cursor-pointer bg-white mt-2 pb-2"
                @click="handleShowAllCode(true)"
              >
                <VIcon class="mr-2 fast-icon">arrow-down-fill</VIcon
                >{{ $t('dfs_agent_download_fastdownload_yincangwanzhengming') }}
              </div>
              <li class="mt-3">
                <span>{{
                  $t('agent_deploy_start_install_windows_fifth')
                }}</span>
              </li>
            </ul>
          </el-collapse-item>
        </el-collapse>
      </template>
      <template v-if="downLoadType === 'Linux'">
        <div class="text-style">
          {{ $t('agent_deploy_before_prepare_title') }}
        </div>
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
            <div class="my-5 text-style">
              {{ $t('agent_deploy_start_install') }}
            </div>
          </li>
          <li>
            {{ $t('agent_deploy_start_install_linux_first') }}
            <ElTooltip
              placement="top"
              manual
              :content="$t('agent_deploy_start_install_button_copied')"
              popper-class="copy-tooltip"
              :visible="showTooltip"
            >
              <el-button
                v-clipboard:copy="linuxLink"
                v-clipboard:success="onCopy"
                type="primary"
                class="operaKey"
                @mouseleave="showTooltip = false"
                @click="handleCopy"
              >
                <VIcon class="mr-2">copy</VIcon>
                <i>{{ $t('public_button_copy') }}</i>
              </el-button>
            </ElTooltip>
          </li>
          <li
            class="li-show-code box title-text my-2"
            :class="{ 'overflow-hidden': showAllCode }"
          >
            <span
              class="link-line"
              :class="{ 'hidden-all-code': showAllCode }"
              >{{ linuxLink }}</span
            >
          </li>
          <div
            v-if="showAllCode"
            class="down-show-code text-center cursor-pointer color-primary bg-white mt-2 pb-2"
            @click="handleShowAllCode(false)"
          >
            <VIcon class="mr-2">arrow-down-fill</VIcon
            ><span>{{
              $t('dfs_agent_download_fastdownload_xianshiwanzhengming')
            }}</span>
          </div>
          <div
            v-else
            class="down-show-code text-center cursor-pointer bg-white mt-2 pb-2"
            @click="handleShowAllCode(true)"
          >
            <VIcon class="mr-2 fast-icon">arrow-down-fill</VIcon
            >{{ $t('dfs_agent_download_fastdownload_yincangwanzhengming') }}
          </div>
          <li>
            <span>{{ $t('agent_deploy_start_install_linux_second') }}</span>
            <img class="mt-2 block" :src="getImg('downloadLinux')" alt="" />
          </li>
          <li class="mt-2">
            <span>{{ $t('agent_deploy_start_install_linux_third') }}</span>
            <ElLink type="primary" @click="linuxToAgent">{{
              $t('agent_deploy_link_agent_operation')
            }}</ElLink>
            <span>{{ $t('agent_deploy_link_agent_operation_desc') }}</span>
          </li>
        </ul>
      </template>
      <template v-if="downLoadType === 'Docker'">
        <div class="text-style">
          {{ $t('agent_deploy_before_prepare_title') }}
        </div>
        <ul class="pt-5 ul-style">
          <li>{{ $t('agent_deploy_before_prepare_docker_first') }}</li>
          <li>
            <span>{{ $t('agent_deploy_before_prepare_docker_second') }}</span>
            <ElLink type="primary" @click="dockerToInstall">{{
              $t('agent_deploy_before_prepare_docker_install_link')
            }}</ElLink>
            <span>{{
              $t('agent_deploy_before_prepare_docker_second_install')
            }}</span>
          </li>
          <li>
            <div class="my-5 text-style">
              {{ $t('agent_deploy_start_install') }}
            </div>
          </li>
          <li>
            {{ $t('agent_deploy_start_install_docker_first') }}
            <ElTooltip
              placement="top"
              manual
              :content="$t('agent_deploy_start_install_button_copied')"
              popper-class="copy-tooltip"
              :visible="showTooltip"
            >
              <el-button
                v-clipboard:copy="dockerLink"
                v-clipboard:success="onCopy"
                type="primary"
                class="operaKey"
                @mouseleave="showTooltip = false"
                @click="handleCopy"
              >
                <VIcon class="mr-2">copy</VIcon>
                <i>{{ $t('public_button_copy') }}</i>
              </el-button>
            </ElTooltip>
          </li>
          <li
            class="box title-text my-2"
            :class="{ 'overflow-hidden': showAllCode }"
          >
            <span
              class="link-line"
              :class="{ 'hidden-all-code': showAllCode }"
              >{{ dockerLink }}</span
            >
          </li>
          <div
            v-if="showAllCode"
            class="down-show-code text-center cursor-pointer color-primary bg-white mt-2 pb-2"
            @click="handleShowAllCode(false)"
          >
            <VIcon class="mr-2">arrow-down-fill</VIcon
            ><span>{{
              $t('dfs_agent_download_fastdownload_xianshiwanzhengming')
            }}</span>
          </div>
          <div
            v-else
            class="down-show-code text-center cursor-pointer bg-white mt-2 pb-2"
            @click="handleShowAllCode(true)"
          >
            <VIcon class="mr-2 fast-icon">arrow-down-fill</VIcon
            >{{ $t('dfs_agent_download_fastdownload_yincangwanzhengming') }}
          </div>
          <li>
            <span>{{ $t('agent_deploy_start_install_docker_second') }}</span>
            <img class="mt-2 block" :src="getImg('downloadDocker')" alt="" />
          </li>
          <li class="flex">
            <span>{{ $t('agent_deploy_start_install_docker_third') }}</span>
            <ElLink type="primary" @click="dockerToAgent">{{
              $t('agent_deploy_link_agent_operation')
            }}</ElLink>
            <span>{{ $t('agent_deploy_link_agent_operation_desc') }}</span>
          </li>
        </ul>
      </template>
      <template v-if="downLoadType === 'AliComputenest'">
        <ul class="ul-style">
          <li>
            <span>{{
              $t('dfs_agent_download_fastdownload_jisuanchaoCo')
            }}</span>
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
            {{ $t('dfs_agent_download_fastdownload_ninkeyixuanze') }}
            <div class="my-4">
              <el-link :href="trialUrl" target="_blank" class="mr-4 url-btn"
                ><div>
                  {{
                    $t('dfs_agent_download_agentdownloadmodal_santianshiyong')
                  }}
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
          <li class="box title-text my-2">
            <span class="link-line">{{ version }}</span>
            <ElTooltip
              placement="top"
              manual
              :content="$t('agent_deploy_start_install_button_copied')"
              popper-class="copy-tooltip"
              :visible="showTooltipVersion"
            >
              <span
                v-clipboard:copy="version"
                v-clipboard:success="onCopyVersion"
                class="operaKey"
                @mouseleave="showTooltipVersion = false"
              >
                <i class="click-style">{{ $t('public_button_copy') }}</i>
              </span>
            </ElTooltip>
          </li>
          <li>
            <div class="my-2 text-style">
              {{ $t('dfs_agent_download_agentdownloadmodal_shilitok') }}
              <ElTooltip
                placement="top"
                manual
                :content="$t('agent_deploy_start_install_button_copied')"
                popper-class="copy-tooltip"
                :visible="showTooltip"
              >
                <el-button
                  v-clipboard:copy="token"
                  v-clipboard:success="onCopy"
                  type="primary"
                  class="operaKey"
                  @mouseleave="showTooltip = false"
                  @click="handleCopy"
                >
                  <VIcon class="mr-2">copy</VIcon>
                  <i>{{ $t('public_button_copy') }}</i>
                </el-button>
              </ElTooltip>
            </div>
          </li>
          <li
            class="box title-text my-2"
            :class="{ 'overflow-hidden': showAllCode }"
          >
            <span
              class="link-line"
              :class="{ 'hidden-all-code': showAllCode }"
              >{{ token }}</span
            >
          </li>
          <div
            v-if="showAllCode"
            class="down-show-code text-center cursor-pointer color-primary bg-white mt-2 pb-2"
            @click="handleShowAllCode(false)"
          >
            <VIcon class="mr-2">arrow-down-fill</VIcon
            ><span>{{
              $t('dfs_agent_download_fastdownload_xianshiwanzhengming')
            }}</span>
          </div>
          <div
            v-else
            class="down-show-code text-center cursor-pointer bg-white mt-2 pb-2"
            @click="handleShowAllCode(true)"
          >
            <VIcon class="mr-2 fast-icon">arrow-down-fill</VIcon
            >{{ $t('dfs_agent_download_fastdownload_yincangwanzhengming') }}
          </div>
          <li>
            {{ $t('dfs_agent_download_agentdownloadmodal_querenjisuanchao') }}
          </li>
          <li>
            <el-image :src="getImg('alicomputenest_instance')" alt="" />
          </li>
          <li class="my-2">
            {{ $t('dfs_agent_download_fastdownload_bushuwanchenghou') }}
          </li>
          <li>
            <el-image :src="getImg('alicomputenest_agent')" alt="" />
          </li>
        </ul>
      </template>
    </main>
    <footer class="footer">
      <ElButton type="primary" @click="handleNextStep()">{{
        $t('public_status_complete')
      }}</ElButton>
    </footer>
  </section>
</template>

<style lang="scss" scoped>
.fast-download {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding-top: 52px;
  overflow: hidden;
  background-color: #fff;
  box-sizing: border-box;
  .page-main {
    width: 100%;
    height: calc(100% - 80px);
    margin: 0 auto;
    padding: 0 16% 100px;
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
      font-size: var(--font-base-title);
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
      color: var(--color-primary);
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
        font-size: var(--font-base-title);
        cursor: pointer;
        color: var(--icon-n2);
        background: var(--bg-main);
        border-radius: 4px;
        &:hover {
          background-color: #e5e8ee;
          border-color: #e5e8ee;
        }
      }
      .active {
        border: 1px solid var(--color-primary);
        background-color: var(--color-primary);
        color: #fff;
      }
    }
    .line {
      margin: 20px 0 0 15px;
      border-left: 3px solid var(--color-primary);
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
      background-color: var(--color-primary);
    }
    .el-button + .el-button:hover {
      background-color: var(--color-lprimary);
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
    display: inline-block;
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

  :deep(.el-collapse-item__header) {
    font-size: 16px;
  }
}
</style>
