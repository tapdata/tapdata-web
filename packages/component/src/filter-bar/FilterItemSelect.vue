<template>
  <FilterSelect
    class="filter-item-select"
    popper-class="filter-item-select__popper"
    :options="options"
    :popper-options="{
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, 4],
          },
        },
      ],
    }"
  >
    <template #prefix>
      <span class="pl-2 lh-base font-color-light">{{ label }}</span>
    </template>
  </FilterSelect>
</template>

<script setup>
import { ref, toRefs, onBeforeMount } from 'vue'
import { isFn } from '@tap/shared'
// import FilterSelect from './FilterSelect.vue'
import { ElSelectV2 as FilterSelect } from 'element-plus'

defineOptions({
  name: 'FilterItemSelect',
})

const props = defineProps({
  items: [Array, Function],
  label: String,
})

const { items } = toRefs(props)

let options = ref([])

onBeforeMount(async () => {
  if (isFn(items.value)) {
    options.value = await items.value()
  } else {
    options.value = items.value
  }
})
</script>

<style lang="scss">
.filter-item-select {
  .el-select-v2__input-wrapper {
    display: none;
  }
  .el-select-v2__placeholder {
    position: relative;
    width: auto;
    transform: none;
  }
  .el-select-v2__wrapper,
  .el-select-v2__wrapper .el-select-v2__input-wrapper {
    line-height: 28px;
  }
}
.filter-item-select__popper {
  .el-popper__arrow {
    display: none;
  }
}
</style>
