<script>
import {
  countNotifications,
  fetchNotifications,
  listNotifications,
  patchNotification,
  userLogsApi,
} from '@tap/api'
import { ALARM_LEVEL_MAP } from '@tap/business/src/shared/const'
import Cookie from '@tap/shared/src/cookie'

import { $emit, $on } from '@tap/shared/src/event'
import dayjs from 'dayjs'
import { debounce } from 'lodash-es'
import { mapState } from 'vuex'

import { TYPEMAP } from './tyepMap'
import UserOperation from './UserOperation'

export default {
  components: {
    UserOperation,
  },
  data() {
    return {
      // unRead: 0,
      loading: false,
      loadingAlarm: false,
      activeTab: 'system',
      listData: [],
      colorMap: {
        ERROR: '#D44D4D',
        WARN: '#FF7D00',
        INFO: '#2c65ff',
      },
      typeMap: TYPEMAP,
      systemMap: {
        sync: this.$t('notify_sync'),
        migration: this.$t('notify_migration'),
        dataFlow: this.$t('notify_data_flow'),
        agent: this.$t('notify_manage_sever'),
        inspect: this.$t('notify_inspect'),
        JobDDL: this.$t('notify_ddl_deal'),
        system: this.$t('notify_system'),
        Agent: 'Agent',
      },
      userOperations: [],
      alarmData: [],
      isHide: true,
    }
  },
  computed: mapState({
    unRead: (state) => state.notification.unRead,
  }),
  created() {
    this.init()
  },
  methods: {
    handleNotify() {
      this.$router.push({ name: 'notification' })
    },
    init() {
      const msg = {
        type: 'notification',
      }
      if (!Number.parseInt(Cookie.get('isAdmin'))) {
        msg.userId = Cookie.get('user_id')
      }
      this.getUnreadData()
      this.$ws.on(
        'notification',
        debounce((res) => {
          const data = res?.data
          if (data?.msg !== 'alarm') {
            if (this.isHide) {
              this.getUnReadNum()
              return
            }
            this.getUnreadData()
          }
        }, 800),
      )
      this.$ws.ready(() => {
        this.$ws.send(msg)
      }, true)
      $on(this.$root, 'notificationUpdate', () => {
        this.$ws.send(msg)
      })
    },
    getUnReadNum() {
      const where = {
        read: false,
      }
      countNotifications({ where: JSON.stringify(where) }).then((data) => {
        this.$store.commit('notification', {
          unRead: data?.count || 0,
        })
      })
    },
    getUnreadData() {
      const filter = {
        where: {
          read: false,
        },
        order: ['createTime DESC'],
        limit: 20,
        skip: 0,
      }
      fetchNotifications(filter).then((data) => {
        const { items, total } = data || {}
        this.$store.commit('notification', {
          unRead: total,
        })
        this.listData = items.map((t) => {
          t.createTime = dayjs(t.createTime).format('YYYY-MM-DD HH:mm:ss')
          return t
        })
      })
    },
    handleRead(id, type) {
      patchNotification({ read: true, id }).then(() => {
        if (type === 'alarm') {
          this.getAlarmData()
          return
        }
        this.getUnreadData()
        $emit(this.$root, 'notificationUpdate')
      })
    },
    handleGo(item) {
      switch (item.system) {
        case 'migration':
          this.$router.push({
            name: 'MigrateEditor',
            params: {
              id: item.sourceId,
            },
          })
          break
        case 'dataFlow':
          this.$router.push({
            name: 'DataflowEditor',
            params: {
              id: item.sourceId,
            },
          })
          break
        case 'agent':
          this.$router.push({
            name: 'clusterManagement',
          })
          break
      }
    },
    tabHandler(tab) {
      if (tab === 'user') {
        this.getUserOperations()
      }
      if (tab === 'alarm') {
        this.getAlarmData()
      }
    },
    getUserOperations() {
      this.loading = true
      const filter = {
        order: 'createTime DESC',
        limit: 50,
        skip: 0,
        where: {
          type: 'userOperation',
        },
      }
      userLogsApi
        .get({
          filter: JSON.stringify(filter),
        })
        .then((data) => {
          this.userOperations =
            data?.items?.map((item) => {
              item.createTimeFmt = dayjs(item.createTime).format(
                'YYYY-MM-DD HH:mm:ss',
              )
              return item
            }) || []
        })
        .finally(() => {
          this.loading = false
        })
    },
    getAlarmData() {
      const where = {
        msgType: 'ALARM',
        page: 1,
        size: 20,
        read: false,
      }
      this.loadingAlarm = true
      listNotifications(where).then((data) => {
        const list = data?.items || []
        this.alarmData = list.map((item) => {
          item.levelLabel = ALARM_LEVEL_MAP[item.level].text
          item.levelType = ALARM_LEVEL_MAP[item.level].type
          return item
        })

        this.loadingAlarm = false
      })
    },
    toCenter() {
      if (this.$route.name === 'notification') {
        return
      }
      this.$router.push({ name: 'notification' })
    },
    handleShow() {
      this.activeTab = 'system'
      this.isHide = false
      this.getUnreadData()
    },
    handleHide() {
      this.isHide = true
    },
  },
  emits: ['notificationUpdate'],
}
</script>

