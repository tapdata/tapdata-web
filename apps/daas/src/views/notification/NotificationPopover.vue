<script setup lang="ts">
import { getLicenseExpires } from '@tap/api/src/core/licenses'
import {
  getUnreadNotificationCount,
  listNotificationRecords,
  previewNotificationReadState,
  updateNotificationReadState,
  type NotificationRecord,
} from '@tap/api/src/core/notification'
import { ALARM_LEVEL_MAP } from '@tap/business/src/shared/const'
import Cookie from '@tap/shared/src/cookie'
import { getSettingByKey } from '@tap/shared/src/settings'
import { $on } from '@tap/shared/src/event'
import dayjs from 'dayjs'
import { ElMessageBox } from 'element-plus'
import { debounce } from 'lodash-es'
import { computed, getCurrentInstance, inject, onMounted, ref } from 'vue'
import { useI18n } from '@tap/i18n'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import NotificationRecordDrawer from './NotificationRecordDrawer.vue'

/**
 * 铃铛：只承担个人待处理消息入口——未读的站内告警通知，以及管理员的许可证平台提醒。
 */
const { t } = useI18n()
const router = useRouter()
const store = useStore()
const instance = getCurrentInstance()

const loading = ref(false)
const records = ref<NotificationRecord[]>([])
const licenseDays = ref<number | null>(null)
const drawerVisible = ref(false)
const drawerId = ref('')

const unRead = computed(() => store.state.notification?.unRead || 0)
const isAdmin = Number.parseInt(Cookie.get('isAdmin') || '0') === 1
const hasPermissionByCode = inject<(code: string) => boolean>(
  'hasPermissionByCode',
)
// 铃铛只展示发给自己的通知；查看全部通知记录需要通知记录权限
const canViewAll = hasPermissionByCode?.('v2_notification_record') ?? false

const fmt = (time?: string) =>
  time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : ''

async function loadCount() {
  const count = await getUnreadNotificationCount()
  store.commit('notification', { unRead: count || 0 })
}

async function loadRecords() {
  loading.value = true
  try {
    const data = await listNotificationRecords({
      tab: 'UNREAD',
      page: 1,
      size: 10,
    })
    records.value = data?.items || []
  } finally {
    loading.value = false
  }
}

async function loadLicense() {
  if (!isAdmin) return
  const data: any = await getLicenseExpires()
  const showDay = Number(getSettingByKey('licenseNoticeDays') || 0)
  if (!data?.expires_on) return
  const days = Math.floor((Number(data.expires_on) - Date.now()) / 86400000)
  licenseDays.value = showDay > days ? days : null
}

const refresh = debounce(() => {
  loadCount()
  loadRecords()
}, 800)

function open(record: NotificationRecord) {
  drawerId.value = record.id
  drawerVisible.value = true
}

async function markAllRead() {
  const preview = await previewNotificationReadState({ tab: 'UNREAD' }, true)
  if (!preview?.count) return
  await ElMessageBox.confirm(
    t('notification_record_confirm_read', [preview.count]),
    t('public_message_title_prompt'),
    { type: 'warning' },
  )
  await updateNotificationReadState(preview.ids, true)
  refresh()
}

function viewAll() {
  if (!canViewAll) return
  router.push({ name: 'notificationRecords' })
}

onMounted(() => {
  loadCount()
  loadLicense()
  const ws = instance?.proxy?.$ws
  ws?.on('notification', refresh)
  $on(instance?.proxy?.$root, 'notificationUpdate', refresh)
})
</script>

<template>
  <el-popover
    popper-class="notification-popover pt-1"
    placement="bottom"
    trigger="hover"
    width="420"
    @show="loadRecords"
  >
    <template #reference>
      <el-badge
        class="item-badge"
        :model-value="unRead"
        :max="99"
        :hidden="!unRead"
      >
        <el-button text size="large" @click="viewAll">
          <template #icon>
            <VIcon :size="20">xiaoxi-2</VIcon>
          </template>
        </el-button>
      </el-badge>
    </template>
    <div class="flex align-center justify-content-between px-1 pb-2">
      <span class="fw-sub">{{
        t('notification_bell_title', [unRead > 99 ? '99+' : unRead])
      }}</span>
      <el-button
        text
        type="primary"
        size="small"
        :disabled="!unRead"
        @click="markAllRead"
      >
        {{ t('notification_record_mark_all_read') }}
      </el-button>
    </div>
    <el-alert
      v-if="licenseDays !== null"
      type="warning"
      :closable="false"
      show-icon
      class="mb-2 cursor-pointer"
      :title="t('notification_platform_license', [licenseDays])"
      @click="router.push({ name: 'License' })"
    />
    <div v-loading="loading" class="notification-bell-list">
      <ul v-if="records.length">
        <li
          v-for="record in records"
          :key="record.id"
          class="notification-bell-item px-1 py-2 cursor-pointer"
          @click="open(record)"
        >
          <div class="flex align-center gap-1">
            <span class="notification-bell-dot" />
            <span class="fs-8 color-warning">
              [{{ ALARM_LEVEL_MAP[record.level]?.text || record.level }}]
            </span>
            <span class="ellipsis flex-1">{{ record.title }}</span>
          </div>
          <div class="color-info fs-8 mt-1 pl-3">
            {{ record.taskName }} · {{ fmt(record.latestNotifyTime) }}
          </div>
        </li>
      </ul>
      <div v-else class="flex justify-content-center align-items-center py-6">
        <div class="text-center">
          <VIcon size="64">no-notice</VIcon>
          <div class="pt-2 fs-8 font-color-slight">
            {{ t('notify_no_notice') }}
          </div>
        </div>
      </div>
    </div>
    <div v-if="canViewAll" class="text-center pt-2 border-top">
      <el-button text type="primary" @click="viewAll">{{
        t('notification_view_all_records')
      }}</el-button>
    </div>
    <NotificationRecordDrawer
      v-model:visible="drawerVisible"
      :id="drawerId"
      @changed="refresh"
    />
  </el-popover>
</template>

<style lang="scss" scoped>
.notification-bell-list {
  max-height: 420px;
  overflow-y: auto;
}
.notification-bell-item:hover {
  background: var(--el-fill-color-light);
}
.notification-bell-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--el-color-danger);
}
</style>
