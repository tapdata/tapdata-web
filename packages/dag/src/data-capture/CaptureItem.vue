<template>
  <div class="bg-secondary-100 rounded-lg p-4 overflow-auto">
    <div v-if="nodes.length" class="flex gap-4" style="width: max-content">
      <div v-for="node in nodes" :key="node.id" class="position-relative bg-white p-2 rounded-lg flex flex-column">
        <BaseNode class="position-relative w-100 mb-2 shadow-sm" :node="node" :class="`node--${node.__Ctor.group}`">
          <template #text="{ text }">
            <OverflowTooltip
              class="df-node-text"
              :text="text"
              popper-class="df-node-text-tooltip"
              placement="top"
              :open-delay="400"
            />
            <VIcon v-if="node.__Ctor.beta" class="mr-1" size="32">beta</VIcon>
          </template>
          <VIcon v-if="data.disabled" class="mr-2 color-warning" size="16">disable</VIcon>
          <IconButton sm class="mr-1" @click="copy(data[node.id].data)">copy</IconButton>
        </BaseNode>

        <div class="node-card bg-white overflow-auto">
          <vue-json-pretty
            show-icon
            :data="data[node.id].data"
            :showLine="false"
            :selectOnClickNode="false"
            :highlightSelectedNode="false"
          />
        </div>
      </div>
    </div>

    <v-empty v-else small></v-empty>
  </div>
</template>

<script>
import { VIcon, OverflowTooltip } from '@tap/component'
import BaseNode from '../components/BaseNode.vue'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'
import { VEmpty, IconButton } from '@tap/component'
import { copyToClipboard } from '@tap/shared'
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  name: 'CaptureItem',
  props: {
    data: Object,
    nodes: Array
  },

  components: { BaseNode, OverflowTooltip, VIcon, VueJsonPretty, VEmpty, IconButton },

  setup(props, { root }) {
    const copy = async data => {
      await copyToClipboard(JSON.stringify(data, null, 2))
      root.$message.success('复制成功')
    }

    return { copy }
  }
})
</script>

<style scoped lang="scss">
.node-card {
  min-width: 240px;
  max-width: 300px;
  max-height: calc(100vh - 64px - 32px - 84px - 32px - 30px - 32px);
}
</style>
