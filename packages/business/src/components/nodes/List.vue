<template>
  <div class="px-2 py-3">
    <div
      class="node-list-item px-2 mb-1 flex align-center font-color-dark"
      :class="{ active: activeNodeId === '' }"
      @click="changeItem()"
    >
      <VIcon size="20" class="mr-1">folder</VIcon>{{ title }}
    </div>
    <div
      v-for="node in items"
      :key="node.id"
      class="node-list-item px-2 mb-1 flex align-center font-color-dark"
      :class="{ active: activeNodeId === node.id }"
      @click="changeItem(node.id)"
    >
      <NodeIcon :node="node" :size="18" />
      <div class="flex-1 ml-1 text-truncate">{{ node.name }}</div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import i18n from '@tap/i18n'
import NodeIcon from '@tap/dag/src/components/NodeIcon'

export default {
  name: 'List',

  components: { NodeIcon },

  props: {
    value: {
      type: String
    },
    title: {
      type: String,
      default: () => {
        return i18n.t('packages_dag_components_log_quanbu')
      }
    }
  },

  data() {
    return {
      activeNodeId: ''
    }
  },

  computed: {
    ...mapGetters('dataflow', ['allNodes']),

    items() {
      return this.allNodes
    }
  },

  methods: {
    changeItem(itemId = '') {
      if (this.activeNodeId === itemId) {
        return
      }
      this.activeNodeId = itemId
      this.$emit('input', this.activeNodeId).$emit('change', this.activeNodeId)
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
