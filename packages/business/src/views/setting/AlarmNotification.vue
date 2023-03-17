<template>
  <div class="system-notification" v-loading="loading">
    <div class="notification-head pt-8 pb-4 px-6">
      <div class="title font-color-dark fs-7">
        {{ $t('packages_business_setting_notification_alarm_notification_gaojingtongzhi') }}
      </div>
    </div>

    <el-tabs v-model="activeName" @tab-click="handleClick">
      <div class="operation">
        <ElButton type="primary" size="mini" @click="handlePageRead()">{{
          $t('packages_business_notify_mask_read')
        }}</ElButton>
        <ElButton size="mini" @click="handleAllRead()">{{ $t('packages_business_notify_mask_read_all') }}</ElButton>
        <ElButton size="mini" v-readonlybtn="'home_notice_settings'" @click="handleSetting">
          {{ $t('notify_setting') }}
        </ElButton>
      </div>
      <el-tab-pane :label="$t('packages_business_notify_user_all_notice')" name="first"></el-tab-pane>
      <el-tab-pane :label="$t('packages_business_notify_unread_notice')" name="second"></el-tab-pane>
    </el-tabs>
    <div class="py-2 pl-4">
      <SelectList
        v-if="options.length"
        v-model="searchParams.search"
        :items="options"
        :inner-label="$t('packages_business_notify_notice_level')"
        none-border
        last-page-text=""
        clearable
        menu-min-width="240px"
        @change="getData()"
      ></SelectList>
    </div>
    <ul class="cuk-list clearfix cuk-list-type-block" v-if="listData && listData.length">
      <li
        class="list-item"
        :style="{ cursor: item.read ? 'default' : 'pointer' }"
        v-for="item in listData"
        :key="item.id"
        @click="handleRead(item)"
      >
        <div class="list-item-content">
          <div class="unread-1zPaAXtSu" v-show="!item.read"></div>
          <div class="list-item-desc">
            <span :class="['level-' + item.levelType]">【{{ item.levelLabel }}】</span>
            <span>{{ item.title }}</span>
          </div>
        </div>
      </li>
    </ul>
    <div v-else class="notification-no-data flex h-100 justify-content-center align-items-center">
      <div>
        <VIcon size="140">no-notice</VIcon>
        <div class="pt-4 fs-8 text-center font-color-slight fw-normal">
          {{ $t('packages_business_notify_no_notice') }}
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
      :current-page.sync="currentPage"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    >
    </el-pagination>
    <ElDialog
      custom-class="notice-setting-dialog"
      :title="$t('notify_setting')"
      width="1024px"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <AlarmSetting @updateVisible="dialogVisible = false"></AlarmSetting>
    </ElDialog>
  </div>
</template>

<script>
import { SelectList } from '@tap/component'
import { ALARM_LEVEL_MAP } from '../../shared/const'
import AlarmSetting from './AlarmSetting'
import { notificationApi } from '@tap/api'

export default {
  components: { SelectList, AlarmSetting },
  data() {
    return {
      filterItems: [],
      activeName: 'first',
      listData: [],
      read: true,
      loading: false,
      searchParams: {
        search: '',
        msg: ''
      },

      currentPage: 1,
      pagesize: 20,
      total: 0,
      options: [
        {
          label: this.$t('packages_business_components_alert_huifu'),
          value: 'RECOVERY'
        },
        {
          label: this.$t('packages_business_shared_const_yiban'),
          value: 'NORMAL'
        },
        {
          label: this.$t('packages_business_shared_const_jinggao'),
          value: 'WARNING'
        },
        {
          label: this.$t('packages_business_shared_const_yanzhong'),
          value: 'CRITICAL'
        },
        {
          label: this.$t('packages_business_shared_const_jinji'),
          value: 'EMERGENCY'
        }
      ],
      dialogVisible: false
    }
  },
  created() {
    this.getData()
    this.getFilterItems()
  },
  methods: {
    getData() {
      let where = {
        msgType: 'ALARM',
        page: this.currentPage,
        size: this.pagesize
      }
      if (this.searchParams.search) {
        where.level = this.searchParams.search
      }
      if (!this.read) {
        where.read = false
      }
      this.loading = true
      notificationApi
        .list(where)
        .then(data => {
          let list = data?.items || []
          this.listData = list.map(item => {
            item.levelLabel = ALARM_LEVEL_MAP[item.level].text
            item.levelType = ALARM_LEVEL_MAP[item.level].type
            return item
          })
          this.total = data?.total || 0
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
    handleRead(item) {
      let read = this.read
      if (!item.read) {
        notificationApi.patch({ read: true, id: item.id }).then(() => {
          this.read = read
          let msg = {
            type: 'notification'
          }
          this.$ws.ready(() => {
            this.$ws.send(msg)
          }, true)
          this.getData()
        })
      }
    },
    // 标记本页已读
    handlePageRead() {
      let ids = []
      this.listData.map(item => {
        ids.push(item.id)
      })
      let id = {
        inq: ids
      }

      let data = {
        read: true,
        id
      }
      let read = this.read
      notificationApi.pageRead(data).then(() => {
        // this.getUnreadNum() //未读消息数量
        this.getData()
        this.read = read
        this.$root.$emit('notificationUpdate')
        let msg = {
          type: 'notification'
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
        this.$root.$emit('notificationUpdate')
        let msg = {
          type: 'notification'
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
    getFilterItems() {
      this.filterItems = [
        {
          label: this.$t('packages_business_notify_notice_level'),
          key: 'search',
          type: 'select-inner',
          items: this.options,
          selectedWidth: '200px'
        }
      ]
    },
    handleSetting() {
      if (process.env.VUE_APP_PLATFORM === 'DAAS') {
        this.$router.push({ name: 'alarmSetting' })
      } else {
        this.dialogVisible = true
      }
    }
  }
}
</script>

<style scoped lang="scss">
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
    font-size: $fontBaseTitle;
    // color: map-get($fontColor, light);
    font-weight: 400;
    &.is-active {
      font-weight: 500;
      // color: map-get($color, primary);
    }
  }
}
</style>
