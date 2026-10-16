<script>
import {
  closeAlarms,
  getAlarmEventStats,
  listAlarmEvents,
} from '@tap/api/src/core/alarm'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import TablePage from '@tap/business/src/components/TablePage.vue'
import {
  ALARM_LEVEL_MAP,
  ALARM_STATUS_MAP,
} from '@tap/business/src/shared/const'
import { FilterBar } from '@tap/component/src/filter-bar'
import dayjs from 'dayjs'
import i18n from '@/i18n'
import AlarmEventDrawer from './AlarmEventDrawer.vue'
import DeliverySummaryTag from './DeliverySummaryTag.vue'

const OBJECT_TYPES = [
  'TASK',
  'NODE',
  'CONNECTION',
  'AGENT',
  'INSPECT',
  'API_SERVER',
]

export default {
  components: {
    TablePage,
    FilterBar,
    PageContainer,
    AlarmEventDrawer,
    DeliverySummaryTag,
  },
  data() {
    return {
      filterItems: [],
      multipleSelection: [],
      searchParams: { ...this.$route.query },
      stats: { alarming: 0, severe: 0, todayNew: 0, todayRecovered: 0 },
      drawerVisible: false,
      drawerId: '',
    }
  },
  computed: {
    table() {
      return this.$refs.table
    },
    cards() {
      const today = dayjs().startOf('day').valueOf()
      return [
        {
          key: 'alarming',
          label: 'alarm_event_stats_alarming',
          query: { status: 'ING' },
        },
        {
          key: 'severe',
          label: 'alarm_event_stats_severe',
          query: { status: 'ING', level: 'CRITICAL,EMERGENCY' },
        },
        {
          key: 'todayNew',
          label: 'alarm_event_stats_today_new',
          query: { start: today },
        },
        {
          key: 'todayRecovered',
          label: 'alarm_event_stats_today_recovered',
          query: { status: 'RECOVER', start: today },
        },
      ]
    },
  },
  watch: {
    '$route.query': function (query) {
      this.searchParams = { ...query }
      this.table.fetch(1)
    },
  },
  created() {
    this.getFilterItems()
    this.loadStats()
    // 从通知记录跳转时直接打开对应告警详情
    if (this.$route.query.alarmId) {
      this.drawerId = this.$route.query.alarmId
      this.drawerVisible = true
    }
  },
  methods: {
    loadStats() {
      getAlarmEventStats().then((data) => {
        this.stats = data || this.stats
      })
    },
    applyCard(card) {
      // 统计卡等同于应用筛选条件，写入 URL 便于刷新和分享
      this.$router.replace({ name: this.$route.name, query: card.query })
    },
    getData({ page }) {
      const { current, size } = page
      const params = { ...this.searchParams, page: current, size }
      return listAlarmEvents(params).then((data) => {
        const list = data?.items || []
        return {
          total: data?.total || 0,
          data: list.map((item) => ({
            ...item,
            firstOccurrenceText: this.fmt(item.firstOccurrenceTime),
            lastOccurrenceText: this.fmt(item.lastOccurrenceTime),
            levelLabel: ALARM_LEVEL_MAP[item.level]?.text || item.level,
            levelType: ALARM_LEVEL_MAP[item.level]?.type,
            statusLabel: ALARM_STATUS_MAP[item.status]?.text || item.status,
          })),
        }
      })
    },
    fmt(time) {
      return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : ''
    },
    getFilterItems() {
      const option = (prefix) => (value) => ({
        label: i18n.t(`${prefix}${value}`),
        value,
      })
      this.filterItems = [
        {
          label: i18n.t('daas_notification_systemalarm_gaojingzhuangtai'),
          key: 'status',
          type: 'select-inner',
          items: [
            {
              label: i18n.t('packages_business_shared_const_gaojingzhong'),
              value: 'ING',
            },
            {
              label: i18n.t('packages_business_shared_const_yihuifu'),
              value: 'RECOVER',
            },
            {
              label: i18n.t('packages_business_components_alert_yiguanbi'),
              value: 'CLOESE',
            },
          ],
        },
        {
          label: i18n.t('packages_dag_components_alert_gaojingjibie'),
          key: 'level',
          type: 'select-inner',
          items: ['NORMAL', 'WARNING', 'CRITICAL', 'EMERGENCY'].map(
            (value) => ({
              label: ALARM_LEVEL_MAP[value].text,
              value,
            }),
          ),
        },
        {
          label: i18n.t('alarm_event_object_type'),
          key: 'objectType',
          type: 'select-inner',
          items: OBJECT_TYPES.map(option('alarm_object_type_')),
        },
        {
          label: i18n.t('alarm_event_notified'),
          key: 'notified',
          type: 'select-inner',
          items: ['NONE', 'NOTIFIED', 'PARTIAL_FAILED', 'FAILED'].map(
            option('alarm_event_notified_'),
          ),
        },
        {
          label: i18n.t('alarm_event_agent'),
          key: 'agentId',
          type: 'input',
          width: '160px',
        },
        {
          title: i18n.t('daas_notification_systemalarm_gaojingshijian'),
          type: 'datetimerange',
          key: 'start,end',
        },
        {
          placeholder: i18n.t('alarm_event_keyword_placeholder'),
          key: 'keyword',
          type: 'input',
        },
      ]
    },
    handleClose(id) {
      const ids = this.multipleSelection?.length
        ? this.multipleSelection.map((item) => item.id)
        : [id]
      this.$confirm(
        i18n.t('alarm_event_close_confirm'),
        i18n.t('public_button_close'),
        {
          type: 'warning',
        },
      ).then(() =>
        closeAlarms(ids.join(',')).then(() => {
          this.$message.success(
            i18n.t('daas_notification_systemalarm_guanbichenggong'),
          )
          this.table.fetch(1)
          this.loadStats()
        }),
      )
    },
    openDetail(row) {
      this.drawerId = row.id
      this.drawerVisible = true
    },
    goTask(row) {
      this.$router.push({
        name: row.syncType === 'migrate' ? 'MigrationMonitor' : 'TaskMonitor',
        params: { id: row.taskId },
      })
    },
  },
}
</script>

