<template>
  <section class="migration-wrapper g-panel-container" v-loading="loading" v-if="$route.name === 'Task'">
    <!--    <div class="main">-->
    <div class="migration-operation">
      <div class="migration-operation-left">
        <FilterBar v-model="searchParams" :items="filterItems" @search="search" @fetch="fetch"></FilterBar>
      </div>
      <div class="migration-operation-right">
        <VButton type="primary" :loading="createLoading" @click="createTask"
          ><span>{{ $t('task_create_task') }}</span></VButton
        >
      </div>
    </div>
    <ElTable
      class="migration-table table-border font-color-sub mt-4"
      height="100%"
      :data="list"
      @sort-change="sortChange"
    >
      <ElTableColumn :label="$t('task_Migration_renWuMingCheng')" prop="name" min-width="200">
        <template v-slot="scope">
          <ElLink type="primary" @click="toDetails(scope.row)">{{ scope.row.name }}</ElLink>
        </template>
      </ElTableColumn>
      <ElTableColumn :label="$t('task_Migration_renWuLeiXing')" prop="typeText" width="140"></ElTableColumn>
      <ElTableColumn :label="$t('task_Migration_suoShuAGE')" prop="belongAgent" min-width="200">
        <template slot-scope="scope">
          <ElLink v-if="scope.row.belongAgent" type="primary" @click="toAgent(scope.row)">{{
            scope.row.belongAgent
          }}</ElLink>
          <span v-else>-</span>
        </template>
      </ElTableColumn>
      <ElTableColumn :label="$t('task_type')" prop="syncTypeText" width="140"></ElTableColumn>
      <ElTableColumn :label="$t('task_status')" width="120">
        <template slot-scope="scope">
          <div class="flex align-items-center">
            <StatusTag
              type="tag"
              target="task"
              :status="scope.row.isFinished ? 'finished' : scope.row.status"
            ></StatusTag>
            <ElTooltip
              v-if="scope.row.status === 'error'"
              effect="dark"
              :content="$t('components_ErrorLogDialog_cuoWuRiZhiCha')"
              placement="top"
            >
              <span class="ml-2 mt-1 cursor-pointer" @click="openErrorLog(scope.row)">
                <VIcon class="color-danger">warning-circle</VIcon>
              </span>
            </ElTooltip>
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn :label="$t('task_start_time')" prop="startTime" sortable="custom" width="150">
        <template slot-scope="scope">{{ scope.row.startTimeFmt }}</template>
      </ElTableColumn>
      <ElTableColumn :label="$t('task_next_run_time')" prop="nextScheduledTime" sortable="custom" width="150">
        <template slot-scope="scope">{{ scope.row.nextScheduledTimeFmt }}</template>
      </ElTableColumn>
      <ElTableColumn :label="$t('list_operation')" width="280">
        <template slot-scope="scope">
          <ElTooltip
            v-if="!['running', 'stopping'].includes(scope.row.status)"
            effect="dark"
            :content="$t('task_config_not_completed')"
            :manual="!(scope.row.status === 'draft' && scope.row.checked === false)"
            placement="top-start"
          >
            <VButton
              size="mini"
              type="text"
              :disabled="
                !statusBtMap['run'][scope.row.status] || (scope.row.status === 'draft' && scope.row.checked === false)
              "
              inner-loading
              auto-loading
              class="no-loading"
              @click="run([scope.row.id], scope.row, arguments[0])"
            >
              {{ $t('task_start_task') }}
            </VButton>
          </ElTooltip>
          <ElButton
            v-if="scope.row.status === 'running'"
            size="mini"
            type="text"
            :disabled="!statusBtMap['stop'][scope.row.status]"
            @click="stop([scope.row.id])"
          >
            {{ $t('task_stop_task') }}
          </ElButton>
          <ElButton
            v-if="scope.row.status === 'stopping'"
            size="mini"
            type="text"
            :disabled="!statusBtMap['forceStop'][scope.row.status]"
            @click="forceStop([scope.row.id])"
          >
            {{ $t('task_forced_stop') }}
          </ElButton>
          <ElDivider direction="vertical"></ElDivider>
          <ElButton size="mini" type="text" @click="toMonitor(scope.row)">
            {{ $t('task_operation_monitor') }}
          </ElButton>
          <ElDivider direction="vertical"></ElDivider>
          <ElButton
            size="mini"
            type="text"
            :disabled="!statusBtMap['edit'][scope.row.status]"
            @click="toEditor(scope.row)"
          >
            {{ $t('button_edit') }}
          </ElButton>
          <ElDivider direction="vertical"></ElDivider>
          <ElDropdown @command="handleMore($event, scope.row, scope.$index)">
            <ElButton size="mini" type="text" class="rotate-90">
              <i class="el-icon-more"></i>
            </ElButton>
            <ElDropdownMenu slot="dropdown" class="text-nowrap">
              <ElDropdownItem command="copy">{{ $t('button_copy') }}</ElDropdownItem>
              <ElDropdownItem command="resetAll" :disabled="!statusBtMap['reset'][scope.row.status]">
                {{ $t('button_reset') }}
              </ElDropdownItem>
              <ElDropdownItem command="del" :disabled="!statusBtMap['delete'][scope.row.status]">
                <span :class="{ 'color-danger': statusBtMap['delete'][scope.row.status] }">{{
                  $t('button_delete')
                }}</span>
              </ElDropdownItem>
            </ElDropdownMenu>
          </ElDropdown>
        </template>
      </ElTableColumn>
      <div v-if="!isSearching" class="migration-table__empty" slot="empty">
        <VIcon size="120">no-data-color</VIcon>
        <div class="flex justify-content-center lh-sm fs-7 font-color-sub">
          <span>{{ $t('gl_no_data') }}</span>
          <ElLink type="primary" class="fs-7" @click="createTask">{{ $t('task_create_task') }}</ElLink>
        </div>
      </div>
      <div v-else class="migration-table__empty" slot="empty">
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
    <ElDialog :title="$t('task_Migration_xuanZeRenWuLei')" :visible.sync="createVisible" width="416px" top="30vh">
      <div class="select-type flex justify-content-between">
        <div class="select-type__item" @click="createMigrate">
          <div>
            <div>{{ $t('task_Migration_shuJuKuQianYi') }}</div>
            <div class="mt-4">{{ $t('task_Migration_duiShuJuKuJin') }}</div>
          </div>
          <VIcon size="30" class="v-icon">right-fill</VIcon>
        </div>
        <div class="select-type__item data-table ml-10" @click="createSync">
          <div>
            <div>{{ $t('task_Migration_shuJuBiaoTongBu') }}</div>
            <div class="mt-4 font-color-sub">{{ $t('task_Migration_chouQuYuanDuanShu') }}</div>
          </div>
          <VIcon size="30" class="v-icon">right-fill</VIcon>
        </div>
      </div>
    </ElDialog>
    <!--    </div>-->
    <ErrorLogDialog
      v-model="errorLogDialogData.visible"
      :id="errorLogDialogData.dataFlowId"
      :params="errorLogDialogData.params"
    ></ErrorLogDialog>
  </section>
  <RouterView v-else></RouterView>
