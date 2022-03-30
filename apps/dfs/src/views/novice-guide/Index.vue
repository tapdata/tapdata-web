<template>
  <div v-if="$route.name === 'NoviceGuide'" class="novice-guide-wrapper g-panel-container">
    <div class="container-section p-6">
      <ElSteps class="primary pb-6" :active="step" process-status="process" finish-status="success" align-center>
        <ElStep :title="$t('guide_install_agent')"></ElStep>
        <ElStep :title="$t('guide_create_source_connection')"></ElStep>
        <ElStep :title="$t('guide_create_target_connection')"></ElStep>
        <ElStep :title="$t('guide_config_sync_task')"></ElStep>
      </ElSteps>
      <!--   第1步   -->
      <div v-if="step === 0" class="step-content mt-7">
        <div class="step-content__title fs-6 fw-bolder">{{ $t('guide_install_agent') }}</div>
        <div class="step-content__desc mt-6">
          <div>
            {{ $t('guide_install_agent_tip') }}
          </div>
          <div class="mt-2">{{ $t('guide_click_agent_next_step') }}</div>
        </div>
        <div class="agent-info flex justify-content-between mt-6 p-4">
          <div>
            <div class="agent-status fs-7 mt-4">
              <span class="status-icon mr-1"></span>
              <span class="fw-bolder" style="margin-left: 2px">{{ agentStatus }}</span>
            </div>
            <div class="agent-desc mt-4 ml-3" :class="[{ invisible: !agent.name }]">
              {{ $t('guide_name') }}：{{ agent.name }}
            </div>
            <div class="ml-3 mt-2 text-black-50">
              {{ $t('guide_install_agent_test_tip') }}
            </div>
            <div class="ml-3 mt-2 color-warning">
              {{ $t('guide_install_agent_test_tip1') }}
            </div>
            <div class="agent-btn mt-4">
              <ElButton
                v-if="!agent.status"
                type="text"
                class="color-primary"
                :loading="startAgentLoading"
                @click="startAgent"
                >{{ $t('guide_start_test_agent') }}</ElButton
              >
              <ElButton
                v-else
                type="text"
                class="color-primary"
                :loading="stopAgentLoading"
                style="visibility: hidden"
                @click="stopAgent"
                >{{ $t('guide_stop_test_agent') }}</ElButton
              >
            </div>
          </div>
          <div v-if="agent.status === 'Running'" class="flex justify-content-center align-items-center">
            <VIcon size="57" color="#8ACD54">success-circle</VIcon>
          </div>
        </div>
        <div class="operation mt-7">
          <ElButton
            type="primary"
            size="mini"
            :disabled="agent.status !== 'Running'"
            :loading="agentNextLoading"
            @click="toNext"
            >{{ $t('guide_next_step') }}</ElButton
          >
          <span v-if="agentNextLoading" class="ml-2 font-color-sub">{{ $t('guide_install_agent_test_tip') }}</span>
        </div>
      </div>
      <!--   第2步、第3步   -->
      <div v-else-if="[1, 2].includes(step)" class="step-content mt-7">
        <template v-if="step === 1">
          <div class="step-content__title fs-6 fw-bolder">{{ $t('guide_create_source_connection') }}</div>
          <div class="step-content__desc mt-6">
            <div>
              {{ $t('guide_create_source_connection_tip') }}
            </div>
          </div>
        </template>
        <template v-else>
          <div class="step-content__title fs-6 fw-bolder">{{ $t('guide_create_target_connection') }}</div>
          <div class="step-content__desc mt-6">
            <div>
              {{ $t('guide_create_target_connection_tip') }}
            </div>
          </div>
        </template>

        <ElForm ref="sourceElForm" v-model="sourceForm" label-width="80px" class="source-form mt-6">
          <ElFormItem :label="$t('guide_database_type')" prop="database_type" class="database-type">
            <div class="flex w-100">
              <ElRadioGroup v-model="sourceForm.database_type" size="mini" @change="changeSourceDatabaseType">
                <ElRadioButton v-for="(item, index) in databaseTypeItems" :key="index" :label="item.value">
                  <VIcon size="16" class="color-primary">{{ item.icon }}</VIcon>
                  {{ item.label }}
                </ElRadioButton>
              </ElRadioGroup>
              <ElButton
                class="ml-4"
                :disabled="!!sourceForm.id"
                :loading="initDatabaseLoading"
                type="primary"
                size="mini"
                @click="initDatabase"
                >{{ $t('guide_init_database') }}</ElButton
              >
            </div>
          </ElFormItem>
          <template v-if="sourceForm.id">
            <ElFormItem :label="$t('guide_connection_name')" prop="name" class="medium-width">
              <ElInput v-model="sourceForm.name" size="mini" readonly disabled>
                <span slot="suffix">{{ $t('guide_only_test') }}</span>
              </ElInput>
            </ElFormItem>
            <ElFormItem :label="$t('guide_address_port')" prop="database_host" class="database-uri-port medium-width">
              <div class="flex justify-content-between w-100">
                <ElInput
                  v-model="sourceForm.database_host"
                  size="mini"
                  class="database-uri"
                  readonly
                  disabled
                ></ElInput>
                <ElInput
                  v-model="sourceForm.database_port"
                  size="mini"
                  class="database-port"
                  readonly
                  disabled
                ></ElInput>
              </div>
            </ElFormItem>
            <ElFormItem :label="$t('guide_database_name')" prop="database_name" class="mini-width">
              <ElInput v-model="sourceForm.database_name" size="mini" readonly disabled></ElInput>
            </ElFormItem>
            <ElFormItem :label="$t('guide_database_account')" prop="database_username" class="mini-width">
              <ElInput v-model="sourceForm.database_username" size="mini" readonly disabled></ElInput>
            </ElFormItem>
            <ElFormItem :label="$t('guide_database_password')" prop="database_password" class="mini-width">
              <ElInput v-model="sourceForm.database_password" size="mini" readonly disabled></ElInput>
            </ElFormItem>
            <ElFormItem
              v-if="sourceForm.database_type === 'postgres'"
              label="Schema"
              prop="database_owner"
              class="mini-width"
            >
              <ElInput v-model="sourceForm.database_owner" size="mini" readonly disabled></ElInput>
            </ElFormItem>
          </template>
        </ElForm>
        <div class="operation mt-7">
          <ElButton v-if="step !== 0" class="mr-4" size="mini" @click="toPrev" key="preBtn">{{
            $t('guide_previous')
          }}</ElButton>
          <ElButton
            type="primary"
            size="mini"
            :disabled="!sourceForm.id"
            :loading="connectionNextLoading"
            @click="toNext"
            >{{ $t('guide_next_step') }}</ElButton
          >
        </div>
      </div>
      <!--   第4步   -->
      <div v-if="step === 3" class="step-content mt-7">
        <div class="step-content__title fs-6 fw-bolder">{{ $t('guide_config_sync_task') }}</div>
        <div class="flex mt-6">
          <div class="task-item-label mr-4 flex align-items-center">{{ $t('guide_sync_task') }}</div>
          <ElRadioGroup v-model="taskForm.type" size="mini">
            <ElRadioButton v-for="(item, index) in taskTypeItems" :key="index" :label="item.value">
              {{ item.label }}
            </ElRadioButton>
          </ElRadioGroup>
        </div>
        <div class="flex mt-6">
          <div class="task-item-label mr-4">{{ $t('guide_mapping_setting') }}</div>
          <div class="flex-grow-1 flex-shrink-1">
            <div class="mb-4 text-black-50">
              {{ $t('guide_mapping_setting_tip') }}
            </div>
            <ElTransfer
              v-model="taskForm.selectSourceArr"
              :titles="[$t('guide_selected'), $t('guide_table_selected')]"
              :filter-method="filterMethod"
              :filter-placeholder="$t('editor.cell.link.searchContent')"
              :data="sourceData"
              filterable
              class="transfer"
              @change="handleChangeTransfer"
              @right-check-change="handleSelectTable"
            >
            </ElTransfer>
          </div>
        </div>
        <div class="operation mt-7">
          <ElButton
            type="primary"
            size="mini"
            :disabled="createTaskDisabled"
            :loading="createTaskLoading"
            style="margin-left: 105px"
            @click="createTask"
            >{{ $t('guide_finish') }}</ElButton
          >
        </div>
      </div>
      <!--   第5步   -->
      <div v-if="step === 4" class="step-content mt-7 pt-16 text-center">
        <div class="finish-img">
          <VIcon size="53">success-fill-color</VIcon>
        </div>
        <div class="mt-6 fs-7">{{ $t('guide_complete_novice_guide') }}</div>
        <div class="mt-6">
          <ElButton class="mr-4" type="primary" @click="toWorkbench">{{ $t('guide_back_workbench') }}</ElButton>
          <ElButton @click="toTaskDetail">{{ $t('guide_view_task_monitor') }}</ElButton>
        </div>
      </div>
    </div>
    <ConnectionTest ref="test"></ConnectionTest>
  </div>
  <RouterView v-else></RouterView>
