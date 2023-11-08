<template>
  <ElDialog
    :title="$t('packages_business_shared_list_edit_title')"
    :visible="visible"
    :append-to-body="true"
    width="800px"
    top="10vh"
    custom-class="connection-dialog ldp-conection-dialog flex flex-column"
    @close="handleClose"
  >
    <ElForm
      v-loading="loading"
      ref="form"
      label-position="left"
      label-width="160px"
      :model="editForm"
      :rules="rulesEdit"
      class="my-n6"
    >
      <ElFormItem size="small" :label="$t('packages_business_shared_form_edit_name')" prop="name">
        <ElInput clearable v-model:value="editForm.name"></ElInput>
      </ElFormItem>
      <ElFormItem size="small" :label="$t('packages_business_shared_form_setting_log_time')">
        <ElInputNumber v-model:value="editForm.storageTime" :precision="0" :step="1" :min="1"></ElInputNumber>
        <span class="ml-2">{{ $t('public_time_d') }}</span>
      </ElFormItem>
      <ElFormItem size="small" :label="$t('packages_business_shared_list_edit_title_start_time')">
        <div v-for="(item, index) in editForm.syncPoints" :key="index">
          <ElSelect v-model:value="item.pointType" :placeholder="$t('public_select_placeholder')">
            <ElOption v-for="op in pointTypeOptions" :key="op.value" :label="op.label" :value="op.value"></ElOption>
          </ElSelect>
          <ElDatePicker
            v-if="item.pointType !== 'current'"
            v-model:value="item.dateTime"
            :picker-options="getPickerOptions(item.dateTime, item)"
            popperClass="hide-current__dateTime"
            type="datetime"
            format="yyyy-MM-dd HH:mm:ss"
            valueFormat="timestamp"
            class="ml-4"
          ></ElDatePicker>
        </div>
      </ElFormItem>
      <ElFormItem size="small" :label="$t('packages_dag_nodes_database_zengliangduoxiancheng')">
        <ElSwitch v-model:value="dagForm.cdcConcurrent"></ElSwitch>
        <ElInputNumber
          v-if="dagForm.cdcConcurrent"
          v-model:value="dagForm.cdcConcurrentWriteNum"
          class="ml-4"
          :min="0"
        ></ElInputNumber>
      </ElFormItem>
      <div class="border-bottom mb-3 fs-6 fw-bold font-color-normal">
        {{ $t('packages_dag_config_datasource') }}
      </div>
      <SchemaToForm
        ref="schemaToForm"
        :schema="schemaData"
        :scope="schemaScope"
        :colon="true"
        label-width="160"
        class="scheme-to-form"
      ></SchemaToForm>
    </ElForm>
    <template v-slot:footer>
      <span class="dialog-footer">
        <ElButton @click="handleClose" size="small">{{ $t('public_button_cancel') }}</ElButton>
        <ElButton size="small" type="primary" @click="handleSave">{{ $t('public_button_save') }}</ElButton>
      </span>
    </template>
  </ElDialog>
</template>

<script>
import { $on, $off, $once, $emit } from '../../../utils/gogocodeTransfer'
import dayjs from 'dayjs'
import { logcollectorApi, taskApi, databaseTypesApi } from '@tap/api'
import { SchemaToForm } from '@tap/form'

