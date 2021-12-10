<template>
  <section class="migration-wrapper main-container" v-loading="loading" v-if="$route.name === 'Task'">
    <div class="main">
      <div class="migration-operation">
        <div class="migration-operation-left">
          <el-form inline @submit.native.prevent>
            <el-form-item :label="$t('task_status') + ' ：'" class="small">
              <el-select v-model="searchParams.status" clearable @input="search()">
                <el-option
                  v-for="(value, label) in statusOptions"
                  :key="value"
                  :label="label"
                  :value="value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('task_sync_type') + ' ：'" class="small">
              <el-select
                v-model="searchParams.syncType"
                clearable
                :placeholder="$t('gl_placeholder_select')"
                @input="search()"
              >
                <el-option v-for="(label, value) in syncTypeMap" :key="value" :label="label" :value="value"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('agent_name') + ' ：'" class="medium">
              <el-select
                v-model="searchParams.agentId"
                clearable
                :placeholder="$t('gl_placeholder_select')"
                @input="search()"
              >
                <el-option
                  v-for="opt in agentOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('task_name_or_node_name_or_library_name') + ' ：'" class="medium">
              <ElInput v-model="searchParams.keyword" :placeholder="$t('gl_placeholder_input')" @input="search(800)">
                <VIcon slot="prefix" size="14" class="ml-1" style="height: 100% !important">search</VIcon>
              </ElInput>
            </el-form-item>
            <el-form-item>
              <ElButton plain class="btn-refresh" @click="fetch()">
                <VIcon>refresh</VIcon>
              </ElButton>
            </el-form-item>
          </el-form>
        </div>
        <div class="migration-operation-right">
          <VButton type="primary" @click="createTask"
            ><span>{{ $t('task_create_task') }}</span></VButton
          >
        </div>
      </div>
      <el-table
        class="migration-table table-border font-color-sub"
        style="margin-top: 10px"
        height="100%"
        :data="list"
        @sort-change="sortChange"
      >
        <el-table-column :label="$t('task_name')" prop="name" min-width="200">
          <template v-slot="scope">
            <ElLink type="primary" @click="toDetails(scope.row)">{{ scope.row.name }}</ElLink>
          </template>
        </el-table-column>
        <el-table-column :label="$t('task_agent')" prop="belongAgent" min-width="200">
          <template slot-scope="scope">
            <el-link v-if="scope.row.belongAgent" type="primary" @click="toAgent(scope.row)">{{
              scope.row.belongAgent
            }}</el-link>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('task_type')" prop="syncTypeText"></el-table-column>
        <el-table-column :label="$t('task_status')">
          <template slot-scope="scope">
            <status-tag
              type="text"
              target="task"
              :status="scope.row.isFinished ? 'finished' : scope.row.status"
              only-img
            ></status-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('task_start_time')" prop="startTime" sortable="custom" width="150">
          <template slot-scope="scope">{{ scope.row.startTimeFmt }}</template>
        </el-table-column>
        <el-table-column :label="$t('task_operate')" width="280">
          <template slot-scope="scope">
            <el-tooltip
              v-if="!['running', 'stopping'].includes(scope.row.status)"
              effect="dark"
              :content="$t('task_config_not_completed')"
              :manual="!(scope.row.status === 'draft' && scope.row.checked === false)"
              placement="top-start"
            >
              <el-link
                type="primary"
                :disabled="
                  !statusBtMap['run'][scope.row.status] || (scope.row.status === 'draft' && scope.row.checked === false)
                "
                @click="run([scope.row.id], scope.row)"
              >
                {{ $t('task_start_task') }}
              </el-link>
            </el-tooltip>
            <el-link
              v-if="scope.row.status === 'running'"
              type="primary"
              :disabled="!statusBtMap['stop'][scope.row.status]"
              @click="stop([scope.row.id])"
            >
              {{ $t('task_stop_task') }}
            </el-link>
            <el-link
              v-if="scope.row.status === 'stopping'"
              type="primary"
              :disabled="!statusBtMap['forceStop'][scope.row.status]"
              @click="forceStop([scope.row.id])"
            >
              {{ $t('task_forced_stop') }}
            </el-link>
            <ElDivider direction="vertical"></ElDivider>
            <el-link
              type="primary"
              @click="handleDetail(scope.row.id, 'detail', scope.row.mappingTemplate, scope.row.hasChildren)"
            >
              {{ $t('task_operation_monitor') }}
            </el-link>
            <ElDivider direction="vertical"></ElDivider>
            <el-link
              type="primary"
              :disabled="!statusBtMap['edit'][scope.row.status]"
              @click="handleDetail(scope.row.id, 'edit', scope.row.mappingTemplate, scope.row.hasChildren)"
            >
              {{ $t('button_edit') }}
            </el-link>
            <ElDivider direction="vertical"></ElDivider>
            <el-dropdown @command="handleMore($event, scope.row, scope.$index)">
              <el-link type="primary" class="rotate-90">
                <i class="el-icon-more"></i>
              </el-link>
              <el-dropdown-menu slot="dropdown" class="text-nowrap">
                <el-dropdown-item command="copy">{{ $t('button_copy') }}</el-dropdown-item>
                <el-dropdown-item command="resetAll" :disabled="!statusBtMap['reset'][scope.row.status]">
                  {{ $t('button_reset') }}
                </el-dropdown-item>
                <el-dropdown-item command="del" :disabled="!statusBtMap['delete'][scope.row.status]">
                  <span :class="{ 'color-danger': statusBtMap['delete'][scope.row.status] }">{{
                    $t('button_delete')
                  }}</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
        <div v-if="!isSearching" class="migration-table__empty" slot="empty">
          <VIcon size="120">no-data-color</VIcon>
          <div class="flex justify-content-center lh-sm fs-7 font-color-sub">
            <span>{{ $t('gl_no_data') }}</span>
            <el-link type="primary" class="fs-7" @click="createTask">{{ $t('task_create_task') }}</el-link>
          </div>
        </div>
        <div v-else class="migration-table__empty" slot="empty">
          <VIcon size="120">search-no-data-color</VIcon>
          <div class="flex justify-content-center lh-sm fs-7 font-color-sub">
            <span>{{ $t('gl_no_match_result') }}</span>
            <el-link type="primary" class="fs-7" @click="reset">{{ $t('gl_back_to_list') }}</el-link>
          </div>
        </div>
      </el-table>
      <el-pagination
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
      </el-pagination>
    </div>
  </section>
  <router-view v-else></router-view>
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
    padding: 20px;
    background: #fff;
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
  .el-divider--vertical {
    margin: 0 16px;
  }
}
</style>
<script>
import { TASK_STATUS_MAP } from '../../const'
import StatusTag from '../../components/StatusTag'
import VIcon from '@/components/VIcon'
let timer = null

