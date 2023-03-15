<template>
  <div class="swim-lane flex flex-column h-100">
    <div class="p-6 flex justify-content-between">
      <div>
        <span class="fs-5 font-color-dark">Dashboard</span>
        <ElInput
          class="search-input ml-4"
          v-model="keyword"
          prefix-icon="el-icon-search"
          size="small"
          clearable
          style="width: 240px"
          @input="searchFnc"
        ></ElInput>
      </div>
      <div>
        <VIcon size="18 " class="icon-color-normal" @click="handleSettings">list-view</VIcon>
      </div>
    </div>
    <div class="list flex flex-fill overflow-hidden">
      <component
        v-for="(item, index) in laneOptions"
        :key="index"
        :is="item.component"
        :ref="item.component"
        :dragState="dragState"
        :settings="settings"
        :directories="directoryMap[item.type]"
        @create-connection="handleAdd"
        @node-drag-end="handleDragEnd"
        @show-settings="handleSettings"
        @load-directories="loadDirectories"
      ></component>
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
  </div>
</template>

<script>
import CreateConnection from '../../components/create-connection/Dialog'
import SourceItem from './Source'
import TargetItem from './Target'
import FDMItem from './FDM'
import MDMItem from './MDM'
import Settings from './Settings'
import { metadataDefinitionsApi } from '@tap/api'

export default {
  name: 'Dashboard',

  components: { CreateConnection, SourceItem, TargetItem, FDMItem, MDMItem, Settings },

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
      directoryMap: {}
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
          type: 'fdm'
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

  created() {
    this.loadDirectories()
  },

  methods: {
    searchFnc() {},

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

    loadDirectories() {
      let filter = {
        where: {
          item_type: { $nin: ['database', 'dataflow', 'api'] }
        },
        fields: {
          id: 1,
          item_type: 1,
          last_updated: 1,
          value: 1,
          objCount: 1,
          parent_id: 1,
          desc: 1,
          readOnly: 1,
          user_id: 1
        }
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
            this.$set(this.directoryMap, item.item_type[0], item.children)
          })
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
