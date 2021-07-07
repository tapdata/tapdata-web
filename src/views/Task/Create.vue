<template>
  <el-container class="CT-task-wrap" v-if="steps[activeStep]">
    <el-container style="overflow: hidden; flex: 1" class="CT-task-container">
      <el-header class="step-header" height="42px">
        <ul class="step-box">
          <li
            v-for="(step, index) in steps"
            :key="index"
            :class="[{ active: activeStep >= index }, { 'color-primary': activeStep >= index }]"
          >
            <span class="step-index">
              <i v-if="activeStep > index" class="el-icon-check"></i>
              <span v-else>{{ index + 1 }}</span>
            </span>
            <span>{{ step.text }}</span>
          </li>
        </ul>
      </el-header>
      <el-container style="overflow: hidden; flex: 1">
        <el-container>
          <el-main class="CT-task-main">
            <!-- 步骤1 -->
            <div class="body" v-if="steps[activeStep].index === 1">
              <div class="title">选择实例</div>
              <div class="desc">
                请先选择一个有实例的地域可用区，可用区下的全部实例都能运行该同步任务，可用实例越多任务运行越稳定。任务创建后不支持更换地域可用区
              </div>
              <form-builder ref="instance" v-model="platformInfo" :config="config"></form-builder>
            </div>
            <!--步骤2-->
            <div class="body" v-if="steps[activeStep].index === 2">
              <div class="title">选择源端与目标端连接</div>
              <div class="desc">
                如果你还未添加数据源，请点击添加数据源按钮进行添加，为了方便你的测试，我们建议数据源的数量不少2个<span
                  style="color: #337dff; cursor: pointer"
                  @click="handleCreateDatabase"
                  >创建数据连接</span
                >
              </div>
              <form-builder ref="dataSource" v-model="dataSourceModel" :config="config" @value-change="formChange">
                <div slot="source" class="dataSource-title">源端连接</div>
                <div slot="target" class="dataSource-title">目标端连接</div>
              </form-builder>
            </div>
            <!-- 步骤3 -->
            <div class="body step-3" v-if="steps[activeStep].index === 3">
              <div class="title">任务设置</div>
              <div class="desc">
                用户可以在任务设置步骤对任务名称、同步类型、遇错处理等进行设置，具体配置说明请查看帮助文档
              </div>
              <form-builder
                ref="setting"
                v-model="settingModel"
                :config="config"
                @submit.native.prevent
                @value-change="formChangeSetting"
              >
                <div
                  slot="needToCreateIndex"
                  class="ddl-tip"
                  v-show="
                    dataSourceModel['source_databaseType'] === 'mysql' &&
                      dataSourceModel['target_databaseType'] === 'mysql'
                  "
                >
                  自动DDL操作支持字段和索引的重命名以及新增、删除、更新等操作
                </div>
              </form-builder>
            </div>
            <!-- 步骤4 -->
            <div class="body step-4" v-if="steps[activeStep].index === 4">
              <div class="title">映射设置</div>
              <div class="desc">
                用户可以在此页面勾选源端待同步表，点击中间向右的箭头按钮，将这些表移动到待同步表队列中（任务执行后将对这些表执行同步传输），鼠标移入表名可以对表进行改名操作，点击完成按钮即成功创建同步任务。
              </div>
              <div class="CT-task-transfer">
                <Transfer ref="transfer" :transferData="transferData" :isTwoWay="settingModel.bidirectional"></Transfer>
              </div>
            </div>
          </el-main>
          <el-footer class="CT-task-footer" height="80px">
            <el-button class="btn-step" v-if="[2].includes(steps[activeStep].index)" @click="goBackList()">
              取消
            </el-button>
            <el-button
              class="btn-step"
              v-else-if="[2, 4].includes(steps[activeStep].index) || (steps[activeStep].index === 3 && !id)"
              @click="back()"
            >
              {{ $t('guide.btn_back') }}
            </el-button>
            <el-button class="btn-step" v-if="[1].includes(steps[activeStep].index)" @click="goBackList()">
              取消
            </el-button>
            <el-button
              v-if="steps[activeStep].index !== 4"
              type="primary"
              class="btn-step"
              :loading="loading"
              @mousedown.native.prevent="next()"
            >
              <span>{{ $t('guide.btn_next') }}</span>
            </el-button>
            <el-button v-else type="primary" class="btn-step" :loading="loading" @click="save()"> 完成 </el-button>
          </el-footer>
        </el-container>
      </el-container>
    </el-container>
  </el-container>