export default {
  name: 'Editor',
  components: { SchemaToForm },
  data() {
    return {
      visible: false,
      taskId: '',
      loading: false,
      editForm: {
        id: '',
        name: '',
        storageTime: 3,
        syncPoints: []
      },
      rulesEdit: {
        name: [
          {
            required: true,
            message: this.$t('packages_business_shared_cdc_name'),
            trigger: 'blur'
          }
        ]
      },
      pointTypeOptions: [
        {
          label: this.$t('public_time_user_specified_time'),
          value: 'localTZ'
        },
        {
          label: this.$t('public_time_current'),
          value: 'current'
        }
      ],
      dag: null,
      dagForm: {
        cdcConcurrent: false,
        cdcConcurrentWriteNum: 4
      },
      schemaData: null,
      schemaScope: null
    }
  },
  methods: {
    init() {
      this.editForm = {
        id: '',
        name: '',
        storageTime: 3,
        syncPoints: []
      }
      this.schemaData = null
      this.loadDag()
      this.loadData()
    },

    loadData() {
      this.loading = true
      logcollectorApi
        .getDetail(this.taskId)
        .then(task => {
          this.editForm.name = task.name
          this.editForm.storageTime = task.storageTime
          let syncPoints = task.syncPoints
          if (syncPoints) {
            this.editForm.syncPoints = syncPoints
          } else {
            const [connectionId, connectionName] = Object.entries(task.connections[0])[0]
            const sourceNodeIds = (task.dag?.edges || []).map(t => t.source)
            const sourceNodes = (task.dag?.nodes || [])
              .filter(node => sourceNodeIds.includes(node.id))
              .map(node => ({
                nodeId: node.id,
                nodeName: node.name,
                connectionId: connectionId,
                connectionName: connectionName
              }))
            const result = sourceNodes.map(item => {
              const point = {
                ...item,
                timeZone: this.systemTimeZone,
                pointType: 'current', // localTZ: 本地时区； connTZ：连接时区
                dateTime: ''
              }
              return point
            })
            this.editForm.syncPoints = result
          }
        })
        .finally(() => {
          this.loading = false
        })
    },

    // 获取任务的dag
    loadDag() {
      taskApi.get(this.taskId).then(data => {
        this.dag = data.dag

        this.dag.nodes.forEach((el = {}) => {
          if (el.type === 'hazelcastIMDG') {
            this.dagForm.cdcConcurrent = el.cdcConcurrent || false
            this.dagForm.cdcConcurrentWriteNum = el.cdcConcurrentWriteNum || 4
          } else if (el.type === 'logCollector') {
            // 获取连接信息
            databaseTypesApi.pdkHash(el.attrs.pdkHash).then(con => {
              const nodeProperties = con.properties?.node?.properties
              if (Object.keys(nodeProperties).length) {
                this.schemaData = {
                  type: 'object',
                  'x-component': 'FormLayout',
                  'x-decorator': 'FormItem',
                  properties: {
                    $inputs: {
                      type: 'array',
                      'x-display': 'hidden',
                      default: []
                    },
                    $outputs: {
                      type: 'array',
                      'x-display': 'hidden',
                      default: []
                    },
                    nodeConfig: {
                      type: 'object',
                      properties: nodeProperties
                    }
                  }
                }
              }

              const { nodeConfig } = el
              if (nodeConfig) {
                this.$refs.schemaToForm.getForm()?.setValues({
                  nodeConfig
                })
              }
            })
          }
        })
      })
    },

    open(id) {
      this.taskId = id
      this.init()
      this.visible = true
    },

    handleClose() {
      this.visible = false
    },

    handleSave() {
      this.$refs.form?.validate(valid => {
        if (valid) {
          logcollectorApi.patchId(this.taskId, this.editForm).then(() => {
            $emit(this, 'success', ...arguments)
            this.$message.success(this.$t('packages_business_shared_cdc_setting_message_edit_save'))
            this.init()
            this.handleClose()
          })

          // 保存到目标节点
          this.saveTaskDag()
        }
      })
    },

    getPickerOptions(val, item) {
      if (item.pointType === 'connTZ')
        return {
          disabledDate: null,
          selectableRange: null
        }
      const now = Date.now()
      const formatMap = {
        date: 'YYYY-MM-DD',
        time: 'HH:mm:ss',
        startTime: '00:00:00',
        endTime: '23:59:59'
      }

      const pickDate = dayjs(val).format(formatMap.date)
      const nowDate = dayjs(now).format(formatMap.date)
      const nowTime = dayjs(now).format(formatMap.time)
      if (val > now) {
        item.dateTime = now
      }
      let op = {
        disabledDate: time => {
          return new Date(time).getTime() > now
        }
      }
      if (pickDate === nowDate) {
        op.selectableRange = `${formatMap.startTime} - ${nowTime}`
      } else {
        op.selectableRange = `${formatMap.startTime} - ${formatMap.endTime}`
      }
      return op
    },

    saveTaskDag() {
      let { dag } = this
      const { cdcConcurrent, cdcConcurrentWriteNum } = this.dagForm

      const getFormValues = this.$refs.schemaToForm?.getFormValues() || {}
      dag.nodes.forEach(el => {
        if (el.type === 'hazelcastIMDG') {
          Object.assign(el, {
            cdcConcurrent,
            cdcConcurrentWriteNum
          })
        } else if (el.type === 'logCollector') {
          const { $inputs, $outputs, ...formVal } = getFormValues
          Object.assign(el, {
            nodeConfig: formVal.nodeConfig
          })
        }
      })
      taskApi.patch({
        id: this.taskId,
        dag
      })
    }
  },
  emits: ['success']
}
</script>

<style lang="scss" scoped>
.scheme-to-form {
  :deep(.formily-element-form-item) {
    margin-bottom: 10px;
  }
}
</style>
