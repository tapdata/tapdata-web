<script>
import {
  CircleCheckFilled,
  CircleCloseFilled,
  Loading,
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { ErrorMessage } from './error-message'

export default {
  props: {
    data: Object,
  },
  computed: {
    schemaInfo() {
      const data = this.data
      let schemaInfo = {}
      // 加载数量大于等于实际的视为已完成
      if (data.loadFieldsStatus === 'finished') {
        const loadTime = data.loadSchemaTime
        schemaInfo = {
          text: this.$t('public_status_finished'),
          icon: CircleCheckFilled,
          color: 'success',
          tips: loadTime
            ? this.$t('packages_business_schema_progress_load_time', [
                dayjs(loadTime).format('YYYY-MM-DD HH:mm:ss'),
              ])
            : '',
        }
      } else if (data.loadFieldsStatus === 'loading') {
        const process = (data.loadCount * 100) / data.tableCount || 0
        schemaInfo = {
          text: `${this.$t('public_message_loading')} ${Math.floor(process)}%`,
          icon: Loading,
          color: 'primary',
          class: 'is-loading',
        }
      } else if (data.loadFieldsStatus) {
        schemaInfo = {
          text: this.$t('packages_business_schema_progress_status_error'),
          icon: CircleCloseFilled,
          color: 'danger',
        }
      }
      return schemaInfo
    },
  },
  methods: {
    showErrorMsg(msg) {
      ErrorMessage(msg)
    },
  },
}
</script>

<template>
  <div class="schema-progress-wrapper flex align-items-center">
    <template v-if="data.status !== 'invalid'">
      <el-icon
        class="mr-1"
        :class="[
          { [`color-${schemaInfo.color}`]: schemaInfo.color },
          schemaInfo.class,
        ]"
      >
        <component :is="schemaInfo.icon" />
      </el-icon>

      <ElLink
        v-if="schemaInfo.icon === 'error'"
        type="danger"
        @click="showErrorMsg"
        >{{ schemaInfo.text }}</ElLink
      >
      <ElTooltip
        v-else-if="schemaInfo.tips"
        :content="schemaInfo.tips"
        placement="top"
      >
        <span>{{ schemaInfo.text }}</span>
      </ElTooltip>
      <span v-else-if="schemaInfo.text">{{ schemaInfo.text }}</span>
      <span v-else>-</span>
      <ElButton
        v-if="
          data.loadFieldsStatus !== 'finished' &&
          data.loadFieldsStatus !== 'loading' &&
          data.loadFieldErrMsg
        "
        text
        type="primary"
        @click="showErrorMsg(data.loadFieldErrMsg)"
        >{{ $t('public_button_check') }}
      </ElButton>
    </template>
    <span v-else>-</span>
  </div>
</template>

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
