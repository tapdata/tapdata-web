<script lang="ts" setup>
import {
  createForm,
  onFieldValueChange,
  onFormInputChange,
  onFormValuesChange,
} from '@formily/core'
import { Path } from '@formily/path'
import { toJS } from '@formily/reactive'
import { updateTaskAlarm } from '@tap/api/src/core/alarm'
import { TextEditable } from '@tap/component/src/base/text-editable'
import * as components from '@tap/form/src/components'
import { createSchemaField } from '@tap/form/src/shared/create'
import { deepEqual } from '@tap/shared'
import { debounce } from 'lodash-es'
import { inject, nextTick, shallowRef, watch } from 'vue'
import * as _components from '../components/form'
import { useDataflowStore } from '../stores/dataflow.store'
import { getSchema } from '../util'
import BaseNodeIcon from './BaseNodeIcon.vue'

const dataflowStore = useDataflowStore()

const scope = inject('formScope')

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

const updateNodePropsDebounce = debounce((form) => {
  // console.log('updateNodePropsDebounce')
  const node = dataflowStore.nodeById(form.values.id)
  if (
    node &&
    !deepEqual(toJS(form.values), node, [
      'alarmRules.0._ms',
      'alarmRules.0._point',
    ])
  ) {
    updateNodeProps(form)
  }
}, 40)

const updateNodeProps = (form: any) => {
  // console.trace('updateNodeProps')
  updateNodePropsDebounce.cancel()

  const formValues = toJS(form.values)
  const filterProps = [
    'id',
    'isSource',
    'isTarget',
    'attrs.position',
    'sourceNode',
    '$inputs',
    '$outputs',
  ] // 排除属性的更新

  filterProps.forEach((path) => {
    Path.deleteIn(formValues, path)
  })
  dataflowStore.updateNodeProperties({
    id: form.values.id,
    properties: formValues,
  })
}

const lazySaveNodeAlarmConfig = debounce(() => {
  const formValues = form.value.values
  dataflowStore.updateNodeProperties({
    id: formValues.id,
    properties: toJS(formValues),
  })

  updateTaskAlarm({
    taskId: dataflowStore.dataflow.id,
    nodeId: formValues.id,
    alarmRules: formValues.alarmRules,
    alarmSettings: formValues.alarmSettings,
  })
}, 100)

const useEffects = () => {
  // 放弃了onFieldInputValueChange(*)方案，因为有些字段没有主动在schema中定义
  onFormValuesChange((form) => {
    if (dataflowStore.stateIsReadonly) return
    updateNodePropsDebounce(form)
  })

  onFormInputChange((form) => {
    if (dataflowStore.stateIsReadonly) return
    updateNodeProps(form)
  })

  onFieldValueChange(
    '*(alarmSettings.0.*,alarmRules.0.*(!_point,_ms))',
    (field, form) => {
      lazySaveNodeAlarmConfig()
    },
  )
}

const setSchema = async (nodeSchema) => {
  form.value?.onUnmount()
  schema.value = null
  await nextTick()

  form.value = createForm({
    disabled: dataflowStore.stateIsReadonly,
    values: props.node,
    effects: useEffects,
  })

  Path.deleteIn(
    nodeSchema,
    'properties.tabs.properties.tab1.properties.nameWrap',
  )

  schema.value = getSchema(
    nodeSchema,
    props.node,
    dataflowStore.pdkPropertiesMap,
  )
}

watch(
  () => props.node.id,
  (v) => {
    setSchema(
      props.node.__Ctor.getSchema(dataflowStore.dataflow.syncType, false),
    )
  },
  { immediate: true },
)

function handleClose() {
  dataflowStore.selectedNode = null
}
</script>

<template>
  <!-- BasePanel -->
  <div
    class="bg-card rounded-2xl h-100 shadow-canvas flex flex-column node-panel overflow-y-auto"
    style="width: 600px"
  >
    <div class="flex align-center px-4 pt-4 gap-1">
      <BaseNodeIcon :node="node" :size="28" class="mr-1" />
      <TextEditable
        v-model:value="node.name"
        :placeholder="$t('packages_dag_monitor_topheader_qingshururenwu')"
        max-width="260"
        hidden-icon
        :maxlength="200"
      />
      <el-tag
        v-if="node.type === 'table' || node.type === 'database'"
        class="px-1"
        :disable-transitions="true"
      >
        <span class="flex align-center gap-0.5">
          <el-icon>
            <i-lucide-database />
          </el-icon>
          {{ node.attrs.connectionName }}
        </span>
      </el-tag>
      <div class="flex-1" />
      <el-button text @click="handleClose">
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
