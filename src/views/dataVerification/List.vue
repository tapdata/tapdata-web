<template>
  <section class="data-verify-wrap">
    <TablePage
      ref="table"
      row-key="id"
      :title="$t('app.menu.dataVerification')"
      :remoteMethod="getData"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortTable"
    >
      <ul class="search-bar" slot="search">
        <li class="item">
          <ElInput
            v-model="searchParams.keyword"
            clearable
            size="small"
            prefix-icon="el-icon-search"
            :placeholder="$t('dataVerification.verifyjobname')"
            @input="table.fetch(1, 800)"
          ></ElInput>
        </li>
        <li class="item">
          <ElSelect
            v-model="searchParams.inspectMethod"
            clearable
            size="small"
            :placeholder="$t('dataVerification.verifyType')"
            @input="inspectMethodChange"
          >
            <ElOption :label="$t('dataVerification.rowVerify')" value="row_count"></ElOption>
            <ElOption :label="$t('dataVerification.contentVerify')" value="field"></ElOption>
            <ElOption :label="$t('dataVerification.jointVerify')" value="jointField"></ElOption>
          </ElSelect>
        </li>
        <li class="item">
          <ElSelect
            v-model="searchParams.mode"
            clearable
            size="small"
            :placeholder="$t('dataVerification.singleRepeatingVerify')"
            @input="table.fetch(1)"
          >
            <ElOption :label="$t('dataVerification.singleVerify')" value="manual"></ElOption>
            <ElOption :label="$t('dataVerification.repeatingVerify')" value="cron"></ElOption>
          </ElSelect>
        </li>
        <li class="item">
          <ElSelect
            v-model="searchParams.enabled"
            clearable
            size="small"
            :placeholder="$t('dataVerification.isEnabled')"
            @input="table.fetch(1)"
          >
            <ElOption :label="$t('dataVerification.enable')" :value="1"></ElOption>
            <ElOption :label="$t('dataVerification.disable')" :value="2"></ElOption>
          </ElSelect>
        </li>
        <li class="item">
          <ElSelect
            v-model="searchParams.result"
            clearable
            size="small"
            :placeholder="$t('dataVerification.result')"
            @input="table.fetch(1)"
          >
            <ElOption v-for="item in validList" :key="item.value" :label="item.name" :value="item.value"></ElOption>
          </ElSelect>
        </li>
        <li class="item">
          <ElButton plain class="btn-refresh" size="small" @click="table.fetch()">
            <i class="el-icon-refresh"></i>
          </ElButton>
        </li>
      </ul>
      <div slot="operation">
        <el-button
          v-if="$window.getSettingByKey('DFS_TCM_PLATFORM') !== 'drs'"
          v-readonlybtn="'SYNC_job_import'"
          size="mini"
          class="btn"
          @click="handleImport"
        >
          <i class="iconfont icon-daoru back-btn-icon"></i>
          <span> {{ $t('dataFlow.bulkImport') }}</span>
        </el-button>
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
          size="small"
          @click="$router.push({ name: 'dataVerificationCreate' })"
        >
          <i class="iconfont icon-jia add-btn-icon"></i>
          <span> {{ $t('dataVerification.addVerifyTip') }}</span>
        </ElButton>
      </div>
      <el-table-column type="selection" width="45"></el-table-column>
      <el-table-column :label="$t('dataVerification.verifyJobName')" min-width="180">
        <template slot-scope="scope">
          <div>{{ scope.row.name }}</div>
          <div style="color: #aaa">
            <span
              >{{ inspectMethod[scope.row.inspectMethod] }} (
              {{
                scope.row.mode === 'manual'
                  ? $t('dataVerification.singleVerify')
                  : $t('dataVerification.repeatingVerify')
              }}
              )
            </span>
            <span v-if="!scope.row.enabled" style="color: #f56c6c">&nbsp;Disabled</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="sourceTotal" width="120" :label="$t('dataVerification.sourceTotalRows')"></el-table-column>
      <el-table-column prop="targetTotal" width="120" :label="$t('dataVerification.targetTotalRows')"></el-table-column>
      <el-table-column :label="$t('dataVerification.verifyResult')" width="140">
        <template slot-scope="scope">
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
            <img style="width: 26px; vertical-align: middle" :src="$window._TAPDATA_OPTIONS_.loadingImg" />
            <span>{{ statusMap[scope.row.status] }}</span>
          </div>
          <div v-else>-</div>
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
        sortable="custom"
        width="140"
      ></el-table-column>
      <el-table-column :label="$t('dataVerification.operation')" width="320" fixed="right">
        <template slot-scope="scope">
          <ElLink
            v-readonlybtn="'verify_job_edition'"
            type="primary"
            :disabled="
              $disabledByPermission('verify_job_edition_all_data', scope.row.user_id) ||
              ['running', 'scheduling'].includes(scope.row.status)
            "
            @click="startTask(scope.row.id)"
            >{{ $t('dataVerification.executeVerifyTip') }}</ElLink
          >
          <ElLink
            style="margin-left: 10px"
            type="primary"
            :disabled="!scope.row.InspectResult"
            @click="toTableInfo(scope.row.id, scope.row.InspectResult.id, scope.row.inspectMethod, scope.row.name)"
            >{{ $t('dataVerification.detailTip') }}</ElLink
          >
          <ElLink
            style="margin-left: 10px"
            type="primary"
            :disabled="!scope.row.InspectResult"
            @click="toTableHistory(scope.row.id)"
            >{{ $t('dataVerification.historyTip') }}</ElLink
          >
          <ElLink
            v-readonlybtn="'verify_job_edition'"
            style="margin-left: 10px"
            type="primary"
            :disabled="$disabledByPermission('verify_job_edition_all_data', scope.row.user_id)"
            @click="goEdit(scope.row.id, scope.row.flowId)"
            >{{ $t('dataVerification.configurationTip') }}</ElLink
          >
          <ElLink
            v-readonlybtn="'verify_job_delete'"
            style="margin-left: 10px"
            type="primary"
            :disabled="$disabledByPermission('verify_job_delete_all_data', scope.row.user_id)"
            @click="remove(scope.row.name, scope.row.id)"
            >{{ $t('dataVerification.deleteTip') }}</ElLink
          >
        </template>
      </el-table-column>
    </TablePage>
  </section>