<template>
  <el-popover
    popper-class="notification-popover pt-1"
    placement="bottom"
    trigger="hover"
    width="450"
    @show="handleShow"
    @hide="handleHide"
  >
    <template #reference>
      <el-badge
        class="item-badge"
        :model-value="unRead"
        :max="99"
        :hidden="!unRead"
      >
        <el-button text size="large" @click="toCenter()">
          <template #icon>
            <VIcon :size="20">xiaoxi-2</VIcon>
          </template>
        </el-button>
      </el-badge>
    </template>
    <el-tabs
      v-model="activeTab"
      stretch
      class="notification-popover-wrap"
      @tab-change="tabHandler"
    >
      <ElButton
        v-if="activeTab === 'system'"
        text
        type="primary"
        @click="handleNotify"
        >{{ $t('notify_view_all_notify') }}</ElButton
      >
      <ElButton
        v-if="activeTab === 'alarm'"
        text
        type="primary"
        @click="
          $router.push({
            name: 'alarmNotification',
            query: { type: 'alarmNotice' },
          })
        "
        >{{ $t('notify_view_more') }}</ElButton
      >
      <ElButton
        v-if="activeTab === 'user'"
        text
        type="primary"
        @click="$router.push({ name: 'notification', query: { type: 'user' } })"
        >{{ $t('notify_view_more') }}</ElButton
      >
      <el-tab-pane
        class="tab-item"
        :label="$t('notify_system_notice')"
        name="system"
      >
        <div class="tab-item-container">
          <ul v-if="listData.length" class="tab-list notification-list">
            <li
              v-for="(item, index) in listData"
              :key="index"
              class="notification-item"
              @click="handleRead(item.id)"
            >
              <div class="flex flex-row">
                <div class="mr-1">
                  <span class="unread-1zPaAXtSu inline-block" />
                </div>
                <div>
                  <span :style="`color: ${colorMap[item.level]};`"
                    >【{{ item.level }}】</span
                  >
                  <span>{{ systemMap[item.system] }} </span>
                  <span v-if="item.msg === 'deleted'">
                    {{ `${item.serverName} ` }}
                  </span>
                  <span
                    v-else
                    class="cursor-pointer px-1 primary"
                    @click.stop="handleGo(item)"
                  >
                    {{ item.serverName }}
                  </span>
                  <template v-if="item.msg === 'JobDDL'">
                    <span class="list-item-platform">
                      {{
                        `${$t('notify_source_name')} : ${item.sourceName} , ${$t('notify_database_name')} : ${
                          item.databaseName
                        } , ${$t('notify_schema_name')} : ${item.schemaName} ,`
                      }}
                    </span>
                    <el-tooltip :content="item.sql" placement="top">
                      <span>
                        {{ `DDL SQL : ${item.sql}` }}
                      </span>
                    </el-tooltip>
                  </template>
                  <template v-else>
                    <span>{{ typeMap[item.msg] }}</span>
                  </template>
                  <div class="item-time">
                    <span>{{ item.createTime }}</span>
                  </div>
                </div>
              </div>
            </li>
          </ul>
          <div
            v-else
            class="notification-no-data flex h-100 justify-content-center align-items-center"
          >
            <div>
              <VIcon size="76">no-notice</VIcon>
              <div class="pt-4 fs-8 text-center font-color-slight fw-normal">
                {{ $t('notify_no_notice') }}
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane
        v-loading="loading"
        class="tab-item"
        :label="$t('notify_user_notice')"
        name="user"
      >
        <div class="tab-item-container">
          <ul v-if="userOperations.length" class="tab-list notification-list">
            <li
              v-for="record in userOperations"
              :key="record.id"
              class="notification-item"
            >
              <UserOperation :record="record" />
              <div class="item-time">
                {{ record.createTimeFmt }}
              </div>
            </li>
          </ul>
          <div
            v-else
            class="notification-no-data flex h-100 justify-content-center align-items-center"
          >
            <div>
              <VIcon size="76">no-notice</VIcon>
              <div class="pt-4 fs-8 text-center font-color-slight fw-normal">
                {{ $t('notify_view_more') }}
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane
        v-loading="loadingAlarm"
        class="tab-item"
        :label="$t('daas_notification_alarmnotification_gaojingtongzhi')"
        name="alarm"
      >
        <div class="tab-item-container">
          <ul v-if="alarmData.length" class="tab-list notification-list">
            <li
              v-for="(item, index) in alarmData"
              :key="index"
              class="notification-item"
              @click="handleRead(item.id, 'alarm')"
            >
              <div class="flex flex-row">
                <div class="mr-1">
                  <span class="unread-1zPaAXtSu inline-block" />
                </div>
                <div>
                  <span :class="[`level-${item.levelType}`]"
                    >【{{ item.title }}】</span
                  >
                  <template>
                    <span>{{ item.title }}</span>
                  </template>
                </div>
              </div>
            </li>
          </ul>
          <div
            v-else
            class="notification-no-data flex h-100 justify-content-center align-items-center"
          >
            <div>
              <VIcon size="76">no-notice</VIcon>
              <div class="pt-4 fs-8 text-center font-color-slight fw-normal">
                {{ $t('notify_no_notice') }}
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-popover>
</template>

