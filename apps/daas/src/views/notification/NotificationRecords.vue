<script>
import {
  listNotificationRecords,
  previewNotificationReadState,
  updateNotificationReadState,
} from '@tap/api/src/core/notification'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import TablePage from '@tap/business/src/components/TablePage.vue'
import { ALARM_LEVEL_MAP } from '@tap/business/src/shared/const'
import { FilterBar } from '@tap/component/src/filter-bar'
import { $emit } from '@tap/shared/src/event'
import dayjs from 'dayjs'
import i18n from '@/i18n'
import DeliverySummaryTag from './DeliverySummaryTag.vue'
import NotificationRecordDrawer from './NotificationRecordDrawer.vue'

const TABS = ['ALL', 'UNREAD', 'FAILED']

export default {
  components: {
    TablePage,
    FilterBar,
    PageContainer,
    DeliverySummaryTag,
    NotificationRecordDrawer,
  },
  data() {
    const query = { ...this.$route.query }
    if (!query.start && !query.end) {
      // 默认最近 7 天
      query.start = dayjs().subtract(7, 'day').startOf('day').valueOf()
    }
    return {
      tabs: TABS,
      tab: TABS.includes(query.tab) ? query.tab : 'ALL',
      filterItems: [],
      searchParams: query,
      multipleSelection: [],
      drawerVisible: false,
      drawerId: '',
    }
  },
  computed: {
    table() {
      return this.$refs.table
    },
  },
  watch: {
    '$route.query': function (query) {
      this.searchParams = { ...query }
      this.tab = TABS.includes(query.tab) ? query.tab : 'ALL'
      this.table.fetch(1)
    },
  },
  created() {
    this.getFilterItems()
  },
  methods: {
    currentParams() {
      return { ...this.searchParams, tab: this.tab }
    },
    switchTab(tab) {
      this.$router.replace({
        name: this.$route.name,
        query: { ...this.$route.query, tab },
      })
    },
    getData({ page }) {
      const { current, size } = page
      return listNotificationRecords({
        ...this.currentParams(),
        page: current,
        size,
      }).then((data) => ({
        total: data?.total || 0,
        data: (data?.items || []).map((item) => ({
          ...item,
          levelLabel: ALARM_LEVEL_MAP[item.level]?.text || item.level,
          levelType: ALARM_LEVEL_MAP[item.level]?.type,
          firstOccurrenceText: this.fmt(item.firstOccurrenceTime),
          lastOccurrenceText: this.fmt(item.lastOccurrenceTime),
          latestNotifyText: this.fmt(item.latestNotifyTime),
        })),
      }))
    },
    fmt(time) {
      return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : ''
    },
    getFilterItems() {
      const option = (prefix) => (value) => ({
        label: i18n.t(`${prefix}${value.toLowerCase()}`),
        value,
      })
      this.filterItems = [
        {
          title: i18n.t('notification_record_notify_time'),
          type: 'datetimerange',
          key: 'start,end',
        },
        {
          label: i18n.t('packages_dag_components_alert_gaojingjibie'),
          key: 'level',
          type: 'select-inner',
          items: ['NORMAL', 'WARNING', 'CRITICAL', 'EMERGENCY', 'RECOVERY'].map(
            (value) => ({
              label: ALARM_LEVEL_MAP[value].text,
              value,
            }),
          ),
        },
        {
          label: i18n.t('notification_record_channel'),
          key: 'channel',
          type: 'select-inner',
          items: ['SYSTEM', 'EMAIL', 'SMS', 'WECHAT'].map(
            option('delivery_channel_'),
          ),
        },
        {
          label: i18n.t('notification_record_delivery_status'),
          key: 'deliveryStatus',
          type: 'select-inner',
          items: ['SUCCESS', 'PARTIAL_FAILED', 'FAILED', 'SKIPPED', 'NONE'].map(
            option('delivery_status_'),
          ),
        },
        {
          label: i18n.t('notification_record_read_state'),
          key: 'read',
          type: 'select-inner',
          items: [
            { label: i18n.t('notification_record_read'), value: 'true' },
            { label: i18n.t('notification_record_unread'), value: 'false' },
          ],
        },
        {
          placeholder: i18n.t('notification_record_recipient_placeholder'),
          key: 'recipient',
          type: 'input',
          width: '180px',
        },
        {
          placeholder: i18n.t('notification_record_keyword_placeholder'),
          key: 'keyword',
          type: 'input',
        },
      ]
    },
    openDetail(row) {
      this.drawerId = row.id
      this.drawerVisible = true
    },
    refresh() {
      this.table.fetch()
      $emit(this.$root, 'notificationUpdate')
    },
    async markSelected(read) {
      const ids = this.multipleSelection.map((item) => item.id)
      if (!ids.length) return
      await this.confirmScope(ids.length, read)
      await updateNotificationReadState(ids, read)
      this.refresh()
    },
    async markAll(read) {
      // “全部”先由服务端按当前筛选计算影响范围，确认后再按明确 ID 执行
      const preview = await previewNotificationReadState(
        this.currentParams(),
        read,
      )
      if (!preview?.count) {
        this.$message.info(i18n.t('notification_record_nothing_to_mark'))
        return
      }
      await this.confirmScope(preview.count, read, preview.truncated)
      await updateNotificationReadState(preview.ids, read)
      this.refresh()
    },
    confirmScope(count, read, truncated) {
      const message = i18n.t(
        read
          ? 'notification_record_confirm_read'
          : 'notification_record_confirm_unread',
        [count],
      )
      return this.$confirm(
        truncated
          ? `${message} ${i18n.t('notification_record_truncated')}`
          : message,
        i18n.t('public_message_title_prompt'),
        { type: 'warning' },
      )
    },
    async toggleRow(row) {
      await updateNotificationReadState([row.id], row.unread)
      this.refresh()
    },
  },
}
</script>

