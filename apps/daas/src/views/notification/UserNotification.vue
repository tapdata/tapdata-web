<script>
import { fetchUserLogs } from '@tap/api/src/core/userlogs'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import DatetimeRange from '@tap/component/src/filter-bar/DatetimeRange.vue'
import dayjs from 'dayjs'
import { escapeRegExp } from 'lodash-es'
import UserOperation from './UserOperation'

export default {
  components: {
    UserOperation,
    DatetimeRange,
    PageContainer,
  },
  data() {
    return {
      loading: false,
      search: {
        keyword: '',
        range: [],
        userId: '',
        eventType: '',
        outcome: '',
      },
      page: {
        index: 1,
        size: 20,
        total: 0,
      },
      list: [],
      detailVisible: false,
      detailData: {},
      eventTypeOptions: [
        { label: this.$t('audit_event_login'), value: 'login' },
        { label: this.$t('audit_event_admin'), value: 'adminOperation' },
        { label: this.$t('audit_event_config'), value: 'configurationChange' },
        { label: this.$t('audit_event_service'), value: 'serviceLifecycle' },
        { label: this.$t('audit_event_other'), value: 'userOperation' },
      ],
      outcomeOptions: [
        { label: this.$t('audit_outcome_success'), value: 'success' },
        { label: this.$t('audit_outcome_failure'), value: 'failure' },
      ],
    }
  },
  created() {
    this.getData()
  },
  methods: {
    getData(pageNum) {
      this.loading = true
      const { keyword, range, userId, eventType, outcome } = this.search
      const { size, index } = this.page
      const current = pageNum || index
      const where = {
        type: 'userOperation',
      }
      const queryGroups = []
      if (keyword && keyword.trim()) {
        const keywordRegex = {
          $regex: escapeRegExp(keyword.trim()),
          $options: 'i',
        }
        queryGroups.push({
          $or: [
            { parameter1: keywordRegex },
            { parameter2: keywordRegex },
            { operation: keywordRegex },
            { objectName: keywordRegex },
            { changeSummary: keywordRegex },
            { failureReason: keywordRegex },
            { serviceNode: keywordRegex },
            { componentType: keywordRegex },
            { instanceName: keywordRegex },
          ],
        })
      }
      if (userId) {
        const userRegex = {
          $regex: escapeRegExp(userId.trim()),
          $options: 'i',
        }
        queryGroups.push({
          $or: [{ userId: userRegex }, { username: userRegex }],
        })
      }
      if (eventType) {
        where.eventType = eventType
      }
      if (outcome) {
        where.outcome = outcome
      }
      if (queryGroups.length) {
        where.$and = queryGroups
      }
      if (range && range.length) {
        const startTime = range[0] ? range[0] : ''
        const endTime = range[1] ? range[1] : ''
        if (startTime && !endTime) {
          where.createTime = { $gt: { $date: startTime } }
        } else if (!startTime && endTime) {
          where.createTime = { $lt: { $date: endTime } }
        } else if (startTime && endTime) {
          where.createTime = {
            $gt: { $date: startTime },
            $lt: { $date: endTime },
          }
        }
      }
      const filter = {
        order: 'createTime DESC',
        limit: size,
        skip: (current - 1) * size,
        where,
      }

      fetchUserLogs(filter)
        .then((data) => {
          this.page.total = data?.total || 0
          this.page.index = current
          this.list = (data?.items || []).map((item) => {
            item.createTimeFmt = dayjs(item.createTime).format(
              'YYYY-MM-DD HH:mm:ss',
            )
            return item
          })
        })
        .finally(() => {
          this.loading = false
        })
    },
    getEventTypeLabel(record) {
      return (
        this.eventTypeOptions.find((item) => item.value === record.eventType)
          ?.label || this.$t('audit_unknown')
      )
    },
    getOutcomeLabel(outcome) {
      return (
        this.outcomeOptions.find((item) => item.value === outcome)?.label ||
        this.$t('audit_unknown')
      )
    },
    getUserLabel(record) {
      const user = record.username || record.userId
      return user === 'UNAUTHENTICATED'
        ? this.$t('audit_unauthenticated')
        : user || this.$t('audit_unknown')
    },
    getFailureReasonLabel(record) {
      const reason = record.failureReason || ''
      if (!reason) return reason
      const loginReasonKeyMap = {
        credential_parse_failed: 'audit_login_failure_credential_parse',
        external_identity_validation_failed:
          'audit_login_failure_external_identity',
        credential_validation_failed: 'audit_login_failure_credentials',
        user_pending_approval: 'audit_login_failure_pending_approval',
        user_disabled: 'audit_login_failure_user_disabled',
        too_many_login_failures: 'audit_login_failure_too_many_attempts',
      }
      const serviceReasonKeyMap = {
        abnormal_service_stop_detected:
          'audit_service_failure_abnormal_stop_detected',
        abnormal_stop_handling_failed:
          'audit_service_failure_abnormal_stop_handling',
        service_operation_failed: 'audit_service_failure_operation',
        cluster_node_not_found: 'audit_service_failure_cluster_node_not_found',
        cluster_service_operation_failed:
          'audit_service_failure_cluster_operation',
        service_stop_failed: 'audit_service_failure_stop',
        service_status_update_failed: 'audit_service_failure_status_update',
      }
      const connectionReasonKeyMap = {
        connection_test_failed: 'audit_connection_failure_test',
        schema_load_failed: 'audit_connection_failure_load_schema',
        connection_agent_unavailable:
          'audit_connection_failure_agent_unavailable',
      }
      const reasonKeyMap =
        record.eventType === 'login'
          ? loginReasonKeyMap
          : record.eventType === 'serviceLifecycle'
            ? serviceReasonKeyMap
            : connectionReasonKeyMap
      const key = reasonKeyMap[reason]
      return key ? this.$t(key) : reason
    },
    getAuditObjectLabel(record) {
      if (record.eventType === 'configurationChange') {
        const objectKeyMap = {
          systemSettings: 'audit_system_configuration',
          alarmSettings: 'audit_alarm_configuration',
        }
        const objectName = record.objectName || record.parameter1
        const objectKey = objectKeyMap[objectName]
        return objectKey
          ? this.$t(objectKey)
          : objectName || this.$t('audit_system_configuration')
      }
      if (record.eventType === 'serviceLifecycle' && record.componentType) {
        const componentKeyMap = {
          engine: 'cluster_sync_gover',
          backend: 'cluster_sync_gover',
          management: 'cluster_manage_sys',
          apiServer: 'audit_cluster_api_server',
        }
        const componentKey = componentKeyMap[record.componentType]
        const componentName = componentKey
          ? this.$t(componentKey)
          : this.$t('audit_cluster_custom_component', {
              componentType: record.componentType,
            })
        return record.instanceName
          ? this.$t('audit_cluster_component_instance', {
              component: componentName,
              instance: record.instanceName,
            })
          : componentName
      }
      return (
        record.objectName || record.parameter1 || this.$t('audit_unavailable')
      )
    },
    showDetail(record) {
      this.detailData = record
      this.detailVisible = true
    },
  },
}
</script>

