<template>
  <section class="migration-wrapper main-container" v-loading="loading" v-if="$route.name === 'Task'">
    <div class="main">
      <div class="migration-operation">
        <div class="migration-operation-left">
          <ElForm inline @submit.native.prevent>
            <ElFormItem :label="$t('task_status') + ' ：'" class="small">
              <ElSelect v-model="searchParams.status" clearable @input="search()">
                <ElOption v-for="(value, label) in statusOptions" :key="value" :label="label" :value="value"></ElOption>
              </ElSelect>
            </ElFormItem>
            <ElFormItem :label="$t('task_sync_type') + ' ：'" class="small">
              <ElSelect
                v-model="searchParams.syncType"
                clearable
                :placeholder="$t('gl_placeholder_select')"
                @input="search()"
              >
                <ElOption v-for="(label, value) in syncTypeMap" :key="value" :label="label" :value="value"></ElOption>
              </ElSelect>
            </ElFormItem>
            <ElFormItem :label="$t('agent_name') + ' ：'" class="medium">
              <ElSelect
                v-model="searchParams.agentId"
                clearable
                :placeholder="$t('gl_placeholder_select')"
                @input="search()"
              >
                <ElOption v-for="opt in agentOptions" :key="opt.value" :label="opt.label" :value="opt.value"></ElOption>
              </ElSelect>
            </ElFormItem>
            <ElFormItem :label="$t('task_name_or_node_name_or_library_name') + ' ：'" class="medium">
              <ElInput v-model="searchParams.keyword" :placeholder="$t('gl_placeholder_input')" @input="search(800)">
                <VIcon slot="prefix" size="14" class="ml-1" style="height: 100% !important">search</VIcon>
              </ElInput>
            </ElFormItem>
            <ElFormItem>
              <ElButton plain class="btn-refresh" @click="fetch()">
                <VIcon>refresh</VIcon>
              </ElButton>
            </ElFormItem>
          </ElForm>
        </div>
        <div class="migration-operation-right">
          <VButton type="primary" @click="createTask"><span>创建任务</span></VButton>
        </div>
      </div>
      <ElTable
        class="migration-table table-border font-color-sub"
        style="margin-top: 10px"
        height="100%"
        :data="list"
        @sort-change="sortChange"
      >
        <ElTableColumn label="任务名称" prop="name" min-width="200"></ElTableColumn>
        <ElTableColumn label="所属agent" prop="belongAgent" min-width="200">
          <template slot-scope="scope">
            <ElLink v-if="scope.row.belongAgent" type="primary" @click="toAgent(scope.row)">{{
              scope.row.belongAgent
            }}</ElLink>
            <span v-else>-</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="任务类型" prop="syncTypeText"></ElTableColumn>
        <ElTableColumn label="任务状态">
          <template slot-scope="scope">
            <status-tag
              type="text"
              target="task"
              :status="scope.row.isFinished ? 'finished' : scope.row.status"
              only-img
            ></status-tag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="启动时间" prop="startTime" sortable="custom" width="150">
          <template slot-scope="scope">{{ scope.row.startTimeFmt }}</template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="280">
          <template slot-scope="scope">
            <ElTooltip
              v-if="!['running', 'stopping'].includes(scope.row.status)"
              effect="dark"
              content="任务配置未完成，无法启动"
              :manual="!(scope.row.status === 'draft' && scope.row.checked === false)"
              placement="top-start"
            >
              <ElLink
                type="primary"
                :disabled="
                  !statusBtMap['run'][scope.row.status] || (scope.row.status === 'draft' && scope.row.checked === false)
                "
                @click="run([scope.row.id], scope.row)"
              >
                启动任务
              </ElLink>
            </ElTooltip>
            <ElLink
              v-if="scope.row.status === 'running'"
              type="primary"
              :disabled="!statusBtMap['stop'][scope.row.status]"
              @click="stop([scope.row.id])"
            >
              停止任务
            </ElLink>
            <ElLink
              v-if="scope.row.status === 'stopping'"
              type="primary"
              :disabled="!statusBtMap['forceStop'][scope.row.status]"
              @click="forceStop([scope.row.id])"
            >
              强制停止
            </ElLink>
            <ElDivider direction="vertical"></ElDivider>
            <ElLink
              type="primary"
              @click="handleDetail(scope.row.id, 'detail', scope.row.mappingTemplate, scope.row.hasChildren)"
            >
              运行监控
            </ElLink>
            <ElDivider direction="vertical"></ElDivider>
            <ElLink
              type="primary"
              :disabled="!statusBtMap['edit'][scope.row.status]"
              @click="handleDetail(scope.row.id, 'edit', scope.row.mappingTemplate, scope.row.hasChildren)"
            >
              编辑
            </ElLink>
            <ElDivider direction="vertical"></ElDivider>
            <ElDropdown @command="handleMore($event, scope.row, scope.$index)">
              <ElLink type="primary" class="rotate-90">
                <i class="el-icon-more"></i>
              </ElLink>
              <ElDropdownMenu slot="dropdown" class="text-nowrap">
                <ElDropdownItem command="copy">复制</ElDropdownItem>
                <ElDropdownItem command="resetAll" :disabled="!statusBtMap['reset'][scope.row.status]">
                  重置
                </ElDropdownItem>
                <ElDropdownItem command="del" :disabled="!statusBtMap['delete'][scope.row.status]">
                  <span :class="{ 'color-danger': statusBtMap['delete'][scope.row.status] }">删除</span>
                </ElDropdownItem>
              </ElDropdownMenu>
            </ElDropdown>
          </template>
        </ElTableColumn>
        <div v-if="!isSearching" class="migration-table__empty" slot="empty">
          <VIcon size="120">no-data-color</VIcon>
          <div class="flex justify-content-center lh-sm fs-7 font-color-sub">
            <span>{{ $t('gl_no_data') }}</span>
            <ElLink type="primary" class="fs-7" @click="createTask">创建任务</ElLink>
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
      <ElDialog title="选择任务类型" :visible.sync="createVisible" width="416px" top="30vh">
        <div class="select-type flex justify-content-between">
          <div
            class="select-type__item"
            @click="
              $router.push({
                name: 'DataflowCreate'
              })
            "
          >
            <div>
              <div>数据库迁移</div>
              <div class="mt-4">数据库迁移</div>
            </div>
            <VIcon size="30" class="v-icon">right-fill</VIcon>
          </div>
          <div class="select-type__item data-table ml-10" @click="$router.push({ name: 'DataflowNew' })">
            <div>
              <div>数据表同步</div>
              <div class="mt-4 font-color-sub">数据表同步</div>
            </div>
            <VIcon size="30" class="v-icon">right-fill</VIcon>
          </div>
        </div>
      </ElDialog>
    </div>
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
        initial_sync: '全量',
        cdc: '增量',
        'initial_sync+cdc': '全量+增量'
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
      createVisible: false
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
      this.$confirm('是否重置该任务？', '重置', {
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
              this.$message.success('重置成功')
              this.reset()
            } else {
              this.$message.success('重置失败')
            }
          })
          .catch(() => {
            this.$message.success('重置失败')
          })
      })
    },
    createTask() {
      this.$checkAgentStatus(() => {
        this.createVisible = true
      })
    },
    toDetails(row) {
      this.$router.push({
        name: 'DataflowDetails',
        params: {
          id: row.id
        }
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
          this.responseHandler(data, '操作成功')
        })
        .catch(() => {
          this.$message.error('任务启动失败，请编辑任务完成映射配置')
        })
    },
    responseHandler(data, msg) {
      let failList = data.fail || []
      if (failList.length) {
        let msgMapping = {
          5: '此任务不存在',
          6: '任务状态不允许这种操作',
          7: '操作失败，请重试',
          8: '任务状态不允许这种操作'
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
        delete_confirm_title: '是否删除该任务？',
        delete_confirm_message: '删除任务 xxx 后，此任务将无法恢复',

        stop_confirm_title: '是否暂停该任务？',
        stop_confirm_message: '暂停任务 xxx 后，任务中未完成全量同步的表再次启动时，会重新执行全量同步',

        force_stop_confirm_title: '是否强制停止该任务？',
        force_stop_confirm_message: '强制停止任务 xxx 将立即中断数据传输强制任务快速停止，并重置该任务',

        initialize_confirm_title: '是否重置该任务？',
        initialize_confirm_message: '重置任务 xxx 将清除任务同步进度，任务将重新执行'
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
            message = '初始化类型的任务暂停后如果再次启动，任务会从头开始同步，确定暂停?'
            title = '重要提醒'
          }
          if (node.stages && node.stages.find(s => s.type === 'aggregation_processor')) {
            const h = this.$createElement
            let arr = '任务XXX中含有聚合处理节点，任务停止后再次启动，任务会先进行重置，确定停止？'.split('XXX')
            message = h('p', [arr[0] + '(', h('span', { style: { color: '#409EFF' } }, node.name), ')' + arr[1]])
            title = '重要提醒'
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
          this.$message.success('复制成功')
        })
        .catch(() => {
          this.$message.error('复制失败')
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
                this.responseHandler(data, '删除成功')
              } else if (data?.fail) {
                this.$message.error('删除失败')
              }
            })
            .catch(() => {
              this.$message.error('删除失败')
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
    }
  }
}
</script>
