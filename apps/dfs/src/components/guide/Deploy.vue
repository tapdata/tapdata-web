<script>
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
      ]
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
    //显示隐藏完整命令
    handleShowAllCode(type) {
      this.showAllCode = type
    }
  }
}
</script>

<template>
  <div class="account">
    <div class="fs-6 font-color-dark fw-sub mb-4 mt-4">6、准备Tapdata Cloud 计算引擎环境部署，如遇问题可 咨询客服</div>
    <div class="fw-sub font-color-dark mt-4">要安装Agent,请先在下方选择您的服务器类型：</div>
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
    <div class="fw-sub font-color-dark mt-4">开始安装</div>
    <div class="font-color-light fw-normal mt-2 mb-2">
      请复制下方命令并在部署环境执行，其包含镜像的下载及运行，Tapdata Agent 的下载、自动部署及启动
    </div>
    <div class="my-2 text-style">
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
    <div class="box title-text my-2" :class="{ 'overflow-hidden': showAllCode }">
      <span class="link-line" :class="{ 'hidden-all-code': showAllCode }">{{ links[downLoadType] }}</span>
    </div>
    <div
      class="down-show-code text-center cursor-pointer color-primary bg-white mt-2 pb-2"
      v-if="showAllCode"
      @click="handleShowAllCode(false)"
    >
      <VIcon class="mr-2">arrow-down-fill</VIcon
      ><span>{{ $t('dfs_agent_download_fastdownload_xianshiwanzhengming') }}</span>
    </div>
    <div class="down-show-code text-center cursor-pointer bg-white mt-2 pb-2" v-else @click="handleShowAllCode(true)">
      <VIcon class="mr-2 fast-icon">arrow-down-fill</VIcon
      >{{ $t('dfs_agent_download_fastdownload_yincangwanzhengming') }}
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
  padding: 10px 20px;
  background: var(--unnamed, #333c4a);
}
</style>
