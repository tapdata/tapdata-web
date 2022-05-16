<template>
  <aside class="layout-sidebar --left border-end flex flex-column flex-shrink-0">
    <div class="flex flex-column flex-1 min-h-0">
      <div class="connection-tabs flex align-center px-1 border-bottom">
        <div
          class="connection-tabs-pane flex align-center px-3 font-color-light"
          :class="{ active: connectionType === 'source' }"
          @click="toggleConnectionType('source')"
        >
          来源
        </div>
        <div
          class="connection-tabs-pane flex align-center px-3 font-color-light"
          :class="{ active: connectionType === 'target' }"
          @click="toggleConnectionType('target')"
        >
          目标
        </div>
        <div class="flex-grow-1"></div>
        <div class="connection-tabs-extra">
          <VIcon size="20" class="click-btn" @click.stop="creat">add-outline</VIcon>
        </div>
      </div>

      <div class="px-4 py-3">
        <ElInput
          v-model="dbSearchTxt"
          ref="dbInput"
          :placeholder="$t('connection_name_search_placeholder')"
          size="mini"
          clearable
          @keydown.native.stop
          @keyup.native.stop
          @click.native.stop
          @input="handleDBInput"
        >
          <template #prefix>
            <VIcon size="14" class="ml-1 h-100">magnify</VIcon>
          </template>
        </ElInput>
      </div>

      <ElScrollbar ref="dbList" tag="div" wrap-class="db-list" :wrap-style="scrollbarWrapStyle">
        <ElSkeleton :loading="dbLoading" animated :throttle="skeletonThrottle">
          <template #template>
            <div v-for="i in 5" :key="i" class="flex p-4 align-center">
              <ElSkeletonItem
                class="mr-3 flex-shrink-0"
                style="width: 20px; height: 20px"
                variant="rect"
              ></ElSkeletonItem>
              <ElSkeletonItem variant="text"></ElSkeletonItem>
            </div>
          </template>
          <div v-infinite-scroll="loadMoreDB" :infinite-scroll-disabled="disabledDBMore" class="px-3 pt-1">
            <div
              v-for="db in dbList"
              v-mouse-drag="{
                item: db,
                container: '#dfEditorContent',
                getDragDom,
                onStart,
                onMove,
                onDrop,
                onStop
              }"
              :key="db.id"
              class="db-item grabbable flex align-center px-2 user-select-none rounded-2"
            >
              <ElImage class="flex-shrink-0 mr-2" :src="genIconSrc(db)"></ElImage>
              <div class="flex flex-wrap db-item-content align-self-stretch py-1">
                <OverflowTooltip class="w-100 text-truncate" :text="db.name" placement="right" :open-delay="400" />
                <OverflowTooltip
                  class="w-100 font-color-slight text-truncate"
                  :text="db.connectionUrl"
                  placement="right"
                  :open-delay="400"
                />
              </div>
            </div>
            <EmptyItem v-if="!dbList.length"></EmptyItem>
            <div v-if="dbLoadingMore" class="text-center text-black-50 fs-8 p-2">
              {{ $t('loading') }}<span class="dotting"></span>
            </div>
          </div>
        </ElSkeleton>
      </ElScrollbar>
    </div>

    <ElCollapse ref="processorCollapse" class="collapse-fill processor-collapse" value="process">
      <ElCollapseItem name="process">
        <template #title>
          <div class="flex align-center flex-1">
            <span class="flex-1 user-select-none">
              <!--处理节点-->
              {{ $t('dag_processor_node') }}
            </span>
          </div>
        </template>
        <ElScrollbar ref="processorList" tag="div" wrap-class="" :wrap-style="scrollbarWrapStyle">
          <ElRow class="node-list flex-wrap px-2" :gutter="0" type="flex">
            <ElCol :span="8" v-for="(n, ni) in processorNodeTypes" :key="ni" class="p-1">
              <div
                v-mouse-drag="{
                  item: n,
                  container: '#dfEditorContent',
                  getDragDom,
                  onStart: onProcessorStart,
                  onMove,
                  onDrop,
                  onStop
                }"
                class="node-item flex flex-column align-center px-1 py-2 grabbable user-select-none"
              >
                <div class="node-item-icon flex justify-center align-center mb-2">
                  <VIcon size="24" color="#2C65FF">{{ n.icon }}</VIcon>
                </div>
                <OverflowTooltip
                  class="node-item-txt text-center w-100"
                  :text="n.name"
                  popper-class="df-node-text-tooltip"
                  placement="top"
                  :open-delay="400"
                />
              </div>
            </ElCol>
          </ElRow>
        </ElScrollbar>
      </ElCollapseItem>
    </ElCollapse>

    <!-- S 节点拖拽元素 -->
    <BaseNode
      v-if="dragStarting"
      id="dragNode"
      class="drag-node"
      :node="dragNode"
      :class="`node--${dragNode.__Ctor.group}`"
    ></BaseNode>
    <!-- E 节点拖拽元素 -->

    <ElDialog
      title="选择数据源类型"
      width="1030px"
      :visible.sync="connectionDialog"
      :close-on-click-modal="false"
      :append-to-body="true"
    >
      <ConnectionTypeSelector
        :types="database"
        :commingTypes="comingAllowDatabase"
        :otherTypes="otherType"
        :large="true"
        @select="createConnection"
      ></ConnectionTypeSelector>
      <!-- :automationType="automationType" -->
    </ElDialog>
    <!-- <ElDialog
      title="创建连接"
      width="60%"
      :visible.sync="connectionFormDialog"
      :close-on-click-modal="false"
      :append-to-body="true"
    >
      <Form v-if="connectionFormDialog" :databaseTypeText="databaseType" @saveConnection="saveConnection"></Form>
    </ElDialog> -->
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
import VIcon from 'web-core/components/VIcon'
import ConnectionTypeSelector from 'web-core/components/connection-type-selector'
import resize from 'web-core/directives/resize'
import BaseNode from '../components/BaseNode'
import { debounce } from 'lodash'
import { Connections } from '@tap/api'
import { Select } from 'element-ui'
const connections = new Connections()
import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event'
import OverflowTooltip from 'web-core/components/overflow-tooltip/OverflowTooltip'
import EmptyItem from 'web-core/components/EmptyItem'
import scrollbarWidth from 'element-ui/lib/utils/scrollbar-width'

