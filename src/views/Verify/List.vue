<template>
  <section class="verify-wrapper page-wrapper" v-loading="loading" v-if="$route.name === 'Verify'">
    <div class="page-header">
      <ul class="search-bar">
        <li class="item">
          <ElSelect
            v-model="searchParams.inspectMethod"
            clearable
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
            :placeholder="$t('dataVerification.singleRepeatingVerify')"
            @input="search()"
          >
            <ElOption :label="$t('dataVerification.singleVerify')" value="manual"></ElOption>
            <ElOption :label="$t('dataVerification.repeatingVerify')" value="cron"></ElOption>
          </ElSelect>
        </li>
        <li class="item">
          <ElSelect
            v-model="searchParams.enabled"
            clearable
            :placeholder="$t('dataVerification.isEnabled')"
            @input="search()"
          >
            <ElOption :label="$t('dataVerification.enable')" :value="1"></ElOption>
            <ElOption :label="$t('dataVerification.disable')" :value="2"></ElOption>
          </ElSelect>
        </li>
        <li class="item">
          <ElSelect
            v-model="searchParams.result"
            clearable
            :placeholder="$t('dataVerification.result')"
            @input="search()"
          >
            <ElOption v-for="item in validList" :key="item.value" :label="item.name" :value="item.value"></ElOption>
          </ElSelect>
        </li>
        <li class="item">
          <ElInput
            v-model="searchParams.keyword"
            clearable
            :placeholder="$t('dataVerification.verifyjobname')"
            @input="search(800)"
          >
            <VIcon slot="prefix" size="14" class="ml-1" style="height: 100% !important">search</VIcon>
          </ElInput>
        </li>
        <li class="item">
          <ElButton plain class="btn-refresh" @click="fetch()">
            <VIcon>refresh</VIcon>
          </ElButton>
        </li>
      </ul>
      <div>
        <ElButton type="primary" @click="toCreate">
          <VIcon>plus</VIcon>
          <span> {{ $t('dataVerification.addVerifyTip') }}</span>
        </ElButton>
      </div>
    </div>
    <ElTable
      class="page-table table-border"
      style="margin-top: 10px"
      height="100%"
      :data="list"
      @sort-change="handleSortTable"
    >
      <ElTableColumn :label="$t('dataVerification.verifyJobName')" min-width="180">
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
      </ElTableColumn>
      <ElTableColumn prop="sourceTotal" width="120" :label="$t('verify_history_source_total_rows')"></ElTableColumn>
      <!-- <ElTableColumn prop="targetTotal" width="120" :label="$t('verify_history_target_total_rows')"></ElTableColumn> -->
      <ElTableColumn :label="$t('dataVerification.verifyResult')" width="140">
        <template slot-scope="scope">
          <template v-if="scope.row.result && ['waiting', 'done'].includes(scope.row.status)">
            <div v-if="scope.row.result !== 'passed'" class="data-verify__status error">
              <VIcon class="color-danger" size="14">error</VIcon>
              <span v-if="scope.row.inspectMethod === 'row_count'">
                {{ $t('dataVerification.inconsistent') }}
              </span>
              <span v-else> {{ $t('dataVerification.contConsistent') }}{{ scope.row.difference_number }} </span>
            </div>
            <div v-else class="data-verify__status success">
              <VIcon size="18">success-fill-color</VIcon>
              <span>{{ $t('dataVerification.consistent') }}</span>
            </div>
          </template>
          <div v-else-if="scope.row.status === 'error'" class="data-verify__status">
            <VIcon class="color-danger" size="14">error</VIcon>
            <span>Error</span>
          </div>
          <div v-else-if="scope.row.status !== 'done'" class="data-verify__status">
            <VIcon style="font-size: 18px; margin: 0 4px" color="#10C038">loading</VIcon>
            <span>{{ statusMap[scope.row.status] }}</span>
          </div>
          <div v-else>-</div>
        </template>
      </ElTableColumn>
      <ElTableColumn :label="$t('dataVerification.verifyStatus')" width="120" prop="status">
        <template slot-scope="scope">
          <span>{{ statusMap[scope.row.status] }}</span>
          <span v-if="scope.row.InspectResult && scope.row.status === 'running'">
            {{ `(${Math.round(scope.row.InspectResult.progress * 100)}%)` }}
          </span>
        </template>
      </ElTableColumn>
      <ElTableColumn
        :label="$t('dataVerification.verifyTime')"
        prop="lastStartTime"
        sortable="custom"
        width="160"
      ></ElTableColumn>
      <ElTableColumn :label="$t('dataVerification.operation')" width="320" fixed="right">
        <template slot-scope="scope">
          <ElLink
            type="primary"
            :disabled="['running', 'scheduling'].includes(scope.row.status)"
            @click="startTask(scope.row.id)"
            >{{ $t('dataVerification.executeVerifyTip') }}</ElLink
          >
          <ElLink
            style="margin-left: 10px"
            type="primary"
            :disabled="!scope.row.InspectResult"
            @click="toTableInfo(scope.row.id)"
            >{{ $t('dataVerification.detailTip') }}</ElLink
          >
          <ElLink
            style="margin-left: 10px"
            type="primary"
            :disabled="!scope.row.InspectResult"
            @click="toTableHistory(scope.row.id)"
            >{{ $t('dataVerification.historyTip') }}</ElLink
          >
          <ElLink style="margin-left: 10px" type="primary" @click="goEdit(scope.row.id, scope.row.flowId)">{{
            $t('dataVerification.configurationTip')
          }}</ElLink>
          <ElLink style="margin-left: 10px" type="primary" @click="remove(scope.row.name, scope.row.id)">{{
            $t('dataVerification.deleteTip')
          }}</ElLink>
        </template>
      </ElTableColumn>
      <div class="page-table__empty" slot="empty">
        <VIcon>folder-opened</VIcon>
        <span class="ml-1" v-if="!isSearching">暂无数据</span>
        <span v-else> 没有查到符合条件的结果，<ElLink type="primary" @click="reset">返回列表</ElLink> </span>
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
.page-wrapper {
  display: flex;
  margin: 20px;
  padding: 20px;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
  box-sizing: border-box;
  .page-header {
    display: flex;
    justify-content: space-between;
  }
  .search-bar {
    .item {
      margin-right: 10px;
      float: left;
    }
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
}
</style>
<script>
import VIcon from '@/components/VIcon'
let timer = null
export default {
  components: { VIcon },
  data() {
    return {
      loading: false,
      searchParams: {
        keyword: '',
        inspectMethod: '',
        mode: '',
        enabled: '',
        result: ''
      },

      page: {
        current: 1,
        size: 10,
        total: 0
      },
      list: [],
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
      ]
    }
  },
  computed: {
    isSearching() {
      return !!Object.values(this.searchParams).join('')
    }
  },
  watch: {
    '$route.query'(query) {
      this.searchParams = Object.assign(this.searchParams, query)
      this.fetch(1)
    }
  },
  created() {
    let query = this.$route.query
    this.searchParams = Object.assign(this.searchParams, query)
    this.fetch()
    timer = setInterval(() => {
      let list = this.list || []
      let ids = []
      list.forEach(item => {
        if (['running', 'scheduling'].includes(item.status)) {
          ids.push(item.id)
        }
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
    async updateStatusByIds(ids) {
      let filter = {
        where: {
          id: {
            $inq: ids
          }
        }
      }
      let data = await this.$axios.get('tm/api/Inspects?filter=' + encodeURIComponent(JSON.stringify(filter)))
      let changeList = data || []
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
        let filterObj = { like: this.$util.toRegExp(keyword), options: 'i' }
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
      Promise.all([
        this.$axios.get('tm/api/Inspects/count?where=' + encodeURIComponent(JSON.stringify(where))),
        this.$axios.get('tm/api/Inspects?filter=' + encodeURIComponent(JSON.stringify(filter)))
      ])
        .then(([countData, data]) => {
          this.page.total = countData.count
          let list = data || []
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
      let diffNum = 0
      if (result) {
        sourceTotal = result.source_total
        targetTotal = result.target_total
        diffNum = Math.abs(targetTotal - sourceTotal)
      }
      item.lastStartTime = item.lastStartTime ? this.$moment(item.lastStartTime).format('YYYY-MM-DD HH:mm:ss') : '-'
      item.sourceTotal = sourceTotal
      item.targetTotal = targetTotal
      item.diffNum = diffNum
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
            this.$message.success(this.$t('dataVerification.startVerify'))
            this.updateStatusByIds([id])
          })
      })
    },
    remove(name, id) {
      this.$confirm(`${this.$t('dataVerification.deleteMessage')} ${name}?`, this.$t('dataFlow.importantReminder'), {
        confirmButtonText: this.$t('classification.deleteNode'),
        cancelButtonText: this.$t('message.cancel'),
        type: 'warning'
      }).then(flat => {
        if (flat) {
          this.$axios.delete('tm/api/Inspects/' + id).then(() => {
            this.$message.success(this.$t('message.deleteOK'))
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
            this.$t('dataVerification.checkStatusPre') + data.status + this.$t('dataVerification.checkStatusSuffix')
          )
        }
      })
    }
  }
}
</script>
