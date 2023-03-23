<template>
  <div class="swim-lane flex flex-column h-100">
    <div class="page-header-title flex justify-content-between">
      <span>Data Console</span>
      <div>
        <ElTooltip v-if="currentView === 'swimlane'" content="切换至目录视图" key="swimlane">
          <IconButton @click="toggleView('catalog')" md>list-view</IconButton>
        </ElTooltip>
        <ElTooltip v-else content="切换至 Console 视图" key="console">
          <IconButton @click="toggleView('swimlane')" md>swimlane</IconButton>
        </ElTooltip>
        <IconButton class="ml-3" @click="handleSettings" md>cog-o</IconButton>
      </div>
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
          @create-connection="handleAdd"
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
    Catalogue
  },

  data() {
    return {
      keyword: '',
      visible: false,
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
      currentView: 'swimlane' // catalog
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
          it.LDP_TYPE = 'folder'
          it.children = []
          if (it.parent_id) {
            let children = map[it.parent_id] || []
            children.push(it)
            map[it.parent_id] = children
            it.name = it.value
          } else {
            const itemType = it.item_type[0]
            const TYPE2NAME = {
              target: 'TARGET&SERVICE'
            }
            it.name = TYPE2NAME[itemType] || it.value
            it.readOnly = itemType !== 'mdm'
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
      background: #f3f7fa;
    }
    .list__item {
      border-left: 1px solid #e1e3e9;
      &:first-child {
        border-left: none;
      }
    }
    .list__title {
      border-top: 1px solid #e1e3e9;
      border-bottom: 1px solid #e1e3e9;
    }
    .icon-color {
      &:hover {
        background-color: map-get($bgColor, hover);
      }
    }
  }
}
</style>
