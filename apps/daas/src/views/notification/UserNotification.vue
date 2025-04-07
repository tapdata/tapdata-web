<script>
import { userLogsApi, usersApi } from '@tap/api'
import { DatetimeRange, SelectList } from '@tap/component'
import Cookie from '@tap/shared/src/cookie'
import dayjs from 'dayjs'
import { escapeRegExp } from 'lodash'
import UserOperation from './UserOperation'

export default {
  components: {
    UserOperation,
    SelectList,
    DatetimeRange,
  },
  data() {
    return {
      loading: false,
      isAdmin: Number.parseInt(Cookie.get('isAdmin')),
      search: {
        keyword: '',
        range: [],
        userId: '',
      },
      page: {
        index: 1,
        size: 20,
        total: 0,
      },
      list: [],
      userOptions: [],
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
      usersApi.get().then((data) => {
        const items = data?.items || []
        this.userOptions = items.map((item) => {
          return {
            label: item.email,
            value: item.email,
          }
        })
      })
    },

    getData(pageNum) {
      this.loading = true
      const { keyword, range, userId } = this.search
      const { size, index } = this.page
      const current = pageNum || index
      const where = {
        type: 'userOperation',
      }
      if (keyword && keyword.trim()) {
        where.parameter1 = { like: escapeRegExp(keyword), options: 'i' }
      }
      if (userId) {
        where.username = userId
      }
      if (range && range.length) {
        const startTime = range[0] ? range[0] : ''
        const endTime = range[1] ? range[1] : ''
        if (startTime && !endTime) {
          where.createTime = { $gt: { $date: startTime } }
        } else if (!startTime && endTime) {
          where.createTime = { $lt: { $date: endTime } }
        } else if (startTime && endTime) {
          where.createTime = {
            $gt: { $date: startTime },
            $lt: { $date: endTime },
          }
        }
      }
      const filter = {
        order: 'createTime DESC',
        limit: size,
        skip: (current - 1) * size,
        where,
      }

      userLogsApi
        .get({
          filter: JSON.stringify(filter),
        })
        .then((data) => {
          console.log(data)
          this.page.total = data?.total || 0
          this.page.index = current
          this.list = (data?.items || []).map((item) => {
            item.createTimeFmt = dayjs(item.createTime).format(
              'YYYY-MM-DD HH:mm:ss',
            )
            return item
          })
        })
        .finally(() => {
          this.loading = false
        })
    },
  },
}
</script>

<template>
  <div v-loading="loading" class="user-notification">
    <div class="header pt-8 pb-4 px-6">
      <div class="title font-color-dark fs-7">
        {{ $t('notify_user_notice') }}
      </div>
    </div>
    <div class="search-bar px-6 flex gap-4">
      <!-- <el-date-picker
              class="search-item"
              popper-class="user-notification-data-picker"
              style="width: 320px"

              v-model="search.range"
              type="datetimerange"
              range-separator="-"
              :start-placeholder="$t('dataFlow_startTime')"
              :end-placeholder="$t('dataFlow_endTime')"
              @change="getData(1)"
            >
            </el-date-picker> -->
      <el-date-picker
        v-model="search.range"
        type="datetimerange"
        class="flex-grow-0"
        style="width: 400px"
        range-separator="-"
        :start-placeholder="$t('dataFlow_startTime')"
        :end-placeholder="$t('dataFlow_endTime')"
      />

      <SelectList
        v-if="isAdmin"
        v-model="search.userId"
        :items="userOptions"
        :label="$t('notify_operator')"
        last-page-text=""
        clearable
        dropdown-width="240px"
        @change="getData(1)"
      />

      <el-input
        v-model="search.keyword"
        clearable
        class="search-item"
        :placeholder="$t('notification_placeholder_keyword')"
        @change="getData(1)"
      />
      <!-- <el-select
              clearable
              v-if="isAdmin"
              class="search-item"

              v-model="search.userId"
              :placeholder="$t('notification_placeholder_user')"
              @change="getData(1)"
            >
              <el-option v-for="user in userOptions" :key="user.id" :value="user.id" :label="user.username"></el-option>
            </el-select> -->
    </div>
    <ul class="list pl-6">
      <li v-for="record in list" :key="record._id" class="item">
        <UserOperation :record="record" />
        <span class="item-time">{{ record.createTimeFmt }}</span>
      </li>
    </ul>
    <el-pagination
      v-model:page-size="page.size"
      v-model:current-page="page.index"
      class="pagination"
      background
      layout="->,total,prev, pager, next,sizes"
      :page-sizes="[20, 30, 50, 100]"
      :total="page.total"
      @current-change="getData"
      @size-change="getData()"
    />
  </div>
</template>

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
    font-size: $fontBaseTitle;
    line-height: 32px;
    :deep(.filter-datetime:first-child) {
      padding-left: 0;
      .el-date-editor.empty-time .el-input__inner {
        text-align: left;
      }
    }

    :deep(.el-input) {
      font-size: $fontBaseTitle;
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
      border-bottom: 1px solid map.get($borderColor, light);
      font-size: $fontBaseTitle;
      color: #202d40;
      .item-time {
        color: map.get($fontColor, light);
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
