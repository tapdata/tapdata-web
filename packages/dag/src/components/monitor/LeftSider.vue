<template>
  <aside class="layout-sidebar --left border-end flex-column flex-shrink-0">
    <div class="flex flex-column flex-1 min-h-0">
      <div class="info-box">
        <TimeSelect v-bind="$attrs" @change="changeTimeSelect"></TimeSelect>
      </div>
      <div class="info-box">
        <div class="task-info__row">
          <span class="task-info__label">任务ID：</span>
          <span class="task-info__value">{{ dataflow.id }}</span>
        </div>
        <div class="task-info__row">
          <span class="task-info__label">任务类型：</span>
          <span class="task-info__value">{{ syncType[dataflow.type] }}</span>
        </div>
        <div class="task-info__row">
          <span class="task-info__label">所属FE：</span>
          <span class="task-info__value">{{ dataflow.agentName || '-' }}</span>
        </div>
        <div class="task-info__row">
          <span class="task-info__label">运行状态：</span>
          <span class="task-info__value">
            <slot name="status" :result="dataflow.statusResult">
              <StatusItem inline :value="dataflow.statusResult" />
            </slot>
          </span>
        </div>
      </div>
      <div class="info-box">
        <div class="font-color-normal fw-bold mb-2">任务事件统计（条）</div>
        <EventChart :samples="[eventDataAll, eventDataPeriod]"></EventChart>
      </div>
      <div class="info-box">
        <CollapsePanel>
          <template #header>
            <span class="fw-bold font-color-normal">性能指标</span>
          </template>
          <template #header-right>
            <ElTooltip transition="tooltip-fade-in" content="放大">
              <VIcon @click.stop="toFullscreen">fullscreen</VIcon>
            </ElTooltip>
          </template>
          <template #content>
            <LineChart
              :data="qpsData"
              :color="['#26CF6C', '#2C65FF']"
              title="QPS（Q/S）"
              :time-format="timeFormat"
              :limit="20"
              style="height: 140px"
            ></LineChart>
            <LineChart
              :data="delayData"
              title="增量延迟（ms）"
              :color="['#2C65FF']"
              :time-format="timeFormat"
              :limit="20"
              class="mt-4"
              style="height: 140px"
            ></LineChart>
          </template>
        </CollapsePanel>
      </div>
      <div class="info-box">
        <CollapsePanel>
          <template #header>
            <span class="fw-bold font-color-normal">全量信息</span>
          </template>
          <template #header-right>
            <ElTooltip transition="tooltip-fade-in" content="放大">
              <VIcon @click.stop="toInitialList">menu</VIcon>
            </ElTooltip>
          </template>
          <template #content>
            <div class="mb-4">
              <span>全量完成时间：</span>
              <span>{{ initialData.time }}</span>
            </div>
            <div class="flex justify-content-between">
              <div>
                <div class="text-center">表结构同步</div>
                <Chart :extend="initialStructureOptions" style="width: 140px; height: 200px"></Chart>
              </div>
              <div>
                <div class="text-center">表数据状态</div>
                <Chart ref="chart" :extend="initialDataOptions" style="width: 140px; height: 200px"></Chart>
              </div>
            </div>
          </template>
        </CollapsePanel>
      </div>
      <div class="info-box">
        <CollapsePanel>
          <template #header>
            <span class="fw-bold font-color-normal">增量信息</span>
          </template>
          <template #content>
            <div class="flex justify-content-between mb-2">
              <span>源连接：</span>
              <span class="font-color-normal">{{ cdcData.source }}</span>
            </div>
            <div class="flex justify-content-between mb-2">
              <span>目标连接：</span>
              <span class="font-color-normal">{{ cdcData.target }}</span>
            </div>
            <div class="flex justify-content-between">
              <span>增量时间点：</span>
              <span class="font-color-normal">{{ cdcData.time }}</span>
            </div>
          </template>
        </CollapsePanel>
      </div>
    </div>

    <ElDialog
      title="性能指标"
      width="774px"
      :visible.sync="lineChartDialog"
      :close-on-click-modal="false"
      :append-to-body="true"
    >
      <LineChart
        :data="qpsData"
        :color="['#26CF6C', '#2C65FF']"
        :limit="20"
        title="QPS（Q/S）"
        :time-format="timeFormat"
        style="height: 200px"
      ></LineChart>
      <LineChart
        :data="delayData"
        :color="['#2C65FF']"
        :limit="20"
        :time-format="timeFormat"
        title="增量延迟（ms）"
        class="mt-8"
        style="height: 200px"
      ></LineChart>
    </ElDialog>

    <InitialList v-model="initialListDialog"></InitialList>
  </aside>