<template>
  <PageContainer>
    <template #actions>
      <el-button
        :disabled="!multipleSelection.length"
        @click="markSelected(true)"
      >
        {{ $t('notification_record_mark_read') }}
      </el-button>
      <el-button
        :disabled="!multipleSelection.length"
        @click="markSelected(false)"
      >
        {{ $t('notification_record_mark_unread') }}
      </el-button>
      <el-button type="primary" @click="markAll(true)">
        {{ $t('notification_record_mark_all_read') }}
      </el-button>
      <el-button
        text
        type="primary"
        @click="$router.push({ name: 'notificationSetting' })"
      >
        {{ $t('notify_setting') }}
      </el-button>
    </template>
    <div class="flex flex-column h-100 overflow-hidden">
      <el-tabs :model-value="tab" @tab-change="switchTab">
        <el-tab-pane
          v-for="item in tabs"
          :key="item"
          :name="item"
          :label="$t(`notification_record_tab_${item.toLowerCase()}`)"
        />
      </el-tabs>
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
        <el-table-column width="28">
          <template #default="{ row }">
            <span v-if="row.unread" class="notification-unread-dot" />
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('packages_dag_components_alert_gaojingjibie')"
          width="100"
        >
          <template #default="{ row }">
            <span :class="[`status-${row.levelType}`, 'status-block']">{{
              row.levelLabel
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('notification_record_content')"
          min-width="220"
        >
          <template #default="{ row }">
            <div class="ellipsis" :class="{ 'fw-sub': row.unread }">
              {{ row.title }}
            </div>
            <div v-if="row.legacy" class="color-info fs-8">
              {{ $t('notification_record_legacy') }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('alarm_event_task')"
          prop="taskName"
          min-width="140"
        />
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
          :label="$t('notification_record_delivery')"
          min-width="160"
        >
          <template #default="{ row }">
            <DeliverySummaryTag :summary="row.deliverySummary" />
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('notification_record_latest_notify')"
          prop="latestNotifyText"
          width="160"
        />
        <el-table-column
          fixed="right"
          :label="$t('public_operation')"
          width="170"
        >
          <template #default="{ row }">
            <el-button text type="primary" @click.stop="openDetail(row)">{{
              $t('public_button_details')
            }}</el-button>
            <el-divider direction="vertical" />
            <el-button text type="primary" @click.stop="toggleRow(row)">
              {{
                row.unread
                  ? $t('notification_record_mark_read')
                  : $t('notification_record_mark_unread')
              }}
            </el-button>
          </template>
        </el-table-column>
      </TablePage>
    </div>
    <NotificationRecordDrawer
      v-model:visible="drawerVisible"
      :id="drawerId"
      @changed="refresh"
    />
  </PageContainer>
</template>

<style lang="scss" scoped>
.notification-unread-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--el-color-danger);
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
