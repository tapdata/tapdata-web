<template>
  <div class="schema-progress-wrapper flex align-items-center">
    <template v-if="data.status !== 'invalid'">
      <i
        class="connections-schema-status__icon mr-1"
        :class="'el-icon-' + schemaInfo.icon + ' color-' + schemaInfo.color"
      ></i>
      <ElLink v-if="schemaInfo.icon === 'error'" type="danger" @click="showErrorMsg">{{ schemaInfo.text }}</ElLink>
      <ElTooltip v-else-if="schemaInfo.tips" :content="schemaInfo.tips" placement="top">
        <span :class="'color-' + schemaInfo.color">{{ schemaInfo.text }}</span>
      </ElTooltip>
      <span v-else-if="schemaInfo.color" :class="'color-' + schemaInfo.color">{{ schemaInfo.text }}</span>
      <span v-else>-</span>
    </template>
    <span v-else>-</span>
  </div>
</template>

<script>
import dayjs from 'dayjs'

export default {
  props: {
    data: Object
  },
  computed: {
    schemaInfo() {
      let data = this.data
      let schemaInfo = {}
      // 加载数量大于等于实际的视为已完成
      if (data.loadFieldsStatus === 'finished') {
        let loadTime = data.loadSchemaTime
        schemaInfo = {
          text: this.$t('public_status_finished'),
          icon: 'success',
          color: 'success',
          tips: loadTime
            ? this.$t('packages_business_schema_progress_load_time', [dayjs(loadTime).format('YYYY-MM-DD HH:mm:ss')])
            : ''
        }
      } else if (data.loadFieldsStatus === 'loading') {
        let process = (data.loadCount * 100) / data.tableCount || 0
        schemaInfo = {
          text: Math.floor(process) + '%',
          icon: 'warning',
          color: 'warning'
        }
      } else if (data.loadFieldsStatus) {
        schemaInfo = {
          text: this.$t('packages_business_schema_progress_status_error'),
          icon: 'error',
          color: 'danger'
        }
      }
      return schemaInfo
    }
  },
  methods: {
    showErrorMsg() {
      const h = this.$createElement
      this.$alert(
        h(
          'pre',
          {
            class: 'pb-5 overflow-auto'
          },
          [this.data.loadFieldErrMsg]
        ),
        this.$t('packages_business_schema_progress_dialog_error_title'),
        {
          type: 'error',
          customClass: 'schema-error-dialog',
          confirmButtonText: this.$t('public_button_close')
        }
      )
    }
  }
}
</script>

<style lang="scss">
.schema-error-dialog {
  width: 60% !important;
  .el-message-box__content {
    max-height: 350px;
    overflow-y: auto;
  }
}
.schema-progress-wrapper .connections-schema-status__icon {
  font-size: 14px;
}
</style>
