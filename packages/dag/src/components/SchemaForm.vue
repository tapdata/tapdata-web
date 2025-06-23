<template>
  <Form class-name="form-wrap" :form="form" v-bind="formProps">
    <SchemaField v-if="!!schema" :schema="schema" :scope="scope" />
  </Form>
</template>

<script>
import { Form, createSchemaField, components } from '@tap/form'
import * as _components from '../components/form'

const { SchemaField } = createSchemaField({
  components: {
    ...components,
    ..._components
  }
})

export default {
  name: 'SchemaForm',
  components: { Form, SchemaField },
  props: {
    form: Object,
    schema: Object,
    scope: Object,
    formProps: {
      type: Object,
      default: () => ({
        colon: false,
        shallow: false,
        layout: 'vertical',
        feedbackLayout: 'terse'
      })
    }
  }
}
</script>

<style scoped lang="scss">
.form-wrap {
  :deep(.formily-element-form-item-feedback-layout-loose) {
    margin-bottom: 20px;
  }

  :deep(.formily-element-form-item-layout-vertical) {
    > .formily-element-form-item-label {
      margin-bottom: 8px;

      .formily-element-form-item-label-content {
        min-height: unset;
        height: unset;
      }

      .formily-element-form-item-label-tooltip {
        margin-left: 4px;
        height: unset;
      }

      * {
        line-height: 22px;
      }
    }
  }

  // 覆盖数字输入框的宽度
  .formily-element-form-item {
    font-size: var(--font-base-title);
    &-label {
      label {
        color: var(--text-light);
      }
    }
    .el-input-number {
      width: 180px;
    }
    .el-input-number--small {
      width: 130px;
    }

    &-help,
    &-extra {
      white-space: pre-wrap;
    }
  }

  .formily-element-form-item-layout-vertical {
    .formily-element-form-item-label-tooltip {
      height: 40px;

      i {
        line-height: 1;
      }
    }
  }

  .formily-element-form-item-control {
    .formily-element-space-horizontal {
      vertical-align: top;
    }
  }

  .formily-element-form-item:not(.form-item-text) + .form-item-text {
    margin-top: 16px;
  }

  .form-item-dense
    .formily-element-form-item-control
    .formily-element-form-item-control-content
    .formily-element-form-item-control-content-component {
    min-height: unset;
    line-height: normal;
  }

  .form-item-text {
    & + .form-item-text {
      margin-top: 8px;
    }
    margin-bottom: 0;
    .formily-element-form-item-label-content {
      min-height: unset;
      line-height: 1;
      label {
        line-height: 1;
      }
    }
  }
}
</style>
