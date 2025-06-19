<script>
import { javascriptFunctionsApi } from '@tap/api'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import JsEditor from '@tap/component/src/JsEditor.vue'
import Cookie from '@tap/shared/src/cookie'

const getScriptObj = (script) => {
  const matchArr1 = script.match(/(?<=function\s+)\w+(?=\s*\([\s\S]*\))/g)
  const name = matchArr1?.[0] || ''
  const matchArr2 = script.match(
    /(?<=\s*function\s+\w+\s*\([\s\S]*\)\s*\{)[\s\S]*?(?=\}\s*$)/g,
  )
  const body = matchArr2?.[0] || ''
  const matchArr3 = script.match(/(?<=function\s+\w+\s*\()[\w\s,]*(?=\))/g)
  const params = matchArr3?.[0] || ''
  return {
    name,
    body,
    params,
    bodyLength: matchArr2?.length || 0,
  }
}

export default {
  components: { JsEditor, PageContainer },
  data() {
    const self = this
    return {
      loading: false,
      details: {},
      form: {
        type: 'custom',
        describe: '',
        format: '',
        parameters_desc: '',
        return_value: '',
        script: 'function functionName (record) {\n\treturn record\n}',
      },
      scriptRules: {
        validator: (rule, value, callback) => {
          const obj = getScriptObj(value)
          if (!value.trim()) {
            callback(new Error(this.$t('function_script_empty')))
          } else if (!obj.name.trim()) {
            callback(
              new Error(this.$t('function_script_missing_function_name')),
            )
          } else if (!obj.body.trim()) {
            callback(
              new Error(this.$t('function_script_missing_function_body')),
            )
          } else if (
            self.$refs.editor.editor.session.$annotations.some(
              (item) => item.type === 'error',
            )
          ) {
            callback(new Error(this.$t('function_script_format_error')))
          } else if (obj.bodyLength.length > 1) {
            callback(new Error(this.$t('function_script_only_one')))
          } else {
            callback()
          }
        },
      },
    }
  },
  created() {
    const id = this.$route.params.id
    if (id) {
      this.getData(id)
    }
  },
  methods: {
    getData(id) {
      this.loading = true
      javascriptFunctionsApi
        .findOne({
          filter: JSON.stringify({
            where: {
              id,
            },
          }),
        })
        .then((data) => {
          const details = data || {}
          // 处理老数据问题
          if (details.type === 'custom' && !details.script) {
            details.script = `function ${details.function_name}(${details.parameters}) ${details.function_body}`
          }
          if (details.type === 'jar') {
            details.classNameFmt =
              details.className?.split(`${details.packageName}.`)?.[1] || ''
          }
          this.details = details
          this.form = Object.assign({}, this.form, details)
        })
        .finally(() => {
          this.loading = false
        })
    },
    save() {
      this.$refs?.editor?.format()
      this.$nextTick(() => {
        this.$refs.form.validate((valid) => {
          if (valid) {
            const format = this.form.format
            let params = {
              format,
            }
            let method = 'post'
            const id = this.$route.params.id
            if (this.form.type === 'custom') {
              const obj = getScriptObj(this.form.script)
              params = {
                function_body: `{${obj.body}}`,
                function_name: obj.name,
                parameters: obj.params,
                format,
              }
            }
            if (id) {
              params.id = id
              method = 'patch'
            }
            if (!params.format) {
              params.format = `${params.function_name}(${params.parameters})`
            }
            this.loading = true
            javascriptFunctionsApi[method](
              Object.assign({}, this.form, params, {
                last_updated: new Date(),
                user_id: Cookie.get('user_id'),
              }),
            )
              .then(() => {
                this.$message.success(this.$t('public_message_save_ok'))
                this.$router.back()
              })
              .finally(() => {
                this.loading = false
              })
          }
        })
      })
    },
  },
}
</script>

