<script setup lang="ts">
import { OverflowTooltip } from '@tap/component/src/overflow-tooltip'
import { useI18n } from '@tap/i18n'
import { computed, inject, ref, watch } from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import { NodeIcon } from '../DatabaseIcon'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

defineOptions({ name: 'List' })

const { t } = useI18n()
const dag = inject('dag')

const props = withDefaults(
  defineProps<{
    value?: string
    label?: string
    showType?: boolean
    customClass?: (node: any) => string
  }>(),
  {
    value: undefined,
    showType: false,
    customClass: () => () => '',
  },
)

const emit = defineEmits<{
  (e: 'update:value', value: string): void
  (e: 'change', value: string, node?: any): void
}>()

const activeNodeId = ref(props.value ?? '')

const typeMap: Record<string, string> = {
  source: t('packages_business_nodes_list_laiyuan'),
  target: t('public_connection_type_target'),
  processor: t('public_node_processor'),
}

watch(
  () => props.value,
  (v) => {
    activeNodeId.value = v ?? ''
  },
)

const items = computed(() => {
  return dag.value.nodes
    .filter((node: any) => {
      return !node.disabled && !node.attrs.disabled
    })
    .map((t: any) => {
      const { type, $inputs, $outputs } = t
      const isSource =
        (type === 'database' || type === 'table') && !$inputs.length
      const isTarget =
        (type === 'database' || type === 'table') && !$outputs.length
      t.nodeType = isSource ? 'source' : isTarget ? 'target' : 'processor'
      t.index = isSource ? 1 : isTarget ? 3 : 2
      return t
    })
    .sort((a: any, b: any) => a.index - b.index)
})

function changeItem(itemId = '') {
  if (activeNodeId.value === itemId) {
    return
  }
  activeNodeId.value = itemId
  emit('update:value', activeNodeId.value)
  emit(
    'change',
    activeNodeId.value,
    items.value.find((t: any) => t.id === activeNodeId.value),
  )
}
</script>

<template>
  <div class="p-2 overflow-y-auto">
    <div
      class="node-list-item px-2 mb-1 flex align-center font-color-dark item__whole"
      :class="{ active: activeNodeId === '' }"
      @click="changeItem()"
    >
      <VIcon size="16" class="mr-2">device</VIcon
      >{{ label || $t('public_select_option_all') }}
    </div>
    <RecycleScroller
      key-field="id"
      :items="items"
      :item-size="36"
      class="scroller"
      :buffer="72"
    >
      <template #default="{ item: node }">
        <div class="pb-1">
          <div
            class="node-list-item px-2 flex align-center font-color-dark"
            :class="[{ active: activeNodeId === node.id }, customClass(node)]"
            @click="changeItem(node.id)"
          >
            <NodeIcon :node="node" :size="18" class="mr-2 flex-shrink-0" />
            <OverflowTooltip
              :text="node.name"
              placement="left"
              :enterable="false"
            />
            <ElTag v-if="showType" class="ml-2" effect="plain">{{
              typeMap[node.nodeType]
            }}</ElTag>
            <slot name="right" />
          </div>
        </div>
      </template>
    </RecycleScroller>
  </div>
</template>

<style lang="scss" scoped>
.node-list-item {
  line-height: 32px;
  border-radius: 6px;
  cursor: pointer;
  &:hover {
    background-color: var(--primary-hover-light);
  }

  &.active {
    background-color: var(--primary-hover-light);
  }
}
</style>
