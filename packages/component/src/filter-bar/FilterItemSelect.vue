<template>
  <ElSelectV2
    class="filter-item-select"
    :style="selectStyle"
    :filterable="filterable"
    :options="options"
    :popper-class="popperClass"
    :popper-options="popperOptions"
  >
    <template #prefix>
      {{ label }}
    </template>

    <template #default="{ item }">
      <slot name="default" :item="item" />
    </template>

    <!-- <template #label="{ label, value }">
      <el-tag
        type="primary"
      >
        {{ label }}
      </el-tag>
    </template> -->
  </ElSelectV2>
</template>

<script setup>
import { computed, onBeforeMount, ref, toRefs } from 'vue'
import { addUnit } from 'element-plus/es/utils/index.mjs'
import { isFn } from '@tap/shared'
// import { ElSelectV2 as FilterSelect } from 'element-plus'

defineOptions({
  name: 'FilterItemSelect',
})

const props = defineProps({
  items: [Array, Function],
  label: String,
  filterable: Boolean,
  width: {
    type: [String, Number],
    default: 200,
  },
  dropdownWidth: [String, Number],
})

const { items } = toRefs(props)

const selectStyle = computed(() => {
  return {
    width: addUnit(props.width),
  }
})

const popperClass = computed(() => {
  return ['filter-item-select__popper', props.dropdownWidth ? 'is-fixed-width' : '']
})

const options = ref([])

const inputValue = ref('')

const popperOptions = computed(() => {
  const modifiers = [
    {
      name: 'offset',
      options: {
        offset: [0, 4],
      },
    },
  ]

  if (props.dropdownWidth) {
    modifiers.push(
      {
        name: 'computeStyles',
        options: {
          gpuAcceleration: false,
        },
      },
      {
        name: 'applyStyles',
        enabled: false, // 禁用默认样式应用
      },
      {
        name: 'customWidthModifier',
        enabled: true,
        phase: 'write',
        fn({ state }) {
          // 自定义宽度
          state.styles.popper.width = addUnit(props.dropdownWidth)
        },
      },
    )
  }

  return {
    modifiers,
  }
})

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
  .el-select__prefix {
    color: var(--el-text-color-secondary);
  }
  /*.el-select-v2__input-wrapper {
    display: none;
  }
  .el-select-v2__placeholder {
    position: relative;
    width: auto;
    max-width: 200px;
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
  &.is-fixed-width {
    .el-select-dropdown__list {
      width: 100% !important;
    }
  }*/
}

.filter-item-select__popper {
  &.is-fixed-width {
    .el-select-dropdown,
    .el-select-dropdown__list {
      width: 100% !important;
    }
  }
}
</style>
