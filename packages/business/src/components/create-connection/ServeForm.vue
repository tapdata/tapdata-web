<template>
  <div class="serve-form p-6 flex flex-column">
    <SchemaToForm
      ref="schemaToForm"
      :schema="schemaData"
      wrapperWidth="600px"
      :colon="true"
      label-width="160"
      class="schema-form flex-fill"
    ></SchemaToForm>
    <div class="footer-operation pt-4">
      <el-button type="primary" :loading="submitBtnLoading" @click="submit()">
        {{ $t('public_button_save') }}
      </el-button>
      <el-button type="primary" :loading="saveAndMoreLoading" @click="saveAndMore">SAVE & ADD MORE</el-button>
    </div>
  </div>
</template>

<script>
import { SchemaToForm } from '@tap/form'

export default {
  name: 'ServeForm',

  components: { SchemaToForm },

  props: {
    params: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },

  data() {
    return {
      schemaData: null,
      submitBtnLoading: false,
      saveAndMoreLoading: false
    }
  },

  computed: {
    schemaFormInstance() {
      return this.$refs.schemaToForm.getForm?.()
    }
  },

  mounted() {
    this.getForm()
  },

  methods: {
    getForm() {
      let result = {
        type: 'object',
        'x-component-props': {
          width: 500
        },
        properties: {
          name: {
            type: 'string',
            title: '分类名称',
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'Input'
          }
        }
      }
      this.schemaData = result
    },

    submit(addNext = false) {
      this.schemaFormInstance?.validate().then(() => {
        this.submitBtnLoading = true
        // TODO 新增分类前，检查是否已存在 this.$emit(addNext ? 'saveAndMore' : 'success', data)
        this.submitBtnLoading = false
      })
    },

    saveAndMore() {
      this.submit()
    }
  }
}
</script>

<style lang="scss" scoped>
.footer-operation {
  border-top: 1px solid #e1e3e9;
}
</style>
