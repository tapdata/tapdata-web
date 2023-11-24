<script>
import { mapGetters } from 'vuex'
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
      },
      isCompleted: false
    }
  },
  computed: {
    ...mapGetters(['isDomesticStation'])
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
      this.$emit('behavior', `copy_${this.downLoadType}`)
    },
    // windows下载
    handleDownLoad() {
      window.location = `${this.downloadUrl}tapdata.exe`
      this.buried('downloadTapdataExe')
      this.$emit('behavior', `download_agent`)
    },
    //windows 下载
    handleDownLoadApplication() {
      window.location = location.origin + location.pathname + 'api/tcm/agent/' + this.agentId + '/config'
      this.$emit('behavior', `download_yml`)
    },
    handleOpenDeployDocs() {
      this.buried('openDeploymentTutorial', {
        downLoadType: this.downLoadType
      })
      let href = `https://docs.tapdata.${
        !this.$store.getters.isDomesticStation || this.$i18n.locale === 'en' ? 'io' : 'net'
      }/cloud/quick-start/install-agent/agent-on-selfhosted/`
      window.open(href, '_blank')
    },
    handleComplete() {
      this.isCompleted = true
      this.buried('completedDeployment', {
        downLoadType: this.downLoadType
      })
    }
  }
}
</script>

<template>
  <div class="account">
    <div class="fs-6 font-color-dark fw-sub mb-4 mt-4">
      <span> {{ $t('dfs_components_taskalarmtour_deployment_zhunbei') }}</span>
      <el-link
        v-if="isDomesticStation"
        type="primary"
        class="fs-6 align-top ml-2"
        href="https://salesiq.zoho.com.cn/signaturesupport.ls?widgetcode=39c2c81d902fdf4fbcc9b55f1268168c6d58fe89b1de70d9adcb5c4c13d6ff4d604d73c57c92b8946ff9b4782f00d83f"
        >{{ $t('dfs_components_taskalarmtour_deployment_zixun') }}
      </el-link>
    </div>
    <div class="fw-sub font-color-dark mt-4">1. {{ $t('dfs_select_server_type') }}</div>
    <ElRadioGroup v-model="downLoadType" class="flex gap-4 mt-4 mb-4">
      <ElRadio
        v-for="(item, index) in downType"
        :key="index"
        :label="item.value"
        border
        class="rounded-4 m-0 px-3 py-0 inline-flex align-center"
      >
        <div class="flex align-center gap-2">
          <VIcon size="24">{{ item.value }}</VIcon>
          <span>{{ item.name }}</span>
        </div>
      </ElRadio>
    </ElRadioGroup>
    <div class="fw-sub font-color-dark mt-4 flex align-center">
      2. {{ $t('agent_deploy_start_install') }}:
      <ElLink @click="handleOpenDeployDocs" class="ml-1" type="primary">{{ $t('agent_deploy_tutorial') }}</ElLink>
    </div>
    <div v-if="downLoadType === 'windows'">
      <ul class="pt-5 ul-style">
        <li class="flex justify-content-start align-center">
          {{ $t('agent_deploy_start_install_windows_first') }}
          <ElLink class="mx-1" type="primary" @click="handleDownLoad"
            >{{ $t('agent_deploy_start_install_windows_first_download') }}
          </ElLink>
          {{ $t('dfs_agent_download_fastdownload_he') }}
          <ElLink class="mx-1" type="primary" @click="handleDownLoadApplication">application.yml</ElLink>
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
            @mouseleave.native="showTooltip = false"
            @click="handleCopy"
          >
            <VIcon class="mr-2">copy</VIcon>
            <i>{{ $t('public_button_copy') }}</i>
          </el-button>
        </ElTooltip>
      </div>
      <div
        class="box rounded-4 title-text my-2 mt-4 user-select-all"
        :class="{ 'overflow-hidden': showAllCode }"
        @copy="handleCopy"
      >
        <span class="link-line align-top" :class="{ 'hidden-all-code': showAllCode }">{{ links[downLoadType] }}</span>
      </div>
    </section>
    <div class="box-card rounded-lg mt-4 flex flex-column justify-content-center align-items-center">
      <template v-if="isCompleted">
        <div class="dot-pulse mt-2 mb-6"></div>
        <!--检测提示-->
        <div class="font-color-light">{{ $t('dfs_guide_index_zhengzaijianceyin') }}</div>
      </template>
      <template v-else>
        <!--等待部署-->
        <div class="fs-5 font-color-dark mb-2">{{ $t('dfs_guide_index_dengdaibushu') }}</div>
        <!--等待提示-->
        <div class="font-color-light">{{ $t('dfs_guide_index_waiting_for_deployment_tip') }}</div>

        <ElButton
          class="mt-4"
          plain
          size="default"
          type="primary"
          :disabled="activeKey === 'Scenes' && !scenes.length"
          @click="handleComplete"
          >{{ $t('dfs_guide_index_development_complete') }}
        </ElButton>
      </template>
    </div>
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
  padding: 8px 16px;
  background: var(--unnamed, #333c4a);
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
</style>
