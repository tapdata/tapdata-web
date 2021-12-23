<template>
  <div class="debug-logs">
    <CustomerLogs v-if="logsType === 'normal'" :id="id">
      <ElRadioGroup v-if="showAll" v-model="logsType" size="mini">
        <ElRadioButton label="normal">普通</ElRadioButton>
        <ElRadioButton label="detailed">详细</ElRadioButton>
      </ElRadioGroup>
    </CustomerLogs>
    <TechnologyLogs v-if="logsType === 'detailed'" :id="id">
      <ElRadioGroup v-if="showAll" v-model="logsType" size="mini">
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
    id: String,
    type: {
      type: [String, Number],
      default: 0
    }
  },
  data() {
    return {
      logsType: 'detailed'
    }
  },
  computed: {
    showAll() {
      return this.type == 0
    }
  },
  watch: {
    type(v) {
      if (!this.showAll) {
        if (v == 1) {
          this.logsType = 'detailed'
        } else if (v == 2) {
          this.logsType = 'normal'
        }
      }
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
