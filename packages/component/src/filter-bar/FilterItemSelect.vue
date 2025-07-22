<script setup>
import { isFn } from '@tap/shared'

import { escapeRegExp, get } from 'lodash-es'
import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  useAttrs,
  useTemplateRef,
  watch,
} from 'vue'

defineOptions({
  name: 'FilterItemSelect',
})

const attrs = useAttrs()

const search = ref('')
const root = useTemplateRef('root')
const searchInput = useTemplateRef('searchInput')

const model = defineModel()

const props = defineProps({
  items: [Array, Function],
  label: String,
  filterable: Boolean,
  width: {
    type: [String, Number],
    default: 200,
  },
  dropdownWidth: [String, Number],
  emptyValues: {
    type: Array,
    default: () => ['', null, undefined],
  },
})

const selectStyle = computed(() => {
  return {
    width: 'auto',
  }
})

const isEmpty = computed(() => {
  return props.emptyValues.includes(model.value)
})

const filteredOptions = computed(() => {
  if (!props.filterable || !search.value) {
    return options.value
  }

  const labelKey = attrs.props?.label || 'label'

  const regexp = new RegExp(escapeRegExp(search.value), 'i')
  return options.value.filter((item) => {
    return regexp.test(get(item, labelKey))
  })
})

const options = ref([])

const setOptions = async () => {
  if (isFn(props.items)) {
    options.value = await props.items()
  } else {
    options.value = props.items
  }
}

watch(
  () => props.items,
  () => {
    setOptions()
  },
  {
    immediate: true,
  },
)

const handleVisibleChange = (visible) => {
  if (props.filterable) {
    if (!visible) {
      search.value = ''
      searchInput.value.blur()
    } else {
      nextTick(() => {
        searchInput.value.focus()
      })
    }
  }
}
</script>

<template>
  <ElSelectV2
    ref="root"
    v-model="model"
    class="filter-item-select"
    popper-class="filter-item-select-popper"
    :class="{ 'is-empty': isEmpty, 'is-active': !isEmpty }"
    :style="selectStyle"
    :options="filteredOptions"
    :fit-input-width="false"
    @visible-change="handleVisibleChange"
  >
    <template v-if="filterable" #header>
      <el-input
        ref="searchInput"
        v-model="search"
        :placeholder="$attrs.placeholder || 'Search'"
        clearable
      >
        <template #prefix>
          <VIcon>magnify</VIcon>
        </template>
      </el-input>
    </template>

    <template #prefix>
      {{ label }}
    </template>

    <template #label="scoped">
      <slot name="label" v-bind="scoped" />
    </template>

    <template #default="{ item }">
      <slot name="default" :item="item">
        <div>{{ item.label }}</div>
      </slot>
    </template>
  </ElSelectV2>
</template>

<style lang="scss">
.filter-item-select {
  .el-select__prefix {
    color: var(--el-text-color-caption);
  }

  .el-select__input-wrapper {
    display: none;
  }

  &.is-active {
    --el-text-color-regular: var(--el-color-primary);

    .el-select__wrapper {
      .el-select__placeholder {
        position: static;
        transform: none;
        width: auto;
      }
      box-shadow: 0 0 0 1px var(--el-color-primary) inset;
    }
  }

  .el-select__suffix {
    padding: 4px;
    border-radius: 6px;
  }

  .el-select__suffix:has(.el-select__clear):hover {
    background-color: var(--primary-hover-light);
  }

  .el-select__suffix {
    .el-icon {
      font-size: 12px;
    }
    .el-select__clear {
      color: var(--el-color-primary);
    }
  }
}

.filter-item-select-popper {
  .el-select-dropdown__header {
    padding: 4px 0;
    .el-input__wrapper {
      box-shadow: none;
    }
  }
}
</style>
