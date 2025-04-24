<script>
import { notificationApi } from '@tap/api'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import { SelectList } from '@tap/component'
import dayjs from 'dayjs'
import { $emit, $off, $on, $once } from '../../../utils/gogocodeTransfer'
import { TYPEMAP } from './tyepMap'

export default {
  components: { SelectList, PageContainer },
  emits: ['notificationUpdate'],
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
      const { search, msg } = this.searchParams
      const where = {}
      if (!this.read) {
        where.read = false
      }
      if (search || search !== '') {
        where.level = search
      }
      if (msg || msg !== '') {
        where.msg = msg
      }
      const filter = {
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
              item.createTime = item.createTime
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
      const where = {}
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
      const read = this.read
      if (!item.read) {
        notificationApi.patch({ read: true, id: item.id }).then(() => {
          this.read = read
          $emit(this.$root, 'notificationUpdate')
          const msg = {
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
      const ids = []
      this.listData.map((item) => {
        ids.push(item.id)
      })
      const id = {
        inq: ids,
      }

      const data = {
        read: true,
        id,
      }
      const read = this.read
      notificationApi.pageRead(data).then(() => {
        // this.getUnreadNum() //未读消息数量
        this.getData()
        this.read = read
        $emit(this.$root, 'notificationUpdate')
        const msg = {
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
      const read = this.read
      notificationApi.readAll(where).then(() => {
        // this.getUnreadNum() //未读消息数量
        this.getData()
        this.read = read
        $emit(this.$root, 'notificationUpdate')
        const msg = {
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
}
</script>

<template>
  <PageContainer
    mode="auto"
    content-class="flex-1 gap-6 min-h-0 overflow-auto px-6 position-relative"
  >
    <div v-loading="loading" class="system-notification">
      <div class="position-sticky top-0 z-10 bg-white">
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane :label="$t('notify_user_all_notice')" name="first" />
          <el-tab-pane :label="$t('notify_unread_notice')" name="second" />
        </el-tabs>
        <div class="position-absolute top-0 end-0 z-10">
          <ElButton type="primary" @click="handlePageRead()">{{
            $t('notify_mask_read')
          }}</ElButton>
          <ElButton @click="handleAllRead()">{{
            $t('notify_mask_read_all')
          }}</ElButton>
          <ElButton
            v-readonlybtn="'home_notice_settings'"
            @click="handleSetting"
          >
            {{ $t('notify_setting') }}
          </ElButton>
        </div>
      </div>

      <div class="flex gap-4 mb-2">
        <SelectList
          v-if="options.length"
          v-model="searchParams.search"
          :items="options"
          :label="$t('notify_notice_level')"
          last-page-text=""
          clearable
          dropdown-width="240px"
          @change="getData()"
        />
        <SelectList
          v-if="msgOptions.length"
          v-model="searchParams.msg"
          :items="msgOptions"
          :label="$t('notify_notice_type')"
          last-page-text=""
          clearable
          dropdown-width="240px"
          @change="getData()"
        />
      </div>
      <ul
        v-if="listData && listData.length"
        class="cuk-list clearfix cuk-list-type-block"
      >
        <li
          v-for="item in listData"
          :key="item.id"
          class="list-item"
          :style="{ cursor: item.read ? 'default' : 'pointer' }"
          @click="handleRead(item)"
        >
          <div v-if="item.msg === 'JobDDL'" class="list-item-content">
            <div v-show="!item.read" class="unread-1zPaAXtSu" />
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
                v-else
                type="primary"
                class="link-primary cursor-pointer"
                @click="handleGo(item)"
              >
                {{ `${item.serverName} , ` }}
              </ElLink>

              <!-- </router-link> -->
              <span>
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
          <div v-else class="list-item-content">
            <div v-show="!item.read" class="unread-1zPaAXtSu" />
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
                >{{ item.restDay }} {{ $t('public_time_d') }}</span
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
        v-model:current-page="currentPage"
        class="position-sticky py-6 bottom-0 bg-white z-10"
        background
        layout="->,total,prev, pager, next,sizes"
        :page-sizes="[20, 30, 50, 100]"
        :page-size="pagesize"
        :total="total"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      />
    </div>
  </PageContainer>
</template>

<style lang="scss" scoped>
$unreadColor: #ee5353;
.system-notification {
  ul.cuk-list {
    list-style: none;
    flex: 1;
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
    background-color: map.get($bgColor, white);
    border-bottom: 1px solid map.get($bgColor, disable);
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
      color: map.get($fontColor, light);
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
      color: map.get($fontColor, light);
      font-size: $fontBaseTitle;
    }
    &:hover {
      background: map.get($bgColor, normal);
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
    .el-tabs__content {
      overflow: initial;
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
    // color: map.get($fontColor, light);
    font-weight: 400;
    &.is-active {
      font-weight: 500;
      // color: map.get($color, primary);
    }
  }
}
</style>
