<template>
  <el-popover popper-class="notification-popover" placement="bottom" trigger="hover" @show="activeTab = 'system'">
    <div class="btn" slot="reference" @click="toCenter()">
      <el-badge class="item-badge icon-btn px-3" :value="unRead" :max="99" :hidden="!unRead">
        <VIcon size="16">xiaoxi-2</VIcon>
      </el-badge>
    </div>
    <el-tabs stretch class="notification-popover-wrap" v-model="activeTab" @tab-click="tabHandler">
      <ElButton type="text" v-if="activeTab === 'system'" @click="handleNotify">{{
        $t('notify_view_all_notify')
      }}</ElButton>
      <ElButton type="text" v-else @click="$router.push({ name: 'notification', query: { type: 'user' } })">{{
        $t('notify_view_more')
      }}</ElButton>
      <el-tab-pane class="tab-item" :label="$t('notify_system_notice')" name="system">
        <div class="tab-item-container">
          <ul class="tab-list notification-list" v-if="listData.length">
            <li class="notification-item" v-for="(item, index) in listData" :key="index" @click="handleRead(item.id)">
              <div class="flex flex-row">
                <div class="mr-1">
                  <span class="unread-1zPaAXtSu inline-block"></span>
                </div>
                <div>
                  <span :style="`color: ${colorMap[item.level]};`">【{{ item.level }}】</span>
                  <span>{{ systemMap[item.system] }} </span>
                  <span v-if="item.msg === 'deleted'">
                    {{ `${item.serverName} ` }}
                  </span>
                  <span v-else class="cursor-pointer px-1 primary" @click="handleGo(item)">
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
          <div v-else class="notification-no-data flex h-100 justify-content-center align-items-center">
            <div>
              <VIcon size="76">no-notice</VIcon>
              <div class="pt-4 fs-8 text-center font-color-slight fw-normal">{{ $t('notify_no_notice') }}</div>
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane class="tab-item" :label="$t('notify_user_notice')" name="user" v-loading="loading">
        <div class="tab-item-container">
          <ul class="tab-list notification-list" v-if="userOperations.length">
            <li class="notification-item" v-for="record in userOperations" :key="record.id">
              <UserOperation :record="record"></UserOperation>
              <div class="item-time">
                {{ record.createTimeFmt }}
              </div>
            </li>
          </ul>
          <div v-else class="notification-no-data flex h-100 justify-content-center align-items-center">
            <div>
              <VIcon size="76">no-notice</VIcon>
              <div class="pt-4 fs-8 text-center font-color-slight fw-normal">{{ $t('notify_view_more') }}</div>
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane class="tab-item" label="告警通知" name="alarm" v-loading="loadingAlarm">
        <div class="tab-item-container">
          <ul class="tab-list notification-list" v-if="alarmData.length">
            <li class="notification-item" v-for="(item, index) in alarmData" :key="index" @click="handleRead(item.id)">
              <div class="flex flex-row">
                <div class="mr-1">
                  <span class="unread-1zPaAXtSu inline-block"></span>
                </div>
                <div>
                  <span :style="`color: ${colorMap[item.level]};`">【{{ item.level }}】</span>
                  <template>
                    <span>{{ item.title }}</span>
                  </template>
                </div>
              </div>
            </li>
          </ul>
          <div v-else class="notification-no-data flex h-100 justify-content-center align-items-center">
            <div>
              <VIcon size="76">no-notice</VIcon>
              <div class="pt-4 fs-8 text-center font-color-slight fw-normal">{{ $t('notify_no_notice') }}</div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-popover>
</template>

<script>
import UserOperation from './UserOperation'
import { TYPEMAP } from './tyepMap'
import { mapState } from 'vuex'
import { VIcon } from '@tap/component'
import { uniqueArr } from '@/utils/util'
import Cookie from '@tap/shared/src/cookie'
import dayjs from 'dayjs'
import { userLogsApi, notificationApi } from '@tap/api'

