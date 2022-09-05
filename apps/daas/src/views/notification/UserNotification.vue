<template>
  <div class="user-notification" v-loading="loading">
    <div class="header pt-8 pb-4 px-6">
      <div class="title font-color-dark fs-7">{{ $t('notify_user_notice') }}</div>
    </div>
    <div class="search-bar px-6">
      <!-- <el-date-picker
          class="search-item"
          popper-class="user-notification-data-picker"
          style="width: 320px"
          size="mini"
          v-model="search.range"
          type="datetimerange"
          range-separator="-"
          :start-placeholder="$t('dataFlow_startTime')"
          :end-placeholder="$t('dataFlow_endTime')"
          @change="getData(1)"
        >
        </el-date-picker> -->
      <DatetimeRange
        v-model="search.range"
        value-format="timestamp"
        class="filter-datetime-range"
        @change="getData(1)"
      ></DatetimeRange>
      <SelectList
        v-if="isAdmin"
        v-model="search.userId"
        :items="userOptions"
        :inner-label="$t('notify_operator')"
        none-border
        last-page-text=""
        clearable
        menu-min-width="240px"
        @change="getData(1)"
      ></SelectList>

      <el-input
        clearable
        class="search-item pl-4"
        size="small"
        v-model="search.keyword"
        :placeholder="$t('notification_placeholder_keyword')"
        @change="getData(1)"
      ></el-input>
      <!-- <el-select
          clearable
          v-if="isAdmin"
          class="search-item"
          size="mini"
          v-model="search.userId"
          :placeholder="$t('notification_placeholder_user')"
          @change="getData(1)"
        >
          <el-option v-for="user in userOptions" :key="user.id" :value="user.id" :label="user.username"></el-option>
        </el-select> -->
    </div>
    <ul class="list pl-6">
      <li class="item" v-for="record in list" :key="record._id">
        <UserOperation :record="record"></UserOperation>
        <span class="item-time">{{ record.createTimeFmt }}</span>
      </li>
    </ul>
    <el-pagination
      class="pagination"
      background
      layout="prev, pager, next,sizes"
      :page-sizes="[20, 30, 50, 100]"
      :page-size.sync="page.size"
      :total="page.total"
      :current-page.sync="page.index"
      @current-change="getData"
      @size-change="getData()"
    >
    </el-pagination>
  </div>
</template>
<script>
import UserOperation from './UserOperation'
import { DatetimeRange, SelectList } from '@tap/component'
import { toRegExp } from '../../utils/util'
import Cookie from '@tap/shared/src/cookie'
import dayjs from 'dayjs'
import { userLogsApi, usersApi } from '@tap/api'

export default {
  components: {
    UserOperation,
    SelectList,
    DatetimeRange
  },
  data() {
    return {
      loading: false,
      isAdmin: parseInt(Cookie.get('isAdmin')),
      search: {
        keyword: '',
        range: [],
        userId: ''
      },
      page: {
        index: 1,
        size: 20,
        total: 0
      },
      list: [],
      userOptions: []
    }
  },
  created() {
    if (this.isAdmin) {
      this.getUsers()
    }
    this.getData()
  },
  methods: {
    getUsers() {
      usersApi.get().then(data => {
        let items = data?.items || []
        this.userOptions = items.map(item => {
          return {
            label: item.username,
            value: item.username
          }
        })
      })
    },

    getData(pageNum) {
      this.loading = true
      let { keyword, range, userId } = this.search
      let { size, index } = this.page
      let current = pageNum || index
      let where = {
        type: 'userOperation'
      }
      if (keyword && keyword.trim()) {
        where.parameter1 = { like: toRegExp(keyword), options: 'i' }
      }
      if (userId) {
        where.username = userId
      }
      if (range && range.length) {
        let startTime = range[0] ? range[0] : ''
        let endTime = range[1] ? range[1] : ''
        if (startTime && !endTime) {
          where.createTime = { $gt: { $date: startTime } }
        } else if (!startTime && endTime) {
          where.createTime = { $lt: { $date: endTime } }
        } else if (startTime && endTime) {
          where.createTime = { $gt: { $date: startTime }, $lt: { $date: endTime } }
        }
      }
      let filter = {
        order: 'createTime DESC',
        limit: size,
        skip: (current - 1) * size,
        where: where
      }

      userLogsApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(data => {
          this.page.total = data?.total || 0
          this.page.index = current
          this.list = (data?.items || []).map(item => {
            item.createTimeFmt = dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss')
            return item
          })
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>
<style lang="scss">
.user-notification-data-picker .el-time-panel.el-popper {
  right: 0;
  left: unset;
}
</style>
<style lang="scss" scoped>
.user-notification {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  .filter-datetime-range {
    padding-left: 0;
    text-align: left;
    font-size: 12px;
    line-height: 32px;
    ::v-deep {
      .filter-datetime:first-child {
        padding-left: 0;
        .el-date-editor.empty-time .el-input__inner {
          text-align: left;
        }
      }
      .el-input {
        font-size: 12px;
      }
    }
  }
  .header {
    // padding: 20px 20px 20px 0;
    .title {
      font-weight: bold;
    }
  }
  .search-bar {
    display: flex;
    align-items: center;
    .search-item {
      margin-right: 15px;
      width: 200px;
    }
  }
  .list {
    flex: 1;
    overflow: auto;

    padding-right: 20px;
    .item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      line-height: 50px;
      border-bottom: 1px solid map-get($borderColor, light);
      font-size: 12px;
      color: #202d40;
      .item-time {
        color: map-get($fontColor, light);
        font-weight: 400;
      }
    }
  }
  .pagination {
    text-align: right;
    padding: 10px 0 20px 0;
  }
}
</style>
