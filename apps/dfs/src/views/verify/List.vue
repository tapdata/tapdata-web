<template>
  <section class="verify-wrapper g-panel-container" v-loading="loading" v-if="$route.name === 'Verify'">
    <div class="page-header">
      <FilterBar v-model="searchParams" :items="filterItems" @search="search" @fetch="fetch"></FilterBar>
      <div>
        <VButton type="primary" @click="toCreate">
          <span>{{ $t('verify_button_create') }}</span>
        </VButton>
      </div>
    </div>
    <ElTable class="page-table table-border mt-4" height="100%" :data="list" @sort-change="handleSortTable">
      <ElTableColumn :label="$t('verify_job_name')" min-width="180">
        <template slot-scope="scope">
          <div>{{ scope.row.name }}</div>
          <div style="color: #aaa">
            <span
              >{{ inspectMethod[scope.row.inspectMethod] }} (
              {{ scope.row.mode === 'manual' ? $t('verify_frequency_manual') : $t('verify_frequency_cron') }}
              )
            </span>
            <span v-if="!scope.row.enabled" style="color: #f56c6c">&nbsp;Disabled</span>
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="sourceTotal" width="120" :label="$t('verify_history_source_total_rows')"></ElTableColumn>
      <!-- <ElTableColumn prop="targetTotal" width="120" :label="$t('verify_history_target_total_rows')"></ElTableColumn> -->
      <ElTableColumn :label="$t('dataVerification_verifyStatus')" width="120" prop="status">
        <template slot-scope="scope">
          <StatusTag type="text" :status="scope.row.status" :status-map="statusMap"></StatusTag>
          <span v-if="scope.row.InspectResult && scope.row.status === 'running'">
            {{ `(${Math.round((scope.row.InspectResult.progress || 0) * 100)}%)` }}
          </span>
        </template>
      </ElTableColumn>
      <ElTableColumn :label="$t('dataVerification_verifyResult')" width="180">
        <template slot-scope="scope">
          <div class="flex align-items-center">
            <template v-if="scope.row.InspectResult && ['waiting', 'done'].includes(scope.row.status)">
              <div v-if="scope.row.result !== 'passed'" class="data-verify__status error">
                <VIcon class="verify-status-icon color-danger" size="14">error</VIcon>
                <span v-if="scope.row.inspectMethod === 'row_count'">
                  {{ $t('verify_result_count_inconsistent') }}
                </span>
                <span v-else>{{ $t('verify_result_content_diff', [scope.row.difference_number]) }}</span>
              </div>
              <div v-else class="data-verify__status success">
                <VIcon class="verify-status-icon color-success" size="14">success</VIcon>
                <span>{{ $t('verify_result_count_consistent') }}</span>
              </div>
            </template>
            <div v-else-if="scope.row.status === 'error'" class="data-verify__status">
              <VIcon class="verify-status-icon color-danger" size="14">error</VIcon>
              <span>Error</span>
            </div>
            <div v-else-if="scope.row.status !== 'done'" class="data-verify__status">
              <VIcon size="18" class="color-success">loading</VIcon>
              <span>{{ getStatusText(scope.row) }}</span>
            </div>
            <div v-else>-</div>
            <VIcon v-if="scope.row.InspectResult && scope.row.InspectResult.parentId" class="ml-2" size="14"
              >ercijiaoyan</VIcon
            >
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn
        :label="$t('dataVerification_verifyTime')"
        prop="lastStartTime"
        sortable="custom"
        width="160"
      ></ElTableColumn>
      <ElTableColumn :label="$t('list_operation')" width="366">
        <template slot-scope="scope">
          <ElLink
            type="primary"
            :disabled="['running', 'scheduling'].includes(scope.row.status)"
            @click="startTask(scope.row.id)"
            >{{ $t('verify_implement') }}</ElLink
          >
          <ElDivider direction="vertical"></ElDivider>
          <ElLink type="primary" :disabled="!scope.row.InspectResult" @click="toTableInfo(scope.row.id)">{{
            $t('verify_info')
          }}</ElLink>
          <ElDivider direction="vertical"></ElDivider>
          <ElLink type="primary" :disabled="!scope.row.InspectResult" @click="toTableHistory(scope.row.id)">{{
            $t('verify_history')
          }}</ElLink>
          <ElDivider direction="vertical"></ElDivider>
          <ElLink
            type="primary"
            :disabled="['running', 'scheduling'].includes(scope.row.status)"
            @click="goEdit(scope.row.id, scope.row.flowId)"
            >{{ $t('verify_configuration') }}</ElLink
          >
          <ElDivider direction="vertical"></ElDivider>
          <ElLink type="primary" @click="remove(scope.row.name, scope.row.id)">{{ $t('verify_delete') }}</ElLink>
        </template>
      </ElTableColumn>
      <div v-if="!isSearching" class="page-table__empty" slot="empty">
        <VIcon size="120">no-data-color</VIcon>
        <div class="flex justify-content-center lh-sm fs-7 font-color-sub">
          <span>{{ $t('gl_no_data') }}</span>
          <ElLink type="primary" class="fs-7" @click="toCreate">{{ $t('verify_button_create') }}</ElLink>
        </div>
      </div>
      <div v-else class="page-table__empty" slot="empty">
        <VIcon size="120">search-no-data-color</VIcon>
        <div class="flex justify-content-center lh-sm fs-7 font-color-sub">
          <span>{{ $t('gl_no_match_result') }}</span>
          <ElLink type="primary" class="fs-7" @click="reset">{{ $t('gl_back_to_list') }}</ElLink>
        </div>
      </div>
    </ElTable>
    <ElPagination
      background
      class="mt-3"
      layout="total, sizes, ->, prev, pager, next, jumper"
      :current-page.sync="page.current"
      :page-sizes="[10, 20, 50, 100]"
      :page-size.sync="page.size"
      :total="page.total"
      @size-change="fetch(1)"
      @current-change="fetch"
    >
    </ElPagination>
  </section>
  <RouterView v-else></RouterView>