</template>

<script>
import TablePage from '@/components/TablePage'
import { toRegExp } from '../../utils/util'
let timeout = null
export default {
  components: {
    TablePage
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
      order: 'createTime DESC',
      inspectMethod: {
        row_count: this.$t('dataVerification.rowVerify'),
        field: this.$t('dataVerification.contentVerify'),
        jointField: this.$t('dataVerification.jointVerify')
      },
      statusMap: {
        waiting: this.$t('dataVerification.waiting'),
        scheduling: this.$t('dataVerification.scheduling'),
        error: this.$t('dataVerification.error'),
        done: this.$t('dataVerification.done'),
        running: this.$t('dataVerification.running')
      },
      validList: [
        { name: this.$t('app.Home.checkSame'), value: 'passed' },
        { name: this.$t('app.Home.countDifference'), value: 'row_count' },
        { name: this.$t('app.Home.contentDifference'), value: 'valueDiff' },
        { name: 'ERROR', value: 'error' }
      ],
      multipleSelection: []
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
        path: '/upload?type=Inspect'
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
      this.order = `${order ? prop : 'createTime'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
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
      return Promise.all([
        this.$api('Inspects').count({ where: where }),
        this.$api('Inspects').get({
          filter: JSON.stringify(filter)
        })
      ]).then(([countRes, res]) => {
        let list = res.data || []
        return {
          total: countRes.data.count,
          data: list.map(item => {
            let result = item.InspectResult
            let sourceTotal = '-'
            let targetTotal = '-'
            let diffNum = 0
            if (result) {
              sourceTotal = result.source_total
              targetTotal = result.target_total
              diffNum = Math.abs(targetTotal - sourceTotal)
            }
            item.lastStartTime = item.lastStartTime
              ? this.$moment(item.lastStartTime).format('YYYY-MM-DD HH:mm:ss')
              : '-'
            item.sourceTotal = sourceTotal
            item.targetTotal = targetTotal
            item.diffNum = diffNum
            return item
          })
        }
      })
    },
    toTableInfo(id, resultId, type, name) {
      let route = this.$router.resolve({
        name: 'dataVerifyResult',
        query: {
          id: resultId,
          inspectId: id,
          type: type,
          name: name
        }
      })
      window.open(route.href, '_blank')
    },
    toTableHistory(id) {
      let route = this.$router.resolve({
        path: '/dataVerifyHistory',
        query: {
          inspectId: id
        }
      })
      window.open(route.href, '_blank')
    },
    startTask(id) {
      let multipleSelection = id ? [id] : this.multipleSelection
      this.$api('Inspects')
        .update(
          {
            id: {
              inq: multipleSelection
            }
          },
          { status: 'scheduling', ping_time: 0 }
        )
        .then(() => {
          this.$message.success(this.$t('dataVerification.startVerify'))
          this.table.fetch()
        })
    },
    remove(name, id) {
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
      this.$api('DataFlows')
        .getId(flowId)
        .then(res => {
          if (['running', 'paused', 'error'].includes(res.data.status)) {
            let route = this.$router.resolve('dataVerification/' + id + '/edit')
            window.open(route.href, '_blank')
          } else {
            this.$message.info(
              this.$t('dataVerification.checkStatusPre') +
                res.data.status +
                this.$t('dataVerification.checkStatusSuffix')
            )
          }
        })
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
    margin-left: 5px;
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
  .el-table--border th {
    border-right: 1px solid #dcdfe6;
  }
}
</style>