</template>

<script>
import VIcon from '@/components/VIcon'

let selectKeepArr = []
export default {
  components: { VIcon },
  data() {
    return {
      timer: null,
      schemaTimer: null,
      step: 0,
      steps: [
        { index: 0, text: this.$t('guide_install_agent'), type: 'agent' },
        { index: 1, text: this.$t('guide_create_source_connection'), type: 'source' },
        { index: 2, text: this.$t('guide_create_target_connection'), type: 'target' },
        { index: 3, text: this.$t('guide_config_sync_task'), type: 'task' }
      ],
      agent: {},
      startAgentLoading: false, // 启动agent
      stopAgentLoading: false, // 停用agent
      connectionNextLoading: false, // 创建连接的下一步
      createTaskLoading: false, // 创建任务
      form: {
        agent: {},
        source: {},
        target: {},
        task: {}
      },

      sourceForm: {
        id: '', // 连接id，创建连接后才有
        initId: '', // 初始化数据库，返回的id
        database_type: 'mysql',
        name: '',
        database_host: '',
        database_port: 0,
        database_name: '',
        database_username: '',
        database_password: '',
        database_schema: '',
        database_owner: ''
      },
      initDatabaseLoading: false,
      sourceConnection: {},
      taskForm: {
        type: 'initial_sync+cdc',
        selectSourceArr: []
      },
      taskTypeItems: [
        {
          label: this.$t('task_setting_initial_sync_cdc'),
          tip: this.$t('task_setting_initial_sync_cdc_tip'),
          value: 'initial_sync+cdc'
        },
        {
          label: this.$t('task_setting_initial_sync'),
          tip: this.$t('task_setting_initial_sync_tip'),
          value: 'initial_sync'
        },
        {
          label: this.$t('task_setting_cdc'),
          tip: this.$t('task_setting_cdc_tip'),
          value: 'cdc'
        }
      ],
      sourceData: [] // 穿梭框-左侧
    }
  },
  computed: {
    agentNextLoading() {
      let { agent } = this
      let flag = false
      if (!agent?.status) {
        flag = false
      } else {
        flag = agent?.status !== 'Running'
      }
      return flag
    },
    agentStatus() {
      let result
      let { agent } = this
      if (agent.status === 'Running') {
        result = this.$t('task_status_running')
      } else if (agent.status === 'Stopping') {
        result = this.$t('task_status_stopping')
      } else if (!agent.status) {
        result = this.$t('task_status_draft')
      } else {
        result = this.$t('task_status_scheduled')
      }
      return result
    },
    databaseTypeItems() {
      let result = [
        {
          label: 'MySQL',
          value: 'mysql',
          icon: 'mysql'
        },
        {
          label: 'PostgreSQL',
          value: 'postgres',
          icon: 'pg'
        }
      ]
      if (this.step === 2) {
        result.push({
          label: 'MongoDB',
          value: 'mongodb',
          icon: 'mongo'
        })
      }
      return result
    },
    createTaskDisabled() {
      return !this.agent.id || !this.taskForm.selectSourceArr.length
    }
  },
  watch: {
    step() {
      this.stepFnc()
    }
  },
  mounted() {
    this.init()
  },
  destroyed() {
    this.clearTimer()
  },
  methods: {
    init() {
      this.stepFnc()
      this.startTimer()
    },
    startTimer() {
      this.clearTimer()
      this.timer = setInterval(() => {
        this.stepFnc(true)
      }, 5000)
    },
    clearTimer() {
      this.timer && clearInterval(this.timer)
      this.schemaTimer && clearInterval(this.schemaTimer)
    },
    stepFnc(isTimer = false) {
      switch (this.step) {
        case 3:
          this.initTask(isTimer)
          break
        case 2:
          this.initSource(isTimer)
          break
        case 1:
          this.initSource(isTimer)
          break
        default:
          this.initAgent(isTimer)
          break
      }
    },
    toPrev() {
      // 创建源连接
      if (this.step === 2) {
        this.resetFormField()
        this.sourceForm = this.deepCopy(this.form.source)
      }
      if (this.step-- < 0) this.step = 0
    },
    toNext() {
      // 创建源连接
      if (this.step === 1) {
        this.form.source = this.deepCopy(this.sourceForm)
        this.resetFormField()
      } else if (this.step === 2) {
        // 创建目标连接
        this.form.target = this.deepCopy(this.sourceForm)
      }
      // 下一步
      if (this.step === 2) {
        this.loadSchema('first')
      } else {
        this.step++
      }
    },
    // 步骤-安装agent
    initAgent(isTimer) {
      if (isTimer && this.agent.status === 'Running') {
        this.startAgentLoading = false
        this.stopAgentLoading = false
        return
      }
      this.loadAgent()
    },
    // 步骤-创建源连接
    initSource(isTimer) {
      if (isTimer && this.sourceForm.id) {
        return
      }
      this.loadConnection()
    },
    // 步骤-配置同步任务
    initTask(isTimer) {
      if (isTimer) {
        return
      }
      // let id = this.form.source?.id
      let { id } = this.form.source ?? {}
      this.$axios.get(`tm/api/Connections/${id}/customQuery?schema=true`).then(data => {
        let tables = data.schema?.tables || []
        tables = tables.sort((t1, t2) => (t1.table_name > t2.table_name ? 1 : t1.table_name === t2.table_name ? 0 : -1))
        if (tables?.length) {
          this.sourceData = tables.map(table => ({
            label: table.table_name,
            key: table.table_name,
            disabled: this.disabled,
            id: table.id
          }))
        }
      })
    },
    loadAgent() {
      let filter = {
        where: {
          agentType: 'Cloud'
        },
        limit: 10
      }
      this.$axios.get('api/tcm/agent?filter=' + encodeURIComponent(JSON.stringify(filter))).then(data => {
        this.agent = data?.items?.[0] || {}
      })
    },
    startAgent() {
      this.startAgentLoading = true
      let params = {
        zone: '-',
        spec: { direction: 'unidirectional', region: '-', specType: 'micro' },
        name: 'dfs-agent-' + new Date().getTime().toString(16),
        serviceId: '45f68fcf61034d1d82f72b37251d4642',
        groupId: '2102011537363073',
        measureId: '9202059001',
        periodType: 'month',
        duration: 1,
        chargingMode: '1',
        agentType: 'Cloud',
        poolId: '-'
      }
      this.$axios
        .post('api/tcm/orders', params)
        .then(() => {
          this.$message.success(this.$t('guide_agent_start_success'))
        })
        .catch(() => {
          this.$message.error(this.$t('guide_agent_start_fail'))
        })
    },
    stopAgent() {},
    initDatabase() {
      this.initDatabaseLoading = true
      this.$axios
        .post('api/tcm/connection/create', {
          type: this.step === 1 ? 'source' : 'target',
          databaseType: this.sourceForm.database_type
        })
        .then((data = {}) => {
          Object.assign(this.sourceForm, {
            name: this.sourceForm.database_type + '_' + new Date().getTime().toString(16),
            database_host: data.host,
            database_port: data.port,
            database_name: data.db,
            database_username: data.databaseUsername,
            database_password: data.databasePassword,
            database_schema: data.schema,
            database_owner: data.schema,
            initId: data.id
          })
          this.createConnection()
        })
        .catch(() => {
          this.initDatabaseLoading = false
        })
    },
    createConnection() {
      let params = Object.assign({}, this.sourceForm, {
        status: 'testing',
        // schema: {},
        retry: 0,
        nextRetry: null,
        response_body: {},
        project: '',
        submit: true,
        isUrl: true,
        agentType: 'Cloud',
        connection_type: this.step === 2 ? 'target' : 'source',
        initId: this.sourceForm.initId,
        platformInfo: {
          agentType: 'trusteeship'
        }
      })
      if (params.database_type === 'mongodb') {
        params.database_host += ':' + params.database_port
        params.database_port = ''
        params.fill = params.isUrl ? 'uri' : ''
        delete params.isUrl
      } else if (params.database_type === 'postgres') {
        params.database_owner = this.sourceForm.database_owner
        params.pgsql_log_decorder_plugin_name = 'wal2json_streaming'
      }
      delete params.id
      this.$axios
        .post('tm/api/Connections', params)
        .then(sourceConnection => {
          // 填充数据
          if (this.sourceForm.database_type === 'mongodb') {
            let arr = sourceConnection.database_host?.split(':')
            sourceConnection.database_host = arr[0] ?? ''
            sourceConnection.database_port = arr[1] ?? ''
            sourceConnection.database_password = sourceConnection.database_username
          }
          for (let key in this.sourceForm) {
            if (key !== 'database_type') {
              this.sourceForm[key] = sourceConnection[key]
            }
          }
        })
        .catch(() => {
          this.$message.error(this.$t('guide_creat_connection_fail'))
        })
        .finally(() => {
          this.initDatabaseLoading = false
        })
    },
    resetFormField() {
      this.$refs.sourceElForm.resetFields() // 清空表单数据
      this.sourceForm.database_type = this.databaseTypeItems[0].value
      this.connectionNextLoading = false
    },
    changeSourceDatabaseType(value) {
      this.resetFormField()
      this.sourceForm.database_type = value
      this.loadConnection()
    },
    loadConnection() {
      let filter = {
        // fields, noSchema:1 不加载schema
        noSchema: 1,
        where: {
          database_type: this.sourceForm.database_type,
          agentType: 'Cloud',
          connection_type: this.step === 2 ? 'target' : 'source'
        },
        size: 10
      }
      this.$axios
        .get('tm/api/Connections?filter=' + encodeURIComponent(JSON.stringify(filter)))
        .then(data => {
          let sourceConnection = data?.items?.[0]
          if (!sourceConnection) {
            this.sourceForm.id = '' // 标记为空
            return
          }
          if (this.sourceForm.database_type === 'mongodb') {
            let arr = sourceConnection.database_host?.split(':')
            sourceConnection.database_host = arr[0] ?? ''
            sourceConnection.database_port = arr[1] ?? ''
            sourceConnection.database_password = sourceConnection.database_username
          }
          for (let key in this.sourceForm) {
            if (key !== 'database_type') {
              this.sourceForm[key] = sourceConnection[key]
            }
          }
        })
        .finally(() => {
          this.initDatabaseLoading = false
        })
    },
    loadSchema(type) {
      this.connectionNextLoading = true
      let params
      if (type === 'first') {
        params = {
          loadCount: 0,
          loadFieldsStatus: 'loading'
        }
        this.loadFieldsStatus = 'loading'
      }
      if (this.schemaTimer) {
        clearInterval(this.schemaTimer)
        this.schemaTimer = null
      }
      this.$axios
        .patch('tm/api/Connections/' + this.form.source.id, params)
        .then(data => {
          if (type === 'first') {
            this.$refs.test.start(this.form.source, false, true)
          }
          if (data.loadFieldsStatus === 'finished') {
            this.connectionNextLoading = false
            this.step++
          } else {
            this.schemaTimer = setInterval(() => {
              this.loadSchema()
            }, 800)
          }
        })
        .catch(() => {
          this.connectionNextLoading = false
        })
    },
    createTask() {
      if (this.createTaskDisabled) {
        return
      }
      let source = this.form.source
      let target = this.form.target
      let postData = {
        name: `${source.database_type}_to_${target.database_type}_` + new Date().getTime().toString(16),
        description: '',
        status: 'paused',
        executeMode: 'normal',
        category: this.$t('task_form_database_clone'),
        stopOnError: false,
        mappingTemplate: 'cluster-clone',
        stages: [],
        setting: {
          name: '',
          sync_type: this.taskForm.type,
          distinctWriteType: 'intellect',
          stopOnError: false,
          isOpenAutoDDL: false,
          bidirectional: false,
          readBatchSize: 1000,
          needToCreateIndex: true,
          syncPoints: [
            {
              connectionId: source.id,
              type: 'current', // localTZ: 本地时区； connTZ：连接时区
              time: '',
              date: '',
              name: '',
              timezone: '+08:00' // 当type为localTZ时有该字段
            }
          ]
        },
        dataFlowType: 'normal', //区分创建方式
        dataSourceModel: {
          source_databaseType: source.database_type,
          target_databaseType: target.database_type,
          source_connectionId: source.id,
          target_connectionId: target.id,
          source_connectionName: source.name,
          target_connectionName: target.name
        },
        platformInfo: {
          region: '', //区域
          zone: '', //可用区,
          regionName: '', //区域
          zoneName: '', //可用区,
          agentType: 'trusteeship'
        },
        agentType: 'Cloud'
      }
      let stageDefault = {
        connectionId: '',
        dataQualityTag: false,
        distance: 1,
        freeTransform: false,
        id: '',
        inputLanes: [],
        joinTables: [],
        name: '',
        outputLanes: [],
        type: ''
      }
      //第四步 数据组装
      let selectTable = []
      if (this.taskForm.selectSourceArr.length > 0) {
        selectTable.push({
          objectNames: this.taskForm.selectSourceArr,
          type: 'table'
        })
      }
      let sourceIdA = this.uuid()
      let targetIdB = this.uuid()
      postData.stages = [
        Object.assign({}, stageDefault, {
          id: sourceIdA,
          connectionId: source.id,
          outputLanes: [targetIdB],
          distance: 1,
          name: source.name,
          type: 'database',
          database_type: source.database_type,
          dropType: 'no_drop',
          readBatchSize: 1000,
          readCdcInterval: 500,
          field_process: [] //字段处理器 源
        }),
        Object.assign({}, stageDefault, {
          id: targetIdB,
          connectionId: target.id,
          inputLanes: [sourceIdA],
          distance: 0,
          syncObjects: selectTable,
          name: target.name,
          table_prefix: '',
          table_suffix: '',
          type: 'database',
          readBatchSize: 1000,
          readCdcInterval: 500,
          dropType: 'no_drop',
          database_type: target.database_type
        })
      ]
      this.createTaskLoading = true
      this.$axios
        .post('tm/api/DataFlows', postData)
        .then(data => {
          this.form.task = data
          this.toNext()
        })
        .finally(() => {
          this.createTaskLoading = false
        })
    },
    deepCopy(obj) {
      return JSON.parse(JSON.stringify(obj))
    },
    filterMethod(query, item) {
      if (!!~item.label.indexOf(query) || !!~item.label.toUpperCase().indexOf(query.toUpperCase())) {
        return true
      }
    },
    handleChangeTransfer() {
      this.sourceData.forEach(el => {
        if (selectKeepArr.length && selectKeepArr.includes(el.key)) {
          el.label = el.key
        }
      })
      // this.preFixSuffixData()
    },
    handleSelectTable(data) {
      selectKeepArr = data
    },
    uuid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = (Math.random() * 16) | 0
        let v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })
    },
    toWorkbench() {
      this.$router.push({
        name: 'Workbench'
      })
    },
    toTaskDetail() {
      let id = this.form.task.id
      this.$router.push({
        name: 'Monitor',
        params: { id: id }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.novice-guide-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;
  .container-section {
    flex: 1;
  }
}
.container-title {
  .main-title {
    font-size: 18px;
  }
  .sub-title {
    color: #7a7a7a;
  }
}
.container-section {
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.02);
  border-radius: 4px;
  background: #fff;
  .el-steps {
    border-bottom: 1px solid #f2f2f2;
  }
  .agent-info {
    background: rgba(44, 101, 255, 0.1);
    border-radius: 2px;
    .status-icon {
      display: inline-block;
      width: 6px;
      height: 6px;
      background-color: rgba(138, 205, 84, 1);
      border-radius: 50%;
    }
    .el-button {
      &:hover,
      &:focus,
      &:before {
        background-color: transparent;
        color: unset;
        border-color: transparent;
      }
    }
  }
  .source-form {
    width: 550px;
    ::v-deep {
      .el-form-item__label {
        text-align: left;
      }
    }
    .el-form-item {
      &.medium-width {
        ::v-deep .el-form-item__content {
          width: 300px;
        }
      }
      &.mini-width {
        ::v-deep .el-form-item__content {
          width: 200px;
        }
      }
    }
    .database-uri-port {
      .database-uri {
        flex: 1;
      }
      .database-port {
        margin-left: 10px;
        width: 90px;
      }
    }
  }
  .task-item-label {
    width: 90px;
    flex-shrink: 0;
  }
  .finish-img {
    img {
      width: 53px;
      height: 53px;
    }
  }
}
.operation {
  .el-button {
    width: 80px;
  }
}
.el-button {
  //&:not(.el-button--text):focus {
  //  color: unset;
  //  border-color: unset;
  //}
  + .el-button {
    margin-left: 0;
  }
  &.el-button--primary {
    background: #2c65ff;
    color: #fff;
    &.is-disabled {
      color: #bbb;
      border-color: #d9d9d9;
      background-color: #f5f5f5;
    }
  }
}
.transfer {
  height: 300px;
}
</style>