<template>
  <PageContainer
    mode="auto"
    content-class="flex flex-1 gap-6 min-h-0 overflow-auto px-6 position-relative"
  >
    <section
      v-loading="loading"
      class="custom-form-wrapper section-wrap bg-white flex-fill"
    >
      <div class="section-wrap-box">
        <ElForm
          v-if="!$route.params.id || details.id"
          ref="form"
          label-position="left"
          label-width="auto"
          :model="form"
        >
          <template v-if="$route.params.id && details.type === 'jar'">
            <ElFormItem :label="`${$t('function_jar_file_label')}:`">
              <span class="details-value">{{ details.fileName }}</span>
            </ElFormItem>
            <ElFormItem :label="`${$t('function_package_name_label')}:`">
              <span class="details-value">{{ details.packageName }}</span>
            </ElFormItem>
            <ElFormItem :label="`${$t('function_class_name_label')}:`">
              <span class="details-value">{{ details.classNameFmt }}</span>
            </ElFormItem>
            <ElFormItem :label="`${$t('function_method_name_label')}:`">
              <span class="details-value">{{ details.methodName }}</span>
            </ElFormItem>
            <ElFormItem
              prop="function_name"
              :label="`${$t('function_name_label')}:`"
              :rules="{
                required: true,
                message: $t('function_name_placeholder'),
              }"
            >
              <ElInput
                v-model="form.function_name"
                class="form-input"
                :placeholder="$t('function_name_placeholder')"
              />
            </ElFormItem>
          </template>
          <ElFormItem
            v-if="form.type === 'custom'"
            prop="script"
            :label="`${$t('function_script_label')}:`"
            :rules="scriptRules"
          >
            <div class="script-editor flex-1">
              <JsEditor ref="editor" v-model:value="form.script" height="200" />
            </div>
          </ElFormItem>
          <ElFormItem prop="describe" :label="`${$t('public_description')}:`">
            <ElInput
              v-model="form.describe"
              class="form-input"
              type="textarea"
              :placeholder="$t('function_describe_placeholder')"
            />
          </ElFormItem>
          <ElFormItem prop="format" :label="`${$t('function_format')}:`">
            <ElInput
              v-model="form.format"
              class="form-input"
              :placeholder="$t('function_format_placeholder')"
            />
          </ElFormItem>
          <ElFormItem
            prop="parameters_desc"
            :label="`${$t('function_parameters_describe_label')}:`"
          >
            <ElInput
              v-model="form.parameters_desc"
              class="form-input"
              type="textarea"
              :placeholder="$t('function_parameters_describe_placeholder')"
            />
          </ElFormItem>
          <ElFormItem
            prop="return_value"
            :label="`${$t('function_return_value_label')}:`"
          >
            <ElInput
              v-model="form.return_value"
              class="form-input"
              type="textarea"
              :placeholder="$t('function_return_value_placeholder')"
            />
          </ElFormItem>
        </ElForm>
      </div>
      <div class="footer position-sticky py-6 bottom-0 bg-white">
        <ElButton class="btn" type="primary" @click="save">{{
          $t('public_button_save')
        }}</ElButton>
        <ElButton class="btn" @click="$router.back()">{{
          $t('public_button_back')
        }}</ElButton>
      </div>

      <!-- </div>
        </div> -->
    </section>
  </PageContainer>
</template>

<style lang="scss" scoped>
.details-value {
  color: map.get($fontColor, dark);
  font-size: 12px;
}
.custom-form__body {
  margin: 30px 24px 0 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: map.get($bgColor, white);
  box-shadow: 0px 0px 3px 0px #cccccc;
  overflow: hidden;

  :deep(.el-form-item__label) {
    font-size: 12px;
  }

  :deep(.el-form-item--mini.el-form-item),
  :deep(.el-form-item--small.el-form-item) {
    margin-bottom: 30px;
  }
  .script-editor {
    width: 940px;
  }
  .form-input {
    max-width: 600px;
  }
  .main {
    flex: 1;
    overflow: auto;
  }
}
.footer {
  background-color: map.get($bgColor, white);
  border-top: 1px solid #f0f0f0;
}
</style>