<style lang="scss">
.notification-popover {
  overflow: hidden;
  .notification-popover-wrap {
    overflow: hidden;
    .el-tabs__header {
      color: var(--text-light);
      border-bottom: 1px solid var(--border-light);
      .el-tabs__nav-wrap {
        .el-tabs__nav-scroll {
          width: 280px;
        }
      }
      .el-tabs__item {
        font-size: 14px;
        font-weight: 400;

        &.is-active {
          // color: var(--color-primary);
          font-weight: 500;
          border-color: var(--color-primary);
        }
      }
      .el-tabs__active-bar {
        min-width: 80px !important;
      }
    }
    > .el-tabs__content {
      margin-right: -13px;
      padding: 0 !important;
      overflow: initial;
      & > .el-button {
        position: absolute;
        right: 12px;
        top: -49px;
        z-index: 10;
      }
    }
    .tab-item {
      margin-bottom: 1px;
    }
  }
}
</style>

<style lang="scss" scoped>
.notification-popover-wrap {
  overflow: hidden;
  position: relative;

  .notice-footer {
    display: flex;
    justify-content: space-between;
    font-size: var(--font-base-title);
    height: 40px;
    line-height: 40px;
    padding: 0 25px;
    background: rgba(241, 241, 241, 1);
    border-top: 1px solid rgba(222, 222, 228, 1);
    .notice-footer-text,
    .more-text {
      display: inline-block;
      cursor: pointer;
      color: var(--text-light);
    }
  }
  .tab-item {
    .tab-item-container {
      display: flex;
      flex-direction: column;
      height: 362px;
      overflow: hidden;
      margin-bottom: -1px;
      .tab-list {
        flex: 1;
        overflow-y: auto;
      }
    }
    .notification-list {
      box-sizing: border-box;
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
    }
  }
}
</style>
