<template>
  <ElContainer class="create-task-wrap bg-white" v-if="steps[activeStep]">
    <ElContainer style="overflow: hidden; flex: 1" class="create-task-container flex-column">
      <div class="steps-header">
        <ElSteps
          class="primary pb-6"
          :active="activeStep"
          process-status="process"
          finish-status="success"
          align-center
        >
          <ElStep title="选择连接"></ElStep>
          <ElStep title="设置任务属性"></ElStep>
          <ElStep title="选择表"></ElStep>
        </ElSteps>
      </div>
      <ElContainer :class="['task-container', 'task-container-' + steps[activeStep].index]">
        <div class="task-container-box flex-fill flex flex-column w-100">
          <ElMain :class="['create-task-main', 'task-main-' + steps[activeStep].index]">
            <!--步骤1-->
            <div class="body" v-if="steps[activeStep].index === 1">
              <div class="mb-8">
                <span class="title font-weight-bold">选择连接</span>
                <span class="desc">
                  如果你还未添加数据源，请点击添加数据源按钮进行添加，为了方便你的测试，我们建议数据源的数量不少2个<span
                    style="color: #337dff; cursor: pointer"
                    @click="handleCreateDatabase"
                  >
                    前往连接管理创建连接</span
                  >
                </span>
              </div>
              <DataSource ref="dataSource" :dataSourceData="dataSourceData" @submit="dataSourceSubmit"></DataSource>
            </div>
            <!-- 步骤2 -->
            <div class="body step-3" v-if="steps[activeStep].index === 2">
              <div class="mb-8">
                <span class="title">任务设置</span>
                <span class="desc">
                  用户可以在任务设置步骤对任务名称、同步类型、遇错处理等进行设置，具体配置说明请查看帮助文档
                </span>
              </div>
              <Setting :dataSourceData="dataSourceData" :settingData="settingData" @submit="settingSubmit"></Setting>
            </div>
            <!-- 步骤3 -->
            <div class="body step-4" v-if="steps[activeStep].index === 3">
              <div class="mb-6">
                <span class="title">选择表</span>
                <span class="desc">
                  用户可以点击中间向右的箭头按钮勾选源端待同步表，将这些表移动到待同步表队列中（任务执行后将对这些表执行同步传输）
                </span>
                <FieldMapping
                  v-if="showFieldMapping"
                  ref="fieldMapping"
                  class="fr"
                  mappingType="cluster-clone"
                  :transform="transform"
                  :getDataFlow="daft"
                  @update-first="returnModel"
                  @returnFieldMapping="returnFieldMapping"
                ></FieldMapping>
              </div>
              <div class="create-task-transfer">
                <Transfer
                  ref="transfer"
                  :transferData="transferData"
                  :sourceId="sourceId"
                  :mqTransferFlag="mqTransferFlag"
                  :isTwoWay="true"
                ></Transfer>
              </div>
            </div>
          </ElMain>
          <div class="create-task-footer py-6 mx-6" :class="['btns-step-' + steps[activeStep].index]">
            <VButton class="btn-step" v-if="steps[activeStep].showExitBtn" @click="goBackList()"> 取消 </VButton>
            <VButton
              class="btn-step"
              :loading="loading"
              v-else-if="steps[activeStep].showBackBtn || (steps[activeStep].index === 2 && !id)"
              @click="previous()"
            >
              {{ $t('guide.btn_back') }}
            </VButton>
            <VButton
              v-if="steps[activeStep].showNextBtn"
              type="primary"
              class="btn-step"
              :loading="loading"
              @mousedown.native.prevent="nextStep()"
            >
              <span>{{ $t('guide.btn_next') }}</span>
            </VButton>
            <VButton
              v-if="steps[activeStep].showSaveBtn"
              type="primary"
              class="btn-step"
              :loading="loadingSave"
              @click="save()"
            >
              完成
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
import FieldMapping from '../../../../components/field-mapping/main'
import { DATASOURCE_MODEL, SETTING_MODEL, TRANSFER_MODEL } from './const'

