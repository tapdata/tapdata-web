<script setup lang="ts">
import { inject, nextTick, ref, shallowRef, useTemplateRef, watch } from 'vue'
import FieldTreeNode from './FieldTreeNode.vue'
import { filterNode, makeTree } from './shared'
import type { ElTree } from 'element-plus'

interface Props {
  fields: any[]
  readonly?: boolean
}

const treeRef = useTemplateRef<InstanceType<typeof ElTree>>('treeRef')
const treeData = ref<any[]>([])
const search = ref('')

const currentRef = ref()
const currentFieldId = ref()
const currentEncryptionIds = ref<string[]>([])
const currentField = shallowRef<any>()
const popoverRef = ref()
const popoverVisible = ref(false)

const props = defineProps<Props>()

const encryptions = inject('encryptions') as any[]

const emit = defineEmits<{
  check: [keys: string[]]
}>()

watch(
  () => props.fields,
  (newVal) => {
    const children = makeTree(newVal)
    treeData.value = children.length
      ? [
          {
            field_name: 'root',
            id: 'root',
            isRoot: true,
            children,
          },
        ]
      : []
  },
  {
    immediate: true,
  },
)

const handleOpenEncryption = async (encryptionRef: HTMLElement, data: any) => {
  if (!popoverVisible.value) {
    currentRef.value = encryptionRef
    currentFieldId.value = data.id
    currentEncryptionIds.value = data.textEncryptionRuleIds || []
    currentField.value = data

    await nextTick()

    setTimeout(() => {
      popoverVisible.value = true
    }, 50)
  } else if (data.id === currentFieldId.value) {
    currentFieldId.value = null
    currentRef.value = null
    currentEncryptionIds.value = []
    currentField.value = null
    await nextTick()

    setTimeout(() => {
      popoverVisible.value = false
    }, 50)
  } else {
    popoverVisible.value = false

    await nextTick()

    setTimeout(() => {
      currentFieldId.value = data.id
      currentEncryptionIds.value = data.textEncryptionRuleIds || []
      currentField.value = data
      currentRef.value = encryptionRef
      popoverVisible.value = true
    }, 50)
  }
}

const handleRemoveEncryption = (data: any, i: number) => {
  data.textEncryptionRuleIds.splice(i, 1)
  if (popoverVisible.value) {
    currentEncryptionIds.value = data.textEncryptionRuleIds || []
  }
}

// 处理搜索
const handleSearch = (value: string) => {
  treeRef.value?.filter(value)
}

const handleSelectEncryption = (encryption: string) => {
  if (currentEncryptionIds.value.includes(encryption)) {
    currentEncryptionIds.value = currentEncryptionIds.value.filter(
      (id: string) => id !== encryption,
    )
  } else {
    currentEncryptionIds.value.push(encryption)
  }

  currentField.value.textEncryptionRuleIds = currentEncryptionIds.value
}

const getCheckedFields = (needMap?: boolean) => {
  const fields = treeRef.value?.getCheckedNodes(false, true)
  const rootIndex = fields!.findIndex((f) => f.id === 'root')

  rootIndex !== -1 && fields!.splice(rootIndex, 1)

  return needMap
    ? fields?.map((field) => {
        return {
          ...field,
          label: undefined,
          dataType: undefined,
          children: undefined,
        }
      })
    : fields
}

const handleCheck = () => {
  emit('check', (treeRef.value?.getCheckedKeys(true) || []) as string[])
}

const setCheckedFields = (fields: any[]) => {
  const flatFields: string[] = []

  fields.forEach((f) => {
    if (f.data_type !== 'DOCUMENT' && f.data_type !== 'ARRAY') {
      flatFields.push(f.field_name)
    } else {
      const node = treeRef.value?.getNode(f.field_name)

      if (!node?.childNodes?.length) flatFields.push(f.field_name)
    }
  })

  treeRef.value?.setCheckedKeys(flatFields)

  emit('check', flatFields)
}

const selectAll = () => {
  treeRef.value?.setCheckedKeys(['root'])
  emit('check', (treeRef.value?.getCheckedKeys(true) || []) as string[])
}

defineExpose({
  selectAll,
  setCheckedFields,
  getCheckedFields,
})
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
    <el-tree
      ref="treeRef"
      class="fields-tree"
      :data="treeData"
      :show-checkbox="!readonly"
      node-key="field_name"
      :default-expanded-keys="['root']"
      :default-checked-keys="[]"
      :filter-node-method="filterNode"
      @check="handleCheck"
    >
      <template #default="{ node, data }">
        <span v-if="data.isRoot">{{
          $t('packages_component_dataFlow_selectAll')
        }}</span>
        <FieldTreeNode
          v-else
          :node="node"
          :data="data"
          :readonly="readonly"
          @open-encryption="handleOpenEncryption"
          @remove-encryption="handleRemoveEncryption"
        />
      </template>
    </el-tree>
    <el-popover
      ref="popoverRef"
      v-model:visible="popoverVisible"
      :virtual-ref="currentRef"
      trigger="click"
      popper-class="p-0 w-auto"
      popper-style="min-width: 200px; max-width: 600px;"
      placement="bottom-end"
      :hide-after="0"
      virtual-triggering
    >
      <el-scrollbar>
        <div class="flex flex-column gap-1 p-1" style="max-height: 300px">
          <div
            v-for="encryption in encryptions"
            :key="encryption.id"
            class="lh-5 px-3 py-1.5 rounded-lg cursor-pointer list-item flex align-center justify-content-between gap-1"
            :class="{
              'is-selected': currentEncryptionIds.includes(encryption.id!),
            }"
            @click="handleSelectEncryption(encryption.id!)"
          >
            {{ encryption.name }}

            <el-icon size="16" color="var(--el-color-primary)"
              ><i-lucide:check
            /></el-icon>
          </div>
        </div>
      </el-scrollbar>
    </el-popover>
  </div>
</template>

<style scoped lang="scss">
.fields-tree {
  --el-tree-node-content-height: 32px;
  --el-tree-node-hover-bg-color: var(--el-fill-color-lighter);

  :deep(.el-tree-node__content:hover) {
    .text-editable:not(:focus-within):not(:hover) {
      border-color: var(--el-border-color-dark);
    }
  }
}

.list-item {
  &:hover {
    background-color: var(--el-fill-color-light);
  }
  .el-icon {
    display: none;
  }
  &.is-selected {
    color: var(--el-color-primary);
    .el-icon {
      display: inline-flex;
    }
  }
}
.encryption-popover {
  max-width: 200px;
}
</style>
