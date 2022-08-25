<template>
  <div class="attr-panel">
    <div class="attr-panel-body overflow-auto pt-1">
      <Form class-name="form-wrap" :form="form" v-bind="formProps">
        <SchemaField v-if="!!schema" :schema="schema" :scope="scope" />
      </Form>
    </div>
  </div>
</template>

<script>
import { Form, SchemaField } from '@tap/form'

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
        feedbackLayout: 'terse'
      })
    }
  },

  components: { Form, SchemaField }
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

  ::v-deep {
    .form-wrap {
      flex: 1;
      > form {
        height: 100%;
        > .formily-element-space {
          height: 100%;
        }
      }
    }

    // 覆盖数字输入框的宽度
    .formily-element-form-item {
      font-size: 13px;
      &-label {
        label {
          color: map-get($fontColor, light);
        }
      }
      .el-input-number {
        width: 180px;
      }
      .el-input-number--small {
        width: 130px;
      }
    }

    .formily-element-form-item-layout-vertical .formily-element-form-item-label-tooltip {
      height: 40px;
      i {
        line-height: 1;
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
}
</style>
