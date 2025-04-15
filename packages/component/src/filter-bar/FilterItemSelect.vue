<script setup>
import { isFn } from '@tap/shared'
import { addUnit } from 'element-plus/es/utils/index.mjs'
import { computed, onBeforeMount, ref, toRefs } from 'vue'

defineOptions({
  name: 'FilterItemSelect',
})

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

const { items } = toRefs(props)

const selectStyle = computed(() => {
  return {
    // width: isEmpty.value && !props.filterable ? 'auto' : addUnit(props.width),
    width: !props.filterable ? 'auto' : addUnit(props.width),
  }
})

const isEmpty = computed(() => {
  return props.emptyValues.includes(model.value)
})

const options = ref([])

onBeforeMount(async () => {
  if (isFn(items.value)) {
    options.value = await items.value()
  } else {
    options.value = items.value
  }
})
</script>

<template>
  <ElSelectV2
    v-model="model"
    class="filter-item-select"
    :class="{ 'is-empty': isEmpty, 'is-active': !isEmpty }"
    :style="selectStyle"
    :filterable="filterable"
    :options="options"
    :fit-input-width="props.width"
  >
    <template #prefix>
      {{ label }}
    </template>

    <template #default="{ item }">
      <slot name="default" :item="item" />
    </template>
  </ElSelectV2>
</template>

<style lang="scss">
.filter-item-select {
  .el-select__prefix {
    color: var(--el-text-color-caption);
  }

  &.is-active {
    --el-text-color-regular: var(--el-color-primary);

    .el-select__wrapper {
      &:not(.is-filterable) {
        .el-select__placeholder {
          position: static;
          transform: none;
          width: auto;
        }
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
</style>
