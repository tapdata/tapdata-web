<template>
  <aside class="layout-sidebar --left border-end flex flex-column flex-shrink-0">
    <div class="db-list-wrap">
      <ElCollapse value="db">
        <ElCollapseItem name="db">
          <template #title>
            <div class="flex align-center flex-1">
              <span class="flex-1">连接</span>
              <VIcon class="mr-2">plus</VIcon>
              <VIcon>magnify</VIcon>
            </div>
          </template>
          <div class="db-list overflow-auto">
            <div
              v-for="(db, i) in dbList"
              :key="i"
              class="db-item flex align-center px-4 clickable"
              :class="{ active: currentConnectionId === db.id }"
              @click="handleSelectDB(db)"
            >
              <ElImage class="flex-shrink-0" :src="genIconSrc(db)"></ElImage>
              <div class="db-item-txt text-truncate ml-4">{{ db.name }}</div>
            </div>
          </div>
        </ElCollapseItem>
      </ElCollapse>
    </div>

    <div class="table-list-wrap">
      <div class="px-6 py-4">
        <ElInput v-model="tbSearchTxt" size="small" @input="handleTbInput">
          <template #prefix>
            <VIcon size="14" class="ml-1 h-100">search</VIcon>
          </template>
        </ElInput>
      </div>
      <div class="tb-list overflow-auto">
        <div
          v-for="tb in tbFilterList"
          v-mouse-drag="{
            item: tb,
            container: '#dfEditorContent',
            getDragDom,
            onStart,
            onMove,
            onDrop,
            onStop
          }"
          :key="tb.attr.tableId"
          class="tb-item grabbable flex align-center px-4"
        >
          <div class="tb-item-icon">
            <VIcon class="h-100" size="14" color="#fff">table</VIcon>
          </div>
          <div class="text-truncate ml-4">{{ tb.name }}</div>
        </div>
      </div>
    </div>

    <ElCollapse value="process">
      <ElCollapseItem name="process">
        <template #title>
          <div class="flex align-center flex-1">
            <span class="flex-1">处理节点</span>
          </div>
        </template>
        <ElRow class="node-list flex-wrap p-2" :gutter="0" type="flex">
          <ElCol :span="8" v-for="(n, ni) in processorNodeTypes" :key="ni" class="p-1">
            <div
              v-mouse-drag="{
                item: n,
                container: '#dfEditorContent',
                getDragDom,
                onStart,
                onMove,
                onDrop,
                onStop
              }"
              class="node-item flex flex-column align-center px-1 py-2 grabbable user-select-none"
            >
              <div class="node-item-icon flex justify-center align-center">
                <VIcon size="24" color="#2C65FF">{{ n.icon }}</VIcon>
              </div>
              <div class="node-item-txt mt-2">{{ n.name }}</div>
            </div>
          </ElCol>
        </ElRow>
      </ElCollapseItem>
    </ElCollapse>

    <BaseNode
      v-if="dragStarting"
      id="dragNode"
      class="drag-node"
      :node="dragNodeType"
      :class="`node--${dragNodeType.group}`"
    ></BaseNode>
  </aside>
</template>

<script>
import 'web-core/assets/icons/svg/magnify.svg'
import 'web-core/assets/icons/svg/table.svg'
import 'web-core/assets/icons/svg/js.svg'
import 'web-core/assets/icons/svg/joint-cache.svg'
import 'web-core/assets/icons/svg/row-filter.svg'
import 'web-core/assets/icons/svg/aggregator.svg'
import 'web-core/assets/icons/svg/field-processor.svg'
import { mapGetters, mapMutations } from 'vuex'
import mouseDrag from 'web-core/directives/mousedrag'
import VIcon from 'web-core/components/VIcon'
import resize from 'web-core/directives/resize'
import { DB_ICON } from 'web-core/views/dataflow/constants'
import BaseNode from 'web-core/views/dataflow/components/BaseNode'
import { debounce, throttle } from 'lodash'
import ConnectionsApi from 'web-core/api/Connections'
import MetadataApi from 'web-core/api/MetadataInstances'
const connections = new ConnectionsApi()
const metadataApi = new MetadataApi()

