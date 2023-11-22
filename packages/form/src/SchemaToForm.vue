<template>
  <div class="scheme-to-form">
    <Form
      v-bind="$attrs"
      class-name="form-wrap"
      :form="form"
      :colon="colon"
      :layout="layout"
      :label-align="labelAlign"
      :label-width="labelWidth"
    >
      <SchemaField v-if="!!objData" :schema="objData" :scope="scope" />
    </Form>
  </div>
</template>

<script>
import { createForm, onFormValuesChange, setValidateLanguage } from '@formily/core'
import { getCurrentLanguage } from '@tap/i18n/src/shared/util'

import { SchemaField } from './shared'
import { Form } from './components'

export default {
  name: 'SchemaToForm',
  components: { Form, SchemaField },
  props: {
    schema: {
      type: Object,
    },
    colon: {
      type: Boolean,
      default: false,
    },
    layout: {
      type: String,
      default: 'horizontal',
    },
    labelAlign: {
      type: String,
      default: 'left',
    },
    labelWidth: {
      type: [String, Number],
      default: 120,
    },
    scope: {
      type: Object,
    },
    value: {
      type: Object,
    },
  },
  data() {
    return {
      form: createForm(
        this.value
          ? {
              values: this.value,
              effects: this.useEffects,
            }
          : {},
      ),
      objData: null,
    }
  },
  computed: {
    validate() {
      return this.form.validate
    },
  },
  watch: {
    schema: {
      deep: true,
      handler(v) {
        if (!v && JSON.stringify(v) === JSON.stringify(this.objData)) {
          return
        }
        this.init()
      },
    },
  },
  mounted() {
    this.init()
    setValidateLanguage(getCurrentLanguage()) //设置国际化
  },
  methods: {
    init() {
      this.objData = this.schema
    },
    getFormValues() {
      return JSON.parse(JSON.stringify(this.form.values))
    },
    getForm() {
      return this.form
    },
    getFormCheckStatus() {
      return this.form.valid
    },
    useEffects() {
      onFormValuesChange((form) => {
        Object.assign(this.value, form.values)
      })
    },
  },
  emits: ['update:value'],
}
</script>

<style lang="scss" scoped>
.scheme-to-form {
  :deep(.formily-element-form-item-label-tooltip) {
    margin-left: 0;
  }

  :deep(.formily-element-form-item) {
    font-size: $fontBaseTitle;
    .formily-element-form-item-label {
      label {
        color: map-get($fontColor, light);
        text-transform: capitalize;
      }
    }
    .el-input-number {
      width: 180px;
    }
    .el-input-number--small {
      width: 130px;
    }

    .formily-element-form-item-help,
    .formily-element-form-item-extra {
      white-space: pre-wrap;
    }
  }

  :deep(.formily-element-form-item-layout-horizontal) {
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
