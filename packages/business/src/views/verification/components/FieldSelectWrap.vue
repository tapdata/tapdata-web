<script setup lang="ts">
import { BaseFieldSelect as FieldSelect } from '@tap/form'
import { debounce } from 'lodash-es'
import { computed, nextTick, ref, useTemplateRef, watchEffect } from 'vue'
import type { ElInput } from 'element-plus'

// Define props with TypeScript types
const props = defineProps<{
  value: string
  options?: any[]
  placeholder?: string
}>()

// Define emits
const emit = defineEmits<{
  (e: 'update:value', value: string): void
  (e: 'focus'): void
}>()

// Reactive references
const allSelected = ref(false)
const search = ref('')
const searchInput = useTemplateRef<InstanceType<typeof ElInput>>('searchInput')
const filteredOptions = ref(props.options)

// Computed property for select fields
const selectFields = computed({
  get: () => (props.value ? props.value.split(',') : []),
  set: (val: string[]) => {
    emit(
      'update:value',
      val?.length
        ? Array.from(new Set(val.filter((v) => !!v.trim()))).join(',')
        : '',
    )
  },
})

const filteredNames = computed(() => {
  return filteredOptions.value.map((item) => item.field_name)
})

// Handle focus event
const handleFocus = () => {
  emit('focus')
}

// Handle visibility change
const handleVisibleChange = (visible: boolean) => {
  if (!visible) {
    search.value = ''
    searchInput.value?.blur()
    handleSearch('')
  } else {
    nextTick(() => {
      searchInput.value?.focus()
    })
  }
}

const handleSearch = debounce((value: string) => {
  if (!value) {
    filteredOptions.value = props.options
    return
  }

  const searchTerm = value.toLowerCase()
  filteredOptions.value = props.options.filter((item) => {
    return item.field_name.toLowerCase().includes(searchTerm)
  })
}, 100)

const updateSelectAll = () => {
  allSelected.value =
    selectFields.value.length >= filteredOptions.value.length &&
    filteredNames.value.every((item) => selectFields.value.includes(item))
}

watchEffect(() => {
  updateSelectAll()
})

const handleAllSelected = () => {
  if (allSelected.value) {
    selectFields.value = selectFields.value.filter(
      (item) => !filteredNames.value.includes(item),
    )
  } else {
    selectFields.value = [
      ...new Set([...selectFields.value, ...filteredNames.value]),
    ]
  }
}
</script>

<template>
  <FieldSelect
    v-model="selectFields"
    popper-class="field-select-wrap-popper"
    :filterable="false"
    multiple
    item-label="field_name"
    item-value="field_name"
    :options="filteredOptions"
    :placeholder="placeholder"
    @focus="handleFocus"
    @visible-change="handleVisibleChange"
  >
    <template #header>
      <div class="pt-1">
        <el-input
          ref="searchInput"
          v-model="search"
          clearable
          :placeholder="$t('public_search_field_name')"
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon size="16"><i-mingcute:search-line /></el-icon>
          </template>
        </el-input>
        <el-divider class="my-1" />
        <div
          class="px-5 mx-1 flex align-center gap-1 fs-7 rounded-lg all-selected-item cursor-pointer"
          :class="{ none: filteredOptions.length === 0 }"
          @click="handleAllSelected"
        >
          <el-checkbox :model-value="allSelected">
            <span class="fw-sub">{{
              allSelected
                ? $t('public_cancel_all_selected')
                : $t('public_all_selected')
            }}</span>
            <!-- <span
              class="fw-normal bg-gray-100 rounded-lg p-1 font-color-light ml-2"
              ><span
                :class="{
                  'font-color-dark': selectFields.length > 0,
                }"
                >{{ selectFields.length }}</span
              >/{{ filteredOptions.length }}</span
            > -->
          </el-checkbox>

          <el-icon v-if="allSelected" class="ml-auto color-primary" size="16">
            <i-mingcute:check-line />
          </el-icon>
        </div>
      </div>
    </template>
  </FieldSelect>
</template>

<style lang="scss">
.field-select-wrap-popper {
  .el-select-dropdown__header {
    padding: 0;
    border-bottom: 0;

    .el-input {
      .el-input__wrapper {
        box-shadow: none;
      }
    }

    .all-selected-item {
      height: 34px;
      &:hover {
        background-color: var(--el-fill-color-light);
      }

      &.is-checked {
        background-color: var(--primary-hover-light) !important;
      }
    }
  }
}
</style>
