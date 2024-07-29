<template>
  // FIXME 合并冲突
  <section class="verify-form-wrap section-wrap flex-fill bg-white" v-loading="loading">
    <div class="section-wrap-box position-relative p-6">
      <div class="verify-form-title">
        {{
          $route.params.id ? $t('packages_business_verification_edit') : $t('packages_business_verification_newVerify')
        }}
      </div>
      <SchemaToForm
        v-if="!!formSchema"
        :value="form"
        ref="schemaToForm"
        :schema="formSchema"
        :scope="schemaScope"
        :colon="true"
        class="w-100"
        label-width="120"
      ></SchemaToForm>
      <div v-if="!!errorMessageLevel" class="color-danger mt-2" v-html="jointErrorMessage"></div>
      <div class="mt-4">
        <ElButton @click="goBack()">{{ $t('public_button_back') }}</ElButton>
        <ElButton type="primary" :disabled="saveDisabled" @click="save(true)">{{ $t('public_button_save') }}</ElButton>
      </div>
    </div>
  </section>
</template>

<script>
import { cloneDeep, merge } from 'lodash'
import { action } from '@formily/reactive'

import i18n from '@tap/i18n'
import { inspectApi, taskApi } from '@tap/api'
import { SchemaToForm } from '@tap/form'
import Time from '@tap/shared/src/time'

import { DATA_NODE_TYPES, META_INSTANCE_FIELDS, TABLE_PARAMS } from './components/const'
import { CONNECTION_STATUS_MAP } from '../../shared'
import { uuid } from '@tap/shared'
import { statusMap, inspectMethod as inspectMethodMap } from './const'

import { AsyncSelect } from '@tap/form'

const FILTER_DATABASE_TYPES = ['Doris']

