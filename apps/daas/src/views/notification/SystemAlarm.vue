<template>
  <div class="system-notification" v-loading="loading">
    <div class="notification-head pt-8 pb-4 px-6">
      <div class="title font-color-dark fs-7">系统告警</div>
    </div>
    <el-tabs v-model="activeName">
      <el-tab-pane label="全部告警" name="first"></el-tab-pane>
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
      <template slot="search">
        <FilterBar v-model="searchParams" :items="filterItems" @fetch="table.fetch(1)"> </FilterBar>
      </template>
      <div slot="operation">
        <el-button class="btn btn-create" type="primary" size="mini" :loading="loadingConfig" @click="handleClose">
          <span>关闭</span>
        </el-button>
      </div>
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
      <el-table-column label="告警对象" prop="name"></el-table-column>
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
          <el-button type="text" @click="handleClose(row.id)">{{
            $t('packages_dag_components_alert_guanbi')
          }}</el-button>
          <el-divider direction="vertical"></el-divider>
          <el-button type="text">{{ $t('packages_dag_monitor_bottompanel_rizhi') }}</el-button>
        </template>
      </el-table-column>
    </TablePage>
  </div>
</template>

<script>
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
          label: '告警状态',
          key: 'status',
          type: 'select-inner',
          items: [
            {
              label: '进行中',
              value: 'ING'
            },
            {
              label: '恢复',
              value: 'RECOVER'
            },
            {
              label: '关闭',
              value: 'CLOESED'
            }
          ],
          selectedWidth: '200px'
        },
        {
          title: '告警时间',
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
      let ids = id[0]
      if (this.multipleSelection?.length > 0) {
        ids = this.multipleSelection.map(item => item.id)
      }
      alarmApi.close(ids).then(() => {
        this.$message.success('关闭成功')
        this.table.fetch(1)
      })
    }
  }
}
</script>

<style scoped lang="scss">
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
