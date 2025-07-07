<script setup lang="ts">
import { debounce, escapeRegExp, isString, merge } from 'lodash-es'
import { computed, markRaw, nextTick, onMounted, ref, toRaw, watch } from 'vue'
import SelectLoading from './SelectLoading.vue'

const page = ref(0)
const loadingData = ref(false)
const loadingMore = ref(false)
const hasMore = ref(true)
const query = ref(null) // 初始值为空，用于触发第一次进入remoteMethod请求
const selectRef = ref(null)
const optionTotal = ref(-1)

const selectOptions = ref<any[]>([])

interface Props {
  modelValue?: Array<any> | string | number | boolean | object
  method: Function
  onSetSelected?: Function // 主要是在schema场景下做交互使用
  itemType?: string
  itemLabel?: string
  itemValue?: string
  itemQuery?: string
  currentLabel?: string | Array<any>
  debounceWait?: number
  pageSize?: number
  paramsSerializer?: Function
  params?: object
  lazy?: boolean
  loading?: boolean
  cache?: boolean
  loadingText?: string
  noMoreText?: string
  hasCreate?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  itemType: 'object',
  itemLabel: 'label',
  itemValue: 'value',
  debounceWait: 200,
  cache: true,
  hasCreate: false,
})

const paramsSerializer = (params: {
  query: string | null
  page: number
  pageSize: number | undefined
}) => {
  if (props.paramsSerializer) {
    return props.paramsSerializer(params)
  }

  const filter: {
    page: number
    size: number
    where?: {
      [key: string]: {
        like: string
        options: string
      }
    }
  } = {
    page: params.page,
    size: params.pageSize || 20,
  }

  if (params.query) {
    filter.where = {
      [props.itemValue || props.itemLabel]: {
        like: escapeRegExp(params.query),
        options: 'i',
      },
    }
  }

  return filter
}

const isStrItem = computed(() => {
  return isString(selectOptions.value[0])
})

const showNewOption = computed(() => {
  if (!query.value || !props.hasCreate) return false

  const hasExistingOption = isStrItem.value
    ? selectOptions.value.includes(query.value)
    : selectOptions.value.some((option) => {
        return option[props.itemLabel] === query.value
      })

  return !hasExistingOption
})

const emit = defineEmits([
  'update:modelValue',
  'update:loading',
  'changeLabel',
  'optionSelect',
  'select',
])

const showLoading = computed(() => props.loading || loadingData.value)

const getParams = (pageNum = page.value) => {
  return merge(
    paramsSerializer({
      query: query.value,
      page: pageNum,
      pageSize: props.pageSize,
    }),
    props.params,
  )
}

const labelContent = ref('')

// 回显数据
const setCurrentLabel = async () => {
  const [current] = selectRef.value?.states.selected || []

  if (!current) return

  if (current.currentLabel === current.value && props.itemType === 'object') {
    if (props.currentLabel) {
      labelContent.value = props.currentLabel
    }

    if (props.lazy) return

    const optionData = await getOption(current.value)
    labelContent.value = optionData?.[props.itemLabel]
  }
}

const getLabel = (value, label) => {
  if (props.itemType === 'object' && label === value) {
    return labelContent.value
  }

  return label
}

const getOption = async (value) => {
  const { itemValue } = props
  const filter = merge({}, props.params, {
    where: { [itemValue]: value },
    size: 1,
  })
  const { items } = await props.method(filter)
  const [item] = items

  if (item) {
    return item
  }
}

const doRemoteMethod = async (_query?: any) => {
  query.value = _query
  page.value = 1

  const res = await props.method(getParams())

  loadingData.value = false
  const list = res.items || []
  selectOptions.value = []
  selectOptions.value.push(...list)
  hasMore.value = selectOptions.value.length < res.total
  optionTotal.value = res.total
}

const remoteMethodDebounce = debounce(doRemoteMethod, props.debounceWait)

const remoteMethod = async (_query: string) => {
  if (_query === query.value && props.cache) return

  loadingData.value = true

  await doRemoteMethod(_query)
}

const onVisibleChange = (visible: boolean) => {
  if (!visible) {
    selectRef.value.scrollbarRef?.setScrollTop(0)
  }
}

