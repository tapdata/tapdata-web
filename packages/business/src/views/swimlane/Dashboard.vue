<template>
  <div class="swim-lane flex flex-column h-100">
    <div class="page-header-title flex align-center">
      <span>{{ $t('page_title_data_console') }}</span>
      <div class="flex-grow-1"></div>
      <ElTooltip
        v-if="currentView === 'swimlane'"
        :content="$t('packages_business_switch_directory_view')"
        key="swimlane"
      >
        <IconButton @click="toggleView('catalog')" md>list-view</IconButton>
      </ElTooltip>
      <ElTooltip v-else :content="$t('packages_business_switch_data_console_view')" key="console">
        <IconButton @click="toggleView('swimlane')" md>swimlane</IconButton>
      </ElTooltip>
      <IconButton class="ml-3" @click="handleSettings" md>cog-o</IconButton>
    </div>
    <div class="list flex flex-fill overflow-hidden">
      <div v-if="currentView === 'catalog'" class="px-5 pb-5 w-100 border-top">
        <Catalogue></Catalogue>
      </div>
      <template v-else>
        <component
          v-for="(item, index) in laneOptions"
          :key="index"
          :is="item.component"
          :ref="item.component"
          :dragState="dragState"
          :settings="settings"
          :directory="directoryMap[item.type]"
          :fdmConnection="fdmConnection"
          :mdmConnection="mdmConnection"
          :event-driver="eventDriver"
          :loadingDirectory="loadingDirectory"
          :fdmAndMdmId="fdmAndMdmId"
          :mapCatalog="mapCatalog"
          @create-connection="handleAdd"
          @create-target="handleCreateTarget"
          @node-drag-end="handleDragEnd"
          @show-settings="handleSettings"
          @load-directory="loadDirectory"
          @preview="handlePreview"
        ></component>
      </template>
    </div>
    <CreateConnection
      :visible.sync="visible"
      :selector-type="selectorType"
      @success="handleSuccess"
      @saveAndMore="handleSuccess"
    ></CreateConnection>
    <SceneDialog
      :visible.sync="showSceneDialog"
      :selector-type="selectorType"
      @success="handleSuccess"
      @saveAndMore="handleSuccess"
    ></SceneDialog>
    <Settings
      :mode.sync="mode"
      :visible.sync="settingsVisible"
      @success="handleSettingsSuccess"
      @init="handleSettingsInit"
    ></Settings>
    <TablePreview ref="tablePreview" />
    <ConnectionPreview ref="connectionView" />
  </div>
</template>

<script>
import CreateConnection from '../../components/create-connection/Dialog'
import SceneDialog from '../../components/create-connection/SceneDialog'
import SourceItem from './Source'
import TargetItem from './Target'
import FDMItem from './FDM'
import MDMItem from './MDM'
import Settings from './Settings'
import TablePreview from './TablePreview'
import ConnectionPreview from './ConnectionPreview'
import { EventEmitter } from '../../shared'
import { IconButton } from '@tap/component'
import { connectionsApi, metadataDefinitionsApi } from '@tap/api'
import Catalogue from '../catalog/Catalogue'

const TYPE2NAME = {
  target: 'TARGET&SERVICE'
}