export default {
  components: {
    UserOperation,
    VIcon
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
        EMERGENCY: '#D44D4D',
        WARNING: '#FF7D00',
        CRITICAL: '#c88500'
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
        Agent: 'Agent'
      },
      userOperations: [],
      alarmData: []
    }
  },
  computed: mapState({
    unRead: state => state.notification.unRead
  }),
  created() {
    this.init()
  },
  methods: {
    handleNotify() {
      this.$router.push({ name: 'notification' })
    },
    init() {
      let self = this
      let msg = {
        type: 'notification'
      }
      if (!parseInt(Cookie.get('isAdmin'))) {
        msg.userId = Cookie.get('user_id')
      }
      this.getUnreadData()
      this.$ws.on('notification', res => {
        // this.getUnReadNum()
        this.getUnreadData()
        let data = res?.data
        if (data) {
          data.createTime = dayjs(data.createTime).format('YYYY-MM-DD HH:mm:ss')
          self.listData = uniqueArr([data, ...this.listData])
        }
      })
      this.$ws.ready(() => {
        this.$ws.send(msg)
      }, true)
      this.$root.$on('notificationUpdate', () => {
        this.$ws.send(msg)
      })
    },
    getUnReadNum() {
      let where = {
        read: false
      }
      notificationApi.count({ where: JSON.stringify(where) }).then(data => {
        this.$store.commit('notification', {
          unRead: data || 0
        })
      })
    },
    getUnreadData() {
      let filter = {
        where: {
          read: false
        },
        order: ['createTime DESC'],
        limit: 20,
        skip: 0
      }
      notificationApi.get({ filter: JSON.stringify(filter) }).then(data => {
        let { items, total } = data || {}
        this.$store.commit('notification', {
          unRead: total
        })
        this.listData = items.map(t => {
          t.createTime = dayjs(t.createTime).format('YYYY-MM-DD HH:mm:ss')
          return t
        })
      })
    },
    handleRead(id) {
      notificationApi.patch({ read: true, id: id }).then(() => {
        this.getUnreadData()
        this.$root.$emit('notificationUpdate')
      })
    },
    handleGo(item) {
      switch (item.system) {
        case 'dataFlow':
          this.$router.push({
            name: 'job',
            query: {
              id: item.sourceId,
              isMoniting: true,
              mapping: item.mappingTemplate
            }
          })
          break
        case 'inspect':
          if (item.msg !== 'inspectDelete') {
            let url = ''
            let route = this.$router.resolve({
              name: 'dataVerifyDetails',
              params: {
                id: item.inspectId
              }
            })
            url = route.href
            window.open(url, '_blank')
          }
          break
        case 'agent':
          this.$router.push({
            name: 'clusterManagement'
          })
          break
      }
    },
    tabHandler() {
      if (this.activeTab === 'user') {
        this.getUserOperations()
      }
      if (this.activeTab === 'alarm') {
        this.getAlarmData()
      }
    },
    getUserOperations() {
      this.loading = true
      let filter = {
        order: 'createTime DESC',
        limit: 50,
        skip: 0,
        where: {
          type: 'userOperation'
        }
      }
      userLogsApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(data => {
          this.userOperations =
            data?.items?.map(item => {
              item.createTimeFmt = dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')
              return item
            }) || []
        })
        .finally(() => {
          this.loading = false
        })
    },
    getAlarmData() {
      let where = {
        msgType: 'ALARM',
        page: 1,
        size: 20,
        read: false
      }
      this.loadingAlarm = true
      notificationApi.list(where).then(data => {
        this.alarmData = data?.items || []
        this.loadingAlarm = false
      })
    },
    toCenter() {
      if (this.$route.name === 'notification') {
        return
      }
      this.$router.push({ name: 'notification' })
    }
  }
}
</script>
<style lang="scss">
.notification-popover {
  overflow: hidden;
  .notification-popover-wrap {
    padding: 10px 16px;
    overflow: hidden;
    .el-tabs__header {
      color: map-get($fontColor, light);
      border-bottom: 1px solid map-get($borderColor, light);
      .el-tabs__nav-wrap {
        .el-tabs__nav-scroll {
          width: 270px;
        }
      }
      .el-tabs__item {
        font-size: 14px;
        font-weight: 400;

        &.is-active {
          // color: map-get($color, primary);
          font-weight: 500;
          border-color: map-get($color, primary);
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
        right: 13px;
        top: -52px;
        font-weight: 400;
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
  margin: -15px;
  width: 440px;
  overflow: hidden;
  position: relative;
  border-radius: 3px;

  .notice-footer {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    height: 40px;
    line-height: 40px;
    padding: 0 25px;
    background: rgba(241, 241, 241, 1);
    border-top: 1px solid rgba(222, 222, 228, 1);
    .notice-footer-text,
    .more-text {
      display: inline-block;
      cursor: pointer;
      color: map-get($fontColor, light);
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
        border-bottom: 1px solid map-get($borderColor, light);
        font-size: 12px;
        color: map-get($fontColor, light);
        .primary {
          color: map-get($color, primary);
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
          color: map-get($fontColor, light);
          font-size: 12px;
        }
      }
    }
  }
}
</style>
