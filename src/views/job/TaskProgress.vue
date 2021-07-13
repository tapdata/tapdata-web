<template>
  <div class="task-progress">
    <!-- v-if="$window.getSettingByKey('DFS_TCM_PLATFORM') === 'dfs'" -->
    <template>
      <!--  全量+增量  -->
      <div class="progress-container" v-if="dataFlowSettings.sync_type === 'initial_sync+cdc'">
        <div class="progress-container__header flex justify-between">
          <div class="fw-bolder">任务进度概览</div>
          <el-button class="progress-header_btn" type="text" @click="handleInfo">查看详情</el-button>
        </div>
        <div class="progress-container__body flex">
          <div class="progress-container__img">
            <img :src="require('@/assets/images/tu.png')" />
          </div>
          <div class="progress-container__overview ml-6">
            <el-row>
              <el-col :span="24" class="flex"
                ><span>全量+增量同步任务进度：</span
                ><el-progress class="el-progress" :percentage="progressBar"></el-progress>
              </el-col>
            </el-row>
            <el-row class="mt-3">
              <el-col :span="12">
                <span>预计全量完成还需时间：</span>
                <span class="ml-3 color-green">全量已完成</span>
              </el-col>
              <el-col :span="12">
                <span>全量状态：</span>
                <span class="ml-3 color-green">{{ overviewStats.status }}</span>
              </el-col>
            </el-row>
          </div>
        </div>
        <div class="progress-container__footer mt-border">
          <!-- <el-row class="footer-line">
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">源库名称：</span>
              <span class="footer-item__value">{{ overviewStats.sourceName }}</span>
            </el-col>
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">目标库名称：</span>
              <span class="footer-item__value">{{ overviewStats.targetName }}</span>
            </el-col>
          </el-row>
          <el-row class="footer-line">
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">源库类型：</span>
              <span class="footer-item__value">{{ overviewStats.sourceType }}</span>
            </el-col>
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">目标库类型：</span>
              <span class="footer-item__value">{{ overviewStats.targatType }}</span>
            </el-col>
          </el-row> -->
          <el-row class="footer-line">
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">待迁移表总数：</span>
              <span class="footer-item__value">{{ overviewStats.sourceTableNum }}</span>
            </el-col>
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">已完成迁移表数：</span>
              <span class="footer-item__value">{{ overviewStats.waitingForSyecTableNums }}</span>
            </el-col>
          </el-row>
          <el-row class="footer-line">
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">总数据量（行）：</span>
              <span class="footer-item__value">{{ overviewStats.sourceRowNum }}</span>
            </el-col>
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">已迁移数据量（行）：</span>
              <span class="footer-item__value">{{ overviewStats.targatRowNum }}</span>
            </el-col>
          </el-row>
          <!-- <el-row class="footer-line">
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">增量所处时间点：</span>
              <span class="footer-item__value">{{ overviewStats.spendTime }}</span>
            </el-col>
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">增量延迟：</span>
              <span class="footer-item__value">{{ overviewStats.spendTime }}</span>
            </el-col>
          </el-row> -->
        </div>
      </div>
      <!--  全量  -->
      <div class="progress-container" v-else-if="dataFlowSettings.sync_type === 'initial_sync'">
        <div class="progress-container__header flex justify-between">
          <div class="fw-bolder">任务进度概览</div>
          <el-button class="progress-header_btn" type="text" @click="handleInfo">查看详情</el-button>
        </div>
        <div class="progress-container__body flex">
          <div class="progress-container__img">
            <img :src="require('@/assets/images/tu.png')" />
          </div>
          <div class="progress-container__overview ml-6">
            <el-row>
              <el-col :span="24" class="flex"
                ><span>全量+增量同步任务进度：</span
                ><el-progress class="el-progress" :percentage="progressBar"></el-progress>
              </el-col>
            </el-row>
            <el-row class="mt-3">
              <el-col :span="12">
                <span>预计全量完成还需时间：</span>
                <span class="ml-3 color-green">全量已完成</span>
              </el-col>
              <el-col :span="12">
                <span>全量状态：</span>
                <span class="ml-3 color-green">{{ overviewStats.status }}</span>
              </el-col>
            </el-row>
          </div>
        </div>
        <div class="progress-container__footer mt-border">
          <!-- <el-row class="footer-line">
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">源库名称：</span>
              <span class="footer-item__value">{{ overviewStats.sourceName }}</span>
            </el-col>
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">目标库名称：</span>
              <span class="footer-item__value">{{ overviewStats.targetName }}</span>
            </el-col>
          </el-row>
          <el-row class="footer-line">
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">源库类型：</span>
              <span class="footer-item__value">{{ overviewStats.sourceType }}</span>
            </el-col>
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">目标库类型：</span>
              <span class="footer-item__value">{{ overviewStats.targatType }}</span>
            </el-col>
          </el-row> -->
          <el-row class="footer-line">
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">待迁移表总数：</span>
              <span class="footer-item__value">{{ overviewStats.sourceTableNum }}</span>
            </el-col>
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">已完成迁移表数：</span>
              <span class="footer-item__value">{{ overviewStats.waitingForSyecTableNums }}</span>
            </el-col>
          </el-row>
          <el-row class="footer-line">
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">总数据量（行）：</span>
              <span class="footer-item__value">{{ overviewStats.sourceRowNum }}</span>
            </el-col>
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">已迁移数据量（行）：</span>
              <span class="footer-item__value">{{ overviewStats.targatRowNum }}</span>
            </el-col>
          </el-row>
        </div>
      </div>
      <!--  增量  -->
      <div class="progress-container" v-else-if="dataFlowSettings.sync_type === 'cdc'">
        <div class="progress-container__header flex justify-between">
          <div class="fw-bolder">任务进度概览</div>
          <el-button class="progress-header_btn" type="text" @click="handleInfo">查看详情</el-button>
        </div>
        <div class="progress-container__footer">
          <!-- <el-row class="footer-line">
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">源库名称：</span>
              <span class="footer-item__value">{{ overviewStats.sourceName }}</span>
            </el-col>
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">目标库名称：</span>
              <span class="footer-item__value">{{ overviewStats.targetName }}</span>
            </el-col>
          </el-row>
          <el-row class="footer-line">
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">源库类型：</span>
              <span class="footer-item__value">{{ overviewStats.sourceType }}</span>
            </el-col>
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">目标库类型：</span>
              <span class="footer-item__value">{{ overviewStats.targatType }}</span>
            </el-col>
          </el-row> -->
          <el-row class="footer-line">
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">待迁移表总数：</span>
              <span class="footer-item__value">{{ overviewStats.sourceTableNum }}</span>
            </el-col>
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">已完成迁移表数：</span>
              <span class="footer-item__value">{{ overviewStats.waitingForSyecTableNums }}</span>
            </el-col>
          </el-row>
          <el-row class="footer-line">
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">总数据量（行）：</span>
              <span class="footer-item__value">{{ overviewStats.sourceRowNum }}</span>
            </el-col>
            <el-col class="footer-item" :span="12">
              <span class="footer-item__name">已迁移数据量（行）：</span>
              <span class="footer-item__value">{{ overviewStats.targatRowNum }}</span>
            </el-col>
          </el-row>
        </div>
      </div>
    </template>
  </div>
