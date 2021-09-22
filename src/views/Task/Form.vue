<template>
  <el-container class="CT-task-wrap bg-white" v-if="steps[activeStep]">
    <el-container style="overflow: hidden; flex: 1" class="CT-task-container flex-column">
      <div class="steps-header">
        <el-steps class="pb-6" :active="taskStep" process-status="process" finish-status="success" align-center>
          <el-step title="选择连接"></el-step>
          <el-step title="设置任务属性"></el-step>
          <el-step title="选择表"></el-step>
          <el-step title="表字段映射"></el-step>
        </el-steps>
      </div>
      <el-container :class="['task-container', 'task-container-' + steps[activeStep].index]">
        <div class="task-container-box flex-fill">
          <el-main :class="['CT-task-main', 'task-main-' + steps[activeStep].index]">
            <!--步骤2-->
            <div class="body" v-if="steps[activeStep].index === 2">
              <div class="mb-8">
                <span class="title">选择连接</span>
                <span class="desc">
                  如果你还未添加数据源，请先前往连接管理进行添加。<span
                    style="color: #337dff; cursor: pointer"
                    @click="handleCreateDatabase"
                    >前往连接管理创建连接</span
                  >
                </span>
              </div>
              <form-builder
                ref="dataSource"
                v-model="dataSourceModel"
                :config="config"
                style="width: 376px"
                class="form-builder"
                @value-change="formChange"
              >
              </form-builder>
            </div>
            <!-- 步骤3 -->
            <div class="body step-3" v-if="steps[activeStep].index === 3">
              <div class="mb-8">
                <span class="title">任务设置</span>
                <span class="desc">
                  用户可以在任务设置步骤对任务名称、同步类型、遇错处理等进行设置，具体配置说明请查看帮助文档
                </span>
              </div>
              <form-builder
                ref="setting"
                v-model="settingModel"
                :config="config"
                class="form-builder"
                style="width: 820px"
                @submit.native.prevent
                @value-change="formChangeSetting"
              >
              </form-builder>
            </div>
            <!-- 步骤4 -->
            <div class="body step-4" v-if="steps[activeStep].index === 4">
              <div class="mb-6">
                <span class="title">选择表</span>
                <span class="desc">
                  用户可以在此页面勾选源端待同步表，点击中间向右的箭头按钮，将这些表移动到待同步表队列中（任务执行后将对这些表执行同步传输），鼠标移入表名可以对表进行改名操作，点击完成按钮即成功创建同步任务。
                </span>
              </div>
              <div class="CT-task-transfer">
                <Transfer ref="transfer" :transferData="transferData" :isTwoWay="settingModel.bidirectional"></Transfer>
              </div>
            </div>
            <!-- 步骤5 -->
            <div class="step-5" v-if="steps[activeStep].index === 5">
              <FieldMapping
                ref="fieldMappingDom"
                :remoteMethod="intiFieldMappingTableData"
                :typeMappingMethod="getTypeMapping"
                :hiddenFieldProcess="false"
                :fieldMappingNavData="fieldMappingNavData"
                :fieldProcessMethod="updateFieldProcess"
                :field_process="transferData.field_process"
                @row-click="saveOperations"
                @update-nav="updateFieldMappingNavData"
              ></FieldMapping>
            </div>
          </el-main>
          <div :class="['pb-6', 'px-6', 'btns-step-' + steps[activeStep].index]">
            <v-button
              v-if="steps[activeStep].showNextBtn"
              type="primary"
              class="btn-step"
              :loading="loading"
              @mousedown.native.prevent="next()"
            >
              <span>{{ $t('guide.btn_next') }}</span>
            </v-button>
            <v-button
              v-if="steps[activeStep].showSaveBtn"
              type="primary"
              class="btn-step"
              :loading="loading"
              @click="save()"
            >
              完成
            </v-button>
            <v-button class="btn-step" v-if="steps[activeStep].showExitBtn" @click="goBackList()"> 取消 </v-button>
            <v-button
              class="btn-step"
              :loading="loading"
              v-else-if="steps[activeStep].showBackBtn || (steps[activeStep].index === 3 && !id)"
              @click="back()"
            >
              {{ $t('guide.btn_back') }}
            </v-button>
          </div>
        </div>
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
}
</style>
<style lang="scss" scoped>
.CT-task-wrap {
  //padding: 0 20px;
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
  .task-container {
    overflow-y: auto;
    &.task-container-5 {
      flex: 1;
      .task-container-box {
        display: flex;
        flex-direction: column;
        position: relative;
      }
      .CT-task-main {
        margin-bottom: 0;
        padding: 24px 0 0;
      }
      ::v-deep {
        .field-mapping {
          .field-mapping__desc,
          .search {
            padding-left: 24px;
          }
          .search {
            margin-top: 24px;
          }
          .field-mapping-table {
            padding-bottom: 50px;
          }
        }
      }
    }
  }
  .CT-task-main {
    padding: 24px 24px 0;
    background: #fff;
    overflow: hidden;
    &:not(.task-main-5) {
      overflow-y: auto;
    }
    .body {
      .title {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.85);
      }
      .desc {
        margin-left: 16px;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.5);
      }
      .reload-schema {
        padding: 0 200px;
        margin-top: 10px;
      }
      .CT-task-transfer {
        margin-bottom: 24px;
      }
    }
    .dataSource-title {
      font-size: 16px;
      font-weight: bold;
      margin: 10px 0;
    }
    .step-5 {
      height: 100%;
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
          border-top: 1px solid #f2f2f2;
          border-right: 1px solid #f2f2f2;
          background: rgba(44, 101, 255, 0.05);
          li {
            height: 115px;
            background: #ffffff;
            box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.02);
            border-radius: 4px;
            border-bottom: 1px solid #f2f2f2;
          }
        }
      }
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
}
.steps-header {
  margin: 0 20px;
  padding: 20px 0 0;
  border-bottom: 1px solid #f2f2f2;
}
.btns-step-5 {
  position: absolute;
  right: 0;
  bottom: 0;
  text-align: right;
}
.el-main {
  padding: 24px 0 0;
}
.form-builder {
  ::v-deep {
    .e-form-builder-item {
      .el-form-item__content {
        padding-bottom: 32px;
        height: 32px;
        .el-input__inner {
          background: #f9fafd;
          &:focus {
            background: unset;
          }
        }
        .el-input__count-inner {
          background-color: unset;
        }
      }
      &.sync-type-item,
      &.distinct-write-type-item,
      &.auto-ddl-item {
        margin-bottom: 24px;
      }
      &.read-batch-size {
        .el-input__inner {
          width: 277px;
        }
      }
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
</style>
<script>
import formConfig from './config'
import Transfer from './Transfer'
import { SETTING_MODEL, INSTANCE_MODEL, DFSDATASOURCE_MODEL } from './const'

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
      isFirst: true,
      twoWayAgentRunningCount: '',
      platformInfo: JSON.parse(JSON.stringify(INSTANCE_MODEL)),
      dataSourceModel: JSON.parse(JSON.stringify(DFSDATASOURCE_MODEL)),
      settingModel: JSON.parse(JSON.stringify(SETTING_MODEL)),
      mappingModel: {},
      config: {
        form: {
          labelPosition: 'left',
          labelWidth: '80px',
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
      ],
      //表设置
      fieldMappingNavData: '',
      fieldMappingTableData: '',
      hiddenFieldMapping: false,
      taskStep: 0
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
        labelColon: true,
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
              } else {
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
                this.$axios
                  .get('tm/api/DataFlows?filter=' + encodeURIComponent(JSON.stringify(filter)))
                  .then(({ items }) => {
                    if (items?.total > 0) {
                      callback(new Error('任务名称已存在'))
                    } else callback()
                  })
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
  watch: {
    config(v) {
      console.log('watch-config', v)
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
  methods: {
    //是否支持双向前提
    getAgentCount() {
      this.$axios.get('api/tcm/agent/agentCount').then(data => {
        this.twoWayAgentRunningCount = data.twoWayAgentRunningCount || 0
      })
    },
    //兼容新手引导
    handleCreateDatabase() {
      this.$router.push({
        name: 'Connection',
        query: {
          action: 'create'
        }
      })
    },
    //初始化数据 编辑跳转
    intiData(id) {
      this.$axios.get('tm/api/DataFlows/' + id).then(data => {
        this.status = data.status
        this.settingModel = Object.assign(this.settingModel, data.setting)
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
    getSteps() {
      this.steps = []
      if (this.id && this.hiddenFieldMapping) {
        //编辑模式 无字段映射功能
        this.steps = [
          { index: 3, text: '任务设置', type: 'setting', showExitBtn: true, showNextBtn: true },
          { index: 4, text: '映射设置', type: 'mapping', showBackBtn: true, showSaveBtn: true }
        ]
      } else if (!this.id && !this.hiddenFieldMapping) {
        this.steps = [
          { index: 2, text: '选择源端与目标端连接', type: 'dataSource', showExitBtn: true, showNextBtn: true }, //创建模式 有字段功能
          { index: 3, text: '任务设置', type: 'setting', showBackBtn: true, showNextBtn: true },
          { index: 4, text: '映射设置', type: 'mapping', showBackBtn: true, showNextBtn: true },
          { index: 5, text: '表设置', type: 'table', showBackBtn: true, showSaveBtn: true }
        ]
      } else if (this.id && !this.hiddenFieldMapping) {
        this.steps = [
          { index: 3, text: '任务设置', type: 'setting', showExitBtn: true, showNextBtn: true }, //编辑模式 有字段功能
          { index: 4, text: '映射设置', type: 'mapping', showBackBtn: true, showNextBtn: true },
          { index: 5, text: '表设置', type: 'table', showBackBtn: true, showSaveBtn: true }
        ]
      } else if (!this.id && this.hiddenFieldMapping) {
        this.steps = [
          { index: 2, text: '选择源端与目标端连接', type: 'dataSource', showExitBtn: true, showNextBtn: true }, //创建模式 无字段功能
          { index: 3, text: '任务设置', type: 'setting', showBackBtn: true, showNextBtn: true },
          { index: 4, text: '映射设置', type: 'mapping', showBackBtn: true, showSaveBtn: true }
        ]
      }
    },
    //下一步
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
      if (type === 'mapping') {
        this.transferData = this.$refs.transfer.returnData()
        if (this.transferData.selectSourceArr.length === 0) {
          this.$message.error('请先选择需要同步的表,若选择的数据源没有表请先在数据库创建表')
          return
        }
        this.fieldProcess()
      }
      this.taskStep++
    },
    back() {
      let type = this.steps[this.activeStep].type || 'instance'
      //将复制表内容存起来
      if (type === 'mapping') {
        this.transferData = this.$refs.transfer.returnData()
      }
      //当前表的字段映射保存
      if (type === 'table') {
        //保存字段映射
        let returnData = this.$refs.fieldMappingDom.returnData(true)
        let deleteLen = returnData.target.filter(v => !v.is_deleted)
        if (deleteLen.length !== 0) {
          this.saveOperations()
        }
      }
      this.activeStep -= 1
      this.taskStep--
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
          if (this.dataSourceModel['target_databaseType'] === 'kafka') {
            this.changeConfig([], 'setting_distinctWriteType')
          }
          //判断是否有第五步
          this.$axios
            .get('tm/api/typeMappings/dataType?databaseType=' + this.dataSourceModel.target_databaseType)
            .then(data => {
              if (data?.length === 0) {
                this.hiddenFieldMapping = true
                this.getSteps()
              }
            })
          break
        }
        case 'mapping': {
          this.getSchema()
          break
        }
      }
    },
    //获取schema
    getSchema() {
      let id = this.dataSourceModel.source_connectionId || ''
      this.$nextTick(() => {
        this.$refs.transfer.getTable(id, this.settingModel.bidirectional)
        this.$refs.transfer.showOperation(this.settingModel.bidirectional || false) //双向模式不可以更改表名
      })
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
        this.changeConfig(data || [], type, reset)
      })
    },
    //change config
    changeConfig(data, type, reset = false) {
      let items = this.config.items
      switch (type) {
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
        case 'setting_distinctWriteType': {
          //kafka 作为目标 不支持删除模式
          let op = items.find(it => it.field === 'distinctWriteType')
          if (op) {
            op.options = [
              {
                label: '更新写入模式',
                tip: '更新写入模式会判断源端的每条数据在目标端是否存在，若存在则更新，不存在则新增。',
                value: 'intellect'
              }
            ]
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
            let filterArr = ['redis', 'elasticsearch', 'dameng']
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
    //预存数据
    daft() {
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
        platformInfo: Object.assign(this.platformInfo, {
          agentType: 'private'
        })
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
      if (this.hiddenFieldMapping) {
        //没有第五步 表设置 需要主动调用 transfer.returnData
        this.transferData = this.$refs.transfer.returnData()
      }
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
      return postData
    },
    //save
    save() {
      if (this.loading) {
        return
      }
      //保存字段映射
      if (!this.hiddenFieldMapping) {
        let returnData = this.$refs.fieldMappingDom.returnData()
        if (!returnData.valid) return //检验不通过
        let deleteLen = returnData.target.filter(v => !v.is_deleted)
        if (deleteLen.length === 0) {
          this.$message.error('当前表被删除了所有字段，不允许保存操作')
          return //所有字段被删除了 不可以保存任务
        }
        this.saveOperations(returnData.row, returnData.operations, returnData.target)
      }
      let postData = this.daft()
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
          if (e.response?.msg === 'duplication for names') {
            this.$message.error(this.$t('message.exists_name'))
          } else {
            this.$message.error(e.response?.msg || e.data?.msg)
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
      this.$confirm('此操作会丢失当前正在创建/编辑的任务', '是否放弃创建/编辑该任务', {
        type: 'warning'
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        this.routerBack()
      })
    },
    //表设置
    fieldProcess() {
      this.loading = true
      let data = this.getDataFlowData()
      if (!data) return
      if (this.isFirst && !this.id) {
        data['rollback'] = 'all'
      } else {
        delete data['rollback']
        delete data['rollbackTable'] //确保不会有恢复默认
      }
      let promise = this.$axios.post('tm/api/DataFlows/metadata', data)
      promise.then(data => {
        this.activeStep += 1
        this.loading = false
        this.isFirst = false
        this.fieldMappingNavData = data
      })
      promise.catch(() => {
        this.loading = false
        this.$message.error('模型推演失败')
      })
    },
    //恢复默认
    async updateFieldProcess(rollback, rollbackTable, id) {
      let data = this.getDataFlowData()
      if (!data) return
      if (rollback === 'all') {
        data['rollback'] = rollback
        //删除整个字段处理器
        this.transferData.field_process = []
      } else if (rollbackTable) {
        data['rollback'] = rollback
        data['rollbackTable'] = rollbackTable
        for (let i = 0; i < this.transferData.field_process.length; i++) {
          // 删除操作
          let ops = this.transferData.field_process[i]
          if (ops.table_id === id) {
            this.transferData.field_process.splice(i, 1)
          }
        }
      }
      let result = this.updateAutoFieldProcess(data) //更新字段处理器
      let promise = await this.$axios.post('tm/api/DataFlows/metadata', result)
      return promise
    },
    //获取当前任务所有的节点
    getDataFlowData() {
      //手动同步更新字段处理器
      let data = this.daft()
      let result = this.updateAutoFieldProcess(data)
      return result
    },
    updateAutoFieldProcess(data) {
      if (data.stages[0]) {
        data['stages'][0].field_process = this.transferData.field_process
      }
      return data
    },
    //更新左边导航
    updateFieldMappingNavData(data) {
      this.fieldMappingNavData = data
    },
    //获取表设置
    async intiFieldMappingTableData(row) {
      let source = await this.$axios.get(
        'tm/api/MetadataInstances/originalData?qualified_name=' + row.sourceQualifiedName
      )
      source = source && source.length > 0 ? source[0].fields : []
      let target = await this.$axios.get(
        'tm/api/MetadataInstances/originalData?isTarget=true&qualified_name=' + row.sinkQulifiedName
      )
      // 初始化所有字段都映射 只取顶级字段
      source = source.filter(field => field.field_name.indexOf('.') === -1)
      target = target && target.length > 0 ? target[0].fields : []
      //源表 目标表数据组合
      let fieldMappingTableData = []
      source.forEach(item => {
        target.forEach(field => {
          //先检查是否被改过名
          let node = {
            t_id: field.id,
            t_field_name: field.field_name,
            t_data_type: field.data_type,
            t_scale: field.scale,
            t_precision: field.precision,
            is_deleted: field.is_deleted, //目标决定这个字段是被删除？
            t_isPrecisionEdit: true, //默认不能编辑
            t_isScaleEdit: true //默认不能编辑
          }
          let ops = this.handleFieldName(row, field.field_name)
          if (item.field_name === field.field_name) {
            fieldMappingTableData.push(Object.assign({}, item, node))
          }
          if (!ops || ops?.length === 0) return
          ops = ops[0]
          if (ops.operand === field.field_name && ops.original_field_name === item.field_name) {
            fieldMappingTableData.push(Object.assign({}, item, node))
          }
        })
      })
      return {
        data: fieldMappingTableData,
        target: target
      }
    },
    //判断是否改名
    getFieldOperations(row) {
      let operations = []
      if (!this.transferData.field_process || this.transferData.field_process.length === 0) return
      let field_process = this.transferData.field_process.filter(process => process.table_id === row.sourceTableId)
      if (field_process.length > 0) {
        operations = field_process[0].operations ? JSON.parse(JSON.stringify(field_process[0].operations)) : []
      }
      return operations || []
    },
    //判断是否改名
    handleFieldName(row, fieldName) {
      let operations = this.getFieldOperations(row)
      if (!operations) return
      let ops = operations.filter(op => op.operand === fieldName && op.op === 'RENAME')
      return ops
    },
    //获取typeMapping
    async getTypeMapping(row) {
      let data = await this.$axios.get('tm/api/typeMappings/dataType?databaseType=' + row.sinkDbType)
      return data
    },
    //保存字段处理器
    saveOperations(row, operations, target) {
      if (!target || target?.length === 0) return
      let where = {
        qualified_name: row.sinkQulifiedName
      }
      let data = {
        fields: target
      }
      if (typeof where === 'object') where = JSON.stringify(where)
      this.axios.post('tm/api/MetadataInstances/update?where=' + encodeURIComponent(where), data)
      this.transferData.field_process = this.$refs.fieldMappingDom.saveFileOperations()
    }
  }
}
</script>
