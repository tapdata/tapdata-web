<template>
  <div class="setting-panel">
    <ElForm
      :model="settings"
      class="setting-panel-form"
      label-width="140px"
      label-position="top"
      size="small"
      :disabled="stateIsReadonly"
    >
      <ElTabs v-model="settingPanelType" class="setting-tabs h-100">
        <ElTabPane label="基本设置" name="base">
          <div class="setting-panel-box bg-white pt-3">
            <div class="setting-title fs-7 px-5">任务设置</div>
            <div class="px-5">
              <ElRow>
                <ElCol :span="12">
                  <!--任务名称-->
                  <ElFormItem :label="t('task_stetting_name')" required="">
                    <ElInput v-model="settings.name"></ElInput>
                  </ElFormItem>
                </ElCol>
                <ElCol :span="12">
                  <!--同步类型-->
                  <ElFormItem :label="t('task_setting_sync_type')">
                    <ElRadioGroup v-model="settings.type">
                      <!--全量+增量-->
                      <ElRadio label="initial_sync+cdc">{{ t('task_setting_initial_sync_cdc') }}</ElRadio>
                      <!--全量-->
                      <ElRadio label="initial_sync">
                        {{ t('task_setting_initial_sync') }}
                      </ElRadio>
                      <!--增量-->
                      <ElRadio label="cdc">{{ t('task_setting_cdc') }}</ElRadio>
                    </ElRadioGroup>
                  </ElFormItem>
                </ElCol>
              </ElRow>
              <ElRow>
                <ElCol :span="12">
                  <!--任务描述-->
                  <ElFormItem :label="t('task_stetting_desc')">
                    <ElInput type="textarea" v-model="settings.desc"></ElInput>
                  </ElFormItem>
                </ElCol>
              </ElRow>
              <ElRow class="pb-5">
                <ElCol :span="12" v-if="settings.type === 'initial_sync'">
                  <!--任务调度-->
                  <ElFormItem :label="t('task_setting_is_schedule')" required="">
                    <ElSwitch v-model="settings.isSchedule"></ElSwitch>
                  </ElFormItem>
                </ElCol>
                <ElCol :span="12" v-if="settings.isSchedule">
                  <ElFormItem :label="t('dag_data_setting_expression')">
                    <ElInput type="input" width="100%" v-model="settings.cronExpression"></ElInput>
                  </ElFormItem>
                  <div class="schedule">
                    <p>{{ t('dag_data_setting_explanation') }}</p>
                    <p>{{ t('dag_data_setting_grammar') }}</p>
                    <ul class="schedule-list">
                      <li class="fl" v-for="item in timeTextArr" :key="item">
                        <p>{{ t('dag_data_setting_' + item) }}</p>
                        <span>*</span>
                      </li>
                    </ul>
                    <p>{{ t('dag_data_setting_explanation') }}</p>
                    <p>0 */1 * * * ? * // {{ t('dag_data_setting_runMinute') }}</p>
                    <p>0 0 2 * * ? * // {{ t('dag_data_setting_runDay') }}</p>
                  </div>
                </ElCol>
              </ElRow>
            </div>
          </div>
        </ElTabPane>
        <ElTabPane label="高级设置" name="advanced">
          <!--<div class="setting-panel-box bg-white border-bottom pt-3">
            <div class="setting-title fs-7 px-5">
              运行设置
              <span class="pl-2">任务在启动和运行时的环境设置</span>
            </div>
             <div class="px-5">
              <ElRow>
                <ElCol :span="12">
                  <ElFormItem :label="t('connection_form_access_node')">
                    <ElSelect
                      v-model="settings.accessNodeType"
                      :disabled="accessNodeProcessIdArr.length === 1"
                      @change="handleChangeAccessNodeType"
                    >
                      <ElOption
                        :label="t('connection_form_automatic')"
                        value="AUTOMATIC_PLATFORM_ALLOCATION"
                      ></ElOption>
                      <ElOption :label="t('connection_form_manual')" value="MANUALLY_SPECIFIED_BY_THE_USER"></ElOption>
                    </ElSelect>

                    <ElSelect
                      v-if="settings.accessNodeType === 'MANUALLY_SPECIFIED_BY_THE_USER'"
                      v-model="settings.accessNodeProcessId"
                      class="ml-4"
                      style="width: 300px"
                      :disabled="accessNodeProcessIdArr.length === 1"
                    >
                      <ElOption v-for="(item, i) in accessNodeProcessList" :key="i" v-bind="item"></ElOption>
                    </ElSelect>
                  </ElFormItem>
                </ElCol>
              </ElRow>
            </div>
          </div>-->
          <div class="setting-panel-box bg-white border-bottom pt-3">
            <div class="setting-title fs-7 px-5">
              读写设置
              <span class="pl-2">任务在进行读取和写入时执行的策略</span>
            </div>
            <div class="px-5">
              <ElRow>
                <ElCol :span="4">
                  <ElFormItem :label="t('task_setting_automatic_index')">
                    <ElSwitch v-model="settings.isAutoCreateIndex"></ElSwitch>
                  </ElFormItem>
                </ElCol>
                <!--PDK不支持，暂时隐藏-->
                <!--<ElCol :span="4">
                  <ElFormItem :label="t('task_setting_automatic_ddl')">
                    <ElSwitch v-model="settings.isOpenAutoDDL"></ElSwitch>
                  </ElFormItem>
                </ElCol>-->
                <ElCol :span="4">
                  <ElFormItem :label="t('task_setting_distinct_write_type')">
                    <ElSelect v-model="settings.deduplicWriteMode">
                      <ElOption :label="t('dataFlow_setting_intellect')" value="intelligent"></ElOption>
                      <ElOption :label="t('dataFlow_setting_compel')" value="force"></ElOption>
                    </ElSelect>
                  </ElFormItem>
                </ElCol>
              </ElRow>
            </div>
          </div>
          <!--<div class="setting-panel-box bg-white border-bottom pt-3">
            <div class="setting-title fs-7 px-5">
              全量设置
              <span class="pl-2">任务的同步类型为全量或全量+增量时执行的</span>
            </div>
            <div class="px-5">
              &lt;!&ndash;目标写入线程数&ndash;&gt;
              <ElFormItem :label="t('task_setting_transformer_concurrency')">
                <ElInputNumber
                  controls-position="right"
                  v-model="settings.writeThreadSize"
                  :min="1"
                  :max="100"
                ></ElInputNumber>
              </ElFormItem>
            </div>
          </div>-->
          <div class="setting-panel-box bg-white border-bottom mt-5 px-5">
            <div class="setting-title fs-7">
              增量设置
              <span class="pl-2">任务的同步类型为增量或全量+增量时执行的</span>
            </div>
            <div class="pb-5">
              <ElRow>
                <ElCol :span="settings.type === 'cdc' ? 3 : 5">
                  <!--增量同步并发写入-->
                  <ElFormItem :label="t('task_setting_cdc_concurrency')">
                    <ElSwitch v-model="settings.increSyncConcurrency"></ElSwitch>
                  </ElFormItem>
                </ElCol>
                <ElCol :span="6">
                  <!--增量滞后时间设置-->
                  <ElFormItem :label="t('task_setting_lag_time')">
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
                <ElCol :span="3" v-if="settings.type === 'cdc'">
                  <!--引擎过滤-->
                  <ElFormItem :label="t('task_setting_cdc_engine_filter')">
                    <ElSwitch v-model="settings.isFilter"></ElSwitch>
                  </ElFormItem>
                </ElCol>
                <ElCol :span="8">
                  <!--增量数据处理模式-->
                  <ElFormItem :label="t('task_setting_share_cdc_mode')">
                    <ElSelect v-model="settings.increOperationMode">
                      <ElOption label="批量" :value="false"></ElOption>
                      <ElOption label="逐条" :value="true"></ElOption>
                    </ElSelect>
                    <template v-if="!settings.increOperationMode">
                      <ElInputNumber
                        class="pl-2"
                        v-model="settings.increaseReadSize"
                        :min="1"
                        controls-position="right"
                      ></ElInputNumber>
                    </template>
                  </ElFormItem>
                </ElCol>
                <ElCol :span="4">
                  <ElFormItem label="处理器线程数:">
                    <ElInputNumber
                      v-model="settings.processorThreadNum"
                      :min="1"
                      :max="100"
                      controls-position="right"
                    ></ElInputNumber>
                  </ElFormItem>
                </ElCol>
              </ElRow>
              <!--增量开始时间点-->
              <ElFormItem :label="t('task_setting_sync_point')" v-if="settings.type === 'cdc'">
                <ElRow>
                  <ElCol :span="12" v-for="item in settings.syncPoints" :key="item.name">
                    <ElRow>
                      <div class="labelTxt">
                        数据源:
                        {{ item.connectionName || item.connectionId }}
                      </div>
                      <ElCol :span="8" style="margin-right: 10px">
                        <ElSelect v-model="item.pointType" placeholder="请选择">
                          <ElOption v-for="op in options" :key="op.value" :label="op.label" :value="op.value">
                          </ElOption>
                        </ElSelect>
                      </ElCol>
                      <ElCol :span="14" v-if="item.pointType !== 'current'">
                        <ElDatePicker
                          format="yyyy-MM-dd HH:mm:ss"
                          value-format="timestamp"
                          style="width: 95%"
                          v-model="item.dateTime"
                          type="datetime"
                          :disabled="item.pointType === 'current'"
                        ></ElDatePicker>
                      </ElCol>
                    </ElRow>
                  </ElCol>
                </ElRow>
              </ElFormItem>
            </div>
          </div>
          <!-- 开启共享日志挖掘-->
          <div class="setting-panel-box bg-white border-bottom pt-3" v-if="settings.type !== 'initial_sync'">
            <div class="setting-title fs-7 px-5">
              共享挖掘设置
              <span class="pl-2">任务的同步类型为增量或全量+增量时执行</span>
            </div>
            <div class="px-5">
              <ElFormItem :label="t('connection_form_shared_mining')">
                <ElSwitch v-model="settings.shareCdcEnable"></ElSwitch>
              </ElFormItem>
            </div>
          </div>
        </ElTabPane>
      </ElTabs>
    </ElForm>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex'
