<script setup lang="ts">
import { computed, inject, nextTick, ref, useTemplateRef, watch } from 'vue'
import { filterNode, makeTree } from './shared'
import type { ElTreeV2 } from 'element-plus'

interface Props {
  fields: any[]
  readonly?: boolean
}

const treeRef = useTemplateRef<InstanceType<typeof ElTreeV2>>('treeRef')
const treeData = ref<any[]>([])
const search = ref('')
const props = defineProps<Props>()
const encryptionsMap = inject('encryptionsMap') as Record<string, string>
const itemSize = 26
const treeProps = {
  value: 'field_name',
}

const treeHeight = computed(() => {
  return Math.min(props.fields.length * itemSize, window.innerHeight * 0.6)
})

watch(
  () => props.fields,
  (newVal) => {
    treeData.value = makeTree(newVal)

    nextTick(() => {
      const expandedKeys = props.fields
        .filter((f) => f.data_type === 'DOCUMENT' || f.data_type === 'ARRAY')
        .map((f) => f.field_name)

      treeRef.value?.setExpandedKeys(expandedKeys)
    })
  },
  {
    immediate: true,
  },
)

// 处理搜索
const handleSearch = (value: string) => {
  treeRef.value?.filter(value)
}
</script>

<template>
  <div>
    <el-input
      v-model="search"
      :placeholder="$t('public_search_field_name')"
      clearable
      class="mb-2"
      @input="handleSearch"
    >
      <template #prefix>
        <el-icon><i-mingcute:search-line /></el-icon>
      </template>
    </el-input>
    <el-tree-v2
      ref="treeRef"
      class="fields-tree"
      :data="treeData"
      :props="treeProps"
      :filter-method="filterNode"
      :height="treeHeight"
    >
      <template #default="{ data }">
        <div class="flex align-center gap-2 min-w-0 flex-1 pr-2">
          <span>{{ data.label }}</span>
          <span v-if="data.name !== data.label" class="text-gray-500"
            >({{ data.name }})</span
          >
          <div class="flex-1" />
          <el-button
            v-if="data.textEncryptionRuleIds?.length"
            text
            class="encryption-btn min-w-0"
          >
            <el-icon color="var(--el-color-primary)"
              ><i-lucide:shield-ellipsis
            /></el-icon>
            <div class="flex align-center gap-1 ml-1 overflow-hidden">
              <el-tag
                v-for="encryption in data.textEncryptionRuleIds"
                :key="encryption"
                size="small"
                class="border-0"
                disable-transitions
                >{{ encryptionsMap[encryption] }}</el-tag
              >
            </div>
          </el-button>
          <el-tag class="is-code font-mono" size="small" disable-transitions>{{
            data.dataType
          }}</el-tag>
        </div>
      </template>
    </el-tree-v2>
  </div>
</template>

<style scoped lang="scss">
.fields-tree {
  --el-tree-node-content-height: 32px;
  --el-tree-node-hover-bg-color: var(--el-fill-color-lighter);
}
.el-button.encryption-btn.encryption-btn {
  --el-button-text-color: var(--el-text-color-disabled);
  :deep(> span) {
    min-width: 0;
  }
  &:hover {
    --el-button-text-color: var(--el-text-color-primary);
  }
}
</style>
