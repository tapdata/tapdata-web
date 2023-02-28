<template>
  <div class="px-2 py-3 overflow-y-auto">
    <div
      class="node-list-item px-2 mb-1 flex align-center font-color-dark item__whole"
      :class="{ active: activeNodeId === '' }"
      @click="changeItem()"
    >
      <VIcon size="18" class="mr-2">device</VIcon>{{ label }}
    </div>
    <div
      v-for="node in items"
      :key="node.id"
      class="node-list-item px-2 mb-1 flex align-center font-color-dark"
      :class="[{ active: activeNodeId === node.id }, customClass(node)]"
      @click="changeItem(node.id)"
    >
      <NodeIcon :node="node" :size="18" class="mr-2 flex-shrink-0" />
      <OverflowTooltip :text="node.name" placement="left" :enterable="false"></OverflowTooltip>
      <ElTag v-if="showType" class="ml-2" effect="plain" size="mini">{{ typeMap[node.nodeType] }}</ElTag>
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import i18n from '@tap/i18n'
import NodeIcon from '@tap/dag/src/components/NodeIcon'
import { OverflowTooltip } from '@tap/component'

export default {
  name: 'List',

  components: { NodeIcon, OverflowTooltip },

  props: {
    value: {
      type: String
    },
    label: {
      type: String,
      default: () => {
        return i18n.t('packages_dag_components_log_quanbu')
      }
    },
    showType: {
      type: Boolean,
      default: false
    },
    customClass: {
      type: Function,
      default: () => {}
    }
  },

  data() {
    return {
      activeNodeId: '',
      typeMap: {
        source: i18n.t('packages_business_nodes_list_laiyuan'),
        target: i18n.t('packages_business_connection_form_target'),
        processor: i18n.t('packages_business_nodes_list_chulijiedian')
      }
    }
  },

  computed: {
    ...mapGetters('dataflow', ['allNodes']),

    items() {
      return this.allNodes
        .map(t => {
          const { type, $inputs, $outputs } = t
          const isSource = (type === 'database' || type === 'table') && !$inputs.length
          const isTarget = (type === 'database' || type === 'table') && !$outputs.length
          t.nodeType = isSource ? 'source' : isTarget ? 'target' : 'processor'
          t.index = isSource ? 1 : isTarget ? 3 : 2
          return t
        })
        .sort((a, b) => a.index - b.index)
    }
  },

  methods: {
    changeItem(itemId = '') {
      if (this.activeNodeId === itemId) {
        return
      }
      this.activeNodeId = itemId
      this.$emit('input', this.activeNodeId).$emit(
        'change',
        this.activeNodeId,
        this.items.find(t => t.id === this.activeNodeId)
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.node-list-item {
  line-height: 32px;
  border-radius: 6px;
  cursor: pointer;

  &:hover,
  &.active {
    background-color: rgba(229, 236, 255, 0.3);
  }
}
</style>
