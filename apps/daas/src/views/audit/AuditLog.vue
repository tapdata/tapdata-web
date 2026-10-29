<script>
import {
  exportAuditEvents,
  fetchAuditStatus,
  listAuditOperations,
} from '@tap/api/src/core/audit-events'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import TablePage from '@tap/business/src/components/TablePage.vue'
import { FilterBar } from '@tap/component/src/filter-bar'
import dayjs from 'dayjs'
import i18n from '@/i18n'
import AuditEventDrawer from './AuditEventDrawer.vue'
import {
  AUDIT_EVENT_TYPES,
  AUDIT_FILTER_KEYS,
  AUDIT_OUTCOMES,
  AUDIT_SOURCES,
  batchSummary,
  buildAuditQuery,
  displayValue,
  operatorText,
  outcomeView,
} from './audit-log'

const tr = (key, args) => i18n.t(key, args)

function buildSearchParams(query = {}) {
  const base = Object.fromEntries(AUDIT_FILTER_KEYS.map((key) => [key, '']))
  return { ...base, ...query }
}

export default {
  components: { TablePage, FilterBar, PageContainer, AuditEventDrawer },
  inject: ['hasPermissionByCode'],
  data() {
    const query = { ...this.$route.query }
    if (!query.start && !query.end && !query.eventId && !query.operationId) {
      query.start = dayjs().subtract(7, 'day').startOf('day').valueOf()
      query.end = dayjs().endOf('day').valueOf()
    }
    return {
      filterItems: [],
      searchParams: buildSearchParams(query),
      drawerVisible: false,
      drawerId: '',
      exporting: false,
      status: null,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }
  },
  computed: {
    table() {
      return this.$refs.table
    },
    canExport() {
      return this.hasPermissionByCode?.('v2_audit_log_export') ?? false
    },
  },
  watch: {
    '$route.query': function (query) {
      this.searchParams = buildSearchParams(query)
      this.table?.fetch?.(1)
    },
  },
  created() {
    this.getFilterItems()
    fetchAuditStatus()
      .then((status) => (this.status = status))
      .catch(() => {})
    if (!this.$route.query.start && !this.$route.query.end) this.syncQuery()
  },
  methods: {
    syncQuery() {
      const query = buildAuditQuery(this.searchParams)
      if (
        JSON.stringify(query) ===
        JSON.stringify(buildAuditQuery(this.$route.query))
      ) {
        this.table?.fetch?.(1)
        return
      }
      this.$router.replace({ name: this.$route.name, query })
    },
    getData({ page }) {
      const { current, size } = page
      return listAuditOperations({
        ...buildAuditQuery(this.searchParams),
        page: current,
        size,
      }).then((data) => ({
        total: data?.total || 0,
        data: (data?.items || []).map((op) => this.toRow(op)),
      }))
    },
    toRow(op) {
      const e = op.initiator || {}
      const legacy = !!e.legacy
      const outcome = outcomeView(op.outcome || e.outcome, tr)
      return {
        id: e.eventId,
        operationId: op.operationId,
        legacy,
        timeText: e.timestamp
          ? dayjs(e.timestamp).format('YYYY-MM-DD HH:mm:ss')
          : displayValue(null, legacy, tr),
        eventTypeText: e.eventType
          ? tr(`audit_event_type_${e.eventType.toLowerCase()}`)
          : displayValue(null, legacy, tr),
        operatorText: operatorText(e, tr),
        sourceText: e.source
          ? tr(`audit_source_${e.source.toLowerCase()}`)
          : displayValue(null, legacy, tr),
        sourceIpText: displayValue(e.sourceIp, legacy, tr),
        actionText: legacy
          ? e.legacyMessage || displayValue(null, true, tr)
          : e.actionName || e.action,
        objectText: displayValue(e.objectName || e.objectId, legacy, tr),
        batchText: batchSummary(e.batch, tr),
        outcomeText: op.pending
          ? `${outcome.text}（${tr('audit_pending_short')}）`
          : outcome.text,
        outcomeType: outcome.type,
      }
    },
    getFilterItems() {
      const options = (prefix, values) =>
        values.map((value) => ({
          label: tr(`${prefix}${value.toLowerCase()}`),
          value,
        }))
      this.filterItems = [
        {
          title: tr('audit_field_time'),
          type: 'datetimerange',
          key: 'start,end',
        },
        {
          label: tr('audit_field_event_type'),
          key: 'eventType',
          type: 'select-inner',
          items: options('audit_event_type_', AUDIT_EVENT_TYPES),
        },
        {
          label: tr('audit_field_source'),
          key: 'source',
          type: 'select-inner',
          items: options('audit_source_', AUDIT_SOURCES),
        },
        {
          label: tr('audit_field_outcome'),
          key: 'outcome',
          type: 'select-inner',
          items: options('audit_outcome_', AUDIT_OUTCOMES),
        },
        {
          placeholder: tr('audit_filter_user'),
          key: 'user',
          type: 'input',
          width: '160px',
        },
        {
          placeholder: tr('audit_filter_source_ip'),
          key: 'sourceIp',
          type: 'input',
          width: '140px',
        },
        {
          placeholder: tr('audit_filter_action'),
          key: 'action',
          type: 'input',
          width: '150px',
        },
        {
          placeholder: tr('audit_filter_object'),
          key: 'object',
          type: 'input',
          width: '160px',
        },
        {
          placeholder: tr('audit_filter_event_id'),
          key: 'eventId',
          type: 'input',
          width: '160px',
        },
        {
          placeholder: tr('audit_filter_operation_id'),
          key: 'operationId',
          type: 'input',
          width: '160px',
        },
        {
          placeholder: tr('audit_filter_keyword'),
          key: 'keyword',
          type: 'input',
        },
      ]
    },
    resetFilters() {
      this.searchParams = buildSearchParams()
      this.$router.replace({ name: this.$route.name, query: {} })
    },
    openDetail(row) {
      this.drawerId = row.operationId || row.id
      this.drawerVisible = true
    },
    async exportCsv() {
      const confirmed = await this.$confirm(
        tr('audit_export_confirm', [this.status?.maxExport || 100000]),
      ).catch(() => false)
      if (!confirmed) return
      this.exporting = true
      try {
        await exportAuditEvents(buildAuditQuery(this.searchParams))
      } catch (error) {
        this.$message.error(error?.message || tr('audit_export_failed'))
      } finally {
        this.exporting = false
      }
    },
  },
}
</script>

