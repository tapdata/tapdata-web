<template>
  <aside class="layout-sidebar --left border-end flex flex-column flex-shrink-0">
    <div class="flex flex-column flex-1 min-h-0">
      <ElCollapse v-model="collapseMode" ref="dbCollapse" class="collapse-fill db-list-container" accordion>
        <ElCollapseItem name="db">
          <template #title>
            <div class="flex align-center flex-1 overflow-hidden">
              <template v-if="collapseMode === 'db'">
                <span class="flex-1 user-select-none text-truncate flex align-center">
                  <!--连接-->
                  {{ $t('packages_dag_dag_connection') }}
                  <span v-show="dbTotal > 0" class="badge">{{ dbTotal }}</span>
                </span>
                <VIcon size="18" class="click-btn mr-1" :class="{ active: showDBInput }" @click.stop="handleShowDBInput"
                  >search-outline</VIcon
                >
                <VIcon
                  size="20"
                  class="click-btn"
                  :class="{ 'click-btn-disabled': stateIsReadonly }"
                  @mousedown.stop
                  @click.stop="creat"
                  >add-outline</VIcon
                >
              </template>
              <span v-else class="flex-1 user-select-none text-truncate">{{ activeConnection.name }}</span>
            </div>
          </template>
          <div class="flex flex-column h-100">
            <div v-show="showDBInput" class="p-2">
              <ElInput
                v-model="dbSearchTxt"
                ref="dbInput"
                class="header__input"
                :placeholder="$t('packages_dag_connection_name_search_placeholder')"
                size="mini"
                clearable
                @keydown.native.stop
                @keyup.native.stop
                @click.native.stop
                @input="handleDBInput"
              >
                <template #prefix>
                  <VIcon size="14" class="ml-1 h-100">search-outline</VIcon>
                </template>
              </ElInput>
            </div>

            <ElScrollbar ref="dbList" class="flex-1" tag="div" wrap-class="db-list" :wrap-style="scrollbarWrapStyle">
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
                <div v-infinite-scroll="loadMoreDB" :infinite-scroll-disabled="disabledDBMore" class="px-2 pb-2">
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
                    class="db-item flex align-center px-1 user-select-none rounded-2"
                    :class="{ grabbable: !stateIsReadonly, active: activeConnection.id === db.id }"
                    @click="handleSelectDB(db)"
                  >
                    <div class="flex-shrink-0 mr-2 db-item-icon">
                      <NodeIcon :node="db" />
                    </div>
                    <div class="flex flex-column justify-center db-item-content">
                      <div class="flex align-center">
                        <OverflowTooltip
                          class="text-truncate mr-1"
                          placement="right"
                          :disabled="dragStarting"
                          :text="db.name"
                          :open-delay="400"
                        />
                        <ConnectionType :type="db.connection_type" />
                      </div>
                      <OverflowTooltip
                        class="w-100 text-truncate"
                        placement="right"
                        :disabled="dragStarting"
                        :text="db.connectionUrl"
                        :open-delay="400"
                      />
                    </div>
                  </div>
                  <VEmpty v-if="!dbList.length" />
                  <div v-if="dbLoadingMore" class="text-center text-black-50 fs-8 p-2">
                    {{ $t('packages_dag_loading') }}<span class="dotting"></span>
                  </div>
                </div>
              </ElSkeleton>
            </ElScrollbar>
          </div>
        </ElCollapseItem>
      </ElCollapse>

      <div class="flex-1 min-h-0 flex flex-column border-bottom">
        <div class="tb-header flex align-center px-4">
          <span class="flex-1 user-select-none text-truncate flex align-center">
            <!--表-->
            {{ $t('packages_dag_dag_table') }}
            <span v-show="tbTotal > 0" class="badge">{{ tbTotal }}</span>
          </span>
          <!--创建新表作为节点使用-->
          <VIcon size="18" class="click-btn mr-1" :class="{ active: showTBInput }" @click.stop="handleShowTBInput"
            >search-outline</VIcon
          >
          <ElTooltip :content="$t('packages_dag_dag_create_table_as_node')" placement="top">
            <VIcon
              size="20"
              class="click-btn"
              :class="{ 'click-btn-disabled': stateIsReadonly }"
              @click.stop="handleAddTable"
              >add-outline</VIcon
            >
          </ElTooltip>
        </div>

        <div class="flex flex-column flex-1 min-h-0">
          <div v-show="showTBInput" class="p-2">
            <ElInput
              v-model="tbSearchTxt"
              ref="tbInput"
              :placeholder="$t('packages_dag_table_name_search_placeholder')"
              size="mini"
              clearable
              @keydown.native.stop
              @keyup.native.stop
              @click.native.stop
              @input="handleTBInput"
            >
              <template #prefix>
                <VIcon size="14" class="ml-1 h-100">search-outline</VIcon>
              </template>
            </ElInput>
          </div>

          <ElScrollbar
            ref="tbList"
            class="flex-1 min-h-0"
            tag="div"
            wrap-class="tb-list"
            :wrap-style="scrollbarWrapStyle"
          >
            <ElSkeleton :loading="tbLoading" animated :throttle="skeletonThrottle">
              <template #template>
                <div v-for="i in 5" :key="i" class="flex p-4 align-center">
                  <ElSkeletonItem variant="text"></ElSkeletonItem>
                </div>
              </template>
              <!--多加一层div包裹，避免骨架屏出现时，v-infinite-scroll指令dom指向骨架屏-->
              <div>
                <div v-infinite-scroll="loadMoreTable" :infinite-scroll-disabled="disabled" class="px-2 pb-2">
                  <div
                    v-for="tb in tbList"
                    v-mouse-drag="{
                      item: tb,
                      container: '#dfEditorContent',
                      getDragDom,
                      onStart: onTBStart,
                      onMove,
                      onDrop,
                      onStop
                    }"
                    :key="tb.id"
                    class="tb-item flex align-center px-2 user-select-none rounded-2"
                    :class="{ grabbable: !stateIsReadonly }"
                  >
                    <OverflowTooltip :text="tb.name" placement="right" :open-delay="400"></OverflowTooltip>
                  </div>
                  <VEmpty v-if="!tbList.length" />
                  <div v-if="tbLoadingMore" class="text-center text-black-50 fs-8 p-2">
                    {{ $t('packages_dag_loading') }}<span class="dotting"></span>
                  </div>
                </div>
              </div>
            </ElSkeleton>
          </ElScrollbar>
        </div>
      </div>
    </div>

    <ElCollapse ref="processorCollapse" class="collapse-fill processor-collapse" value="process">
      <ElCollapseItem name="process">
        <template #title>
          <div class="flex align-center flex-1">
            <span class="flex-1 user-select-none">
              <!--处理节点-->
              {{ $t('packages_dag_dag_processor_node') }}
            </span>
          </div>
        </template>
        <ElScrollbar ref="processorList" tag="div" wrap-class="px-2 pb-2" :wrap-style="scrollbarWrapStyle">
          <div
            v-for="(n, ni) in processorNodeTypes"
            :key="ni"
            v-mouse-drag="{
              item: n,
              container: '#dfEditorContent',
              getDragDom,
              onStart: onProcessorStart,
              onMove,
              onDrop,
              onStop
            }"
            class="node-item flex align-center px-2 user-select-none rounded-2"
            :class="{ grabbable: !stateIsReadonly }"
          >
            <NodeIcon class="flex-shrink-0 mr-2" :node="n" />
            <OverflowTooltip :text="n.name" popper-class="df-node-text-tooltip" placement="top" :open-delay="400" />
            <VIcon class="ml-1" v-if="n.beta" size="32">beta</VIcon>
          </div>
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
      :title="$t('packages_dag_components_leftsidebar_xuanzeshujuyuan')"
      width="848px"
      :visible.sync="connectionDialog"
      :close-on-click-modal="false"
      :append-to-body="true"
      custom-class="connection-dialog"
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

    <CreateTable :dialog="dialogData" @handleTable="handleSaveTable"></CreateTable>
  </aside>
