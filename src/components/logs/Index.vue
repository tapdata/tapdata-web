<template>
  <div class="debug-logs">
    <CustomerLogs v-show="logsType === 'normal'" :id="id">
      <ElRadioGroup v-model="logsType" size="mini">
        <ElRadioButton label="normal">普通</ElRadioButton>
        <ElRadioButton label="detailed">详细</ElRadioButton>
      </ElRadioGroup>
    </CustomerLogs>
    <TechnologyLogs v-show="logsType === 'detailed'" :id="id">
      <ElRadioGroup v-model="logsType" size="mini">
        <ElRadioButton label="normal">普通</ElRadioButton>
        <ElRadioButton label="detailed">详细</ElRadioButton>
      </ElRadioGroup>
    </TechnologyLogs>
  </div>
</template>
<script>
import CustomerLogs from './Normal'
import TechnologyLogs from './Detailed'

export default {
  name: 'DebugLogs',
  components: {
    CustomerLogs,
    TechnologyLogs
  },
  props: {
    id: String
  },
  data() {
    return {
      logsType: 'detailed'
    }
  }
}
</script>
<style lang="scss" scoped>
.debug-logs {
  padding: 10px 5px 5px 20px;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
}
</style>
