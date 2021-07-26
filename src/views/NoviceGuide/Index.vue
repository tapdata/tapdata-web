<template>
  <div v-if="$route.name === 'NoviceGuide'" class="novice-guide-wrapper main-container">
    <div class="container-title">
      <span class="fs-5 fw-bolder">新手引导</span>
      <span class="sub-title ml-4"></span>
    </div>
    <div class="container-section mt-6 p-6">
      <el-steps class="pb-6" :active="step" process-status="process" finish-status="success" align-center>
        <el-step title="安装 Agent"></el-step>
        <el-step title="创建源连接"></el-step>
        <el-step title="创建目标连接"></el-step>
        <el-step title="配置同步任务"></el-step>
      </el-steps>
      <!--      <ul class="step-box">-->
      <!--        <li-->
      <!--          v-for="(step, index) in steps"-->
      <!--          :key="index"-->
      <!--          :class="[{ active: activeStep >= index }, { 'color-primary': activeStep >= index }]"-->
      <!--        >-->
      <!--          <span class="step-index">-->
      <!--            <i v-if="activeStep > index" class="el-icon-check"></i>-->
      <!--            <span v-else>{{ index + 1 }}</span>-->
      <!--          </span>-->
      <!--          <span>{{ step.text }}</span>-->
      <!--        </li>-->
      <!--      </ul>-->
      <!--   第1步   -->
      <div v-if="step === 0" class="step-content mt-7">
        <div class="step-content__title fs-6 fw-bolder">安装 Agent</div>
        <div class="step-content__desc mt-6">
          <div>
            TapData Cloud 需本地安装 Agent
            以确保连接数据库和数据传输服务的正常运行，为了更好了体验新手引导模式，我们将为您提供了Agent测试环境，可用于直接测试数据源。
          </div>
          <div class="mt-2">点击启用agent开始下一步吧！</div>
        </div>
        <div class="agent-info flex justify-between mt-6 p-4">
          <div>
            <div class="agent-status fs-7 mt-4">
              <span class="status-icon mr-2"></span>
              <span class="fw-bolder">{{ agentStatus }}</span>
            </div>
            <div class="agent-desc mt-4 ml-3">描述：{{ agent.name || '无' }}</div>
            <div class="ml-3 mt-2 text-black-50">
              测试Agent的同步速度限制为最多200行/S，您自己部署安装的Agent不受该限制。
            </div>
            <div class="agent-btn mt-4">
              <el-button
                v-if="!agent.status"
                type="text"
                class="color-primary"
                :loading="startAgentLoading"
                @click="startAgent"
                >启动测试Agent</el-button
              >
              <el-button
                v-else
                type="text"
                class="color-primary"
                :loading="stopAgentLoading"
                style="visibility: hidden"
                @click="stopAgent"
                >停用测试Agent</el-button
              >
            </div>
          </div>
          <div v-if="agent.status === 'Running'" class="flex justify-center align-center">
            <el-progress type="circle" :percentage="100" status="success"></el-progress>
          </div>
        </div>
        <div class="operation mt-7">
          <el-button type="primary" size="mini" :disabled="agent.status !== 'Running'" @click="toNext"
            >下一步</el-button
          >
        </div>
      </div>
      <!--   第2步、第3步   -->
      <div v-else-if="[1, 2].includes(step)" class="step-content mt-7">
        <template v-if="step === 1">
          <div class="step-content__title fs-6 fw-bolder">创建源连接</div>
          <div class="step-content__desc mt-6">
            <div>
              数据源指的是可以作为源的数据库、file、GridFS、REST API 等类型的连接，必须先创建源连接才能创建迁移任务。
            </div>
          </div>
        </template>
        <template v-else>
          <div class="step-content__title fs-6 fw-bolder">创建目标连接</div>
          <div class="step-content__desc mt-6">
            <div>
              目标连接指的是可以作为目标的数据库、file、GridFS、REST API
              等类型的连接，必须创建目标连接才能创建迁移任务。
            </div>
          </div>
        </template>

        <el-form ref="sourceElForm" v-model="sourceForm" label-width="80px" class="source-form mt-6">
          <el-form-item label="数据库类型" prop="database_type" class="database-type">
            <div class="flex justify-between w-100">
              <el-radio-group v-model="sourceForm.database_type" @change="changeSourceDatabaseType">
                <el-radio-button v-for="(item, index) in databaseTypeItems" :key="index" :label="item.value">
                  {{ item.label }}
                </el-radio-button>
              </el-radio-group>
              <el-button
                :disabled="!!sourceForm.name"
                :loading="initDatabaseLoading"
                type="primary"
                size="mini"
                @click="initDatabase"
                >初始化数据库</el-button
              >
            </div>
          </el-form-item>
          <template v-if="sourceForm.name">
            <el-form-item label="连接名称" prop="name">
              <el-input v-model="sourceForm.name" readonly disabled>
                <span slot="suffix">（仅测试使用，不可编辑）</span>
              </el-input>
            </el-form-item>
            <el-form-item label="地址/端口" prop="name" class="database-uri-port">
              <div class="flex justify-between w-100">
                <el-input v-model="sourceForm.database_host" class="database-uri" readonly disabled></el-input>
                <el-input v-model="sourceForm.database_port" class="database-port ml-3" readonly disabled></el-input>
              </div>
            </el-form-item>
            <el-form-item label="数据库名" prop="name">
              <el-input v-model="sourceForm.database_name" readonly disabled></el-input>
            </el-form-item>
            <el-form-item label="数据库账号" prop="name">
              <el-input v-model="sourceForm.database_username" readonly disabled></el-input>
            </el-form-item>
            <el-form-item label="数据库密码" prop="name">
              <el-input v-model="sourceForm.database_password" readonly disabled></el-input>
            </el-form-item>
          </template>
        </el-form>
        <div class="operation mt-7">
          <el-button v-if="step !== 0" class="mr-4" size="mini" @click="toPrev">上一步</el-button>
          <el-button type="primary" size="mini" :disabled="!sourceForm.name" @click="toNext">下一步</el-button>
        </div>
      </div>
      <!--   第4步   -->
      <div v-if="step === 3" class="step-content mt-7">
        <div class="step-content__title fs-6 fw-bolder">配置同步任务</div>
        <div class="flex mt-6">
          <div class="task-item-label mr-4 flex align-center">同步类型</div>
          <el-radio-group v-model="taskForm.type">
            <el-radio-button v-for="(item, index) in taskTypeItems" :key="index" :label="item.value">
              {{ item.label }}
            </el-radio-button>
          </el-radio-group>
        </div>
        <div class="flex mt-6">
          <div class="task-item-label mr-4">映射设置</div>
          <div>
            <div class="mb-4 text-black-50">
              用户可以在此页面勾选源端待同步表，点击中间向右的箭头按钮，将这些表移动到待同步表队列中（任务执行后将对这些表执行同步传输），鼠标移入表名可以对表进行改名操作，点击完成按钮即成功创建同步任务。
            </div>
            <el-transfer
              filterable
              :titles="['待选择表', '已选择表']"
              :filter-method="filterMethod"
              :filter-placeholder="$t('editor.cell.link.searchContent')"
              v-model="taskForm.selectSourceArr"
              :data="sourceData"
              @change="handleChangeTransfer"
              @right-check-change="handleSelectTable"
            >
              <!--              <span slot-scope="{ option }">-->
              <!--                <span> {{ option.label }}</span>-->
              <!--                <span-->
              <!--                  v-if="selectSourceArr.includes(option.key) && !isTwoWay"-->
              <!--                  @click.stop.prevent="handleFiled(option)"-->
              <!--                  class="el-icon-setting field-transfer__icon"-->
              <!--                ></span>-->
              <!--              </span>-->
            </el-transfer>
          </div>
        </div>
        <div class="operation mt-7">
          <el-button type="primary" size="mini" :disabled="!agent.name" :loading="createTaskLoading" @click="createTask"
            >完成</el-button
          >
        </div>
      </div>
      <!--   第5步   -->
      <div v-if="step === 4" class="step-content mt-7 pt-16 text-center">
        <div class="finish-img">
          <img src="../../../public/images/guide/right.png" alt="" />
        </div>
        <div class="mt-6 fs-7">恭喜您完成新手引导！</div>
        <div class="mt-2 text-black-50">
          您的Agent试用状态将在24小时后失效 请您前往安装部署Agent 不然无法创建连接和任务哦
        </div>
        <div class="mt-6">
          <el-button type="primary" @click="toWorkbench">返回工作台</el-button>
          <el-button @click="toWorkbench">继续使用</el-button>
        </div>
      </div>
    </div>
  </div>
  <RouterView v-else></RouterView>