</template>
<style lang="scss">
.CT-task-wrap {
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
        color: #999;
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
  .step-3 {
    .ddl-tip {
      font-size: 12px;
      margin-top: -10px;
      color: #aaa;
    }
  }
  .step-header {
    .step-box {
      li {
        &.active {
          color: #409eff;
          &::before {
            background: #409eff;
          }
          .step-index {
            background: #409eff;
          }
        }
      }
    }
  }
}
</style>
<style lang="scss" scoped>
.CT-task-wrap {
  height: 100%;
  background: rgba(250, 250, 250, 1);
  .step-header {
    display: flex;
    justify-content: center;
    align-items: center;
    background: #fff;
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
            color: #fff;
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
    background: #fafafa;
    border-left: 1px solid #dedee4;
  }
  .CT-task-main {
    background: #fff;
    overflow: auto;
    .body {
      margin: 0 auto;
      padding-bottom: 50px;
      width: 910px;
      .title {
        padding: 20px 200px;
        color: rgba(51, 51, 51, 100);
        font-size: 28px;
        font-weight: bold;
        text-align: left;
      }
      .desc {
        padding: 0 200px;
        margin-bottom: 20px;
        color: #999;
        font-size: 12px;
      }
      .CT-task-transfer {
        margin-left: 200px;
        height: 500px;
      }
    }
    .step-4 {
      width: 1050px;
    }
    .dataSource-title {
      font-size: 16px;
      font-weight: bold;
      margin: 10px 0;
    }
  }
  .CT-task-footer {
    display: flex;
    justify-content: center;
    align-items: center;
    border-top: 1px solid #dedee4;
  }
  .btn-step {
    width: 212px;
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
        .el-icon-error {
          display: inline-block;
        }
      }
      &.ready {
        color: #67c23a;
        .el-icon-success {
          display: inline-block;
        }
      }
      &.testing {
        color: #e6a23c;
        .el-icon-warning {
          display: inline-block;
        }
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
}
</style>
<script>
import formConfig from './config'
import Transfer from './Transfer'
import { SETTING_MODEL, DATASOURCE_MODEL, INSTANCE_MODEL, DFSDATASOURCE_MODEL } from './const'

let defaultConfig = []
export default {
  components: { Transfer },
  data() {
    return {
      id: '',
      loading: false,
      steps: [],
      activeStep: 0,
      errorMsg: '',
      showConnectDialog: false,
      showSysncTableTip: false, //dfs 同库不同表提示
      twoWayAgentRunningCount: '',
      platformInfo: JSON.parse(JSON.stringify(INSTANCE_MODEL)),
      dataSourceModel: JSON.parse(JSON.stringify(DATASOURCE_MODEL)),
      settingModel: JSON.parse(JSON.stringify(SETTING_MODEL)),
      mappingModel: {},
      config: {
        form: {
          labelPosition: 'right',
          labelWidth: '200px',
          itemStyle: 'margin-bottom: 16px;',
          size: 'small'
        },
        items: []
      },
      transferData: '',
      taskType: 'cluster-clone',
      dialogTestVisible: false,
      status: '',
      mdHtml: '',
      platformInfoZone: '',
      instanceMock: [],
      dataSourceZone: '',
      dataSourceMock: [],
      dialogDatabaseTypeVisible: false,
      allowDataType: this.$settings.ALLOW_CONNECTION_TYPE,
      supportTwoWay: false,
      systemTimeZone: '',
      options: [
        {
          label: this.$t('dataFlow.SyncInfo.localTZType'),
          value: 'localTZ'
        },
        {
          label: this.$t('dataFlow.SyncInfo.connTZType'),
          value: 'connTZ'
        },
        {
          label: this.$t('dataFlow.SyncInfo.currentType'),
          value: 'current'
        }
      ]
    }
  },
  created() {
    this.id = this.$route.params.id
    this.getSteps()
    this.getAgentCount()
    defaultConfig = [
      {
        type: 'input',
        field: 'name',
        label: '任务名称',
        maxlength: 300,
        showWordLimit: true,
        required: true,
        rules: [
          {
            required: true,
            trigger: 'blur',
            validator: (rule, value, callback) => {
              if (!value || !value.trim()) {
                callback(new Error('任务名称不能为空'))
              } else if (value && value.trim()) {
                let filter = {
                  where: {
                    name: value
                  },
                  fields: {
                    name: 1
                  },
                  limit: 1
                }
                if (this.id) {
                  filter.where['id'] = { neq: this.id }
                }
                this.$api('DataFlows')
                  .get({
                    filter: JSON.stringify(filter)
                  })
                  .then(res => {
                    if (res.data && res.data.length !== 0) {
                      callback(new Error('任务名称已存在'))
                    } else callback()
                  })
              } else {
                callback()
              }
            }
          }
        ]
      }
    ]
    this.dataSourceModel = JSON.parse(JSON.stringify(DFSDATASOURCE_MODEL))
    this.getFormConfig()
    this.allowDatabaseType()

    if (this.id) {
      this.intiData(this.id)
    }
  },
  mounted() {
    let timeZone = new Date().getTimezoneOffset() / 60
    if (timeZone > 0) {
      this.systemTimeZone = 0 - timeZone
    } else {
      this.systemTimeZone = '+' + -timeZone
    }
  },
  watch: {
    'platformInfo.region'() {
      this.changeInstanceRegion() //第一步实例change
      if (!this.id) {
        this.platformInfo.zone = ''
      }
    }
  },
  methods: {
    getAgentCount() {
      this.$axios.get('api/tcm/agent/agentCount').then(data => {
        this.twoWayAgentRunningCount = data.twoWayAgentRunningCount || 0
      })
    },
    //兼容新手引导
    handleCreateDatabase() {
      if (this.$route.query.step) {
        let item = {
          visible: true,
          step: this.$route.query.step ? Number(this.$route.query.step) + 1 : 0
        }
        window.noviceGuideChange(item)
      } else {
        this.dialogDatabaseTypeVisible = true
      }
    },
    //初始化数据 编辑跳转
    intiData(id) {
      this.$axios.get('tm/api/DataFlows/' + id).then(data => {
        this.status = data.status
        this.settingModel = data.setting
        this.settingModel.name = data.name
        this.platformInfo = data.platformInfo
        this.dataSourceModel = data.dataSourceModel
        let stages = data.stages
        this.transferData = {
          table_prefix: stages[1].table_prefix,
          table_suffix: stages[1].table_suffix,
          field_process: stages[0].field_process,
          selectSourceArr: stages[1].syncObjects[0] ? stages[1].syncObjects[0].objectNames : []
        }
        // TODO 临时为了解决bug现在这里加，回头优化
        this.getFormConfig()
      })
    },
    //第一步 选择实例
    getInstanceRegion() {
      //接口请求之前 loading = true
      let items = this.config.items
      let option = items.find(it => it.field === 'region')
      if (option) {
        option.loading = true
      }
      this.$axios('api/tcm/agent/regionZone')
        .then(data => {
          this.instanceMock = data || []
          if (this.platformInfo.region === '' && this.instanceMock.length > 0) {
            this.platformInfo.region = this.instanceMock[0].code
          }
          this.changeConfig(this.instanceMock || [], 'region')
          this.changeInstanceRegion()
        })
        .catch(() => {
          this.$message.error('请求失败')
        })
    },
    changeInstanceRegion() {
      let zone = this.instanceMock.filter(item => item.code === this.platformInfo.region)
      if (zone.length > 0) {
        this.platformInfo.zone = this.platformInfo.zone || zone[0].zones[0].code
        this.platformInfoZone = zone[0].zones
      } else {
        this.platformInfoZone = []
      }
      this.changeConfig(this.platformInfoZone, 'zone')
    },
    //云版支持数据源
    allowDatabaseType() {
      this.changeConfig(this.allowDataType, 'databaseType')
    },
    formChangeSetting(data) {
      //删除模式不支持双向
      let field = data.field || ''
      let value = data.value
      let items = this.config.items
      if (field === 'distinctWriteType') {
        let target = items.find(it => it.field === 'bidirectional')
        this.getSupportTwoWay()
        if (target && value === 'compel') {
          target.show = false
          this.settingModel.bidirectional = false
        } else if (target && value !== 'compel' && this.supportTwoWay) {
          target.show = true
        }
      }
    },
    formChange(data) {
      let field = data.field || '' // 源端 | 目标端
      if (field === 'source_databaseType') {
        this.getConnection(this.getWhere('source'), 'source_connectionId', true)
      }
      if (field === 'target_databaseType') {
        this.getConnection(this.getWhere('target'), 'target_connectionId', true)
      }
    },
    addSyncPoints() {
      this.primarySyncPoints() //先初始化再push
      let syncPoints = {
        connectionId: this.dataSourceModel.target_connectionId, //双向模式下 有两个源节点
        type: 'current', // localTZ: 本地时区； connTZ：连接时区
        time: '',
        date: '',
        name: '',
        timezone: this.systemTimeZone // 当type为localTZ时有该字段
      }
      this.settingModel.syncPoints.push(syncPoints)
    },
    primarySyncPoints() {
      this.settingModel.syncPoints = [
        {
          connectionId: this.dataSourceModel.source_connectionId,
          type: 'current', // localTZ: 本地时区； connTZ：连接时区
          time: '',
          date: '',
          name: '',
          timezone: this.systemTimeZone // 当type为localTZ时有该字段
        }
      ]
    },
    getSteps() {
      const steps = [
        { index: 1, text: '选择实例', type: 'instance' },
        { index: 2, text: '选择源端与目标端连接', type: 'dataSource' },
        { index: 3, text: '任务设置', type: 'setting' },
        { index: 4, text: '映射设置', type: 'mapping' }
      ]
      this.steps = steps.slice(1, 4)

      if (this.id) {
        this.steps = steps.slice(2, 4)
      }
    },
    next() {
      let type = this.steps[this.activeStep].type || 'instance'
      if (type === 'instance') {
        this.$refs.instance.validate(valid => {
          if (valid) {
            this.activeStep += 1
            this.getFormConfig()
          }
        })
      }
      if (type === 'dataSource') {
        this.$refs.dataSource.validate(valid => {
          if (valid) {
            //源端目标端不可选择相同库 规则: id一致
            this.showSysncTableTip = false
            if (this.dataSourceModel.source_connectionId === this.dataSourceModel.target_connectionId) {
              this.showSysncTableTip = true // dfs 仅提示
            }
            //数据源名称
            let source = this.handleConnectionName(this.dataSourceModel.source_connectionId, 'source_connectionId')
            let target = this.handleConnectionName(this.dataSourceModel.target_connectionId, 'target_connectionId')
            //source.id/target.id = host + port + username
            if (source.id === target.id) {
              this.showSysncTableTip = true // dfs 仅提示
            }
            this.dataSourceModel.source_connectionName = source.name
            this.dataSourceModel.target_connectionName = target.name
            this.dataSourceModel['source_databaseType'] = source.type
            this.dataSourceModel['target_databaseType'] = target.type
            this.activeStep += 1
            this.getFormConfig()
          }
        })
      }
      if (type === 'setting') {
        this.$refs.setting.validate(valid => {
          if (valid) {
            this.activeStep += 1
            this.getFormConfig()
            if (this.showSysncTableTip) {
              this.$message.warning(
                '温馨提示：您选择了同一数据源作为源和目标，为了保证您的任务可以顺利执行，请修改目标表名与原表不一致。'
              )
            }
          } else {
            this.$message.error('表单校验不通过')
          }
        })
      }
    },
    back() {
      let type = this.steps[this.activeStep].type || 'instance'
      //将复制表内容存起来
      if (type === 'mapping') {
        this.transferData = this.$refs.transfer.returnData()
      }
      this.activeStep -= 1
      this.getFormConfig()
      // 重置 数据源类型列表
      this.allowDatabaseType()
    },
    // 根据步骤获取不同的表单项目
    async getFormConfig() {
      let type = this.steps[this.activeStep].type || 'instance'
      if (type === 'dataSource') {
        type = 'dfs_dataSource'
      }
      let func = formConfig[type]
      if (func) {
        let config = func(this)
        this.config = config
        if (type === 'setting') {
          this.config.items = defaultConfig.concat(config.items)
        }
      }
      switch (type) {
        case 'instance': {
          this.changeConfig(this.instanceMock || [], 'region')
          this.changeInstanceRegion()
          break
        }
        case 'dfs_dataSource': {
          this.getConnection(this.getWhere('source'), 'source_connectionId')
          this.getConnection(this.getWhere('target'), 'target_connectionId')
          break
        }
        case 'drs_dataSource': {
          this.getConnection(this.getWhere('source'), 'source_connectionId')
          this.getConnection(this.getWhere('target'), 'target_connectionId')
          break
        }
        case 'setting': {
          this.getSupportTwoWay() // 进入设置页面再判断
          if (
            this.dataSourceModel['source_databaseType'] !== 'mysql' ||
            this.dataSourceModel['target_databaseType'] !== 'mysql'
          ) {
            this.changeConfig([], 'setting_isOpenAutoDDL')
            this.changeConfig([], 'setting_twoWay')
          }

          break
        }
        case 'mapping': {
          let id = this.dataSourceModel.source_connectionId || ''
          this.$nextTick(() => {
            this.$refs.transfer.getTable(id, this.settingModel.bidirectional)
            this.$refs.transfer.showOperation(this.settingModel.bidirectional || false) //双向模式不可以更改表名
          })
          break
        }
      }
    },
    //获取当前是否可以展示双向开关
    getSupportTwoWay() {
      this.supportTwoWay =
        this.twoWayAgentRunningCount > 0 &&
        this.dataSourceModel['source_databaseType'] === 'mongodb' &&
        this.dataSourceModel['target_databaseType'] === 'mongodb' &&
        this.settingModel['distinctWriteType'] !== 'compel' // 进入设置页面再判断
    },
    getWhere(type) {
      let where = {}
      if (type === 'source') {
        where = {
          database_type: { in: [this.dataSourceModel.source_databaseType] }
        }
      } else {
        where = {
          database_type: { in: [this.dataSourceModel.target_databaseType] }
        }
      }
      return where
    },
    //获取数据源
    getConnection(where, type, reset = false) {
      //接口请求之前 loading = true
      let items = this.config.items
      let option = items.find(it => it.field === type)
      if (option) {
        option.loading = true
      }
      let fields = {
        name: 1,
        id: 1,
        database_type: 1,
        connection_type: 1,
        status: 1,
        database_host: 1,
        database_port: 1,
        database_name: 1,
        database_uri: 1
      }
      if (type === 'source_connectionId') {
        fields['database_username'] = 1
      }
      let filter = {
        where: where,
        fields: fields,
        order: ['status DESC', 'name ASC']
      }
      this.$axios.get('tm/api/Connections?filter=' + encodeURIComponent(JSON.stringify(filter))).then(data => {
        this.changeConfig(data.data || [], type, reset)
      })
    },
    //change config
    changeConfig(data, type, reset = false) {
      let items = this.config.items
      switch (type) {
        case 'region': {
          // 第一步 选择实例 选择区域
          let region = items.find(it => it.field === 'region')
          if (region) {
            region.loading = false
            region.options = data.map(item => {
              return {
                id: item.code,
                name: item.name,
                label: item.name,
                value: item.code
              }
            })
          }
          break
        }
        case 'zone': {
          //映射可用区
          let zone = items.find(it => it.field === 'zone')
          if (zone) {
            zone.loading = false
            zone.options = this.platformInfoZone.map(item => {
              return {
                id: item.code,
                name: item.name,
                label: item.name,
                value: item.code
              }
            })
          }
          break
        }
        case 'source_connectionId': {
          if (reset) {
            this.dataSourceModel.source_connectionId = ''
          }
          // 第二步 数据源连接ID
          let source_connectionId = items.find(it => it.field === 'source_connectionId')
          if (source_connectionId) {
            source_connectionId.loading = false
            source_connectionId.options = data.map(item => {
              return {
                id: item.database_host + item.database_port + item.database_name + item.database_uri,
                name: item.name,
                label: item.name,
                value: item.id,
                type: item.database_type
              }
            })
          }
          break
        }
        case 'target_connectionId': {
          if (reset) {
            this.dataSourceModel.target_connectionId = ''
          }
          let target_connectionId = items.find(it => it.field === 'target_connectionId')
          if (target_connectionId) {
            target_connectionId.loading = false
            target_connectionId.options = data.map(item => {
              return {
                id: item.database_host + item.database_port + item.database_name + item.database_uri,
                name: item.name,
                label: item.name,
                value: item.id,
                type: item.database_type
              }
            })
          }
          break
        }
        case 'setting_isOpenAutoDDL': {
          //映射可用区
          let op = items.find(it => it.field === 'isOpenAutoDDL')
          if (op) {
            op.show = false
          }
          break
        }
        case 'setting_twoWay': {
          //映射是否双向同步
          let op = items.find(it => it.field === 'bidirectional')
          op.show = !!this.supportTwoWay
          break
        }
        case 'databaseType': {
          let source = items.find(it => it.field === 'source_databaseType')
          let TYPEMAP = this.$const.TYPEMAP
          if (source) {
            // dfs源端不支持 redis elasticsearch
            let options = data
            let filterArr = ['redis', 'elasticsearch']
            options = data.filter(item => filterArr.indexOf(item) === -1)
            source.options = options.map(item => {
              return {
                label: TYPEMAP[item],
                value: item
              }
            })
          }
          let target = items.find(it => it.field === 'target_databaseType')
          if (target) {
            target.options = data.map(item => {
              return {
                label: TYPEMAP[item],
                value: item
              }
            })
          }
          break
        }
      }
    },
    handleName(sourceData, target) {
      let data = sourceData.filter(item => item.code === target)
      if (data.length === 0) return
      return data[0].name
    },
    handleConnectionName(target, type) {
      let items = this.config.items
      let optionsData = items.find(it => it.field === type)
      if (optionsData.length === 0) return
      let data = optionsData.options.filter(op => op.value === target)
      if (data.length === 0) return
      return data[0]
    },
    //save
    save() {
      if (this.loading) {
        return
      }
      this.transferData = this.$refs.transfer.returnData()
      if (this.transferData.selectSourceArr.length === 0) {
        this.$message.error('请先选择需要同步的表,若选择的数据源没有表请先在数据库创建表')
        return
      }
      let source = this.dataSourceModel
      let target = this.dataSourceModel

      //设置为增量模式
      let timeZone = new Date().getTimezoneOffset() / 60
      let systemTimeZone = ''
      if (timeZone > 0) {
        systemTimeZone = 0 - timeZone
      } else {
        systemTimeZone = '+' + -timeZone
      }
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
      this.settingModel['syncPoints'] = syncPoints
      let postData = {
        name: this.settingModel.name,
        description: '',
        status: 'paused',
        executeMode: 'normal',
        category: '数据库克隆',
        stopOnError: false,
        mappingTemplate: 'cluster-clone',
        stages: [],
        setting: this.settingModel,
        dataFlowType: 'normal', //区分创建方式
        dataSourceModel: this.dataSourceModel,
        platformInfo: this.platformInfo
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
      if (this.transferData && this.transferData.selectSourceArr.length > 0) {
        selectTable.push({
          objectNames: this.transferData.selectSourceArr,
          type: 'table'
        })
      }
      //编辑时传原status
      if (this.id) {
        postData.status = this.status || 'paused'
      }
      //存实例名称
      postData.platformInfo.regionName = this.handleName(this.instanceMock || [], this.platformInfo.region)
      postData.platformInfo.zoneName = this.handleName(this.platformInfoZone || [], this.platformInfo.zone)
      let sourceIdA = this.$util.uuid()
      let targetIdB = this.$util.uuid()
      postData.stages = [
        Object.assign({}, stageDefault, {
          id: sourceIdA,
          connectionId: source.source_connectionId,
          outputLanes: [targetIdB],
          distance: 1,
          name: this.dataSourceModel.source_connectionName,
          type: 'database',
          database_type: this.dataSourceModel['source_databaseType'] || 'mysql',
          dropType: 'no_drop',
          readBatchSize: 1000,
          readCdcInterval: 500,
          field_process: this.transferData.field_process //字段处理器 源
        }),
        Object.assign({}, stageDefault, {
          id: targetIdB,
          connectionId: target.target_connectionId,
          inputLanes: [sourceIdA],
          distance: 0,
          syncObjects: selectTable,
          name: this.dataSourceModel.target_connectionName,
          table_prefix: this.transferData.table_prefix,
          table_suffix: this.transferData.table_suffix,
          type: 'database',
          readBatchSize: 1000,
          readCdcInterval: 500,
          dropType: this.settingModel.distinctWriteType === 'compel' ? 'drop_data' : 'no_drop',
          database_type: this.dataSourceModel['target_databaseType'] || 'mysql'
        })
      ]

      let promise = null
      if (this.id) {
        postData['id'] = this.id
        promise = this.$axios.patch('tm/api/DataFlows/' + this.id, postData)
      } else {
        promise = this.$axios.post('tm/api/DataFlows', postData)
      }
      this.loading = true
      promise
        .then(() => {
          this.routerBack()
        })
        .catch(e => {
          if (e.response.msg === 'duplication for names') {
            this.$message.error(this.$t('message.exists_name'))
          } else {
            this.$message.error(e.response.msg)
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    routerBack() {
      this.$router.push({
        name: 'Task'
      })
    },
    //返回任务列表
    goBackList() {
      this.$confirm('此操作会丢失当前正在创建的任务', '是否放弃创建该任务', {
        type: 'warning'
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        this.routerBack()
      })
    },
    //选择创建类型
    handleDialogDatabaseTypeVisible() {
      this.dialogDatabaseTypeVisible = false
    },
    handleDatabaseType(type) {
      this.handleDialogDatabaseTypeVisible()
      this.$router.push({
        name: 'connectionsCreate',
        query: {
          databaseType: type
        }
      })
    }
  }
}
</script>
