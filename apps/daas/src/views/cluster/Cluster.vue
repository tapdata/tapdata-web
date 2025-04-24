<script>
import {
  agentGroupApi,
  clusterApi,
  metadataDefinitionsApi,
  proxyApi,
  userGroupsApi,
  workerApi,
} from '@tap/api'
import { makeDragNodeImage } from '@tap/business'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import { FilterBar, IconButton, ProTable, VEmpty } from '@tap/component'
import { downloadBlob, downloadJson, openUrl } from '@tap/shared'
import Cookie from '@tap/shared/src/cookie'
import { h } from 'vue'
import SetTag from '@/views/cluster/SetTag.vue'
import AddServe from './AddServe'
import { STATUS_MAP } from './const'

export default {
  components: {
    SetTag,
    AddServe,
    FilterBar,
    IconButton,
    VEmpty,
    ProTable,
    PageContainer,
  },
  data() {
    return {
      hideDownload: import.meta.env.VUE_APP_HIDE_CLUSTER_DOWNLOAD,
      waterfallData: [],
      currentData: null,
      dialogForm: false,
      activeIndex: '1',
      serveStatus: '',
      isStop: false,
      engineState: '',
      managementState: '',
      apiServerState: '',
      editItem: {},
      timer: null,
      downLoadAgetntdialog: false,
      editAgentDialog: false,
      deleteDialogVisible: false,
      downLoadNum: 0,
      version: null,
      ips: [],
      custIP: '',
      custId: '',
      agentName: '',
      currentNde: {},
      delData: '',
      processIdData: [],
      searchParams: {
        keyword: '',
      },
      accessToken: '',
      filterItems: [
        {
          placeholder: this.$t('daas_cluser_keyword_placeholder'),
          key: 'keyword',
          type: 'input',
        },
      ],
      bindWorkerMap: {},
      viewType: 'cluster',
      netStatDialog: {
        visible: false,
      },
      apiServerData: [],
      engineData: [],
      filterEngineData: [],
      managementData: [],
      tagData: [],
      tagDialog: {
        visible: false,
        saving: false,
        value: '',
        id: '',
        rules: {
          value: {
            required: true,
            message: this.$t('packages_component_classification_nodeName'),
          },
        },
      },
      setTagDialog: {
        visible: false,
        tagList: [],
        selection: [],
      },
      treeProps: {
        label: 'name',
      },
      agentId2Tag: {},
      tagMap: {},
      multipleSelection: [],
      tagSearch: '',
      showSearch: false,
      dragState: {
        isDragging: false,
        draggingObjects: [],
        dropNode: null,
        allowDrop: true,
      },
      draggingNodeImage: null,
      loading: false,
    }
  },
  computed: {
    // tagMap() {
    //   const map = this.tagData.reduce((acc, tag) => ((acc[tag.groupId] = tag.name), acc), {})
    //   console.log('map', map)
    //   return map
    // }
  },
  watch: {
    '$route.query': function () {
      this.searchParams = this.$route.query
      this.getDataApi()
    },
    tagSearch(val) {
      this.$refs.tree.filter(val)
    },
  },
  created() {
    this.init()
    this.accessToken = Cookie.get('access_token')
  },
  unmounted() {
    clearInterval(this.timer)
    this.timer = null
  },
  methods: {
    async init() {
      this.getAllBindWorker()
      await this.getDataApi(true)
      await this.loadTags()
      this.handleFilterAgent()
    },
    // 提交
    async submitForm() {
      const getFrom = this.$refs.childRules.ruleForm
      const status = this.$refs.childRules.data.status
      const flag = this.$refs.childRules.validateForm()
      if (status === 'running') {
        if (flag) {
          const data = {
            uuid: this.currentData.uuid,
            name: getFrom.name,
            command: getFrom.command,
            arguments: getFrom.arguments ? getFrom.arguments : '',
          }
          if (getFrom.id === '') {
            await clusterApi
              .addMonitor(data)
              .then(() => {
                this.dialogForm = false
                this.getDataApi()
                this.$message.success(this.$t('public_message_save_ok'))
              })
              .finally(() => {
                this.dialogForm = false
              })
          } else {
            data.id = getFrom.id
            await clusterApi
              .editMonitor(data)
              .then(() => {
                this.dialogForm = false
                this.getDataApi()
                this.$message.success(this.$t('public_message_save_ok'))
              })
              // .catch(() => {
              // })
              .finally(() => {
                this.dialogForm = false
              })
          }
        }
      } else {
        this.$message.error(this.$t('cluster_startup_after_add'))
      }
    },
    editServe(item, status, data) {
      this.currentData = data
      this.editItem = item
      this.dialogForm = true
    },
    // 删除
    delServe(data, status) {
      const params = {
        uuid: data.uuid,
        id: data.id,
      }

      if (status === 'running') {
        this.$confirm(`${this.$t('public_message_delete_confirm')}?`, {
          type: 'warning',
        }).then((resFlag) => {
          if (!resFlag) {
            return
          }
          clusterApi.removeMonitor(params).then(() => {
            this.getDataApi()
            this.$message.success(this.$t('public_message_save_ok'))
          })
          // .catch(() => {
          // })
        })
      } else {
        this.$message.error(this.$t('cluster_startup_after_delete'))
      }
    },
    addServeFn(item) {
      this.currentData = item
      this.editItem = {}
      this.dialogForm = true
    },
    //下载
    downServeFn(item) {
      proxyApi.supervisor(item.systemInfo?.process_id).then((data) => {
        downloadJson(
          JSON.stringify(data),
          `${item.systemInfo?.process_id}_supervisor_summary`,
        )
      })
    },
    //下载
    downConnectorsFn(item) {
      proxyApi.connectors(item.systemInfo?.process_id).then((data) => {
        downloadJson(
          JSON.stringify(data),
          `${item.systemInfo?.process_id}_connectors_memory`,
        )
      })
    },
    // 启动
    startFn(item, status, server) {
      if (status === 'stopped') {
        const data = {
          uuid: item.uuid,
          server,
          operation: 'start',
        }
        this.$confirm(
          `${this.$t('cluster_confirm_text')}${this.$t('cluster_start_server')}?`,
          {
            type: 'warning',
            closeOnClickModal: false,
          },
        ).then((resFlag) => {
          if (!resFlag) {
            return
          }
          this.operationFn(data)
        })
      }
    },
    // 关闭
    closeFn(item, status, server) {
      let name
      if (server === 'apiServer') {
        name = 'API SEVER'
      } else if (server === 'engine') {
        name = this.$t('cluster_sync_gover')
      } else {
        name = this.$t('cluster_manage_sys')
      }
      if (status === 'running') {
        const data = {
          uuid: item.uuid,
          server,
          operation: 'stop',
        }
        this.$confirm(
          `${this.$t('cluster_confirm_text') + this.$t('cluster_closeSever')}?`,
          {
            type: 'warning',
            closeOnClickModal: false,
          },
        ).then((resFlag) => {
          if (!resFlag) {
            return
          }
          this.operationFn(data)
        })
      }
    },
    restartFn(item, status, server) {
      if (status === 'running') {
        const data = {
          uuid: item.uuid,
          server,
          operation: 'restart',
        }
        this.$confirm(
          `${this.$t('cluster_confirm_text') + this.$t('cluster_restart_server')}?`,
          {
            type: 'warning',
            closeOnClickModal: false,
          },
        ).then((resFlag) => {
          if (!resFlag) {
            return
          }
          this.operationFn(data)
        })
      }
    },
    // 解绑
    unbind(item, status, server) {
      if (status === 'stopped') {
        this.$confirm(
          `${this.$t('cluster_confirm_text') + this.$t('cluster_unbind_server')}?`,
          {
            type: 'warning',
            closeOnClickModal: false,
          },
        ).then((resFlag) => {
          if (!resFlag) {
            return
          }
          const { process_id } = item.systemInfo || {}
          workerApi.unbindByProcessId(process_id).then((data) => {
            this.init()
            data
              ? this.$message.success(
                  this.$t('public_message_operation_success'),
                )
              : this.$message.error(this.$t('public_message_operation_error'))
          })
        })
      }
    },
    updateFn(item) {
      const data = {
        uuid: item.uuid,
        server: 'agent',
        operation: `update:${this.toVersion}`,
      }
      this.operationFn(data)
      this.canUpdate = false
    },
    async getVersion(datas) {
      const [...waterfallData] = datas
      const [...newWaterfallData] = [[], []]
      waterfallData.forEach((item, index) => {
        if (index % 2) {
          newWaterfallData[1].push(item)
        } else {
          newWaterfallData[0].push(item)
        }
      })
      this.waterfallData = newWaterfallData
    },
    // 重启---关闭---启动     --版本--更新
    async operationFn(data) {
      await clusterApi.updateStatus(data).then(() => {
        this.getDataApi()
      })
    },
    // 获取最大cpu、内存使用率
    getUsageRate(processId) {
      const where = {
        process_id: {
          inq: processId,
        },
        worker_type: 'connector',
      }
      return workerApi.get({ filter: JSON.stringify({ where }) })
    },
    //获取所有 worker
    async getAllBindWorker() {
      try {
        const data = await workerApi.queryAllBindWorker()
        this.bindWorkerMap = data.reduce((pre, current) => {
          return { ...pre, [current.processId]: current }
        }, {})
      } catch {}
    },
    // 获取数据
    async getDataApi(noFilter) {
      const params = { index: 1 }
      if (this.searchParams.keyword) {
        params.filter = JSON.stringify({
          where: {
            or: [
              {
                agentName: {
                  like: this.searchParams.keyword,
                },
              },
              {
                'systemInfo.hostname': {
                  like: this.searchParams.keyword,
                },
              },
            ],
          },
        })
      }
      this.loading = true
      let clusterData = await clusterApi.get(params)
      clusterData = clusterData?.items || []
      const processId = clusterData.map((it) => it?.systemInfo?.process_id)
      let workerData = await this.getUsageRate(processId)

      this.loading = false

      //处理worker 数据
      workerData = workerData?.items || []
      const metricValuesData = {}
      if (workerData?.length) {
        workerData.forEach((item) => {
          if (item.metricValues) {
            item.metricValues.CpuUsage = `${(item.metricValues.CpuUsage * 100).toFixed(2)}%`
            item.metricValues.HeapMemoryUsage = `${(item.metricValues.HeapMemoryUsage * 100).toFixed(2)}%`
          }
          metricValuesData[item.process_id] = item.metricValues
        })
      }
      const apiServerData = []
      const engineData = []
      const managementData = []
      //匹配CPU使用率
      for (const item of clusterData) {
        const isStopped = item.status !== 'running'
        const { management, engine, apiServer } = item

        const info = {
          hostname: item.agentName || item.systemInfo.hostname,
          ip: item.custIP || item.systemInfo.ip,
          uuid: item.uuid,
        }

        engine &&
          engineData.push(
            Object.assign(engine, info, {
              process_id: item.systemInfo.process_id,
            }),
          )
        apiServer && apiServerData.push(Object.assign(apiServer, info))
        management && managementData.push(Object.assign(management, info))

        // 停止了上报状态后，因为不再上报状态了，所以各个服务的状态就不再更新了。
        if (isStopped) {
          if (management) {
            management.status = 'stopped'
            management.serviceStatus = 'stopped'
          }
          if (engine) {
            engine.status = 'stopped'
            engine.serviceStatus = 'stopped'
            engine.netStat = []
            engine.netStatTotals = 0
          }
          if (apiServer) {
            apiServer.status = 'stopped'
            apiServer.serviceStatus = 'stopped'
          }
        }

        item.canUpdate = false //allCdc && datas[i].curVersion == this.toVersion && datas[i].status != 'down';
        item.metricValues = metricValuesData[item.systemInfo?.process_id]
          ? metricValuesData[item.systemInfo?.process_id]
          : { CpuUsage: '-', HeapMemoryUsage: '-' }
        if (item?.engine?.status !== 'running') {
          item.metricValues = {
            CpuUsage: '-',
            HeapMemoryUsage: '-',
          }
        }
        if (item?.engine?.netStat) {
          item.engine.netStatTotals = item.engine.netStat.reduce(
            (total, key) => {
              return total + (key?.numbers || 0)
            },
            0,
          )
        }
      }
      this.waterfallData = clusterData

      this.apiServerData = apiServerData
      this.engineData = engineData
      // this.filterEngineData = engineData
      this.managementData = managementData

      if (!noFilter) {
        this.mapAgentData()
        this.handleFilterAgent()
      }
    },
    // 关闭弹窗并且清空验证
    closeDialogForm() {
      this.dialogForm = false
      this.$refs.childRules.closeDialogForm()
    },
    //删除agent
    delConfirm(item) {
      // this.deleteDialogVisible = true
      // this.delData = data
      // this.delData.agentName = this.delData.agentName || this.delData.systemInfo.hostname
      const agentName = item.agentName || item.systemInfo.hostname
      const message = h('p', [
        `${this.$t('public_message_delete_confirm')} ${agentName}`,
      ])
      this.$confirm(message, {
        type: 'warning',
      }).then((resFlag) => {
        if (!resFlag) {
          return
        }
        clusterApi.delete(item.id, item.name).then(() => {
          this.$message.success(this.$t('public_message_delete_ok'))
          this.getDataApi()
        })
        // .catch(() => {
        // })
      })
    },
    removeNode(id) {
      clusterApi.delete(id).then(() => {
        this.deleteDialogVisible = false
        this.$message.success(this.$t('public_message_delete_ok'))
      })
      // .catch(() => {
      // })
    },
    //编辑
    editAgent(item) {
      this.editAgentDialog = true
      this.custId = item.id
      this.custIP = item.systemInfo.ip
      this.ips = item.systemInfo.ips || []
      this.agentName = item.agentName || item.systemInfo.hostname
      this.currentNde = item.systemInfo

      this.editAgentItem = item
    },
    //提交编辑
    submitEditAgent() {
      if (this.agentName === '') {
        this.agentName = this.currentNde.hostname
        this.$message.error(
          this.$t('cluster_server_name') + this.$t('public_form_not_empty'),
        )
        return
      }
      const data = {
        custIP: this.custIP,
        agentName: this.agentName,
      }
      clusterApi.editAgent(this.custId, data).then(() => {
        this.editAgentDialog = false
        this.$message.success(this.$t('public_message_save_ok'))

        this.$set(this.editAgentItem, 'agentName', this.agentName)
      })
      // .catch(() => {
      // })
    },
    editNameRest() {
      this.agentName = this.currentNde.hostname
    },
    //运行日志
    goDailyRecord() {
      this.$router.push({
        name: 'dailyRecord',
      })
    },
    getStatus(type) {
      return STATUS_MAP[type] || '-'
    },

    openNetStatDialog(row) {
      this.netStatDialog.visible = true
      this.netStatDialog.data = row.engine.netStat || []
    },

    handleAddTag() {
      this.tagDialog.visible = true
      this.tagDialog.title = this.$t('dataFlow_addTag')
      this.$refs.tagForm?.clearValidate()
    },

    editTag(tag) {
      this.tagDialog.visible = true
      this.tagDialog.title = this.$t('dataFlow_editTag')
      this.tagDialog.value = tag.name
      this.tagDialog.id = tag.groupId
    },

    async loadTags() {
      const { items } = await agentGroupApi.get({
        containWorker: false,
      })
      this.tagMap = {}
      this.agentId2Tag = items.reduce((map, item) => {
        item.agentIds?.reduce((acc, id) => {
          let arr = acc[id]
          if (!arr) {
            arr = acc[id] = []
          }
          arr.push(item.groupId)
          return acc
        }, map)

        this.tagMap[item.groupId] = item.name

        return map
      }, {})
      this.tagData = items
      this.mapAgentData()
    },

    mapAgentData() {
      this.engineData.map((item) => {
        const tagIds = this.agentId2Tag[item.process_id]
        item.tags = tagIds?.length
          ? tagIds.map((id) => {
              return {
                id,
                name: this.tagMap[id],
              }
            })
          : []
      })
    },

    saveTag() {
      this.$refs.tagForm.validate((valid) => {
        if (valid) {
          this.tagDialog.saving = true
          const fetch = this.tagDialog.id
            ? agentGroupApi.update({
                name: this.tagDialog.value,
                groupId: this.tagDialog.id,
              })
            : agentGroupApi.save({
                name: this.tagDialog.value,
              })
          fetch
            .then(() => {
              this.$message.success(this.$t('public_message_save_ok'))
              this.hideTagDialog()
              this.loadTags()
            })
            .finally(() => (this.tagDialog.saving = false))
        }
      })
    },

    hideTagDialog() {
      this.tagDialog.visible = false
      this.tagDialog.value = ''
      this.tagDialog.id = ''
      this.$nextTick(() => {
        this.$refs.tagForm.clearValidate()
      })
    },

    handleCheckChange(data, node) {
      const checked = node.checked
      this.$refs.tree.setCheckedKeys([])
      node.checked = !checked
      this.handleFilterAgent()
      this.$refs.engineTable.clearSelection()
    },

    handleCheck() {
      this.handleFilterAgent()
    },

    handleCommand(command, node) {
      switch (command) {
        case 'edit':
          this.editTag(node.data)
          break
        case 'delete':
          this.deleteNode(node.key)
      }
    },

    deleteNode(id) {
      this.$confirm('', {
        title: this.$t('packages_business_application_delete_shifouquerenshan'),
        confirmButtonText: this.$t('public_button_delete'),
        cancelButtonText: this.$t('packages_component_message_cancel'),
        type: 'warning',
        closeOnClickModal: false,
      }).then((resFlag) => {
        if (!resFlag) {
          return
        }
        agentGroupApi.delete(id).then(() => {
          this.loadTags()
        })
      })
    },

    openSetTagDialog() {
      this.setTagDialog.visible = true
      const selection = []
      let list = this.multipleSelection.reduce((acc, item) => {
        selection.push(item.process_id)
        const list = this.agentId2Tag[item.process_id]
        if (list?.length) {
          acc.push(...list)
        }

        return acc
      }, [])

      list = [...new Set(list)] /*.map(id => {
        return {
          id,
          name: this.tagMap[id]
        }
      })*/

      this.setTagDialog.tagList = list
      this.setTagDialog.selection = selection
    },

    handleSelectionChange(val) {
      this.multipleSelection = val
    },

    handleSearch() {
      this.showSearch = !this.showSearch
      this.tagSearch = ''
    },

    handleFilterTag(value, data) {
      if (!value) return true
      return data.name.toLowerCase().includes(value.toLowerCase())
    },

    async onSavedTag() {
      await this.loadTags()
      this.handleFilterAgent()
    },

    handleFilterAgent() {
      const keys = this.$refs.tree?.getCheckedKeys()
      if (keys?.length) {
        this.filterEngineData = this.engineData.filter((item) => {
          return this.agentId2Tag[item.process_id]?.some((id) =>
            keys.includes(id),
          )
        })
      } else {
        this.filterEngineData = this.engineData
      }
    },

    handleDragStart(row, column, ev) {
      this.dragState.isDragging = true
      const selection = this.multipleSelection

      if (selection.find((it) => it.id === row.id)) {
        this.dragState.draggingObjects = selection
      } else {
        this.dragState.draggingObjects = [row]
      }

      this.draggingNodeImage = makeDragNodeImage(
        ev.currentTarget.querySelector('.tree-item-icon'),
        row.hostname,
        this.dragState.draggingObjects.length,
      )
      ev.dataTransfer.setDragImage(this.draggingNodeImage, 0, 0)
    },

    handleDragEnd() {
      this.dragState.isDragging = false
      this.dragState.draggingObjects = []
      this.dragState.dropNode = null
      this.draggingNodeImage.remove()
      this.draggingNodeImage = null
    },

    findParentNodeByClassName(el, cls) {
      let parent = el.parentNode
      while (parent && !parent.classList.contains(cls)) {
        parent = parent.parentNode
      }
      return parent
    },

    handleTreeDragEnter(ev, data) {
      ev.preventDefault()

      if (data.readOnly || !this.dragState.isDragging) return

      const dropNode = this.findParentNodeByClassName(
        ev.currentTarget,
        'el-tree-node',
      )
      dropNode.classList.add('is-drop-inner')
    },

    handleTreeDragOver(ev) {
      ev.preventDefault()
    },

    handleTreeDragLeave(ev, data) {
      ev.preventDefault()

      if (data.readOnly) return

      if (!ev.currentTarget.contains(ev.relatedTarget)) {
        const dropNode = this.findParentNodeByClassName(
          ev.currentTarget,
          'el-tree-node',
        )
        dropNode.classList.remove('is-drop-inner')
      }
    },

    async handleTreeDrop(ev, data) {
      const { draggingObjects } = this.dragState
      const dropNode = this.findParentNodeByClassName(
        ev.currentTarget,
        'el-tree-node',
      )

      if (!draggingObjects?.length || !dropNode) return
      dropNode.classList.remove('is-drop-inner')

      const list = []
      for (const row of draggingObjects) {
        if (!data.agentIds?.includes(row.process_id)) {
          list.push(
            agentGroupApi.addAgent({
              groupId: data.groupId,
              agentId: row.process_id,
            }),
          )
        }
      }

      if (list.length) {
        await Promise.all(list)
        this.$message.success(this.$t('public_message_operation_success'))
        await this.onSavedTag()
      } else {
        this.$message.info(this.$t('packages_component_data_already_exists'))
      }
    },
  },
}
</script>

