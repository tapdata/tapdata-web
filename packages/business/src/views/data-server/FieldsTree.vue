<script setup lang="ts">
import { fetchEncryptionList, useRequest } from '@tap/api'
import { useI18n } from '@tap/i18n'
import { computed, nextTick, ref, shallowRef, useTemplateRef, watch } from 'vue'
import FieldTreeNode from './FieldTreeNode.vue'
import type { ElTree } from 'element-plus'

interface Props {
  fields: any[]
}

const { t } = useI18n()

const treeRef = useTemplateRef<InstanceType<typeof ElTree>>('treeRef')
const treeData = ref([])

const currentRef = ref()
const currentFieldId = ref()
const currentEncryptionIds = ref<string[]>([])
const currentField = shallowRef<any>()
const popoverRef = ref()
const popoverVisible = ref(false)

const props = defineProps<Props>()

const makeTree = (data) => {
  const root = { children: [] }

  for (const item of data) {
    const { field_name, field_alias } = item
    let parent = root
    const fields = field_name.split('.')

    for (let i = 0; i < fields.length; i++) {
      const name = fields[i]
      let child = parent.children.find((c) => c.name === name)

      if (!child) {
        child = { label: field_alias || name, name, children: [] }
        parent.children.push(child)
      }

      parent = child

      if (i === fields.length - 1) {
        Object.assign(parent, item, {
          label: field_alias || name,
          name,
        })
      }
    }
  }

  return root.children
}

const { data: encryptions } = useRequest(
  async () => {
    const { items } = await fetchEncryptionList({
      limit: 10000,
    })
    return items
  },
  {
    initialData: [],
  },
)

const encryptionsMap = computed(() => {
  return encryptions.value!.reduce((acc: Record<string, string>, item) => {
    acc[item.id!] = item.name
    return acc
  }, {})
})

watch(
  () => props.fields,
  (newVal) => {
    treeData.value = makeTree(newVal)
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

const handleCheck = (data: any) => {
  console.log('handleCheck', treeRef.value?.getCheckedNodes(false, true))
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
</script>

<template>
  <div>
    <el-input
      v-model="search"
      placeholder="搜索字段名称"
      clearable
      class="mb-2"
    >
      <template #prefix>
        <el-icon><i-mingcute:search-line /></el-icon>
      </template>
    </el-input>
    <div class="flex align-center gap-1 justify-content-between lh-5">
      <el-checkbox>
        <span class="fw-sub">全选</span>
        <span class="text-gray-500">(共{{ treeData.length }}个字段)</span>
      </el-checkbox>
    </div>
    <el-tree
      ref="treeRef"
      class="fields-tree"
      :data="treeData"
      show-checkbox
      @check="handleCheck"
    >
      <template #default="{ node, data }">
        <FieldTreeNode
          :node="node"
          :data="data"
          :encryptions-map="encryptionsMap"
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
      popper-style="min-width: 200px; max-width: 400px;"
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
