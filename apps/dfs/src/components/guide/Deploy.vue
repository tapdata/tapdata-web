<script>
import i18n from '@/i18n'
import { VIcon } from '@tap/component'

export default {
  name: 'Account',
  inject: ['buried'],
  components: { VIcon },
  props: ['agentId'],
  data() {
    return {
      downLoadType: '',
      showTooltip: false,
      showAllCode: true,
      downloadUrl: '',
      token: '',
      version: '',
      links: {},
      downType: [
        { name: 'Linux (64 bit)', value: 'linux' },
        { name: 'Docker', value: 'docker' },
        { name: 'Windows (64 bit)', value: 'windows' }
      ],
      textMap: {
        linux: i18n.t('dfs_guide_deploy_qingfuzhixiafang2'),
        docker: i18n.t('dfs_guide_deploy_wanchengdoc'),
        windows: i18n.t('dfs_guide_deploy_qingfuzhixiafang')
      }
    }
  },
  mounted() {
    this.getUrl()
  },
  methods: {
    getUrl() {
      this.$axios.get('api/tcm/productRelease/deploy/' + this.agentId).then(async data => {
        this.downloadUrl = data.downloadUrl || ''
        this.token = data.token || ''
        this.version = data.version || ''
        let links = data.links || []
        links.forEach(el => {
          this.links[el.os] = el.command
        })
        this.$nextTick(() => {
          this.downLoadType = 'linux'
        })
      })
    },
    onCopy() {
      this.showTooltip = true
    },
    handleCopy() {
      const MAP = {
        Linux: 'copyTokenInLinux',
        Docker: 'copyTokenInDocker',
        windows: 'copyTokenInWindows',
        AliComputenest: 'copyTokenInAliComputenest'
      }
      this.buried(MAP[this.downLoadType])
    },
    // windows下载
    handleDownLoad() {
      window.location = `${this.downloadUrl}tapdata.exe`
      this.buried('downloadTapdataExe')
    },
    //windows 下载
    handleDownLoadApplication() {
      window.location = location.origin + location.pathname + 'api/tcm/agent/' + this.$route.query?.id + '/config'
    }
  }
}
</script>

<template>
  <div class="account">
    <div class="fs-6 font-color-dark fw-sub mb-4 mt-4">
      <span> {{ $t('dfs_components_taskalarmtour_deployment_zhunbei') }}</span>
      <el-link
        type="primary"
        class="fs-6 align-top ml-2"
        href="https://salesiq.zoho.com.cn/signaturesupport.ls?widgetcode=39c2c81d902fdf4fbcc9b55f1268168c6d58fe89b1de70d9adcb5c4c13d6ff4d604d73c57c92b8946ff9b4782f00d83f"
        >{{ $t('dfs_components_taskalarmtour_deployment_zixun') }}</el-link
      >
    </div>
    <div class="fw-sub font-color-dark mt-4">{{ $t('dfs_components_taskalarmtour_deployment_anpai') }}</div>
    <ElRadioGroup v-model="downLoadType" class="flex gap-4 mt-4 mb-4">
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
    <div class="fw-sub font-color-dark mt-4">{{ $t('agent_deploy_start_install') }}</div>
    <div v-if="downLoadType === 'windows'">
      <ul class="pt-5 ul-style">
        <li class="flex justify-content-start align-items-center">
          {{ $t('agent_deploy_start_install_windows_first') }}
          <ElLink class="mt-2 mr-2" type="primary" @click="handleDownLoad">{{
            $t('agent_deploy_start_install_windows_first_download')
          }}</ElLink>
          {{ $t('dfs_agent_download_fastdownload_he')
          }}<ElLink class="mt-2 mr-2" type="primary" @click="handleDownLoadApplication">application.yml </ElLink>
        </li>
        <li class="mt-3">{{ $t('dfs_agent_download_fastdownload_jiangwenjianta') }}</li>
        <li class="mt-3">{{ $t('dfs_agent_download_fastdownload_shuangjizhixingt') }}</li>
      </ul>
    </div>
    <section v-else>
      <div class="font-color-light fw-normal mt-4 mb-2">{{ textMap[downLoadType] }}</div>
      <div class="my-2 mt-4 text-style">
        <ElTooltip
          placement="top"
          manual
          :content="$t('agent_deploy_start_install_button_copied')"
          popper-class="copy-tooltip"
          :value="showTooltip"
        >
          <el-button
            type="primary"
            class="operaKey"
            v-clipboard:copy="links[downLoadType]"
            v-clipboard:success="onCopy"
            @mouseleave="showTooltip = false"
            @click="handleCopy"
          >
            <VIcon class="mr-2">copy</VIcon>
            <i>{{ $t('public_button_copy') }}</i>
          </el-button>
        </ElTooltip>
      </div>
      <div class="box title-text my-2 mt-4" :class="{ 'overflow-hidden': showAllCode }">
        <span class="link-line" :class="{ 'hidden-all-code': showAllCode }">{{ links[downLoadType] }}</span>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.hidden-all-code {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  display: inline-block;
  width: 100%;
}
.fast-icon {
  -moz-transform: rotate(-180deg);
  -webkit-transform: rotate(-180deg);
}
.down-show-code {
  border: 1px solid #f3f3f3;
  border-top: none;
}
.title-text {
  line-height: 22px;
  color: #fff;
}
.link-line {
  word-break: break-all;
}
.box {
  padding: 10px 20px;
  background: var(--unnamed, #333c4a);
}
</style>
