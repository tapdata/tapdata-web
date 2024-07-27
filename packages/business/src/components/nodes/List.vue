<template>
  <div class="p-2 overflow-y-auto">
    <div
      class="node-list-item px-2 mb-1 flex align-center font-color-dark item__whole"
      :class="{ active: activeNodeId === '' }"
      @click="changeItem()"
    >
      <VIcon size="16" class="mr-2">device</VIcon>{{ label }}
    </div>
    <RecycleScroller key-field="id" :items="items" :item-size="36" class="scroller" :buffer="72">
      <template #default="{ item: node, index, active }">
        <div class="pb-1">
          <div
            class="node-list-item px-2 flex align-center font-color-dark"
            :class="[{ active: activeNodeId === node.id }, customClass(node)]"
            @click="changeItem(node.id)"
          >
            <NodeIcon :node="node" :size="18" class="mr-2 flex-shrink-0" />
            <OverflowTooltip :text="node.name" placement="left" :enterable="false"></OverflowTooltip>
            <ElTag v-if="showType" class="ml-2" effect="plain">{{ typeMap[node.nodeType] }}</ElTag>
            <slot name="right"></slot>
          </div>
        </div>
      </template>
    </RecycleScroller>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import i18n from '@tap/i18n'
import { OverflowTooltip } from '@tap/component'
import { $on, $off, $once, $emit } from '../../../utils/gogocodeTransfer'
import { NodeIcon } from '../DatabaseIcon'

export default {
  name: 'List',

  components: { NodeIcon, OverflowTooltip, RecycleScroller },

  props: {
    value: {
      type: String,
    },
    label: {
      type: String,
      default: () => {
        return i18n.t('public_select_option_all')
      },
    },
    showType: {
      type: Boolean,
      default: false,
    },
    customClass: {
      type: Function,
      default: () => {},
    },
  },
  data() {
    return {
      activeNodeId: this.value,
      typeMap: {
        source: i18n.t('packages_business_nodes_list_laiyuan'),
        target: i18n.t('public_connection_type_target'),
        processor: i18n.t('public_node_processor'),
      },
    }
  },
  watch: {
    value(v) {
      this.activeNodeId = v
    },
  },
  computed: {
    ...mapGetters('dataflow', ['allNodes']),

    items() {
      return this.allNodes
        .filter((node) => {
          return !node.disabled && !node.attrs.disabled
        })
        .map((t) => {
          const { type, $inputs, $outputs } = t
          const isSource = (type === 'database' || type === 'table') && !$inputs.length
          const isTarget = (type === 'database' || type === 'table') && !$outputs.length
          t.nodeType = isSource ? 'source' : isTarget ? 'target' : 'processor'
          t.index = isSource ? 1 : isTarget ? 3 : 2
          return t
        })
        .sort((a, b) => a.index - b.index)
    },
  },
  methods: {
    changeItem(itemId = '') {
      if (this.activeNodeId === itemId) {
        return
      }
      this.activeNodeId = itemId
      $emit(
        this.$emit('update:value', this.activeNodeId),
        'change',
        this.activeNodeId,
        this.items.find((t) => t.id === this.activeNodeId),
      )
    },
  },
  emits: ['change', 'update:value'],
}
</script>

<style lang="scss" scoped>
.node-list-item {
  line-height: 32px;
  border-radius: 6px;
  cursor: pointer;
  &:hover {
    background-color: #f2f3f5;
  }

  &.active {
    background-color: #d0deff;
  }
}
</style>
