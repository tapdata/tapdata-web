<template>
  <div class="setting-panel">
    <ElForm :model="settings" class="setting-panel-form" label-width="120px" label-position="left" size="small">
      <ElTabs v-model="settingPanelType" class="setting-tabs h-100">
        <ElTabPane label="基本设置" name="base">
          <div class="setting-panel-box bg-white">
            <div class="p-5">
              <ElFormItem label="任务名称">
                <ElInput v-model="settings.name"></ElInput>
              </ElFormItem>
              <ElFormItem label="同步类型">
                <ElRadioGroup v-model="settings.type">
                  <ElRadio label="initial_sync+cdc">全量+增量</ElRadio>
                  <ElRadio label="initial_sync">全量</ElRadio>
                  <ElRadio label="cdc">增量</ElRadio>
                </ElRadioGroup>
              </ElFormItem>
              <ElFormItem label="任务描述">
                <ElInput type="textarea" v-model="settings.desc"></ElInput>
              </ElFormItem>
            </div>
          </div>
        </ElTabPane>
        <ElTabPane label="高级设置" name="advanced">
          <div class="setting-panel-box bg-white">
            <div class="setting-title fs-7 pl-4">读写设置</div>
            <div class="pt-5 px-5">
              <ElRow>
                <ElCol :span="12">
                  <ElFormItem label="自动创建索引">
                    <ElSwitch v-model="settings.isAutoCreateIndex"></ElSwitch>
                  </ElFormItem>
                </ElCol>
                <ElCol :span="12">
                  <ElFormItem label="去重写入机制">
                    <ElSelect v-model="settings.deduplicWriteMode">
                      <ElOption label="智能去重写入" value="intelligent"></ElOption>
                      <ElOption label="强制去重写入" value="force"></ElOption>
                    </ElSelect>
                  </ElFormItem>
                </ElCol>
              </ElRow>
            </div>
          </div>
          <div class="setting-panel-box bg-white">
            <div class="setting-title fs-7 pl-4">全量设置</div>
            <div class="pt-5 px-5">
              <ElFormItem label="目标写入线程数">
                <ElInputNumber
                  controls-position="right"
                  v-model="settings.writeThreadSize"
                  :min="1"
                  :max="100"
                ></ElInputNumber>
              </ElFormItem>
            </div>
          </div>
          <div class="setting-panel-box bg-white mt-5">
            <div class="setting-title fs-7 pl-4">增量设置</div>
            <div class="pt-5 px-5">
              <ElRow>
                <ElCol :span="12">
                  <ElFormItem label="引擎过滤">
                    <ElSwitch v-model="settings.isFilter"></ElSwitch>
                  </ElFormItem>
                </ElCol>
                <ElCol :span="12">
                  <ElFormItem label="增量同步并发写入">
                    <ElSwitch v-model="settings.increSyncConcurrency"></ElSwitch>
                  </ElFormItem>
                </ElCol>
              </ElRow>
              <ElRow>
                <ElCol :span="12">
                  <ElFormItem label="增量批次读取行数">
                    <ElInputNumber
                      v-model="settings.increaseReadSize"
                      :min="1"
                      controls-position="right"
                    ></ElInputNumber>
                  </ElFormItem>
                </ElCol>
                <ElCol :span="12">
                  <ElFormItem label="增量数据处理模式">
                    <ElSelect v-model="settings.increOperationMode">
                      <ElOption label="批量" :value="false"></ElOption>
                      <ElOption label="逐条" :value="true"></ElOption>
                    </ElSelect>
                  </ElFormItem>
                </ElCol>
              </ElRow>
              <ElRow>
                <ElCol :span="12">
                  <ElFormItem label="增量同步间隔(ms)">
                    <ElInputNumber
                      v-model="settings.increaseSyncInterval"
                      :min="0"
                      controls-position="right"
                    ></ElInputNumber>
                  </ElFormItem>
                </ElCol>
                <ElCol :span="12">
                  <ElFormItem label="每次读取行数">
                    <ElInputNumber
                      v-model="settings.increaseReadSize"
                      :min="1"
                      controls-position="right"
                    ></ElInputNumber>
                  </ElFormItem>
                </ElCol>
                <ElCol :span="12">
                  <ElFormItem label="处理器线程数">
                    <ElInputNumber
                      v-model="settings.processorThreadNum"
                      :min="1"
                      :max="100"
                      controls-position="right"
                    ></ElInputNumber>
                  </ElFormItem>
                </ElCol>
              </ElRow>
              <ElRow>
                <ElCol :span="12">
                  <ElFormItem label="共享增量读取模式">
                    <ElSelect v-model="settings.increShareReadMode">
                      <ElOption label="流式读取" value="STREAMING"></ElOption>
                      <ElOption label="轮询读取" value="POLLING"></ElOption>
                    </ElSelect>
                  </ElFormItem>
                </ElCol>
                <ElCol :span="12">
                  <ElFormItem label="增量滞后时间设置">
                    <ElSwitch v-model="settings.increHysteresis"></ElSwitch>
                    <template v-if="settings.increHysteresis">
                      <ElInputNumber
                        v-model="settings.hysteresisInterval"
                        class="pl-5 mr-1"
                        :min="1"
                        controls-position="right"
                      ></ElInputNumber>
                      秒
                    </template>
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
import 'web-core/components/form/styles/index.scss'

export default {
  name: 'SettingPanel',

  props: {
    settings: Object
  },

  data() {
    return {
      settingPanelType: 'base'
    }
  },

  computed: {
    ...mapGetters('dataflow', ['activeNode', 'nodeById', 'activeConnection', 'activeType', 'hasNodeError'])
  },

  methods: {
    ...mapMutations('dataflow', ['setNodeValue', 'updateNodeProperties', 'setDataflowSettings'])
  }
}
</script>

<style lang="scss" scoped>
.setting-panel {
  position: relative;
  height: 100%;
  font-size: 12px;
  .setting-tabs,
  .setting-panel-form {
    height: 100%;
    ::v-deep {
      > .el-tabs__header {
        margin: 0;
        .el-tabs__nav-wrap {
          padding-left: 16px;
          padding-right: 16px;

          &::after {
            height: 1px;
          }
        }
      }

      > .el-tabs__content {
        height: calc(100% - 40px);
        overflow: auto;
        .el-tab-pane {
          height: 100%;
        }
      }

      .el-tabs__content {
        .setting-title {
          line-height: 35px;
          font-weight: bold;
          background-color: #f2f4f6;
          // border-top: 1px solid rgba(200, 205, 207, 0.26);
          // border-bottom: 1px solid rgba(200, 205, 207, 0.26);
        }
        .el-select,
        .el-input,
        .el-textarea {
          width: auto;
        }
        .el-radio__label,
        .el-input,
        .el-input__inner {
          font-size: 12px;
        }
        .el-textarea {
          width: 500px;
          min-height: 100px;
          .el-textarea__inner {
            min-height: 100px !important;
          }
        }
      }
    }
  }
}
</style>
