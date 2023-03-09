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
<!--        <span>四泳道</span>-->
<!--        <ElSwitch v-model="moreLaneSwitch" class="ml-2"></ElSwitch>-->
        <VIcon size="18 " class="icon-color-normal" @click="handleSwitch">list-view</VIcon>
      </div>
    </div>
    <div class="list flex flex-fill overflow-hidden">
      <component
        v-for="(item, index) in laneOptions"
        :key="index"
        :is="item.component"
        :ref="item.component"
        :dragState="dragState"
        @create-connection="handleAdd"
        @node-drag-end="handleDragEnd"
        @vector="handleVector"
      ></component>
    </div>
    <CreateConnection
      :visible.sync="visible"
      :params="createConnectionParams"
      @success="handleSuccess"
      @saveAndMore="handleSuccess"
    ></CreateConnection>
    <Settings :visible.sync="settingsVisible" @success="handleSettingsSuccess"></Settings>
  </div>
</template>

<script>
import CreateConnection from '../../components/create-connection/Dialog'
import SourceItem from './Source'
import TargetItem from './Target'
import FDMItem from './FDM'
import MDMItem from './MDM'
import VectorItem from './VectorItem'
import Settings from './Settings'

export default {
  name: 'Dashboard',

  components: { CreateConnection, SourceItem, TargetItem, FDMItem, MDMItem, VectorItem, Settings },

  data() {
    return {
      keyword: '',
      visible: false,
      settingsVisible: false,
      createConnectionParams: {},
      dragState: {
        isDragging: false,
        draggingObjects: [],
        dropNode: null,
        form: ''
      },
      mode: ''
    }
  },

  computed: {
    laneOptions() {
      const result = [
        {
          title: 'SOURCES',
          type: 'source',
          add: true,
          component: 'SourceItem',
          level: 'base'
        },
        {
          title: 'FDM / CACHE',
          component: 'FDMItem'
        },
        {
          title: '分割线',
          component: 'VectorItem',
          level: 'base'
        },
        {
          title: 'MDM / CURATED MODELS',
          component: 'MDMItem'
        },
        {
          title: 'SERVICES / TARGETS',
          type: 'target',
          add: true,
          component: 'TargetItem',
          level: 'base'
        }
      ]
      return this.mode === 'service' ? result : result.filter(t => t.level === 'base')
    }
  },

  methods: {
    searchFnc() {},

    handleAdd(type) {
      this.createConnectionParams.type = type
      this.visible = true
    },

    handleSuccess(value) {
      const component = this.laneOptions.find(t => t.type === this.createConnectionParams.type)?.component
      this.$refs[component]?.[0]?.addItem(value)
    },

    handleDragEnd() {
      this.dragState.isDragging = false
      this.dragState.draggingObjects = []
      this.dragState.dropNode = null
      this.dragState.form = ''
    },

    handleSwitch() {
      this.settingsVisible = true
    },

    handleSettingsSuccess(data) {
      this.mode = data.mode
    },

    handleVector(val) {
      this.handleSwitch()
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
  }
}
</style>
