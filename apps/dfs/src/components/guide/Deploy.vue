<script>
import { VIcon } from '@tap/component'

export default {
  name: 'Account',
  inject: ['buried'],
  components: { VIcon },
  data() {
    return {
      downLoadType: '',
      showTooltip: false,
      downType: [
        { name: 'Linux (64 bit)', value: 'Linux' },
        { name: 'Docker', value: 'Docker' },
        { name: 'Windows (64 bit)', value: 'windows' }
      ]
    }
  },
  methods: {
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
    }
  }
}
</script>

<template>
  <div class="account">
    <div class="fs-6 font-color-dark fw-sub mb-4 mt-4">6、准备Tapdata Cloud 计算引擎环境部署，如遇问题可 咨询客服</div>
    <div>要安装Agent,请先在下方选择您的服务器类型：</div>
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
    <div>开始安装</div>
    <div>请复制下方命令并在部署环境执行，其包含镜像的下载及运行，Tapdata Agent 的下载、自动部署及启动</div>
    <div class="my-2 text-style">
      {{ $t('dfs_agent_download_agentdownloadmodal_shilitok') }}
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
          v-clipboard:copy="token"
          v-clipboard:success="onCopy"
          @mouseleave="showTooltip = false"
          @click="handleCopy"
        >
          <VIcon class="mr-2">copy</VIcon>
          <i>{{ $t('public_button_copy') }}</i>
        </el-button>
      </ElTooltip>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
