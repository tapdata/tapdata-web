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
                  {{ $t('dag_connection') }}
                  <span v-show="dbTotal > 0" class="badge">{{ dbTotal }}</span>
                </span>
                <VIcon size="20" class="click-btn" @click.stop="creat">add-outline</VIcon>
                <VIcon size="20" class="click-btn" @click.stop="handleShowDBInput">search-outline</VIcon>
              </template>
              <span v-else class="flex-1 user-select-none text-truncate">{{ activeConnection.name }}</span>
              <ElInput
                v-if="showDBInput"
                v-model="dbSearchTxt"
                ref="dbInput"
                class="header__input"
                :placeholder="$t('connection_name_search_placeholder')"
                size="mini"
                clearable
                @keydown.native.stop
                @keyup.native.stop
                @click.native.stop
                @input="handleDBInput"
                @blur="handleBlur"
                @clear="handleShowDBInput"
              >
                <template #prefix>
                  <VIcon size="14" class="ml-1 h-100">magnify</VIcon>
                </template>
              </ElInput>
            </div>
          </template>
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
              <div v-infinite-scroll="loadMoreDB" :infinite-scroll-disabled="disabledDBMore" class="px-2 pt-1">
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
                  :class="{ active: activeConnection.id === db.id }"
                  @click="handleSelectDB(db)"
                >
                  <NodeIcon class="flex-shrink-0 mr-2" :node="db" />
                  <div class="db-item-txt text-truncate">{{ db.name }}</div>
                </div>
                <EmptyItem v-if="!dbList.length"></EmptyItem>
                <div v-if="dbLoadingMore" class="text-center text-black-50 fs-8 p-2">
                  {{ $t('loading') }}<span class="dotting"></span>
                </div>
              </div>
            </ElSkeleton>
          </ElScrollbar>
        </ElCollapseItem>
      </ElCollapse>

      <div class="flex-1 min-h-0 flex flex-column border-bottom">
        <div class="tb-header flex align-center px-4">
          <span class="flex-1 user-select-none text-truncate flex align-center">
            <!--表-->
            {{ $t('dag_table') }}
            <span v-show="tbTotal > 0" class="badge">{{ tbTotal }}</span>
          </span>
          <!--创建新表作为节点使用-->
          <ElTooltip :content="$t('dag_create_table_as_node')" placement="top">
            <VIcon size="20" class="click-btn" @click.stop="handleAddTable">add-outline</VIcon>
          </ElTooltip>
          <VIcon size="20" class="click-btn" @click.stop="handleShowTBInput">search-outline</VIcon>

          <ElInput
            v-if="showTBInput"
            v-model="tbSearchTxt"
            ref="tbInput"
            class="header__input"
            :placeholder="$t('table_name_search_placeholder')"
            size="mini"
            clearable
            @keydown.native.stop
            @keyup.native.stop
            @click.native.stop
            @input="handleTBInput"
            @blur="handleTBBlur"
            @clear="handleShowTBInput"
          >
            <template #prefix>
              <VIcon size="14" class="ml-1 h-100">magnify</VIcon>
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
              <div v-infinite-scroll="loadMoreTable" :infinite-scroll-disabled="disabled" class="px-2 pt-1">
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
                  class="tb-item grabbable flex align-center px-2 user-select-none rounded-2"
                >
                  <OverflowTooltip :text="tb.name" placement="right" :open-delay="400"></OverflowTooltip>
                </div>
                <EmptyItem v-if="!tbList.length"></EmptyItem>
                <div v-if="tbLoadingMore" class="text-center text-black-50 fs-8 p-2">
                  {{ $t('loading') }}<span class="dotting"></span>
                </div>
              </div>
            </div>
          </ElSkeleton>
        </ElScrollbar>
      </div>
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
        <ElScrollbar ref="processorList" tag="div" wrap-class="px-3" :wrap-style="scrollbarWrapStyle">
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
            class="node-item grabbable flex align-center px-2 user-select-none rounded-2"
          >
            <NodeIcon class="flex-shrink-0 mr-2" :node="n" />
            <OverflowTooltip :text="n.name" popper-class="df-node-text-tooltip" placement="top" :open-delay="400" />
          </div>
        </ElScrollbar>
        <!--<ElScrollbar ref="processorList" tag="div" wrap-class="" :wrap-style="scrollbarWrapStyle">
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
        </ElScrollbar>-->
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

    <CreateTable :dialog="dialogData" @handleTable="handleSaveTable"></CreateTable>
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
import BaseNode from './BaseNode'
import { debounce } from 'lodash'
import { CancelToken, connectionsApi } from '@tap/api'
import { Select } from 'element-ui'
import { addResizeListener, removeResizeListener } from 'element-ui/src/utils/resize-event'
import OverflowTooltip from 'web-core/components/overflow-tooltip/OverflowTooltip'
import EmptyItem from 'web-core/components/EmptyItem'
import scrollbarWidth from 'element-ui/lib/utils/scrollbar-width'
import CreateTable from './CreateTable'
import NodeIcon from './NodeIcon'
import { metadataInstancesApi, databaseTypesApi } from '@tap/api'

