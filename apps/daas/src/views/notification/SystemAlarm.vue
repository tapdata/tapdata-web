<template>
  <div class="system-notification" v-loading="loading">
    <div class="notification-head pt-8 pb-4 px-6">
      <div class="title font-color-dark fs-7">
        {{ $t('daas_notification_center_xitonggaojing') }}
      </div>
    </div>
    <el-tabs v-model="activeName">
      <el-tab-pane :label="$t('daas_notification_systemalarm_quanbugaojing')" name="first"></el-tab-pane>
    </el-tabs>
    <TablePage
      ref="table"
      row-key="id+indexName"
      class="share-list"
      :remoteMethod="getData"
      @selection-change="
        val => {
          multipleSelection = val
        }
      "
    >
      <template v-slot:search>
        <FilterBar v-model:value="searchParams" :items="filterItems" @fetch="table.fetch(1)"> </FilterBar>
      </template>
      <template v-slot:operation>
        <div>
          <el-button class="btn btn-create" type="primary" size="mini" :loading="loadingConfig" @click="handleClose">
            <span>{{ $t('text_close') }}</span>
          </el-button>
        </div>
      </template>
      <el-table-column type="selection"></el-table-column>
      <el-table-column :label="$t('packages_dag_components_alert_gaojingjibie')" prop="level">
        <template #default="{ row }">
          <span :class="['status-' + row.levelType, 'status-block']">
            {{ row.levelLabel }}
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('packages_dag_components_alert_gaojingzhuangtai')" prop="status">
        <template #default="{ row }">
          <span> {{ row.statusLabel }} </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('daas_notification_systemalarm_gaojingduixiang')" prop="name"></el-table-column>
      <el-table-column
        :label="$t('packages_dag_components_alert_gaojingmiaoshu')"
        prop="summary"
        min-width="150"
      ></el-table-column>
      <el-table-column
        :label="$t('packages_dag_components_alert_gaojingshoucifa')"
        prop="firstOccurrenceTime"
      ></el-table-column>
      <el-table-column
        :label="$t('packages_dag_components_alert_gaojingzuijinfa')"
        prop="lastOccurrenceTime"
      ></el-table-column>
      <el-table-column fixed="right" :label="$t('column_operation')">
        <template #default="{ row }">
          <el-button type="text" @click="handleClose(row.id)" :disabled="row.status === 'CLOESE'">{{
            $t('packages_dag_components_alert_guanbi')
          }}</el-button>
          <el-divider direction="vertical"></el-divider>
          <el-button type="text" @click="goLog(row)">{{ $t('packages_dag_monitor_bottompanel_rizhi') }}</el-button>
        </template>
      </el-table-column>
    </TablePage>
  </div>
</template>

<script>
import i18n from '@/i18n'

import { FilterBar } from '@tap/component'
import { TablePage, ALARM_LEVEL_MAP, ALARM_STATUS_MAP } from '@tap/business'
import { alarmApi } from '@tap/api'
import dayjs from 'dayjs'

export default {
  components: { TablePage, FilterBar },
  data() {
    return {
      filterItems: [],
      activeName: 'first',
      listData: [],
      multipleSelection: [],
      read: true,
      loading: false,
      loadingConfig: false,
      searchParams: {
        type: 'alarm',
        status: '',
        time: '',
        keyword: ''
      },
      count: ''
    }
  },
  created() {
    this.getFilterItems()
  },
  computed: {
    table() {
      return this.$refs.table
    }
  },
  watch: {
    '$route.query'() {
      this.searchParams = this.$route.query
      this.table.fetch(1)
    }
  },
  methods: {
    getData({ page }) {
      let { status, time, keyword, start, end } = this.searchParams
      let { current, size } = page
      let where = {
        page: current,
        size: size
      }
      if (status || status !== '') {
        where.status = status
      }
      if (keyword || keyword !== '') {
        where.keyword = keyword
      }
      if (time || time !== '') {
        where.time = time
      }
      if (start) {
        where.start = start
      }
      if (end) {
        where.end = end
      }
      return alarmApi.list(where).then(data => {
        let list = data?.items || []
        return {
          total: data?.total || 0,
          data: list.map(item => {
            item.firstOccurrenceTime = item.firstOccurrenceTime
              ? dayjs(item.firstOccurrenceTime).format('YYYY-MM-DD HH:mm:ss')
              : ''
            item.lastOccurrenceTime = item.lastOccurrenceTime
              ? dayjs(item.lastOccurrenceTime).format('YYYY-MM-DD HH:mm:ss')
              : ''
            item.levelLabel = ALARM_LEVEL_MAP[item.level].text
            item.levelType = ALARM_LEVEL_MAP[item.level].type
            item.statusLabel = ALARM_STATUS_MAP[item.status].text
            return item
          })
        }
      })
    },
    getFilterItems() {
      this.filterItems = [
        {
          label: i18n.t('daas_notification_systemalarm_gaojingzhuangtai'),
          key: 'status',
          type: 'select-inner',
          items: [
            {
              label: i18n.t('packages_business_shared_const_gaojingzhong'),
              value: 'ING'
            },
            {
              label: i18n.t('packages_business_shared_const_yihuifu'),
              value: 'RECOVER'
            },
            {
              label: i18n.t('packages_business_components_alert_yiguanbi'),
              value: 'CLOESE'
            }
          ],
          selectedWidth: '200px'
        },
        {
          title: i18n.t('daas_notification_systemalarm_gaojingshijian'),
          type: 'datetimerange',
          key: 'start,end'
        },
        {
          key: 'keyword',
          type: 'input'
        }
      ]
    },
    handleClose(id) {
      let ids = id
      if (this.multipleSelection?.length > 0) {
        ids = this.multipleSelection.map(item => item.id)
      }
      alarmApi.close(ids).then(() => {
        this.$message.success(i18n.t('daas_notification_systemalarm_guanbichenggong'))
        this.table.fetch(1)
      })
    },
    goLog(row) {
      if (row.syncType === 'migrate') {
        this.$router.push({
          name: 'MigrationMonitor',
          params: {
            id: row.taskId
          }
        })
      } else {
        this.$router.push({
          name: 'TaskMonitor',
          params: {
            id: row.taskId
          }
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.system-notification {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  font-size: 12px;
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
  .status-block {
    display: inline-block;
    min-width: 60px;
    padding: 3px 10px;
    text-align: center;
    font-weight: 500;
    border-radius: 4px;
    box-sizing: border-box;
  }
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
  .el-tabs__item {
    height: 40px;
    line-height: 40px;
    font-size: 14px;
    font-weight: 400;
    &.is-active {
      font-weight: 500;
    }
  }
  .table-page-container .table-page-body {
    padding-top: 0;
  }
}
</style>
