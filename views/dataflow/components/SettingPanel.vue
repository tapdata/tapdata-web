<template>
  <div class="setting-panel">
    <ElForm :model="model" class="setting-panel-form">
      <ElTabs v-model="settingPanelType" class="setting-tabs px-3 h-100">
        <ElTabPane label="基本设置" name="base">
          <div class="setting-panel-box bg-white">
            <div class="setting-title fs-7 pl-4">任务设置</div>
            <div class="pt-5 px-5">
              <ElFormItem label="任务名称">
                <ElInput v-model="model.name"></ElInput>
              </ElFormItem>
              <ElFormItem label="同步类型">
                <ElRadioGroup v-model="model.sync_type">
                  <ElRadio label="initial_sync+cdc">全量+增量</ElRadio>
                  <ElRadio label="initial_sync">全量</ElRadio>
                  <ElRadio label="cdc">增量</ElRadio>
                </ElRadioGroup>
              </ElFormItem>
              <ElFormItem label="任务描述">
                <ElInput type="textarea" v-model="model.describe"></ElInput>
              </ElFormItem>
            </div>
          </div>
        </ElTabPane>
        <ElTabPane label="高级设置" name="advanced">
          <div class="setting-panel-box bg-white mt-5">
            <div class="setting-title fs-7 pl-4">读写设置</div>
            <div class="pt-5 px-5">
              <ElRow>
                <ElCol :span="12">
                  <ElFormItem label="自动创建索引">
                    <ElSwitch v-model="model.needToCreateIndex"></ElSwitch>
                  </ElFormItem>
                </ElCol>
                <ElCol :span="12">
                  <ElFormItem label="去重写入机制">
                    <ElSelect v-model="model.distinctWriteType">
                      <ElOption label="智能去重写入" value="intellect"></ElOption>
                      <ElOption label="强制去重写入" value="compel"></ElOption>
                    </ElSelect>
                  </ElFormItem>
                </ElCol>
              </ElRow>
            </div>
          </div>
          <div class="setting-panel-box bg-white mt-5">
            <div class="setting-title fs-7 pl-4">全量设置</div>
              <div class="pt-5 px-5">
                <ElFormItem label="目标写入线程数">
                  <ElInputNumber v-model="model.transformerConcurrency" controls-position="right" :min="1" :max="100"></ElInputNumber>
                </ElFormItem>
              </div>
          </div>
          <div class="setting-panel-box bg-white mt-5">
            <div class="setting-title fs-7 pl-4">增量设置</div>
            <div class="pt-5 px-5">
              <ElRow>
                <ElCol :span="12">
                  <ElFormItem label="引擎过滤">
                    <ElSwitch v-model="model.cdcEngineFilter"></ElSwitch>
                  </ElFormItem>
                </ElCol>
                <ElCol :span="12">
                  <ElFormItem label="增量同步并发写入">
                    <ElSwitch v-model="model.cdcConcurrency"></ElSwitch>
                  </ElFormItem>
                </ElCol>
              </ElRow>
              <ElRow>
                <ElCol :span="12">
                  <ElFormItem label="增量滞后判断时间设置">
                    <ElSwitch v-model="model.lagTimeFalg"></ElSwitch>
                    <ElInputNumber v-model="model.userSetLagTime" controls-position="right" :min="1"></ElInputNumber>ms
                  </ElFormItem>
                </ElCol>
                <ElCol :span="12">
                  <ElFormItem label="增量数据处理机制">
                    <ElSelect v-model="model.isSerialMode">
                      <ElOption label="批量" value="false"></ElOption>
                      <ElOption label="逐条" value="true"></ElOption>
                    </ElSelect>
                    <ElInputNumber v-model="model.cdcFetchSize" controls-position="right" :min="1"></ElInputNumber>
                  </ElFormItem>
                </ElCol>
              </ElRow>
            </div>
          </div>
        </ElTabPane>
      </ElTabs>
    </ElForm>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { createForm, onFormInputChange, onFormValuesChange } from '@formily/core'
import { createSchemaField, FormProvider } from '@formily/vue'
import { action } from '@formily/reactive'
import * as components from 'web-core/components/form'
import {
  Form,
  FormItem,
  FormTab,
  PreviewText,
  ArrayTable,
  Switch,
  Input,
  InputNumber,
  Checkbox,
  Radio,
  Space,
  FormGrid,
  ArrayTabs,
  FormLayout
} from '@formily/element'
import 'web-core/components/form/styles/index.scss'

const form = createForm({
  validateFirst: true
})

const { SchemaField } = createSchemaField({
  components: {
    FormItem,
    FormTab,
    ArrayTable,
    PreviewText,
    Switch,
    Input,
    InputNumber,
    Checkbox,
    Radio,
    Space,
    FormGrid,
    ArrayTabs,
    FormLayout,
    ...components
  }
})

export default {
  name: 'SettingPanel',
  data() {
    return {
      settingPanelType: 'base',
      model: {
        name: '',
        sync_type: 'initial_sync+cdc',
        describe: ''
      }
    }
  },

  components: { Form, FormProvider, SchemaField },

  computed: {
    ...mapGetters('dataflow', [
      'activeNode',
      'nodeById',
      'activeConnection',
      'activeType',
      'hasNodeError',
      'settingPanelType'
    ])
  },

  methods: {
    ...mapMutations('dataflow', ['setNodeValue', 'updateNodeProperties', 'setDataflowSettings'])
  }
}
</script>

<style lang="scss" scoped>
.setting-panel{
  height: 100%;
  .setting-tabs,.setting-panel-form{
    height: 100%;
    ::v-deep {
      .el-tabs__heade {
        margin-bottom: 0;
      }
      .el-tabs__content {
        height: calc(100% - 60px);
        overflow: auto!important;
        .el-tab-pane {
          height: 100%;
          .setting-panel-box {
            padding-bottom: 10px;
          }
        }
        .setting-title {
          line-height: 35px;
          font-weight: 500;
          border-bottom: 1px solid rgba(200, 205, 207, 0.26);
        }
      }
    }
  }

}
</style>
