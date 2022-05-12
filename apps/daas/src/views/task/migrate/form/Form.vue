<template>
  <ElContainer class="create-task-wrap section-wrap" v-if="steps[activeStep]">
    <ElContainer style="overflow: hidden; flex: 1" class="create-task-container flex-column section-wrap-box">
      <div class="steps-header">
        <VStep
          ref="step"
          class="primary pb-6"
          process-status="process"
          finish-status="success"
          align-center
          :stepList="steps"
          :activeStep="activeStep"
        ></VStep>
      </div>
      <ElContainer :class="['task-container', 'task-container-' + steps[activeStep].index]">
        <div class="task-container-box flex-fill flex flex-column w-100">
          <ElMain :class="['create-task-main', 'task-main-' + steps[activeStep].index]">
            <!--步骤1-->
            <div class="body" v-if="steps[activeStep].index === 1">
              <div class="mb-6 flex flex-wrap flex-1 pr-4" style="line-height: 20px">
                <span class="title fw-sub mr-4 mb-2">{{ $t('migrate_select_connection') }}</span>
                <span class="desc mb-2">
                  {{ $t('migrate_select_connection_tip')
                  }}<span style="color: #2c65ff; cursor: pointer" @click="handleCreateDatabase">
                    {{ $t('migrate_create_connection') }}</span
                  >
                </span>
              </div>
              <DataSource
                ref="dataSource"
                :dataSourceData="dataSourceData"
                :access-node-list="accessNodeProcessList"
                @submit="dataSourceSubmit"
                @change="handleSettingValue"
              ></DataSource>
            </div>
            <!-- 步骤2 -->
            <div class="body step-3" v-if="steps[activeStep].index === 2">
              <div class="mb-6 flex flex-wrap flex-1 pr-4" style="line-height: 20px">
                <span class="title fw-sub mr-4 mb-2">{{ $t('migrate_task_settings') }}</span>
                <span class="desc mb-2">{{ $t('migrate_task_settings_tip') }} </span>
              </div>
              <Setting
                :dataSourceData="dataSourceData"
                :settingData="settingData"
                :access-node-list="accessNodeProcessList"
                @submit="settingSubmit"
              ></Setting>
            </div>
            <!-- 步骤3 -->
            <div class="body step-4" v-if="steps[activeStep].index === 3">
              <div class="flex align-items-end mb-4">
                <div class="flex flex-wrap flex-1 pr-4" style="line-height: 20px">
                  <span class="title fw-sub mr-4 mb-2">{{ $t('migrate_select_table') }}</span>
                  <span class="desc mb-2">
                    {{ $t('migrate_select_table_tip') }}
                  </span>
                </div>
                <div class="mb-2 flex">
                  <VButton size="mini" @click="dialogTableVisible = true">{{
                    $t('task_mapping_table_rename')
                  }}</VButton>
                  <VButton
                    v-if="!transferData.showBtn"
                    class="ml-4"
                    type="primary"
                    size="mini"
                    :loading="loading"
                    @click="getFieldMapping"
                    >{{ $t('dag_link_button_field_mapping') }}</VButton
                  >
                  <FieldMapping
                    v-if="showFieldMapping"
                    ref="fieldMapping"
                    class="task-form-field-mapping ml-4"
                    :transform="transferData"
                    :getDataFlow="daft"
                    @update-first="returnModel"
                    @returnPreFixSuffix="returnFieldMappingData"
                    @returnFieldMapping="saveFieldProcess"
                  ></FieldMapping>
                </div>
              </div>
              <div class="create-task-transfer">
                <Transfer
                  ref="transfer"
                  :transferData="transferData"
                  :sourceId="sourceId"
                  :mqTransferFlag="mqTransferFlag"
                  :isTwoWay="true"
                  :getTask="daft"
                ></Transfer>
                <TableFieldFilter
                  :visible.sync="dialogTableVisible"
                  :transform="transferData"
                  @save="handleTableName"
                ></TableFieldFilter>
              </div>
            </div>
          </ElMain>
          <div class="create-task-footer pt-4 mx-6" :class="['btns-step-' + steps[activeStep].index]">
            <ElButton class="btn-step" size="mini" v-if="steps[activeStep].showExitBtn" @click="goBackList()">
              {{ $t('button_cancel') }}
            </ElButton>
            <ElButton
              class="btn-step"
              size="mini"
              :loading="loading"
              v-else-if="steps[activeStep].showBackBtn || (steps[activeStep].index === 2 && !id)"
              @click="previous()"
            >
              {{ $t('button_btn_back') }}
            </ElButton>
            <ElButton
              v-if="steps[activeStep].showNextBtn"
              type="primary"
              class="btn-step"
              size="mini"
              :loading="loading"
              @mousedown.native.prevent="nextStep()"
            >
              <span>{{ $t('button_btn_next') }}</span>
            </ElButton>
            <VButton
              v-if="steps[activeStep].showSaveBtn"
              type="primary"
              class="btn-step"
              size="mini"
              :loading="loadingSave"
              @click="save()"
            >
              {{ $t('button_finish') }}
            </VButton>
          </div>
        </div>
      </ElContainer>
    </ElContainer>
  </ElContainer>