</template>
<script>
// import factory from '@/api/factory'

// const dataFlowsAPI = factory('DataFlows')

export default {
  name: 'TaskProgress',
  props: {
    dataFlow: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      progressBar: 0,
      overviewStats: {}
      // dataFlow: {
      //   createTime: '2021-07-13T06:54:16.963Z',
      //   last_updated: '2021-07-13T06:55:08.099Z',
      //   id: '60ed3898586ac90061426893',
      //   name: 'The_new_task_1e669a3',
      //   description: '',
      //   status: 'paused',
      //   executeMode: 'normal',
      //   category: '数据库克隆',
      //   stopOnError: false,
      //   mappingTemplate: 'cluster-clone',
      //   emailWaring: {
      //     edited: true,
      //     started: false,
      //     error: true,
      //     paused: false
      //   },
      //   stages: [
      //     {
      //       id: '66ee272f-9efb-48f4-bc34-187d141d3959',
      //       inputLanes: [],
      //       outputLanes: ['32690238-f77a-473e-b434-f6af04d57175'],
      //       connectionId: '60ed3820586ac90061426730',
      //       includeTables: [],
      //       dropTable: false,
      //       type: 'database',
      //       database_type: 'mysql',
      //       table_prefix: '',
      //       table_suffix: '',
      //       dropType: 'no_drop',
      //       syncObjects: [],
      //       mqType: '',
      //       shapeImage: 'static/editor/o-mysql.svg',
      //       name: 'mysql-183-33063-insurance',
      //       removeAllTables: false,
      //       readCdcInterval: 500,
      //       readBatchSize: 1000,
      //       statsStatus: 'initialized'
      //     },
      //     {
      //       id: '32690238-f77a-473e-b434-f6af04d57175',
      //       inputLanes: ['66ee272f-9efb-48f4-bc34-187d141d3959'],
      //       outputLanes: [],
      //       connectionId: '60ed3887586ac90061426873',
      //       includeTables: [],
      //       dropTable: false,
      //       type: 'database',
      //       database_type: 'mongodb',
      //       table_prefix: '',
      //       table_suffix: '',
      //       dropType: 'drop_data',
      //       syncObjects: [{ type: 'table', objectNames: ['CAR_CLAIM', 'CAR_CUSTOMER', 'CAR_POLICY', 'CLAIM'] }],
      //       mqType: '',
      //       shapeImage: 'static/editor/o-mongo.svg',
      //       name: 'mongo-183-24023-kai',
      //       removeAllTables: false,
      //       readCdcInterval: 500,
      //       readBatchSize: 1000,
      //       statsStatus: null
      //     }
      //   ],
      //   setting: {
      //     isSerialMode: false,
      //     sync_type: 'initial_sync',
      //     readBatchSize: 1000,
      //     notificationWindow: 0,
      //     notificationInterval: 300,
      //     readCdcInterval: 500,
      //     maxTransactionLength: 12,
      //     description: '',
      //     cdcFetchSize: 1,
      //     distinctWriteType: 'intellect',
      //     drop_target: false,
      //     run_custom_sql: false,
      //     needToCreateIndex: true,
      //     increment: false,
      //     isSchedule: false,
      //     cronExpression: '',
      //     isOpenAutoDDL: false,
      //     cdcConcurrency: false,
      //     cdcShareFilterOnServer: false,
      //     emailWaring: { edited: false, started: false, error: true, paused: true },
      //     readShareLogMode: 'STREAMING',
      //     stopOnError: true,
      //     syncPoints: [{ connectionId: '', type: 'current', time: '', date: '', name: '', timezone: '+8' }],
      //     processorConcurrency: 1,
      //     transformerConcurrency: 8,
      //     lagTimeFalg: false,
      //     userSetLagTime: 0,
      //     editDisable: false
      //   },
      //   editorData:
      //     '{"cells":[{"type":"app.Database","form_data":{"connectionId":"60ed3820586ac90061426730","includeTables":[],"dropTable":false,"type":"database","database_type":"mysql","table_prefix":"","table_suffix":"","dropType":"no_drop","syncObjects":[],"mqType":"","shapeImage":"static/editor/o-mysql.svg","name":"mysql-183-33063-insurance","removeAllTables":false},"freeTransform":false,"size":{"width":160,"height":36},"ports":{"groups":{"l":{"position":{"name":"left"},"attrs":{"circle":{"magnet":true,"fill":"#fff","stroke":"#dedee4","strokeWidth":1,"r":5}}},"r":{"position":{"name":"right"},"attrs":{"circle":{"magnet":true,"fill":"#fff","stroke":"#dedee4","strokeWidth":1,"r":5}}},"t":{"position":{"name":"top"},"attrs":{"circle":{"magnet":true,"fill":"#fff","stroke":"#dedee4","strokeWidth":1,"r":5}}},"b":{"position":{"name":"bottom"},"attrs":{"circle":{"magnet":true,"fill":"#fff","stroke":"#dedee4","strokeWidth":1,"r":5}}}},"items":[{"id":"cf293bae-6ec1-4b93-addd-60590178a5e9_l","group":"l"},{"id":"cf293bae-6ec1-4b93-addd-60590178a5e9_r","group":"r","attrs":{"circle":{"fill":"#fff","stroke":"#dedee4","stroke-width":1,"r":5,"visibility":"visible"}}},{"id":"cf293bae-6ec1-4b93-addd-60590178a5e9_t","group":"t"},{"id":"cf293bae-6ec1-4b93-addd-60590178a5e9_b","group":"b"}]},"schema":null,"outputSchema":null,"config":null,"position":{"x":-90,"y":180},"angle":0,"id":"66ee272f-9efb-48f4-bc34-187d141d3959","z":1,"attrs":{"image":{"xlinkHref":"static/editor/o-mysql.svg"},"label":{"text":"mysql-18...nsurance"},"body":{"stroke":"#00bcd4"}}},{"type":"app.Database","form_data":{"connectionId":"60ed3887586ac90061426873","includeTables":[],"dropTable":false,"type":"database","database_type":"mongodb","table_prefix":"","table_suffix":"","dropType":"drop_data","syncObjects":[{"type":"table","objectNames":["CAR_CLAIM","CAR_CUSTOMER","CAR_POLICY","CLAIM"]}],"mqType":"","shapeImage":"static/editor/o-mongo.svg","name":"mongo-183-24023-kai","removeAllTables":false},"freeTransform":false,"size":{"width":160,"height":36},"ports":{"groups":{"l":{"position":{"name":"left"},"attrs":{"circle":{"magnet":true,"fill":"#fff","stroke":"#dedee4","strokeWidth":1,"r":5}}},"r":{"position":{"name":"right"},"attrs":{"circle":{"magnet":true,"fill":"#fff","stroke":"#dedee4","strokeWidth":1,"r":5}}},"t":{"position":{"name":"top"},"attrs":{"circle":{"magnet":true,"fill":"#fff","stroke":"#dedee4","strokeWidth":1,"r":5}}},"b":{"position":{"name":"bottom"},"attrs":{"circle":{"magnet":true,"fill":"#fff","stroke":"#dedee4","strokeWidth":1,"r":5}}}},"items":[{"id":"6167ff01-2a2b-4658-8950-fa2ea6fa6bb2_l","group":"l","attrs":{"circle":{"visibility":"visible"}}},{"id":"6167ff01-2a2b-4658-8950-fa2ea6fa6bb2_r","group":"r","attrs":{"circle":{"fill":"#fff","stroke":"#dedee4","stroke-width":1,"r":5}}},{"id":"6167ff01-2a2b-4658-8950-fa2ea6fa6bb2_t","group":"t"},{"id":"6167ff01-2a2b-4658-8950-fa2ea6fa6bb2_b","group":"b"}]},"schema":null,"outputSchema":{"meta_type":"table","table_name":""},"config":null,"position":{"x":207,"y":180},"angle":0,"id":"32690238-f77a-473e-b434-f6af04d57175","z":2,"attrs":{"image":{"xlinkHref":"static/editor/o-mongo.svg"},"label":{"text":"mongo-1...023-kai"},"body":{"stroke":"#00bcd4"}}},{"type":"app.databaseLink","router":{"name":"manhattan"},"connector":{"name":"rounded"},"labels":[],"source":{"id":"66ee272f-9efb-48f4-bc34-187d141d3959","magnet":"circle","port":"cf293bae-6ec1-4b93-addd-60590178a5e9_r"},"target":{"id":"32690238-f77a-473e-b434-f6af04d57175","magnet":"circle","port":"6167ff01-2a2b-4658-8950-fa2ea6fa6bb2_l"},"id":"f3962f1f-e513-49c1-aa9b-7602db9aec1d","z":3,"form_data":{"table_prefix":"","table_suffix":"","dropType":"drop_data","type":"databaseLink","selectSourceArr":["CAR_CLAIM","CAR_CUSTOMER","CAR_POLICY","CLAIM"],"topicData":[],"queueData":[],"transferFlag":false,"selectSourceDatabase":{"table":true,"view":false,"function":false,"procedure":false},"joinTable":{"tableName":"","joinType":"upsert","joinPath":"","manyOneUpsert":false,"joinKeys":[{"source":"","target":""}],"stageId":"66ee272f-9efb-48f4-bc34-187d141d3959","isArray":false,"arrayUniqueKey":"","connectionId":""}},"attrs":{}}],"settingData":{"isSerialMode":false,"sync_type":"initial_sync","readBatchSize":1000,"notificationWindow":0,"notificationInterval":300,"readCdcInterval":500,"maxTransactionLength":12,"description":"","cdcFetchSize":1,"distinctWriteType":"intellect","drop_target":false,"run_custom_sql":false,"needToCreateIndex":true,"increment":false,"isSchedule":false,"cronExpression":"","isOpenAutoDDL":false,"cdcConcurrency":false,"cdcShareFilterOnServer":false,"emailWaring":{"edited":false,"started":false,"error":true,"paused":true},"readShareLogMode":"STREAMING","stopOnError":true,"syncPoints":[{"connectionId":"","type":"current","time":"","date":"","name":"","timezone":"+8"}],"processorConcurrency":1,"transformerConcurrency":8,"lagTimeFalg":false,"userSetLagTime":0,"editDisable":false}}',
      //   user_id: '60ec4e1634f3203a677cc2e9',
      //   checked: true,
      //   operationTime: '2021-07-13T06:55:24.209Z',
      //   agentId: 'ae0cb491-03d1-44a9-8a83-2fb92586ecec',
      //   errorTime: '',
      //   finishTime: '2021-07-13T06:55:24.220Z',
      //   forceStoppingTime: '',
      //   pausedTime: '2021-07-13T06:55:24.220Z',
      //   pingTime: 1626159324051,
      //   runningTime: '2021-07-13T06:55:08.865Z',
      //   scheduleTime: 1626159308099,
      //   scheduledTime: '2021-07-13T06:55:07.278Z',
      //   startTime: '2021-07-13T06:55:07.278Z',
      //   stoppingTime: '2021-07-13T06:55:24.209Z',
      //   msg: '',
      //   scheduleTimes: 1,
      //   milestones: [
      //     { code: 'INIT_DATAFLOW', status: 'finish', errorMessage: '', start: 1626159309365, end: 1626159309448 },
      //     { code: 'INIT_CONNECTOR', status: 'finish', errorMessage: '', start: 1626159311259, end: 1626159311347 },
      //     { code: 'INIT_TRANSFORMER', status: 'finish', errorMessage: '', start: 1626159311569, end: 1626159311672 },
      //     { code: 'CONNECT_TO_SOURCE', status: 'finish', errorMessage: '', start: 1626159311373, end: 1626159311381 },
      //     { code: 'CONNECT_TO_TARGET', status: 'finish', errorMessage: '', start: 1626159311632, end: 1626159311638 },
      //     { code: 'CLEAR_TARGET_DATA', status: 'finish', errorMessage: '', start: 1626159311677, end: 1626159311835 },
      //     { code: 'CREATE_TARGET_INDEX', status: 'finish', errorMessage: '', start: 1626159311839, end: 1626159311909 },
      //     { code: 'READ_SNAPSHOT', status: 'finish', errorMessage: '', start: 1626159311424, end: 1626159311555 },
      //     { code: 'WRITE_SNAPSHOT', status: 'finish', errorMessage: '', start: 1626159312025, end: 1626159318455 }
      //   ],
      //   stats: {
      //     input: { rows: 3514, dataSize: 0 },
      //     output: { rows: 3514, dataSize: 0 },
      //     insert: { rows: 3514, dataSize: 0 },
      //     update: { rows: 0, dataSize: 0 },
      //     delete: { rows: 0, dataSize: 0 },
      //     transmissionTime: 566,
      //     transTimeAvg: 0,
      //     replicationLag: 0,
      //     stagesMetrics: [
      //       {
      //         stageId: '66ee272f-9efb-48f4-bc34-187d141d3959',
      //         input: { rows: 0, dataSize: 0 },
      //         output: { rows: 3514, dataSize: 0 },
      //         insert: { rows: 0, dataSize: 0 },
      //         update: { rows: 0, dataSize: 0 },
      //         delete: { rows: 0, dataSize: 0 },
      //         transmissionTime: 0,
      //         transTimeAvg: 0,
      //         replicationLag: 0,
      //         status: 'initialized'
      //       },
      //       {
      //         stageId: '32690238-f77a-473e-b434-f6af04d57175',
      //         input: { rows: 3514, dataSize: 0 },
      //         output: { rows: 0, dataSize: 0 },
      //         insert: { rows: 3514, dataSize: 0 },
      //         update: { rows: 0, dataSize: 0 },
      //         delete: { rows: 0, dataSize: 0 },
      //         transmissionTime: 566,
      //         transTimeAvg: 0,
      //         replicationLag: 0,
      //         status: null
      //       }
      //     ],
      //     totalCount: [{ stageId: '66ee272f-9efb-48f4-bc34-187d141d3959', dataCount: 3514 }],
      //     overview: {
      //       sourceTableNum: 4,
      //       sourceRowNum: 3514,
      //       targetTableNum: 4,
      //       targatRowNum: 3514,
      //       waitingForSyecTableNums: 0
      //     }
      //   },
      //   cdcLastTimes: [],
      //   executionTime: 78.58948333333333,
      //   errorEvents: [],
      //   user: { email: 'admin@admin.com' }
      // }
    }
  },
  computed: {
    dataFlowSettings() {
      return this.dataFlow?.setting ?? {}
    }
  },
  watch: {
    // dataFlow: {
    //   deep: true,
    //   handler(data) {
    //     this.handleData(data)
    //   }
    // }
  },
  mounted() {
    // this.init()
    // this.overviewStats = this.dataFlow.overview
    this.handleData(this.dataFlow)
  },

  methods: {
    // init() {
    //   this.loadData()
    // },
    // loadData() {
    //   this.loading = true
    //   let id = this.dataFlow.id
    //   console.log('[this.dataFlow.id]', this.dataFlow)
    //   this.overviewStats = this.dataFlow.overview
    //   dataFlowsAPI
    //     .get([id])
    //     .then(res => {
    //       debugger
    //       console.log('res', res)
    //       if (res?.data) {
    //         this.overviewStats = res.data?.stats?.overview
    //       }
    //     })
    //     .catch(e => {
    //       console.log(e, '#####')
    //     })
    //     .finally(() => {
    //       this.loading = false
    //     })
    // },
    handleData(data) {
      if (data?.stats?.overview) {
        let overview = data.stats.overview

        overview.waitingForSyecTableNums = overview.sourceTableNum - overview.waitingForSyecTableNums
        let num = (overview.targatRowNum / overview.sourceRowNum) * 100
        this.progressBar = num.toFixed(0) * 1

        overview.status === 'done' ? '已完成' : '进行中'
        this.overviewStats = overview
      }
    },
    // 跳转详情
    handleInfo() {
      // console.log(this.dataFlow, this.$router)
      // let route = this.$router.resolve({
      //   name: 'taskProgressInfo',
      //   query: {
      //     id: this.dataFlow.id
      //   }
      // })
      window.open('/#/taskProgressInfo?id=' + this.dataFlow.id, '_blank')
      // window.open(route.href, '_blank')
    }
  }
}
</script>
<style lang="scss" scoped>
.task-progress {
  padding: 24px;
}
.progress-container {
  border: 1px solid #d3d3d3;
  border-radius: 4px;
}
.progress-container__header {
  padding: 10px 16px;
  background: #fafafa;
  border-bottom: 1px solid #d3d3d3;
}
.progress-header_btn {
  padding: 0;
}
.progress-container__body {
  padding: 24px 16px;
}
.progress-container__overview {
  flex: 1;
  font-size: 12px;
  .el-progress {
    width: 180px;
    flex: 1;
  }
}
.progress-container__img {
  width: 40px;
  img {
    width: 100%;
  }
  // background-color: darkgreen;
}
.progress-container__footer {
  margin: 0 16px 20px;
  padding: 8px;
  &.mt-border {
    border-top: 1px solid #d3d3d3;
  }
}
.footer-line {
}
.footer-item {
  margin-top: 16px;
}
.footer-item__name {
  display: inline-block;
  color: #9c9c9c;
  width: 200px;
  font-size: 12px;
}
.footer-item__value {
  color: #000;
}
.color-green {
  color: rgba(58, 132, 63, 1);
}
</style>
<style lang="scss">
.task-progress {
  .el-progress-bar {
    width: 60%;
    .el-progress-bar__inner {
      background-color: #51b9e4;
    }
  }
}
</style>