export default {
  name: 'LeftSidebar',

  components: {
    NodeIcon,
    CreateTable,
    EmptyItem,
    OverflowTooltip,
    BaseNode,
    VIcon,
    // Form,
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
        title: this.$t('dialog.createTable'),
        placeholder: this.$t('dialog.placeholderTable'),
        visible: false
      }
    }
  },

  directives: {
    mouseDrag,
    resize
  },

  computed: {
    ...mapGetters('dataflow', ['processorNodeTypes', 'getCtor']),

    searchFilter() {
      return this.search.toLowerCase().trim()
    },

    filteredNodeTypes() {
      const nodeTypes = this.searchItems
      const filter = this.searchFilter

      return nodeTypes.filter(item => {
        return filter && item.name.toLowerCase().includes(filter)
      })
    },

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
    createConnection(item = {}) {
      this.connectionDialog = false
      const { pdkHash } = item
      let query = {
        pdkHash
      }
      this.$router.push({
        name: 'connectionsCreate',
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
        where: {
          // database_type: {
          //   $in: this.database
          // }
        },
        fields: {
          name: 1,
          id: 1,
          database_type: 1,
          connection_type: 1,
          status: 1,
          accessNodeType: 1,
          accessNodeProcessId: 1,
          accessNodeProcessIdList: 1,
          pdkType: 1,
          pdkHash: 1,
          pdkExpansion: 1
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

      const data = await connectionsApi.get(this.getDbFilter())

      this.dbTotal = data.total

      const dbList = data.items.map(item => {
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

    getTableFilter() {
      const filter = {
        page: this.tbPage,
        size: 20,
        where: {
          'source.id': this.activeConnection.id,
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

      const txt = this.tbSearchTxt.trim()
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
      this.initStart(node)
    },

    onTBStart(item) {
      const node = this.getNodeProps(this.activeConnection, item.name)
      this.initStart(node)
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

    handleTBBlur() {
      if (!this.tbSearchTxt.trim()) {
        this.showTBInput = false
      }
    },

    handleShowTBInput() {
      this.showTBInput = true
      this.$nextTick(() => {
        this.$refs.tbInput.focus()
      })
    },

    handleBlur() {
      if (!this.dbSearchTxt.trim()) {
        this.showDBInput = false
      }
    },

    handleShowDBInput() {
      this.showDBInput = true
      this.$nextTick(() => {
        this.$refs.dbInput.focus()
      })
    },

    handleDBInput: debounce(function () {
      this.loadDatabase()
    }, 100),

    handleAddTable() {
      this.dialogData.visible = true
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
      return {
        name: tableName || connection.name,
        type: 'table',
        databaseType: connection.database_type,
        connectionId: connection.id,
        tableName,
        attrs: {
          connectionName: connection.name,
          connectionType: connection.connection_type,
          accessNodeProcessId: connection.accessNodeProcessId,
          pdkType: connection.pdkType,
          pdkHash: connection.pdkHash,
          pdkExpansion: connection.pdkExpansion
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
    .tb-item,
    .node-item {
      margin-bottom: 4px;
      height: $itemH;
      font-size: 12px;
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
