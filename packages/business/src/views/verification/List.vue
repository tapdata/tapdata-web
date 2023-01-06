<template>
  <section class="data-verify-wrap section-wrap">
    <TablePage
      ref="table"
      row-key="id"
      :remoteMethod="getData"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortTable"
    >
      <div class="search-bar" slot="search">
        <FilterBar v-model="searchParams" :items="filterItems" @fetch="table.fetch(1)"> </FilterBar>
      </div>
      <div slot="operation">
        <ElButton
          v-readonlybtn="'SYNC_category_application'"
          size="mini"
          class="btn"
          v-show="multipleSelection.length > 0"
          @click="handleExport"
        >
          <i class="iconfont icon-daoru back-btn-icon"></i>
          <span> {{ $t('button_bulk_export') }}</span>
        </ElButton>
        <ElButton
          v-readonlybtn="'datasource_creation'"
          class="btn btn-create"
          type="primary"
          size="mini"
          @click="$router.push({ name: 'dataVerificationCreate' })"
        >
          <span> {{ $t('button_create') }}</span>
        </ElButton>
      </div>
      <el-table-column type="selection" width="45"></el-table-column>
      <el-table-column :label="$t('packages_business_verification_task_name')" min-width="250" show-overflow-tooltip>
        <template slot-scope="scope">
          <div class="ellipsis">{{ scope.row.name }}</div>
          <div class="font-color-slight">
            <span
              >{{ inspectMethod[scope.row.inspectMethod] }} (
              {{
                scope.row.mode === 'manual'
                  ? $t('packages_business_verification_singleVerify')
                  : $t('packages_business_verification_repeatingVerify')
              }}
              )
            </span>
            <span v-if="!scope.row.enabled" class="font-color-slight">&nbsp;Disabled</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        prop="sourceTotal"
        min-width="140"
        align="center"
        :label="$t('packages_business_verification_history_source_total_rows')"
      ></el-table-column>
      <el-table-column :label="$t('packages_business_verification_result_title')" min-width="180">
        <template slot-scope="scope">
          <div class="flex align-center">
            <template v-if="scope.row.InspectResult && ['waiting', 'done'].includes(scope.row.status)">
              <div v-if="scope.row.result !== 'passed'" class="data-verify__status error">
                <i class="data-verify__icon el-icon-error"></i>

                <span v-if="scope.row.inspectMethod === 'row_count'">
                  {{ $t('packages_business_verification_inconsistent') }}
                </span>
                <span v-else>
                  {{ $t('packages_business_verification_contConsistent') }}{{ scope.row.difference_number }}
                </span>
              </div>
              <div v-else class="data-verify__status success">
                <i class="data-verify__icon el-icon-success"></i>
                <span>{{ $t('packages_business_verification_consistent') }}</span>
              </div>
            </template>
            <div v-else-if="scope.row.status === 'error'" class="data-verify__status">
              <i class="data-verify__icon el-icon-error"></i>
              <span>{{ $t('packages_business_status_error') }}</span>
            </div>
            <div v-else-if="scope.row.status !== 'done'" class="data-verify__status">
              <img style="width: 26px; vertical-align: middle" :src="loadingImg" />
              <span>{{ statusMap[scope.row.status] }}</span>
            </div>
            <div v-else>-</div>
            <!--            <VIcon v-if="scope.row.InspectResult && scope.row.InspectResult.parentId" class="ml-2" size="16"-->
            <!--              >ercijiaoyan</VIcon-->
            <!--            >-->
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('packages_business_verification_verifyStatus')" min-width="120" prop="status">
        <template slot-scope="scope">
          <span>{{ statusMap[scope.row.status] }}</span>
          <span v-if="scope.row.InspectResult && scope.row.status === 'running'">
            {{ `(${Math.round(scope.row.InspectResult.progress * 100)}%)` }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('packages_business_verification_verifyTime')"
        prop="lastStartTime"
        sortable="lastStartTime"
        min-width="150"
      ></el-table-column>
      <el-table-column :label="$t('column_operation')" width="260">
        <template slot-scope="scope">
          <ElLink
            v-readonlybtn="'verify_job_edition'"
            type="primary"
            :disabled="
              $disabledByPermission('verify_job_edition_all_data', scope.row.user_id) ||
              ['running', 'scheduling'].includes(scope.row.status)
            "
            @click="startTask(scope.row.id)"
            >{{ $t('packages_business_verification_executeVerifyTip') }}</ElLink
          >
          <ElDivider direction="vertical" v-readonlybtn="'verify_job_edition'"></ElDivider>
          <ElLink type="primary" :disabled="!scope.row.InspectResult" @click="toTableInfo(scope.row.id)">{{
            $t('packages_business_verification_detailTip')
          }}</ElLink>
          <ElDivider direction="vertical"></ElDivider>
          <ElLink
            v-readonlybtn="'verify_job_edition'"
            type="primary"
            :disabled="
              $disabledByPermission('verify_job_edition_all_data', scope.row.user_id) ||
              ['running', 'scheduling'].includes(scope.row.status)
            "
            @click="goEdit(scope.row.id, scope.row.flowId)"
            >{{ $t('packages_business_verification_configurationTip') }}</ElLink
          >
          <ElDivider direction="vertical" v-readonlybtn="'verify_job_edition'"></ElDivider>
          <ElDropdown v-show="moreAuthority" size="small" @command="handleCommand($event, scope.row)">
            <ElLink type="primary" class="rotate-90">
              <i class="el-icon-more"></i>
            </ElLink>
            <ElDropdownMenu class="dataflow-table-more-dropdown-menu" slot="dropdown">
              <ElDropdownItem command="history" :disabled="!scope.row.InspectResult"
                >{{ $t('packages_business_verification_historyTip') }}
              </ElDropdownItem>
              <ElDropdownItem
                command="remove"
                v-readonlybtn="'verify_job_delete'"
                :disabled="$disabledByPermission('verify_job_delete_all_data', scope.row.user_id)"
                >{{ $t('packages_business_verification_deleteTip') }}</ElDropdownItem
              >
            </ElDropdownMenu>
          </ElDropdown>
        </template>
      </el-table-column>
    </TablePage>
  </section>
</template>

<script>
import i18n from '@tap/i18n'

import dayjs from 'dayjs'

import { FilterBar } from '@tap/component'
import { toRegExp } from '@tap/shared'
import { VIcon } from '@tap/component'
import { TablePage } from '@tap/business'
import { taskApi, inspectApi, metadataInstancesApi } from '@tap/api'

let timeout = null
export default {
  components: {
    TablePage,
    VIcon,
    FilterBar
  },
  data() {
    return {
      searchParams: {
        keyword: '',
        inspectMethod: '',
        mode: '',
        enabled: '',
        result: ''
      },
      filterItems: [],
      loadingImg: window._TAPDATA_OPTIONS_.loadingImg,
      order: 'lastStartTime DESC',
      inspectMethod: {
        row_count: this.$t('packages_business_verification_rowVerify'),
        field: this.$t('packages_business_verification_contentVerify'),
        jointField: this.$t('packages_business_verification_jointVerify'),
        cdcCount: i18n.t('packages_business_verification_details_dongtaijiaoyan')
      },
      statusMap: {
        waiting: this.$t('packages_business_verification_waiting'),
        scheduling: this.$t('packages_business_verification_scheduling'),
        error: this.$t('packages_business_verification_error'),
        done: this.$t('packages_business_verification_done'),
        running: this.$t('packages_business_verification_running')
      },
      validList: [
        { label: this.$t('select_option_all'), value: '' },
        { label: this.$t('packages_business_verification_check_same'), value: 'passed' },
        { label: this.$t('packages_business_verification_count_difference'), value: 'row_count' },
        { label: this.$t('packages_business_verification_content_difference'), value: 'valueDiff' },
        { label: 'Error', value: 'error' }
      ],
      verifyTypeList: [
        { label: this.$t('select_option_all'), value: '' },
        { label: this.$t('packages_business_verification_row_verify'), value: 'row_count' },
        { label: this.$t('packages_business_verification_content_verify'), value: 'field' },
        { label: this.$t('packages_business_verification_joint_verify'), value: 'jointField' }
      ],
      multipleSelection: [],
      moreAuthority: this.$has('verify_job_delete_all_data')
    }
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
  created() {
    timeout = setInterval(() => {
      this.table.fetch(null, 0, true)
    }, 8000)
    this.getFilterItems()
    this.searchParams = Object.assign(this.searchParams, this.$route.query)
  },
  destroyed() {
    clearInterval(timeout)
  },
  methods: {
    inspectMethodChange(val) {
      if (val !== 'row_count' && this.searchParams.result === 'row_count') {
        this.searchParams.result = ''
      }
      this.table.fetch(1)
    },
    // 批量导出
    handleExport() {
      let ids = this.multipleSelection.map(item => item.id)
      let where = {
        _id: {
          in: ids
        }
      }
      metadataInstancesApi.download(where, 'Inspect')
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    //筛选条件
    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'lastStartTime'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
      this.table.fetch(1)
    },
    getData({ page }) {
      let { current, size } = page
      let { keyword, inspectMethod, mode, enabled, result } = this.searchParams
      let where = {}
      //精准搜索 iModel
      if (keyword && keyword.trim()) {
        let filterObj = { like: toRegExp(keyword), options: 'i' }
        where['or'] = [{ name: filterObj }, { dataFlowName: filterObj }]
      }
      if (enabled) {
        where.enabled = enabled == 1
      }
      if (result) {
        if (result === 'error') {
          where.status = 'error'
        } else if (result === 'passed') {
          where.status = { neq: 'error' }
          where.result = 'passed'
        } else if (result === 'row_count') {
          where.status = { neq: 'error' }
          where.result = 'failed'
          inspectMethod = this.searchParams.inspectMethod = 'row_count'
        } else {
          where.status = { neq: 'error' }
          where.result = 'failed'
          if (inspectMethod === 'row_count') {
            inspectMethod = this.searchParams.inspectMethod = ''
          }
          where.inspectMethod = { neq: 'row_count' }
        }
      }
      inspectMethod && (where.inspectMethod = inspectMethod)
      mode && (where.mode = mode)
      let filter = {
        order: this.order,
        limit: size,
        skip: (current - 1) * size,
        where
      }
      return inspectApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(data => {
          let list = data?.items || []
          return {
            total: data?.total,
            data: list.map(item => {
              let result = item.InspectResult
              let sourceTotal = '-'
              let targetTotal = '-'
              if (result) {
                sourceTotal = result.source_total
                targetTotal = result.target_total
              }
              item.lastStartTime = item.lastStartTime ? dayjs(item.lastStartTime).format('YYYY-MM-DD HH:mm:ss') : '-'
              item.sourceTotal = sourceTotal
              item.targetTotal = targetTotal
              return item
            })
          }
        })
    },
    handleCommand(command, node) {
      let ids = ''
      if (node) {
        ids = node.id
      }
      this[command](ids, node)
    },
    toTableInfo(id) {
      this.$router.push({
        name: 'dataVerifyDetails',
        params: {
          id
        }
      })
    },
    history(id) {
      this.$router.push({
        name: 'dataVerifyHistory',
        params: {
          id
        }
      })
    },
    startTask(id) {
      inspectApi
        .update(
          {
            id: id
          },
          { status: 'scheduling', ping_time: 0, scheduleTimes: 0, byFirstCheckId: '' }
        )
        .then(() => {
          this.$message.success(this.$t('packages_business_verification_startVerify'))
          this.table.fetch()
        })
    },
    remove(id, row) {
      let name = row.name
      this.$confirm(
        `${this.$t('packages_business_verification_deleteMessage')} ${name}?`,
        this.$t('packages_business_dataFlow_importantReminder'),
        {
          confirmButtonText: this.$t('packages_business_button_delete'),
          cancelButtonText: this.$t('packages_business_button_cancel'),
          type: 'warning'
        }
      ).then(resFlag => {
        if (!resFlag) {
          return
        }
        inspectApi.delete(id).then(() => {
          this.$message.success(this.$t('packages_business_message_deleteOK'))
          this.table.fetch()
        })
      })
    },
    goEdit(id) {
      this.$router.push({
        name: 'dataVerificationEdit',
        params: {
          id: id
        }
      })
    },
    getFilterItems() {
      this.filterItems = [
        {
          label: this.$t('packages_business_verification_type'),
          key: 'inspectMethod',
          type: 'select-inner',
          items: this.verifyTypeList,
          selectedWidth: '200px'
        },
        {
          label: this.$t('packages_business_verification_check_frequency'),
          key: 'mode',
          type: 'select-inner',
          items: [
            { label: this.$t('select_option_all'), value: '' },
            { label: this.$t('packages_business_verification_single'), value: 'MANUALLY_SPECIFIED_BY_THE_USER' },
            { label: this.$t('packages_business_verification_repeating'), value: 'cron' }
          ]
        },
        {
          label: this.$t('packages_business_verification_is_enabled'),
          key: 'enabled',
          type: 'select-inner',
          items: [
            { label: this.$t('select_option_all'), value: '' },
            { label: this.$t('packages_business_verification_job_enable'), value: 1 },
            { label: this.$t('packages_business_verification_job_disable'), value: 2 }
          ]
        },
        {
          label: this.$t('packages_business_verification_result_title'),
          key: 'result',
          type: 'select-inner',
          items: this.validList
        },
        {
          placeholder: this.$t('packages_business_verification_task_name'),
          key: 'keyword',
          type: 'input'
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.data-verify-wrap {
  height: 100%;
  .btn-refresh {
    padding: 0;
    height: 32px;
    line-height: 32px;
    width: 32px;
    font-size: 16px;
  }
  .search-bar {
    display: flex;
    .item {
      margin-right: 10px;
    }
  }
  .btn + .btn {
    margin-left: 10px;
  }
  .btn {
    i.iconfont {
      font-size: 12px;
    }
    &.btn-dropdowm {
      margin-left: 5px;
    }
  }
  .data-verify__status {
    display: flex;
    align-items: center;
  }
  .data-verify__icon {
    margin-left: -5px;
    width: 26px;
    text-align: center;
    font-size: 14px;
  }
}
</style>
<style lang="scss">
.data-verify-wrap {
  .el-table--border td {
    border-right: 0;
  }
  // .el-table--border th {
  //   border-right: 1px solid #dcdfe6;
  // }
}
</style>
