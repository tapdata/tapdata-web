<script setup lang="ts">
import { Drawer } from '@tap/component'
import { useI18n } from '@tap/i18n'
import { provide, ref } from 'vue'
import DataServerList from '../data-server/List.vue'

interface Details {
  value: string
  desc: string
}

interface ListParams {
  [key: string]: any
}

const { t } = useI18n()

const loading = ref(false)
const visible = ref(false)
const details = ref<Details>({
  value: '',
  desc: '',
})
const listParams = ref<ListParams>({})
const table = ref<InstanceType<typeof DataServerList> | null>(null)

const listColumns = [
  {
    label: t('packages_business_data_server_list_fuwumingcheng'),
    prop: 'name',
    slotName: 'name',
    'min-width': 180,
    'show-overflow-tooltip': true,
  },
  {
    label: t('packages_business_data_server_list_fuwuzhuangtai'),
    'min-width': 100,
    prop: 'statusFmt',
    slotName: 'statusFmt',
  },
  {
    label: t('public_operation'),
    width: 200,
    prop: 'operation',
    slotName: 'operation',
  },
]

const loadData = (data: Details, opt: ListParams = {}) => {
  details.value = data
  listParams.value = opt
  table.value?.fetch()
  visible.value = true
}

const handleVisible = () => {
  visible.value = false
}

const handleDataServerListVisible = (val: boolean) => {
  if (!val) {
    setTimeout(() => {
      loadData(details.value, listParams.value)
    }, 80)
  }
}

provide('apiApplication', details)

defineExpose({
  loadData,
  handleVisible,
  handleDataServerListVisible,
})
</script>

<template>
  <Drawer
    v-bind="$attrs"
    v-model:visible="visible"
    v-loading="loading"
    class="app-details"
    :class="{ 'flex flex-column': visible }"
    width="800px"
    :withHeader="false"
    @visible="handleVisible"
  >
    <DataServerList
      ref="table"
      :show-filter="false"
      :columns="listColumns"
      :params="listParams"
      class="flex-fill"
      mode="blank"
      @drawer-visible="handleDataServerListVisible"
    >
      <template #title>
        <div class="min-w-0 overflow-hidden">
          <div class="fs-5 py-4 font-color-dark">
            {{ details.value }}
            <div
              v-if="details.desc"
              class="mt-1 fs-7 font-color-sslight ellipsis"
            >
              {{ details.desc }}
            </div>
          </div>
        </div>
      </template>
    </DataServerList>
  </Drawer>
</template>

<style lang="scss" scoped>
.app-details {
  padding: 16px;
  z-index: 2000;
}
</style>