</template>

<script>
import { mapGetters } from 'vuex'
import { debounce, escapeRegExp } from 'lodash'
import { Select } from 'element-ui'
import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event'
import scrollbarWidth from 'element-ui/lib/utils/scrollbar-width'
import { metadataInstancesApi, databaseTypesApi, CancelToken, connectionsApi } from '@tap/api'
import { VIcon, VEmpty, OverflowTooltip } from '@tap/component'
import { ConnectionTypeSelector } from '@tap/business'
import { getInitialValuesInBySchema } from '@tap/form'
import mouseDrag from '@tap/component/src/directives/mousedrag'
import resize from '@tap/component/src/directives/resize'
import BaseNode from './BaseNode'
import CreateTable from './CreateTable'
import NodeIcon from './NodeIcon'
import ConnectionType from './ConnectionType'

export default {
  name: 'LeftSidebar',

  components: {
    NodeIcon,
    CreateTable,
    VEmpty,
    OverflowTooltip,
    BaseNode,
    VIcon,
    ConnectionType,
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
      tbList: [],
      tbPage: 1,
      tbTotal: 0,
      dbSearchTxt: '',
      tbSearchTxt: '',
      showDBInput: false,
      showTBInput: false,
      currentConnectionId: '',
      activeConnection: {
        id: '',
        name: '',
        databaseType: ''
      },
      dragStarting: false,
      dragMoving: false,
      dragNode: null,
      connectionDialog: false,
      connectionFormDialog: false,
      databaseType: '',
      dbLoading: true,
      dbLoadingMore: false,
      tbLoading: true,
      tbLoadingMore: false,
      skeletonThrottle: 0,

      database: [],
      comingAllowDatabase: [], // 即将上线
      otherType: [],
      automationType: [], //插件化数据源

      dialogData: {
        type: 'table',
        title: this.$t('packages_dag_dialog_createTable'),
        placeholder: this.$t('packages_dag_dialog_placeholderTable'),
        visible: false
      }
    }
  },

  directives: {
    mouseDrag,
    resize
  },

  computed: {
    ...mapGetters('dataflow', ['processorNodeTypes', 'getCtor', 'stateIsReadonly']),

    noMore() {
      return this.tbPage >= Math.ceil(this.tbTotal / 20)
    },

    noDBMore() {
      return this.dbPage >= Math.ceil(this.dbTotal / 20)
    },

    disabled() {
      return this.tbLoading || this.noMore || this.tbLoadingMore
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
    this.getDatabaseType()

    this.init()
  },

  mounted() {
    addResizeListener(this.$refs.dbCollapse.$el, this.updateDBScrollbar)
    addResizeListener(this.$refs.tbList.$el, this.updateTBScrollbar)
    addResizeListener(this.$refs.processorCollapse.$el, this.updateProcessorScrollbar)
  },

  beforeDestroy() {
    removeResizeListener(this.$refs.dbCollapse.$el, this.updateDBScrollbar)
    removeResizeListener(this.$refs.tbList.$el, this.updateTBScrollbar)
    removeResizeListener(this.$refs.processorCollapse.$el, this.updateProcessorScrollbar)
  },

  methods: {
    // 创建连接
    creat() {
      this.connectionDialog = !this.stateIsReadonly
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
    createConnection(item = {}) {
      this.connectionDialog = false
      const { pdkHash } = item
      let query = {
        pdkHash
      }
      this.$router.push({
        name: 'connectionCreate',
        query
      })
    },
    async init() {
      this.tbLoading = true
      const data = await this.loadDatabase()
      if (data.length) {
        this.handleSelectDB(data[0])
      } else {
        this.tbLoading = false
      }
    },

    getDbFilter() {
      const filter = {
        page: this.dbPage,
        size: 20,
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
          capabilities: 1,
          config: 1
        },
        order: ['status DESC', 'name ASC']
      }

      const txt = escapeRegExp(this.dbSearchTxt.trim())
      if (txt) {
        filter.where = { name: { like: txt, options: 'i' } }
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

      const data = await connectionsApi.get(this.getDbFilter())

      this.dbTotal = data.total

      const dbList = data.items.map(item => {
        item.databaseType = item.database_type
        if (item.connectionString) {
          item.connectionUrl = item.connectionString
          return item
        }

        let connectionUrl = ''
        if (item.config) {
          if (item.config.uri) {
            connectionUrl = item.config.uri
          } else {
            const { host, port, database, schema } = item.config
            connectionUrl = host
              ? `${host}${port ? `:${port}` : ''}${database ? `/${database}` : ''}${schema ? `/${schema}` : ''}`
              : ''
          }
        }

        item.connectionUrl = connectionUrl
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

    getTableFilter() {
      const filter = {
        page: this.tbPage,
        size: 20,
        where: {
          'source.id': this.activeConnection.id,
          taskId: this.$store.state.dataflow.taskId,
          meta_type: {
            in: ['collection', 'table', 'view']
          },
          is_deleted: false,
          sourceType: 'SOURCE'
        },
        fields: {
          id: true,
          original_name: true
        },
        order: ['original_name ASC']
      }

      const txt = escapeRegExp(this.tbSearchTxt.trim())
      if (txt) {
        filter.where.original_name = { like: txt, options: 'i' }
      } else {
        filter.where.original_name = { neq: '' }
      }

      return { filter: JSON.stringify(filter) }
    },

    /**
     * 加载数据库
     * @param loadMore 加载更多开关
     * @returns {Promise<void>}
     */
    async loadDatabaseTable(loadMore) {
      this.cancelSource?.cancel()
      this.cancelSource = CancelToken.source()

      if (loadMore) {
        this.tbPage++
        this.tbLoadingMore = true
      } else {
        this.tbLoading = true
        this.tbPage = 1
      }

      let data
      try {
        data = await metadataInstancesApi.get(this.getTableFilter(), {
          cancelToken: this.cancelSource.token
        })
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log('loadDatabaseTable', e)
        return
      }

      const tables = data.items.map(tb => ({
        id: tb.id,
        name: tb.original_name
      }))

      this.tbTotal = data.total

      if (loadMore) {
        tables.forEach(item => {
          if (!this.tbIdMap[item.id]) {
            this.tbList.push(item)
            this.tbIdMap[item.id] = true
          }
        })
        this.tbLoadingMore = false
      } else {
        this.scrollTopOfTableList()
        this.tbList = tables
        this.tbLoading = false
        // 缓存所有tbId
        this.tbIdMap = tables.reduce((map, item) => ((map[item.id] = true), map), {})
      }
    },

    loadMoreTable() {
      this.loadDatabaseTable(true)
    },

    // 新增数据源保存
    saveConnection() {
      this.connectionFormDialog = false
      this.init()
    },

    async getDragDom() {
      await this.$nextTick()
      return document.getElementById('dragNode')
    },

    initStart(node) {
      if (this.stateIsReadonly) return false
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

    onStart(item) {
      const node = this.getNodeProps(item, '')
      return this.initStart(node)
    },

    onTBStart(item) {
      const node = this.getNodeProps(this.activeConnection, item.name)
      return this.initStart(node)
    },

    onProcessorStart(item) {
      if (this.stateIsReadonly) return false
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

    handleSelectDB(db) {
      const lastId = this.activeConnection.id
      this.tbSearchTxt = ''
      this.activeConnection = db
      lastId !== db.id && this.loadDatabaseTable()
    },

    handleTBInput: debounce(function () {
      this.loadDatabaseTable()
    }, 100),

    scrollTopOfDBList() {
      if (this.$refs.dbList) this.$refs.dbList.wrap.scrollTop = 0
    },

    scrollTopOfTableList() {
      if (this.$refs.tbList) this.$refs.tbList.wrap.scrollTop = 0
    },

    handleShowTBInput() {
      this.showTBInput = !this.showTBInput

      if (this.showTBInput) {
        this.$nextTick(() => {
          this.$refs.tbInput.focus()
        })
      }

      if (this.tbSearchTxt) {
        this.tbSearchTxt = ''
        this.loadDatabaseTable()
      }
    },

    handleShowDBInput() {
      this.showDBInput = !this.showDBInput

      if (this.showDBInput) {
        this.$nextTick(() => {
          this.$refs.dbInput.focus()
        })
      }

      if (this.dbSearchTxt) {
        this.dbSearchTxt = ''
        this.loadDatabase()
      }
    },

    handleDBInput: debounce(function () {
      this.loadDatabase()
    }, 100),

    handleAddTable() {
      this.dialogData.visible = !this.stateIsReadonly
    },

    handleSaveTable(name) {
      this.$emit('add-table-as-node', this.getNodeProps(this.activeConnection, name))
    },

    updateDBScrollbar() {
      setTimeout(this.$refs.dbList.update, 350)
    },

    updateTBScrollbar() {
      setTimeout(this.$refs.tbList.update, 350)
    },

    updateProcessorScrollbar() {
      setTimeout(this.$refs.processorList.update, 350)
    },

    getNodeProps(connection, tableName) {
      // 设置pdk节点配置默认值
      const pdkProperties = this.$store.state.dataflow.pdkPropertiesMap[connection.pdkHash]
      let nodeConfig
      if (pdkProperties) {
        nodeConfig = getInitialValuesInBySchema(pdkProperties, {})
      }
      return {
        name: tableName || connection.name,
        type: 'table',
        databaseType: connection.database_type,
        connectionId: connection.id,
        tableName,
        nodeConfig,
        attrs: {
          connectionName: connection.name,
          connectionType: connection.connection_type,
          accessNodeProcessId: connection.accessNodeProcessId,
          pdkType: connection.pdkType,
          pdkHash: connection.pdkHash,
          capabilities: connection.capabilities || []
          /*capabilities: [
            ...(connection.capabilities || []),
            {
              id: 'new_field_function',
              type: 11
            }
          ]*/
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
$itemH: 30px;
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

  ::v-deep {
    .db-list-container {
      max-height: 50%;
      .el-collapse-item:last-child {
        margin-bottom: -1px;
      }

      .el-collapse-item__header {
        color: map-get($fontColor, normal) !important;
      }
    }

    .click-btn {
      width: 24px !important;
      height: 24px !important;
      z-index: 2;
      border-radius: 4px;

      &:hover,
      &.active {
        color: map-get($color, primary);
        background: $hoverBg;
      }

      &-disabled {
        color: currentColor;
        cursor: not-allowed;
        &:hover {
          color: currentColor;
          background: rgba(242, 243, 245);
        }
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
    .tb-item,
    .node-item {
      height: 28px;
      font-size: $fontBaseTitle;
      &.active {
        background-color: #eef3ff;
      }

      &:not(.active):hover {
        background-color: rgba(47, 46, 63, 0.05);
      }

      .el-image {
        width: 20px;
        height: 20px;
        vertical-align: middle;
      }
    }

    .db-item {
      margin-bottom: 4px;
      height: 42px;
      line-height: normal;

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
            height: calc(100% - $headerH);
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
      font-size: $fontBaseTitle;
      line-height: 1;
      white-space: nowrap;
    }
  }
}

::v-deep {
  .connection-dialog {
    .el-dialog__body {
      padding: 0 20px 30px 20px;
    }
  }
}
</style>
