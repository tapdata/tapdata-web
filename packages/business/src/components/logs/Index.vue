<template>
  <div class="debug-logs">
    <CustomerLogs v-if="logsType === 'normal'" :id="id">
      <ElRadioGroup v-if="showAll" v-model:value="logsType" size="mini">
        <ElRadioButton label="normal">{{
          $t('packages_business_logs_index_putong')
        }}</ElRadioButton>
        <ElRadioButton label="detailed">{{
          $t('packages_business_logs_index_xiangxi')
        }}</ElRadioButton>
      </ElRadioGroup>
    </CustomerLogs>
    <TechnologyLogs v-if="logsType === 'detailed'" :id="id">
      <ElRadioGroup v-if="showAll" v-model:value="logsType" size="mini">
        <ElRadioButton label="normal">{{
          $t('packages_business_logs_index_putong')
        }}</ElRadioButton>
        <ElRadioButton label="detailed">{{
          $t('packages_business_logs_index_xiangxi')
        }}</ElRadioButton>
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
    TechnologyLogs,
  },
  props: {
    id: String,
    type: {
      type: [String, Number],
      default: 0,
    },
  },
  data() {
    return {
      logsType: '',
    }
  },
  mounted() {
    this.init()
  },
  computed: {
    showAll() {
      return this.type == 0
    },
  },
  watch: {
    type(v) {
      v && this.init()
    },
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
      } else {
        this.logsType = 'normal'
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.debug-logs {
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  ::v-deep {
    .log-container {
      max-height: 400px;
    }
    .vue-recycle-scroller {
      padding: 12px 24px;
      height: 400px;
      max-height: 600px;
      font-size: 14px;
      color: map-get($fontColor, dark);
    }
  }
}
</style>