export default {
  components: {
    SchemaToForm,
    AsyncSelect,
  },
  data() {
    let self = this
    let requiredValidator = (msg, check) => {
      return (rule, value, callback) => {
        let valid = check ? check() : true
        if (valid && !value) {
          callback(new Error(msg))
        } else {
          callback()
        }
      }
    }
    let checkMode = () => {
      return self.form.mode === 'cron'
    }

    return {
      loading: false,
      timeUnitOptions: ['second', 'minute', 'hour', 'day', 'week', 'month'],
      isDbClone: false,
      taskName: '',
      form: {
        flowId: '',
        name: '',
        mode: 'manual',
        inspectDifferenceMode: 'All',
        inspectMethod: 'row_count',
        cdcBeginDate: '',
        cdcEndDate: '',
        cdcDuration: '',
        timing: {
          intervals: 24 * 60,
          intervalsUnit: 'minute',
          start: Time.now(),
          end: Time.now() + 24 * 60 * 60 * 1000,
        },
        limit: {
          keep: 100,
        },
        enabled: true,
        tasks: [],
        taskMode: 'pipeline',
        errorNotifys: ['SYSTEM', 'EMAIL'],
        inconsistentNotifys: ['SYSTEM', 'EMAIL'],
        alarmSettings: [
          {
            type: 'INSPECT',
            key: 'INSPECT_TASK_ERROR',
            notify: ['SYSTEM', 'EMAIL'],
            open: true,
          },
          {
            type: 'INSPECT',
            key: 'INSPECT_COUNT_ERROR',
            notify: ['SYSTEM', 'EMAIL'],
            open: true,
            params: {
              maxDifferentialRows: 0,
            },
          },
          {
            type: 'INSPECT',
            key: 'INSPECT_VALUE_ERROR',
            notify: ['SYSTEM', 'EMAIL'],
            open: true,
            params: {
              maxDifferentialValues: 0,
            },
          },
        ],
      },
      rules: {
        flowId: [
          {
            validator: requiredValidator(this.$t('packages_business_verification_tasksDataFlow')),
          },
        ],
        name: [
          {
            validator: requiredValidator(this.$t('packages_business_verification_tasksJobName')),
          },
        ],
        'timing.start': [
          {
            validator: requiredValidator(this.$t('packages_business_verification_tasksTime'), checkMode),
          },
        ],
        'timing.intervals': [
          {
            validator: requiredValidator(this.$t('packages_business_verification_tasksVerifyInterval'), checkMode),
          },
        ],
        cdcBeginDate: [
          {
            validator: requiredValidator(i18n.t('packages_business_verification_form_qingshurukaishi'), () => {
              return self.form.inspectMethod === 'cdcCount'
            }),
          },
        ],
      },
      edges: [],
      allStages: [],
      flowOptions: [],
      inspectMethodMap,
      typTipMap: {
        row_count: this.$t('packages_business_verification_fastCountTip'),
        field: this.$t('packages_business_verification_contentVerifyTip'),
        jointField: this.$t('packages_business_verification_jointFieldTip'),
      },
      jointErrorMessage: '',
      errorMessageLevel: '',
      autoAddTableLoading: false,
      schemaScope: null,
      formSchema: null,
    }
  },
  computed: {
    saveDisabled() {
      return this.errorMessageLevel === 'error' || this.autoAddTableLoading || this.loading
    },
  },
  created() {
    // 设置form.taskMode
    let taskMode = this.$route.query.taskMode
    if (taskMode) {
      this.form.taskMode = taskMode
    }

    let id = this.$route.params.id
    if (id) {
      this.getData(id)
    }
  },
  methods: {
    async getTaskOptions(filter) {
      let data

      if (filter.where?.id) {
        return {
          items: [
            {
              id: filter.where.id,
              name: this.taskName,
            },
          ],
          total: 1,
        }
      }

      if (!this.taskOptionCache) {
        this.taskOptionCache = await inspectApi.getTaskList()
      }

      data = this.taskOptionCache || []

      let query = filter?.where?.name
      query = typeof query === 'object' ? query.like : query
      if (query) {
        query = query.toLowerCase()
        const reg = new RegExp(query, 'i')
        data = data.filter((item) => reg.test(item.name))
      }

      return {
        items: data,
        total: data.length,
      }
    },
    //获取表单数据
    async getData(id) {
      try {
        const data = await inspectApi.findOne({
          filter: JSON.stringify({
            where: {
              id: id,
            },
          }),
        })
        if (data) {
          if (this.form.taskMode === 'pipeline' && data.taskDto) {
            this.taskName = data.taskDto.name
            this.applyTask(data.taskDto)
            await this.$nextTick()
          }

          const haveTaskId = data.tasks.some((t) => !!t.taskId)
          // 加载数据源的Capabilities
          let capabilitiesMap = {}
          if (haveTaskId) {
            capabilitiesMap = this.$refs.conditionBox.getMatchCapabilitiesMap()
          } else {
            capabilitiesMap = await this.$refs.conditionBox.getCapabilities([
              ...data.tasks.map((t) => t.source.connectionId),
              ...data.tasks.map((t) => t.target.connectionId),
            ])
          }
          data.tasks = data.tasks.map((t) => {
            t.source = Object.assign({}, TABLE_PARAMS, t.source)
            t.target = Object.assign({}, TABLE_PARAMS, t.target)
            t.source.capabilities = capabilitiesMap[t.source.connectionId]
            t.target.capabilities = capabilitiesMap[t.target.connectionId]
            if (t.source.nodeId) {
              t.source.currentLabel = `${t.source.nodeName} / ${t.source.connectionName}`
              t.target.currentLabel = `${t.target.nodeName} / ${t.target.connectionName}`
            }
            t.id = t.taskId
            return t
          })

          if (!data.timing) {
            data.timing = this.form.timing
          }
          data.taskMode = data.flowId ? 'pipeline' : 'random'
          // 历史数据，默认不打开；新数据默认打开
          const { alarmSettings = [] } = data
          data.alarmSettings =
            this.form.alarmSettings?.map((t) => {
              const f = alarmSettings.find((item) => item.key === t.key)
              if (f) return Object.assign(t, f)
              t.notify = []
              t.open = false
              return t
            }) || []

          this.form = Object.assign({}, this.form, data)
        }
      } catch (e) {
        console.error(e)
      }
    },
    async getFlowStages(id, cb) {
      this.loading = true
      try {
        id = id || this.form.flowId
        const data = await taskApi.getId(id)
        this.loading = false
        this.applyTask(data, cb)
      } catch (e) {
        this.loading = false
      }
    },
    applyTask(task, cb) {
      this.isDbClone = task.syncType === 'migrate'
      let edges = task.dag?.edges || []
      let nodes = task.dag?.nodes || []

      if (!edges.length) {
        if (cb) {
          setTimeout(() => {
            cb()
            this.loading = false
          }, 800)
        } else {
          this.loading = false
        }
        return { items: [], total: 0 }
      }
      let stages = []
      nodes.forEach((n) => {
        let outputLanes = []
        let inputLanes = []
        edges.forEach((e) => {
          if (e.source === n.id) {
            outputLanes.push(e.target)
          }
          if (e.target === n.id) {
            inputLanes.push(e.source)
          }
        })
        stages.push(
          Object.assign({}, n, {
            outputLanes,
            inputLanes,
          }),
        )
      })

      this.edges = edges
      this.allStages = stages

      if (cb) {
        setTimeout(() => {
          cb()
          this.loading = false
        }, 800)
      }
    },

    timingChangeHandler(times) {
      this.form.timing.start = times?.[0] || ''
      this.form.timing.end = times?.[1] || ''
    },
    goBack() {
      this.$confirm(
        this.$t('packages_business_verification_backConfirmMessage'),
        this.$t('packages_business_verification_backConfirmTitle'),
        {
          type: 'warning',
        },
      ).then((resFlag) => {
        if (!resFlag) {
          return
        }
        this.$router.back()
      })
    },
    save(saveOnly = false) {
      const schemaFormInstance = this.$refs.schemaToForm.getForm?.()
      schemaFormInstance?.validate().then(() => {
        const formValues = this.$refs.schemaToForm.getFormValues()
        // TODO需要精简不需要的属性
        delete formValues.tasksOptions
        delete formValues.nodesOptions
        delete formValues.connectionsOptions

        let { tasks } = formValues
        // 自动过滤出完整数据，以及索引字段数量不相等的情况
        tasks = tasks.filter((t) => {
          if (t.webScript) {
            t.webScript = 'function validate(sourceRow){' + t.webScript + '}'
          }
          delete t.source.capabilities
          delete t.source.fields
          delete t.source.sortColumnList
          delete t.target.capabilities
          delete t.target.fields
          delete t.target.sortColumnList

          if (this.form.inspectMethod === 'row_count' || this.form.inspectMethod === 'hash') {
            return t.source.table && t.target.table
          }

          return t.source.sortColumn && t.source.sortColumn.split(',').length === t.target.sortColumn.split(',').length
        })

        if (!tasks.length) {
          return this.$message.error(this.$t('packages_business_verification_tasksVerifyCondition'))
        }

        const alarmSettingsKeys =
          formValues.inspectMethod === 'row_count'
            ? ['INSPECT_TASK_ERROR', 'INSPECT_COUNT_ERROR']
            : ['INSPECT_TASK_ERROR', 'INSPECT_VALUE_ERROR']
        const alarmSettings = formValues.alarmSettings.filter((t) => alarmSettingsKeys.includes(t.key))

        inspectApi[formValues.id ? 'patch' : 'post'](
          Object.assign({}, formValues, {
            fullMatchKeep: formValues.keep,
            status: saveOnly ? 'waiting' : 'scheduling',
            ping_time: 0,
            tasks: formValues.tasks,
            platformInfo: {
              agentType: 'private',
            },
            byFirstCheckId: '',
            browserTimezoneOffset: new Date().getTimezoneOffset(),
            alarmSettings,
          }),
        ).then(() => {
          this.$message.success(this.$t('public_message_save_ok'))
          this.$router.back() // back 保留上个路由的参数
        })
      })
    },
    handleSelectTask(option, byClick) {
      if (byClick) {
        this.form.tasks = []
        this.taskName = option.label
        this.setVerifyName()
        this.getFlowStages(option.value, this.$refs.conditionBox.autoAddTable)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.verify-form-wrap {
  height: 100%;
  overflow: hidden;
  .section-wrap-box {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 20px;
    border-radius: 4px;
    background-color: #fff;
    box-sizing: border-box;
    height: 100%;
    overflow: auto;
  }
}
.verify-form-title {
  margin-bottom: 24px;
  line-height: 22px;
  font-size: 14px;
  color: map-get($fontColor, dark);
}
.form-item {
  margin-bottom: 32px;
}
.form-select {
  width: 276px;
}
.form-input {
  width: 500px;
}

.form-item-width {
  width: 500px;
}

:deep(.js-wrap) {
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  .jsBox {
    display: flex;
    flex-direction: column;
    flex: 1;
    .js-fixText {
      line-height: 25px;
    }

    .js-fixContent {
      margin-left: 60px;
    }
  }
  .example {
    width: 300px;
  }

  .js-editor {
    border: 1px solid map-get($borderColor, light);
  }
}

.el-form {
  :deep(.el-form-item__error) {
    margin-top: 8px;
  }
}
</style>
