<script>
import { javascriptFunctionsApi } from '@tap/api'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import { JsEditor } from '@tap/component'

export default {
  components: { JsEditor, PageContainer },
  data() {
    return {
      details: {},
    }
  },
  created() {
    this.getData()
  },
  methods: {
    getData() {
      const typeMap = {
        custom: this.$t('function_type_option_custom'),
        jar: this.$t('function_type_option_jar'),
        system: this.$t('function_type_option_system'),
      }

      javascriptFunctionsApi.get([this.$route.params.id]).then((data) => {
        const details = data || {}
        // 处理老数据问题
        if (details.type === 'custom' && !details.script) {
          details.script = `function ${details.function_name}(${details.parameters}) ${details.function_body}`
        }
        if (details.type === 'jar') {
          details.classNameFmt =
            details.className?.split(`${details.packageName}.`)?.[1] || ''
        }
        details.typeFmt = typeMap[details.type]
        this.details = details
      })
    },
  },
}
</script>

<template>
  <PageContainer mode="auto">
    <section class="function-details-wrapper section-wrap">
      <div class="section-wrap-box">
        <ElForm label-position="left" label-width="auto" :model="details">
          <ElFormItem :label="`${$t('function_name_label')}:`">
            <span class="details-value">{{ details.function_name }}</span>
          </ElFormItem>
          <ElFormItem :label="`${$t('function_type_label')}:`">
            <span class="details-value">{{ details.typeFmt }}</span>
          </ElFormItem>
          <template v-if="details.type === 'jar'">
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
          </template>
          <ElFormItem :label="`${$t('public_description')}:`">
            <span class="details-value">{{ details.describe }}</span>
          </ElFormItem>
          <ElFormItem :label="`${$t('function_format')}:`">
            <span class="details-value">{{ details.format }}</span>
          </ElFormItem>
          <ElFormItem :label="`${$t('function_parameters_describe_label')}:`">
            <span class="details-value">{{ details.parameters_desc }}</span>
          </ElFormItem>
          <ElFormItem :label="`${$t('function_return_value_label')}:`">
            <span class="details-value">{{ details.return_value }}</span>
          </ElFormItem>
        </ElForm>
        <div v-if="details.type === 'custom'" class="mb-4">
          <div class="details-panel-title mb-4">
            {{ $t('function_script_label') }}
          </div>
          <div class="script-editor">
            <JsEditor
              v-model:value="details.script"
              height="200"
              :options="{ readOnly: true }"
            />
          </div>
        </div>
      </div>

      <!-- </div>
				</div> -->
    </section>
  </PageContainer>
</template>

<style lang="scss" scoped>
.function-details-wrapper {
  .details-value {
    color: map.get($fontColor, dark);
  }

  :deep(.el-form) {
    flex: 1;
  }

  :deep(.el-form-item--mini.el-form-item),
  :deep(.el-form-item--small.el-form-item) {
    margin-bottom: 24px;
  }

  .details-panel-title {
    font-size: 14px;
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
    // box-shadow: 0px -1px 2px 0px #f6f6f6;
    .btn {
      width: 80px;
    }
  }
}

// }}
</style>