</template>

<script>
let selectKeepArr = []
import taskSetting from '@/views/Task/config/setting'
export default {
  data() {
    return {
      timer: null,
      step: 0,
      steps: [
        { index: 0, text: '安装 Agent', type: 'agent' },
        { index: 1, text: '创建源连接', type: 'source' },
        { index: 2, text: '创建目标连接', type: 'target' },
        { index: 3, text: '配置同步任务', type: 'task' }
      ],
      agent: {},
      startAgentLoading: false, // 启动agent
      stopAgentLoading: false, // 停用agent
      createTaskLoading: false, // 创建任务
      form: {
        source: {},
        target: {}
      },
      databaseTypeItems: [
        {
          label: 'MySQL',
          value: 'mysql'
        },
        {
          label: 'PostgreSQL',
          value: 'postgres'
        },
        {
          label: 'MongoDB',
          value: 'mongodb'
        }
      ],
      sourceForm: {
        id: '',
        database_type: 'mysql',
        name: '',
        database_host: '',
        database_port: 0,
        database_name: '',
        database_username: '',
        database_password: '',
        database_schema: ''
      },
      initDatabaseLoading: false,
      sourceConnection: {},
      taskConfig: {},
      taskForm: {
        type: '',
        selectSourceArr: []
      },
      taskTypeItems: [
        {
          label: '全量 + 增量同步',
          tip: '选择全量+增量同步模式，任务会在全量同步执行结束后自动进入增量同步状态。',
          value: 'initial_sync+cdc'
        },
        {
          label: '全量同步',
          tip: '全量同步也称初始化同步，即在任务启动时刻将源端数据快照读取，并同步至目标端；该同步有更新写入、删除重写两种模式。',
          value: 'initial_sync'
        },
        {
          label: '增量同步',
          tip: '增量同步是指从任务启动时刻对存储的源端变化的日志进行采集和分析，有序的将数据变化同步至目标端，支持增删改操作。',
          value: 'cdc'
        }
      ],
      sourceData: [] // 穿梭框-左侧
    }
  },
  computed: {
    agentStatus() {
      let result
      let { agent } = this
      if (agent.status === 'Running') {
        result = '已启动'
      } else if (agent.status === 'Stopping') {
        result = '停止中'
      } else if (!agent.status) {
        result = '待启动'
      } else {
        result = '启动中'
      }
      return result
    }
  },
  watch: {
    step() {
      this.stepFnc()
    }
  },
  created() {
    this.taskConfig = taskSetting()
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.startTimer()
    },
    startTimer() {
      this.timer && clearInterval(this.timer)
      this.timer = setInterval(() => {
        this.stepFnc(true)
      }, 5000)
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
      this.step++
      // if (this.step++ > 3) this.step = 0
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
      if (isTimer && this.sourceForm.name) {
        return
      }
      this.loadConnection()
    },
    // 步骤-创建目标连接
    initTarget() {},
    // 步骤-配置同步任务
    initTask(isTimer) {
      if (isTimer) {
        return
      }
      let id = this.form.source?.id
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
          this.$message.success('Agent启动中')
        })
        .catch(() => {
          this.$message.error('Agent启动失败')
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
          this.sourceForm = {
            database_type: this.sourceForm.database_type,
            name: this.sourceForm.database_type + '_' + new Date().getTime().toString(16),
            database_host: data.host,
            database_port: data.port,
            database_name: data.db,
            database_username: data.username,
            database_password: data.password,
            database_schema: data.schema
          }
          this.createConnection()
        })
    },
    createConnection() {
      let params = Object.assign({}, this.sourceForm, {
        status: 'testing',
        schema: {},
        retry: 0,
        nextRetry: null,
        response_body: {},
        project: '',
        submit: true,
        isUrl: true,
        agentType: 'Cloud',
        connection_type: this.step === 2 ? 'target' : 'source'
      })
      delete params.id
      if (params.database_type === 'mongodb') {
        params.fill = params.isUrl ? 'uri' : ''
        delete params.isUrl
      }
      this.$axios
        .post('tm/api/Connections', params)
        .then(() => {
          this.loadConnection()
        })
        .catch(() => {
          this.$message.error('创建连接失败')
        })
    },
    resetFormField() {
      this.$refs.sourceElForm.resetFields() // 清空表单数据
      this.sourceForm.database_type = this.databaseTypeItems[0].value
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
        limit: 10
      }
      this.$axios.get('tm/api/Connections?filter=' + encodeURIComponent(JSON.stringify(filter))).then(data => {
        let sourceConnection = data?.[0]
        if (!sourceConnection) {
          this.sourceForm.name = '' // 标记为空
          return
        }
        for (let key in this.sourceForm) {
          if (key !== 'database_type') {
            this.sourceForm[key] = sourceConnection[key]
          }
        }
        this.initDatabaseLoading = false
      })
    },
    createTask() {
      let source = this.form.source
      let target = this.form.target
      let postData = {
        name: 'task_' + new Date().getTime().toString(16),
        description: '',
        status: 'paused',
        executeMode: 'normal',
        category: '数据库克隆',
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
          syncPoints: [
            {
              connectionId: '',
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
          source_sourceType: source.database_type,
          target_sourceType: target.database_type,
          source_connectionId: source.id,
          target_connectionId: target.id,
          source_connectionName: source.name,
          target_connectionName: target.name
        },
        platformInfo: {
          region: '', //区域
          zone: '', //可用区,
          regionName: '', //区域
          zoneName: '' //可用区,
        }
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
        .then(() => {
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
        var r = (Math.random() * 16) | 0
        var v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })
    },
    toWorkbench() {
      this.$router.push({
        name: 'Workbench'
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
    ::v-deep {
      .el-step__head {
        border-color: rgba(0, 0, 0, 0.25);
        color: rgba(0, 0, 0, 0.25);
        &.is-process,
        &.is-success {
          border-color: rgba(44, 101, 255, 1);
          color: rgba(44, 101, 255, 1);
        }
      }
      .el-step__title {
        //color: rgba(0, 0, 0, 0.25);
        font-size: 14px;
        &.is-success {
          color: rgba(44, 101, 255, 1);
        }
      }
      //.el-step__head.is-success {
      //  border-color: rgba(44, 101, 255, 1);
      //}
      //.el-step__head.is-success,
      //.el-step__head.is-success,
      //.el-step__title.is-success {
      //  color: rgba(44, 101, 255, 1);
      //}
    }
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
    .el-progress {
      ::v-deep {
        .el-progress-circle {
          width: 57px !important;
          height: 57px !important;
        }
      }
    }
  }
  .source-form {
    width: 500px;
    ::v-deep {
      .el-form-item__label {
        text-align: left;
      }
    }
    .database-uri-port {
      .database-uri {
        flex: 1;
      }
      .database-port {
        width: 90px;
      }
    }
  }
  .el-transfer {
    ::v-deep {
      .el-transfer-panel__filter {
        width: calc(100% - 32px);
        .el-input__inner {
          border-radius: 2px;
        }
      }

      .el-transfer-panel {
        //width: 350px;
        min-width: 240px;
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
</style>
