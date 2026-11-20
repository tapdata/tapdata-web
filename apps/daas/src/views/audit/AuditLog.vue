<script>
import {
  exportAuditEvents,
  fetchAuditStatus,
  listAuditOperations,
} from '@tap/api/src/core/audit-events'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import TablePage from '@tap/business/src/components/TablePage.vue'
import dayjs from 'dayjs'
import i18n from '@/i18n'
import AuditEventDrawer from './AuditEventDrawer.vue'
import UserOperation from '@/views/notification/UserOperation.vue'
import {
  actionMatchesEventType,
  advancedFilterCount,
  appliedFilterTags,
  AUDIT_DEFAULT_RANGE,
  AUDIT_EVENT_TYPES,
  AUDIT_FILTER_KEYS,
  AUDIT_OUTCOMES,
  AUDIT_QUERY_LABEL_KEYS,
  AUDIT_QUICK_RANGES,
  AUDIT_SOURCES,
  auditActionGroups,
  auditActionLabelKey,
  batchSummary,
  buildAuditQuery,
  displayValue,
  isQueryDirty,
  isValidTimeRange,
  operatorText,
  outcomeView,
  parseQuickRange,
  quickRangeTimes,
} from './audit-log'

const tr = (key, args) => i18n.t(key, args)

function emptyParams() {
  return Object.fromEntries(AUDIT_FILTER_KEYS.map((key) => [key, '']))
}

/** 路由查询 → 已生效条件；起止时间转为毫秒数值。 */
function parseApplied(query = {}) {
  const params = { ...emptyParams(), ...buildAuditQuery(query) }
  for (const key of ['start', 'end']) {
    if (params[key] !== '') params[key] = Number(params[key])
  }
  return params
}

/** 路由查询的稳定比较键：值统一为字符串、键排序。 */
function routeKey(query = {}) {
  return JSON.stringify(
    Object.entries(query)
      .map(([key, value]) => [key, String(value)])
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
  )
}

function defaultParams() {
  const [start, end] = quickRangeTimes(AUDIT_DEFAULT_RANGE)
  return { ...emptyParams(), start, end }
}