</template>

<script>
import 'web-core/assets/icons/svg/magnify.svg'
import 'web-core/assets/icons/svg/table.svg'
import 'web-core/assets/icons/svg/javascript.svg'
import 'web-core/assets/icons/svg/joint-cache.svg'
import 'web-core/assets/icons/svg/row-filter.svg'
import 'web-core/assets/icons/svg/aggregator.svg'
import 'web-core/assets/icons/svg/field-processor.svg'
import 'web-core/assets/icons/svg/join.svg'
import 'web-core/assets/icons/svg/custom-node.svg'
import 'web-core/assets/icons/svg/merge_table.svg'
import 'web-core/assets/icons/svg/field_calc.svg'
import 'web-core/assets/icons/svg/field_add_del.svg'
import 'web-core/assets/icons/svg/field_rename.svg'
import 'web-core/assets/icons/svg/field_mod_type.svg'
import { mapGetters } from 'vuex'
import mouseDrag from 'web-core/directives/mousedrag'
import resize from 'web-core/directives/resize'
import { debounce } from 'lodash'
import { connectionsApi, databaseTypesApi } from '@tap/api'
import scrollbarWidth from 'element-ui/lib/utils/scrollbar-width'
import { StatusItem } from '@tap/business'
import Locale from '../../mixins/locale'
import EventChart from './components/EventChart'
import LineChart from './components/LineChart'
import TimeSelect from './components/TimeSelect'
import CollapsePanel from './components/CollapsePanel'
import VIcon from 'web-core/components/VIcon'
import InitialList from './components/InitialList'
import { Chart } from '@tap/component'
import { getPieOptions } from './util'

