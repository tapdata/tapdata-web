<script>
import { userLogsApi, usersApi } from '@tap/api'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import { DatetimeRange, SelectList } from '@tap/component'
import Cookie from '@tap/shared/src/cookie'
import dayjs from 'dayjs'
import { escapeRegExp } from 'lodash-es'
import UserOperation from './UserOperation'

export default {
  components: {
    UserOperation,
    SelectList,
    DatetimeRange,
    PageContainer,
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
          const { email, ldapAccount } = item
          const label = email || ldapAccount
          return {
            label,
            value: label,
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
  <PageContainer
    mode="auto"
    content-class="flex-1 gap-6 min-h-0 overflow-auto px-6 position-relative"
  >
    <div v-loading="loading" class="user-notification">
      <div
        class="search-bar flex gap-4 position-sticky top-0 bg-white z-10 pb-2"
      >
        <DatetimeRange
          v-model="search.range"
          type="datetimerange"
          class="flex-grow-0"
          range-separator="-"
          :start-placeholder="$t('dataFlow_startTime')"
          :end-placeholder="$t('dataFlow_endTime')"
          @change="getData(1)"
        />

        <SelectList
          v-if="isAdmin"
          v-model="search.userId"
          :items="userOptions"
          :label="$t('notify_operator')"
          clearable
          @change="getData(1)"
        />

        <el-input
          v-model="search.keyword"
          clearable
          class="search-item"
          :placeholder="$t('notification_placeholder_keyword')"
          @change="getData(1)"
        >
          <template #prefix>
            <VIcon>magnify</VIcon>
          </template>
        </el-input>
      </div>
      <ul class="list">
        <li v-for="record in list" :key="record._id" class="item">
          <UserOperation :record="record" />
          <span class="item-time">{{ record.createTimeFmt }}</span>
        </li>
      </ul>
      <el-pagination
        v-model:page-size="page.size"
        v-model:current-page="page.index"
        class="position-sticky py-6 bottom-0 bg-white z-10"
        background
        layout="->,total,prev, pager, next,sizes"
        :page-sizes="[20, 30, 50, 100]"
        :total="page.total"
        @current-change="getData"
        @size-change="getData()"
      />
    </div>
  </PageContainer>
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
}
</style>
