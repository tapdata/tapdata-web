<script lang="ts" setup>
import { createForm } from '@formily/core'
import { TextEditable } from '@tap/component/src/base/text-editable'
import * as components from '@tap/form/src/components'
import { createSchemaField } from '@tap/form/src/shared/create'
import { nextTick, shallowRef, watch } from 'vue'
import * as _components from '../components/form'
import { useFormScope } from '../composables/useFormScope'
import { useDataflowStore } from '../stores/dataflow.store'
import { getSchema } from '../util'
import BaseNodeIcon from './BaseNodeIcon.vue'

const dataflowStore = useDataflowStore()

const scope = useFormScope()

const { Form } = components
const { SchemaField } = createSchemaField({
  components: {
    ...components,
    ..._components,
  },
})

const form = shallowRef(createForm())
const schema = shallowRef(null)

const props = defineProps<{
  node: any
}>()

const setSchema = async (nodeSchema) => {
  form.value?.onUnmount()
  schema.value = null
  await nextTick()

  form.value = createForm({
    // disabled: this.stateIsReadonly,
    values: props.node,
    // effects: this.useEffects,
  })

  schema.value = getSchema(
    nodeSchema,
    props.node,
    dataflowStore.pdkPropertiesMap,
  )
}

watch(
  () => props.node.id,
  (v) => {
    console.log('node.id', props.node)
    setSchema(
      props.node.__Ctor.getSchema(dataflowStore.dataflow.syncType, false),
    )
  },
  { immediate: true },
)
</script>

<template>
  <!-- BasePanel -->
  <div
    class="bg-card rounded-2xl h-100 shadow-canvas flex flex-column node-panel overflow-y-auto"
    style="width: 600px"
  >
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
    <div class="p-2 pb-0">
      <el-input
        v-model="node.attrs.desc"
        class="desc-textarea"
        placeholder="添加描述..."
        type="textarea"
        :autosize="{ minRows: 1 }"
        size="small"
      />
    </div>
    <div v-if="form" class="flex-1 min-h-0">
      <Form
        :colon="false"
        :shallow="false"
        layout="vertical"
        feedback-layout="terse"
        class-name="form-wrap"
        :form="form"
      >
        <SchemaField v-if="schema" :schema="schema" :scope="scope" />
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

.node-panel {
  $tabHeight: 40px;
  :deep(.form-wrap) {
    &,
    > form,
    .config-tabs-decorator,
    .config-tabs-decorator .formily-element-plus-form-item-control,
    .config-tabs-decorator .formily-element-plus-form-item-control-content,
    .config-tabs {
      height: 100%;
    }
    .el-tabs.config-tabs {
      --el-tabs-header-height: 40px;
      --el-tabs-padding-left: 16px;

      > .el-tabs__header {
        margin-bottom: 0;
        // .el-tabs__nav-wrap {
        //   &::after {
        //     height: 1px;
        //   }
        // }

        // .el-tabs__item {
        //   //padding: 0 12px;
        //   line-height: $tabHeight;
        //   height: $tabHeight;
        //   font-weight: 400;
        // }
      }

      > .el-tabs__content {
        height: calc(100% - $tabHeight);
        padding: 0 16px;
        overflow: auto;
        .el-tab-pane {
          // height: 100%;
          display: contents;
        }
      }
    }
  }
}
</style>