<template>
  <PageContainer mode="auto">
    <template #actions>
      <el-radio-group v-model="viewType" class="view-radio-group">
        <el-radio-button label="cluster">{{
          $t('daas_cluster_cluster_view')
        }}</el-radio-button>
        <el-radio-button label="component">{{
          $t('daas_cluster_component_view')
        }}</el-radio-button>
      </el-radio-group>
    </template>

    <section class="clusterManagement-container isCardBox overflow-auto">
      <div class="section-wrap-box">
        <div class="search-bar mb-4">
          <FilterBar
            v-model:value="searchParams"
            :items="filterItems"
            @fetch="getDataApi()"
          />
        </div>
        <div v-loading="loading" class="main">
          <template v-if="waterfallData.length">
            <section v-if="viewType === 'component'">
              <div class="border rounded-lg mb-4">
                <div class="flex align-center justify-content-between p-4 py-3">
                  <span class="section-title font-color-dark fs-6 fw-sub">{{
                    $t('cluster_sync_gover')
                  }}</span>
                  <ElButton
                    :disabled="!multipleSelection.length"
                    type="primary"
                    @click="openSetTagDialog"
                    >{{ $t('dataExplorer_tag_title') }}</ElButton
                  >
                </div>
                <div class="flex border-top">
                  <div class="tag-tree-wrapper border-end p-3 pt-0">
                    <div class="flex align-center mb-2 h-40 gap-0">
                      <span class="font-color-dark fw-sub flex-1">{{
                        $t('public_tags')
                      }}</span>
                      <IconButton @click="handleSearch">magnify</IconButton>
                      <IconButton @click="handleAddTag">add</IconButton>
                    </div>
                    <ElInput
                      v-if="showSearch"
                      v-model="tagSearch"
                      class="search mb-2"
                      clearable
                    >
                      <template #prefix>
                        <VIcon size="14" class="h-100">magnify</VIcon>
                      </template>
                    </ElInput>
                    <ElTree
                      ref="tree"
                      check-strictly
                      show-checkbox
                      node-key="groupId"
                      :props="treeProps"
                      :data="tagData"
                      icon-class="p-0 pl-2"
                      :filter-node-method="handleFilterTag"
                      class="engine-tag-tree has-dropdown"
                      @node-click="handleCheckChange"
                      @check="handleCheck"
                    >
                      <template #default="{ node, data }">
                        <div
                          class="flex align-center flex-1"
                          @dragenter.stop="
                            handleTreeDragEnter($event, data, node)
                          "
                          @dragover.stop="
                            handleTreeDragOver($event, data, node)
                          "
                          @dragleave.stop="
                            handleTreeDragLeave($event, data, node)
                          "
                          @drop.stop="handleTreeDrop($event, data, node)"
                        >
                          <VIcon size="12" class="color-primary mr-1"
                            >folder-fill</VIcon
                          >
                          <span class="flex-1 text-ellipsis">{{
                            data.name
                          }}</span>
                          <ElDropdown
                            class="tree-node-dropdown"
                            @command="handleCommand($event, node)"
                          >
                            <IconButton sm @click.stop>more</IconButton>
                            <template #dropdown>
                              <ElDropdownMenu>
                                <ElDropdownItem command="edit">{{
                                  $t('public_button_edit')
                                }}</ElDropdownItem>
                                <ElDropdownItem command="delete">{{
                                  $t('public_button_delete')
                                }}</ElDropdownItem>
                              </ElDropdownMenu>
                            </template>
                          </ElDropdown>
                        </div>
                      </template>
                    </ElTree>
                  </div>
                  <ProTable
                    ref="engineTable"
                    :data="filterEngineData"
                    row-class-name="grabbable"
                    row-key="process_id"
                    draggable
                    @selection-change="handleSelectionChange"
                    @row-dragstart="handleDragStart"
                    @row-dragend="handleDragEnd"
                  >
                    <ElTableColumn
                      type="selection"
                      width="45"
                      :reserve-selection="true"
                    />
                    <ElTableColumn
                      :label="$t('daas_cluster_engine_hostname')"
                      prop="name"
                    >
                      <template #default="{ row }">
                        <div>
                          {{ row.hostname
                          }}<span class="ip ml-1">{{ row.ip }}</span>
                        </div>
                        <span
                          v-if="row.tags"
                          class="justify-content-start ellipsis block"
                        >
                          <span
                            v-for="item in row.tags"
                            :key="item.id"
                            class="tag inline-block"
                            >{{ item.name }}</span
                          >
                        </span>
                      </template>
                    </ElTableColumn>
                    <ElTableColumn
                      :label="$t('daas_cluster_connection_count')"
                      prop="netStatTotals"
                    />
                    <ElTableColumn :label="$t('public_status')" prop="status">
                      <template #default="{ row }">
                        <span :class="[`status-${row.status}`, 'status']">{{
                          getStatus(row.status)
                        }}</span>
                      </template>
                    </ElTableColumn>
                    <ElTableColumn
                      :label="$t('cluster_service_status')"
                      prop="netStatTotals"
                    >
                      <template #default="{ row }">
                        <span
                          :class="[`status-${row.serviceStatus}`, 'status']"
                          >{{ getStatus(row.serviceStatus) }}</span
                        >
                      </template>
                    </ElTableColumn>
                    <ElTableColumn
                      :label="$t('public_operation')"
                      prop="netStatTotals"
                    >
                      <template #default="{ row }">
                        <div v-readonlybtn="'Cluster_operation'" class="btn">
                          <ElButton
                            text
                            type="primary"
                            :disabled="row.status == 'stopped' ? false : true"
                            @click="startFn(row, row.status, 'engine')"
                            >{{ $t('public_button_start') }}
                          </ElButton>
                          <ElDivider class="mx-1" direction="vertical" />
                          <ElButton
                            text
                            type="primary"
                            :disabled="row.status == 'running' ? false : true"
                            @click="closeFn(row, row.status, 'engine')"
                            >{{ $t('public_button_close') }}
                          </ElButton>
                          <ElDivider class="mx-1" direction="vertical" />
                          <ElButton
                            text
                            type="primary"
                            :disabled="row.status == 'running' ? false : true"
                            @click="restartFn(row, row.status, 'engine')"
                            >{{ $t('public_button_restart') }}
                          </ElButton>
                          <ElDivider
                            v-if="bindWorkerMap[row.process_id]"
                            class="mx-1"
                            direction="vertical"
                          />
                          <ElButton
                            v-if="bindWorkerMap[row.process_id]"
                            text
                            type="primary"
                            :disabled="row.status == 'stopped' ? false : true"
                            @click="unbind(row, row.status, 'engine')"
                            >{{ $t('daas_unbind_license') }}
                          </ElButton>
                        </div>
                      </template>
                    </ElTableColumn>
                  </ProTable>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="flex-1 border rounded-lg p-4">
                  <div class="flex align-center justify-content-between mb-3">
                    <span class="section-title font-color-dark fs-6 fw-sub">{{
                      $t('cluster_manage_sys')
                    }}</span>
                  </div>
                  <ElTable :data="managementData">
                    <ElTableColumn
                      :label="$t('daas_cluster_engine_hostname')"
                      prop="name"
                    >
                      <template #default="{ row }">
                        <div>{{ row.hostname }}</div>
                        <span class="ip">{{ row.ip }}</span>
                      </template>
                    </ElTableColumn>
                    <ElTableColumn :label="$t('public_status')" prop="status">
                      <template #default="{ row }">
                        <span :class="[`status-${row.status}`, 'status']">{{
                          getStatus(row.status)
                        }}</span>
                      </template>
                    </ElTableColumn>
                    <ElTableColumn
                      :label="$t('cluster_service_status')"
                      prop="netStatTotals"
                    >
                      <template #default="{ row }">
                        <span
                          :class="[`status-${row.serviceStatus}`, 'status']"
                          >{{ getStatus(row.serviceStatus) }}</span
                        >
                      </template>
                    </ElTableColumn>
                    <ElTableColumn
                      :label="$t('public_operation')"
                      prop="netStatTotals"
                    >
                      <template #default="{ row }">
                        <div v-readonlybtn="'Cluster_operation'" class="btn">
                          <ElButton
                            text
                            type="primary"
                            :disabled="row.status == 'stopped' ? false : true"
                            @click="
                              startFn(row, row.status, 'management', 'start')
                            "
                            >{{ $t('public_button_start') }}
                          </ElButton>
                          <ElDivider direction="vertical" />
                          <ElButton
                            text
                            type="primary"
                            :disabled="row.status == 'running' ? false : true"
                            @click="
                              closeFn(row, row.status, 'management', 'stop')
                            "
                            >{{ $t('public_button_close') }}
                          </ElButton>
                          <ElDivider direction="vertical" />
                          <ElButton
                            text
                            type="primary"
                            :disabled="row.status == 'running' ? false : true"
                            @click="
                              restartFn(
                                row,
                                row.status,
                                'management',
                                'restart',
                              )
                            "
                            >{{ $t('public_button_restart') }}
                          </ElButton>
                        </div>
                      </template>
                    </ElTableColumn>
                  </ElTable>
                </div>
                <div class="flex-1 border rounded-lg p-4">
                  <div class="flex align-center justify-content-between mb-3">
                    <span class="section-title font-color-dark fs-6 fw-sub"
                      >API server</span
                    >
                  </div>
                  <ElTable :data="apiServerData">
                    <ElTableColumn
                      :label="$t('daas_cluster_engine_hostname')"
                      prop="name"
                    >
                      <template #default="{ row }">
                        <div>{{ row.hostname }}</div>
                        <span class="ip">{{ row.ip }}</span>
                      </template>
                    </ElTableColumn>
                    <ElTableColumn :label="$t('public_status')" prop="status">
                      <template #default="{ row }">
                        <span :class="[`status-${row.status}`, 'status']">{{
                          getStatus(row.status)
                        }}</span>
                      </template>
                    </ElTableColumn>
                    <ElTableColumn
                      :label="$t('cluster_service_status')"
                      prop="netStatTotals"
                    >
                      <template #default="{ row }">
                        <span
                          :class="[`status-${row.serviceStatus}`, 'status']"
                          >{{ getStatus(row.serviceStatus) }}</span
                        >
                      </template>
                    </ElTableColumn>
                    <ElTableColumn
                      :label="$t('public_operation')"
                      prop="netStatTotals"
                    >
                      <template #default="{ row }">
                        <div v-readonlybtn="'Cluster_operation'" class="btn">
                          <ElButton
                            text
                            type="primary"
                            :disabled="row.status == 'stopped' ? false : true"
                            @click="startFn(row, row.status, 'apiServer')"
                            >{{ $t('public_button_start') }}
                          </ElButton>
                          <ElDivider direction="vertical" />
                          <ElButton
                            text
                            type="primary"
                            :disabled="row.status == 'running' ? false : true"
                            @click="closeFn(row, row.status, 'apiServer')"
                            >{{ $t('public_button_close') }}
                          </ElButton>
                          <ElDivider direction="vertical" />
                          <ElButton
                            text
                            type="primary"
                            :disabled="row.status == 'running' ? false : true"
                            @click="restartFn(row, row.status, 'apiServer')"
                            >{{ $t('public_button_restart') }}
                          </ElButton>
                        </div>
                      </template>
                    </ElTableColumn>
                  </ElTable>
                </div>
              </div>
            </section>
            <div v-else class="content">
              <el-row class="waterfall" :gutter="24" style="row-gap: 24px">
                <el-col
                  v-for="item in waterfallData"
                  :key="item.id"
                  class="list"
                  :md="12"
                  :sm="24"
                >
                  <div class="grid-content list-box rounded-lg">
                    <div class="list-box-header">
                      <div class="list-box-header-left">
                        <img
                          class="mr-4 rounded-lg"
                          src="../../assets/images/serve.svg"
                        />
                        <i
                          class="circular mr-2 mt-2"
                          :class="
                            item.status !== 'running' ? 'bgred' : 'bggreen'
                          "
                        />
                        <div class="list-box-header-main">
                          <h2 class="name fs-6">
                            {{ item.agentName || item.systemInfo.hostname }}
                          </h2>
                          <div class="uuid fs-8 my-1">
                            {{ item.systemInfo.uuid }}
                          </div>
                          <span class="ip">{{
                            item.custIP ? item.custIP : item.systemInfo.ip
                          }}</span>
                        </div>
                      </div>
                      <div
                        v-readonlybtn="'Cluster_operation'"
                        class="operation-bar flex align-self-start align-center"
                      >
                        <ElButton
                          v-if="item.canUpdate"
                          type="danger"
                          @click="
                            updateFn(
                              item,
                              item.management.status,
                              'management',
                              'update',
                            )
                          "
                          >{{ $t('cluster_update') }}
                        </ElButton>
                        <template
                          v-if="
                            item.engine.status === 'running' && !hideDownload
                          "
                        >
                          <el-tooltip
                            :content="$t('instance_details_xianchengziyuanxia')"
                            placement="top"
                          >
                            <el-button
                              text
                              size="small"
                              type="primary"
                              @click="downServeFn(item)"
                            >
                              <template #icon>
                                <VIcon>connectors</VIcon>
                              </template>
                            </el-button>
                          </el-tooltip>
                          <el-tooltip
                            :content="$t('instance_details_shujuyuanziyuan')"
                            placement="top"
                          >
                            <el-button
                              text
                              size="small"
                              type="primary"
                              @click="downConnectorsFn(item)"
                            >
                              <template #icon>
                                <VIcon>supervisor</VIcon>
                              </template>
                            </el-button>
                          </el-tooltip>
                        </template>

                        <el-button
                          text
                          size="small"
                          type="primary"
                          @click="addServeFn(item)"
                        >
                          <template #icon>
                            <VIcon>bg-add</VIcon>
                          </template>
                        </el-button>

                        <el-button
                          text
                          size="small"
                          type="primary"
                          @click="editAgent(item)"
                        >
                          <template #icon>
                            <VIcon>cluster-setting</VIcon>
                          </template>
                        </el-button>
                        <template v-if="item.status !== 'running'">
                          <ElDivider direction="vertical" />
                          <ElButton
                            text
                            type="danger"
                            @click="delConfirm(item)"
                            >{{ $t('public_button_delete') }}</ElButton
                          >
                        </template>
                      </div>
                    </div>
                    <div v-if="item.metricValues" class="list-box-main">
                      <div class="usageRate">
                        <div class="fs-5 pb-1 fw-bolder">
                          {{ item.metricValues.CpuUsage }}
                        </div>
                        {{ $t('cluster_cpu_usage') }}
                      </div>
                      <div class="line" />
                      <div class="usageRate">
                        <div class="fs-5 pb-1 fw-bolder">
                          {{ item.metricValues.HeapMemoryUsage }}
                        </div>
                        {{ $t('cluster_heap_memory_usage') }}
                      </div>
                    </div>
                    <!-- 监控数据 -->
                    <div class="list-box-footer">
                      <el-row :gutter="16" class="list-box-footer-header">
                        <el-col :span="6">
                          <span class="txt fw-sub">{{
                            $t('cluster_name')
                          }}</span>
                        </el-col>
                        <el-col :span="4">
                          <span class="txt fw-sub">{{
                            $t('cluster_status')
                          }}</span>
                        </el-col>
                        <el-col :span="4">
                          <span class="txt fw-sub">{{
                            $t('cluster_service_status')
                          }}</span>
                        </el-col>
                        <el-col :span="10">
                          <div class="btn txt fw-sub">
                            {{ $t('public_operation') }}
                          </div>
                        </el-col>
                      </el-row>
                      <el-row :gutter="16" class="data-list">
                        <el-col :span="6">
                          <span class="txt fw-normal">{{
                            $t('cluster_manage_sys')
                          }}</span>
                        </el-col>
                        <el-col :span="4">
                          <span
                            :class="[
                              `status-${item.management.status}`,
                              'status',
                            ]"
                            >{{ getStatus(item.management.status) }}</span
                          >
                        </el-col>
                        <el-col :span="4">
                          <span
                            :class="[
                              `status-${item.management.serviceStatus}`,
                              'status',
                            ]"
                            >{{
                              getStatus(item.management.serviceStatus)
                            }}</span
                          >
                        </el-col>
                        <el-col :span="10">
                          <div v-readonlybtn="'Cluster_operation'" class="btn">
                            <ElButton
                              text
                              type="primary"
                              :disabled="
                                item.management.status == 'stopped'
                                  ? false
                                  : true
                              "
                              @click="
                                startFn(
                                  item,
                                  item.management.status,
                                  'management',
                                  'start',
                                )
                              "
                              >{{ $t('public_button_start') }}
                            </ElButton>
                            <ElDivider direction="vertical" />
                            <ElButton
                              text
                              type="primary"
                              :disabled="
                                item.management.status == 'running'
                                  ? false
                                  : true
                              "
                              @click="
                                closeFn(
                                  item,
                                  item.management.status,
                                  'management',
                                  'stop',
                                )
                              "
                              >{{ $t('public_button_close') }}
                            </ElButton>
                            <ElDivider direction="vertical" />
                            <ElButton
                              text
                              type="primary"
                              :disabled="
                                item.management.status == 'running'
                                  ? false
                                  : true
                              "
                              @click="
                                restartFn(
                                  item,
                                  item.management.status,
                                  'management',
                                  'restart',
                                )
                              "
                              >{{ $t('public_button_restart') }}
                            </ElButton>
                          </div>
                        </el-col>
                      </el-row>
                      <el-row :gutter="16" class="data-list">
                        <el-col :span="6">
                          <span class="txt fw-normal">{{
                            $t('cluster_sync_gover')
                          }}</span>
                        </el-col>
                        <el-col :span="4">
                          <span
                            :class="[`status-${item.engine.status}`, 'status']"
                            >{{ getStatus(item.engine.status) }}</span
                          >
                        </el-col>
                        <el-col :span="4">
                          <span
                            :class="[
                              `status-${item.engine.serviceStatus}`,
                              'status',
                            ]"
                            >{{ getStatus(item.engine.serviceStatus) }}</span
                          >
                        </el-col>
                        <el-col :span="10">
                          <div v-readonlybtn="'Cluster_operation'" class="btn">
                            <ElButton
                              text
                              type="primary"
                              :disabled="
                                item.engine.status == 'stopped' ? false : true
                              "
                              @click="
                                startFn(item, item.engine.status, 'engine')
                              "
                              >{{ $t('public_button_start') }}
                            </ElButton>
                            <ElDivider direction="vertical" />
                            <ElButton
                              text
                              type="primary"
                              :disabled="
                                item.engine.status == 'running' ? false : true
                              "
                              @click="
                                closeFn(item, item.engine.status, 'engine')
                              "
                              >{{ $t('public_button_close') }}
                            </ElButton>
                            <ElDivider direction="vertical" />
                            <ElButton
                              text
                              type="primary"
                              :disabled="
                                item.engine.status == 'running' ? false : true
                              "
                              @click="
                                restartFn(item, item.engine.status, 'engine')
                              "
                              >{{ $t('public_button_restart') }}
                            </ElButton>
                            <ElDivider
                              v-if="bindWorkerMap[item.systemInfo.process_id]"
                              direction="vertical"
                            />
                            <ElButton
                              v-if="bindWorkerMap[item.systemInfo.process_id]"
                              text
                              type="primary"
                              :disabled="
                                item.engine.status == 'stopped' ? false : true
                              "
                              @click="
                                unbind(item, item.engine.status, 'engine')
                              "
                              >{{ $t('daas_unbind_license') }}
                            </ElButton>
                          </div>
                        </el-col>
                      </el-row>
                      <el-row :gutter="16" class="data-list">
                        <el-col :span="6">
                          <span class="txt fw-normal">API server</span>
                        </el-col>
                        <el-col :span="4">
                          <span
                            :class="[
                              `status-${item.apiServer.status}`,
                              'status',
                            ]"
                            >{{ getStatus(item.apiServer.status) }}</span
                          >
                        </el-col>
                        <el-col :span="4">
                          <span
                            :class="[
                              `status-${item.apiServer.serviceStatus}`,
                              'status',
                            ]"
                            >{{ getStatus(item.apiServer.status) }}</span
                          >
                        </el-col>
                        <el-col :span="10">
                          <div v-readonlybtn="'Cluster_operation'" class="btn">
                            <ElButton
                              text
                              type="primary"
                              :disabled="
                                item.apiServer.status == 'stopped'
                                  ? false
                                  : true
                              "
                              @click="
                                startFn(
                                  item,
                                  item.apiServer.status,
                                  'apiServer',
                                )
                              "
                              >{{ $t('public_button_start') }}
                            </ElButton>
                            <ElDivider direction="vertical" />
                            <ElButton
                              text
                              type="primary"
                              :disabled="
                                item.apiServer.status == 'running'
                                  ? false
                                  : true
                              "
                              @click="
                                closeFn(
                                  item,
                                  item.apiServer.status,
                                  'apiServer',
                                )
                              "
                              >{{ $t('public_button_close') }}
                            </ElButton>
                            <ElDivider direction="vertical" />
                            <ElButton
                              text
                              type="primary"
                              :disabled="
                                item.apiServer.status == 'running'
                                  ? false
                                  : true
                              "
                              @click="
                                restartFn(
                                  item,
                                  item.apiServer.status,
                                  'apiServer',
                                )
                              "
                              >{{ $t('public_button_restart') }}
                            </ElButton>
                          </div>
                        </el-col>
                      </el-row>
                      <el-row
                        v-for="child in item.customMonitorStatus"
                        :key="child.id"
                        :gutter="16"
                        class="data-list"
                      >
                        <el-col :span="6">
                          <span class="txt">{{ child.name }}</span>
                        </el-col>
                        <el-col :span="4">
                          <span :class="child.status">{{ child.status }}</span>
                        </el-col>
                        <el-col :span="4">
                          <span :class="child.status">{{ child.status }}</span>
                        </el-col>
                        <el-col v-readonlybtn="'Cluster_operation'" :md="10">
                          <div class="btn">
                            <ElButton
                              text
                              type="primary"
                              @click="delServe(child, item.status)"
                              >{{ $t('public_button_delete') }}
                            </ElButton>
                            <ElDivider direction="vertical" />
                            <ElButton
                              text
                              type="primary"
                              @click="editServe(child, item.status, item)"
                              >{{ $t('public_button_edit') }}
                            </ElButton>
                          </div>
                        </el-col>
                      </el-row>
                    </div>
                    <div
                      class="fs-6 font-color-dark flex align-center justify-content-between p-4 pt-2"
                    >
                      <span
                        >{{ $t('daas_cluster_cluster_lianjiezongshu') }}:
                        {{
                          item.engine ? item.engine.netStatTotals || 0 : 0
                        }}</span
                      >
                      <el-button type="primary" @click="openNetStatDialog(item)"
                        >{{ $t('public_view_details') }}
                      </el-button>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </div>
          </template>
          <VEmpty v-else large />
        </div>
      </div>

      <el-dialog
        v-model="dialogForm"
        :title="$t('cluster_add_server_mon')"
        class="serverDialog"
        :append-to-body="true"
        :lock-scroll="false"
        :close-on-click-modal="false"
        width="600px"
        @close="closeDialogForm()"
      >
        <AddServe ref="childRules" :data="currentData" :edit-item="editItem" />
        <template #footer>
          <div class="dialog-footer">
            <ElButton @click="closeDialogForm()">{{
              $t('public_button_cancel')
            }}</ElButton>
            <ElButton type="primary" @click="submitForm('ruleForm')"
              >{{ $t('public_button_confirm') }}
            </ElButton>
          </div>
        </template>
      </el-dialog>
      <el-dialog
        v-model="editAgentDialog"
        :title="$t('cluster_agentSetting')"
        class="serverDialog"
        :lock-scroll="false"
        :close-on-click-modal="false"
        width="600px"
        @close="editAgentDialog = false"
      >
        <el-form
          ref="editAgentForm"
          label-width="100px"
          class="edit-agent-form"
        >
          <el-form-item :label="$t('cluster_server_name')">
            <div class="name-box">
              <el-input
                v-model="agentName"
                style="width: 85%"
                show-word-limit
                :placeholder="$t('cluster_placeholder_mon_server')"
              />
              <ElButton text class="rest-btn" @click="editNameRest">{{
                $t('public_button_reduction')
              }}</ElButton>
            </div>
          </el-form-item>
          <el-form-item :label="$t('cluster_ip_display')" prop="command">
            <el-select
              v-model="custIP"
              :placeholder="$t('cluster_ip_display')"
              style="width: 85%"
            >
              <el-option
                v-for="item in ips"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
            <div class="ip-tip pt-2">{{ $t('cluster_ip_tip') }}</div>
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <ElButton @click="editAgentDialog = false">{{
              $t('public_button_cancel')
            }}</ElButton>
            <ElButton
              type="primary"
              @click="submitEditAgent('editAgentForm')"
              >{{ $t('public_button_confirm') }}</ElButton
            >
          </div>
        </template>
      </el-dialog>

      <el-dialog
        v-model="netStatDialog.visible"
        :title="$t('daas_cluster_cluster_lianjieshuliang_detail')"
        custom-class="serverDialog"
        :append-to-body="true"
        width="600px"
      >
        <ElTable :data="netStatDialog.data">
          <ElTableColumn
            prop="ip"
            :label="$t('daas_cluster_cluster_mubiaoIPhe')"
          />
          <ElTableColumn
            prop="numbers"
            :label="$t('daas_cluster_cluster_lianjieshuliang')"
          />
        </ElTable>
      </el-dialog>

      <ElDialog
        v-model="tagDialog.visible"
        :title="tagDialog.title"
        width="30%"
        :close-on-click-modal="false"
        @close="hideTagDialog"
      >
        <ElForm
          ref="tagForm"
          :model="tagDialog"
          :rules="tagDialog.rules"
          @submit.native.prevent
        >
          <ElFormItem prop="value" required>
            <ElInput
              v-model="tagDialog.value"
              :placeholder="$t('packages_component_classification_nodeName')"
              maxlength="50"
              show-word-limit
            />
          </ElFormItem>
        </ElForm>

        <template #footer>
          <ElButton @click="hideTagDialog">{{
            $t('public_button_cancel')
          }}</ElButton>
          <ElButton
            :disabled="tagDialog.saving"
            type="primary"
            @click="saveTag()"
          >
            {{ $t('public_button_save') }}
          </ElButton>
        </template>
      </ElDialog>

      <SetTag
        v-model:visible="setTagDialog.visible"
        :tag-data="tagData"
        :tag-map="tagMap"
        :tree-props="treeProps"
        :selection="setTagDialog.selection"
        :tag-list="setTagDialog.tagList"
        @closed="setTagDialog.tagList = []"
        @saved="onSavedTag"
      />
    </section>
  </PageContainer>