export default {
  components: {
    TablePage,
    PageContainer,
    AuditEventDrawer,
    UserOperation,
  },
  inject: ['hasPermissionByCode'],
  data() {
    const hasTime = this.$route.query.start || this.$route.query.end
    const applied = hasTime ? parseApplied(this.$route.query) : defaultParams()
    return {
      applied,
      draft: { ...applied },
      appliedRange: hasTime
        ? parseQuickRange(this.$route.query)
        : AUDIT_DEFAULT_RANGE,
      range: hasTime ? parseQuickRange(this.$route.query) : AUDIT_DEFAULT_RANGE,
      advancedVisible: false,
      rangeError: false,
      pendingRoute: '',
      drawerVisible: false,
      drawerId: '',
      exporting: false,
      status: null,
      eventTypes: AUDIT_EVENT_TYPES,
      outcomes: AUDIT_OUTCOMES,
      sources: AUDIT_SOURCES,
      quickRanges: AUDIT_QUICK_RANGES,
    }
  },
  computed: {
    table() {
      return this.$refs.table
    },
    canExport() {
      return this.hasPermissionByCode?.('v2_audit_log_export') ?? false
    },
    timeRange: {
      get() {
        const { start, end } = this.draft
        return start === '' || end === '' ? [] : [start, end]
      },
      set(value) {
        const [start = '', end = ''] = value || []
        this.draft.start = start === '' ? '' : Number(start)
        this.draft.end = end === '' ? '' : Number(end)
        this.range = 'custom'
        this.rangeError = false
      },
    },
    actionGroups() {
      return auditActionGroups(this.draft.eventType)
    },
    advancedCount() {
      return advancedFilterCount(this.applied)
    },
    tags() {
      return appliedFilterTags(this.applied).map((tag) => ({
        ...tag,
        label: tr(AUDIT_QUERY_LABEL_KEYS[tag.key]),
        text: this.valueText(tag.key, tag.value),
      }))
    },
    dirty() {
      return (
        isQueryDirty(this.draft, this.applied) ||
        this.range !== this.appliedRange
      )
    },
  },
  watch: {
    '$route.query': function (query) {
      const external = routeKey(query) !== this.pendingRoute
      this.pendingRoute = ''
      this.applied = parseApplied(query)
      this.appliedRange = parseQuickRange(query)
      if (external) {
        this.draft = { ...this.applied }
        this.range = this.appliedRange
      }
      this.table?.fetch?.(1)
    },
    'draft.eventType': function (eventType) {
      if (!actionMatchesEventType(this.draft.action, eventType)) {
        this.draft.action = ''
      }
    },
  },
  created() {
    fetchAuditStatus()
      .then((status) => (this.status = status))
      .catch(() => {})
    if (!this.$route.query.start && !this.$route.query.end) this.applyQuery()
  },
  methods: {
    valueText(key, value) {
      if (key === 'eventType')
        return tr(`audit_event_type_${value.toLowerCase()}`)
      if (key === 'outcome') return tr(`audit_outcome_${value.toLowerCase()}`)
      if (key === 'source') return tr(`audit_source_${value.toLowerCase()}`)
      if (key === 'action') return this.actionLabel(value)
      return value
    },
    actionLabel(action) {
      return tr(auditActionLabelKey(action))
    },
    onQuickRangeChange(range) {
      const times = quickRangeTimes(range)
      if (times) [this.draft.start, this.draft.end] = times
      this.rangeError = false
    },
    /** 按给定条件写入路由；条件未变化时直接重新拉取第一页。 */
    applyQuery(params = this.draft, range = this.range) {
      const query = Object.fromEntries(
        Object.entries({ ...buildAuditQuery(params), range }).map(
          ([key, value]) => [key, String(value)],
        ),
      )
      if (routeKey(query) === routeKey(this.$route.query)) {
        this.applied = parseApplied(query)
        this.appliedRange = range
        this.table?.fetch?.(1)
        return
      }
      this.pendingRoute = routeKey(query)
      this.$router.replace({ name: this.$route.name, query })
    },
    search() {
      if (!isValidTimeRange(this.draft.start, this.draft.end)) {
        this.rangeError = true
        return
      }
      this.rangeError = false
      this.applyQuery()
    },
    refresh() {
      this.table?.fetch?.()
    },
    resetFilters() {
      this.draft = defaultParams()
      this.range = AUDIT_DEFAULT_RANGE
      this.rangeError = false
      this.applyQuery()
    },
    removeTag(key) {
      const applied = { ...this.applied, [key]: '' }
      this.draft[key] = ''
      this.applyQuery(applied, this.appliedRange)
    },
    getData({ page }) {
      const { current, size } = page
      return listAuditOperations({
        ...buildAuditQuery(this.applied),
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
        legacyRecord: legacy
          ? {
              ...(e.legacyFields || {}),
              username: e.username,
              userId: e.userId,
              i18nMessage: e.legacyMessage,
            }
          : undefined,
        objectText: displayValue(e.objectName || e.objectId, legacy, tr),
        batchText: batchSummary(e.batch, tr),
        outcomeText: op.pending
          ? `${outcome.text}（${tr('audit_pending_short')}）`
          : outcome.text,
        outcomeType: outcome.type,
      }
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
        await exportAuditEvents(buildAuditQuery(this.applied))
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
    <section class="audit-query">
      <form class="audit-query__form" @submit.prevent="search">
        <div class="audit-query__field audit-query__range-preset">
          <span class="audit-query__label">{{
            $t('audit_query_quick_range')
          }}</span>
          <el-select v-model="range" @change="onQuickRangeChange">
            <el-option
              v-for="item in quickRanges"
              :key="item"
              :label="$t(`audit_query_range_${item}`)"
              :value="item"
            />
          </el-select>
        </div>
        <div class="audit-query__field audit-query__time-range">
          <span class="audit-query__label">{{
            $t('audit_query_time_range')
          }}</span>
          <el-date-picker
            v-model="timeRange"
            type="datetimerange"
            value-format="x"
            format="YYYY-MM-DD HH:mm:ss"
            :clearable="false"
            :start-placeholder="$t('public_start_time')"
            :end-placeholder="$t('public_end_time')"
            :aria-label="$t('audit_query_time_range')"
          />
        </div>
        <div class="audit-query__field audit-query__keyword">
          <span class="audit-query__label">{{
            $t('audit_query_keyword')
          }}</span>
          <el-input
            v-model="draft.keyword"
            clearable
            :placeholder="$t('audit_query_keyword_placeholder')"
            @keyup.enter="search"
          >
            <template #prefix>
              <el-icon><i-lucide-search /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="audit-query__field audit-query__event-type">
          <span class="audit-query__label">{{
            $t('audit_query_event_type')
          }}</span>
          <el-select
            v-model="draft.eventType"
            clearable
            :placeholder="$t('audit_query_all')"
          >
            <el-option
              v-for="item in eventTypes"
              :key="item"
              :label="$t(`audit_event_type_${item.toLowerCase()}`)"
              :value="item"
            />
          </el-select>
        </div>
        <div class="audit-query__field audit-query__outcome">
          <span class="audit-query__label">{{
            $t('audit_query_outcome')
          }}</span>
          <el-select
            v-model="draft.outcome"
            clearable
            :placeholder="$t('audit_query_all')"
          >
            <el-option
              v-for="item in outcomes"
              :key="item"
              :label="$t(`audit_outcome_${item.toLowerCase()}`)"
              :value="item"
            />
          </el-select>
        </div>
        <div class="audit-query__actions">
          <el-button
            :class="{ 'is-active': advancedVisible }"
            :aria-expanded="String(advancedVisible)"
            aria-controls="audit-query-advanced"
            @click="advancedVisible = !advancedVisible"
          >
            {{ $t('audit_query_more') }}
            <template v-if="advancedCount">({{ advancedCount }})</template>
            <el-icon class="el-icon--right audit-query__chevron"
              ><i-lucide-chevron-down
            /></el-icon>
          </el-button>
          <el-button type="primary" native-type="submit">{{
            $t('audit_query_search')
          }}</el-button>
          <el-button text @click="resetFilters">{{
            $t('audit_query_reset')
          }}</el-button>
        </div>
        <div
          v-show="advancedVisible"
          id="audit-query-advanced"
          class="audit-query__advanced"
        >
          <div class="audit-query__field">
            <span class="audit-query__label">{{
              $t('audit_query_source')
            }}</span>
            <el-select
              v-model="draft.source"
              clearable
              :placeholder="$t('audit_query_all')"
            >
              <el-option
                v-for="item in sources"
                :key="item"
                :label="$t(`audit_source_${item.toLowerCase()}`)"
                :value="item"
              />
            </el-select>
          </div>
          <div class="audit-query__field">
            <span class="audit-query__label">{{ $t('audit_query_user') }}</span>
            <el-input
              v-model="draft.user"
              clearable
              :placeholder="$t('audit_query_user_placeholder')"
              @keyup.enter="search"
            />
          </div>
          <div class="audit-query__field">
            <span class="audit-query__label">{{
              $t('audit_query_source_ip')
            }}</span>
            <el-input
              v-model="draft.sourceIp"
              clearable
              :placeholder="$t('audit_query_source_ip_placeholder')"
              @keyup.enter="search"
            />
          </div>
          <div class="audit-query__field">
            <span class="audit-query__label">{{
              $t('audit_query_action')
            }}</span>
            <el-select
              v-model="draft.action"
              clearable
              filterable
              :placeholder="$t('audit_query_action_placeholder')"
            >
              <el-option-group
                v-for="group in actionGroups"
                :key="group.eventType"
                :label="$t(`audit_event_type_${group.eventType.toLowerCase()}`)"
              >
                <el-option
                  v-for="action in group.actions"
                  :key="action"
                  :label="actionLabel(action)"
                  :value="action"
                />
              </el-option-group>
            </el-select>
          </div>
          <div class="audit-query__field">
            <span class="audit-query__label">{{
              $t('audit_query_object')
            }}</span>
            <el-input
              v-model="draft.object"
              clearable
              :placeholder="$t('audit_query_object_placeholder')"
              @keyup.enter="search"
            />
          </div>
        </div>
        <p v-if="rangeError" class="audit-query__error" role="alert">
          {{ $t('audit_query_invalid_range') }}
        </p>
      </form>
      <div class="audit-query__status">
        <div class="audit-query__tags">
          <template v-if="tags.length">
            <span class="audit-query__muted">{{
              $t('audit_query_applied')
            }}</span>
            <el-tag
              v-for="tag in tags"
              :key="tag.key"
              closable
              disable-transitions
              :aria-label="$t('audit_query_remove_tag', [tag.label])"
              @close="removeTag(tag.key)"
              >{{ tag.label }}: {{ tag.text }}</el-tag
            >
          </template>
        </div>
        <div class="audit-query__meta">
          <span v-if="dirty" class="audit-query__muted">{{
            $t('audit_query_pending')
          }}</span>
          <el-button text @click="refresh">
            <el-icon class="el-icon--left"><i-lucide-rotate-cw /></el-icon>
            {{ $t('audit_query_refresh') }}
          </el-button>
        </div>
      </div>
    </section>
    <TablePage
      ref="table"
      row-key="id"
      :remote-method="getData"
      @row-click="openDetail"
    >
      <template #noDataText>
        {{ $t('audit_query_empty') }}
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
          <UserOperation v-if="row.legacy" :record="row.legacyRecord" />
          <template v-else>
            {{ row.actionText }}
            <span v-if="row.batchText" class="color-info"
              >（{{ row.batchText }}）</span
            >
          </template>
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

<style lang="scss" scoped>
.audit-query {
  margin-bottom: 16px;

  &__form {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 12px;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  &__label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__range-preset {
    flex: 0 0 140px;
  }

  &__time-range {
    flex: 0 0 400px;
    max-width: 100%;

    :deep(.el-date-editor) {
      width: 100%;
    }
  }

  &__keyword {
    flex: 1 1 240px;
    min-width: 200px;
    max-width: 400px;
  }

  &__event-type {
    flex: 0 0 160px;
  }

  &__outcome {
    flex: 0 0 120px;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 8px;

    .el-button + .el-button {
      margin-left: 0;
    }

    .is-active .audit-query__chevron {
      transform: rotate(180deg);
    }
  }

  &__advanced {
    flex: 0 0 100%;
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 12px 16px;
    padding: 16px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    background: var(--el-fill-color-lighter);
  }

  &__error {
    flex: 0 0 100%;
    margin: 0;
    font-size: 12px;
    color: var(--el-color-danger);
  }

  &__status {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px 12px;
    margin-top: 12px;
    min-height: 32px;
  }

  &__tags,
  &__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  &__muted {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

@media (max-width: 1250px) {
  .audit-query__advanced {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .audit-query__time-range,
  .audit-query__keyword {
    flex: 1 1 100%;
    max-width: none;
  }

  .audit-query__advanced {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
