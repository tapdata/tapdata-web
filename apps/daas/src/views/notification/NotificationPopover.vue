<template>
  <el-popover popper-class="notification-popover" placement="bottom" trigger="hover" @show="activeTab = 'system'">
    <div class="btn" slot="reference" @click="toCenter()">
      <el-badge class="item-badge" :value="unRead" :max="99" :hidden="!unRead">
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
          <ul class="tab-list cuk-list" v-if="listData.length">
            <li class="list-item" v-for="(item, index) in listData" :key="index" @click="handleRead(item.id)">
              <div class="list-item-content" v-if="item.msg === 'JobDDL'">
                <div class="unread-1zPaAXtSu" v-show="!item.read"></div>
                <div class="list-item-desc">
                  <span :style="`color: ${colorMap[item.level]};`">{{ item.level }}</span>
                  <span>{{ systemMap[item.system] }}</span>
                  <router-link :to="`/job?id=${item.sourceId}&isMoniting=true&mapping=` + item.mappingTemplate">
                    <span class="link-primary">
                      {{ `${item.serverName} , ` }}
                    </span>
                  </router-link>
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
                </div>
                <div class="list-item-time">
                  <span>{{ item.createTime }}</span>
                </div>
              </div>
              <div class="list-item-content" v-else>
                <div class="unread-1zPaAXtSu"></div>
                <div class="list-item-desc">
                  <span :style="`color: ${colorMap[item.level]};`">{{ item.level }}</span>
                  <span>{{ systemMap[item.system] }}</span>
                  <span class="link-primary" @click="handleGo(item)">
                    {{ item.serverName }}
                  </span>
                  <span>{{ typeMap[item.msg] }}</span>
                  <span v-if="item.CDCTime">{{ getLag(item.CDCTime) }}</span>
                </div>
                <div class="list-item-time">
                  <span>{{ item.createTime }}</span>
                </div>
              </div>
            </li>
          </ul>
          <div v-else class="notification-no-data flex h-100 justify-content-center align-items-center">
            <div>
              <VIcon size="76">no-notice</VIcon>
              <div class="pt-4 fs-8 text-center font-color-slight fw-normal">{{ $t('notify_view_more') }}</div>
            </div>
          </div>
          <!-- <div class="notice-footer">
            <span v-readonlybtn="'home_notice_settings'">
              <router-link to="/settingCenter/notificationSetting">
                <span>
                  {{ $t('notify_setting') }}
                </span>
              </router-link>
            </span>
            <span class="notice-footer-text">
              <router-link to="/notification">
                <span>
                  {{ $t('notify_view_more') }}
                </span>
              </router-link>
            </span>
          </div> -->
        </div>
      </el-tab-pane>
      <el-tab-pane class="tab-item" :label="$t('notify_user_notice')" name="user" v-loading="loading">
        <div class="tab-item-container">
          <ul class="tab-list notification-list" v-if="userOperations.length">
            <li class="notification-item" v-for="record in userOperations" :key="record.id">
              <UserOperation :record="record"></UserOperation>
              <div class="item-time">
                {{ $moment(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
              </div>
            </li>
          </ul>
          <div v-else class="notification-no-data flex h-100 justify-content-center align-items-center">
            <div>
              <VIcon size="76">no-notice</VIcon>
              <div class="pt-4 fs-8 text-center font-color-slight fw-normal">{{ $t('notify_view_more') }}</div>
            </div>
          </div>
          <!-- <div class="notice-footer">
            <span></span>
            <router-link to="/notification?type=user">
              <span class="more-text">
                {{ $t('notify_view_more') }}
              </span>
            </router-link>
          </div> -->
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-popover>
</template>

<script>
import UserOperation from './UserOperation'
import { TYPEMAP } from './tyepMap'
import { mapState } from 'vuex'
import VIcon from 'web-core/components/VIcon'

export default {
  components: {
    UserOperation,
    VIcon
  },
  data() {
    return {
      loading: false,
      activeTab: 'system',
      listData: [],
      colorMap: {
        ERROR: 'red',
        WARN: 'orangered',
        INFO: '#409EFF'
      },
      typeMap: TYPEMAP,
      systemMap: {
        sync: this.$t('notify_sync'),
        migration: this.$t('notify_migration'),
        dataFlow: this.$t('notify_data_flow'),
        agent: this.$t('notify_manage_sever'),
        inspect: this.$t('notify_inspect'),
        JobDDL: this.$t('notify_ddl_deal'),
        system: this.$t('notify_system')
      },
      userOperations: []
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
      let msg = {
        type: 'notification'
      }
      if (!parseInt(this.$cookie.get('isAdmin'))) {
        msg.userId = this.$cookie.get('user_id')
      }
      this.getUnReadNum()
      this.$ws.on('notification', data => {
        if (data.data && data.data.length > 0) {
          this.listData.unshift(...data.data)
          this.getUnReadNum()
        }
        //格式化日期
        if (this.listData && this.listData.length > 0) {
          this.listData.map(item => {
            item['createTime'] = item.createTime ? this.$moment(item.createTime).format('YYYY-MM-DD HH:mm:ss') : ''
          })
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
      this.$api('notification')
        .count({ where: JSON.stringify(where) })
        .then(res => {
          if (res.data) {
            this.$store.commit('notification', {
              unRead: res.data.count
            })
          }
        })
    },
    handleRead(id) {
      this.$api('notification')
        .patch({ read: true, id: id })
        .then(res => {
          if (res.data) {
            this.listData = []
            this.$root.$emit('notificationUpdate')
          }
        })
    },
    getLag(lag) {
      let r = '0s'
      if (lag) {
        let m = this.$moment.duration(lag, 'seconds')
        if (m.days()) {
          r = m.days() + 'd'
        } else if (m.hours()) {
          r = m.hours() + 'h'
        } else if (m.minutes()) {
          r = m.minutes() + 'm'
        } else {
          r = lag + 's'
        }
      }
      return r
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
      this.$api('UserLogs')
        .get({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          this.userOperations = res.data?.items || []
        })
        .finally(() => {
          this.loading = false
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
      border-bottom: 1px solid map-get($borderColor, light);
      .el-tabs__nav-wrap {
        .el-tabs__nav-scroll {
          width: 200px;
        }
      }
      .el-tabs__item {
        font-size: 14px;
        font-weight: 500;
        color: map-get($fontColor, slight);
        &.is-active {
          color: map-get($color, primary);
          font-weight: 400;
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
    .cuk-list {
      font-size: 12px;
      .list-item {
        position: relative;
        background: #fff;
        border-bottom: 1px solid #dedee4;
        padding: 0 5px 5px 0;
        cursor: pointer;
        &:hover {
          background-color: #ecf5ff;
        }
        .list-item-content {
          position: relative;
          height: 40px;
          line-height: 40px;
          padding-left: 14px;
          box-sizing: border-box;
          overflow: hidden;
          display: block;
        }
        .unread-1zPaAXtSu {
          position: absolute;
          top: 22px;
          left: 8px;
          width: 6px;
          height: 6px;
          background: #f81d22;
          border-radius: 50%;
        }
        .list-item-desc {
          color: map-get($fontColor, light);
          position: absolute;
          top: -5px;
          left: 30px;
          right: 20px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          span {
            font-size: 12px;
          }
        }
        .list-item-platform {
          color: map-get($fontColor, light);
        }
        .list-item-time {
          margin: 15px 0 0 17px;
          color: #aaa;
          font-size: 12px;
        }
      }
    }
    .notification-list {
      box-sizing: border-box;
      .notification-item {
        padding: 5px 20px 4px 20px;
        border-bottom: 1px solid #f2f2f2;
        font-size: 12px;
        color: map-get($fontColor, light);
        &:hover {
          background-color: #ecf5ff;
        }
        &:last-child {
          border: none;
        }
        .item-time {
          margin-top: 5px;
          color: #aaa;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
