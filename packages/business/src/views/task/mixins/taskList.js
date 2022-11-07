import dayjs from 'dayjs'

import { taskApi, workerApi } from '@tap/api'
import { makeStatusAndDisabled, STATUS_MAP } from '../../../shared'
import { FilterBar } from '@tap/component'
import { TablePage, TaskStatus } from '../../../components'
import SkipError from '../SkipError'
import Upload from '../../../components/UploadDialog'
import { toRegExp } from '@tap/shared'

export default {
  inject: ['checkAgent', 'buried'],

  components: { FilterBar, TablePage, SkipError, Upload, TaskStatus },

  data() {
    return {
      STATUS_MAP,
      isDaas: process.env.VUE_APP_PLATFORM === 'DAAS',
      dataFlowId: '',
      isShowDetails: false,
      previewLoading: false,
      previewData: null,
      previewList: [],
      filterItems: [],
      restLoading: false,
      order: 'last_updated DESC',
      multipleSelection: [],
      bulkOperation: this.$has('SYNC_job_export') || this.$has('SYNC_job_operation') || this.$has('SYNC_job_delete'),
      taskType: {
        initial_sync: this.$t('packages_business_task_info_initial_sync'),
        cdc: this.$t('packages_business_task_info_initial_cdc'),
        'initial_sync+cdc':
          this.$t('packages_business_task_info_initial_sync') + '+' + this.$t('packages_business_task_info_initial_cdc')
      },
      typeOptions: [
        { label: this.$t('packages_business_select_option_all'), value: '' },
        {
          label: this.$t('packages_business_dataFlow_initial_sync'),
          value: 'initial_sync'
        },
        {
          label: this.$t('packages_business_dataFlow_cdc'),
          value: 'cdc'
        },
        {
          label: this.$t('packages_business_dataFlow_initial_sync') + this.$t('packages_business_dataFlow_cdc'),
          value: 'initial_sync+cdc'
        }
      ],
      searchParams: {
        keyword: '',
        status: '',
        type: ''
      }
    }
  },

  computed: {
    table() {
      return this.$refs.table
    },

    statusOptions() {
      const options = Object.entries(this.STATUS_MAP).map(([status, item]) => {
        return {
          label: this.$t(item.i18n),
          value: item.in ? item.in.join(',') : status
        }
      })
      options.unshift({ label: this.$t('packages_business_task_list_status_all'), value: '' })
      return options
    },

    colWidth() {
      const { locale } = this.$i18n
      return locale === 'en'
        ? {
            taskType: 140,
            status: 100,
            operation: 300
          }
        : {
            taskType: 80,
            status: 100,
            operation: 260
          }
    }
  },

  watch: {
    '$route.query'() {
      this.searchParams = this.$route.query
      this.table.fetch(1)
    }
  },

  created() {
    //定时轮询
    this.timeout = setInterval(() => {
      this.table.fetch(null, 0, true)
    }, 8000)
    this.getFilterItems()
    this.searchParams = Object.assign(this.searchParams, this.$route.query)
  },

  beforeDestroy() {
    clearInterval(this.timeout)
  },

  methods: {
    getData({ page, tags }) {
      let { current, size } = page
      const { syncType } = this
      let { keyword, status, type } = this.searchParams
      let fields = {
        id: true,
        name: true,
        status: true,
        last_updated: true,
        createTime: true,
        user_id: true,
        startTime: true,
        agentId: true,
        statuses: true,
        type: true,
        desc: true,
        listtags: true,
        syncType: true,
        stoppingTime: true,
        canForceStopping: true,
        currentEventTimestamp: true
      }
      let where = {
        syncType
      }
      if (keyword && keyword.trim()) {
        where.name = { like: toRegExp(keyword), options: 'i' }
      }
      if (tags && tags.length) {
        where['listtags.id'] = {
          in: tags
        }
      }
      type && (where['type'] = type)
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
        order: this.order,
        limit: size,
        fields: fields,
        skip: (current - 1) * size,
        where
      }
      return taskApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(data => {
          let list = (data?.items || []).map(makeStatusAndDisabled)

          // 有选中行，列表刷新后无法更新行数据，比如状态
          if (this.multipleSelection.length && list.length) {
            let tempMap = list.reduce((map, item) => {
              map[item.id] = {
                status: item.status,
                btnDisabled: item.btnDisabled
              }
              return map
            }, {})
            this.multipleSelection.forEach(item => {
              const temp = tempMap[item.id]
              if (temp) {
                Object.assign(item, temp)
              }
            })
          }

          return {
            total: data.total,
            data: list
          }
        })
    },

    formatTime(time) {
      return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
    },

    getFilterItems() {
      this.filterItems = [
        {
          label: this.$t('packages_business_task_list_status'),
          key: 'status',
          type: 'select-inner',
          items: this.statusOptions,
          selectedWidth: '200px'
        },
        {
          label: this.$t('packages_business_task_list_sync_type'),
          key: 'type',
          type: 'select-inner',
          items: this.typeOptions
        },
        {
          placeholder: this.$t('packages_business_task_list_name'),
          key: 'keyword',
          type: 'input'
        }
      ]
    },

    /**
     * 点击名称调整
     * @param row
     */
    handleClickName(row) {
      if (!['edit', 'wait_start'].includes(row.status)) {
        this.toDetail(row)
      } else {
        this.handleEditor(row)
      }
    },

    openRoute(route, newTab = true) {
      if (newTab) {
        window.open(this.$router.resolve(route).href)
      } else {
        this.$router.push(route)
      }
    },

    responseHandler(data, msg) {
      let failList = data?.filter(t => t.code !== 'ok') || []
      if (failList.length) {
        let nameMapping = {}
        this.table.list.forEach(item => {
          nameMapping[item.id] = item.name
        })
        this.$message.warning({
          dangerouslyUseHTMLString: true,
          message: failList
            .map(item => {
              return `<div style="line-height: 24px;"><span class="link-primary">${
                nameMapping[item.id]
              }</span> : <span style="color: #F56C6C">${item.message}</span></div>`
            })
            .join('')
        })
      } else if (msg) {
        this.$message.success(msg, false)
      }
    },

    handleSortTable({ order, prop }) {
      if (prop === 'lag') {
        prop = 'stats.replicationLag'
      }
      this.order = `${order ? prop : 'last_updated'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
      this.table.fetch(1)
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
      taskApi.update(where, attributes).then(data => {
        this.table.fetch()
        this.responseHandler(data, this.$t('packages_business_message_operation_succuess'))
      })
    },

    skipHandler(id, errorEvents) {
      this.changeStatus([id], { status: 'scheduled', errorEvents })
    },

    handleOperationClassify(listtags) {
      let ids = []
      if (this.dataFlowId) {
        ids = [this.dataFlowId]
      } else {
        ids = this.multipleSelection.map(r => r.id)
      }
      let attributes = {
        id: ids,
        listtags
      }
      taskApi.batchUpdateListtags(attributes).then(() => {
        this.dataFlowId = ''
        this.table.fetch()
      })
    },

    handleSelectTag() {
      let tagList = {}
      this.multipleSelection.forEach(row => {
        if (row.listtags && row.listtags.length > 0) {
          tagList[row.listtags[0].id] = {
            value: row.listtags[0].value
          }
        }
      })
      return tagList
    },

    create() {
      this.buried(this.taskBuried.new)
      this.checkAgent(() => {
        this.$router
          .push({
            name: this.route.new
          })
          .catch(() => {
            this.buried(this.taskBuried.newFail)
          })
      })
    },

    handleEditor({ id }) {
      this.openRoute({
        name: this.route.editor,
        params: {
          id
        }
      })
    },

    start(ids) {
      this.buried(this.taskBuried.start)
      taskApi
        .batchStart(ids)
        .then(data => {
          this.buried(this.taskBuried.start, '', { result: true })
          this.table.fetch()
          this.responseHandler(data, this.$t('packages_business_message_operation_succuess'))
        })
        .catch(() => {
          this.buried(this.taskBuried.start, '', { result: false })
        })
    },

    copy(ids, node) {
      taskApi.copy(node.id).then(() => {
        this.table.fetch()
        this.$message.success(this.$t('packages_business_message_copySuccess'))
      })
    },

    initialize(ids, item = {}) {
      let msgObj = this.getConfirmMessage('initialize', ids.length > 1, item.name)
      this.$confirm(msgObj.msg, msgObj.title, {
        type: 'warning'
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        this.restLoading = true
        taskApi
          .batchRenew(ids)
          .then(data => {
            this.table.fetch()
            this.responseHandler(data, this.$t('packages_business_message_operation_succuess'))
          })
          .finally(() => {
            this.restLoading = false
          })
      })
    },

    del(ids, item = {}) {
      let msgObj = this.getConfirmMessage('delete', ids.length > 1, item.name)
      this.$confirm(msgObj.msg, '', {
        type: 'warning'
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        taskApi.batchDelete(ids).then(data => {
          this.table.fetch()
          this.responseHandler(data, this.$t('packages_business_message_deleteOK'))
        })
      })
    },

    async forceStop(ids, item = {}) {
      let data = await workerApi.taskUsedAgent(ids)
      let msgObj = this.getConfirmMessage('force_stop', ids.length > 1, item.name)
      if (data?.status === 'offline' && !this.isDaas) {
        msgObj = this.getConfirmMessage('agent_force_stop', ids.length > 1, item.name)
      }
      this.$confirm(msgObj.msg, '', {
        type: 'warning',
        showClose: false
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        taskApi.forceStop(ids).then(data => {
          this.$message.success(data?.message || this.$t('packages_business_message_operation_succuess'), false)
          this.table.fetch()
        })
      })
    },

    stop(ids, item = {}) {
      let msgObj = this.getConfirmMessage('stop', ids.length > 1, item.name)
      let message = msgObj.msg
      this.$confirm(message, '', {
        type: 'warning',
        showClose: false
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        taskApi.batchStop(ids).then(data => {
          this.table.fetch()
          this.responseHandler(data, this.$t('packages_business_message_operation_succuess'))
        })
      })
    },

    toDetail({ id }) {
      this.openRoute({
        name: this.route.monitor,
        params: {
          id
        }
      })
    },

    export(ids) {
      taskApi.export(ids)
    },

    handleCommand(command, node) {
      let commandFilter = ['start', 'stop', 'del']
      let ids = []
      let taskList = []
      if (node) {
        taskList = [node]
      } else {
        taskList = this.multipleSelection
      }
      let canList = []
      let canNotList = []
      if (commandFilter.includes(command)) {
        let op = command === 'del' ? 'delete' : command
        taskList.forEach(task => {
          if (task.btnDisabled?.[op]) {
            canNotList.push(task)
          } else {
            canList.push(task)
          }
        })
      } else {
        canList = taskList
      }

      if (canNotList.length) {
        const msg = canNotList.length !== taskList.length ? `部分任务不支持该操作` : `所选任务不支持该操作`
        this.$message.warning(msg)
      }

      if (!canList.length) return
      ids = canList.map(item => item.id)
      this[command](ids, node)
    },

    getConfirmMessage(operateStr, isBulk, name) {
      let title = operateStr + '_confirm_title',
        message = operateStr + '_confirm_message'
      if (isBulk) {
        title = 'bulk_' + title
        message = 'bulk_' + message
      }
      const h = this.$createElement
      let strArr = this.$t('packages_business_dataFlow_' + message).split('xxx')
      let msg = h(
        'p',
        {
          style: 'width: calc(100% - 28px);word-break: break-all;'
        },
        [
          strArr[0],
          h(
            'span',
            {
              class: 'color-primary'
            },
            name
          ),
          strArr[1]
        ]
      )
      return {
        msg,
        title: this.$t('packages_business_dataFlow_' + title)
      }
    },

    handleImport() {
      this.$refs.upload.show()
    }
  }
}
