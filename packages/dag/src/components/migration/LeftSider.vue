<script>
import { CancelToken, fetchConnections, fetchDatabaseTypes } from '@tap/api'
import SceneDialog from '@tap/business/src/components/create-connection/SceneDialog.vue'
import { VEmpty } from '@tap/component/src/base/v-empty'
import { mouseDrag } from '@tap/component/src/directives/mousedrag'
import resize from '@tap/component/src/directives/resize'
import { OverflowTooltip } from '@tap/component/src/overflow-tooltip'
import { getInitialValuesInBySchema } from '@tap/form/src/shared/validate'
import { debounce, escapeRegExp } from 'lodash-es'
import { markRaw } from 'vue'
import { mapGetters } from 'vuex'
import BaseNode from '../BaseNode.vue'
import ConnectionType from '../ConnectionType.vue'
import NodeIcon from '../NodeIcon.vue'

export default {
  name: 'LeftSider',
  components: {
    SceneDialog,
    NodeIcon,
    VEmpty,
    OverflowTooltip,
    BaseNode,
    ConnectionType,
  },
  directives: {
    mouseDrag,
    resize,
  },
  data() {
    return {
      collapseMode: 'db',
      processCollapseActive: 'process',
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

      database: [],
      comingAllowDatabase: [], // 即将上线
      otherType: [],
      automationType: '', //插件化数据源
      connectionType: 'source',
    }
  },
  computed: {
    ...mapGetters('dataflow', [
      'processorNodeTypes',
      'getCtor',
      'stateIsReadonly',
    ]),

    noDBMore() {
      return this.dbPage >= Math.ceil(this.dbTotal / 20)
    },

    disabledDBMore() {
      return this.dbLoading || this.noDBMore || this.dbLoadingMore
    },
  },
  async created() {
    await this.getDatabaseType()

    this.init()
  },

  methods: {
    // 创建连接
    creat() {
      this.connectionDialog = !this.stateIsReadonly
    },
    async getDatabaseType() {
      await fetchDatabaseTypes().then((res) => {
        if (res) {
          this.getPdkData(res)
        }
      })
    },
    getPdkData(data) {
      this.database.push(...data)
    },
    async init() {
      await this.loadDatabase()
    },

    getDbFilter() {
      const databaseTypeList =
        this.database
          ?.map((t) => t.type)
          .filter((t) => !['CSV', 'EXCEL', 'JSON', 'XML'].includes(t)) || []
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
          priorityProcessId: 1,
          pdkType: 1,
          pdkHash: 1,
          capabilities: 1,
          config: 1,
          connectionString: 1,
          encryptConfig: 1,
        },
        order: ['status DESC', 'name ASC'],
        where: {
          database_type: {
            in: databaseTypeList,
          },
          createType: {
            $ne: 'System',
          },
        },
      }
      const txt = escapeRegExp(this.dbSearchTxt.trim())

      if (txt) {
        filter.where.name = { like: txt, options: 'i' }
      }

      return filter
    },

    async loadDatabase(loadMore) {
      this.connectionCancelSource?.cancel()
      this.connectionCancelSource = CancelToken.source()

      if (loadMore) {
        this.dbPage++
        this.dbLoadingMore = true
      } else {
        this.dbLoading = true
        this.dbPage = 1
        this.dbTotal = 0
      }

      const data = await fetchConnections(this.getDbFilter(), {
        cancelToken: this.connectionCancelSource.token,
      })

      this.dbTotal = data.total

      const dbList = data.items.map((item) => {
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
        dbList.forEach((item) => {
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
        this.dbIdMap = dbList.reduce(
          (map, item) => ((map[item.id] = true), map),
          {},
        )
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

    async getDragDom() {
      await this.$nextTick()
      return document.querySelector('#dragNode')
    },

    onStart(item) {
      if (this.stateIsReadonly) return false
      const node = this.getNodeProps(item)
      const getResourceIns = this.$store.getters['dataflow/getResourceIns']
      const ins = getResourceIns(node)
      Object.defineProperty(node, '__Ctor', {
        value: ins,
        enumerable: false,
      })
      this.dragNode = node
      this.dragStarting = true
      this.dragMoving = false
    },

    onProcessorStart(item) {
      if (this.stateIsReadonly) return false
      const node = item
      const getResourceIns = this.$store.getters['dataflow/getResourceIns']
      if (!item.__Ctor) {
        const ins = getResourceIns(node)

        Object.defineProperty(node, '__Ctor', {
          value: markRaw(ins),
          enumerable: false,
          configurable: true,
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
      if (this.$refs.dbList) this.$refs.dbList.setScrollTop(0)
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
      // 设置pdk节点配置默认值
      const pdkProperties =
        this.$store.state.dataflow.pdkPropertiesMap[item.pdkHash]
      let nodeConfig = {}
      const attrs = {
        connectionName: item.name,
        connectionType: item.connection_type,
        accessNodeProcessId: item.accessNodeProcessId,
        priorityProcessId: item.priorityProcessId,
        pdkType: item.pdkType,
        pdkHash: item.pdkHash,
        capabilities: item.capabilities || [],
        db_version: item.db_version,
        connectionTags: item.definitionTags,
      }

      if (pdkProperties) {
        nodeConfig = getInitialValuesInBySchema(
          {
            properties: {
              attrs: {
                type: 'object',
                default: attrs,
              },
              $inputs: {
                default: [],
                type: 'array',
              },
              $outputs: {
                default: [],
                type: 'array',
              },
              wrap: {
                ...pdkProperties,
                type: 'void',
              },
            },
          },
          {},
        )
        delete nodeConfig.attrs
        delete nodeConfig.$inputs
        delete nodeConfig.$outputs
      }

      return {
        name: item.name,
        type: 'database',
        databaseType: item.database_type,
        connectionId: item.id,
        migrateTableSelectType: 'custom',
        nodeConfig,
        attrs,
        noPkSyncMode: 'ADD_HASH', // 无主键同步默认创建哈希列
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

    handleDatabaseType(item) {
      this.connectionDialog = false
      const { pdkHash, pdkId } = item
      this.$router.push({
        name: 'connectionCreate',
        query: { pdkHash, pdkId },
      })
    },

    /**
     * 双击数据节点快速添加到画布并连线
     * @param item
     */
    onDoubleClickDB(item) {
      if (this.stateIsReadonly) return

      this.$emit('add-node', this.getNodeProps(item))
    },

    /**
     * 双击处理节点快速添加到画布并连线
     * @param item
     */
    onDoubleClickProcessor(item) {
      if (this.stateIsReadonly) return

      this.$emit('add-node', item)
    },
  },
  emits: ['move-node', 'drop-node', 'add-node'],
}
</script>

<template>
  <aside class="layout-sidebar --left border-end flex-column flex-shrink-0">
    <div class="flex flex-column flex-1 min-h-0">
      <ElCollapse
        ref="dbCollapse"
        v-model="collapseMode"
        class="collapse-fill h-100"
        accordion
        expand-icon-position="left"
      >
        <ElCollapseItem name="db">
          <template #title>
            <div class="flex align-center flex-1 overflow-hidden">
              <el-icon class="mr-2"><i-lucide:database /></el-icon>
              <span
                class="flex-1 user-select-none text-truncate flex align-center"
              >
                <!--连接-->
                {{ $t('packages_dag_dag_connection') }}
                <span v-show="dbTotal > 0" class="badge">{{ dbTotal }}</span>
              </span>

              <el-button
                id="connection-search-btn"
                text
                size="small"
                :class="{ 'is-active': showDBInput }"
                @click.stop="handleShowDBInput"
              >
                <template #icon>
                  <VIcon size="18" @click.stop="handleShowDBInput"
                    >search-outline</VIcon
                  >
                </template>
              </el-button>
              <el-button
                text
                size="small"
                class="ml-1"
                :disabled="stateIsReadonly"
                @mousedown.stop
                @click.stop="creat"
              >
                <template #icon>
                  <VIcon size="20">add-outline</VIcon>
                </template>
              </el-button>
            </div>
          </template>
          <div class="flex flex-column h-100">
            <div v-show="showDBInput" class="p-2 pb-0">
              <ElInput
                id="connection-search-input"
                ref="dbInput"
                v-model="dbSearchTxt"
                :placeholder="
                  $t('packages_dag_connection_name_search_placeholder')
                "
                clearable
                @keydown.stop
                @keyup.stop
                @click.stop
                @input="handleDBInput"
              >
                <template #prefix>
                  <VIcon size="14" class="h-100">search-outline</VIcon>
                </template>
              </ElInput>
            </div>

            <ElScrollbar
              ref="dbList"
              class="flex-1"
              tag="div"
              wrap-class="db-list"
            >
              <ElSkeleton
                :loading="dbLoading"
                animated
                :throttle="skeletonThrottle"
              >
                <template #template>
                  <div v-for="i in 5" :key="i" class="flex p-4 align-center">
                    <ElSkeletonItem
                      class="mr-3 flex-shrink-0"
                      style="width: 20px; height: 20px"
                      variant="rect"
                    />
                    <ElSkeletonItem variant="text" />
                  </div>
                </template>
                <div
                  v-infinite-scroll="loadMoreDB"
                  :infinite-scroll-disabled="disabledDBMore"
                  class="p-2"
                >
                  <div
                    v-for="db in dbList"
                    :key="db.id"
                    v-mouse-drag="{
                      item: db,
                      container: '#dfEditorContent',
                      getDragDom,
                      onStart,
                      onMove,
                      onDrop,
                      onStop,
                    }"
                    class="db-item flex align-center px-1 user-select-none rounded-lg"
                    :class="{ grabbable: !stateIsReadonly }"
                    @dblclick="onDoubleClickDB(db)"
                  >
                    <div class="flex-shrink-0 mr-2 db-item-icon">
                      <NodeIcon :node="db" />
                    </div>
                    <div
                      class="flex flex-column justify-center db-item-content"
                    >
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
                        class="w-100 text-truncate fs-8"
                        placement="right"
                        :disabled="dragStarting"
                        :text="db.connectionUrl"
                        :open-delay="400"
                      />
                    </div>
                  </div>
                  <VEmpty v-if="!dbList.length" />
                  <div
                    v-if="dbLoadingMore"
                    class="text-center text-black-50 fs-8 p-2"
                  >
                    {{ $t('packages_dag_loading') }}<span class="dotting" />
                  </div>
                </div>
              </ElSkeleton>
            </ElScrollbar>
          </div>
        </ElCollapseItem>
      </ElCollapse>
    </div>

    <ElCollapse
      ref="processorCollapse"
      v-model="processCollapseActive"
      class="collapse-fill processor-collapse border-top"
      expand-icon-position="left"
    >
      <ElCollapseItem name="process">
        <template #title>
          <div class="flex align-center flex-1 user-select-none">
            <VIcon size="16" class="mr-2">custom-node</VIcon>
            <!--处理节点-->
            {{ $t('public_node_processor') }}
          </div>
        </template>
        <ElScrollbar ref="processorList" tag="div" wrap-class="p-2">
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
              onStop,
            }"
            class="node-item flex align-center px-2 user-select-none rounded-lg"
            :class="{ grabbable: !stateIsReadonly }"
            @dblclick="onDoubleClickProcessor(n)"
          >
            <NodeIcon class="flex-shrink-0 mr-2" :node="n" />
            <OverflowTooltip
              :text="n.name"
              :disabled="dragStarting"
              popper-class="df-node-text-tooltip"
              placement="top"
              :open-delay="400"
            />
            <VIcon v-if="n.beta" class="ml-1" size="32">beta</VIcon>
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
    />
    <!-- E 节点拖拽元素 -->

    <!--创建连接-->
    <SceneDialog
      v-model:visible="connectionDialog"
      selector-type="source_and_target"
      @selected="handleDatabaseType"
    />
  </aside>
</template>

<style lang="scss" scoped>
$hoverBg: #eef3ff;

.drag-node {
  position: fixed !important;
  z-index: 1000;
  pointer-events: none;
  opacity: 0;
  transform-origin: center center;
}

.layout-sidebar.--left {
  overflow: visible;
  will-change: width;
  $headerH: 40px;
  --header-bg: var(--N100);

  .connection-tabs {
    position: relative;
    font-size: 0.875rem;

    &-pane {
      position: relative;
      height: 40px;
      cursor: pointer;

      &:hover {
        color: var(--color-primary);
      }

      &.active {
        color: var(--color-primary);

        &:before {
          position: absolute;
          content: '';
          height: 2px;
          background: var(--color-primary);
          left: 12px;
          right: 12px;
          bottom: 0;
        }
      }
    }
  }

  :deep(.type-tabs) {
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

  :deep(.db-list-container) {
    --el-collapse-border-color: var(--border-color) !important;
    max-height: 50%;

    .el-collapse-item:last-child {
      margin-bottom: -2px;
    }
  }

  :deep(.click-btn) {
    width: 24px !important;
    height: 24px !important;
    z-index: 2;
    border-radius: 4px;

    .click-btn-disabled {
      color: currentColor;
      cursor: not-allowed;

      &:hover {
        color: currentColor;
        background: rgba(242, 243, 245);
      }
    }
  }

  :deep(.click-btn:hover) {
    color: var(--color-primary);
    background: $hoverBg;
  }

  :deep(.badge) {
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

  :deep(.tb-header) {
    position: relative;
    height: $headerH;
    font-size: 14px;
    font-weight: 500;
    border-bottom: 1px solid transparent;

    .tb-header-icon {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
    }
  }

  :deep(*) {
    .db-item,
    .node-item {
      height: 42px;
      margin-bottom: 4px;
      font-size: 13px;
      line-height: normal;

      &.active {
        background-color: var(--primary-hover-light);
        color: var(--el-color-primary);
      }

      &:not(.active):hover {
        background-color: rgba(47, 46, 63, 0.05);
      }

      .el-image {
        width: 20px;
        height: 20px;
        vertical-align: middle;
      }

      &-icon {
        padding: 4px;
        border-radius: 50%;
      }

      &-content {
        overflow: hidden;

        > :last-child {
          color: rgba(0, 0, 0, 0.3);
        }
      }

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  :deep(.node-item) {
    height: 30px;

    .el-image {
      width: 20px;
      height: 20px;
    }
  }

  :deep(.tb-item-icon) {
    width: 20px;
    height: 20px;
    background-color: #6236ff;
    text-align: center;
    border-radius: 100%;
  }

  :deep(.el-collapse) {
    --el-collapse-header-bg-color: var(--header-bg);
    border-top: 0;

    &.processor-collapse {
      max-height: 30%;
    }

    &.collapse-fill {
      .el-collapse-item:first-child:last-child {
        height: 100%;

        .el-collapse-item__wrap {
          height: calc(100% - #{$headerH - 1});
          border-bottom: none;
        }

        .el-collapse-item__content {
          height: 100%;
        }
      }
    }

    .el-collapse-item {
      &.is-active [role='tab'] {
        position: sticky;
        top: 0;
        z-index: 1;
      }

      &__header {
        position: relative;
        height: $headerH;
        font-size: 14px;
        border-bottom: 1px solid var(--border-color) !important;
      }

      &__content {
        padding: 0;
      }
    }
  }

  :deep(.el-scrollbar) {
    height: 100%;
  }

  :deep(.header__input) {
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
      font-size: var(--font-base-title);
      line-height: 1;
      white-space: nowrap;
    }
  }
}
</style>
