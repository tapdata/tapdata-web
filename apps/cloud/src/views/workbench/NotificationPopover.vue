<script>
import { listNotifications, patchNotification } from '@tap/api'
import { ALARM_LEVEL_MAP } from '@tap/business/src/shared/const'

import { $emit } from '@tap/shared/src/event'
import { debounce, uniqBy } from 'lodash-es'
import timeFunction from '@/mixins/timeFunction'
import { TYPEMAP } from './tyepMap'

export default {
  mixins: [timeFunction],
  emits: ['notificationUpdate'],
  data() {
    return {
      loading: false,
      activeTab: 'system',
      unRead: 0,
      listData: [],
      colorMap: {
        ERROR: 'red',
        WARN: 'orangered',
        INFO: '#409EFF',
      },
      typeMap: TYPEMAP,
      systemMap: {
        sync: this.$t('notify_sync_task'),
        migration: this.$t('notify_migration_task'),
        dataFlow: this.$t('notify_task'),
        agent: this.$t('notify_agent'),
        inspect: this.$t('notify_inspect'),
        JobDDL: this.$t('notify_jobDDL'),
      },
      userOperations: [],
      visible: false,
      form: {},
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      const msg = {
        type: 'notification',
      }
      this.getUnreadData()
      if (this.$ws) {
        this.$ws.on(
          'notification',
          debounce((res) => {
            const data = res?.data
            if (data?.msg !== 'alarm') {
              this.getUnreadData(false)
            }
            if (data) {
              data.levelLabel = ALARM_LEVEL_MAP[data.level]?.text
              data.levelType = ALARM_LEVEL_MAP[data.level]?.type
              this.listData = uniqBy([data, ...this.listData])
            }
          }, 800),
        )
        this.$ws.ready(() => {
          this.$ws.send(msg)
        }, true)
        // this.$root.$on('notificationUpdate', () => {
        //   this.$ws.send(msg)
        // })
      }
    },
    // 获取未读的消息数量
    getUnReadNum() {
      const where = {
        read: false,
      }
      return this.$axios
        .get(
          `tm/api/Messages/count?where=${encodeURIComponent(
            JSON.stringify(where),
          )}`,
        )
        .then((res) => {
          this.unRead = res
        })
    },
    getUnreadData(loadData = true) {
      const where = {
        msgType: 'ALARM',
        page: 1,
        size: 20,
        read: false,
      }
      listNotifications(where).then((data) => {
        const list = data?.items || []
        this.unRead = data?.total
        loadData &&
          (this.listData = list.map((item) => {
            item.levelLabel = ALARM_LEVEL_MAP[item.level].text
            item.levelType = ALARM_LEVEL_MAP[item.level].type
            return item
          }))
      })
    },
    // 已读消息
    handleRead(id) {
      patchNotification({ read: true, id }).then(() => {
        this.getUnreadData()
        $emit(this.$root, 'notificationUpdate')
      })
    },
    // 跳转消息详情
    toCenter() {
      if (this.$route.name === 'SystemNotice') {
        return
      }
      this.$router.push({ name: 'SystemNotice' })
    },
  },
}
</script>

<template>
  <ElPopover
    placement="bottom"
    popper-class="notive-popove"
    width="380"
    trigger="hover"
    @show="activeTab = 'system'"
  >
    <template #reference>
      <ElBadge :value="unRead" :max="99" :hidden="!unRead">
        <el-button text size="large" @click="toCenter()">
          <VIcon size="16">lingdang</VIcon>
          <span class="ml-1">{{ $t('header_notify') }}</span>
        </el-button>
      </ElBadge>
    </template>
    <div class="notification-popover-wrap">
      <div class="tab-item-container">
        <div class="notice-header">
          <span> {{ $t('header_notification_content') }} </span>
        </div>
        <ul class="tab-list cuk-list">
          <li
            v-for="(item, index) in listData"
            :key="index"
            class="notification-item cursor-pointer"
            @click="handleRead(item.id, 'alarm')"
          >
            <div class="flex flex-row">
              <div class="mr-1">
                <span class="unread-1zPaAXtSu inline-block" />
              </div>
              <div>
                <span :class="[`level-${item.levelType}`]"
                  >【{{ item.levelLabel }}】</span
                >
                <template>
                  <span>{{ item.title }}</span>
                </template>
              </div>
            </div>
          </li>
        </ul>
        <div v-if="listData.length < 1" class="connection-table__empty">
          <VIcon size="76">notice-color</VIcon>
          <span>{{ $t('header_no_notice') }}</span>
        </div>
        <div
          class="tab-item__footer flex justify-content-end py-3 font-color-sub"
        >
          <ElLink class="font-color-sub" @click="toCenter()">{{
            $t('header_view_notifications')
          }}</ElLink>
        </div>
      </div>
    </div>
  </ElPopover>
</template>

<style lang="scss">
.el-popover__reference-wrapper {
  .btn {
    cursor: pointer;
    .item-badge {
      .el-badge__content {
        left: 0;
        right: inherit;
        height: 15px;
        line-height: 15px;
        padding: 0 5px;
        border: 0;
        transform: translateY(-50%) translateX(30%);
      }
    }
  }

  .notification-popover-wrap {
    > .el-tabs__content {
      padding: 0 !important;
    }
    .tab-item {
      margin-bottom: 1px;
    }
  }
}
</style>

<style lang="scss" scoped>
.notive-popove {
  .notification-popover-wrap {
    margin: -12px;
    width: 380px;
    overflow: hidden;
    position: relative;
    border-radius: 3px;

    .notice-header {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      height: 50px;
      line-height: 50px;
      color: #000;
      border-bottom: 1px solid #f2f2f2;

      .notice-header-text {
        display: inline-block;
        cursor: pointer;
      }
    }

    .tab-item-container {
      display: flex;
      flex-direction: column;
      height: 262px;
      padding: 0 16px 0;
      overflow: hidden;
      position: relative;
    }
    .cuk-list {
      font-size: 12px;
      overflow-y: auto;
    }
    .notification-item {
      padding: 5px 20px 4px 20px;
      border-bottom: 1px solid var(--border-light);
      font-size: var(--font-base-title);
      color: var(--text-light);
      .primary {
        color: var(--color-primary);
      }
      .unread-1zPaAXtSu {
        top: 22px;
        left: 8px;
        width: 6px;
        height: 6px;
        background: #ee5353;
        border-radius: 50%;
      }
      &:hover {
        background-color: #ecf5ff;
      }
      &:last-child {
        border: none;
      }
      .item-time {
        margin-top: 5px;
        color: var(--text-light);
        font-size: var(--font-base-title);
      }
    }
    .connection-table__empty {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      justify-content: center;
      align-items: center;
      span {
        display: inline-block;
        line-height: 20px;
        padding-top: 10px;
        font-size: 12px;
      }
    }
  }
}
</style>