</template>
<script>
import Transfer from './Transfer'
import DataSource from './DataSource'
import Setting from './Setting'
import TableFieldFilter from './TableFieldFilter'
import VStep from '@/components/VStep'
import FieldMapping from '@tap/field-mapping'
import { DATASOURCE_MODEL, SETTING_MODEL, TRANSFER_MODEL } from './const'
import { Cluster } from '@tap/api'

const clusterApi = new Cluster()

export default {
  components: { Transfer, DataSource, Setting, TableFieldFilter, FieldMapping, VStep },
  data() {
    return {
      steps: [],
      activeStep: 0,
      id: '',
      loading: false,
      stateIsReadonly: false, //只读模式
      isEditAll: false, //编辑所有步骤
      //第一步 配置源端
      dataSourceData: Object.assign({}, DATASOURCE_MODEL),
      sourceId: '',
      dataSourceVerify: false,
      showSysncTableTip: false,
      //第二步 配置任务设置
      settingData: Object.assign({}, SETTING_MODEL),
      taskName: '',
      form: null,
      //第三步 映射表
      transferData: Object.assign({}, TRANSFER_MODEL),
      mqTransferFlag: false,
      showFieldMapping: false, //是否支持字段映射
      nodes: [],
      edges: [],
      //保存
      loadingSave: false,
      dialogTableVisible: false,

      accessNodeProcessList: []
    }
  },
  async created() {
    this.id = this.$route.params.id
    if (this.$route.name === 'MigrateViewer') {
      this.$store.commit('dataflow/setStateReadonly', true)
    } else {
      this.$store.commit('dataflow/setStateReadonly', false)
    }
    //读取当前的store
    this.stateIsReadonly = this.$store.state.dataflow.stateIsReadonly
    if (this.id) {
      this.intiData(this.id)
    } else {
      this.getSteps()
    }
    await this.loadAccessNode()
  },
  methods: {
    //保存任务
    getFieldMapping() {
      this.loading = true
      this.createTask().then(() => {
        this.$refs.fieldMapping.getMetaData()
        this.loading = false
      })
    },
    //表改名（前缀，后缀，大小写）
    handleTableName(form) {
      this.transferData.tableNameTransform = form.tableNameTransform
      this.transferData.tablePrefix = form.tablePrefix
      this.transferData.tableSuffix = form.tableSuffix
      this.dialogTableVisible = false
    },
    //字段映射
    tranModelVersionControl() {
      let data = this.daft()
      if (data.id) {
        this.transferData.showBtn = true
      }
      //查找目标节点
      //是否显示字段推演
      let nodeId = data?.dag?.edges?.[0]?.target || ''
      let param = {
        nodes: data?.dag?.nodes,
        nodeId: nodeId
      }
      this.$api('Task')
        .tranModelVersionControl(param)
        .then(res => {
          this.showFieldMapping = res?.data[nodeId]
        })
    },
    // 字段处理器返回前后缀
    returnFieldMappingData(data) {
      this.transferData.fieldsNameTransform = data.fieldsNameTransform
      this.transferData.batchOperationList = data.batchOperationList
    },
    //接收是否第一次打开
    returnModel(value) {
      this.transferData.isFirst = value
    },
    saveFieldProcess(data) {
      this.transferData.fieldProcess = data
    },
    checkEditor(id) {
      //先检查是否待启动
      this.$api('Task')
        .checkRun(id)
        .then(res => {
          let checkResult = res?.data?.neverRun //true表示没有运行过，或者重置过 false表示运行过，并且没有重置
          this.isEditAll = checkResult //不弹窗支持改所有
          this.getSteps()
          if (!checkResult) {
            this.$confirm(this.$t('task_list_edit_confirm'), '', {
              confirmButtonText: this.$t('dialog_button_confirm'),
              showCancelButton: false,
              type: 'warning'
            })
          }
        })
    },
    //编辑模式
    intiData(id) {
      this.$api('Task')
        .getId([id])
        .then(res => {
          if (res) {
            let data = res?.data
            this.status = data.status
            this.settingData = data.attrs?.task_setting_Data || null
            if (this.settingData) this.settingData.name = data?.name
            this.dataSourceData = data?.attrs?.task_data_source_Data
            this.nodes = data?.dag?.nodes
            this.edges = data?.dag?.edges
            //查找目标节点
            let nodeMapping = this.nodeMapping(this.nodes, this.edges)
            let sourceNodeMapping = nodeMapping.sourceNodeMapping
            let targetNodeMapping = nodeMapping.targetNodeMapping

            this.transferData = {
              tablePrefix: targetNodeMapping.tablePrefix,
              tableSuffix: targetNodeMapping.tableSuffix,
              tableNameTransform: targetNodeMapping.tableNameTransform,
              fieldsNameTransform: targetNodeMapping.fieldsNameTransform,
              batchOperationList: targetNodeMapping.batchOperationList,
              fieldProcess: sourceNodeMapping.fieldProcess,
              selectSourceArr: targetNodeMapping?.syncObjects?.[0]
                ? targetNodeMapping?.syncObjects?.[0].objectNames
                : [],
              topicData:
                targetNodeMapping?.syncObjects?.[0]?.type === 'topic'
                  ? targetNodeMapping?.syncObjects?.[0].objectNames
                  : targetNodeMapping?.syncObjects?.[1]?.objectNames || [],
              queueData:
                targetNodeMapping?.syncObjects?.[0]?.type === 'queue'
                  ? targetNodeMapping?.syncObjects?.[0].objectNames
                  : targetNodeMapping?.syncObjects?.[1]?.objectNames || []
            }

            this.transferData = Object.assign({}, TRANSFER_MODEL, this.transferData)

            //编辑时不被覆盖
            this.tableNameTransform = targetNodeMapping.tableNameTransform
            this.fieldsNameTransform = targetNodeMapping.fieldsNameTransform

            //查看 不需要检测是否启动过
            if (!this.stateIsReadonly) {
              this.checkEditor(this.id)
            } else {
              this.getSteps()
            }
          }
        })
    },
    //数据映射
    nodeMapping(nodes, edges) {
      //查找目标节点
      let nodeMapping = {}
      let sourceNodeMapping = {}
      let targetNodeMapping = {}
      nodes.forEach(item => {
        nodeMapping[item.id] = item
      })
      edges.forEach(item => {
        sourceNodeMapping = nodeMapping[item.source]
        targetNodeMapping = nodeMapping[item.target]
      })
      return {
        sourceNodeMapping: sourceNodeMapping,
        targetNodeMapping: targetNodeMapping
      }
    },
    getSteps() {
      this.steps = []
      if (this.id && !this.stateIsReadonly && !this.isEditAll) {
        //编辑模式 没有第一步
        this.steps = [
          {
            index: 2,
            label: this.$t('migrate_task_properties'),
            type: 'setting',
            showExitBtn: true,
            showNextBtn: true
          },
          {
            index: 3,
            label: this.$t('migrate_select_table'),
            type: 'mapping',
            showBackBtn: true,
            showSaveBtn: true
          }
        ]
      } else {
        this.steps = [
          {
            index: 1,
            label: this.$t('migrate_select_connection'),
            type: 'dataSource',
            showExitBtn: true,
            showNextBtn: true
          },
          {
            index: 2,
            label: this.$t('migrate_task_properties'),
            type: 'setting',
            showBackBtn: true,
            showNextBtn: true
          },
          {
            index: 3,
            label: this.$t('migrate_select_table'),
            type: 'mapping',
            showBackBtn: true,
            showSaveBtn: true
          }
        ]
      }
    },
    goBackList() {
      this.$router.push({
        name: 'migrate'
      })
    },
    previous() {
      let type = this.steps[this.activeStep].type
      switch (type) {
        case 'setting':
          this.taskName = this.settingData.name //返回上一步 选择数据源 存储当前任务名
          break
      }
      this.activeStep--
    },
    nextStep() {
      let type = this.steps[this.activeStep].type
      switch (type) {
        case 'dataSource':
          this.$refs.dataSource.save() //表单验证
          if (this.dataSourceVerify) {
            this.showSysncTableTip = false //初始化值
            //检验: 源端目标端选择相同库(id一致)
            if (this.dataSourceData.source_connectionId === this.dataSourceData.target_connectionId) {
              this.showSysncTableTip = true
              this.$message.info(this.$t('migrate_same_connection_message'))
            }
            //检验: 是否是MQ数据源
            if (this.dataSourceData['target_databaseType'] === 'mq' && this.dataSourceData['mqType'] === '0') {
              this.mqTransferFlag = true
            } else {
              this.mqTransferFlag = false
            }
            this.activeStep++
          }
          break
        case 'setting':
          this.form
            .validate()
            .then(() => {
              //数据: 第三步请求schema用到sourceId
              this.settingData = { ...this.form.values } //保存表单
              this.loading = false
              this.sourceId = this.dataSourceData.source_connectionId
              this.activeStep++
              this.transferData.automaticallyCreateTables = this.settingData.automaticallyCreateTables
              this.tranModelVersionControl()
            })
            .catch(() => {
              this.loading = false
              this.$message.error('表单检验不通过，任务名称必填')
            })
            .finally(() => {
              this.loading = false
            })
          break
      }
    },
    //第一步 选择源端
    dataSourceSubmit(verify) {
      this.dataSourceVerify = verify
    },
    handleSettingValue() {
      this.settingData = Object.assign({}, SETTING_MODEL) //第一步切換数据源初始化任务配置
      this.settingData.name = this.taskName //名字不需要清除
    },
    handleCreateDatabase() {
      this.$router.push({
        name: 'connections'
      })
    },
    //第二步 任务设置配置
    settingSubmit(form) {
      this.form = form
    },
    //第三步 映射表
    checkTransfer() {
      //检查是否选择表
      let result = true
      if (this.transferData.selectSourceArr.length === 0 && this.dataSourceData['mqType'] !== '0') {
        result = false
      } else if (
        this.transferData.topicData.length === 0 &&
        this.transferData.queueData.length === 0 &&
        this.dataSourceData['mqType'] === '0'
      ) {
        result = false
      }
      return result
    },

    handleError(error) {
      if (error?.data?.code === 'Task.ListWarnMessage') {
        if (error.data.data) {
          const keys = Object.keys(error.data.data)
          if (keys.length) {
            const msg = error.data.data[keys[0]][0]?.msg
            if (msg) {
              this.$message.error(msg)
              return
            }
          }
        }
        this.$message.error(`${this.$t('dag_save_fail')}`)
      } else if (error?.data?.message) {
        this.$message.error(error.data.message)
      } else {
        // eslint-disable-next-line no-console
        console.error(error)
        this.$message.error(`${this.$t('dag_save_fail')}`)
      }
    },
    createTask() {
      if (this.id) return
      let postData = this.daft()
      let promise = this.$api('Task').save(postData)
      promise.then(res => {
        this.id = res?.data?.id
        this.transferData.showBtn = true
        this.dataSourceData.id = res?.data?.id //设置页面 checkname使用
      })
      return promise
    },
    //储存/提交数据
    daft() {
      let source = this.dataSourceData
      let target = this.dataSourceData
      //设置为增量模式
      let timeZone = new Date().getTimezoneOffset() / 60
      let systemTimeZone = (timeZone > 0 ? '+' : '-') + (Math.abs(timeZone) + '').padStart(2, '0') + ':00'
      let syncPoints = [
        {
          connectionId: source.source_connectionId,
          type: 'current', // localTZ: 本地时区； connTZ：连接时区
          time: '',
          date: '',
          name: '',
          timezone: systemTimeZone // 当type为localTZ时有该字段
        }
      ]
      this.settingData['syncPoints'] = syncPoints
      let postData = {
        name: this.settingData.name,
        description: '',
        status: 'paused',
        executeMode: 'normal',
        category: this.$t('task_form_database_clone'),
        stopOnError: false,
        attrs: {
          task_data_source_Data: this.dataSourceData,
          task_setting_Data: this.settingData
        },
        mappingTemplate: 'cluster-clone',
        dag: {
          edges: [],
          nodes: []
        },
        dataFlowType: 'normal', //区分创建方式,
        syncType: 'migrate'
      }
      postData = Object.assign({}, postData, this.settingData)
      postData.type = this.settingData.sync_type
      //第四步 数据组装
      let selectTable = []
      if (this.transferData) {
        if (this.transferData.topicData.length || this.transferData.queueData.length) {
          if (this.transferData.topicData.length) {
            selectTable.push({
              objectNames: this.transferData.topicData,
              type: 'topic'
            })
          }
          if (this.transferData.queueData.length) {
            selectTable.push({
              objectNames: this.transferData.queueData,
              type: 'queue'
            })
          }
        } else {
          if (this.transferData.selectSourceArr.length > 0) {
            selectTable.push({
              objectNames: this.transferData.selectSourceArr,
              type: 'table'
            })
          }
        }
      }
      //编辑时传原status
      let sourceIdA = ''
      let targetIdB = ''
      if (this.id) {
        postData.id = this.id
      }
      //查找目标节点
      let nodeMapping = this.nodeMapping(this.nodes, this.edges)
      let sourceNodeMapping = nodeMapping.sourceNodeMapping
      let targetNodeMapping = nodeMapping.targetNodeMapping
      sourceIdA = sourceNodeMapping?.id || this.$util.uuid()
      targetIdB = targetNodeMapping?.id || this.$util.uuid()
      //节点连接关系
      postData['dag'].edges = [
        {
          source: sourceIdA,
          target: targetIdB
        }
      ]
      postData['dag'].nodes = [
        Object.assign(
          {},
          {
            connectionId: source.source_connectionId,
            databaseType: this.dataSourceData['source_databaseType'] || 'mysql',
            id: sourceIdA,
            name: this.dataSourceData.source_connectionName,
            tableName: this.dataSourceData.source_connectionName, //?
            type: 'database',
            fieldProcess: this.transferData.fieldProcess
          }
        ),
        Object.assign(
          {},
          {
            connectionId: target.target_connectionId,
            databaseType: this.dataSourceData['target_databaseType'] || 'mysql',
            id: targetIdB,
            name: this.dataSourceData.target_connectionName,
            tableName: this.dataSourceData.target_connectionName, //?
            type: 'database',
            syncObjects: selectTable,
            tablePrefix: this.transferData.tablePrefix,
            tableSuffix: this.transferData.tableSuffix,
            tableNameTransform: this.transferData.tableNameTransform,
            fieldsNameTransform: this.transferData.fieldsNameTransform,
            batchOperationList: this.transferData.batchOperationList
          }
        )
      ]
      this.transferData.nodeId = targetIdB
      return postData
    },
    save() {
      if (this.stateIsReadonly) {
        //查看 不保存 直接退出
        this.$router.push({
          name: 'migrate'
        })
        return
      }
      let verify = this.checkTransfer()
      if (!verify) {
        this.$message.error('请先选择表')
        return
      }
      let postData = this.daft()
      let promise = null
      if (this.id) {
        promise = this.$api('Task').edit(postData)
      } else {
        promise = this.$api('Task').save(postData)
      }
      this.loadingSave = true
      promise
        .then(() => {
          this.$message.success('保存成功')
          this.$router.push({
            name: 'migrate'
          })
        })
        .catch(e => {
          this.handleError(e)
        })
        .finally(() => {
          this.loadingSave = false
        })
    },

    async loadAccessNode() {
      const data = await clusterApi.findAccessNodeInfo()
      this.accessNodeProcessList = data.map(item => {
        return {
          value: item.processId,
          label: `${item.hostName}（${item.ip}）`
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.task-form-field-mapping {
  ::v-deep {
    > .el-button {
      padding-top: 0;
      padding-bottom: 0;
      line-height: 28px;
    }
  }
}
.create-task-wrap {
  .select-connection-popper {
    .el-select-dropdown__item {
      height: 64px;
      padding: 10px;
    }
    .select-connection-option {
      display: flex;
      align-items: center;
      .img {
        padding: 6px;
        width: 44px;
        height: 44px;
        line-height: 32px;
        border: 1px solid #dedee4;
        border-radius: 3px;
        box-sizing: border-box;
        text-align: center;
        color: map-get($fontColor, slight);
        img {
          display: block;
          width: 100%;
          height: 100%;
        }
      }
      .name {
        margin-left: 10px;
      }
    }
  }
}
.create-task-wrap {
  height: 0;
  padding: 0 20px 20px 20px;
  background-color: #eff1f4;
  .step-header {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: map-get($bgColor, white);
    border-bottom: 1px solid #dedee4;
    color: rgba(102, 102, 102, 100);
    font-size: 12px;
    .step-box {
      margin-left: 20px;
      display: flex;
      align-items: center;
      li + li {
        margin-left: 54px;
        &::before {
          content: '';
          position: absolute;
          top: 10px;
          left: -42px;
          height: 1px;
          width: 30px;
          background: #bbb;
        }
      }
      li {
        position: relative;
        display: flex;
        align-items: center;
        &.active {
          .step-index {
            border-color: #fff;
            color: map-get($fontColor, white);
          }
        }
        .step-index {
          margin-right: 7px;
          width: 20px;
          height: 20px;
          line-height: 16px;
          text-align: center;
          border: 1px solid #aaa;
          border-radius: 50%;
          font-family: Roboto;
          font-weight: bold;
          box-sizing: border-box;
        }
      }
    }
  }
  .right-aside {
    background: map-get($bgColor, normal);
    border-left: 1px solid #dedee4;
  }
  .task-container {
    overflow-y: auto;
    &.task-container-5 {
      flex: 1;
      .task-container-box {
        display: flex;
        flex-direction: column;
        position: relative;
      }
      .create-task-main {
        margin-bottom: 0;
        padding: 24px 0 0;
      }
      ::v-deep {
        .field-mapping {
          .field-mapping__desc,
          .search {
            padding-left: 24px;
          }
          .icon {
            color: map-get($color, primary);
          }
          .task-form-body .nav li {
            border-radius: unset;
          }
          .field-mapping-table {
            .el-table__header-wrapper {
              border-radius: unset;
            }
            th {
              background-color: map-get($bgColor, normal);
            }
          }
        }
      }
    }
  }
  .create-task-main {
    padding: 24px 24px 0;
    background-color: map-get($bgColor, white);
    font-size: 14px;
    .body {
      overflow-y: auto;
      min-height: 400px;
      .title {
        font-size: 14px;
        color: map-get($fontColor, normal);
      }
      .desc {
        font-size: 12px;
        color: map-get($fontColor, light);
      }
      .reload-schema {
        padding: 0 200px;
        margin-top: 10px;
      }
      .create-task-transfer {
        margin-bottom: 24px;
        flex: 1;
        overflow: hidden;
        min-height: 290px;
        ::v-deep {
          .el-transfer-panel__header {
            background-color: map-get($bgColor, disable);
            height: 40px;
            line-height: 40px;
            .el-checkbox {
              height: 40px;
              line-height: 40px;
            }
          }
        }
      }
    }
    .dataSource-title {
      font-size: 16px;
      font-weight: bold;
      margin: 10px 0;
    }
    .step-3 {
      ::v-deep {
        .el-select {
          .el-input--small .el-input__icon {
            line-height: 24px;
          }
        }
      }
    }
    .step-5 {
      height: 100%;
      min-height: 300px;
      .search {
        display: flex;
        justify-content: flex-start;
        margin-top: 10px;
        .item {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          margin-right: 10px;
          span {
            display: inline-block;
            width: 80px;
          }
        }
      }
      .task-form-body {
        display: flex;
        flex: 1;
        margin-top: 20px;
        .nav {
          width: 293px;
          border-top: 1px solid map-get($borderColor, light);
          border-right: 1px solid map-get($borderColor, light);
          background: rgba(44, 101, 255, 0.05);
          li {
            height: 115px;
            background: map-get($bgColor, white);
            box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.02);
            border-radius: 4px;
            border-bottom: 1px solid map-get($borderColor, light);
          }
        }
      }
    }
  }
  .btn-step {
    // width: 212px;
    position: relative;
    .btn-pass {
      position: absolute;
      top: 50%;
      right: -20px;
      transform: translate(100%, -50%);
    }
  }
  .btn-step + .btn-step {
    margin-left: 32px;
  }
  .select-connection {
    display: block;
    width: 450px;
  }
  .database-type {
    padding: 0 200px;
    display: flex;
    align-items: center;
    .img {
      padding: 10px;
      width: 54px;
      height: 54px;
      border: 1px solid #dedee4;
      box-sizing: border-box;
      img {
        display: block;
        width: 100%;
        height: 100%;
      }
    }
    .database-name {
      margin-left: 15px;
      font-size: 28px;
    }
    .btn-change {
      margin-top: 10px;
      margin-left: 15px;
    }
  }
  .create-form {
    margin-top: 20px;
    padding-right: 200px;
  }
  .btn-test {
    padding-left: 200px;
    .status {
      margin-left: 10px;
      font-size: 12px;
      &.invalid {
        color: #f56c6c;
      }
      &.ready {
        color: #67c23a;
      }
      &.testing {
        color: #e6a23c;
      }
      .status-icon {
        display: none;
      }
    }
  }
  .error-msg {
    padding: 0 200px;
    line-height: 26px;
    color: rgba(238, 83, 83, 100);
    font-size: 14px;
  }
  .task-type-radio {
    padding: 0 200px;
    box-sizing: border-box;
  }
  .step-1 {
    .os-buttons {
      margin-top: 66px;
      display: flex;
      justify-content: space-between;
      .el-button {
        position: relative;
        width: 260px;
        font-family: Roboto;
        &.active {
          border-color: #c8e9f6;
          background-color: #edf8fc;
        }
        i {
          position: absolute;
          left: 19px;
          top: 9px;
          font-size: 19px;
        }
      }
    }
  }
  .create-task-footer {
    border-top: 1px solid map-get($borderColor, light);
  }
  .step-4 {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
}
.steps-header {
  margin: 0 20px;
  padding: 20px 0 0;
  border-bottom: 1px solid map-get($borderColor, light);
}
.el-main {
  padding: 24px 0 0;
}
</style>