export default {
  name: 'LeftSider',

  components: {
    EmptyItem,
    OverflowTooltip,
    BaseNode,
    VIcon,
    ConnectionTypeSelector,
    ElScrollbar: Select.components.ElScrollbar
  },

  data() {
    return {
      collapseMode: 'db',
      search: '',
      mapping: this.$route.query,
      groups: [],
      activeGroups: ['plugin'],
      connections: [],
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
      skeletonThrottle: 0,

      database: [
        'mysql',
        'oracle',
        'mongodb',
        'sqlserver',
        'postgres',
        'elasticsearch',
        'redis',
        'gbase-8s',
        'sybase ase',
        'gaussdb200',
        'db2',
        'kafka',
        'mariadb',
        'mysql pxc',
        // 'jira',
        'mq',
        'dameng',
        'hive',
        // 'tcp_udp',
        'hbase',
        'kudu',
        'greenplum',
        'tidb',
        'hana',
        'clickhouse',
        'kundb',
        'adb_postgres',
        'adb_mysql',
        'hazelcast_cloud_cluster'
      ],
      comingAllowDatabase: [], // 即将上线
      otherType: ['gridfs', 'dummy db', 'rest api', 'custom_connection', 'file'],
      automationType: '', //插件化数据源

      dialogData: {
        type: 'table',
        title: this.$t('dialog.createTable'),
        placeholder: this.$t('dialog.placeholderTable'),
        visible: false
      },

      connectionType: 'source'
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
    }
  },

  created() {
    let allowDataType = window.getSettingByKey('ALLOW_CONNECTION_TYPE') || []
    if (typeof allowDataType === 'string') {
      allowDataType = allowDataType.split(',')
    }

    let comingAllowDataType = window.getSettingByKey('COMING_ONLINE_CONNECTION_TYPE') || []
    this.comingAllowDatabase = comingAllowDataType.filter(type => this.database.includes(type)) || []
    this.database = allowDataType.filter(type => this.database.includes(type)) || []
    this.database.push('vika')

    this.otherType = allowDataType.filter(type => this.otherType.includes(type)) || []
    this.getDatabaseType()

    this.init()
  },

  mounted() {
    addResizeListener(this.$refs.processorCollapse.$el, this.updateProcessorScrollbar)
  },

  beforeDestroy() {
    removeResizeListener(this.$refs.processorCollapse.$el, this.updateProcessorScrollbar)
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
      this.$api('DatabaseTypes')
        .get()
        .then(res => {
          if (res.data) {
            this.automationType = res.data || []
            this.automationType = this.automationType.filter(
              item =>
                !this.otherType.includes(item.type) &&
                !this.database.includes(item.type) &&
                !this.comingAllowDatabase.includes(item.type) &&
                !['mem_cache', 'rest api', 'log_collect'].includes(item.type)
            )
          }
        })
    },
    createConnection(type) {
      this.connectionDialog = false
      // this.connectionFormDialog = true
      this.databaseType = type
      this.$router.push({
        name: 'connectionsCreate',
        query: { databaseType: type }
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
          database_type: {
            $in: this.database
          },
          connection_type: {
            like: this.connectionType,
            options: 'i'
          }
        },
        fields: {
          name: 1,
          id: 1,
          database_type: 1,
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
          accessNodeProcessIdList: 1
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
      }

      const data = await connections.get(this.getDbFilter())

      this.dbTotal = data.total

      const dbList = data.items.map(item => {
        let connectionUrl = ''
        if (item.database_type !== 'mongodb') {
          if (item.database_username) {
            connectionUrl += item.database_username + ':***@'
          }
          connectionUrl += item.database_host + ':' + item.database_port
        } else {
          connectionUrl = item.database_uri || item.connection_name
        }
        if (item.database_type === 'mq' && item.mqType === '0') {
          connectionUrl = item.brokerURL
        }
        // 不存在uri 和 port === 0
        if (!item.database_uri && !item.database_port && item.mqType !== '0') {
          connectionUrl = ''
        }
        if (item.database_type === 'kudu') {
          connectionUrl = item.database_host
        }
        if (item.database_type === 'kafka') {
          connectionUrl = item.kafkaBootstrapServers
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
      return {
        name: item.name,
        type: 'database',
        databaseType: item.database_type,
        connectionId: item.id,
        attrs: {
          isTarget: this.connectionType === 'target',
          connectionName: item.name,
          connectionType: item.connection_type,
          accessNodeProcessId: item.accessNodeProcessId
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
$itemH: 40px;
$hoverBg: #eef3ff;

.drag-node {
  position: fixed !important;
  z-index: 1000;
  pointer-events: none;
  opacity: 0;
  transform-origin: center center;
}

.layout-sidebar.--left {
  overflow: hidden;
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
    .tb-item {
      margin-bottom: 4px;
      height: $itemH;
      font-size: 12px;
      &.active {
        background-color: #eef3ff;
      }

      &:not(.active):hover {
        background-color: #edf1f9;
      }

      .el-image {
        width: 24px;
        height: 24px;
        vertical-align: middle;
      }

      &-content {
        overflow: hidden;
        > :not(:last-child) {
          margin-bottom: 4px;
        }
      }

      &:last-child {
        margin-bottom: 0;
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
</style>
