<script setup lang="ts">
import { getPickerOptionsBeforeTime } from '@tap/business/src/shared/util'
import { computed } from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import { useDataflowStore } from '../../../stores/dataflow.store'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

defineOptions({
  name: 'SyncPoints',
})

const props = defineProps<{
  value: any[]
  disabled?: boolean
}>()

const dataflowStore = useDataflowStore()

const items = computed(() => {
  return props.value?.filter((item) => !!item.nodeId) || []
})

const supportStreamOffsetNode = computed(() => {
  return dataflowStore.dag.nodes
    .filter((node: any) => node.$outputs.length && !node.$inputs.length)
    .reduce((map: Record<string, boolean>, item: any) => {
      map[item.id] = item?.attrs.capabilities?.some(
        (cap: any) => cap.id === 'get_stream_offset_function',
      )
      return map
    }, {})
})

function handleChangeType(type: string, item: any) {
  if (type === 'streamOffset') {
    item.isStreamOffset = true
  } else {
    item.isStreamOffset = false
  }
}

console.log('items', props.value, items, supportStreamOffsetNode)
</script>

<template>
  <div>
    <RecycleScroller
      key-field="nodeId"
      class="scroller"
      :items="items"
      :item-size="64"
      style="max-height: 300px"
      :buffer="64"
    >
      <template #default="{ item }">
        <span class="ellipsis"
          >{{ item.connectionName }}({{ item.nodeName }})</span
        >
        <div class="flex align-center gap-3">
          <ElSelect
            v-model="item.pointType"
            :disabled="disabled || item.hiddenPointType"
            @change="handleChangeType($event, item)"
          >
            <ElOption
              :label="$t('public_time_user_specified_time')"
              value="localTZ"
            />
            <ElOption :label="$t('public_time_current')" value="current" />
            <ElOption
              v-if="supportStreamOffsetNode[item.nodeId]"
              :label="$t('packages_dag_stream_offset')"
              value="streamOffset"
            />
          </ElSelect>

          <ElInput
            v-if="
              supportStreamOffsetNode[item.nodeId] &&
              item.pointType === 'streamOffset'
            "
            v-model="item.streamOffsetString"
            :disabled="disabled"
          />

          <ElDatePicker
            v-else-if="item.pointType === 'localTZ'"
            v-model="item.dateTime"
            :disabled="disabled"
            type="datetime"
            align="right"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="x"
            popper-class="setting-panel__dateTimePicker"
            :picker-options="
              getPickerOptionsBeforeTime(item.dateTime, Date.now())
            "
          />
        </div>
      </template>
    </RecycleScroller>
    <ElEmpty v-if="!value.length" small />
  </div>
</template>

<style scoped lang="scss"></style>