export default {
  name: 'LeftSider',
  mixins: [Locale],
  props: {
    dataflow: Object,
    quota: Object,
    timeFormat: String
  },
  components: {
    StatusItem,
    EventChart,
    LineChart,
    Chart,
    TimeSelect,
    CollapsePanel,
    VIcon,
    InitialList
  },

  data() {
    return {
      dbList: [],
      dbPage: 1,
      dbTotal: 0,
      dbSearchTxt: '',
      showDBInput: false,
      dragStarting: false,
      dragMoving: false,
      dragNode: null,
      connectionDialog: false,
      connectionFormDialog: false,
      databaseType: '',
      dbLoading: true,
      dbLoadingMore: false,
      syncType: {
        initial_sync: '全量',
        cdc: '增量',
        'initial_sync+cdc': '全量+增量'
      },
      database: [],
      connectionType: 'source',
      lineChartDialog: false,
      initialListDialog: false
    }
  },

  directives: {
    mouseDrag,
    resize
  },

  computed: {
    ...mapGetters('dataflow', ['processorNodeTypes', 'getCtor']),

    noDBMore() {
      return this.dbPage >= Math.ceil(this.dbTotal / 20)
    },

    disabledDBMore() {
      return this.dbLoading || this.noDBMore || this.dbLoadingMore
    },

    scrollbarWrapStyle() {
      let gutter = scrollbarWidth()
      return `height: calc(100% + ${gutter}px);`
    },

    // 任务事件统计（条）-任务累计
    eventDataAll() {
      return this.quota.samples?.[0] || {}
    },

    // 任务事件统计（条）-所选周期累计
    eventDataPeriod() {
      return this.quota.samples?.[1] || {}
    },

    // qps
    qpsData() {
      const res = this.quota.samples?.[2]
      if (!res) {
        return {
          x: [],
          name: [],
          value: []
        }
      }
      return {
        x: res.time,
        name: ['输入', '输出'],
        value: [res.inputQPS, res.outputQPS]
      }
    },

    // 增量延迟
    delayData() {
      const res = this.quota.samples?.[3]
      if (!res) {
        return {
          x: [],
          value: []
        }
      }
      return {
        x: res.time,
        value: res.value
      }
    },

    // 全量信息
    initialData() {
      const { initialTime } = this.quota.statistics?.[0] || {}
      return {
        time: initialTime
      }
    },

    // 全量-表结构同步
    initialStructureOptions() {
      let arr = [
        {
          name: '待进行',
          key: 'wait',
          value: 0,
          color: '#F7D762'
        },
        {
          name: '无需创建',
          key: 'noCreate',
          value: 0,
          color: '#88DBDA'
        },
        {
          name: '已完成',
          key: 'finished',
          value: 0,
          color: '#82C647'
        },
        {
          name: '错误',
          key: 'error',
          value: 0,
          color: '#EC8181'
        }
      ]
      const { structure } = this.quota.statistics?.[0] || {}
      return getPieOptions(
        arr.map(t =>
          Object.assign({}, t, {
            value: structure?.[t.key] ?? 0
          })
        )
      )
    },

    // 全量-表数据同步
    initialDataOptions() {
      let arr = [
        {
          name: '待进行',
          key: 'wait',
          value: 0,
          color: '#F7D762'
        },
        {
          name: '进行中',
          key: 'running',
          value: 0,
          color: '#88DBDA'
        },
        {
          name: '已完成',
          key: 'finished',
          value: 0,
          color: '#82C647'
        },
        {
          name: '错误',
          key: 'error',
          value: 0,
          color: '#EC8181'
        }
      ]
      const { data } = this.quota.statistics?.[0] || {}
      return getPieOptions(
        arr.map(t =>
          Object.assign({}, t, {
            value: data?.[t.key] ?? 0
          })
        )
      )
    },

    // 增量信息
    cdcData() {
      const { task_data_source_Data = {} } = this.dataflow?.attrs || {}
      const { source_connectionName, target_connectionName } = task_data_source_Data
      const { cdcTime } = this.quota.statistics?.[0] || {}
      return {
        source: source_connectionName,
        target: target_connectionName,
        time: cdcTime
      }
    }
  },

  created() {
    this.getDatabaseType()

    this.init()
  },

  mounted() {
    // addResizeListener(this.$refs.processorCollapse.$el, this.updateProcessorScrollbar)
  },

  beforeDestroy() {
    // removeResizeListener(this.$refs.processorCollapse.$el, this.updateProcessorScrollbar)
  },

  methods: {
    toggleConnectionType(type) {
      if (this.connectionType !== type) {
        this.connectionType = type
        this.loadDatabase()
      }
    },

    // 创建连接
    creat() {
      this.connectionDialog = true
    },
    getDatabaseType() {
      databaseTypesApi.get().then(res => {
        if (res) {
          this.getPdkData(res)
        }
      })
    },
    getPdkData(data) {
      this.database.push(...data)
    },
    createConnection(item) {
      this.connectionDialog = false
      // this.connectionFormDialog = true
      this.databaseType = item.type
      const { pdkHash } = item
      this.$router.push({
        name: 'connectionsCreate',
        query: { pdkHash }
      })
    },
    async init() {
      await this.loadDatabase()
    },

    getDbFilter() {
      const filter = {
        page: this.dbPage,
        size: 20,
        where: {
          // database_type: {
          //   $in: this.database
          // },
          connection_type: {
            like: this.connectionType,
            options: 'i'
          }
        },
        fields: {
          name: 1,
          id: 1,
          database_type: 1,
          database_owner: 1,
          database_name: 1,
          database_username: 1,
          database_host: 1,
          database_port: 1,
          database_uri: 1,
          connection_name: 1,
          brokerURL: 1,
          mqType: 1,
          kafkaBootstrapServers: 1,
          connection_type: 1,
          status: 1,
          accessNodeType: 1,
          accessNodeProcessId: 1,
          accessNodeProcessIdList: 1,
          pdkType: 1,
          pdkHash: 1,
          config: 1
        },
        order: ['status DESC', 'name ASC']
      }

      const txt = this.dbSearchTxt.trim()
      if (txt) {
        filter.where.name = { like: txt, options: 'i' }
      }

      return { filter: JSON.stringify(filter) }
    },

    async loadDatabase(loadMore) {
      if (loadMore) {
        this.dbPage++
        this.dbLoadingMore = true
      } else {
        this.dbLoading = true
        this.dbPage = 1
        this.dbTotal = 0
      }

      const data = await connectionsApi.get(this.getDbFilter())

      this.dbTotal = data.total

      const dbList = data.items.map(item => {
        let connectionUrl = ''

        if (item.config) {
          if (item.config.uri) {
            connectionUrl = item.config.uri
          } else {
            connectionUrl = `${item.config.host}:${item.config.port}/${item.config.database}${
              item.config.schema ? `/${item.config.schema}` : ''
            }`
          }
        }

        item.connectionUrl = connectionUrl
        item.databaseType = item.database_type
        return item
      })

      if (loadMore) {
        // 防止重复push
        dbList.forEach(item => {
          if (!this.dbIdMap[item.id]) {
            this.dbList.push(item)
            this.dbIdMap[item.id] = true
          }
        })
        this.dbLoadingMore = false
      } else {
        this.scrollTopOfDBList()
        this.dbList = dbList
        this.dbLoading = false
        // 缓存所有dbId
        this.dbIdMap = dbList.reduce((map, item) => ((map[item.id] = true), map), {})
      }
      return this.dbList
    },

    loadMoreDB() {
      if (this.disabledDBMore) return
      this.loadDatabase(true)
    },

    // 新增数据源保存
    saveConnection() {
      this.connectionFormDialog = false
      this.init()
    },

    genIconSrc(item) {
      return require(`web-core/assets/icons/node/${item.databaseType}.svg`)
    },

    async getDragDom() {
      await this.$nextTick()
      return document.getElementById('dragNode')
    },

    onStart(item) {
      const node = this.getNodeProps(item)
      const getResourceIns = this.$store.getters['dataflow/getResourceIns']
      const ins = getResourceIns(node)
      Object.defineProperty(node, '__Ctor', {
        value: ins,
        enumerable: false
      })
      this.dragNode = node
      this.dragStarting = true
      this.dragMoving = false
    },

    onProcessorStart(item) {
      const node = item
      const getResourceIns = this.$store.getters['dataflow/getResourceIns']
      if (!item.__Ctor) {
        const ins = getResourceIns(node)
        // 设置属性__Ctor不可枚举
        Object.defineProperty(node, '__Ctor', {
          value: ins,
          enumerable: false
        })
      }
      this.dragNode = node
      this.dragStarting = true
      this.dragMoving = false
    },

    onMove() {
      this.dragMoving = true
      this.$emit('move-node', ...arguments)
    },

    onDrop(item, position, rect) {
      this.$emit('drop-node', this.dragNode, position, rect)
    },

    onStop() {
      this.dragStarting = false
      this.dragMoving = false
    },

    scrollTopOfDBList() {
      if (this.$refs.dbList) this.$refs.dbList.wrap.scrollTop = 0
    },

    handleDBInput: debounce(function () {
      this.loadDatabase()
    }, 100),

    updateDBScrollbar() {
      setTimeout(this.$refs.dbList.update, 350)
    },

    updateProcessorScrollbar() {
      setTimeout(this.$refs.processorList.update, 350)
    },

    getNodeProps(item) {
      const props = {
        name: item.name,
        type: 'database',
        databaseType: item.database_type,
        connectionId: item.id,
        attrs: {
          connectionName: item.name,
          connectionType: item.connection_type,
          accessNodeProcessId: item.accessNodeProcessId,
          pdkType: item.pdkType,
          pdkHash: item.pdkHash
        }
      }

      if (this.connectionType === 'target') {
        props.existDataProcessMode = 'keepData'
        props.attrs.isTarget = true
      }

      return props
    },

    changeTimeSelect(val, isTime, source) {
      this.$emit('changeTimeSelect', val, isTime, source)
    },

    toFullscreen() {
      this.lineChartDialog = true
    },

    toInitialList() {
      this.initialListDialog = true
    }
  }
}
</script>

