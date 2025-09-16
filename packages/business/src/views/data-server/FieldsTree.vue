<script setup lang="ts">
import {
  inject,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  shallowRef,
  useTemplateRef,
  watch,
  type Ref,
} from 'vue'
import FieldTreeNode from './FieldTreeNode.vue'
import { filterNode, makeTree } from './shared'
import type { ElScrollbar, ElTree } from 'element-plus'

interface Props {
  fields: any[]
  readonly?: boolean
}

const treeRef = useTemplateRef<InstanceType<typeof ElTree>>('treeRef')
const scrollbarRef =
  useTemplateRef<InstanceType<typeof ElScrollbar>>('scrollbarRef')
const treeData = ref<any[]>([])
const search = ref('')

const currentRef = ref()
// 兜底锚点元素，避免字段取消选中时，popover 位置漂移
let currentTriggerEl: HTMLElement | null = null
let lastTriggerRect: DOMRect | null = null
let fallbackAnchorEl: HTMLDivElement | null = null

const ensureFallbackAnchor = () => {
  if (!fallbackAnchorEl) {
    const el = document.createElement('div')
    el.style.position = 'fixed'
    el.style.width = '0px'
    el.style.height = '0px'
    el.style.pointerEvents = 'none'
    el.style.zIndex = '-1'
    document.body.append(el)
    fallbackAnchorEl = el
  }
}

const moveFallbackToRect = (rect: DOMRect | null) => {
  if (!rect) return
  ensureFallbackAnchor()
  if (fallbackAnchorEl) {
    fallbackAnchorEl.style.left = `${Math.max(0, rect.left)}px`
    fallbackAnchorEl.style.top = `${Math.max(0, rect.top)}px`
    fallbackAnchorEl.style.width = `${rect.width}px`
    fallbackAnchorEl.style.height = `${rect.height}px`
  }
}
const currentFieldId = ref()
const currentEncryptionIds = ref<string[]>([])
const currentField = shallowRef<any>()
const popoverRef = ref()
const popoverVisible = ref(false)

const props = defineProps<Props>()

const encryptions = inject<Ref<any[]>>('encryptions', ref([]))

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

const setCurrent = (refEl: HTMLElement, field: any) => {
  currentTriggerEl = refEl
  lastTriggerRect = refEl.getBoundingClientRect()
  currentRef.value = refEl
  currentFieldId.value = field.id
  currentEncryptionIds.value = field.textEncryptionRuleIds || []
  currentField.value = field
}

const openPopover = async () => {
  await nextTick()
  setTimeout(() => {
    popoverVisible.value = true
  }, 50)
}

const closePopover = async () => {
  currentRef.value = null

  await nextTick()

  setTimeout(() => {
    popoverVisible.value = false
  }, 50)
}

const handleOpenEncryption = async (encryptionRef: HTMLElement, data: any) => {
  if (!popoverVisible.value) {
    setCurrent(encryptionRef, data)
    await openPopover()
  } else if (data.id === currentFieldId.value) {
    await closePopover()
  } else {
    popoverVisible.value = false
    await nextTick()
    setTimeout(() => {
      setCurrent(encryptionRef, data)
      popoverVisible.value = true
    }, 50)
  }
}

const handleGlobalKeydown = (e: KeyboardEvent) => {
  if (e.key !== 'Escape' && e.key !== 'Esc') return
  if (!popoverVisible.value) return

  e.preventDefault()
  e.stopPropagation()
  e.stopImmediatePropagation?.()
  closePopover()
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

const handleCheck = (data: any) => {
  if (popoverVisible.value) {
    const node = treeRef.value?.getNode(data.field_name)
    if (!node || (!node.checked && !node.indeterminate)) {
      if (currentTriggerEl && currentTriggerEl.isConnected) {
        lastTriggerRect = currentTriggerEl.getBoundingClientRect()
      }
      moveFallbackToRect(lastTriggerRect)
      currentRef.value = fallbackAnchorEl
      popoverVisible.value = false
    }
  }
  emit('check', (treeRef.value?.getCheckedKeys(true) || []) as string[])
}

const onPopoverBeforeEnter = () => {
  const scrollToFirstSelectedInPopover = () => {
    const scrollbar = scrollbarRef.value
    const wrap = scrollbar?.wrapRef as HTMLElement | undefined
    if (!wrap) return
    const selectedId = (encryptions.value || []).find((e: any) =>
      (currentEncryptionIds.value || []).includes(e?.id),
    )?.id

    scrollbarRef.value?.update()

    if (!selectedId) {
      scrollbar?.setScrollTop?.(0)
      wrap.scrollTop = 0
      scrollbar?.handleScroll?.()
      return
    }

    const target = wrap.querySelector(
      `[data-encryption-id="${selectedId}"]`,
    ) as HTMLElement | null
    const top = target ? Math.max(0, target.offsetTop - 4) : 0
    wrap.scrollTop = top
    scrollbar?.handleScroll?.()
  }

  nextTick(scrollToFirstSelectedInPopover)
}

const onPopoverLeave = async () => {
  if (popoverVisible.value) {
    await closePopover()
  }

  currentFieldId.value = null
  currentEncryptionIds.value = []
  currentField.value = null
  currentRef.value = null
  currentTriggerEl = null
  lastTriggerRect = null
  if (fallbackAnchorEl) {
    fallbackAnchorEl.remove()
    fallbackAnchorEl = null
  }
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

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown, {
    capture: true,
  })
})

onUnmounted(() => {
  onPopoverLeave()
  window.removeEventListener('keydown', handleGlobalKeydown, {
    capture: true,
  } as any)
})

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
      @before-enter="onPopoverBeforeEnter"
      @after-leave="onPopoverLeave"
    >
      <el-scrollbar ref="scrollbarRef">
        <div class="flex flex-column gap-1 p-1" style="max-height: 300px">
          <div
            v-for="encryption in encryptions"
            :key="encryption.id"
            :data-encryption-id="encryption.id"
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