export default {
  components: { Transfer, DataSource, Setting, FieldMapping },
  data() {
    return {
      steps: [],
      activeStep: 0,
      id: '',
      loading: false,
      //第一步 配置源端
      dataSourceData: DATASOURCE_MODEL,
      sourceId: '',
      dataSourceVerify: false,
      showSysncTableTip: false,
      //第二步 配置任务设置
      settingData: SETTING_MODEL,
      //第三步 映射表
      transferData: TRANSFER_MODEL,
      mqTransferFlag: false,
      showFieldMapping: false, //是否支持字段映射
      isFirst: false,
      transform: {
        showBtn: true,
        nodeId: '',
        field_process: [],
        fieldsNameTransform: '',
        batchOperationList: []
      },
      nodes: [],
      //保存
      loadingSave: false
    }
  },
  created() {
    this.getSteps()
    this.id = this.$route.params.id
    if (this.id) {
      this.intiData(this.id)
    }
  },

  methods: {
    //编辑模式
    intiData(id) {
      this.$api('Task')
        .getId([id])
        .then(res => {
          if (res) {
            let data = res?.data
            this.status = data.status
            this.settingData = Object.assign(this.settingData, data.attrs?.task_setting_Data)
            this.settingData.name = data.name
            this.dataSourceData = data?.attrs?.task_data_source_Data
            this.nodes = data?.dag?.nodes
            let syncObjects = this.nodes[1].syncObjects
            this.transferData = {
              table_prefix: this.nodes[1].table_prefix,
              table_suffix: this.nodes[1].table_suffix,
              tableNameTransform: this.nodes[1].tableNameTransform,
              fieldsNameTransform: this.nodes[1].fieldsNameTransform,
              field_process: this.nodes[0].field_process,
              selectSourceArr: syncObjects[0] ? syncObjects[0].objectNames : [],
              topicData:
                syncObjects[0]?.type === 'topic' ? syncObjects[0].objectNames : syncObjects[1]?.objectNames || [],
              queueData:
                syncObjects[0]?.type === 'queue' ? syncObjects[0].objectNames : syncObjects[1]?.objectNames || []
            }
            //编辑时不被覆盖
            this.tableNameTransform = this.nodes[1].tableNameTransform
            this.fieldsNameTransform = this.nodes[1].fieldsNameTransform
          }
        })
    },
    getSteps() {
      this.steps = []
      if (this.id) {
        //编辑模式 没有第一步
        this.steps = [
          { index: 2, text: this.$t('task_form_task_setting'), type: 'setting', showExitBtn: true, showNextBtn: true },
          {
            index: 3,
            text: this.$t('task_form_mapping_setting'),
            type: 'mapping',
            showBackBtn: true,
            showSaveBtn: true
          }
        ]
      } else {
        this.steps = [
          {
            index: 1,
            text: this.$t('task_form_source_target_connection'),
            type: 'dataSource',
            showExitBtn: true,
            showNextBtn: true
          },
          { index: 2, text: this.$t('task_form_task_setting'), type: 'setting', showBackBtn: true, showNextBtn: true },
          {
            index: 3,
            text: this.$t('task_form_mapping_setting'),
            type: 'mapping',
            showBackBtn: true,
            showSaveBtn: true
          }
        ]
      }
    },
    previous() {
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
              this.$message.info('源端、目标端选择了相同连接')
            }
            //检验: 是否是MQ数据源
            if (this.dataSourceData['target_databaseType'] === 'mq' && this.dataSourceData['mqType'] === '0') {
              this.mqTransferFlag = true
            } else {
              this.mqTransferFlag = false
            }
            //数据: 第三步请求schema用到sourceId
            this.sourceId = this.dataSourceData.source_connectionId
            this.activeStep++
          }
          break
        case 'setting':
          this.tranModelVersionControl() //是否支持字段映射
          this.activeStep++
          break
      }
    },
    //第一步 选择源端
    dataSourceSubmit(verify) {
      this.dataSourceVerify = verify
    },
    handleCreateDatabase() {
      this.$router.push({
        name: 'connections'
      })
    },
    //第二步 任务设置配置
    settingSubmit(form) {
      this.settingData = { ...form.values }
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
    tranModelVersionControl() {
      //是否显示字段推演
      let data = this.daft()
      let nodeId = data?.dag?.nodes?.[1]?.id || ''
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
    //接收是否第一次打开
    returnModel(value) {
      this.isFirst = value
    },
    // 字段处理器返回前后缀
    returnPreFixSuffix(data) {
      this.transform.fieldsNameTransform = data.fieldsNameTransform
      this.transform.batchOperationList = data.batchOperationList
    },
    returnFieldMapping(field_process) {
      this.transform.field_process = field_process
    },
    handleError(error) {
      if (error?.data?.message) {
        this.$message.error(error.data.message)
      } else {
        // eslint-disable-next-line no-console
        console.error(error)
        this.$message.error('出错了')
      }
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
      this.dataSourceData['syncPoints'] = syncPoints
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
        dataFlowType: 'normal' //区分创建方式
      }
      postData = Object.assign({}, postData, this.settingData)
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
        postData.status = this.status || 'paused'
        //编辑状态nodes只做变更
        sourceIdA = this.nodes[0]?.id
        targetIdB = this.nodes[1]?.id
        postData.id = this.id
      } else {
        sourceIdA = this.$util.uuid()
        targetIdB = this.$util.uuid()
      }
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
            field_process: this.transform.field_process
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
            table_prefix: this.transferData.table_prefix,
            table_suffix: this.transferData.table_suffix,
            tableNameTransform: this.transferData.tableNameTransform,
            fieldsNameTransform: this.transferData.fieldsNameTransform
          }
        )
      ]
      this.transform.nodeId = targetIdB
      return postData
    },
    save() {
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
    }
  }
}
</script>
<style lang="scss">
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
.create-task-wrap {
  //padding: 0 20px;
  height: 0;
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
              background-color: #fafafa;
            }
          }
        }
      }
    }
  }
  .create-task-main {
    padding: 24px 24px 0;
    background: #fff;
    overflow-y: auto;
    font-size: 14px;
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
      .create-task-transfer {
        margin-bottom: 24px;
        flex: 1;
        overflow: hidden;
        min-height: 290px;
        ::v-deep {
          .el-transfer-panel__header {
            background: rgba(44, 101, 255, 0.05);
            height: 54px;
            line-height: 54px;
            .el-checkbox {
              height: 54px;
              line-height: 54px;
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
  .create-task-footer {
    border-top: 1px solid #f2f2f2;
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
  border-bottom: 1px solid #f2f2f2;
}
.el-main {
  padding: 24px 0 0;
}
</style>
