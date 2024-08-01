<template>
  <el-select
    ref="selectRef"
    placeholder="请选择"
    :model-value="modelValue"
    remote
    filterable
    remote-show-suffix
    :remote-method="remoteMethod"
    @update:modelValue="onUpdateModelValue"
    @visible-change="onVisibleChange"
    @change="onChange"
  >
    <template #label="{ label, value }">
      <span>{{ getLabel(value, label) }}</span>
    </template>

    <div v-show="!showLoading">
      <el-option
        v-for="item in selectOptions"
        :key="item[itemValue]"
        :label="item[itemLabel]"
        :value="item[itemValue]"
      />
    </div>

    <el-option v-if="showLoading" class="el-select-loading">
      <el-icon class="el-select-loading__icon"><ElIconLoading /></el-icon>
      <span class="el-select-loading__tips">{{ loadingText || '正在加载' }}</span>
    </el-option>

    <ElSelectLoading
      v-if="optionTotal !== 0 && !showLoading"
      :page="page"
      :loading="loadingMore"
      :hasMore="hasMore"
      @loadMore="handleLoadMore"
    />

    <template #empty>
      <slot name="empty" :query="query"></slot>
    </template>
  </el-select>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch, computed } from 'vue'
import { isNum } from '@tap/shared'
import ElSelectLoading from './ElSelectLoading.vue'
import { escapeRegExp, debounce, merge } from 'lodash-es'

const page = ref(0)
const loadingData = ref(false)
const loadingMore = ref(false)
const hasMore = ref(true)
const query = ref('')
const selectRef = ref(null)
const optionTotal = ref(-1)

const selectOptions = ref<any[]>([])

interface Props {
  modelValue: [Array<any>, String, Number, Boolean, Object]
  method: Function
  onSetSelected: Function // 主要是在schema场景下做交互使用
  itemType?: string
  itemLabel?: string
  itemValue?: string
  itemQuery?: string
  currentLabel?: string | Array<any>
  debounceWait: number
  pageSize: number
  paramsSerializer: Function
  params?: object
  lazy?: boolean
  loading?: boolean
  cache?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  itemType: 'object',
  itemLabel: 'label',
  itemValue: 'value',
  debounceWait: 200,
  cache: true,
  paramsSerializer: (params: { query: string; page: number; pageSize: number }) => {
    return {
      page: params.page,
      size: params.pageSize || 20,
      where: {
        name: {
          like: escapeRegExp(params.query),
          options: 'i',
        },
      },
    }
  },
})

const emit = defineEmits(['update:modelValue', 'update:loading', 'change-label'])

const showLoading = computed(() => props.loading || loadingData.value)

const getParams = (pageNum = page.value) => {
  return merge(
    props.paramsSerializer({
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
  const current = selectRef.value.states.selected

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
  const { itemValue, itemLabel } = props
  let filter = merge({}, props.params, {
    where: { [itemValue]: value },
    size: 1,
  })
  const { items } = await props.method(filter)
  const [item] = items
  if (item) {
    console.log('item', item)
    return item
  }
}

const doRemoteMethod = async (_query) => {
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
    loadingMore.value = true
    emit('update:loading', true)
    console.log('newPage', newPage)
    const res = await props.method(getParams(newPage))
    const list = res.items || []

    if (newPage === 1) {
      selectOptions.value = []
    }

    selectOptions.value.push(...list)
    hasMore.value = selectOptions.value.length < res.total
    page.value = newPage
  } catch (err) {
    console.error(err)
  } finally {
    loadingMore.value = false
  }
}

/**
 * 加载更多数据
 */
const handleLoadMore = async (newPage: number) => {
  await loadDataList(newPage)
}

const handleChange = () => {
  nextTick(() => {
    setCurrentLabel()
  })
}

const onChange = (value: any) => {
  nextTick(() => {
    emit('change-label', selectRef.value.states.selected.currentLabel)

    const index = selectRef.value.states.hoveringIndex

    if (isNum(index) && index > -1) {
      props.onSetSelected?.(selectOptions.value[index])
    }
  })
}

const onUpdateModelValue = (val) => {
  emit('update:modelValue', val)
}

defineExpose({
  loadDataList,
})

watch(
  () => props.modelValue,
  () => {
    handleChange()
  },
)

onMounted(() => {
  console.log('selectRef', selectRef)
  nextTick(() => {
    setCurrentLabel()
  })
})
</script>

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
</style>