import Locale from '../mixins/locale'
// import 'web-core/components/form/styles/index.scss'

export default {
  name: 'SettingPanel',
  mixins: [Locale],
  props: {
    settings: Object,
    scope: Object
  },

  data() {
    return {
      settingPanelType: 'base',
      systemTimeZone: '',
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
      ],
      timeTextArr: ['second', 'minute', 'hour', 'day', 'month', 'week', 'year']
    }
  },

  watch: {
    accessNodeProcessIdArr: {
      handler(arr) {
        if (arr.length >= 1) {
          const currentId = this.settings.accessNodeProcessId
          this.$set(this.settings, 'accessNodeType', 'MANUALLY_SPECIFIED_BY_THE_USER')
          this.$set(this.settings, 'accessNodeProcessId', currentId && arr.includes(currentId) ? currentId : arr[0])
        }
      },
      immediate: true
    }
  },

  computed: {
    ...mapState('dataflow', ['activeNodeId', 'transformStatus', 'stateIsReadonly']),

    ...mapGetters('dataflow', [
      'activeNode',
      'nodeById',
      'activeConnection',
      'activeType',
      'hasNodeError',
      'allNodes',
      'allEdges'
    ]),

    accessNodeProcessIdArr() {
      const set = this.allNodes
        .filter(item => item.type === 'table')
        .reduce((set, item) => {
          item.attrs.accessNodeProcessId && set.add(item.attrs.accessNodeProcessId)
          return set
        }, new Set())
      return [...set]
    },

    accessNodeProcessList() {
      if (!this.accessNodeProcessIdArr.length) return this.scope.$agents
      return this.scope.$agents.filter(item => this.accessNodeProcessIdArr.includes(item.value))
    }
  },

  created() {
    let timeZone = new Date().getTimezoneOffset() / 60
    if (timeZone > 0) {
      this.systemTimeZone = 0 - timeZone
    } else {
      this.systemTimeZone = '+' + -timeZone
    }
    this.getAllNode()
  },

  methods: {
    ...mapMutations('dataflow', ['setNodeValue', 'updateNodeProperties', 'setDataflowSettings']),

    // 获取所有节点
    getAllNode() {
      const allNodes = this.allNodes
      const allSource = this.$store.getters['dataflow/allEdges'].map(item => item.source)
      // 根据节点id查询源节点数据
      let sourceConnectionIds = []
      const sourceNodes = allNodes.filter(item => {
        if (allSource.includes(item.id)) {
          sourceConnectionIds.push(item.connectionId)
          return item
        }
      })
      // 过滤重复数据源
      let map = {}
      let filterSourceNodes = () => {
        sourceNodes.forEach(item => {
          if (!map[item.connectionId]) {
            //是否已有保存数据
            if (!this.settings.syncPoints) {
              map[item.connectionId] = {
                connectionId: item.connectionId,
                pointType: 'current', // localTZ: 本地时区； connTZ：连接时区
                dateTime: '',
                timeZone: this.systemTimeZone,
                connectionName: item.attrs?.connectionName
              }
            } else {
              let oldPoint = this.settings.syncPoints.filter(point => point.connectionId === item.connectionId)
              if (oldPoint?.length > 0) {
                map[item.connectionId] = {
                  connectionId: item.connectionId,
                  pointType: oldPoint[0].pointType || 'current', // localTZ: 本地时区； connTZ：连接时区
                  dateTime: oldPoint[0].dateTime || '',
                  timeZone: this.systemTimeZone,
                  connectionName: item.attrs?.connectionName
                }
              } else {
                map[item.connectionId] = {
                  connectionId: item.connectionId,
                  pointType: 'current', // localTZ: 本地时区； connTZ：连接时区
                  dateTime: '',
                  timeZone: this.systemTimeZone,
                  connectionName: item.attrs?.connectionName
                }
              }
            }
          }
        })
        return map
      }
      this.$set(this.settings, 'syncPoints', Object.values(filterSourceNodes()))
      // eslint-disable-next-line
      console.log(allNodes, allSource, sourceConnectionIds, this.settings.syncPoints, filterSourceNodes())
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
    },

    handleChangeAccessNodeType(v) {
      if (
        v === 'MANUALLY_SPECIFIED_BY_THE_USER' &&
        !this.settings.accessNodeProcessId &&
        this.accessNodeProcessList.length
      ) {
        // 用户选择指定agent运行，默认帮用户选第一项
        this.$set(this.settings, 'accessNodeProcessId', this.accessNodeProcessList[0].value)
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
    .labelTxt {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.65);
    }
    ::v-deep {
      > .el-tabs__header {
        height: 50px;
        line-height: 50px;
        margin: 0;
        .el-tabs__nav-wrap {
          padding-left: 16px;
          padding-right: 16px;

          &::after {
            height: 1px;
          }
          .el-tabs__item {
            font-weight: 400;
            &.is-active {
              font-weight: 600;
            }
          }
        }
      }

      > .el-tabs__content {
        height: calc(100% - 50px);
        overflow: auto;
        box-sizing: border-box;
        .el-tab-pane {
          height: 100%;
        }
      }

      .el-tabs__content {
        .schedule {
          font-size: 12px;
          color: #999;
          p {
            padding-bottom: 5px;
          }
          li {
            padding-right: 10px;
            text-align: center;
          }
        }
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
            color: #000;
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
