<template>
  <div class="attr-panel">
    <div class="attr-panel-body overflow-auto pt-1">
      <Form v-bind="formProps" class-name="form-wrap" :form="form">
        <SchemaField v-if="!!schema" :schema="schema" :scope="scope" />
      </Form>
    </div>
  </div>
</template>

<script>
import { Form, createSchemaField, components } from '@tap/form'
import * as _components from '../components/form'

const { SchemaField } = createSchemaField({
  components: {
    ...components,
    ..._components,
  },
})

export default {
  name: 'FormRender',

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
        feedbackLayout: 'terse',
      }),
    },
  },

  components: { Form, SchemaField },
}
</script>

<style lang="scss" scoped>
$radius: 4px;
$headerH: 48px;
$padding: 16px;
$headerBg: #fff;
.attr-panel {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  &-header {
    display: flex;
    align-items: center;
    padding: 0 $padding;
    height: $headerH;
    line-height: $headerH;
    font-size: 14px;
    //box-shadow: 0 0 4px 0 rgb(0 0 0 / 10%);
    background-color: $headerBg;

    .header-icon {
      display: inline-block;
      width: $headerH;
      height: $headerH;
      text-align: center;
      background-color: map-get($color, primary);
      cursor: pointer;
      color: #fff;
    }

    .header-txt {
      font-size: 14px;
    }
  }

  &-body {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: $padding;
    height: 0;

    .el-form-item.--label-w100 {
      .el-form-item__label {
        width: 100%;
      }
    }

    .el-form-item__content > .el-row {
      width: 100%;
    }
  }

  :deep(.form-wrap) {
    flex: 1;

    > form {
      height: 100%;
    }
  }

  :deep(.#{$formNamespace}-form-item) {
    font-size: $fontBaseTitle;

    .#{$formNamespace}-form-item-label {
      label {
        color: map-get($fontColor, light);
      }
    }

    .el-input-number {
      width: 120px;
    }

    .el-input-number--small {
      width: 130px;
    }

    .#{$formNamespace}-form-item-help,
    .#{$formNamespace}-form-item-extra {
      white-space: pre-wrap;
    }
  }

  /*.formily-element-form-item-layout-horizontal {
      .formily-element-form-item-control-content-component > .el-switch {
        height: 40px;
        line-height: 40px;
      }
      .formily-element-space-horizontal {
        .el-switch {
          height: 32px;
          line-height: 32px;
        }
      }
    }*/

  /*:deep(.#{$formNamespace}-form-item-layout-vertical) {
    .#{$formNamespace}-form-item-label-tooltip {
      height: 40px;

      i {
        line-height: 1;
      }
    }

      //.formily-element-space-horizontal {
      //  .el-switch {
      //    height: 40px;
      //    line-height: 40px;
      //  }
      //}
    }

  /*:deep(.#{$formNamespace}-form-item-control) {
    .#{$formNamespace}-space-horizontal {
      vertical-align: top;
    }
  }*/

  :deep(.#{$formNamespace}-form-item:not(.form-item-text) + .form-item-text) {
    margin-top: 16px;
  }

  :deep(
      .form-item-dense
        .#{$formNamespace}-form-item-control
        .#{$formNamespace}-form-item-control-content
        .#{$formNamespace}-form-item-control-content-component
    ) {
    min-height: unset;
    line-height: normal;
  }

  :deep(.form-item-text) {
    & + .form-item-text {
      margin-top: 8px;
    }

    margin-bottom: 0;

    .#{$formNamespace}-form-item-label-content {
      min-height: unset;
      line-height: 1;

      label {
        line-height: 1;
      }
    }
  }
}
</style>
