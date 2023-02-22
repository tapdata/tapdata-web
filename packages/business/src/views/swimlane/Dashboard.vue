<template>
  <div class="swim-lane flex flex-column h-100">
    <div class="p-6">
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
    <div class="list flex flex-fill overflow-hidden">
      <component
        v-for="(item, index) in options"
        :key="index"
        :is="item.component"
        :ref="item.component"
        :dragState="dragState"
        @create-connection="handleAdd"
        @node-drag-end="handleDragEnd"
      ></component>
    </div>
    <CreateConnection
      :visible.sync="visible"
      :params="createConnectionParams"
      @success="handleSuccess"
    ></CreateConnection>
  </div>
</template>

<script>
import CreateConnection from '../../components/create-connection/Dialog'

import SourceItem from './Source'
import TargetItem from './Target'
import FDMItem from './FDM'
import MDMItem from './MDM'

export default {
  name: 'Dashboard',

  components: { CreateConnection, SourceItem, TargetItem, FDMItem, MDMItem },

  data() {
    return {
      keyword: '',
      options: [
        {
          title: 'SOURCES',
          type: 'source',
          add: true,
          component: 'SourceItem'
        },
        {
          title: 'FDM / CACHE',
          component: 'FDMItem'
        },
        {
          title: 'MDM / CURATED MODELS',
          component: 'MDMItem'
        },
        {
          title: 'SERVICES / TARGETS',
          type: 'target',
          add: true,
          component: 'TargetItem'
        }
      ],
      visible: false,
      createConnectionParams: {},
      dragState: {
        isDragging: false,
        draggingObjects: [],
        dropNode: null,
        form: ''
      }
    }
  },

  methods: {
    searchFnc() {},

    handleAdd(type) {
      this.createConnectionParams.type = type
      this.visible = true
    },

    handleSuccess() {
      console.log('handleSuccess', this.createConnectionParams.type, this.$refs)
    },

    handleDragEnd() {
      this.dragState.isDragging = false
      this.dragState.draggingObjects = []
      this.dragState.dropNode = null
      this.dragState.form = ''
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
      color: map-get($iconFillColor, normal);
    }
  }
}
</style>