</template>
<style lang="scss" scoped>
.migration-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  .btn-refresh {
    padding: 0;
    height: 32px;
    line-height: 32px;
    width: 32px;
    font-size: 16px;
  }
  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .migration-operation {
    display: flex;
    justify-content: space-between;
    .migration-operation-left {
      li {
        float: left;
      }
    }
  }
  .migration-table {
    flex: 1;
    overflow: auto;
    border-bottom: none;
    .agent-link {
      color: unset;
      cursor: unset;
    }
  }
  .migration-table__empty {
    color: map-get($fontColor, light);
  }
  .v-icon {
    margin: 0 4px;
  }
  .select-type__item {
    display: flex;
    justify-content: space-between;
    flex: 1;
    padding: 16px;
    border-radius: 8px;
    background: #d9ecff;
    cursor: pointer;
    .v-icon {
      margin: 0;
      color: rgba(44, 101, 255, 1);
    }
    &.data-table {
      background: #ccf4ff;
      .v-icon {
        color: rgba(108, 218, 255, 1);
      }
    }
  }
  .el-divider--vertical {
    margin: 0 16px;
  }
}
</style>
<script>
import i18n from '@/i18n'

import { TASK_STATUS_MAP } from '../../const'
import StatusTag from '../../components/StatusTag'
import VIcon from '@/components/VIcon'
import FilterBar from '@/components/filter-bar'
import ErrorLogDialog from './components/ErrorLogDialog'
import { isFinished } from './copy/util'
import dayjs from 'dayjs'
let timer = null

