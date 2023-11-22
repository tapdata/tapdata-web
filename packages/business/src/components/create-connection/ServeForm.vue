<template>
  <div class="serve-form flex overflow-hidden">
    <div class="flex flex-column flex-1 min-w-0 p-6">
      <SchemaToForm
        ref="schemaToForm"
        :schema="schemaData"
        :colon="false"
        layout="vertical"
        :label-width="null"
        :wrapper-col="16"
        class="schema-form flex-fill"
      ></SchemaToForm>
      <div class="footer-operation pt-4">
        <el-button type="primary" :loading="submitBtnLoading" @click="submit()">
          {{ $t('public_button_save') }}
        </el-button>
        <el-button type="primary" :loading="saveAndMoreLoading" @click="saveAndMore">{{
          $t('packages_business_save_and_more')
        }}</el-button>
      </div>
    </div>
    <GitBook
      v-resize.left="{
        minWidth: 350,
      }"
      :value="params.md"
      class="git-book overflow-auto"
    ></GitBook>
  </div>
</template>

<script>
import { $on, $off, $once, $emit } from '../../../utils/gogocodeTransfer'
// import MarkdownIt from 'markdown-it'
import i18n from '@tap/i18n'

import { SchemaToForm } from '@tap/form'
import { appApi } from '@tap/api'
import { GitBook } from '@tap/component'
import resize from '@tap/component/src/directives/resize'

export default {
  name: 'ServeForm',
  components: { GitBook, SchemaToForm },
  directives: {
    resize,
  },
  props: {
    params: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  data() {
    return {
      schemaData: null,
      submitBtnLoading: false,
      saveAndMoreLoading: false,
    }
  },
  computed: {
    schemaFormInstance() {
      return this.$refs.schemaToForm.getForm?.()
    },
  },
  mounted() {
    this.getForm()
    // this.initMarkdown()
  },
  methods: {
    getForm() {
      let result = {
        type: 'object',
        properties: {
          value: {
            type: 'string',
            title: i18n.t('public_name'),
            required: true,
            'x-decorator': 'FormItem',
            'x-component': 'Input',
          },
          desc: {
            type: 'string',
            title: i18n.t('public_description'),
            'x-decorator': 'FormItem',
            'x-component': 'Input.TextArea',
            'x-component-props': {
              autosize: {
                minRows: 2,
              },
            },
          },
        },
      }
      this.schemaData = result
    },

    submit(addNext = false) {
      this.schemaFormInstance?.validate().then(() => {
        this.submitBtnLoading = true
        const { values } = this.schemaFormInstance
        console.log('this.schemaFormInstance', values, this.schemaFormInstance) // eslint-disable-line
        appApi
          .post(values)
          .then((data) => {
            data.LDP_TYPE = 'app'
            $emit(this, addNext ? 'saveAndMore' : 'success', data)
          })
          .finally(() => {
            this.submitBtnLoading = false
          })
      })
    },

    saveAndMore() {
      this.submit()
    },

    initMarkdown() {
      const md = new MarkdownIt({ html: true })
      // a标签，新窗口打开
      this.html = md.render(`### API 应用`)
    },
  },
  emits: [],
}
</script>

<style lang="scss" scoped>
.footer-operation {
  border-top: 1px solid #e1e3e9;
}
.git-book {
  width: 400px;
}
</style>