/**
 * 加载数据列表
 */
const loadDataList = async (newPage: number) => {
  try {
    const res = await props.method(getParams(newPage))
    const list = res.items || []

    if (newPage === 1) {
      selectOptions.value = []
    }

    selectOptions.value.push(...list)
    hasMore.value = selectOptions.value.length < res.total
    page.value = newPage
  } catch (error) {
    console.error(error)
  }
}

const refresh = async () => {
  loadingData.value = true
  await loadDataList(1).finally(() => {
    loadingData.value = false
  })
}

/**
 * 加载更多数据
 */
const handleLoadMore = async (newPage: number) => {
  loadingMore.value = true
  await loadDataList(newPage).finally(() => {
    loadingMore.value = false
  })
}

const handleChange = () => {
  nextTick(() => {
    setCurrentLabel()
  })
}

const onChange = (value: any) => {
  nextTick(() => {
    const selectedOption = selectRef.value.states.options.get(value)

    if (isStrItem.value) {
      emit('changeLabel', value)
      emit('optionSelect', value, true)
      selectedOption && emit('select', value, value, selectedOption.created)
    } else if (selectedOption) {
      const originData = selectedOption.$attrs?.['origin-data']
      emit('changeLabel', selectedOption.label)
      emit('optionSelect', originData, true)
      emit('select', value, originData, selectedOption.created)
    }
  })
}

const onUpdateModelValue = (val) => {
  emit('update:modelValue', val)
}

defineExpose({
  loadDataList: refresh,
  refresh,
  focus: () => {
    selectRef.value.focus()
  },
})

watch(
  () => props.modelValue,
  () => {
    handleChange()
  },
)

watch(
  () => props.params,
  (newVal, oldVal) => {
    if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
      remoteMethodDebounce()
    }
  },
  {
    deep: true,
  },
)

onMounted(() => {
  nextTick(() => {
    setCurrentLabel()
  })
})
</script>

<template>
  <el-select
    ref="selectRef"
    :model-value="modelValue"
    remote
    filterable
    remote-show-suffix
    :remote-method="remoteMethod"
    @update:model-value="onUpdateModelValue"
    @visible-change="onVisibleChange"
    @change="onChange"
  >
    <template #prefix>
      <slot name="prefix" />
      <el-icon
        v-if="showLoading"
        class="el-select-loading__icon is-select-loading"
        ><ElIconLoading
      /></el-icon>
    </template>

    <template #label="{ label, value }">
      <span>{{ getLabel(value, label) }}</span>
    </template>

    <slot v-if="showNewOption" name="created-option" :value="query" />

    <el-option v-if="showLoading" class="el-select-loading">
      <el-icon class="el-select-loading__icon"><ElIconLoading /></el-icon>
      <span class="el-select-loading__tips">{{
        loadingText || '正在加载'
      }}</span>
    </el-option>

    <div v-show="!showLoading">
      <template v-if="!isStrItem">
        <el-option
          v-for="item in selectOptions"
          :key="item[itemValue]"
          :label="item[itemLabel]"
          :value="item[itemValue]"
          :origin-data="toRaw(item)"
        >
          <slot name="option" :item="item" />
        </el-option>
      </template>

      <template v-else>
        <el-option v-for="item in selectOptions" :key="item" :value="item" />
      </template>
    </div>

    <SelectLoading
      v-if="optionTotal !== 0 && !showLoading"
      :page="page"
      :loading="loadingMore"
      :loading-text="loadingText"
      :no-more-text="noMoreText"
      :has-more="hasMore"
      @load-more="handleLoadMore"
    />

    <template #empty>
      <slot name="empty" :query="query" />
    </template>
  </el-select>
</template>

<style lang="scss" scoped>
.el-select-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: initial;
  pointer-events: none;
  color: var(--el-color-info);

  &__icon {
    font-size: 16px;
    animation: rotate 1.5s linear infinite;
  }

  &__tips {
    margin-left: 6px;
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
}
.is-select-loading {
  position: absolute;
  right: 12px;
  background-color: var(--el-fill-color-blank);
  z-index: 2;
}
</style>