export default {
  components: { StatusTag, VIcon, FilterBar, ErrorLogDialog },
  data() {
    return {
      loading: true,
      createLoading: false,
      searchParams: {
        status: '',
        syncType: '',
        agentId: '',
        keyword: '',
        type: ''
      },
      typeMap: {
        'cluster-clone': i18n.t('task_Migration_shuJuKuQianYi'),
        custom: i18n.t('task_Migration_shuJuBiaoTongBu')
      },
      syncTypeMap: {
        initial_sync: this.$t('task_initial_sync'),
        cdc: this.$t('task_sync_type_cdc'),
        'initial_sync+cdc': this.$t('task_initial_sync_cdc')
      },
      agentOptions: [],

      list: [],
      page: {
        current: 1,
        size: 10,
        total: 0
      },
      order: 'createTime desc',
      statusMap: TASK_STATUS_MAP,
      statusBtMap: {
        // scheduled, draft, running, stopping, error, paused, force stopping
        run: { draft: true, error: true, paused: true },
        stop: { running: true },
        delete: { draft: true, error: true, paused: true },
        edit: { draft: true, error: true, paused: true },
        reset: { draft: true, error: true, paused: true },
        forceStop: { stopping: true }
      },
      createVisible: false,
      filterItems: [],
      errorLogDialogData: {
        visible: false,
        dataFlowId: '',
        params: {}
      }
    }
  },
  computed: {
    statusOptions() {
      let options = {}
      let map = this.statusMap
      for (const key in map) {
        const item = map[key]
        let value = key
        if (options[item.text]) {
          value = options[item.text] + ',' + value
        }
        options[item.text] = value
      }
      return options
    },
    filterStatusOptions() {
      let result = []
      const { statusOptions, statusMap } = this
      for (let key in statusOptions) {
        let obj = {
          label: key,
          value: statusOptions[key]
        }
        if (statusOptions[key] === 'finished') {
          continue
        }
        if (key === this.$t('task_status_paused')) {
          obj.label += ',' + statusMap['finished'].text
        }
        result.push(obj)
      }
      return result
    },
    filterTypeMap() {
      return [
        {
          label: i18n.t('task_Migration_shuJuKuQianYi'),
          value: 'cluster-clone'
        },
        {
          label: i18n.t('task_Migration_shuJuBiaoTongBu'),
          value: 'custom'
        }
      ]
    },
    filterSyncTypeMap() {
      let result = []
      let obj = this.syncTypeMap
      for (let key in obj) {
        result.push({
          label: obj[key],
          value: key
        })
      }
      return result
      // syncTypeMap: {
      //   initial_sync: '全量',
      //     cdc: '增量',
      //     'initial_sync+cdc': '全量+增量'
      // }
    },
    isSearching() {
      return !!Object.values(this.searchParams).join('')
    }
  },
  watch: {
    $route(route) {
      if (route.name === 'Task') {
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
    this.fetch()
    this.getFilterItems()
    timer = setInterval(() => {
      let list = this.list || []
      let ids = []
      list.forEach(item => {
        if (['scheduled', 'stopping', 'force stopping'].includes(item.status)) {
          ids.push(item.id)
        }
      })
      if (ids.length && this.$route.name === 'Task') {
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
          label: i18n.t('task_Migration_renWuZhuangTai'),
          key: 'status',
          type: 'select-inner',
          items: this.filterStatusOptions,
          selectedWidth: '200px'
        },
        // {
        //   label: '任务类型',
        //   key: 'type',
        //   type: 'select-inner',
        //   items: this.filterTypeMap
        // },
        {
          label: i18n.t('task_Migration_tongBuLeiXing'),
          key: 'syncType',
          type: 'select-inner',
          items: this.filterSyncTypeMap
        },
        {
          label: i18n.t('task_Migration_aGENT'),
          key: 'agentId',
          type: 'select-inner',
          // url: 'api/tcm/agent',
          // filterKey: 'agentId',
          menuMinWidth: '250px',
          items: async () => {
            let filter = {
              where: {
                status: { $in: ['Running'] }
              },
              size: 100
            }
            let data = await this.$axios.get('api/tcm/agent?filter=' + encodeURIComponent(JSON.stringify(filter)))
            return data.items.map(item => {
              return {
                label: item.name,
                value: item.tmInfo.agentId
              }
            })
          }
          // formatData: data => {
          //   let result = {}
          //   result.total = data.total
          //   result.items = data.items.map(item => {
          //     return {
          //       label: item.name,
          //       // value: item.name
          //       value: item.tmInfo.agentId
          //     }
          //   })
          //   return result
          // }
        },
        {
          placeholder: i18n.t('task_Migration_mingCheng'),
          key: 'keyword',
          type: 'input'
        }
      ]
    },
    async updateStatusByIds(ids) {
      let fields = {
        id: true,
        name: true,
        status: true,
        stages: true,
        stats: true,
        setting: true
      }
      let filter = {
        fields,
        where: {
          id: {
            $inq: ids
          }
        }
      }
      let data = await this.$axios.get('tm/api/DataFlows?filter=' + encodeURIComponent(JSON.stringify(filter)))
      let changeList = data?.items || []
      let statusMap = {}
      changeList.forEach(item => {
        let { statusText, statusIcon, status, isFinished } = this.formatData(item)
        statusMap[item.id] = { statusText, statusIcon, status, isFinished }
      })
      let list = this.list || []
      list.forEach(item => {
        let changeParams = statusMap[item.id]
        if (changeParams) {
          Object.assign(item, changeParams)
        }
      })
    },
    search(debounce) {
      const { delayTrigger } = this.$util
      delayTrigger(() => {
        this.$router.replace({
          name: 'Task',
          query: this.searchParams
        })
      }, debounce)
    },
    fetch(pageNum) {
      const { toRegExp } = this.$util
      this.loading = true
      let current = pageNum || this.page.current
      let { keyword, status, syncType, agentId, type } = this.searchParams
      let fields = {
        id: true,
        name: true,
        status: true,
        executeMode: true,
        category: true,
        stopOnError: true,
        last_updated: true,
        createTime: true,
        children: true,
        stats: true,
        checked: true,
        stages: true,
        setting: true,
        user_id: true,
        startTime: true,
        listtags: true,
        mappingTemplate: true,
        platformInfo: true,
        agentId: true,
        nextScheduledTime: true
      }
      let where = {}
      if (type) {
        where['mappingTemplate'] = type
      }
      if (keyword && keyword.trim()) {
        where.$or = [
          { name: { $regex: toRegExp(keyword), $options: 'i' } },
          { 'stages.tableName': { $regex: toRegExp(keyword), $options: 'i' } },
          { 'stages.name': { $regex: toRegExp(keyword), $options: 'i' } }
        ]
      }
      if (agentId) {
        where['agentId'] = agentId
      }
      syncType && (where['setting.sync_type'] = syncType)
      if (status) {
        if (status.includes(',')) {
          where.status = {
            $in: status.split(',')
          }
        } else {
          where.status = status
        }
      }
      let filter = {
        fields,
        where,
        size: this.page.size,
        page: current,
        order: this.order
      }
      this.$axios
        .get('tm/api/DataFlows?filter=' + encodeURIComponent(JSON.stringify(filter)))
        .then(({ total, items }) => {
          this.page.total = total
          let list = items || []
          this.list = list.map(this.formatData)
          if (!list.length && total > 0) {
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
      let tcmInfo = item.tcm || {}
      item.belongAgent = tcmInfo.agentName || tcmInfo.agentId || ''
      item.syncTypeText = this.syncTypeMap[item.setting?.sync_type] || '-'
      item.typeText = this.typeMap[item.mappingTemplate] || '-'
      let statusInfo = TASK_STATUS_MAP[item.status] || {}
      item.statusText = statusInfo.text || ''
      item.statusIcon = statusInfo.icon || ''
      item.startTimeFmt = item.startTime ? dayjs(item.startTime).format('YYYY-MM-DD HH:mm:ss') : '-'
      item.nextScheduledTimeFmt =
        item.setting.isSchedule && item.nextScheduledTime
          ? dayjs(item.nextScheduledTime).format('YYYY-MM-DD HH:mm:ss')
          : '-'
      item.isFinished = isFinished(item) // 全量状态下，任务完成状态时，前端识别为已停止
      return item
    },
    sortChange({ prop, order }) {
      this.order = `${order ? prop : 'createTime'} ${order === 'ascending' ? 'asc' : 'desc'}`
      this.fetch(1)
    },
    details(ids) {
      this.toDetails({
        id: ids[0]
      })
    },
    reset() {
      this.searchParams = {
        status: '',
        syncType: '',
        agentId: '',
        keyword: ''
      }
      this.fetch(1)
    },
    // 重置任务
    resetAll(ids) {
      this.$confirm(this.$t('task_reset_tsk'), this.$t('task_reset'), {
        type: 'warning',
        confirmButtonText: this.$t('button_confirm'),
        cancelButtonText: this.$t('button_cancel'),
        dangerouslyUseHTMLString: true
      }).then(flag => {
        if (!flag) {
          return
        }
        this.$axios
          .post('tm/api/DataFlows/resetAll', {
            id: ids
          })
          .then(data => {
            if (data.success.length > 0) {
              this.$message.success(this.$t('task_reset_success'))
              this.fetch(1)
            } else {
              this.$message.success(this.$t('task_reset_failed'))
            }
          })
          .catch(() => {
            this.$message.success(this.$t('task_reset_failed'))
          })
      })
    },
    createTask() {
      this.createLoading = true
      this.$checkAgentStatus(() => {
        // this.createVisible = true
        this.createMigrate()
      }).finally(() => {
        this.createLoading = false
      })
    },
    closeCreateDialog() {
      this.createVisible = false
    },
    createMigrate() {
      this.closeCreateDialog()
      this.$router.push({
        name: 'DataflowCreate'
      })
    },
    createSync() {
      this.closeCreateDialog()
      this.$router.push({ name: 'DataflowNew' })
    },
    toDetails(row) {
      // 库迁移
      if (row.mappingTemplate === 'cluster-clone') {
        this.$router.push({
          name: 'DataflowDetails',
          params: {
            id: row.id
          }
        })
      }
      // 表同步
      // this.$router.push({
      //   name: 'DataflowDetails',
      //   params: {
      //     id: row.id
      //   }
      // })
    },
    changeStatus(ids, { status, errorEvents, finallyEvents }) {
      let attributes = {
        status,
        id: ids?.[0] || ''
      }
      errorEvents && (attributes.errorEvents = errorEvents)
      this.$axios
        .patch('tm/api/DataFlows?where=', attributes)
        .then(data => {
          this.fetch()
          this.responseHandler(data, this.$t('task_operation_successful'))
        })
        .finally(() => {
          finallyEvents?.()
        })
    },
    responseHandler(data = {}, msg) {
      let failList = data.fail || []
      if (failList.length) {
        let msgMapping = {
          5: this.$t('task_not_exist'),
          6: this.$t('task_not_allow_operation'),
          7: this.$t('task_operation_failed'),
          8: this.$t('task_not_allow_operation')
        }
        let nameMapping = {}
        this.list.forEach(item => {
          nameMapping[item.id] = item.name
        })
        this.$message.warning({
          dangerouslyUseHTMLString: true,
          message: failList
            .map(item => {
              return `<div style="line-height: 24px;"><span style="color: #409EFF">${
                nameMapping[item.id]
              }</span> : <span style="color: #F56C6C">${msgMapping[item.code]}</span></div>`
            })
            .join('')
        })
      } else if (msg) {
        this.$message.success(msg)
      }
    },
    getConfirmMessage(operateStr, name) {
      let map = {
        delete_confirm_title: this.$t('task_delete_confirm_title'),
        delete_confirm_message: this.$t('task_delete_confirm_message'),

        stop_confirm_title: this.$t('task_stop_confirm_title'),
        stop_confirm_message: this.$t('task_stop_confirm_message'),

        force_stop_confirm_title: this.$t('task_force_stop_confirm_title'),
        force_stop_confirm_message: this.$t('task_force_stop_confirm_message'),

        initialize_confirm_title: this.$t('task_initialize_confirm_title'),
        initialize_confirm_message: this.$t('task_initialize_confirm_message')
      }
      let title = operateStr + '_confirm_title',
        message = operateStr + '_confirm_message'
      const h = this.$createElement
      let strArr = map[message].split('xxx')
      let msg = h('p', null, [
        strArr[0],
        h(
          'span',
          {
            class: 'color-primary'
          },
          name
        ),
        strArr[1]
      ])
      return {
        msg,
        title: map[title]
      }
    },
    run(ids, row, resetLoading) {
      const { setting } = row
      if (setting.isSchedule && setting.scheduleTime) {
        this.$confirm(i18n.t('task_Migration_gaiRenWuYiShe'), i18n.t('task_Migration_shiFouQiDongGai'), {
          type: 'warning'
        }).then(resFlag => {
          if (resFlag) {
            this.runTask(ids, row, resetLoading)
          }
        })
      } else {
        this.runTask(ids, row, resetLoading)
      }
    },
    runTask(ids, row, resetLoading) {
      this.$checkAgentStatus(() => {
        this.changeStatus(ids, {
          status: 'scheduled',
          finallyEvents: resetLoading
        })
      }).catch(resetLoading)
    },
    stop(ids, item = {}) {
      let msgObj = this.getConfirmMessage('stop', item.name)
      let message = msgObj.msg
      let title = msgObj.title
      let list = this.list
      for (let i = 0; i < list.length; i++) {
        let node = list[i]
        if (ids.includes(node.id)) {
          if (node.setting && !node.setting.sync_type.includes('cdc')) {
            message = this.$t('task_pause_tip')
            title = this.$t('task_important_reminder')
          }
          if (node.stages && node.stages.find(s => s.type === 'aggregation_processor')) {
            const h = this.$createElement
            let arr = this.$t('task_stop_tip').split('XXX')
            message = h('p', [arr[0] + '(', h('span', { style: { color: '#409EFF' } }, node.name), ')' + arr[1]])
            title = this.$t('task_important_reminder')
          }
        }
      }
      this.$confirm(message, title, {
        type: 'warning',
        confirmButtonText: this.$t('button_confirm'),
        cancelButtonText: this.$t('button_cancel')
      }).then(resFlag => {
        if (resFlag) {
          this.changeStatus(ids, { status: 'stopping' })
        }
      })
    },
    forceStop(ids, item = {}) {
      let msgObj = this.getConfirmMessage('force_stop', item.name)
      this.$confirm(msgObj.msg, msgObj.title, {
        type: 'warning',
        confirmButtonText: this.$t('button_confirm'),
        cancelButtonText: this.$t('button_cancel')
      }).then(resFlag => {
        if (resFlag) {
          this.changeStatus(ids, { status: 'force stopping' })
        }
      })
    },
    copy(ids, node) {
      this.$axios
        .post(`tm/api/DataFlows/${node.id}/copy`)
        .then(() => {
          this.fetch()
          this.$message.success(this.$t('task_copy_success'))
        })
        .catch(() => {
          this.$message.error(this.$t('task_copy_failed'))
        })
    },
    del(ids, item = {}) {
      let where = {
        id: {
          inq: ids
        }
      }
      let msgObj = this.getConfirmMessage('delete', item.name)
      this.$confirm(msgObj.msg, msgObj.title, {
        type: 'warning',
        confirmButtonText: this.$t('button_confirm'),
        cancelButtonText: this.$t('button_cancel')
      }).then(resFlag => {
        if (resFlag) {
          this.$axios
            .post(`tm/api/DataFlows/removeAll?where=` + encodeURIComponent(JSON.stringify(where)))
            .then(data => {
              if (data?.success?.length) {
                this.fetch()
                this.responseHandler(data, this.$t('task_delete_success'))
              } else if (data?.fail) {
                this.$message.error(this.$t('task_delete_failed'))
              }
            })
            .catch(() => {
              this.$message.error(this.$t('task_delete_failed'))
            })
        }
      })
    },
    toEditor(row = {}) {
      let id = row.id
      if (!this.isRunBefore(row)) {
        this.$router.push({
          name: 'DataflowEdit',
          params: {
            id: id
          }
        })
        return
      }
      this.$confirm(
        `<p>${this.$t('task_list_edit_tip')}, ` +
          `${this.$t('task_list_edit_submit')}<span class="font-color-main fw-bolder">${this.$t(
            'task_list_edit_reset'
          )}</span>${this.$t('task_list_edit_tip3')}</p>`,
        this.$t('task_important_reminder'),
        {
          dangerouslyUseHTMLString: true,
          customClass: 'dataflow-clickTip',
          cancelButtonText: this.$t('button_cancel'),
          confirmButtonText: this.$t('task_list_continue_edit'),
          type: 'warning'
        }
      ).then(resFlag => {
        if (resFlag) {
          this.$router.push({
            name: 'DataflowEdit',
            params: {
              id: id
            }
          })
        }
      })
    },
    handleMore(command, node) {
      this[command]([node.id], node)
    },
    toAgent(row) {
      let { belongAgent } = row
      if (!belongAgent) {
        return
      }
      this.$router.replace({
        name: 'Instance',
        query: {
          keyword: belongAgent
        }
      })
    },
    isRunBefore(row) {
      return row.startTime
    },
    toMonitor(row = {}) {
      this.$router.push({
        name: 'Monitor',
        params: {
          id: row.id
        }
      })
    },
    openErrorLog(row) {
      this.errorLogDialogData.dataFlowId = row.id
      this.errorLogDialogData.params = {
        where: {
          'contextMap.dataFlowId': {
            $eq: row.id
          },
          level: {
            $in: ['ERROR']
          },
          createTime: { $gt: { $date: new Date(row.startTime).getTime() } }
        },
        order: `id DESC`
      }
      this.errorLogDialogData.visible = true
    }
  }
}
</script>
