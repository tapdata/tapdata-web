<script>
import { connectionsApi, lineageApi, metadataDefinitionsApi } from '@tap/api'
import SceneDialog from '@tap/business/src/components/create-connection/SceneDialog.vue'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import UpgradeCharges from '@tap/business/src/components/UpgradeCharges.vue'
import UpgradeFee from '@tap/business/src/components/UpgradeFee.vue'
import { EventEmitter } from '@tap/business/src/shared'
import { IconButton } from '@tap/component/src/icon-button'
import { jsPlumb } from '@tap/dag/src/instance'
import Catalogue from './components/Catalogue'
import ConnectionPreview from './ConnectionPreview'
import FDMItem from './FDM'
import MDMItem from './MDM'
import Settings from './Settings'
import SourceItem from './Source'
import TablePreview from './TablePreview'
import TargetItem from './Target'

const TYPE2NAME = {
  target: 'TARGET&SERVICE',
}

export default {
  name: 'Dashboard',

  components: {
    SourceItem,
    TargetItem,
    FDMItem,
    MDMItem,
    Settings,
    TablePreview,
    ConnectionPreview,
    IconButton,
    Catalogue,
    SceneDialog,
    UpgradeFee,
    UpgradeCharges,
    PageContainer,
  },

  data() {
    return {
      keyword: '',
      visible: false,
      isDaas: import.meta.env.VUE_APP_PLATFORM === 'DAAS',
      showSceneDialog: false,
      settingsVisible: false,
      dragState: {
        isDragging: false,
        draggingObjects: [],
        dropNode: null,
        form: '',
      },
      mode: '',
      selectorType: '',
      settings: {
        mode: 'integration',
        fdmStorageCluster: 'self',
        fdmStorageConnectionId: '',
        mdmStorageCluster: 'self',
        mdmStorageConnectionId: '',
      },
      directoryMap: {},
      fdmConnection: null,
      fdmNotExist: false,
      mdmConnection: null,
      mdmNotExist: false,
      loadingDirectory: true,
      eventDriver: new EventEmitter(),
      currentView: 'swimlane',
      parentNodeDom: null,
      preLinkNodes: [],
      nextLinkNodes: [],
      connectionLines: [],
      jsPlumbIns: jsPlumb.getInstance(),
      showParentLineage: false,
      nodes: [],
      edgsLinks: [],
      upgradeFeeVisible: false,
      upgradeFeeVisibleTips: '',
      upgradeChargesVisible: false,
      upgradeChargesVisibleTips: '',
    }
  },

  computed: {
    laneOptions() {
      const result = [
        {
          type: 'source',
          add: true,
          component: 'SourceItem',
          level: 'base',
        },
        {
          component: 'FDMItem',
          type: 'fdm',
        },
        {
          component: 'MDMItem',
          type: 'mdm',
        },
        {
          type: 'target',
          add: true,
          component: 'TargetItem',
          level: 'base',
        },
      ]
      return this.mode === 'service'
        ? result
        : result.filter((t) => t.level === 'base')
    },

    fdmAndMdmId() {
      return [
        this.settings?.fdmStorageConnectionId,
        this.settings?.mdmStorageConnectionId,
      ]
    },
  },

  watch: {
    'settings.mdmStorageConnectionId': async function (v) {
      this.mdmConnection = await connectionsApi.getNoSchema(v)
      this.mdmNotExist = !this.mdmConnection
    },

    'settings.fdmStorageConnectionId': async function (v) {
      this.fdmConnection = await connectionsApi.getNoSchema(v)
      this.fdmNotExist = !this.fdmConnection
    },

    currentView(type) {
      if (type === 'swimlane') {
        this.directoryMap = {}
        this.loadDirectory()
      }
    },
  },

  created() {
    this.loadDirectory()
  },

  mounted() {
    this.$nextTick(() => {
      this.jsPlumbIns.setContainer(this.$el)
      window.addEventListener('keydown', this.handleListenerEsc)
    })
  },

  beforeUnmount() {
    window.removeEventListener('keyword', this.handleListenerEsc)
    // 销毁画布实例
    this.jsPlumbIns?.destroy()
    this.targetDomSet = null
    this.otherDomSet = null
  },

  methods: {
    toggleView(view) {
      this.currentView = view
    },

    handleAdd(type) {
      this.selectorType = type
      this.showSceneDialog = true
    },

    handleSuccess(connection) {
      if (connection.connection_type === 'source_and_target') {
        this.$refs.source[0].addItem(connection)
        this.$refs.target[0].addItem(connection)
      } else {
        this.$refs[this.selectorType]?.[0]?.addItem(connection)
      }
    },

    handleDragEnd() {
      this.dragState.isDragging = false
      this.dragState.draggingObjects = []
      this.dragState.dropNode = null
      this.dragState.form = ''
    },

    handleSettings() {
      this.settingsVisible = true
    },

    handleSettingsSuccess(data) {
      this.mode = data.mode
      Object.assign(this.settings, data)
    },

    handleSettingsInit(settings) {
      Object.assign(this.settings, settings)
    },

    loadDirectory() {
      const filter = {
        where: {
          item_type: { $nin: ['database', 'dataflow', 'api'] },
        },
        /*fields: {
          id: 1,
          item_type: 1,
          last_updated: 1,
          value: 1,
          objCount: 1,
          parent_id: 1,
          desc: 1,
          readOnly: 1,
          user_id: 1
        }*/
      }
      this.loadingDirectory = true
      metadataDefinitionsApi
        .get({
          filter: JSON.stringify(filter),
        })
        .then((data) => {
          const items = data?.items || []
          const treeData = this.formatCatalog(items)
          treeData?.forEach((item) => {
            this.directoryMap[item.item_type[0]] = item
          })
        })
        .finally(() => {
          this.loadingDirectory = false
        })
    },

    mapCatalog(item) {
      item.LDP_TYPE = 'folder'
      item.children = []

      if (item.parent_id) {
        item.name = item.value
      } else {
        const itemType = item.item_type[0]
        item.name = TYPE2NAME[itemType] || item.value
        item.readOnly = itemType !== 'mdm'
      }

      return item
    },

    formatCatalog(items) {
      if (items && items.length) {
        const map = {}
        const nodes = []
        const setChildren = (nodes) => {
          return nodes.map((it) => {
            const children = map[it.id]
            if (children) {
              it.children = setChildren(children)
            }
            return it
          })
        }

        items.forEach((it) => {
          this.mapCatalog(it)
          if (it.parent_id) {
            const children = map[it.parent_id] || []
            children.push(it)
            map[it.parent_id] = children
          } else {
            nodes.push(it)
          }
        })

        return setChildren(nodes)
      }
    },

    handlePreview(data, connection, callback) {
      switch (data.LDP_TYPE) {
        case 'table':
          this.$refs.tablePreview.open(data, connection, callback)
          break
        case 'connection':
          this.$refs.connectionView.open(data)
          break
      }
    },

    hanldeCreateSingleTask(data = {}, swimType = '') {
      switch (swimType) {
        case 'source':
        case 'mdm':
          this.openRoute({
            name: 'DataflowNew',
            query: {
              addNode: true,
              connectionId: data.connectionId,
              tableName: data.name,
            },
          })
          break
        case 'fdm':
          this.openRoute({
            name: 'MigrateCreate',
            query: {
              addNode: true,
              connectionId: data.connectionId,
              tableName: data.name,
            },
          })
          break
        default:
          break
      }
    },

    openRoute(route, newTab = true) {
      if (newTab) {
        window.open(this.$router.resolve(route).href)
      } else {
        this.$router.push(route)
      }
    },

    handleFindParent(parentNode, tableInfo = {}, ldpType = 'mdm') {
      lineageApi
        .findByTable(tableInfo.connectionId, tableInfo.name)
        .then((data) => {
          const { edges, nodes } = data.dag || {}
          this.nodes = nodes
          const otherLdpType = ldpType === 'mdm' ? 'fdm' : 'mdm'
          const edgsLinks = edges.map((t) => {
            const sourceNode = this.nodes.find((el) => el.id === t.source)
            const targetNode = this.nodes.find((el) => el.id === t.target)
            sourceNode.dom = null
            targetNode.dom = null
            sourceNode.ldpType =
              sourceNode.type === 'apiserverLineage'
                ? 'target'
                : this.settings.fdmStorageConnectionId ===
                    sourceNode.connectionId
                  ? otherLdpType
                  : 'source'
            targetNode.ldpType =
              targetNode.type === 'apiserverLineage'
                ? 'target'
                : this.settings.fdmStorageConnectionId ===
                    targetNode.connectionId
                  ? otherLdpType
                  : 'source'
            // 记录事件触发的dom和ldpType
            if (sourceNode.table === tableInfo.name) {
              sourceNode.ldpType = ldpType
              sourceNode.dom = parentNode
            } else if (targetNode.table === tableInfo.name) {
              targetNode.ldpType = ldpType
              targetNode.dom = parentNode
            }
            return Object.assign(t, {
              sourceNode,
              targetNode,
            })
          })
          this.edgsLinks = edgsLinks

          this.showParentLineage = true
          this.handleConnection()
        })
    },

    async handleConnection() {
      if (!this.showParentLineage) return
      const connectionLines = []

      // 获取dom的方法
      const map = {
        source: this.$refs.source[0].handleFindTreeDom,
        target: this.$refs.target[0].handleFindTaskDom,
        mdm() {},
        fdm: this.$refs.fdm[0].handleFindTreeDom,
      }

      // 需要过滤的数据
      const keywordOptions = {
        source: [],
        target: [],
        fdm: [],
        mdm: [],
      }
      this.nodes.forEach((el) => {
        if (el.ldpType === 'target') {
          if (el.type === 'apiserverLineage') {
            const { table, modules = {} } = el || {}
            const { appName, name } = Object.values(modules)[0] || {}
            keywordOptions[el.ldpType].push({
              table,
              appName,
              serverName: name,
              type: el.type,
            })
          }
        } else {
          const {
            connectionId,
            connectionName,
            pdkHash,
            table,
            metadata = {},
          } = el || {}
          // ldpType为source，且是连线目标节点的ldpType也为source，则过滤不展示
          const flag =
            el.ldpType === 'source' &&
            this.edgsLinks.some(
              (t) =>
                t.sourceNode?.id === el.id &&
                t.targetNode?.ldpType === 'source',
            )
          if (!flag) {
            keywordOptions[el.ldpType]?.push({
              connectionId,
              connectionName,
              pdkHash,
              table,
              tableId: metadata.id,
            })
          }
        }
      })

      // 过滤source列表
      if (keywordOptions) {
        this.$refs.source[0].searchByKeywordList(keywordOptions.source)
        this.$refs.target[0].searchByKeywordList(keywordOptions.target)
        this.$refs.fdm[0].searchByKeywordList(keywordOptions.fdm)
      }

      const targetDom = new Set()
      const otherDom = new Set()

      this.$nextTick(() => {
        this.edgsLinks.forEach((el) => {
          const { sourceNode, targetNode } = el || {}
          const sDom = sourceNode.dom || map[sourceNode.ldpType](sourceNode)
          const tDom = targetNode.dom || map[targetNode.ldpType](targetNode)
          // 过滤掉source节点连线到source节点的情况
          if (targetNode.ldpType !== 'source') {
            connectionLines.push([sDom, tDom])
          }

          otherDom.add(sDom)

          if (targetNode.ldpType === 'target') {
            targetDom.add(tDom)
          } else {
            otherDom.add(tDom)
          }
        })

        this.connectionLines = connectionLines

        this.jsPlumbIns.reset()
        this.connectionLines.forEach((el = []) => {
          const [source, target] = el
          this.jsPlumbIns.connect({
            source, // 源节点
            target, // 目标节点
            endpoint: 'Dot', // 端点的样式，可以设置Dot、Rectangle、image、Blank
            connector: ['Bezier', { gap: 20 }], // 连接线 Bezier(贝塞尔曲线) Straight(直线) Flowchart(垂直或水平线组成的连接) StateMachine
            anchor: ['Left', 'Right'], // 锚点位置
            endpointStyle: { fill: 'rgba(255, 255, 255, 0)', radius: 2 },
            paintStyle: {
              strokeWidth: 2,
              stroke: '#2C65FF',
              dashstyle: '2 4',
              gap: 20,
            },
            overlays: [
              [
                'Arrow',
                {
                  width: 10,
                  length: 10,
                  location: 1,
                  id: 'arrow',
                  foldback: 1,
                  fill: '#2C65FF',
                },
              ],
            ],
          })
        })

        // 缓存所有dom node
        this.targetDomSet = targetDom
        this.otherDomSet = otherDom
      })
    },

    handleQuit() {
      this.showParentLineage = false
      this.jsPlumbIns.reset()
    },

    handleListenerEsc(e) {
      if (e.keyCode === 27 && this.showParentLineage) {
        this.handleQuit()
      }
    },

    upgradeFeeGoPage() {
      const routeUrl = this.$router.resolve({
        name: 'createAgent',
      })
      window.open(routeUrl.href, '_blank')
    },

    // 升级专业版
    handleShowUpgradeFee(msg) {
      this.upgradeFeeVisibleTips = msg
      this.upgradeFeeVisible = true
    },

    // 升级规格
    handleShowUpgradeCharges(msg) {
      this.upgradeChargesVisibleTips = msg
      this.upgradeChargesVisible = true
    },

    handleShowUpgradeDialog(err = {}) {
      !this.isDaas &&
        this.$axios
          .get(
            `api/tcm/agent?filter=${encodeURIComponent(
              JSON.stringify({
                size: 100,
                page: 1,
              }),
            )}`,
          )
          .then(async (data) => {
            const { items = [] } = data

            if (items.some((t) => t.status === 'Stopped')) {
              this.$message.error(this.$t('public_task_error_schedule_limit'))
              return
            }

            items.length <= 1 &&
            items.some(
              (t) =>
                t.orderInfo?.chargeProvider === 'FreeTier' ||
                !t.orderInfo?.amount,
            )
              ? this.handleShowUpgradeFee(err.message)
              : this.handleShowUpgradeCharges(err.message)
          })
    },

    handleCreateAPI(connection, tableOjb) {
      this.$refs.target[0]?.createAPI(connection, tableOjb)
    },

    onScroll() {
      if (this.showParentLineage) {
        for (const el of this.otherDomSet) {
          this.jsPlumbIns.revalidate(el)
        }

        // 后面可对api节点特殊处理
        for (const el of this.targetDomSet) {
          this.jsPlumbIns.revalidate(el)
        }
      }
    },
  },
}
</script>