<style scoped lang="scss">
$hoverBg: #eef3ff;

.drag-node {
  position: fixed !important;
  z-index: 1000;
  pointer-events: none;
  opacity: 0;
  transform-origin: center center;
}

.layout-sidebar.--left {
  overflow: hidden auto;
  will-change: width;
  $headerH: 34px;

  .connection-tabs {
    position: relative;
    font-size: 0.875rem;

    &-pane {
      position: relative;
      height: 40px;
      cursor: pointer;
      &:hover {
        color: #2c65ff;
      }
      &.active {
        color: #2c65ff;
        &:before {
          position: absolute;
          content: '';
          height: 2px;
          background: #2c65ff;
          left: 12px;
          right: 12px;
          bottom: 0;
        }
      }
    }
  }

  ::v-deep {
    .type-tabs {
      .el-tabs__header {
        margin-bottom: 0;
      }
      .el-tabs__nav-wrap {
        padding: 0 4px;
      }
      .el-tabs__item {
        padding: 0 12px;
      }
    }

    .db-list-container {
      max-height: 50%;
      .el-collapse-item:last-child {
        margin-bottom: -2px;
      }
    }

    .click-btn {
      width: 24px !important;
      height: 24px !important;
      z-index: 2;
      border-radius: 4px;

      &:hover {
        color: #2c65ff;
        background: $hoverBg;
      }
    }

    .badge {
      display: inline-block;
      margin-left: 4px;
      padding: 2px 6px;
      border-radius: 18px;
      background: #f2f4f6;
      color: rgba(0, 0, 0, 0.4);
      font-size: 12px;
      font-weight: 500;
      line-height: 1;
      vertical-align: baseline;
    }

    .tb-header {
      position: relative;
      height: $headerH;
      font-size: 14px;
      font-weight: 500;
      border-bottom: 1px solid transparent;
      &-icon {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
      }
    }

    .db-item,
    .node-item {
      height: 42px;
      margin-bottom: 4px;
      font-size: 12px;
      &.active {
        background-color: #eef3ff;
      }

      &:not(.active):hover {
        background-color: #edf1f9;
      }

      .el-image {
        width: 20px;
        height: 20px;
        vertical-align: middle;
      }

      &-icon {
        padding: 4px;
        border: 1px solid #f2f2f2;
        border-radius: 50%;
      }

      &-content {
        overflow: hidden;
        > :not(:last-child) {
          margin-bottom: 4px;
          font-size: 13px;
        }

        > :last-child {
          color: rgb(83 95 114 / 70%);
        }
      }

      &:last-child {
        margin-bottom: 0;
      }
    }

    .node-item {
      height: 30px;

      .el-image {
        width: 20px;
        height: 20px;
      }
    }

    .tb-item-icon {
      width: 20px;
      height: 20px;
      background-color: #6236ff;
      text-align: center;
      border-radius: 100%;
    }

    .el-collapse {
      border-top: 0;
      &.processor-collapse {
        max-height: 30%;
      }
      &.collapse-fill {
        .el-collapse-item:first-child:last-child {
          height: 100%;
          .el-collapse-item__wrap {
            height: calc(100% - #{$headerH - 1});
          }
          .el-collapse-item__content {
            height: 100%;
          }
        }
      }

      &-item {
        &.is-active [role='tab'] {
          position: sticky;
          top: 0;
          z-index: 1;
        }

        &__header {
          position: relative;
          padding-left: 16px;
          padding-right: 16px;
          height: $headerH;
          font-size: 14px;

          &:hover {
            background-color: rgba(47, 46, 63, 0.05);
          }
        }

        &__wrap {
          padding-top: 16px;
        }

        &__arrow {
          order: -1;
          &:before {
            content: '\e791';
          }
        }

        &__content {
          padding-bottom: 0;
        }
      }
    }

    .el-scrollbar {
      height: 100%;
    }

    .header__input {
      position: absolute;
      z-index: 3;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      margin-bottom: -1px;

      input {
        width: 100%;
        height: 100%;
        border-width: 0 0 1px;
        border-radius: 0;
      }

      input,
      .v-icon,
      .el-input__icon {
        vertical-align: top;
      }

      input,
      .el-input__icon {
        line-height: $headerH;
      }
    }
  }
}

.node-list {
  .node-item {
    border-radius: 4px;

    &:hover {
      background-color: #eef3ff;
    }

    &-icon {
      width: 32px;
      height: 32px;
      background: rgba(44, 101, 255, 0.07);
      border-radius: 4px;
      border: 1px solid #2c65ff;
    }

    &-txt {
      font-size: 12px;
      line-height: 1;
      white-space: nowrap;
    }
  }
}
.info-box {
  padding: 16px;
  border-bottom: 1px solid #f2f2f2;
}
.task-info__row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
</style>
