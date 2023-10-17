<template>
  <div id="app" :class="[$route.name]">
    <RouterView />
  </div>
</template>

<script>
import { buried } from '@/plugins/buried'
export default {
  name: 'app',
  provide: {
    async checkAgent(callback) {
      let data = await this.$axios.get('api/tcm/agent/agentCount')
      if (data.agentRunningCount || data.agentRunningCount > 0) {
        callback?.()
      } else {
        this.$message.error(this.$t('agent_error_check'))
        throw new Error(this.$t('agent_error_check'))
      }
    },
    buried,
  },
}
</script>

<style lang="scss">
#app {
  position: relative;
  height: 100%;
  min-width: 1440px;
  font-size: 14px;
}
.second-line .el-radio-button__inner {
  margin-top: 10px;
  border-left: 1px solid #dcdfe6;
}
.second-line + .second-line {
  .el-radio-button__inner {
    border-left: 0;
  }
}
</style>