<template>
  <PageContainer header-class="position-relative">
    <template #left-actions>
      <ElTooltip
        v-if="currentView === 'swimlane'"
        placement="top"
        :content="$t('packages_business_switch_directory_view')"
      >
        <IconButton class="ml-2" md @click="toggleView('catalog')"
          >list-view</IconButton
        >
      </ElTooltip>
      <ElTooltip
        v-else
        placement="top"
        :content="$t('packages_business_switch_data_console_view')"
      >
        <IconButton class="ml-2" md @click="toggleView('swimlane')"
          >swimlane</IconButton
        >
      </ElTooltip>
    </template>

    <template #actions>
      <span
        v-if="showParentLineage"
        class="parent-lineage-quit color-linfo cursor-pointer rounded-2 px-4 py-2 position-absolute top-50 start-50 translate-middle"
        @click="handleQuit"
        >{{ $t('packages_ldp_src_dashboard_anEsctui') }}</span
      >
      <IconButton
        v-if="isDaas || $route.path === '/data-console'"
        class="ml-auto"
        lg
        @click="handleSettings"
        >cog-o</IconButton
      >
    </template>
    <div
      class="swim-lane flex flex-column h-100 position-relative overflow-hidden"
    >
      <div
        class="list flex flex-fill overflow-hidden bg-white border rounded-xl"
      >
        <div v-if="currentView === 'catalog'" class="px-5 pb-5 w-100">
          <Catalogue @create-single-task="hanldeCreateSingleTask" />
        </div>
        <template v-else>
          <component
            :is="item.component"
            v-for="item in laneOptions"
            :key="item.type"
            :ref="item.type"
            :drag-state="dragState"
            :settings="settings"
            :directory="directoryMap[item.type]"
            :fdm-connection="fdmConnection"
            :fdm-not-exist="fdmNotExist"
            :mdm-not-exist="mdmNotExist"
            :mdm-connection="mdmConnection"
            :event-driver="eventDriver"
            :loading-directory="loadingDirectory"
            :fdm-and-mdm-id="fdmAndMdmId"
            :map-catalog="mapCatalog"
            :show-parent-lineage="showParentLineage"
            @create-connection="handleAdd"
            @node-drag-end="handleDragEnd"
            @show-settings="handleSettings"
            @load-directory="loadDirectory"
            @preview="handlePreview"
            @find-parent="handleFindParent"
            @on-scroll="onScroll"
            @handle-show-upgrade="handleShowUpgradeDialog"
          />
        </template>
      </div>
      <SceneDialog
        v-model:visible="showSceneDialog"
        v-model:selector-type="selectorType"
        @success="handleSuccess"
        @save-and-more="handleSuccess"
      />
      <Settings
        v-model:mode="mode"
        v-model:visible="settingsVisible"
        :fdm-connection="fdmConnection"
        :mdm-connection="mdmConnection"
        @success="handleSettingsSuccess"
        @init="handleSettingsInit"
      />
      <TablePreview
        ref="tablePreview"
        @create-single-task="hanldeCreateSingleTask"
        @handle-show-upgrade="handleShowUpgradeDialog"
        @create-api="handleCreateAPI"
      />
      <ConnectionPreview ref="connectionView" />

      <UpgradeFee
        v-model:visible="upgradeFeeVisible"
        :tooltip="
          upgradeFeeVisibleTips ||
          $t('packages_business_task_list_nindekeyunxing')
        "
        :go-page="upgradeFeeGoPage"
      />

      <UpgradeCharges
        v-model:visible="upgradeChargesVisible"
        :tooltip="
          upgradeChargesVisibleTips ||
          $t('packages_business_task_list_nindekeyunxing')
        "
        :go-page="upgradeFeeGoPage"
      />
    </div>
  </PageContainer>