export default {
  name: 'LeftSidebar',

  components: { BaseNode, VIcon },

  data() {
    return {
      search: '',
      mapping: this.$route.query,
      groups: [],
      activeGroups: ['plugin'],
      connections: [],
      dbList: [],
      tbFilterList: [],
      tbSearchTxt: '',
      currentConnectionId: '',
      dragStarting: false,
      dragMoving: false,
      dragNodeType: null
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
    }
  },

  created() {
    this.init()
  },

  methods: {
    async init() {
      const data = await this.loadDatabase()
      this.handleSelectDB(data[0])
    },
    async loadDatabase() {
      try {
        let result = await connections.get({
          filter: JSON.stringify({
            where: {
              database_type: {
                nin: ['file', 'dummy', 'gridfs', 'rest api', 'custom_connection']
              }
            },
            fields: {
              name: 1,
              id: 1,
              database_type: 1,
              connection_type: 1,
              status: 1
            },
            order: ['status DESC', 'name ASC']
          })
        })
        this.dbList = result
        return result
      } catch (e) {
        console.log('catch', e)
      }
    },

    // 加载数据库
    ...mapMutations('dataflow', ['addNode']),

    async loadDatabaseTable() {
      const connectionId = this.currentConnectionId
      const params = {
        filter: JSON.stringify({
          where: {
            'source.id': connectionId,
            meta_type: {
              in: ['collection', 'table', 'view']
            },
            is_deleted: false
          },
          fields: {
            id: true,
            original_name: true
          }
        })
      }
      let tables = await metadataApi.get(params)
      tables = tables.map(tb => ({
        name: tb.original_name,
        type: 'table',
        group: 'data',
        constructor: 'Table',
        attr: {
          tableId: tb.id,
          connectionId
        }
      }))
      this.tbFilterList = tables
      this.tbList = tables
    },

    genIconSrc(item) {
      let icon = DB_ICON[item.database_type]
      return require(`web-core/assets/images/db-icon/${icon}.svg`)
    },

    // 获取分类好的节点
    getCategorizedNodes() {},

    getNodeHtml(n) {
      return `
        <div class="df-node" style="z-index: 11;pointer-events: none;">
          <div class="df-node-icon">
            <img draggable="false" style="width: 30px;height: 30px;vertical-align: middle;" src="static/editor/o-${n.icon}.svg">
          </div>
          <div class="df-node-text">${n.name}</div>
        </div>
      `
    },

    // 把节点分类
    categorizeNodes() {},

    // 获取分类
    getCategories() {},

    async getDragDom() {
      await this.$nextTick()
      console.log('getDragDom', document.getElementById('dragNode'))
      return document.getElementById('dragNode')
    },

    onStart(item) {
      this.dragNodeType = item
      this.dragStarting = true
      this.dragMoving = false
    },

    onMove: throttle(function (item, position) {
      this.dragMoving = true
      this.$emit('move-node', item, position)
    }, 100),

    /*onMove() {
      this.$emit('move-node', ...arguments)
    },*/

    onDrop() {
      this.$emit('drop-node', ...arguments)
    },

    onStop() {
      console.log('onStop', arguments)
      this.dragStarting = false
      this.dragMoving = false
    },

    handleSelectDB(db) {
      this.tbSearchTxt = ''
      this.currentConnectionId = db.id
      this.loadDatabaseTable()
    },

    handleTbInput: debounce(function () {
      const txt = this.tbSearchTxt.toLowerCase()
      this.tbFilterList = this.tbList.filter(tb => tb.tableName.toLowerCase().includes(txt))
    }, 100)
  }
}
</script>

<style scoped lang="scss">
$itemH: 34px;

.drag-node {
  position: fixed !important;
  z-index: 1000;
  pointer-events: none;
}

.layout-sidebar.--left {
  overflow: hidden;

  .db-list,
  .tb-list {
    max-height: 150px;
  }

  .db-item,
  .tb-item {
    height: $itemH;
    font-size: 12px;
    &.active,
    &:hover {
      background-color: #eef3ff;
    }

    .el-image {
      width: 20px;
      height: 20px;
      vertical-align: middle;
    }
  }

  .tb-item-icon {
    width: 20px;
    height: 20px;
    background-color: #6236ff;
    text-align: center;
    border-radius: 100%;
  }

  ::v-deep {
    .el-collapse {
      border-top: 0;

      &-item {
        &.is-active [role='tab'] {
          position: sticky;
          top: 0;
          z-index: 1;
        }

        &__header {
          padding-left: 8px;
          padding-right: 8px;
          height: 32px;
          font-size: 14px;

          &:hover {
            background-color: #f9fafc;
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
