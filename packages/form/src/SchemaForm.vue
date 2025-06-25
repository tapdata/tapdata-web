<script setup lang="ts">
import {
  createForm,
  onFieldValueChange,
  setValidateLanguage,
} from '@formily/core'
import { isObservable, observable, raw } from '@formily/reactive'
import { getCurrentLanguage } from '@tap/i18n/src/shared/util'
import { cloneDeep, isEqual, set } from 'lodash-es'
import { nextTick, onMounted, ref, toRaw, watch } from 'vue'

import { Form as FormComponent } from './components'
import { SchemaField } from './shared'

interface SchemaFormProps {
  schema: Record<string, any>
  modelValue?: Record<string, any>
  colon?: boolean
  layout?: 'horizontal' | 'vertical' | 'inline'
  labelAlign?: 'left' | 'right'
  labelWidth?: string | number
  scope?: Record<string, any>
}

const props = withDefaults(defineProps<SchemaFormProps>(), {
  modelValue: () => ({}),
  colon: false,
  layout: 'horizontal',
  labelAlign: 'left',
  labelWidth: 120,
  scope: () => ({}),
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: Record<string, any>): void
  (e: 'change', value: Record<string, any>, form: any): void
}>()

/**
 * 深度递归同步对象
 * 确保处理嵌套对象、数组和属性的新增/删除
 */
function deepSyncObjects(target: any, source: any): void {
  // 获取原始对象，避免代理导致的比较问题
  const rawSource = toRaw(source)

  // 处理源对象中的所有属性
  Object.keys(rawSource).forEach((key) => {
    // 如果目标对象中没有此属性或属性值不同
    if (!(key in target) || !isEqual(target[key], rawSource[key])) {
      // 如果源属性是对象且不是null，目标属性也是对象且不是null
      if (
        rawSource[key] &&
        typeof rawSource[key] === 'object' &&
        !Array.isArray(rawSource[key]) &&
        target[key] &&
        typeof target[key] === 'object' &&
        !Array.isArray(target[key])
      ) {
        // 递归同步嵌套对象
        deepSyncObjects(target[key], rawSource[key])
      } else {
        // 直接替换值（包括数组、基本类型等）
        target[key] = rawSource[key]
      }
    }
  })

  // 删除目标对象中源对象没有的属性
  Object.keys(target).forEach((key) => {
    if (!(key in rawSource)) {
      delete target[key]
    }
  })
}

/**
 * 维持外部对象引用的属性同步，用于reactive对象
 * 只更新属性而不替换对象引用
 */
function syncObjectKeepReference(
  target: Record<string, any>,
  source: Record<string, any>,
): void {
  if (!target || !source) return

  // 获取原始对象，避免代理导致的问题
  const rawSource = toRaw(source)

  // 首先删除目标对象中源对象没有的属性
  Object.keys(target).forEach((key) => {
    if (!(key in rawSource)) {
      delete target[key]
    }
  })

  // 然后更新或添加源对象中的所有属性
  Object.keys(rawSource).forEach((key) => {
    if (
      // 如果是嵌套对象，递归处理以保持引用
      rawSource[key] &&
      typeof rawSource[key] === 'object' &&
      !Array.isArray(rawSource[key]) &&
      target[key] &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      syncObjectKeepReference(target[key], rawSource[key])
    } else {
      // 直接替换属性值
      target[key] = rawSource[key]
    }
  })
}

// 创建响应式状态
const formReady = ref(false)
const syncing = ref(false)
// 直接使用普通变量，不用ref包装
let form: any = null
let formValues: any = null

// 从Formily同步到Vue - 精确更新字段
function syncFormilyToModel(path?: string, value?: any) {
  // 如果已经在同步过程中，防止循环
  if (syncing.value) return

  // 标记同步状态
  syncing.value = true

  try {
    // 直接在modelValue上修改，而不是创建新对象
    if (props.modelValue && typeof props.modelValue === 'object') {
      if (path && value !== undefined) {
        // 精确路径更新模式 - 只更新特定路径
        set(props.modelValue, path, value)
      } else {
        // 全量更新模式 - 保持原对象引用
        syncObjectKeepReference(props.modelValue, formValues)
      }

      // 触发v-model更新，但不创建新对象
      emit('update:modelValue', props.modelValue)

      // 触发change事件
      emit('change', props.modelValue, form)
    }
  } finally {
    // 确保同步标记被重置
    syncing.value = false
    // nextTick(() => {
    //   syncing.value = false
    // })
  }
}

