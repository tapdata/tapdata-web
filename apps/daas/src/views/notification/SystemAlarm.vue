<script>
import { alarmApi } from '@tap/api'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import TablePage from '@tap/business/src/components/TablePage.vue'
import {
  ALARM_LEVEL_MAP,
  ALARM_STATUS_MAP,
} from '@tap/business/src/shared/const'
import { FilterBar } from '@tap/component/src/filter-bar'
import dayjs from 'dayjs'
import i18n from '@/i18n'

export default {
  components: { TablePage, FilterBar, PageContainer },
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
        keyword: '',
      },
      count: '',
    }
  },
  computed: {
    table() {
      return this.$refs.table
    },
  },
  watch: {
    '$route.query': function () {
      this.searchParams = this.$route.query
      this.table.fetch(1)
    },
  },
  created() {
    this.getFilterItems()
  },
  methods: {
    getData({ page }) {
      const { status, time, keyword, start, end } = this.searchParams
      const { current, size } = page
      const where = {
        page: current,
        size,
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
      return alarmApi.list(where).then((data) => {
        const list = data?.items || []
        return {
          total: data?.total || 0,
          data: list.map((item) => {
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
          }),
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
              value: 'ING',
            },
            {
              label: i18n.t('packages_business_shared_const_yihuifu'),
              value: 'RECOVER',
            },
            {
              label: i18n.t('packages_business_components_alert_yiguanbi'),
              value: 'CLOESE',
            },
          ],
          selectedWidth: '200px',
        },
        {
          title: i18n.t('daas_notification_systemalarm_gaojingshijian'),
          type: 'datetimerange',
          key: 'start,end',
        },
        {
          key: 'keyword',
          type: 'input',
        },
      ]
    },
    handleClose(id) {
      let ids = id
      if (this.multipleSelection?.length > 0) {
        ids = this.multipleSelection.map((item) => item.id)
      }
      alarmApi.close(ids).then(() => {
        this.$message.success(
          i18n.t('daas_notification_systemalarm_guanbichenggong'),
        )
        this.table.fetch(1)
      })
    },
    goLog(row) {
      if (row.syncType === 'migrate') {
        this.$router.push({
          name: 'MigrationMonitor',
          params: {
            id: row.taskId,
          },
        })
      } else {
        this.$router.push({
          name: 'TaskMonitor',
          params: {
            id: row.taskId,
          },
        })
      }
    },
  },
}
</script>

<template>
  <PageContainer>
    <template #actions>
      <el-button
        :disabled="!multipleSelection.length"
        class="btn btn-create"
        type="primary"
        :loading="loadingConfig"
        @click="handleClose"
      >
        <span>{{ $t('public_button_close') }}</span>
      </el-button>
    </template>
    <div v-loading="loading" class="system-notification">
      <TablePage
        ref="table"
        row-key="id+indexName"
        class="share-list"
        :remote-method="getData"
        @selection-change="
          (val) => {
            multipleSelection = val
          }
        "
      >
        <template #search>
          <FilterBar
            v-model:value="searchParams"
            :items="filterItems"
            @fetch="table.fetch(1)"
          />
        </template>
        <el-table-column type="selection" width="32" align="center" />
        <el-table-column
          :label="$t('packages_dag_components_alert_gaojingjibie')"
          prop="level"
        >
          <template #default="{ row }">
            <span :class="[`status-${row.levelType}`, 'status-block']">
              {{ row.levelLabel }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('packages_dag_components_alert_gaojingzhuangtai')"
          prop="status"
        >
          <template #default="{ row }">
            <span> {{ row.statusLabel }} </span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('daas_notification_systemalarm_gaojingduixiang')"
          prop="name"
        />
        <el-table-column
          :label="$t('packages_dag_components_alert_gaojingmiaoshu')"
          prop="summary"
          min-width="150"
        />
        <el-table-column
          :label="$t('packages_dag_components_alert_gaojingshoucifa')"
          prop="firstOccurrenceTime"
        />
        <el-table-column
          :label="$t('packages_dag_components_alert_gaojingzuijinfa')"
          prop="lastOccurrenceTime"
          :width="160"
        />
        <el-table-column fixed="right" :label="$t('public_operation')">
          <template #default="{ row }">
            <el-button
              text
              :disabled="row.status === 'CLOESE'"
              @click="handleClose(row.id)"
              >{{ $t('public_button_close') }}</el-button
            >
            <el-divider direction="vertical" />
            <el-button text @click="goLog(row)">{{
              $t('packages_dag_monitor_bottompanel_rizhi')
            }}</el-button>
          </template>
        </el-table-column>
      </TablePage>
    </div>
  </PageContainer>
</template>

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
