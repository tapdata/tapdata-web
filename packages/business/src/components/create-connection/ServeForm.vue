<script>
import { createApp } from '@tap/api'
import resize from '@tap/component/src/directives/resize'
import GitBook from '@tap/component/src/GitBook.vue'
import SchemaToForm from '@tap/form/src/SchemaToForm.vue'
import i18n from '@tap/i18n'

export default {
  name: 'ServeForm',
  components: { SchemaToForm },
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
  emits: [],
  data() {
    return {
      schemaData: null,
      submitBtnLoading: false,
      saveAndMoreLoading: false,
      isDaas: import.meta.env.VUE_APP_PLATFORM === 'DAAS',
    }
  },
  computed: {
    schemaFormInstance() {
      return this.$refs.schemaToForm.getForm?.()
    },
    apiSrc() {
      let domain

      if (this.isDaas) {
        domain = this.$i18n.locale === 'en' ? '/docs/en/' : '/docs/'
      } else {
        domain =
          !this.$store.getters.isDomesticStation || this.$i18n.locale === 'en'
            ? 'https://docs.tapdata.io/'
            : 'https://docs.tapdata.net/'
      }

      return `${domain}user-guide/data-service/create-api-service?from=cloud`
    },
  },
  mounted() {
    this.getForm()
    // this.initMarkdown()
  },
  methods: {
    getForm() {
      const result = {
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
        createApp(values)
          .then((data) => {
            data.LDP_TYPE = 'app'
            this.$emit(addNext ? 'saveAndMore' : 'success', data)
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
}
</script>

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
      />
      <div class="footer-operation pt-4">
        <el-button type="primary" :loading="submitBtnLoading" @click="submit()">
          {{ $t('public_button_save') }}
        </el-button>
        <el-button
          type="primary"
          :loading="saveAndMoreLoading"
          @click="saveAndMore"
          >{{ $t('packages_business_save_and_more') }}</el-button
        >
      </div>
    </div>
    <div class="flex-1 border-start">
      <iframe :src="apiSrc" class="w-100 h-100 block" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.footer-operation {
  border-top: 1px solid #e1e3e9;
}
</style>
