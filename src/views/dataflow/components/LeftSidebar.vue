<template>
  <aside class="layout-sidebar --left border-end flex flex-column">
    <SearchBar v-model="search"></SearchBar>

    <div v-if="searchFilter.length === 0" class="overflow-auto flex-fill">
      <ElCollapse v-model="activeGroups">
        <ElCollapseItem v-for="(g, gi) in groups" :key="gi" :title="g.name" :name="`${gi}`">
          <template v-if="g.ui === 'list'">
            <NodeItem
              v-for="(item, i) in g.nodes"
              :key="i"
              :data="item"
              v-mouse-drag="{
                item,
                container: '#dfEditorContent',
                domHtml: getNodeHtml(item),
                onStart,
                onMove,
                onDrop
              }"
            ></NodeItem>
          </template>
          <template v-else>
            <ElRow class="node-list flex-wrap p-2" :gutter="0" type="flex">
              <ElCol :span="8" v-for="(n, ni) in g.nodes" :key="ni" class="p-2">
                <div
                  v-mouse-drag="{
                    item: n,
                    container: '#dfEditorContent',
                    domHtml: getNodeHtml(n),
                    onStart,
                    onMove,
                    onDrop
                  }"
                  class="node-item flex flex-column align-center py-1 grabbable user-select-none"
                >
                  <ElImage draggable="false" class="node-item-img" :src="`static/editor/${n.icon}.svg`"></ElImage>
                  <div class="node-item-txt mt-1">{{ n.name }}</div>
                </div>
              </ElCol>
            </ElRow>
          </template>
        </ElCollapseItem>
      </ElCollapse>
    </div>

    <div v-else-if="filteredNodeTypes.length > 0" class="overflow-auto">
      <NodeItem
        v-for="item in filteredNodeTypes"
        :key="item.name"
        :data="item"
        v-mouse-drag="{
          item,
          container: '#dfEditorContent',
          domHtml: getNodeHtml(item),
          onStart,
          onMove,
          onDrop
        }"
      ></NodeItem>
    </div>

    <div v-else>
      <EmptyItem></EmptyItem>
    </div>
  </aside>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { groupBy, uuid } from '@/utils/util'
import mouseDrag from '@/directives/mousedrag'
import DatabaseTypes from '@/api/DatabaseTypes'
import NodeItem from '@/views/dataflow/components/NodeItem'
import SearchBar from '@/views/dataflow/components/SearchBar'
import EmptyItem from '@/components/EmptyItem'
const databaseTypesApi = new DatabaseTypes()

export default {
  name: 'LeftSidebar',
  components: { EmptyItem, SearchBar, NodeItem },
  data() {
    return {
      search: '',
      mapping: this.$route.query,
      groups: [],
      activeGroups: ['plugin'],
      connections: []
    }
  },

  directives: {
    mouseDrag
  },

  computed: {
    ...mapGetters('dataflow', ['allNodeTypes', 'getCtor']),

    searchFilter() {
      return this.search.toLowerCase().trim()
    },

    searchItems() {
      const sorted = [...this.allNodeTypes]

      sorted.sort((a, b) => {
        const textA = a.name.toLowerCase()
        const textB = b.name.toLowerCase()
        return textA < textB ? -1 : textA > textB ? 1 : 0
      })

      return sorted
    },

    filteredNodeTypes() {
      const nodeTypes = this.searchItems
      const filter = this.searchFilter

      return nodeTypes.filter(item => {
        return filter && item.name.toLowerCase().includes(filter)
      })
    }
  },

  watch: {
    allNodeTypes() {
      this.initGroups()
    }
  },

  created() {
    // this.loadConnections()
    // this.initGroups()
  },

  methods: {
    ...mapMutations('dataflow', ['addNode']),

    initGroups() {
      let _group = groupBy(this.allNodeTypes, 'group')

      const groups = [
        {
          name: this.$t('editor.ui.sidebar.data_nodes'),
          nodes: _group.data || []
        },
        {
          name: this.$t('editor.ui.sidebar.processor'),
          nodes: _group.processor || []
        },
        {
          name: '插件化数据节点',
          nodes: _group.plugin || [],
          ui: 'list'
        }
      ]

      this.groups = groups.filter(item => item.nodes.length > 0)

      this.activeGroups.push(...Object.keys(this.groups))
    },

    // 获取分类好的节点
    getCategorizedNodes() {},

    getNodeHtml(n) {
      return `
        <div class="df-node flex align-center" style="z-index: 11">
          <div class="df-node-icon ml-2">
            <img draggable="false" style="width: 30px;height: 30px;vertical-align: middle;" src="static/editor/o-${n.icon}.svg">
          </div>
          <div class="df-node-text text-truncate ml-2 lh-1">${n.name}</div>
        </div>
      `
    },

    // 把节点分类
    categorizeNodes() {},

    // 获取分类
    getCategories() {},

    onStart() {
      console.log('onStart')
    },

    onMove() {
      // console.log('onMove')
    },

    onDrop(item, position) {
      const bound = document.getElementById('node-view').getBoundingClientRect()

      let [x, y] = position
      x -= bound.x
      y -= bound.y

      const Ctor = this.getCtor(item.constructor)
      const ins = new Ctor(item)
      const node = {
        id: uuid(),
        name: item.name,
        type: item.type,
        position: [x, y],
        ...ins.getExtraAttr() // 附加属性
      }

      Object.defineProperty(node, '__Ctor', {
        value: ins,
        enumerable: false
      })

      this.addNode(node)
    },

    async loadConnections() {
      // 临时过滤本地的数据库节点
      const localTypes = this.allNodeTypes.map(item => item.attr.databaseType)

      const { data } = await databaseTypesApi.get({
        filter: {
          fields: {
            id: 1,
            type: 1,
            name: 1,
            supportTargetDatabaseType: 1
          },
          where: {
            type: {
              nin: localTypes
            }
          }
        }
      })
      this.connections = data.map(item => {
        return {
          name: item.name,
          icon: 'tigerdb',
          group: 'data',
          type: 'database',
          constructor: 'Database',
          attr: {
            databaseType: item.type
          }
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.layout-sidebar.--left {
  overflow: hidden;

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

          &:hover {
            background-color: #f9fafc;
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
    border: 1px dashed transparent;

    &:hover {
      background-color: var(--primary-hover-l);
      border-color: var(--primary);
    }

    &-img {
      width: 30px;
      height: 24px;
    }

    &-txt {
      font-size: 12px;
      line-height: 1;
      transform: scale(0.8333);
      white-space: nowrap;
    }
  }
}
</style>
