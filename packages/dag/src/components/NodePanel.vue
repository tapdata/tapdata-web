<script lang="ts" setup>
import { createForm } from '@formily/core'
import { TextEditable } from '@tap/component/src/base/text-editable'
import * as components from '@tap/form/src/components'
import { createSchemaField } from '@tap/form/src/shared/create'
import { nextTick, shallowRef, watch } from 'vue'
import * as _components from '../components/form'
import { useDataflowStore } from '../stores/dataflow.store'
import { getSchema } from '../util'
import BaseNodeIcon from './BaseNodeIcon.vue'

const dataflowStore = useDataflowStore()

const { Form } = components
const { SchemaField } = createSchemaField({
  components: {
    ...components,
    ..._components,
  },
})

const form = shallowRef(null)
const schema = shallowRef(null)

const props = defineProps<{
  node: any
}>()

watch(
  () => props.node.id,
  (v) => {
    console.log('node.id', v)
    setSchema(props.node.ins.getSchema(dataflowStore.dataflow.syncType, false))
  },
  { immediate: true },
)

const setSchema = async (schema) => {
  form.value?.onUnmount()
  schema.value = null
  await nextTick()

  form.value = createForm({
    // disabled: this.stateIsReadonly,
    values: props.node,
    // effects: this.useEffects,
  })

  schema.value = getSchema(schema, props.node, dataflowStore.pdkPropertiesMap)
}
</script>

<template>
  <!-- BasePanel -->
  <div class="bg-card rounded-2xl h-100 shadow-canvas" style="width: 600px">
    <div class="flex align-center px-4 pt-4">
      <BaseNodeIcon :node="node" class="mr-1" />
      <TextEditable
        v-model:value="node.name"
        :placeholder="$t('packages_dag_monitor_topheader_qingshururenwu')"
        max-width="260"
        hidden-icon
        :maxlength="200"
      />
      <div class="flex-1" />
      <el-button text>
        <template #icon>
          <i-lucide-x />
        </template>
      </el-button>
    </div>
    <div class="p-2">
      <el-input
        v-model="node.attrs.desc"
        class="desc-textarea"
        placeholder="添加描述..."
        type="textarea"
        :autosize="{ minRows: 1 }"
        size="small"
      />
    </div>
    <div>
      <Form
        colon="false"
        shallow="false"
        layout="vertical"
        feedback-layout="terse"
        class-name="form-wrap"
        :form="form"
      >
        <SchemaField v-if="schema" ref="schema" :schema="schema" :scope="{}" />
      </Form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.text-editable-wrap {
  :deep(.text-editable) {
    font-size: 1rem;
    font-weight: 500;
    input {
      font-weight: 500;
    }
  }
}
.desc-textarea {
  :deep(.el-textarea__inner) {
    box-shadow: none;
    resize: none;
    caret-color: var(--el-color-primary);

    &:focus {
      box-shadow: 0px 1px 2px 0px #1018280d;
    }
  }
}
</style>
