<script>
import { IconButton, OverflowTooltip, VEmpty, VIcon } from '@tap/component'
import i18n from '@tap/i18n'
import { copyToClipboard } from '@tap/shared'
import { ElMessage } from 'element-plus'
import { defineComponent } from 'vue'
import VueJsonPretty from 'vue-json-pretty'
import BaseNode from '../components/BaseNode.vue'
import 'vue-json-pretty/lib/styles.css'

export default defineComponent({
  name: 'CaptureItem',

  components: {
    BaseNode,
    OverflowTooltip,
    VIcon,
    VueJsonPretty,
    VEmpty,
    IconButton,
  },
  props: {
    data: Object,
    nodes: Array,
  },

  setup() {
    const copy = async (data) => {
      await copyToClipboard(JSON.stringify(data, null, 2))
      ElMessage.success(i18n.t('public_message_copy_success'))
    }

    return { copy }
  },
})
</script>

<template>
  <div class="bg-secondary-100 rounded-lg p-4 overflow-auto">
    <div v-if="nodes.length" class="flex gap-4" style="width: max-content">
      <div
        v-for="node in nodes"
        :key="node.id"
        class="position-relative bg-white p-2 rounded-lg flex flex-column"
      >
        <BaseNode
          class="position-relative w-100 mb-2 shadow-sm"
          :node="node"
          :class="`node--${node.__Ctor.group}`"
        >
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
          <VIcon v-if="data.disabled" class="mr-2 color-warning" size="16"
            >disable</VIcon
          >
          <IconButton sm class="mr-1" @click="copy(data[node.id].data)"
            >copy</IconButton
          >
        </BaseNode>

        <div class="node-card bg-white overflow-auto">
          <vue-json-pretty
            class="fs-8"
            show-icon
            :data="data[node.id].data"
            :show-line="false"
            :select-on-click-node="false"
            :highlight-selected-node="false"
          />
        </div>
      </div>
    </div>

    <v-empty v-else small />
  </div>
</template>

<style scoped lang="scss">
.node-card {
  min-width: 240px;
  max-width: 300px;
  max-height: calc(100vh - 64px - 32px - 84px - 32px - 30px - 32px);
}
</style>
