<script>
import { findAccessNodeInfo } from '@tap/api/src/core/cluster'
import { getConnectionNoSchema } from '@tap/api/src/core/connections'
import { fetchDatabaseTypeByPdkHash } from '@tap/api/src/core/database-types'
import {
  getLogcollectorDetail,
  patchLogcollectorId,
} from '@tap/api/src/core/logcollector'
import { getTaskById, patchTaskById } from '@tap/api/src/core/task'
import SchemaToForm from '@tap/form/src/SchemaToForm.vue'
import dayjs from 'dayjs'

export default {
  name: 'Editor',
  components: { SchemaToForm },
  emits: ['success'],
  data() {
    return {
      visible: false,
      taskId: '',
      loading: false,
      editForm: {
        id: '',
        name: '',
        storageTime: 3,
        syncPoints: [],
        accessNodeType: 'AUTOMATIC_PLATFORM_ALLOCATION',
        accessNodeProcessId: '',
        priorityProcessId: '',
      },
      rulesEdit: {
        name: [
          {
            required: true,
            message: this.$t('packages_business_shared_cdc_name'),
            trigger: 'blur',
          },
        ],
      },
      pointTypeOptions: [
        {
          label: this.$t('public_time_user_specified_time'),
          value: 'localTZ',
        },
        {
          label: this.$t('public_time_current'),
          value: 'current',
        },
      ],
      dag: null,
      dagForm: {
        cdcConcurrent: false,
        cdcConcurrentWriteNum: 4,
        increaseReadSize: 1,
      },
      schemaData: null,
      schemaScope: null,
      agentOptions: [],
    }
  },
  computed: {
    accessNodeTypeOptions() {
      return [
        {
          label: this.$t('packages_business_connection_form_automatic'),
          value: 'AUTOMATIC_PLATFORM_ALLOCATION',
        },
        {
          label: this.$t('packages_business_connection_form_manual'),
          value: 'MANUALLY_SPECIFIED_BY_THE_USER',
        },
        {
          label: this.$t('packages_business_connection_form_group'),
          value: 'MANUALLY_SPECIFIED_BY_THE_USER_AGENT_GROUP',
        },
      ]
    },
    selectedAgentOptions() {
      return this.agentOptions.filter(
        (item) => item.accessNodeType === this.editForm.accessNodeType,
      )
    },
    priorityOptions() {
      const group = this.agentOptions.find(
        (item) => item.value === this.editForm.accessNodeProcessId,
      )
      return [
        {
          label: this.$t('packages_business_connection_form_automatic'),
          value: '',
        },
        ...(group?.children || []),
      ]
    },
  },
  methods: {
    init() {
      this.editForm = {
        id: '',
        name: '',
        storageTime: 3,
        syncPoints: [],
        accessNodeType: 'AUTOMATIC_PLATFORM_ALLOCATION',
        accessNodeProcessId: '',
        priorityProcessId: '',
      }
      this.schemaData = null
      this.loadDag()
      this.loadData()
    },

    onAccessNodeTypeChange() {
      this.editForm.accessNodeProcessId = ''
      this.editForm.priorityProcessId = ''
    },

    async loadAgentOptions() {
      try {
        const data = await findAccessNodeInfo()
        const mapAgent = (item) => ({
          value: item.processId,
          label: `${item.hostName}（${
            item.status === 'running'
              ? this.$t('public_status_running')
              : this.$t('public_agent_status_offline')
          }）`,
          disabled: item.status !== 'running',
        })

        this.agentOptions = (data || [])
          .filter(
            (item) =>
              item.status === 'running' ||
              item.accessNodeType ===
                'MANUALLY_SPECIFIED_BY_THE_USER_AGENT_GROUP' ||
              item.processId === this.editForm.accessNodeProcessId,
          )
          .map((item) => {
            if (
              item.accessNodeType ===
              'MANUALLY_SPECIFIED_BY_THE_USER_AGENT_GROUP'
            ) {
              return {
                value: item.processId,
                label: `${item.accessNodeName}（${this.$t(
                  'public_status_running',
                )}：${
                  item.accessNodes?.filter((node) => node.status === 'running')
                    .length || 0
                }）`,
                accessNodeType: item.accessNodeType,
                children: item.accessNodes?.map(mapAgent) || [],
              }
            }
            return {
              ...mapAgent(item),
              accessNodeType: item.accessNodeType,
            }
          })
      } catch {
        this.agentOptions = []
      }
    },

    async loadTaskAgentPolicy() {
      const task = await getTaskById(this.taskId)
      if (!task) return
      this.editForm.accessNodeType =
        task.accessNodeType || 'AUTOMATIC_PLATFORM_ALLOCATION'
      this.editForm.accessNodeProcessId = task.accessNodeProcessId || ''
      this.editForm.priorityProcessId = task.priorityProcessId || ''
      await this.loadAgentOptions()
    },

    loadData() {
      this.loading = true
      Promise.all([
        getLogcollectorDetail(this.taskId),
        this.loadTaskAgentPolicy(),
      ])
        .then(([task]) => {
          this.editForm.name = task.name
          this.editForm.storageTime = task.storageTime
          const syncPoints = task.syncPoints
          if (syncPoints) {
            this.editForm.syncPoints = syncPoints
          } else {
            const [connectionId, connectionName] = Object.entries(
              task.connections[0],
            )[0]
            const sourceNodeIds = (task.dag?.edges || []).map((t) => t.source)
            const sourceNodes = (task.dag?.nodes || [])
              .filter((node) => sourceNodeIds.includes(node.id))
              .map((node) => ({
                nodeId: node.id,
                nodeName: node.name,
                connectionId,
                connectionName,
              }))
            const result = sourceNodes.map((item) => {
              const point = {
                ...item,
                timeZone: this.systemTimeZone,
                pointType: 'current', // localTZ: 本地时区； connTZ：连接时区
                dateTime: '',
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
    async loadDag() {
      let dag = this.$store.getters['dataflow/dag']

      if (!dag?.edges?.length || !dag?.nodes?.length) {
        const task = await getTaskById(this.taskId)
        const outputsMap = {}
        const inputsMap = {}

        dag = task.dag
        dag.edges.forEach(({ source, target }) => {
          const _source = outputsMap[source]
          const _target = inputsMap[target]

          if (!_source) {
            outputsMap[source] = [target]
          } else {
            _source.push(target)
          }

          if (!_target) {
            inputsMap[target] = [source]
          } else {
            _target.push(source)
          }
        })
        dag.nodes.forEach((node) => {
          node.$inputs = inputsMap[node.id] || []
          node.$outputs = outputsMap[node.id] || []
        })
      }

      this.dag = dag

      for (const node of dag.nodes) {
        if (node.type === 'hazelcastIMDG') {
          this.dagForm.cdcConcurrent = node.cdcConcurrent || false
          this.dagForm.cdcConcurrentWriteNum = node.cdcConcurrentWriteNum || 4
        } else if (node.type === 'logCollector') {
          // 获取连接信息
          const con = await fetchDatabaseTypeByPdkHash(node.attrs.pdkHash)
          const nodeProperties = con.properties?.node?.properties

          this.dagForm.increaseReadSize = node.increaseReadSize ?? 1

          if (!nodeProperties || !Object.keys(nodeProperties).length) {
            this.schemaData = null
            return
          }

          const {
            nodeConfig,
            attrs,
            connectionIds: [connectionId],
            $inputs,
            $outputs,
          } = node

          if (nodeConfig) {
            if (connectionId) {
              const connectionInfo = await getConnectionNoSchema(connectionId)
              attrs.db_version = connectionInfo.db_version
            }

            const values = {
              nodeConfig,
              attrs,
              $inputs,
              $outputs,
            }

            this.$refs.schemaToForm.getForm()?.setValues(values)
            this.schemaData = {
              type: 'object',
              'x-component': 'FormLayout',
              'x-decorator': 'FormItem',
              properties: {
                $inputs: {
                  type: 'array',
                  'x-display': 'hidden',
                  default: [],
                },
                $outputs: {
                  type: 'array',
                  'x-display': 'hidden',
                  default: [],
                },
                nodeConfig: {
                  type: 'object',
                  properties: nodeProperties,
                },
              },
            }
          }
        }
      }
    },

    open(id) {
      this.taskId = id
      this.init()
      this.visible = true
    },

    handleClose() {
      this.visible = false
    },

    handleSave(...args) {
      this.$refs.form?.validate(async (valid) => {
        if (valid) {
          await patchLogcollectorId(this.taskId, this.editForm)
          // Save the task-level Agent override after the mining parameters.
          // Both endpoints update the same Task document; serializing them
          // prevents the later mining update from restoring the old policy.
          await this.saveTaskDag()
          this.$emit('success', ...args)
          this.$message.success(
            this.$t('packages_business_shared_cdc_setting_message_edit_save'),
          )
          this.init()
          this.handleClose()
        }
      })
    },

    getPickerOptions(val, item) {
      if (item.pointType === 'connTZ')
        return {
          disabledDate: null,
          selectableRange: null,
        }
      const now = Date.now()
      const formatMap = {
        date: 'YYYY-MM-DD',
        time: 'HH:mm:ss',
        startTime: '00:00:00',
        endTime: '23:59:59',
      }

      const pickDate = dayjs(val).format(formatMap.date)
      const nowDate = dayjs(now).format(formatMap.date)
      const nowTime = dayjs(now).format(formatMap.time)
      if (val > now) {
        item.dateTime = now
      }
      const op = {
        disabledDate: (time) => {
          return new Date(time).getTime() > now
        },
      }
      if (pickDate === nowDate) {
        op.selectableRange = `${formatMap.startTime} - ${nowTime}`
      } else {
        op.selectableRange = `${formatMap.startTime} - ${formatMap.endTime}`
      }
      return op
    },

    saveTaskDag() {
      const { dag } = this
      const { cdcConcurrent, cdcConcurrentWriteNum, increaseReadSize } =
        this.dagForm

      const getFormValues = this.$refs.schemaToForm?.getFormValues() || {}
      dag?.nodes?.forEach((el) => {
        if (el.type === 'hazelcastIMDG') {
          Object.assign(el, {
            cdcConcurrent,
            cdcConcurrentWriteNum,
          })
        } else if (el.type === 'logCollector') {
          const { $inputs, $outputs, ...formVal } = getFormValues
          Object.assign(el, {
            nodeConfig: formVal.nodeConfig,
            storageTime: this.editForm.storageTime,
            increaseReadSize,
          })
        }
      })
      const accessNodeProcessIdList =
        this.editForm.accessNodeType === 'MANUALLY_SPECIFIED_BY_THE_USER' &&
        this.editForm.accessNodeProcessId
          ? [this.editForm.accessNodeProcessId]
          : []
      return patchTaskById(this.taskId, {
        ...(dag ? { dag } : {}),
        accessNodeType: this.editForm.accessNodeType,
        accessNodeProcessId: this.editForm.accessNodeProcessId,
        accessNodeProcessIdList,
        priorityProcessId: this.editForm.priorityProcessId,
      })
    },
  },
}
</script>

<template>
  <ElDialog
    :title="$t('packages_business_shared_list_edit_title')"
    :model-value="visible"
    :append-to-body="true"
    width="800px"
    top="10vh"
    class="connection-dialog ldp-conection-dialog flex flex-column"
    @close="handleClose"
  >
    <ElForm
      ref="form"
      v-loading="loading"
      label-position="left"
      label-width="auto"
      :model="editForm"
      :rules="rulesEdit"
    >
      <ElFormItem
        :label="$t('packages_business_shared_form_edit_name')"
        prop="name"
      >
        <ElInput v-model="editForm.name" clearable />
      </ElFormItem>
      <ElFormItem :label="$t('packages_business_shared_form_setting_log_time')">
        <ElInputNumber
          v-model="editForm.storageTime"
          :precision="0"
          :step="1"
          :min="1"
        />
        <span class="ml-2">{{ $t('public_time_d') }}</span>
      </ElFormItem>
      <ElFormItem
        :label="$t('packages_business_shared_list_edit_title_start_time')"
      >
        <div v-for="(item, index) in editForm.syncPoints" :key="index">
          <ElSelect
            v-model="item.pointType"
            :placeholder="$t('public_select_placeholder')"
            style="width: 200px"
          >
            <ElOption
              v-for="op in pointTypeOptions"
              :key="op.value"
              :label="op.label"
              :value="op.value"
            />
          </ElSelect>
          <ElDatePicker
            v-if="item.pointType !== 'current'"
            v-model="item.dateTime"
            :picker-options="getPickerOptions(item.dateTime, item)"
            popper-class="hide-current__dateTime"
            type="datetime"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="x"
            class="ml-4"
          />
        </div>
      </ElFormItem>
      <ElFormItem
        :label="$t('packages_dag_nodes_database_zengliangduoxiancheng')"
      >
        <ElSwitch v-model="dagForm.cdcConcurrent" />
        <ElInputNumber
          v-if="dagForm.cdcConcurrent"
          v-model="dagForm.cdcConcurrentWriteNum"
          class="ml-4"
          :min="0"
        />
      </ElFormItem>
      <ElFormItem :label="$t('packages_dag_nodes_database_zengliangmeipici')">
        <ElInputNumber
          v-model="dagForm.increaseReadSize"
          :min="1"
          controls-position="right"
        />
      </ElFormItem>
      <ElFormItem :label="$t('packages_business_connection_form_access_node')">
        <ElSelect
          v-model="editForm.accessNodeType"
          style="width: 240px"
          @change="onAccessNodeTypeChange"
        >
          <ElOption
            v-for="item in accessNodeTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem
        v-if="editForm.accessNodeType !== 'AUTOMATIC_PLATFORM_ALLOCATION'"
        :label="
          editForm.accessNodeType ===
          'MANUALLY_SPECIFIED_BY_THE_USER_AGENT_GROUP'
            ? $t('packages_business_choose_agent_group')
            : $t('packages_business_choose_agent')
        "
      >
        <ElSelect
          v-model="editForm.accessNodeProcessId"
          style="width: 240px"
          :placeholder="$t('public_select_placeholder')"
        >
          <ElOption
            v-for="item in selectedAgentOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            :disabled="item.disabled"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem
        v-if="
          editForm.accessNodeType ===
          'MANUALLY_SPECIFIED_BY_THE_USER_AGENT_GROUP'
        "
        :label="$t('packages_business_priorityProcessId')"
      >
        <ElSelect
          v-model="editForm.priorityProcessId"
          style="width: 240px"
          :placeholder="$t('public_select_placeholder')"
        >
          <ElOption
            v-for="item in priorityOptions"
            :key="item.value || 'automatic'"
            :label="item.label"
            :value="item.value"
          />
        </ElSelect>
      </ElFormItem>
      <div
        v-if="schemaData"
        class="border-bottom mb-3 pb-3 fs-6 fw-sub font-color-normal"
      >
        {{ $t('packages_dag_config_datasource') }}
      </div>
      <SchemaToForm
        ref="schemaToForm"
        :schema="schemaData"
        :scope="schemaScope"
        :colon="true"
        label-width="160"
        class="scheme-to-form"
      />
    </ElForm>
    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="handleClose">{{
          $t('public_button_cancel')
        }}</ElButton>
        <ElButton type="primary" @click="handleSave">{{
          $t('public_button_save')
        }}</ElButton>
      </span>
    </template>
  </ElDialog>
</template>

<style lang="scss" scoped>
.scheme-to-form {
  :deep(.formily-element-plus-form-item) {
    margin-bottom: 10px;
  }
}
</style>