// 初始化表单和响应式桥接
function initForm() {
  // 标记form正在准备
  formReady.value = false

  // 创建响应式桥接对象 - 直接使用observable而不用ref包装
  if (!formValues || !isObservable(formValues)) {
    formValues = observable(cloneDeep(props.modelValue))
  } else {
    // 如果已存在，则同步当前modelValue到formValues
    syncModelToFormily(props.modelValue)
  }

  // 创建表单实例 - 直接赋值给普通变量
  form = createForm({
    values: formValues,
    // 使用effects函数注册副作用
    effects() {
      // 监听所有字段值变化
      onFieldValueChange('*', (field) => {
        console.log('onFieldValueChange', field.path.toString(), field.value)
        if (!syncing.value) {
          // 使用精确路径更新
          const path = field.path.toString()
          const value = field.value
          syncFormilyToModel(path, value)
        }
      })
    },
  })

  // 确保表单实例初始化完成后再渲染
  nextTick(() => {
    formReady.value = true
  })
}

/**
 * 从Vue模型同步到Formily
 * 处理多层级属性、数组和属性的新增/删除
 */
function syncModelToFormily(model: Record<string, any>) {
  if (!formValues) return

  // 防止相同值更新
  if (isEqual(toRaw(model), raw(formValues))) return

  // 标记同步状态，防止循环
  syncing.value = true

  try {
    // 深度同步对象结构，保持Formily对象引用不变
    deepSyncObjects(formValues, model)
  } finally {
    // 确保同步标记被重置
    nextTick(() => {
      syncing.value = false
    })
  }
}

// 监听 modelValue 变化，同步到 Formily
watch(
  () => props.modelValue,
  (newValue) => {
    if (!syncing.value && form && formValues) {
      syncModelToFormily(newValue)
    }
  },
  { deep: true, immediate: true },
)

// 监听 schema 变化，重新初始化表单
watch(
  () => props.schema,
  () => {
    initForm()
  },
  { deep: true },
)

// 立即创建表单实例以确保在挂载前就准备好
initForm()

// 初始化和清理
onMounted(() => {
  setValidateLanguage(getCurrentLanguage())
})

// 暴露方法和属性供父组件使用
defineExpose({
  getFormValues: () => ({ ...formValues }),
  getForm: () => form,
  getFormCheckStatus: () => form?.valid,
  validate: () => form?.validate(),
  reset: () => form?.reset(),
  submit: () => form?.submit(),
})
</script>

<template>
  <div class="schema-form">
    {{ modelValue.name }}
    <FormComponent
      v-if="formReady && form"
      v-bind="$attrs"
      class-name="form-wrap"
      :form="form"
      :colon="props.colon"
      :layout="props.layout"
      :label-align="props.labelAlign"
      :label-width="props.labelWidth"
    >
      <SchemaField
        v-if="props.schema"
        :schema="props.schema"
        :scope="props.scope"
      />
    </FormComponent>
  </div>
</template>

<style lang="scss" scoped>
.schema-form {
  :deep(.formily-element-plus-form-item-label-tooltip) {
    margin-left: 0;
  }

  :deep(.formily-element-plus-form-item) {
    font-size: var(--font-base-title);
    .formily-element-plus-form-item-label {
      label {
        color: var(--text-light);
        text-transform: capitalize;
      }
    }
    .el-input-number {
      width: 180px;
    }
    .el-input-number--small {
      width: 130px;
    }

    .formily-element-plus-form-item-help,
    .formily-element-plus-form-item-extra {
      white-space: pre-wrap;
    }
  }

  :deep(.formily-element-plus-form-item-layout-horizontal) {
    .formily-element-plus-form-item-control-content-component > .el-switch {
      height: 32px;
      line-height: 32px;
      vertical-align: top;
    }
    .formily-element-space-horizontal {
      .el-switch {
        height: 32px;
        line-height: 32px;
      }
    }
  }
}
</style>
