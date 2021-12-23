<template>
  <div class="setting-panel">
    <ElForm :model="settings" class="setting-panel-form" label-width="140px" label-position="top" size="small">
      <ElTabs v-model="settingPanelType" class="setting-tabs h-100">
        <ElTabPane label="基本设置" name="base">
          <div class="setting-panel-box bg-white px-5">
            <div class="setting-title fs-7 border-bottom">任务设置</div>
            <div>
              <ElRow>
                <ElCol :span="12">
                  <ElFormItem label="任务名称" required="">
                    <ElInput v-model="settings.name"></ElInput>
                  </ElFormItem>
                </ElCol>
                <ElCol :span="12">
                  <ElFormItem label="同步类型">
                    <ElRadioGroup v-model="settings.type">
                      <ElRadio label="initial_sync+cdc">全量+增量</ElRadio>
                      <ElRadio label="initial_sync">全量</ElRadio>
                      <ElRadio label="cdc">增量</ElRadio>
                    </ElRadioGroup>
                  </ElFormItem>
                </ElCol>
              </ElRow>
              <ElRow>
                <ElCol :span="24">
                  <ElFormItem label="任务描述">
                    <ElInput type="textarea" v-model="settings.desc"></ElInput>
                  </ElFormItem>
                </ElCol>
              </ElRow>
            </div>
          </div>
        </ElTabPane>
        <ElTabPane label="高级设置" name="advanced">
          <div class="setting-panel-box bg-white px-5">
            <div class="setting-title border-bottom fs-7">
              读写设置
              <span class="pl-2">任务在进行读取和写入时执行的策略</span>
            </div>
            <div>
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
          <div class="setting-panel-box bg-white px-5">
            <div class="setting-title border-bottom fs-7">
              全量设置
              <span class="pl-2">任务的同步类型为全量或全量+增量时执行的</span>
            </div>
            <div>
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
          <div class="setting-panel-box bg-white mt-5 px-5">
            <div class="setting-title border-bottom fs-7">
              增量设置
              <span class="pl-2">任务的同步类型为增量或全量+增量时执行的</span>
            </div>
            <div class="pb-5">
              <ElRow>
                <ElCol :span="4">
                  <ElFormItem label="增量同步并发写入">
                    <ElSwitch v-model="settings.increSyncConcurrency"></ElSwitch>
                  </ElFormItem>
                </ElCol>
                <ElCol :span="6">
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
                <ElCol :span="4">
                  <ElFormItem label="引擎过滤">
                    <ElSwitch v-model="settings.isFilter"></ElSwitch>
                  </ElFormItem>
                </ElCol>
                <ElCol :span="10">
                  <ElFormItem label="增量数据处理模式">
                    <ElSelect v-model="settings.increOperationMode">
                      <ElOption label="批量" :value="false"></ElOption>
                      <ElOption label="逐条" :value="true"></ElOption>
                    </ElSelect>
                    <template v-if="!settings.increOperationMode">
                      <ElInputNumber
                        v-model="settings.increaseReadSize"
                        :min="1"
                        controls-position="right"
                      ></ElInputNumber>
                    </template>
                  </ElFormItem>
                </ElCol>
              </ElRow>
              <ElRow>
                <!-- <ElCol :span="12">
                  <ElFormItem label="增量同步间隔(ms)">
                    <ElInputNumber
                      v-model="settings.increaseSyncInterval"
                      :min="0"
                      controls-position="right"
                    ></ElInputNumber>
                  </ElFormItem>
                </ElCol> -->
                <!-- <ElCol :span="6">
                  <ElFormItem label="每次读取行数">
                    <ElInputNumber
                      v-model="settings.increaseReadSize"
                      :min="1"
                      controls-position="right"
                    ></ElInputNumber>
                  </ElFormItem>
                </ElCol> -->
                <ElCol :span="4">
                  <ElFormItem label="处理器线程数">
                    <ElInputNumber
                      v-model="settings.processorThreadNum"
                      :min="1"
                      :max="100"
                      controls-position="right"
                    ></ElInputNumber>
                  </ElFormItem>
                </ElCol>
                <!-- <ElCol :span="10">
                  <ElFormItem label="共享增量读取模式">
                    <ElSelect v-model="settings.increShareReadMode">
                      <ElOption label="流式读取" value="STREAMING"></ElOption>
                      <ElOption label="轮询读取" value="POLLING"></ElOption>
                    </ElSelect>
                  </ElFormItem>
                </ElCol> -->
              </ElRow>

              <ElFormItem label="增量开始时间点">
                <ElRow v-for="item in settings.syncPoints" :key="item.name">
                  <div class="labelTxt">
                    数据源:
                    {{ item.name || item.connectionId }}
                  </div>
                  <ElCol :span="8" style="margin-right: 10px">
                    <ElSelect v-model="item.type" placeholder="请选择">
                      <ElOption v-for="op in options" :key="op.value" :label="op.label" :value="op.value"> </ElOption>
                    </ElSelect>
                  </ElCol>
                  <ElCol :span="14" v-if="item.type !== 'current'">
                    <ElDatePicker
                      format="yyyy-MM-dd HH:mm:ss"
                      style="width: 95%"
                      v-model="item.date"
                      type="datetime"
                      :disabled="item.type === 'current'"
                    ></ElDatePicker>
                  </ElCol>
                </ElRow>
              </ElFormItem>
            </div>
          </div>
        </ElTabPane>
      </ElTabs>
    </ElForm>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
// import 'web-core/components/form/styles/index.scss'

export default {
  name: 'SettingPanel',

  props: {
    settings: Object
  },

  data() {
    return {
      settingPanelType: 'base',
      options: [
        {
          label: '用户浏览器时区',
          value: 'localTZ'
        },
        {
          label: '数据库时区',
          value: 'connTZ'
        },
        {
          label: '此刻',
          value: 'current'
        }
      ]
    }
  },

  computed: {
    ...mapGetters('dataflow', ['activeNode', 'nodeById', 'activeConnection', 'activeType', 'hasNodeError'])
  },

  methods: {
    ...mapMutations('dataflow', ['setNodeValue', 'updateNodeProperties', 'setDataflowSettings']),

    getAllConnectionIds() {
      console.log(this.dataflow)
      debugger
    },

    updateSyncNode(syncPoints) {
      syncPoints = syncPoints || []
      let connectionIds = this.getAllConnectionIds()
      if (connectionIds && connectionIds.length > 0) {
        this.getAllConnectionName(connectionIds)
          .then(() => {})
          .catch(() => {})
        syncPoints = syncPoints.filter(point => connectionIds.includes(point.connectionId))
        let map = {}
        // connectionId -> syncPoint
        syncPoints.forEach(s => (map[s.connectionId] = s))

        connectionIds.forEach(connectionId => {
          if (!map[connectionId]) {
            map[connectionId] = {
              connectionId: connectionId,
              type: 'current', // localTZ: 本地时区； connTZ：连接时区
              time: '',
              date: '',
              timezone: this.systemTimeZone,
              name: ''
            }
          }
        })
        return map
      }
    }
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
        box-sizing: border-box;
        .el-tab-pane {
          height: 100%;
        }
      }

      .el-tabs__content {
        .setting-title {
          line-height: 35px;
          font-weight: 600;
          span {
            font-weight: initial;
            font-size: 12px;
            color: rgba(0, 0, 0, 0.45);
          }
        }
        .el-form-item {
          margin-bottom: 15px;
          .el-form-item__label {
            padding-bottom: 0;
          }
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
          width: 100%;
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