export default {
  components: { StatusTag, VIcon },
  data() {
    return {
      loading: true,
      searchParams: {
        status: '',
        syncType: '',
        agentId: '',
        keyword: ''
      },
      syncTypeMap: {
        initial_sync: this.$t('task_initial_sync'),
        cdc: this.$t('task_cdc'),
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
    this.getAgent()
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
    async updateStatusByIds(ids) {
      let fields = {
        id: true,
        name: true,
        status: true
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
      let changeList = data || []
      let statusMap = {}
      changeList.forEach(item => {
        let { statusText, statusIcon, status } = this.formatData(item)
        statusMap[item.id] = { statusText, statusIcon, status }
      })
      let list = this.list || []
      list.forEach(item => {
        let changeParams = statusMap[item.id]
        if (changeParams) {
          Object.assign(item, changeParams)
        }
      })
    },
    async getAgent() {
      let data = await this.$axios.get('api/tcm/agent')
      this.agentOptions = data.items.map(item => {
        return {
          label: item.name,
          value: item.tmInfo.agentId
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
      let { keyword, status, syncType, agentId } = this.searchParams
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
        agentId: true
      }
      let where = {
        mappingTemplate: 'cluster-clone'
      }
      if (keyword && keyword.trim()) {
        where.or = [
          { name: { like: toRegExp(keyword), options: 'i' } },
          { 'stages.tableName': { like: toRegExp(keyword), options: 'i' } },
          { 'stages.name': { like: toRegExp(keyword), options: 'i' } }
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
        limit: this.page.size,
        skip: (current - 1) * this.page.size,
        order: this.order
      }
      Promise.all([
        this.$axios.get('tm/api/DataFlows/count?where=' + encodeURIComponent(JSON.stringify(where))),
        this.$axios.get('tm/api/DataFlows?filter=' + encodeURIComponent(JSON.stringify(filter)))
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
      let tcmInfo = item.tcm || {}
      item.belongAgent = tcmInfo.agentName || tcmInfo.agentId || ''
      item.syncTypeText = this.syncTypeMap[item.setting?.sync_type] || '-'
      let statusInfo = TASK_STATUS_MAP[item.status] || {}
      item.statusText = statusInfo.text || ''
      item.statusIcon = statusInfo.icon || ''
      item.startTimeFmt = item.startTime ? this.$moment(item.startTime).format('YYYY-MM-DD HH:mm:ss') : '-'
      // 全量状态下，任务完成状态时，前端识别为已停止
      if (item.status === 'paused' && item.setting?.sync_type === 'initial_sync') {
        let { stages, stats } = item
        let flag = true
        // 有节点
        if (stats?.stagesMetrics?.length > 0) {
          let stagesMetrics = stats.stagesMetrics || []
          stagesMetrics.forEach(el => {
            let findOne = stages.find(stageItem => stageItem.id === el.stageId)
            // 作为源节点，未全量完成
            if (findOne?.outputLanes?.length > 0 && el.status !== 'initialized') {
              flag = false
            }
          })
        } else {
          // 无节点的任务
          flag = false
        }

        if (flag) {
          // 别为已完成
          item.isFinished = true
        }
      }
      return item
    },
    sortChange({ prop, order }) {
      this.order = `${order ? prop : 'createTime'} ${order === 'ascending' ? 'asc' : 'desc'}`
      this.fetch(1)
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
              this.reset()
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
      this.$checkAgentStatus(() => {
        this.$router.push({
          path: '/task/create'
        })
      })
    },
    changeStatus(ids, { status, errorEvents }) {
      let where = {
        _id: {
          in: ids
        }
      }
      let attributes = {
        status
      }
      errorEvents && (attributes.errorEvents = errorEvents)
      this.$axios
        .post('tm/api/DataFlows/update?where=' + encodeURIComponent(JSON.stringify(where)), attributes)
        .then(data => {
          this.fetch()
          this.responseHandler(data, this.$t('task_operation_successful'))
        })
        .catch(() => {
          this.$message.error(this.$t('task_start_failed'))
        })
    },
    responseHandler(data, msg) {
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
    run(ids) {
      this.$checkAgentStatus(() => {
        this.changeStatus(ids, { status: 'scheduled' })
      })
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
        type: 'warning'
      }).then(resFlag => {
        if (resFlag) {
          this.changeStatus(ids, { status: 'stopping' })
        }
      })
    },
    forceStop(ids, item = {}) {
      let msgObj = this.getConfirmMessage('force_stop', item.name)
      this.$confirm(msgObj.msg, msgObj.title, {
        type: 'warning'
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
        _id: {
          inq: ids
        }
      }
      let msgObj = this.getConfirmMessage('delete', item.name)
      this.$confirm(msgObj.msg, msgObj.title, {
        type: 'warning'
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
    handleDetail(id, type, mappingTemplate, hasChildren) {
      // 子选项 hasChildren 为 true
      if (hasChildren) {
        return
      }
      if (type === 'edit') {
        this.$confirm(
          '<p>编辑任务如果修改了<span style="color:#409EFF">节点排版流程</span>、' +
            '<span style="color:#409EFF">节点属性</span>、' +
            '<span style="color:#409EFF">匹配关系</span>,' +
            '提交后必须<span style="color:#409EFF">重置</span>才能正常运行, 否则可能导致异常错误，请问您要继续编辑吗?</p>',
          '重要提醒',
          {
            dangerouslyUseHTMLString: true,
            customClass: 'dataflow-clickTip',
            confirmButtonText: '继续编辑',
            type: 'warning'
          }
        ).then(resFlag => {
          if (resFlag) {
            this.$router.push({
              path: '/task/' + id
            })
          }
        })
      } else {
        this.$router.push({
          name: 'Monitor',
          params: {
            id: id
          }
        })
      }
      setTimeout(() => {
        document.querySelectorAll('.el-tooltip__popper').forEach(it => {
          it.outerHTML = ''
        })
      }, 200)
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
    toDetails(row) {
      this.$router.push({
        name: 'DataflowDetails',
        params: {
          id: row.id
        }
      })
    }
  }
}
</script>
