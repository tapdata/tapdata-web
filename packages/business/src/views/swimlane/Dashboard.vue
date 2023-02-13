<template>
  <div class="swim-lane flex flex-column h-100">
    <div class="p-6">
      <span class="fs-5 font-color-dark">Dashboard</span>
      <ElInput
        class="search-input ml-4"
        v-model="keyword"
        prefix-icon="el-icon-search"
        size="mini"
        clearable
        style="width: 240px"
        @input="searchFnc"
      ></ElInput>
    </div>
    <div class="list flex flex-fill">
      <div v-for="(item, index) in options" :key="index" class="list__item flex-fill">
        <div class="list__title flex justify-content-between p-4">
          <span class="fs-6">{{ item.title }}</span>
          <div class="operation">
            <VIcon v-if="item.add" size="16" class="icon-color" @click="handleAdd(item.type)">add-fill</VIcon>
            <VIcon size="16" class="icon-color ml-3 rotate-90">more</VIcon>
          </div>
        </div>
        <component :is="item.component" :ref="item.component"></component>
      </div>
    </div>
    <CreateConnection
      :visible.sync="visible"
      :params="createConnectionParams"
      @success="handleSuccess"
    ></CreateConnection>
  </div>
</template>

<script>
import CreateConnection from '@tap/business/src/components/create-connection/Dialog'

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
          type: ' ',
          add: true,
          component: 'TargetItem'
        }
      ],
      visible: false,
      createConnectionParams: {}
    }
  },

  methods: {
    searchFnc() {},

    handleAdd(type) {
      console.log('handleAdd', type)
      this.createConnectionParams.type = type
      this.visible = true
    },

    handleSuccess() {
      console.log('handleSuccess', this.createConnectionParams.type)
    }
  }
}
</script>

<style lang="scss" scoped>
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
</style>