</template>

<style lang="scss" scoped>
.box-card {
  border-top-right-radius: 8px;
  border-top-left-radius: 8px;
}
.list {
  :deep(.list__title) {
    height: 48px;
    min-height: 48px;
    background: #f3f7fa;
  }

  :deep(.list__title__source) {
    color: map.get($color, primary);
    background: #e8f3ff;
  }

  :deep(.list__title__target) {
    color: #009a29;
    background: #e8ffea;
  }

  :deep(.list__item) {
    border-left: 1px solid #e1e3e9;
    &:first-child {
      border-left: none;
    }
  }

  :deep(.icon-color) {
    &:hover {
      background-color: map.get($bgColor, hover);
    }
  }
}
.swim-lane {
  :deep(.drop-mask) {
    display: none;
    pointer-events: none;
    backdrop-filter: blur(4px);
    background-color: rgba(255, 255, 255, 0.4);
  }

  :deep(.ldp-tree.is-drop),
  :deep(.is-drop .ldp-tree) {
    box-shadow: 0px 0px 0px 2px map.get($color, primary) inset;
    & + .drop-mask {
      display: none !important;
    }
  }

  :deep(.is-drop .drop-mask) {
    display: none !important;
  }

  :deep(.pipeline-desc) {
    background-color: #f8f8fa;
    border-left: 4px solid map.get($color, primary);
    line-height: 22px;
    li {
      margin-left: 20px;
      padding-left: 4px;
      list-style-type: circle;
    }
  }

  :deep(.table-status-dot) {
    left: -16px;
    width: 8px;
    height: 8px;
    background-color: #d9d9d9;
  }

  :deep(.inline-flex-input) {
    .el-input-group__prepend {
      flex-shrink: 0;
    }
    .el-input-group__append,
    .el-input-group__prepend {
      width: auto;
      line-height: 30px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    input {
      width: auto;
    }

    .list__title {
      z-index: 5;
    }
  }
  .page-header-title {
    z-index: 5;
  }
}
.icon {
  -moz-transform: rotate(-180deg);
  -webkit-transform: rotate(-180deg);
}
.parent-lineage-quit {
  background-color: #333c4a;
}
</style>