<template>
  <PageContainer>
    <template #actions>
      <el-button
        :disabled="!multipleSelection.length"
        type="primary"
        @click="handleClose"
      >
        {{ $t('public_button_close') }}
      </el-button>
    </template>
    <div class="alarm-events flex flex-column h-100 overflow-hidden">
      <div class="alarm-events-cards flex gap-3 mb-3">
        <div
          v-for="card in cards"
          :key="card.key"
          class="alarm-events-card flex-1 rounded-lg p-3 cursor-pointer"
          @click="applyCard(card)"
        >
          <div class="color-info fs-7">{{ $t(card.label) }}</div>
          <div class="fs-3 fw-sub mt-1">{{ stats[card.key] }}</div>
        </div>
      </div>
      <TablePage
        ref="table"
        row-key="id"
        class="flex-1"
        :remote-method="getData"
        @selection-change="(val) => (multipleSelection = val)"
        @row-click="openDetail"
      >
        <template #search>
          <FilterBar
            v-model:value="searchParams"
            :items="filterItems"
            @fetch="table.fetch(1)"
          />
        </template>
        <el-table-column type="selection" width="32" align="center" />
        <el-table-column
          :label="$t('packages_dag_components_alert_gaojingjibie')"
          prop="level"
          width="100"
        >
          <template #default="{ row }">
            <span :class="[`status-${row.levelType}`, 'status-block']">{{
              row.levelLabel
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('packages_dag_components_alert_gaojingzhuangtai')"
          prop="statusLabel"
          width="90"
        />
        <el-table-column
          :label="$t('daas_notification_systemalarm_gaojingduixiang')"
          min-width="160"
        >
          <template #default="{ row }">
            <div class="ellipsis">{{ row.objectName || '-' }}</div>
            <div class="color-info fs-8">
              {{ $t(`alarm_object_type_${row.objectType}`) }}
              <span v-if="row.objectDeleted"
                >· {{ $t('alarm_event_object_deleted') }}</span
              >
            </div>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('packages_dag_components_alert_gaojingmiaoshu')"
          min-width="200"
        >
          <template #default="{ row }">
            <div class="alarm-events-summary">{{ row.summary }}</div>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('packages_dag_components_alert_gaojingshoucifa')"
          prop="firstOccurrenceText"
          width="160"
        />
        <el-table-column
          :label="$t('packages_dag_components_alert_gaojingzuijinfa')"
          prop="lastOccurrenceText"
          width="160"
        />
        <el-table-column
          :label="$t('alarm_event_occurrence_count')"
          prop="occurrenceCount"
          width="90"
          align="right"
        />
        <el-table-column
          :label="$t('alarm_event_notification_result')"
          min-width="150"
        >
          <template #default="{ row }">
            <DeliverySummaryTag :summary="row.deliverySummary" />
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          :label="$t('public_operation')"
          width="200"
        >
          <template #default="{ row }">
            <el-button text type="primary" @click.stop="openDetail(row)">{{
              $t('public_button_details')
            }}</el-button>
            <el-divider direction="vertical" />
            <el-button
              text
              type="primary"
              :disabled="!row.taskId || row.objectDeleted"
              @click.stop="goTask(row)"
              >{{ $t('alarm_event_go_task') }}</el-button
            >
            <el-divider direction="vertical" />
            <el-tooltip :content="$t('alarm_event_close_hint')" placement="top">
              <el-button
                text
                type="primary"
                :disabled="row.status === 'CLOESE'"
                @click.stop="handleClose(row.id)"
                >{{ $t('public_button_close') }}</el-button
              >
            </el-tooltip>
          </template>
        </el-table-column>
      </TablePage>
    </div>
    <AlarmEventDrawer v-model:visible="drawerVisible" :id="drawerId" />
  </PageContainer>
</template>

<style lang="scss" scoped>
.alarm-events-card {
  border: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
  &:hover {
    border-color: var(--el-color-primary);
  }
}
.alarm-events-summary {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.status-block {
  display: inline-block;
  min-width: 60px;
  padding: 3px 10px;
  text-align: center;
  font-weight: 500;
  border-radius: 4px;
}
</style>
