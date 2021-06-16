<template>
  <aside class="layout-sidebar --left border-end">
    <ElCollapse v-model="activeGroups">
      <ElCollapseItem
        v-for="(g, gi) in groups"
        :key="gi"
        :title="g.name"
        :name="`${gi}`"
      >
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
              class="
                node-item
                flex flex-column
                align-center
                py-1
                grabbable
                user-select-none
              "
            >
              <ElImage
                draggable="false"
                class="node-item-img"
                :src="`static/editor/${n.icon}.svg`"
              ></ElImage>
              <div class="node-item-txt mt-1">{{ n.name }}</div>
            </div>
          </ElCol>
        </ElRow>
      </ElCollapseItem>
    </ElCollapse>
  </aside>
</template>

<script>
import _ from 'lodash'
import { mapGetters, mapMutations } from 'vuex'
import { groupBy, uuid } from '@/utils/util'
import mouseDrag from '@/directives/mousedrag'

export default {
  name: 'LeftSidebar',

  data() {
    return {
      mapping: this.$route.query,
      groups: [],
      activeGroups: []
    }
  },

  directives: {
    mouseDrag
  },

  computed: {
    ...mapGetters('dataflow', ['allNodeTypes', 'getCtor'])
  },

  created() {
    this.initGroups()
  },

  methods: {
    ...mapMutations('dataflow', ['addNode']),

    initGroups() {
      let _group = groupBy(this.allNodeTypes, 'group')
      this.groups = [
        {
          name: this.$t('editor.ui.sidebar.data_nodes'),
          nodes: _group.data || []
        },
        {
          name: this.$t('editor.ui.sidebar.processor'),
          nodes: _group.processor || []
        }
      ]
      this.activeGroups = Object.keys(this.groups)
    },

    // 获取分类好的节点
    getCategorizedNodes() {},

    getNodeHtml(n) {
      return `
        <div class="df-node flex align-center" style="z-index: 11">
          <div class="df-node-icon ml-2">
            <img draggable="false" style="width: 30px;height: 30px;vertical-align: middle;" src="static/editor/o-${n.icon}.svg">
          </div>
          <div class="df-node-text ml-2 lh-1">${n.name}</div>
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
      const bound = document
        .getElementById('dfEditorContent')
        .getBoundingClientRect()

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
    }
  }
}
</script>

<style scoped lang="scss">
.layout-sidebar.--left {
  ::v-deep {
    .el-collapse-item__header {
      padding-left: 8px;
      padding-right: 8px;
      height: 32px;

      &:hover {
        background-color: #f9fafc;
      }
    }

    .el-collapse-item__content {
      padding-bottom: 0;
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