<template>
  <PageContainer
    mode="auto"
    class="overflow-hidden"
    content-class="flex-1 gap-6 min-h-0 overflow-auto px-0 position-relative"
  >
    <div v-loading="loading" class="user-notification">
      <div
        class="search-bar flex flex-wrap gap-3 position-sticky top-0 bg-white z-10 pb-2 dark:bg-transparent dark:backdrop-blur-md px-6"
      >
        <DatetimeRange
          v-model="search.range"
          type="datetimerange"
          class="flex-grow-0"
          range-separator="-"
          :start-placeholder="$t('dataFlow_startTime')"
          :end-placeholder="$t('dataFlow_endTime')"
          @change="getData(1)"
        />

        <el-select
          v-model="search.eventType"
          clearable
          class="search-select"
          :placeholder="$t('audit_event_type')"
          @change="getData(1)"
        >
          <el-option
            v-for="item in eventTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>

        <el-select
          v-model="search.outcome"
          clearable
          class="search-select"
          :placeholder="$t('audit_outcome')"
          @change="getData(1)"
        >
          <el-option
            v-for="item in outcomeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>

        <el-input
          v-model="search.userId"
          clearable
          class="search-user"
          :placeholder="$t('audit_user_id')"
          @change="getData(1)"
        >
          <template #prefix>
            <el-icon><i-lucide-user-round-search /></el-icon>
          </template>
        </el-input>

        <el-input
          v-model="search.keyword"
          clearable
          class="search-item"
          :placeholder="$t('audit_keyword')"
          @change="getData(1)"
        >
          <template #prefix>
            <el-icon><i-lucide-search /></el-icon>
          </template>
        </el-input>

        <ElButton plain circle class="rounded-lg" @click="getData">
          <i-lucide-refresh-cw />
        </ElButton>
      </div>
      <ul class="list px-6">
        <li v-for="record in list" :key="record._id" class="item gap-2">
          <UserOperation :record="record" />
          <span class="item-time text-nowrap">{{ record.createTimeFmt }}</span>
          <el-button link type="primary" @click="showDetail(record)">
            {{ $t('audit_detail') }}
          </el-button>
        </li>
      </ul>
      <el-pagination
        v-model:page-size="page.size"
        v-model:current-page="page.index"
        class="position-sticky py-6 bottom-0 z-10 bg-white dark:bg-transparent dark:backdrop-blur-md px-6"
        background
        layout="->,total,prev, pager, next,sizes"
        :page-sizes="[20, 30, 50, 100]"
        :total="page.total"
        @current-change="getData"
        @size-change="getData()"
      />
    </div>
    <el-dialog
      v-model="detailVisible"
      :title="$t('audit_detail')"
      width="640px"
      destroy-on-close
    >
      <div class="audit-detail">
        <div class="detail-item">
          <span>{{ $t('audit_event_type') }}</span>
          <b>{{ getEventTypeLabel(detailData) }}</b>
        </div>
        <div class="detail-item">
          <span>{{ $t('audit_user_id') }}</span>
          <b>{{ getUserLabel(detailData) }}</b>
        </div>
        <div class="detail-item">
          <span>{{ $t('audit_source_ip') }}</span>
          <b>{{ detailData.ip || $t('audit_unavailable') }}</b>
        </div>
        <div class="detail-item">
          <span>{{ $t('audit_time') }}</span>
          <b>{{ detailData.createTimeFmt || $t('audit_unavailable') }}</b>
        </div>
        <div class="detail-item">
          <span>{{ $t('audit_action') }}</span>
          <b>{{ detailData.operation || $t('audit_unavailable') }}</b>
        </div>
        <div class="detail-item">
          <span>{{ $t('audit_object') }}</span>
          <b>{{ getAuditObjectLabel(detailData) }}</b>
        </div>
        <div class="detail-item">
          <span>{{ $t('audit_outcome') }}</span>
          <b>{{ getOutcomeLabel(detailData.outcome) }}</b>
        </div>
        <div v-if="detailData.loginMethod" class="detail-item">
          <span>{{ $t('audit_login_method') }}</span>
          <b>{{ detailData.loginMethod }}</b>
        </div>
        <div v-if="detailData.failureReason" class="detail-item">
          <span>{{ $t('audit_failure_reason') }}</span>
          <b>{{ getFailureReasonLabel(detailData) }}</b>
        </div>
        <div v-if="detailData.changeSummary" class="detail-item">
          <span>{{ $t('audit_change_summary') }}</span>
          <b>{{ detailData.changeSummary }}</b>
        </div>
        <div v-if="detailData.serviceNode" class="detail-item">
          <span>{{ $t('audit_service_node') }}</span>
          <b>{{ detailData.serviceNode }}</b>
        </div>
        <div class="detail-item">
          <span>{{ $t('audit_event_id') }}</span>
          <b>{{ detailData.eventId || $t('audit_unavailable') }}</b>
        </div>
      </div>
    </el-dialog>
  </PageContainer>