</template>

<style lang="scss" scoped>
.h-40 {
  height: 40px;
}
.tag-tree-wrapper {
  width: 228px;
}
.tag {
  padding: 2px 5px;
  font-style: normal;
  font-weight: 400;
  font-size: 10px;
  line-height: 14px;
  color: map.get($color, tag);
  border: 1px solid map.get($bgColor, tag);
  border-radius: 2px;
  margin-left: 5px;
}
.view-radio-group {
  :deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
    background-color: map.get($color, primary);
    color: #fff;
  }
}

.section-title {
  position: relative;
  padding-left: 12px;

  &::before {
    content: '';
    position: absolute;
    width: 4px;
    top: 0;
    bottom: 0;
    left: 0;
    border-radius: 10px;
    background-color: map.get($color, primary);
  }
}

.section-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 16px;

  & > :first-child {
    grid-column: span 2;
  }
}

.clusterManagement-container {
  min-height: 100%;
  .status {
    display: inline-block;
    padding: 5px 10px;
    font-weight: 500;
    border-radius: 6px;
    line-height: 1;
  }

  .ip {
    display: inline-block;
    padding: 2px 10px;
    color: map.get($color, primary);
    background-color: #ebf3fd;
    border-radius: 6px;
  }

  .header {
    padding: 15px 20px;
    background: map.get($bgColor, white);
    overflow: hidden;
    border-bottom: 1px solid #dedee4;
    box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.1);
    box-sizing: border-box;

    .title {
      font-size: 16px;
      color: map.get($fontColor, dark);
      font-weight: 600;
    }

    .log_btn {
      font-size: 14px;
      color: map.get($color, primary);
      cursor: pointer;
      float: right;
    }
  }

  .main {
    flex: 1;
    display: flex;
    height: 100%;
    overflow: hidden;
    flex-direction: column;

    .search-bar {
      display: flex;
      padding-left: 10px;

      li + li {
        margin-left: 10px;
      }
    }

    .content {
      width: 100%;
      height: 100%;
      box-sizing: border-box;

      .waterfall {
        height: 100%;
        overflow-x: hidden;
        overflow-y: auto;
      }

      .list {
        padding-left: 0;
        overflow: hidden;
        box-sizing: border-box;

        .list-box {
          background-color: map.get($bgColor, white);
          border-radius: 3px;
          border: 1px solid map.get($bgColor, main);
          //height: 340px;
          .list-box-header {
            overflow: hidden;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            padding: 12px 16px;

            .list-box-header-left {
              display: flex;
              flex-direction: row;

              img {
                width: 43px;
                height: 43px;
              }

              .circular {
                display: inline-block;
                width: 6px;
                height: 6px;
                border-radius: 50%;
              }

              .list-box-header-main {
                .name {
                  margin: 0;
                  white-space: nowrap;
                  text-overflow: ellipsis;
                  overflow: hidden;
                  color: map.get($fontColor, dark);
                }

                .uuid {
                  color: map.get($fontColor, slight);
                }
              }
            }

            .iconfont {
              // color: #999;
              cursor: pointer;
              margin-left: 10px;
            }

            .addBtn {
              span {
                font-size: 12px;
              }
            }
          }

          .list-box-main {
            display: flex;
            justify-content: center;
            padding: 16px 0;
            text-align: center;
            border-top: 1px solid map.get($borderColor, light);

            .usageRate {
              width: 50%;
              text-align: center;
              font-size: 12px;
              font-weight: 400;
              color: map.get($fontColor, slight);

              div {
                color: map.get($fontColor, dark);
              }
            }

            .line {
              width: 1px;
              height: 50px;
              background-color: #f2f2f2;
            }
          }

          .list-box-footer {
            display: flex;
            flex-direction: column;
            padding: 10px 16px;
            justify-content: center;

            .list-box-footer-header {
              width: 100%;
              height: 35px;
              margin: 0 !important;
              line-height: 35px;
              font-size: 12px;
              background-color: map.get($bgColor, normal);

              .txt {
                font-size: $fontBaseTitle;
                color: map.get($fontColor, light);
              }
            }

            .data-list {
              width: 100%;
              margin: 0 !important;
              margin-bottom: 5px;
              line-height: 35px;
              border-bottom: 1px solid map.get($borderColor, light);

              .txt {
                display: inline-block;
                width: 120px;
                font-size: $fontBaseTitle;
                color: map.get($fontColor, dark);
                text-overflow: ellipsis;
                white-space: nowrap;

                i {
                  padding-right: 5px;
                }
              }

              .btn {
                display: inline;

                :deep(.el-button) {
                  span {
                    font-weight: 400;
                  }
                }
              }

              // .popover-tip {
              //   display: inline-block;
              //   color: #f00;
              //   transform: rotate(180deg);
              //   cursor: pointer;
              // }
            }

            // .running {
            //   color: #178061;
            //   background-color: #c4f3cb;
            // }
            // .stopped {
            //   color: #d44d4d;
            //   background-color: #ffecec;
            // }
          }
        }

        .info {
          .usageRate {
            padding-left: 12px;
            font-size: 12px;
            color: map.get($fontColor, light);
          }

          .uuid {
            padding: 5px 0;
            font-size: 12px;
            color: map.get($fontColor, light);
          }

          span {
            font-size: 14px;
            color: map.get($fontColor, normal);
          }
        }
      }

      .screen {
        padding-right: 15px;
      }

      .red {
        color: map.get($color, danger);
      }

      .bgred {
        background-color: #ee5353 !important;
      }

      .green {
        color: map.get($color, primary);
      }

      .bggreen {
        background-color: #71c179 !important;
      }
    }
  }

  .no-text {
    display: flex;
    height: calc(100% - 60px);
    align-items: center;
    justify-content: center;
    color: map.get($color, primary);
    font-size: 16px;
    background-color: map.get($bgColor, white);
  }

  .edit-agent-form {
    .rest-btn {
      display: inline-block;
      margin-left: 10px;
      cursor: pointer;
    }

    .ip-tip {
      color: rgba(0, 0, 0, 0.46);
      font-size: 12px;
      line-height: 15px;
    }
  }

  .netstat {
    border-top: 1px solid #f2f2f2;
  }

  .netstat__list {
    max-height: 190px;
  }
}
</style>

<style lang="scss">
.clusterManagement-container {
  .edit-agent-form {
    .el-form-item {
      margin-bottom: 15px;
    }
  }
}

.serverDialog {
  .el-form {
    .el-form-item__label,
    .el-form-item__content {
      line-height: 28px;

      .el-form-item__error {
        padding-top: 1px;
        line-height: 12px;
      }
    }
  }
}

.has-dropdown {
  .el-tree-node__content {
    .tree-node-dropdown {
      display: none;
    }

    &:hover {
      .tree-node-dropdown {
        display: block;
      }
    }
  }
}
.engine-tag-tree {
  .el-tree-node__content {
    height: 32px;
    overflow: hidden;
  }
}
</style>
