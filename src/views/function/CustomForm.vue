<template>
  <section class="custom-form-wrapper">
    <div class="container-header">{{ $t('function_button_create_custom_function') }}</div>
    <div class="custom-form__body">
      <div class="main px-6 py-4">
        <ElForm ref="form" label-position="left" label-width="120px" size="small" :model="form" :rules="rules">
          <ElFormItem prop="script" :label="$t('function_body_label') + ':'">
            <div class="script-editor">
              <CodeEditor v-model="form.script" ref="editor" lang="javascript" height="200"></CodeEditor>
            </div>
          </ElFormItem>
          <!-- <ElFormItem prop="function_name" :label="$t('function_name_label') + ':'">
            <ElInput
              v-model="form.function_name"
              class="form-input"
              :placeholder="$t('function_name_placeholder')"
              @input="changeName"
            ></ElInput>
          </ElFormItem> -->
          <ElFormItem prop="describe" :label="$t('function_describe_label') + ':'">
            <ElInput
              v-model="form.describe"
              class="form-input"
              type="textarea"
              :placeholder="$t('function_describe_placeholder')"
            ></ElInput>
          </ElFormItem>
          <ElFormItem prop="format" :label="$t('function_format') + ':'">
            <ElInput
              v-model="form.format"
              class="form-input"
              :placeholder="$t('function_format_placeholder')"
            ></ElInput>
          </ElFormItem>
          <ElFormItem prop="parameters_desc" :label="$t('function_parameters_describe_label') + ':'">
            <ElInput
              v-model="form.parameters_desc"
              class="form-input"
              type="textarea"
              :placeholder="$t('function_parameters_describe_placeholder')"
            ></ElInput>
          </ElFormItem>
          <ElFormItem prop="return_value" :label="$t('function_return_value_label') + ':'">
            <ElInput
              v-model="form.return_value"
              class="form-input"
              type="textarea"
              :placeholder="$t('function_return_value_placeholder')"
            ></ElInput>
          </ElFormItem>
        </ElForm>
      </div>
      <div class="footer p-6">
        <ElButton class="btn" size="mini">{{ $t('button_back') }}</ElButton>
        <ElButton class="btn" type="primary" size="mini" @click="save">{{ $t('button_save') }}</ElButton>
      </div>
    </div>
  </section>
</template>

<script>
import CodeEditor from 'web-core/components/CodeEditor'
const getScriptObj = script => {
  let matchArr1 = script.match(/(?<=function\s+)\w+(?=\s*\([^]*\))/g)
  let name = matchArr1?.[0] || ''
  let matchArr2 = script.match(/(?<=\s*function\s+\w+\s*\([^]*\)\s*\{)[^]*?(?=\}\s*)/g)
  let body = matchArr2?.[0] || ''
  let matchArr3 = script.match(/(?<=function\s+\w+\s*\()[\w\s,]*(?=\))/g)
  let params = matchArr3?.[0] || ''
  return {
    name,
    body,
    params,
    bodyLength: matchArr2?.length || 0
  }
}
export default {
  components: { CodeEditor },
  data() {
    let self = this
    return {
      form: {
        type: 'custom',
        describe: '',
        format: '',
        parameters_desc: '',
        return_value: '',
        script: 'function function_name (record) {\n\treturn record\n}'
      },
      rules: {
        script: [
          {
            validator: (rule, value, callback) => {
              let obj = getScriptObj(value)
              if (!value.trim()) {
                callback(new Error('请输入函数'))
              } else if (!obj.name.trim()) {
                callback(new Error('缺少函数名'))
              } else if (!obj.body.trim()) {
                callback(new Error('缺少函数体'))
              } else if (self.$refs.editor.editor.session.$annotations.some(item => item.type !== 'info')) {
                callback(new Error('函数格式不正确'))
              } else if (obj.bodyLength.length > 1) {
                callback(new Error('只允许创建一个函数'))
              } else {
                callback()
              }
            }
          }
        ]
      }
    }
  },
  methods: {
    save() {
      this.$refs.editor.format()
      this.$nextTick(() => {
        this.$refs.form.validate(valid => {
          if (valid) {
            let obj = getScriptObj(this.form.script)

            this.$api('Javascript_functions')
              .post(
                Object.assign({}, this.form, {
                  last_updated: new Date(),
                  user_id: this.$cookie.get('user_id'),
                  function_body: `{${obj.body}}`,
                  function_name: obj.function_name,
                  parameters: obj.params
                })
              )
              .then(res => {
                if (res) {
                  this.$message.success(this.$t('message.saveOK'))
                }
              })
              .catch(e => {
                this.$message.error(e.response.msg)
              })
          }
        })
      })
    }
  }
}
</script>

<style scoped lang="scss">
.custom-form-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fafafa;
}
.custom-form__body {
  margin: 30px 24px 0 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  box-shadow: 0px 0px 3px 0px #cccccc;
  overflow: hidden;

  ::v-deep {
    .el-form-item--mini.el-form-item,
    .el-form-item--small.el-form-item {
      margin-bottom: 24px;
    }
  }
  .script-editor {
    width: 800px;
  }
  .form-input {
    max-width: 600px;
  }
  .main {
    flex: 1;
    overflow: auto;
  }
  .footer {
    border-top: 1px solid #f0f0f0;
    box-shadow: 0px -1px 2px 0px #f6f6f6;
    .btn {
      width: 80px;
    }
  }
}
</style>
