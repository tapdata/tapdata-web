<template>
  <section class="shared-cache-list-wrap section-wrap">
    <TablePage ref="table" row-key="id" :remoteMethod="getData" @sort-change="handleSortTable">
      <template slot="search">
        <FilterBar v-model="searchParams" :items="filterItems" @fetch="table.fetch(1)"> </FilterBar>
      </template>
      <div slot="operation">
        <ElButton class="btn btn-create" type="primary" size="mini" @click="create">
          <span> {{ $t('shared_cache_button_create') }}</span>
        </ElButton>
      </div>
      <ElTableColumn show-overflow-tooltip prop="name" min-width="180" :label="$t('shared_cache_name')">
        <template #default="{ row }">
          <ElLink style="display: inline" type="primary" :underline="false" @click.stop="checkDetails(row)">{{
            row.name
          }}</ElLink>
        </template>
      </ElTableColumn>
      <ElTableColumn
        show-overflow-tooltip
        prop="connectionName"
        min-width="100"
        :label="$t('column_connection')"
      ></ElTableColumn>
      <ElTableColumn show-overflow-tooltip prop="tableName" min-width="100" :label="$t('column_table')"></ElTableColumn>
      <ElTableColumn :label="$t('shared_cache_status')" min-width="70">
        <template #default="{ row }">
          <span :class="['status-' + row.statusResultData, 'status-block']">
            {{ $t('task_preview_status_' + row.statusResultData) }}
          </span>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="createTime" :label="$t('column_create_time')" min-width="100" sortable="createTime">
        <template slot-scope="scope">
          {{ scope.row.createTimeFmt }}
        </template>
      </ElTableColumn>
      <ElTableColumn prop="cacheTimeAt" min-width="100" :label="$t('shared_cache_time')">
        <template slot-scope="scope">
          {{ scope.row.cacheTimeAtFmt }}
        </template>
      </ElTableColumn>
      <ElTableColumn min-width="120" :label="$t('column_operation')">
        <template #default="{ row }">
          <TaskButtons :task="row" :hide-list="['details']" @trigger="taskButtonsHandler"></TaskButtons>
        </template>
      </ElTableColumn>
    </TablePage>
    <Drawer class="shared-cache-details" :visible.sync="isShowDetails">
      <div v-if="details.id" class="shared-cache-details--header flex pb-3">
        <div class="img-box">
          <VIcon class="icon">text</VIcon>
        </div>
        <div class="flex-fill ml-4 overflow-hidden">
          <div class="fs-6 ellipsis">{{ details.name }}</div>
          <span :class="['status-' + details.statusResultData, 'status-block', 'mt-2']">
            {{ $t('task_preview_status_' + details.statusResultData) }}
          </span>
        </div>
      </div>
      <ul class="mt-2">
        <li v-for="item in info" :key="item.label" class="drawer-info__item">
          <VIcon class="fs-7 mt-2">{{ item.icon }}</VIcon>
          <div class="body ml-4">
            <label class="label">{{ item.label }}</label>
            <p class="value mt-2">{{ item.value }}</p>
          </div>
        </li>
      </ul>
      <div class="shared-cache--keys">
        <div class="title">{{ $t('shared_cache_keys') }}</div>
        <div class="content">
          <div v-for="key in details.cacheKeysArr" :key="key">{{ key }}</div>
        </div>
      </div>
      <div class="shared-cache--keys">
        <div class="title">{{ $t('shared_cache_fields') }}</div>
        <div class="content">
          <div v-for="key in details.fields" :key="key" class="mt-2">{{ key }}</div>
        </div>
      </div>
      <div class="mt-4">{{ $t('shared_cache_code') }}</div>
      <CodeView class="mt-2" :data="details"></CodeView>
    </Drawer>
  </section>