<template>
  <PageContainer>
    <template #actions>
      <span class="color-info mr-3">{{
        $t('audit_time_zone', [timeZone])
      }}</span>
      <el-button
        v-if="canExport"
        type="primary"
        :loading="exporting"
        @click="exportCsv"
      >
        {{ $t('audit_export') }}
      </el-button>
    </template>
    <el-alert
      v-if="status && status.writeFailures"
      class="mb-3"
      type="error"
      :closable="false"
      :title="$t('audit_write_failure_alert', [status.writeFailures])"
    />
    <TablePage
      ref="table"
      row-key="id"
      :remote-method="getData"
      @row-click="openDetail"
    >
      <template #search>
        <FilterBar
          v-model:value="searchParams"
          :items="filterItems"
          :change-route="false"
          @search="syncQuery"
          @fetch="syncQuery"
        />
        <el-button text type="primary" @click="resetFilters">{{
          $t('audit_reset_filters')
        }}</el-button>
      </template>
      <el-table-column
        :label="$t('audit_field_time')"
        prop="timeText"
        width="170"
      />
      <el-table-column
        :label="$t('audit_field_event_type')"
        prop="eventTypeText"
        width="120"
      />
      <el-table-column
        :label="$t('audit_field_operator')"
        prop="operatorText"
        min-width="150"
        show-overflow-tooltip
      />
      <el-table-column
        :label="$t('audit_field_source')"
        prop="sourceText"
        width="100"
      />
      <el-table-column
        :label="$t('audit_field_source_ip')"
        prop="sourceIpText"
        width="140"
        show-overflow-tooltip
      />
      <el-table-column
        :label="$t('audit_field_action')"
        min-width="200"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          {{ row.actionText }}
          <span v-if="row.batchText" class="color-info"
            >（{{ row.batchText }}）</span
          >
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('audit_field_object')"
        prop="objectText"
        min-width="160"
        show-overflow-tooltip
      />
      <el-table-column :label="$t('audit_field_outcome')" width="140">
        <template #default="{ row }">
          <el-tag :type="row.outcomeType" size="small">{{
            row.outcomeText
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column fixed="right" :label="$t('public_operation')" width="90">
        <template #default="{ row }">
          <el-button text type="primary" @click.stop="openDetail(row)">{{
            $t('public_button_details')
          }}</el-button>
        </template>
      </el-table-column>
    </TablePage>
    <AuditEventDrawer v-model:visible="drawerVisible" :id="drawerId" />
  </PageContainer>
</template>