</template>

<style lang="scss">
.user-notification-data-picker .el-time-panel.el-popper {
  right: 0;
  left: unset;
}
</style>

<style lang="scss" scoped>
.user-notification {
  display: flex;
  flex-direction: column;
  .filter-datetime-range {
    padding-left: 0;
    text-align: left;
    font-size: var(--font-base-title);
    line-height: 32px;
    :deep(.filter-datetime:first-child) {
      padding-left: 0;
      .el-date-editor.empty-time .el-input__inner {
        text-align: left;
      }
    }

    :deep(.el-input) {
      font-size: var(--font-base-title);
    }
  }
  .header {
    // padding: 20px 20px 20px 0;
    .title {
      font-weight: bold;
    }
  }
  .search-bar {
    display: flex;
    align-items: center;
    .search-item {
      width: 300px;
    }
    .search-select {
      width: 160px;
    }
    .search-user {
      width: 220px;
    }
  }
  .list {
    flex: 1;
    overflow: auto;

    .item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-height: 50px;
      border-bottom: 1px solid var(--border-light);
      font-size: var(--font-base-title);
      color: #202d40;
      .item-time {
        color: var(--text-light);
        font-weight: 400;
      }
    }
  }
}
.audit-detail {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 24px;
  .detail-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
    span {
      color: var(--text-light);
    }
    b {
      overflow-wrap: anywhere;
      color: var(--text-normal);
      font-weight: 400;
    }
  }
}
</style>