</template>
<style lang="scss" scoped>
.verify-wrapper {
  display: flex;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  .page-header {
    display: flex;
    justify-content: space-between;
  }
  .btn-refresh {
    padding: 0;
    height: 32px;
    line-height: 32px;
    width: 32px;
    font-size: 16px;
  }
  .page-table {
    flex: 1;
    overflow: auto;
    border-bottom: none;
  }
  .verify-status-icon {
    margin: 0 4px;
    font-size: 14px;
  }
  .page-table__empty {
    color: map-get($fontColor, light);
  }
  .el-divider--vertical {
    margin: 0 16px;
  }
}
</style>
<script>
import i18n from '@/i18n'

import VIcon from '@/components/VIcon'
import StatusTag from '@/components/StatusTag'
import FilterBar from '@/components/filter-bar'

let timer = null
export default {
  components: { VIcon, StatusTag, FilterBar },
  data() {
    // const $t = this.$t.bind(this)
    return {
      loading: false,
      searchParams: {
        keyword: '',
        inspectMethod: '',
        mode: '',
        enabled: '',
        result: ''
      },
      filterItems: [],
      page: {
        current: 1,
        size: 10,
        total: 0
      },
      list: [],
      order: 'createTime DESC',

      inspectMethod: {
        row_count: this.$t('dataVerification_rowVerify'),
        field: this.$t('dataVerification_contentVerify'),
        jointField: this.$t('dataVerification_jointVerify')
      },
      statusMap: {
        waiting: {
          color: '#FFB318',
          text: this.$t('dataVerification_waiting')
        },
        scheduling: {
          color: '#FFB318',
          text: this.$t('dataVerification_scheduling')
        },
        error: {
          color: '#F5222D',
          text: this.$t('dataVerification_error')
        },
        done: {
          color: '#52C41A',
          text: this.$t('dataVerification_done')
        },
        running: {
          color: '#FFB318',
          text: this.$t('dataVerification_running')
        }
      },
      validList: [
        { name: this.$t('app_Home_checkSame'), value: 'passed' },
        { name: this.$t('app_Home_countDifference'), value: 'row_count' },
        { name: this.$t('app_Home_contentDifference'), value: 'valueDiff' },
        { name: 'ERROR', value: 'error' }
      ]
    }
  },
  computed: {
    isSearching() {
      return !!Object.values(this.searchParams).join('')
    },
    filterInspectMethodOptions() {
      const $t = this.$t.bind(this)
      return [
        {
          label: $t('verify_type_row_count'),
          value: 'row_count'
        },
        {
          label: $t('verify_type_field'),
          value: 'field'
        },
        {
          label: $t('verify_type_joint_field'),
          value: 'jointField'
        }
      ]
    },
    filterModeOptions() {
      const $t = this.$t.bind(this)
      return [
        {
          label: $t('verify_frequency_manual'),
          value: 'manual'
        },
        {
          label: $t('verify_frequency_cron'),
          value: 'cron'
        }
      ]
    },
    filterEnabledOptions() {
      const $t = this.$t.bind(this)
      return [
        {
          label: $t('verify_job_enable'),
          value: 1
        },
        {
          label: $t('verify_job_disable'),
          value: 2
        }
      ]
    },
    filterResultOptions() {
      return this.validList.map(item => {
        return {
          label: item.name,
          value: item.value
        }
      })
    }
  },
  watch: {
    $route(route) {
      if (route.name === 'Verify') {
        let query = route.query
        this.searchParams = Object.assign(this.searchParams, query)
        let pageNum = JSON.stringify(query) === '{}' ? undefined : 1
        this.fetch(pageNum)
      }
    }
  },
  created() {
    let query = this.$route.query
    this.searchParams = Object.assign(this.searchParams, query)
    this.getFilterItems()
    this.fetch()
    timer = setInterval(() => {
      let list = this.list || []
      let ids = []
      list.forEach(item => {
        // if (['running', 'scheduling'].includes(item.status)) {
        ids.push(item.id)
        // }
      })
      if (ids.length && this.$route.name === 'Verify') {
        this.updateStatusByIds(ids)
      }
    }, 5000)
  },
  beforeDestroy() {
    clearInterval(timer)
    timer = null
  },
  methods: {
    getFilterItems() {
      this.filterItems = [
        {
          label: i18n.t('verify_List_leiXing'),
          key: 'inspectMethod',
          type: 'select-inner',
          items: this.filterInspectMethodOptions
        },
        {
          label: i18n.t('verify_List_pinCi'),
          key: 'mode',
          type: 'select-inner',
          items: this.filterModeOptions
        },
        {
          label: i18n.t('agent_status'),
          key: 'enabled',
          type: 'select-inner',
          items: this.filterEnabledOptions
        },
        {
          label: i18n.t('verify_List_jieGuo'),
          key: 'result',
          type: 'select-inner',
          items: this.filterResultOptions
        },

        {
          placeholder: i18n.t('task_Migration_mingCheng'),
          key: 'keyword',
          type: 'input'
        }
      ]
    },
    async updateStatusByIds(ids) {
      let filter = {
        where: {
          id: {
            $inq: ids
          }
        }
      }
      let data = await this.$axios.get('tm/api/Inspects?filter=' + encodeURIComponent(JSON.stringify(filter)))
      let changeList = data.items || []
      let map = {}
      changeList.forEach(item => {
        map[item.id] = item
      })
      this.list.forEach(item => {
        let changeItem = map[item.id]
        if (changeItem) {
          Object.assign(item, this.formatData(changeItem))
        }
      })
    },
    search(debounce) {
      const { delayTrigger } = this.$util
      delayTrigger(() => {
        this.$router.replace({
          name: 'Verify',
          query: this.searchParams
        })
      }, debounce)
    },
    fetch(pageNum) {
      this.loading = true
      let current = pageNum || this.page.current
      let size = this.page.size
      let { keyword, inspectMethod, mode, enabled, result } = this.searchParams
      let where = {}
      //精准搜索 iModel
      if (keyword && keyword.trim()) {
        let filterObj = { $regex: this.$util.toRegExp(keyword), $options: 'i' }
        where['$or'] = [{ name: filterObj }, { dataFlowName: filterObj }]
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
      this.$axios
        .get('tm/api/Inspects?filter=' + encodeURIComponent(JSON.stringify(filter)))
        .then(data => {
          this.page.total = data.total
          let list = data.items || []
          this.list = list.map(this.formatData)
          if (!list.length && data.total > 0) {
            setTimeout(() => {
              this.fetch(this.page.current - 1)
            }, 0)
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    formatData(item) {
      let result = item.InspectResult
      let sourceTotal = '-'
      let targetTotal = '-'
      if (result) {
        sourceTotal = result.source_total
        targetTotal = result.target_total
        if (result.firstCheckId) {
          sourceTotal = result.firstSourceTotal
          targetTotal = result.firstTargetTotal
        }
      }
      item.lastStartTime = item.lastStartTime ? this.$moment(item.lastStartTime).format('YYYY-MM-DD HH:mm:ss') : '-'
      item.sourceTotal = sourceTotal
      item.targetTotal = targetTotal
      return item
    },
    inspectMethodChange(val) {
      if (val !== 'row_count' && this.searchParams.result === 'row_count') {
        this.searchParams.result = ''
      }
      this.search()
    },
    //筛选条件
    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'createTime'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
      this.fetch(1)
    },
    reset() {
      this.searchParams = {
        keyword: '',
        inspectMethod: '',
        mode: '',
        enabled: '',
        result: ''
      }
      this.fetch(1)
    },
    toTableInfo(id) {
      this.$router.push({
        name: 'VerifyDetails',
        params: {
          id
        }
      })
    },
    toTableHistory(id) {
      this.$router.push({
        name: 'VerifyHistory',
        params: {
          id
        }
      })
    },
    toCreate() {
      this.$checkAgentStatus(() => {
        this.$router.push({ name: 'VerifyCreate' })
      })
    },
    startTask(id) {
      this.$checkAgentStatus(() => {
        this.$axios
          .post(
            'tm/api/Inspects/update?where=' +
              encodeURIComponent(
                JSON.stringify({
                  id
                })
              ),
            { status: 'scheduling', ping_time: 0, scheduleTimes: 0, byFirstCheckId: '' }
          )
          .then(() => {
            this.$message.success(this.$t('dataVerification_startVerify'))
            this.updateStatusByIds([id])
          })
      })
    },
    remove(name, id) {
      this.$confirm(`${this.$t('dataVerification_deleteMessage')} ${name}?`, this.$t('dataFlow_importantReminder'), {
        confirmButtonText: this.$t('classification_deleteNode'),
        cancelButtonText: this.$t('message_cancel'),
        type: 'warning'
      }).then(flat => {
        if (flat) {
          this.$axios.delete('tm/api/Inspects/' + id).then(() => {
            this.$message.success(this.$t('message_deleteOK'))
            this.fetch()
          })
        }
      })
    },
    goEdit(id, flowId) {
      this.$axios.get('tm/api/DataFlows/' + flowId).then(data => {
        if (['running', 'paused', 'error'].includes(data.status)) {
          this.$router.push({
            name: 'VerifyEdit',
            params: {
              id
            }
          })
        } else {
          this.$message.info(
            this.$t('dataVerification_checkStatusPre') + data.status + this.$t('dataVerification_checkStatusSuffix')
          )
        }
      })
    },
    getStatusText(row) {
      return this.statusMap[row.status]?.text
    }
  }
}
</script>