</template>
<style lang="scss" scoped>
.shared-cache-list-wrap {
  overflow: hidden;
}
.icon-status {
  display: block;
  width: 60px;
  height: 25px;
  line-height: 25px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  box-sizing: border-box;
  overflow: hidden;
  text-align: center;
  &.icon-status--success {
    color: #178061;
    background: #c4f3cb;
  }
  &.icon-status--warning {
    color: #d5760e;
    background: #ffe9cf;
  }
  &.icon-status--danger {
    color: map-get($color, danger);
    background: #ffecec;
  }
}
.shared-cache-details {
  padding: 16px;
}
.shared-cache-details--header {
  border-bottom: 1px solid map-get($borderColor, light);
  .icon {
    font-size: 18px;
  }
}
.drawer-info__item {
  display: flex;
  .body {
    flex: 1;
    padding: 8px 0;
    line-height: 17px;
    border-bottom: 1px solid map-get($borderColor, light);
    .label {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.6);
    }
    .value {
      font-size: 12px;
      color: map-get($fontColor, dark);
    }
  }
}
.shared-cache--keys {
  margin-top: 8px;
  border-radius: 4px;
  border: 1px solid #edeeee;
  .title {
    padding: 0 16px;
    height: 38px;
    line-height: 38px;
    background: map-get($bgColor, normal);
  }
  .content {
    padding: 0 16px 8px 16px;
    background-color: map-get($bgColor, white);
  }
}
</style>
<script>
import dayjs from 'dayjs'
import { sharedCacheApi } from '@tap/api'
import { FilterBar, Drawer } from '@tap/component'
import { TablePage } from '@tap/business'

import { getSubTaskStatus, toRegExp } from '@/utils/util'
import TaskButtons from '@/components/TaskButtons'

import CodeView from './CodeView.vue'

export default {
  components: { TablePage, FilterBar, Drawer, TaskButtons, CodeView },
  data() {
    return {
      searchParams: {
        name: '',
        connectionName: ''
      },
      filterItems: [
        {
          placeholder: this.$t('shared_cache_placeholder_task_name'),
          key: 'name',
          type: 'input'
        },
        {
          placeholder: this.$t('shared_cache_placeholder_connection_name'),
          key: 'connectionName',
          type: 'input'
        }
      ],
      details: {},
      info: [],
      isShowDetails: false,
      order: 'cacheTimeAt DESC'
    }
  },
  computed: {
    table() {
      return this.$refs.table
    }
  },
  watch: {
    '$route.query'() {
      this.table.fetch(1)
    }
  },
  methods: {
    getData({ page }) {
      let { current, size } = page
      let { name, connectionName } = this.searchParams
      let where = {}
      name && (where.name = { like: toRegExp(name), options: 'i' })
      connectionName && (where.connectionName = { like: toRegExp(connectionName), options: 'i' })

      let filter = {
        order: this.order,
        limit: size,
        skip: (current - 1) * size,
        where
      }
      return sharedCacheApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(data => {
          let list = data?.items || []
          return {
            total: data?.total,
            data: list.map(item => {
              item.createTimeFmt = item.createTime ? dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss') : '-'
              item.cacheTimeAtFmt = item.cacheTimeAt ? dayjs(item.cacheTimeAt).format('YYYY-MM-DD HH:mm:ss') : '-'

              let statuses = item.statuses
              item.statusResultData = getSubTaskStatus(statuses)[0].status
              return item
            })
          }
        })
    },
    create() {
      this.$router.push({
        name: 'sharedCacheCreate'
      })
    },
    checkDetails(row) {
      row.cacheKeysArr = row.cacheKeys?.split(',') || []
      this.details = row
      this.info = [
        { label: this.$t('column_creator'), value: row.createUser, icon: 'createUser' },
        { label: this.$t('column_create_time'), value: row.cacheTimeAtFmt, icon: 'cacheTimeAtFmt' },
        { label: this.$t('column_connection'), value: row.connectionName, icon: 'connectionName' },
        { label: this.$t('column_table'), value: row.tableName, icon: 'table' },
        { label: this.$t('shared_cache_max_memory'), value: row.maxMemory, icon: 'record' }
      ]
      this.isShowDetails = true
    },
    taskButtonsHandler(event, task) {
      if (event === 'edit') {
        this.edit(task.id)
      } else if (event === 'del') {
        this.del(task.id)
      } else {
        this.table.fetch()
      }
    },
    edit(id) {
      this.$router.push({
        name: 'sharedCacheEdit',
        params: {
          id
        }
      })
    },
    del(id) {
      this.$confirm(this.$t('message_delete_confirm'), this.$t('message_title_prompt'), {
        type: 'warning'
      }).then(flag => {
        if (flag) {
          sharedCacheApi.delete(id).then(() => {
            this.$$message.success(this.$t('message_delete_ok'))
            this.table.fetch()
          })
        }
      })
    },
    //筛选条件
    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'cacheTimeAt'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
      this.table.fetch(1)
    }
  }
}
</script>
