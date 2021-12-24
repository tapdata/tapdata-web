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
    },
    logType: {
      type: [String, Number],
      default: 0
    }
  },
  data() {
    return {
      logsType: ''
    }
  },
  mounted() {
    this.init()
  },
  computed: {
    showAll() {
      return this.type == 0
    }
  },
  watch: {
    type(v) {
      console.log('watch-type', v)
      v && this.init()
      // if (!this.showAll) {
      //   if (v == 1) {
      //     this.logsType = 'detailed'
      //   } else if (v == 2) {
      //     this.logsType = 'normal'
      //   }
      // }
    },
    logType(v) {
      console.log('logType', v)
    }
  },
  methods: {
    init() {
      let { type, showAll } = this
      if (!showAll) {
        if (type == 1) {
          this.logsType = 'detailed'
        } else if (type == 2) {
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