export default {
  name: 'Dashboard',

  components: {
    CreateConnection,
    SourceItem,
    TargetItem,
    FDMItem,
    MDMItem,
    Settings,
    TablePreview,
    ConnectionPreview,
    IconButton,
    Catalogue,
    SceneDialog
  },

  data() {
    return {
      keyword: '',
      visible: false,
      showSceneDialog: false,
      settingsVisible: false,
      dragState: {
        isDragging: false,
        draggingObjects: [],
        dropNode: null,
        form: ''
      },
      mode: '',
      selectorType: '',
      settings: null,
      directoryMap: {},
      fdmConnection: null,
      mdmConnection: null,
      loadingDirectory: true,
      eventDriver: new EventEmitter(),
      currentView: 'swimlane'
    }
  },

  computed: {
    laneOptions() {
      const result = [
        {
          type: 'source',
          add: true,
          component: 'SourceItem',
          level: 'base'
        },
        {
          component: 'FDMItem',
          type: 'fdm'
        },
        {
          component: 'MDMItem',
          type: 'mdm'
        },
        {
          type: 'target',
          add: true,
          component: 'TargetItem',
          level: 'base'
        }
      ]
      return this.mode === 'service' ? result : result.filter(t => t.level === 'base')
    },

    fdmAndMdmId() {
      return [this.settings?.fdmStorageConnectionId, this.settings?.mdmStorageConnectionId]
    }
  },

  watch: {
    async 'settings.mdmStorageConnectionId'(v) {
      console.log('settings.mdmStorageConnectionId', v) // eslint-disable-line
      this.mdmConnection = await connectionsApi.get(v)
    },

    async 'settings.fdmStorageConnectionId'(v) {
      console.log('settings.fdmStorageConnectionId', v) // eslint-disable-line
      this.fdmConnection = await connectionsApi.get(v)
    },

    currentView(type) {
      if (type === 'swimlane') {
        this.directoryMap = {}
        this.loadDirectory()
      }
    }
  },

  created() {
    this.loadDirectory()
  },

  methods: {
    toggleView(view) {
      this.currentView = view
    },

    handleAdd(type) {
      this.selectorType = type
      this.visible = true
    },

    handleCreateTarget(type) {
      this.selectorType = type
      this.showSceneDialog = true
    },

    handleSuccess(value) {
      const component = this.laneOptions.find(t => t.type === this.selectorType)?.component
      this.$refs[component]?.[0]?.addItem(value)
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
    },

    handleSettingsInit(settings) {
      this.settings = settings
    },

    loadDirectory() {
      let filter = {
        where: {
          item_type: { $nin: ['database', 'dataflow', 'api'] }
        }
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
          filter: JSON.stringify(filter)
        })
        .then(data => {
          let items = data?.items || []
          let treeData = this.formatCatalog(items)
          treeData.forEach(item => {
            this.$set(this.directoryMap, item.item_type[0], item)
          })
          console.log('this.directoryMap', this.directoryMap) // eslint-disable-line
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
        const setChildren = nodes => {
          return nodes.map(it => {
            let children = map[it.id]
            if (children) {
              it.children = setChildren(children)
            }
            return it
          })
        }

        items.forEach(it => {
          this.mapCatalog(it)
          if (it.parent_id) {
            let children = map[it.parent_id] || []
            children.push(it)
            map[it.parent_id] = children
          } else {
            nodes.push(it)
          }
        })

        return setChildren(nodes)
      }
    },

    handlePreview(data) {
      switch (data.LDP_TYPE) {
        case 'table':
          this.$refs.tablePreview.open(data)
          break
        case 'connection':
          this.$refs.connectionView.open(data)
          break
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.list {
  ::v-deep {
    .list__title {
      height: 48px;
      min-height: 48px;
      border-top: 1px solid #e1e3e9;
      border-bottom: 1px solid #e1e3e9;
      background: #f3f7fa;
    }
    .list__item {
      border-left: 1px solid #e1e3e9;
      &:first-child {
        border-left: none;
      }
    }
    .icon-color {
      &:hover {
        background-color: map-get($bgColor, hover);
      }
    }
  }
}

.swim-lane {
  ::v-deep {
    .drop-mask {
      display: none;
      pointer-events: none;
      backdrop-filter: blur(4px);
      background-color: rgba(255, 255, 255, 0.4);
    }

    .ldp-tree.is-drop,
    .is-drop .ldp-tree {
      box-shadow: 0px 0px 0px 2px map-get($color, primary) inset;
      & + .drop-mask {
        display: none !important;
      }
    }

    .is-drop .drop-mask {
      display: none !important;
    }

    .pipeline-desc {
      background-color: #f8f8fa;
      border-left: 4px solid map-get($color, primary);
      line-height: 22px;
      li {
        margin-left: 20px;
        padding-left: 4px;
        list-style-type: circle;
      }
    }
  }
}
</style>
