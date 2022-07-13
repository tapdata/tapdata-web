<template>
  <aside class="layout-sidebar --left border-end flex-column flex-shrink-0">
    <div class="flex flex-column flex-1 min-h-0">
      <div class="info-box">
        <TimeSelect @change="eventChangeTime"></TimeSelect>
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
        <EventChart :total="eventTotal" :xData="eventData"></EventChart>
      </div>
      <div class="info-box">
        <CollapsePanel>
          <template #header>
            <span>性能指标</span>
          </template>
          <template #header-right>
            <VIcon @click.stop="toFullscreen">fullscreen</VIcon>
          </template>
          <template #content>
            <div>
              <LineChart title="QPS（Q/S）" style="height: 140px"></LineChart>
              <LineChart title="增量延迟（ms）" color="#2C65FF" class="mt-4" style="height: 140px"></LineChart>
            </div>
          </template>
        </CollapsePanel>
      </div>
    </div>
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

export default {
  name: 'LeftSider',
  mixins: [Locale],
  props: {
    dataflow: Object,
    quota: Object
  },
  components: {
    StatusItem,
    EventChart,
    LineChart,
    TimeSelect,
    CollapsePanel,
    VIcon
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
      eventData: [],
      eventTotal: null
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
      console.log('disabledDBMore', this.dbLoading, this.noDBMore) // eslint-disable-line
      return this.dbLoading || this.noDBMore || this.dbLoadingMore
    },

    scrollbarWrapStyle() {
      let gutter = scrollbarWidth()
      return `height: calc(100% + ${gutter}px);`
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
      this.loadEventData()
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
      console.log('loadMoreDB') // eslint-disable-line
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

    eventChangeTime(val, isTime) {
      console.log('eventChangeTime', val, isTime)
    },

    loadEventData() {
      let re = [
        {
          label: '插入',
          key: 'inserted'
        },
        {
          label: '更新',
          key: 'updated'
        },
        {
          label: '删除',
          key: 'deleted'
        },
        {
          label: 'DDL',
          key: 'ddl'
        },
        {
          label: '其他',
          key: 'other'
        }
      ]
      const { input, output } = this.quota.samples?.[0] || {}
      let inputTotal = 0
      let outputTotal = 0
      this.eventData = re.map(t => {
        inputTotal += input[t.key]
        outputTotal += output[t.key]
        return {
          label: t.label,
          value: [input[t.key], output[t.key]]
        }
      })
      this.eventTotal = [
        {
          label: '总输入',
          value: inputTotal
        },
        {
          label: '总输出',
          value: outputTotal
        }
      ]
    },

    toFullscreen() {}
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
        color: map-get($color, primary);
      }
      &.active {
        color: map-get($color, primary);
        &:before {
          position: absolute;
          content: '';
          height: 2px;
          background: map-get($color, primary);
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
        color: map-get($color, primary);
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
