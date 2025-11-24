<script setup lang="ts">
import { debounce } from 'lodash-es'
import { onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import VIcon from '../base/VIcon.vue'
import Datetime from './Datetime.vue'
import DatetimeRange from './DatetimeRange.vue'
import SelectList from './FilterItemSelect.vue'

interface FormRule {
  validator?: (rule: any, value: any, callback: (error?: Error) => void) => void
  [key: string]: any
}

interface FilterItem {
  key: string
  value?: any
  type: string
  label?: string
  outerLabel?: boolean
  width?: string
  rules?: Function | Array<any>
  debounce?: number
  border?: boolean
  class?: string
  slotName?: string
  [key: string]: any
}

interface Props {
  value?: Record<string, any>
  items: FilterItem[]
  hideRefresh?: boolean
  changeRoute?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  value: () => ({}),
  items: () => [],
  hideRefresh: false,
  changeRoute: true,
})

const emit = defineEmits(['update:value', 'search', 'fetch'])

const filterForm = ref()
const form = reactive<Record<string, any>>({})
const rules = reactive<Record<string, FormRule[]>>({})

const debouncedEmitMap = new Map()

watch(
  () => props.value,
  (v) => {
    v && init()
  },
  { deep: true },
)

watch(
  () => props.items,
  () => {
    init()
  },
)

onMounted(() => {
  init()
})

function init() {
  const { value } = props
  getRules()
  const newForm: Record<string, any> = {}
  props.items.forEach((el) => {
    if (Object.prototype.hasOwnProperty.call(value, el.key)) {
      el.value = value[el.key]
    }
    if (el.type === 'datetimerange') {
      if (el.key.includes(',')) {
        const result: any[] = []
        el.key.split(',').forEach((k) => {
          newForm[k] = value?.[k]
          result.push(
            newForm[k] && !Number.isNaN(newForm[k]) ? +newForm[k] : null,
          )
        })
        newForm[el.key] = result
        el.value = newForm[el.key]
      } else {
        newForm[el.key] = el.value
      }
    } else {
      newForm[el.key] = el.value
    }
  })
  Object.assign(form, newForm)
}

function getValue() {
  const result: Record<string, any> = {}
  props.items.forEach((el) => {
    if (el.value) {
      if (el.type === 'datetimerange') {
        if (el.key.includes(',')) {
          el.key.split(',').forEach((k, i) => {
            result[k] = el.value[i]
          })
        }
      } else if (el.type === 'input') {
        const value = el.value || ''
        result[el.key] = value
      } else {
        result[el.key] = el.value
      }
    }
  })
  return result
}

function getRules() {
  const newRules: Record<string, FormRule[]> = {}
  props.items.forEach((el) => {
    if (el.rules) {
      if (typeof el.rules === 'function') {
        newRules[el.key] = [
          {
            validator: (rule, value, callback) => {
              const result =
                el.rules && typeof el.rules === 'function' ? el.rules() : null
              if (result) {
                callback(new Error(result))
              } else {
                callback()
              }
            },
          },
        ]
      } else {
        newRules[el.key] = el.rules
      }
    }
  })
  Object.assign(rules, newRules)
}

function getDebouncedEmit(item: FilterItem) {
  const debounceTime = item.debounce ?? 500

  if (!debouncedEmitMap.has(item.key)) {
    debouncedEmitMap.set(
      item.key,
      debounce((value) => {
        emit('update:value', value)
        emit('search', value)
        props.changeRoute &&
          router.replace({
            name: route.name,
            params: route.params,
            query: value,
          })
      }, debounceTime),
    )
  }

  return debouncedEmitMap.get(item.key)
}

function search(item: FilterItem, target: string) {
  if (item.type === 'input' && target === 'change') {
    return
  }

  filterForm.value.validate((valid: boolean) => {
    if (valid) {
      const value = getValue()
      const debouncedFn = getDebouncedEmit(item)
      debouncedFn(value)
    }
  })
}

function fetch() {
  emit('update:value', getValue())
  filterForm.value.validate((valid: boolean) => {
    if (valid) {
      emit('fetch')
    }
  })
}

function showItemLabel(item: FilterItem) {
  if (item.outerLabel) {
    return item.label
  }
}

// 匹配组件
function getComponent(type: string) {
  const obj = {
    select: SelectList,
    'select-inner': SelectList,
    'dark-select': SelectList,
    datetime: Datetime,
    datetimerange: DatetimeRange,
    // 'input-pop': PopInput,
    input: ElInput,
  }
  return obj[type] || obj.input
}

function getStyle(item: FilterItem) {
  const obj: Record<string, string> = {}
  switch (item.type) {
    case 'input':
      setDefaultValue(obj, 'width', item.width || '200px')
      break
  }
  return obj
}

// 默认设置
function getOptions(item: FilterItem) {
  switch (item.type) {
    case 'select-inner':
      setDefaultValue(item, 'inner-label', item.label)
      setDefaultValue(item, 'last-page-text', '')
      setDefaultValue(item, 'none-border', !item.border)
      break
    case 'input':
      break
    case 'input-pop':
      setDefaultValue(item, 'placement', 'bottom-start')
      setDefaultValue(item, 'trigger', 'click')
      setDefaultValue(item, 'width', '200')
      setDefaultValue(item, 'overflow', true)
      setDefaultValue(item, 'dark', true)
      break
    case 'datetimerange':
    case 'datetime':
      // setDefaultValue(item, 'value-format', 'timestamp')
      break
    default:
      break
  }
  setDefaultValue(item, 'clearable', true)
  return item
}

function setDefaultValue(item: Record<string, any>, key: string, val: any) {
  if (!Object.prototype.hasOwnProperty.call(item, key)) {
    item[key] = val
  }
}
const router = useRouter()
const route = useRoute()
</script>

<template>
  <ElForm
    ref="filterForm"
    :model="form"
    :rules="rules"
    inline
    class="filter-form"
    @submit.prevent
  >
    <ElFormItem
      v-for="(item, index) in items"
      :key="index"
      :prop="item.key"
      :label="showItemLabel(item)"
      :class="[item.class, item.type]"
    >
      <template v-if="item.slotName" #default="scope">
        <slot
          :name="item.slotName"
          :row="scope.row"
          :item="item"
          :on-change="search"
        />
      </template>
      <template v-else #default>
        <component
          v-bind="getOptions(item)"
          :is="getComponent(item.type)"
          v-model="item.value"
          :style="getStyle(item)"
          @input="search(item, 'input')"
          @change="search(item, 'change')"
          @clear="fetch()"
        >
          <template v-if="item.type === 'input'" #prefix>
            <VIcon>magnify</VIcon>
          </template>
        </component>
      </template>
    </ElFormItem>
    <ElFormItem v-if="!hideRefresh">
      <ElButton plain class="btn-refresh" @click="fetch">
        <VIcon>refresh</VIcon>
      </ElButton>
    </ElFormItem>
  </ElForm>
</template>

<style lang="scss" scoped>
.btn-refresh {
  padding: 0;
  height: 32px;
  width: 32px;
  min-width: 32px;
  font-size: 16px;
}
.filter-form {
  //font-size: 12px;
  //:deep(.el-form-item__content) {
  //  font-size: 12px;
  //  .el-input {
  //    font-size: 12px;
  //  }
  //}

  .el-form-item {
    margin-bottom: 0;
    margin-right: 12px;
  }
}
.filter-el-input {
  :deep(.el-input__inner) {
    &:hover {
      border-color: #e4e7ed;
    }
    &:focus,
    &:target {
      border-color: #3b47e5;
    }
  }
}
</style>
