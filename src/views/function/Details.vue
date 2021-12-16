<template>
  <section class="function-details-wrapper">
    <div class="container-header">
      {{ $t('function_details') }}
    </div>
    <div class="function-details__body" v-loading="!details.id">
      <div class="main px-6 py-4">
        <ElForm label-position="left" label-width="120px" size="small" :model="details">
          <ElFormItem :label="$t('function_name_label') + ':'">
            <span>{{ details.function_name }}</span>
          </ElFormItem>
          <ElFormItem :label="$t('function_type_label') + ':'">
            <span>{{ details.typeFmt }}</span>
          </ElFormItem>
          <template v-if="details.type === 'jar'">
            <ElFormItem :label="$t('function_jar_file_label') + ':'">
              <span>{{ details.fileName }}</span>
            </ElFormItem>
            <ElFormItem :label="$t('function_package_name_label') + ':'">
              <span>{{ details.packageName }}</span>
            </ElFormItem>
            <ElFormItem :label="$t('function_class_name_label') + ':'">
              <span>{{ details.classNameFmt }}</span>
            </ElFormItem>
            <ElFormItem :label="$t('function_method_name_label') + ':'">
              <span>{{ details.methodName }}</span>
            </ElFormItem>
          </template>
          <ElFormItem :label="$t('function_describe_label') + ':'">
            <span>{{ details.describe }}</span>
          </ElFormItem>
          <ElFormItem :label="$t('function_format') + ':'">
            <span>{{ details.format }}</span>
          </ElFormItem>
          <ElFormItem :label="$t('function_parameters_describe_label') + ':'">
            <span>{{ details.parameters_desc }}</span>
          </ElFormItem>
          <ElFormItem :label="$t('function_return_value_label') + ':'">
            <span>{{ details.return_value }}</span>
          </ElFormItem>
        </ElForm>
        <div v-if="details.type === 'custom'" class="mb-4">
          <div class="details-panel-title mb-4">{{ $t('function_script_label') }}:</div>
          <div class="script-editor">
            <CodeEditor
              v-model="details.script"
              ref="editor"
              lang="javascript"
              height="200"
              :options="{ readOnly: true }"
            ></CodeEditor>
          </div>
        </div>
      </div>
      <div class="footer p-6">
        <ElButton class="btn" size="mini" @click="$router.back()">{{ $t('button_back') }}</ElButton>
      </div>
    </div>
  </section>
</template>

<script>
import CodeEditor from 'web-core/components/CodeEditor'
export default {
  components: { CodeEditor },
  data() {
    return {
      details: {}
    }
  },
  created() {
    this.getData()
  },
  methods: {
    getData() {
      let typeMap = {
        custom: this.$t('function_type_option_custom'),
        jar: this.$t('function_type_option_jar'),
        system: this.$t('function_type_option_system')
      }
      this.$api('Javascript_functions')
        .findOne({
          filter: {
            where: {
              id: this.$route.params.id
            }
          }
        })
        .then(res => {
          let details = res?.data || {}
          // 处理老数据问题
          if (details.type === 'custom' && !details.script) {
            details.script = `function ${details.function_name}() ${details.function_body}`
          }
          if (details.type === 'jar') {
            details.classNameFmt = details.className?.split(details.packageName + '.')?.[1] || ''
          }
          details.typeFmt = typeMap[details.type]
          this.details = details
        })
    }
  }
}
</script>

<style scoped lang="scss">
.function-details-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fafafa;
  .function-details__body {
    margin: 30px 24px 0 24px;
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #fff;
    box-shadow: 0px 0px 3px 0px #cccccc;
    overflow: hidden;
    ::v-deep {
      .el-form-item__label {
        font-size: 12px;
      }
      .el-form-item--mini.el-form-item,
      .el-form-item--small.el-form-item {
        margin-bottom: 24px;
      }
    }
    .details-panel-title {
      font-size: 12px;
    }
    .script-editor {
      max-width: 940px;
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
}
</style>
