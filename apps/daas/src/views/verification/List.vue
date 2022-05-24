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
        <el-button
          v-readonlybtn="'SYNC_category_application'"
          size="mini"
          class="btn"
          v-show="multipleSelection.length > 0"
          @click="handleExport"
        >
          <i class="iconfont icon-dakai1 back-btn-icon"></i>
          <span> {{ $t('dataFlow.bulkExport') }}</span>
        </el-button>
        <ElButton
          v-readonlybtn="'datasource_creation'"
          class="btn btn-create"
          type="primary"
          size="mini"
          @click="$router.push({ name: 'dataVerificationCreate' })"
        >
          <span> {{ $t('dataVerification.addVerifyTip') }}</span>
        </ElButton>
      </div>
      <el-table-column type="selection" width="45"></el-table-column>
      <el-table-column :label="$t('dataVerification.verifyJobName')" min-width="180" show-overflow-tooltip>
        <template slot-scope="scope">
          <div>{{ scope.row.name }}</div>
          <div class="font-color-slight">
            <span
              >{{ inspectMethod[scope.row.inspectMethod] }} (
              {{
                scope.row.mode === 'manual'
                  ? $t('dataVerification.singleVerify')
                  : $t('dataVerification.repeatingVerify')
              }}
              )
            </span>
            <span v-if="!scope.row.enabled" class="font-color-slight">&nbsp;Disabled</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="sourceTotal" width="120" :label="$t('verify_history_source_total_rows')"></el-table-column>
      <!-- <el-table-column prop="targetTotal" width="120" :label="$t('verify_history_target_total_rows')"></el-table-column> -->
      <el-table-column :label="$t('dataVerification.verifyResult')" width="180">
        <template slot-scope="scope">
          <div class="flex align-center">
            <template v-if="scope.row.InspectResult && ['waiting', 'done'].includes(scope.row.status)">
              <div v-if="scope.row.result !== 'passed'" class="data-verify__status error">
                <i class="data-verify__icon el-icon-error"></i>

                <span v-if="scope.row.inspectMethod === 'row_count'">
                  {{ $t('dataVerification.inconsistent') }}
                </span>
                <span v-else> {{ $t('dataVerification.contConsistent') }}{{ scope.row.difference_number }} </span>
              </div>
              <div v-else class="data-verify__status success">
                <i class="data-verify__icon el-icon-success"></i>
                <span>{{ $t('dataVerification.consistent') }}</span>
              </div>
            </template>
            <div v-else-if="scope.row.status === 'error'" class="data-verify__status">
              <i class="data-verify__icon el-icon-error"></i>
              <span>Error</span>
            </div>
            <div v-else-if="scope.row.status !== 'done'" class="data-verify__status">
              <img style="width: 26px; vertical-align: middle" :src="loadingImg" />
              <span>{{ statusMap[scope.row.status] }}</span>
            </div>
            <div v-else>-</div>
            <VIcon v-if="scope.row.InspectResult && scope.row.InspectResult.parentId" class="ml-2" size="14"
              >ercijiaoyan</VIcon
            >
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('dataVerification.verifyStatus')" width="120" prop="status">
        <template slot-scope="scope">
          <span>{{ statusMap[scope.row.status] }}</span>
          <span v-if="scope.row.InspectResult && scope.row.status === 'running'">
            {{ `(${Math.round(scope.row.InspectResult.progress * 100)}%)` }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('dataVerification.verifyTime')"
        prop="lastStartTime"
        sortable="lastStartTime"
        width="140"
      ></el-table-column>
      <el-table-column :label="$t('dataVerification.operation')" width="250" fixed="right">
        <template slot-scope="scope">
          <ElLink
            v-readonlybtn="'verify_job_edition'"
            type="primary"
            :disabled="
              $disabledByPermission('verify_job_edition_all_data', scope.row.user_id) ||
              ['running', 'scheduling'].includes(scope.row.status)
            "
            @click="startTask(scope.row.id)"
            >{{ $t('verify_executeVerifyTip') }}</ElLink
          >
          <ElDivider direction="vertical" v-readonlybtn="'verify_job_edition'"></ElDivider>
          <ElLink type="primary" :disabled="!scope.row.InspectResult" @click="toTableInfo(scope.row.id)">{{
            $t('verify_detailTip')
          }}</ElLink>
          <ElDivider direction="vertical"></ElDivider>
          <ElLink
            v-readonlybtn="'verify_job_edition'"
            type="primary"
            :disabled="$disabledByPermission('verify_job_edition_all_data', scope.row.user_id)"
            @click="goEdit(scope.row.id, scope.row.flowId)"
            >{{ $t('verify_configurationTip') }}</ElLink
          >
          <ElDivider direction="vertical" v-readonlybtn="'verify_job_edition'"></ElDivider>
          <ElDropdown v-show="moreAuthority" size="small" @command="handleCommand($event, scope.row)">
            <ElLink type="primary" class="rotate-90">
              <i class="el-icon-more"></i>
            </ElLink>
            <ElDropdownMenu class="dataflow-table-more-dropdown-menu" slot="dropdown">
              <ElDropdownItem command="history" :disabled="!scope.row.InspectResult"
                >{{ $t('verify_historyTip') }}
              </ElDropdownItem>
              <ElDropdownItem
                command="remove"
                v-readonlybtn="'verify_job_delete'"
                :disabled="$disabledByPermission('verify_job_delete_all_data', scope.row.user_id)"
                >{{ $t('verify_deleteTip') }}</ElDropdownItem
              >
            </ElDropdownMenu>
          </ElDropdown>
        </template>
      </el-table-column>
    </TablePage>
  </section>
</template>

<script>
import TablePage from '@/components/TablePage'
import { toRegExp } from '../../utils/util'
import VIcon from '@/components/VIcon'
import FilterBar from '@/components/filter-bar'
let timeout = null
export default {
  components: {
    TablePage,
    VIcon,
    FilterBar
  },
  data() {
    return {
      // isClassShow: true,
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
        row_count: this.$t('dataVerification.rowVerify'),
        field: this.$t('dataVerification.contentVerify'),
        jointField: this.$t('dataVerification.jointVerify'),
        cdcCount: '动态校验'
      },
      statusMap: {
        waiting: this.$t('dataVerification.waiting'),
        scheduling: this.$t('dataVerification.scheduling'),
        error: this.$t('dataVerification.error'),
        done: this.$t('dataVerification.done'),
        running: this.$t('dataVerification.running')
      },
      validList: [
        { label: this.$t('verify_check_same'), value: 'passed' },
        { label: this.$t('verify_count_difference'), value: 'row_count' },
        { label: this.$t('verify_content_difference'), value: 'valueDiff' },
        { label: 'ERROR', value: 'error' }
      ],
      verifyTypeList: [
        { label: this.$t('verify_row_verify'), value: 'row_count' },
        { label: this.$t('verify_content_verify'), value: 'field' },
        { label: this.$t('verify_joint_verify'), value: 'jointField' }
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
  created() {
    if (this.$route && this.$route.query) {
      this.searchParams.keyword = this.$route.query.name
      this.searchParams.result = this.$route.query.executionStatus
    }
    timeout = setInterval(() => {
      this.table.fetch(null, 0, true)
    }, 10000)
    this.getFilterItems()
  },
  mounted() {
    this.searchParams = Object.assign(this.searchParams, this.table.getCache())
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
    // 批量导入
    handleImport() {
      let routeUrl = this.$router.resolve({
        // path: '/upload?type=Inspect'
        name: 'upload',
        query: {
          type: 'Inspect'
        }
      })
      window.open(routeUrl.href, '_blank')
    },
    // 批量导出
    handleExport() {
      let ids = this.multipleSelection.map(item => item.id)
      let where = {
        _id: {
          in: ids
        }
      }
      this.$api('MetadataInstances').download(where, 'Inspect')
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
      return this.$api('Inspects')
        .get({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          let list = res.data?.items || []
          return {
            total: res.data.total,
            data: list.map(item => {
              let result = item.InspectResult
              let sourceTotal = '-'
              let targetTotal = '-'
              if (result) {
                sourceTotal = result.source_total
                targetTotal = result.target_total
              }
              item.lastStartTime = item.lastStartTime
                ? this.$moment(item.lastStartTime).format('YYYY-MM-DD HH:mm:ss')
                : '-'
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
      let url = ''
      let route = this.$router.resolve({
        name: 'dataVerifyDetails',
        params: {
          id
        }
      })
      url = route.href
      window.open(url, '_blank')
    },
    history(id) {
      let url = ''
      let route = this.$router.resolve({
        name: 'dataVerifyHistory',
        params: {
          id
        }
      })
      url = route.href
      window.open(url, '_blank')
    },
    startTask(id) {
      // let multipleSelection = id ? [id] : this.multipleSelection
      this.$api('Inspects')
        .update(
          {
            id: id
          },
          { status: 'scheduling', ping_time: 0, scheduleTimes: 0, byFirstCheckId: '' }
        )
        .then(() => {
          this.$message.success(this.$t('dataVerification.startVerify'))
          this.table.fetch()
        })
    },
    remove(id, row) {
      let name = row.name
      this.$confirm(`${this.$t('dataVerification.deleteMessage')} ${name}?`, this.$t('dataFlow.importantReminder'), {
        confirmButtonText: this.$t('classification.deleteNode'),
        cancelButtonText: this.$t('message.cancel'),
        type: 'warning'
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        this.$api('Inspects')
          .delete(id)
          .then(() => {
            this.$message.success(this.$t('message.deleteOK'))
            this.table.fetch()
          })
      })
    },
    goEdit(id, flowId) {
      this.$api('Task')
        .getId(flowId)
        .then(res => {
          if (['running', 'stop'].includes(res.data.status)) {
            // this.$router.push('dataVerification/' + id + '/edit')
            this.$router.push({
              name: 'dataVerificationEdit',
              params: {
                id: id
              }
            })
          } else {
            this.$message.info(
              this.$t('dataVerification.checkStatusPre') +
                res.data.status +
                this.$t('dataVerification.checkStatusSuffix')
            )
          }
        })
    },
    getFilterItems() {
      this.filterItems = [
        {
          label: this.$t('verify_type'),
          key: 'inspectMethod',
          type: 'select-inner',
          items: this.verifyTypeList,
          selectedWidth: '200px'
        },
        {
          label: this.$t('verify_check_frequency'),
          key: 'mode',
          type: 'select-inner',
          items: [
            { label: this.$t('verify_single'), value: 'MANUALLY_SPECIFIED_BY_THE_USER' },
            { label: this.$t('verify_repeating'), value: 'cron' }
          ]
        },
        {
          label: this.$t('verify_is_enabled'),
          key: 'enabled',
          type: 'select-inner',
          items: [
            { label: this.$t('verify_job_enable'), value: 1 },
            { label: this.$t('verify_job_disable'), value: 2 }
          ]
        },
        {
          label: this.$t('verify_result'),
          key: 'result',
          type: 'select-inner',
          items: this.validList
        },
        {
          placeholder: this.$t('verify_task_name'),
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
    // padding-left: 20px;
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
