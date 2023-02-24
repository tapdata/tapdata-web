<template>
  <div class="system-notification" v-loading="loading">
    <div class="notification-head pt-8 pb-4 px-6">
      <div class="title font-color-dark fs-7">
        {{ $t('notify_system_notice') }}
      </div>
    </div>

    <el-tabs v-model:value="activeName" @tab-click="handleClick">
      <div class="operation">
        <ElButton type="primary" size="mini" @click="handlePageRead()">{{
          $t('notify_mask_read')
        }}</ElButton>
        <ElButton size="mini" @click="handleAllRead()">{{
          $t('notify_mask_read_all')
        }}</ElButton>
        <ElButton
          size="mini"
          v-readonlybtn="'home_notice_settings'"
          @click="handleSetting"
        >
          {{ $t('notify_setting') }}
        </ElButton>
      </div>
      <el-tab-pane
        :label="$t('notify_user_all_notice')"
        name="first"
      ></el-tab-pane>
      <el-tab-pane
        :label="$t('notify_unread_notice')"
        name="second"
      ></el-tab-pane>
    </el-tabs>
    <div class="py-2 pl-4">
      <SelectList
        v-if="options.length"
        v-model:value="searchParams.search"
        :items="options"
        :inner-label="$t('notify_notice_level')"
        none-border
        last-page-text=""
        clearable
        menu-min-width="240px"
        @change="getData()"
      ></SelectList>
      <SelectList
        v-if="msgOptions.length"
        v-model:value="searchParams.msg"
        :items="msgOptions"
        :inner-label="$t('notify_notice_type')"
        none-border
        last-page-text=""
        clearable
        menu-min-width="240px"
        @change="getData()"
      ></SelectList>
    </div>
    <ul
      class="cuk-list clearfix cuk-list-type-block"
      v-if="listData && listData.length"
    >
      <li
        class="list-item"
        :style="{ cursor: item.read ? 'default' : 'pointer' }"
        v-for="item in listData"
        :key="item.id"
        @click="handleRead(item)"
      >
        <div class="list-item-content" v-if="item.msg === 'JobDDL'">
          <div class="unread-1zPaAXtSu" v-show="!item.read"></div>
          <div class="list-item-desc">
            <span :style="`color: ${colorMap[item.level]};`"
              >【{{ item.level }}】</span
            >
            <span>{{ systemMap[item.system] }}</span>
            <!-- <router-link :to="`/job?id=${item.sourceId}&isMoniting=true&mapping=` + item.mappingTemplate"> -->
            <ElLink v-if="item.msg === 'deleted'">
              {{ `${item.serverName} ` }}
            </ElLink>
            <ElLink
              type="primary"
              v-else
              class="link-primary cursor-pointer"
              @click="handleGo(item)"
            >
              {{ `${item.serverName} , ` }}
            </ElLink>

            <!-- </router-link> -->
            <span>
              {{
                `${$t('notify_source_name')} : ${item.sourceName} , ${$t(
                  'notify_database_name'
                )} : ${item.databaseName} , ${$t('notify_schema_name')} : ${
                  item.schemaName
                } ,`
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
          <div class="unread-1zPaAXtSu" v-show="!item.read"></div>
          <div class="list-item-desc">
            <span :style="`color: ${colorMap[item.level]};`"
              >【{{ item.level }}】</span
            >
            <span>{{ systemMap[item.system] }}</span>
            <span v-if="item.msg === 'deleted'">
              {{ `${item.serverName} ` }}
            </span>
            <ElLink
              v-else
              type="primary"
              class="cursor-pointer px-1"
              @click="handleGo(item)"
            >
              {{ item.serverName }}
            </ElLink>
            <span>{{ typeMap[item.msg] }}</span>
            <!-- <span v-if="item.CDCTime">{{ getLag(item.CDCTime) }}</span> -->
            <span v-if="item.restDay"
              >{{ item.restDay }} {{ $t('notify_day') }}</span
            >
          </div>
          <div class="list-item-time">
            <span>{{ item.createTime }}</span>
          </div>
        </div>
      </li>
    </ul>
    <div
      v-else
      class="notification-no-data flex h-100 justify-content-center align-items-center"
    >
      <div>
        <VIcon size="140">no-notice</VIcon>
        <div class="pt-4 fs-8 text-center font-color-slight fw-normal">
          {{ $t('notify_no_notice') }}
        </div>
      </div>
    </div>
    <el-pagination
      class="pagination"
      background
      layout="total,prev, pager, next,sizes"
      :page-sizes="[20, 30, 50, 100]"
      :page-size="pagesize"
      :total="total"
      v-model:current-page="currentPage"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    >
    </el-pagination>
  </div>
</template>

<script>
import { $on, $off, $once, $emit } from '../../utils/gogocodeTransfer'
import { TYPEMAP } from './tyepMap'
import { SelectList } from '@tap/component'
import dayjs from 'dayjs'
import { notificationApi } from '@tap/api'

export default {
  components: { SelectList },
  data() {
    return {
      filterItems: [],
      activeName: 'first',
      listData: [],
      read: true,
      loading: false,
      searchParams: {
        search: '',
        msg: '',
      },

      currentPage: 1,
      pagesize: 20,
      total: 0,
      colorMap: {
        ERROR: '#D44D4D',
        WARN: '#FF7D00',
        INFO: '#2c65ff',
      },
      systemMap: {
        sync: this.$t('notify_sync'),
        migration: this.$t('notify_migration'),
        dataFlow: this.$t('notify_data_flow'),
        agent: this.$t('notify_manage_sever'),
        inspect: this.$t('notify_inspect'),
        JobDDL: this.$t('notify_ddl_deal'),
        system: this.$t('notify_system'),
      },
      options: [
        {
          value: 'ERROR',
          label: 'ERROR',
        },
        {
          value: 'WARN',
          label: 'WARN',
        },
        {
          value: 'INFO',
          label: 'INFO',
        },
      ],
      msgOptions: [
        {
          value: 'deleted',
          label: this.$t('notification_jobDeleted'),
        },
        {
          value: 'paused',
          label: this.$t('notification_jobPaused'),
        },
        {
          value: 'stoppedByError',
          label: this.$t('notification_stoppedByError'),
        },
        {
          value: 'jobStateError',
          label: this.$t('notification_jobStateError'),
        },
        {
          value: 'jobEncounterError',
          label: this.$t('notification_jobEncounterError'),
        },
        {
          value: 'CDCLag',
          label: this.$t('notification_CDCLag'),
        },
        {
          value: 'JobDDL',
          label: this.$t('notification_DDL'),
        },
        {
          value: 'connectionInterrupted',
          label: this.$t('notification_serverDisconnected'),
        },
        {
          value: 'manageSeverStartedSuccessfully',
          label: this.$t('notification_agentStarted'),
        },
        {
          value: 'manageSeverStoppedSuccessfully',
          label: this.$t('notification_agentStopped'),
        },
        {
          value: 'newSeverCreatedSuccessfully',
          label: this.$t('notification_agentCreated'),
        },
        {
          value: 'newSeverDeletedSuccessfully',
          label: this.$t('notification_agentDeleted'),
        },
      ],
      typeMap: TYPEMAP,
      count: '',
    }
  },
  created() {
    this.getData()
    this.getFilterItems()
    $on(this.$root, 'notificationUpdate', () => {
      this.getData()
    })
  },
  methods: {
    handleSetting() {
      this.$router.push({ name: 'notificationSetting' })
    },
    getData() {
      let { search, msg } = this.searchParams
      let where = {}
      if (!this.read) {
        where.read = false
      }
      if (search || search !== '') {
        where.level = search
      }
      if (msg || msg !== '') {
        where.msg = msg
      }
      let filter = {
        where,
        order: 'createTime DESC',
        limit: this.pagesize,
        skip: (this.currentPage - 1) * this.pagesize,
      }

      this.loading = true
      notificationApi
        .get({ filter: JSON.stringify(filter) })
        .then((data) => {
          this.listData = data?.items || []
          this.total = data?.total || 0
          //格式化日期
          if (this.listData && this.listData.length > 0) {
            this.listData.map((item) => {
              item['createTime'] = item.createTime
                ? dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')
                : ''
            })
          }
        })
        .finally(() => {
          this.loading = false
        })
      // this.getCount(this.read)
    },
    handleCurrentChange(cpage) {
      this.currentPage = cpage
      this.getData()
    },
    handleSizeChange(psize) {
      this.pagesize = psize
      this.getData()
    },
    getCount(read) {
      let where = {}
      if (read === false) {
        where.read = false
      }
      if (this.searchParams.search || this.searchParams.search !== '') {
        where.level = this.searchParams.search
      }
      if (this.searchParams.msg || this.searchParams.msg !== '') {
        where.msg = this.searchParams.msg
      }
      notificationApi
        .count({ where: JSON.stringify(where) })
        .then((data) => {
          this.total = data?.count
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleRead(item) {
      let read = this.read
      if (!item.read) {
        notificationApi.patch({ read: true, id: item.id }).then(() => {
          this.read = read
          $emit(this.$root, 'notificationUpdate')
          let msg = {
            type: 'notification',
          }
          this.$ws.ready(() => {
            this.$ws.send(msg)
          }, true)
        })
      }
    },
    // 标记本页已读
    handlePageRead() {
      let ids = []
      this.listData.map((item) => {
        ids.push(item.id)
      })
      let id = {
        inq: ids,
      }

      let data = {
        read: true,
        id,
      }
      let read = this.read
      notificationApi.pageRead(data).then(() => {
        // this.getUnreadNum() //未读消息数量
        this.getData()
        this.read = read
        $emit(this.$root, 'notificationUpdate')
        let msg = {
          type: 'notification',
        }
        this.$ws.ready(() => {
          this.$ws.send(msg)
        }, true)
      })
    },

    // 标记全部已读
    handleAllRead() {
      let where = {}
      // let data = {
      //   read: true
      // }
      where = JSON.stringify(where)
      let read = this.read
      notificationApi.readAll(where).then(() => {
        // this.getUnreadNum() //未读消息数量
        this.getData()
        this.read = read
        $emit(this.$root, 'notificationUpdate')
        let msg = {
          type: 'notification',
        }
        this.$ws.ready(() => {
          this.$ws.send(msg)
        }, true)
      })
    },
    handleClick(tab) {
      this.currentPage = 1
      if (tab.name === 'first') {
        this.read = true // 全部信息
      } else {
        this.read = false //未读
      }
      this.getData()
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
        case 'sync':
          this.$router.push({
            name: 'DataflowEditor',
            query: {
              id: item.sourceId,
              isMoniting: true,
              mapping: item.mappingTemplate,
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
    getFilterItems() {
      this.filterItems = [
        {
          label: this.$t('notify_notice_level'),
          key: 'search',
          type: 'select-inner',
          items: this.options,
          selectedWidth: '200px',
        },
        {
          label: this.$t('notify_notice_type'),
          key: 'msg',
          type: 'select-inner',
          items: this.msgOptions,
        },
      ]
    },
  },
  emits: ['notificationUpdate'],
}
</script>

<style lang="scss" scoped>
$unreadColor: #ee5353;
.system-notification {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  font-size: $fontBaseTitle;
  .notification-head {
    .title {
      font-weight: bold;
    }
    .search {
      margin-top: 10px;
      margin-right: 10px;
      width: 200px;
    }
  }
  .operation {
    position: absolute;
    top: -50px;
    right: 0;
    cursor: pointer;
    span {
      display: inline-block;
      margin-left: 10px;
    }
  }
  ul.cuk-list {
    list-style: none;
    flex: 1;
    padding-left: 24px;
    overflow: auto;
    .inner-select {
      &:first-child {
        padding-left: 0;
      }
    }
  }
  .clearfix {
    zoom: 1;
  }
  .clearfix:after,
  .clearfix:before {
    content: ' ';
    display: table;
  }
  [class*='cuk-'],
  [class*='cuk-'] :after,
  [class*='cuk-'] :before {
    box-sizing: border-box;
  }
  .list-item {
    position: relative;
    background-color: map-get($bgColor, white);
    border-bottom: 1px solid map-get($bgColor, disable);
    margin-right: 30px;
    .list-item-content {
      position: relative;
      height: 50px;
      line-height: 50px;
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
      background: $unreadColor;
      border-radius: 50%;
    }
    .list-item-desc {
      color: map-get($fontColor, light);
      position: absolute;
      top: 0;
      left: 30px;
      right: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .list-item-time {
      float: right;
      color: map-get($fontColor, light);
      font-size: $fontBaseTitle;
    }
    &:hover {
      background: map-get($bgColor, normal);
    }
  }
}
.pagination {
  text-align: right;
  padding: 10px 0 20px 0;
}
</style>

<style lang="scss">
.system-notification {
  .el-tabs {
    position: relative;
    .el-tabs__header {
      padding: 0 24px;
    }
    .el-tabs__content {
      overflow: initial;
      .operation {
        position: absolute;
        top: -55px;
        right: 24px;
      }
    }
  }
  ul.cuk-list {
    .v-select-list {
      &:first-child .inner-select {
        padding-left: 0;
      }
    }
  }
  .el-tabs__item {
    height: 40px;
    line-height: 40px;
    font-size: 14px;
    // color: map-get($fontColor, light);
    font-weight: 400;
    &.is-active {
      font-weight: 500;
      // color: map-get($color, primary);
    }
  }
}
</style>
