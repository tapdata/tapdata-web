<script setup lang="ts">
import {
  CancelToken,
  discoveryApi,
  ldpApi,
  metadataDefinitionsApi,
  taskApi,
} from '@tap/api'
import { DatabaseIcon } from '@tap/business/src/components/DatabaseIcon'
import {
  makeDragNodeImage,
  makeStatusAndDisabled,
  TASK_SETTINGS,
} from '@tap/business/src/shared'
import TableSelector from '@tap/dag/src/components/form/table-selector/TableSelector.vue'
import { validateCron } from '@tap/form/src/shared/validate'
import { useI18n } from '@tap/i18n'
import { generateId, uuid } from '@tap/shared'
import {
  computed,
  h,
  inject,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useTemplateRef,
  watch,
} from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance } from 'element-plus'

const props = defineProps<{
  fdmConnection: any
}>()

const emit = defineEmits<{
  success: [connectionId: string, task: any]
}>()

const { t } = useI18n()
const router = useRouter()

const tag2Task = inject<Record<string, any>>('tag2Task')
const treeData = inject<any[]>('treeData')

const fixedPrefix = ref('FDM_')
const syncedAlertTitle = ref('')
const creating = ref(false)
const prefixMap = ref<Record<string, string>>({})
const form = ref<FormInstance>()
const checkCanStartIng = ref(false)
const taskDialogConfig = ref({
  from: null as any,
  to: null as any,
  visible: false,
  prefix: '',
  tableName: null as string | null,
  canStart: false,
  notSupportedCDC: false,
  tableNames: [],
  migrateTableSelectType: 'custom',
  noPrimaryKeyTableSelectType: 'All',
  task: {
    type: 'initial_sync+cdc',
    crontabExpressionFlag: false,
    crontabExpression: '',
    crontabExpressionType: 'once',
  },
})
const formRules = ref({
  taskName: [{ validator: validateTaskName, trigger: 'blur' }],
  newTableName: [{ required: true }],
  prefix: [{ validator: validatePrefix, trigger: 'blur' }],
  'task.crontabExpression': [
    {
      required: true,
      message: t('public_form_not_empty'),
      trigger: ['blur', 'change'],
    },
    { validator: validateCrontabExpression, trigger: ['blur', 'change'] },
  ],
})

async function validateTaskName(rule: any, value: string, callback: any) {
  value = value.trim()
  if (!value) {
    callback(new Error(t('packages_business_relation_list_qingshururenwu')))
  } else {
    try {
      const isExist = await taskApi.checkName({
        name: value,
      })
      if (isExist) {
        callback(new Error(t('packages_dag_task_form_error_name_duplicate')))
      } else {
        callback()
      }
    } catch {
      callback()
    }
  }
}

function validatePrefix(rule: any, value: string, callback: any) {
  value = value.trim()
  if (!value) {
    callback(new Error(t('public_form_not_empty')))
  } else if (!/\w+/.test(value)) {
    callback(new Error(t('packages_business_data_server_drawer_geshicuowu')))
  } else {
    callback()
  }
}

function validateCrontabExpression(rule: any, value: string, callback: any) {
  value = value.trim()
  if (!value) {
    callback(new Error(t('public_form_not_empty')))
  } else if (!validateCron(value)) {
    callback(t('packages_dag_migration_settingpanel_cronbiao'))
  } else {
    callback()
  }
}

function getSmartPrefix(connectionName: string) {
  connectionName = connectionName
    .replaceAll(/[\u4E00-\u9FA5\s]+/g, '')
    .replace(/^[-_]+/, '')
  const planA = connectionName.split('_').shift() || ''
  const planB = connectionName.split('-').shift() || ''

  return (planA.length < planB.length ? planA : planB).slice(0, 5)
}

function open(from: any, tableName: string | null) {
  const connectionId = from?.id

  taskDialogConfig.value.from = from
  taskDialogConfig.value.tableName = tableName

  taskDialogConfig.value.prefix = getSmartPrefix(from.name)
  taskDialogConfig.value.visible = true
  form.value?.resetFields()

  // 读取缓存
  if (prefixMap.value[connectionId]) {
    taskDialogConfig.value.prefix = prefixMap.value[connectionId]
  }

  taskDialogConfig.value.task.crontabExpressionFlag = false
  taskDialogConfig.value.task.crontabExpression = ''

  const capbilitiesMap = from.capabilities.reduce((map: any, item: any) => {
    map[item.id] = true
    return map
  }, {})

  if (
    !capbilitiesMap.stream_read_function &&
    !capbilitiesMap.raw_data_callback_filter_function &&
    !capbilitiesMap.raw_data_callback_filter_function_v2 &&
    (!capbilitiesMap.query_by_advance_filter_function ||
      !capbilitiesMap.batch_read_function)
  ) {
    taskDialogConfig.value.notSupportedCDC = true
    taskDialogConfig.value.task.type = 'initial_sync'
  } else {
    taskDialogConfig.value.notSupportedCDC = false
  }

  checkCanStart()
}

async function checkCanStart() {
  taskDialogConfig.value.canStart = false
  taskDialogConfig.value.tableNames = []
  checkCanStartIng.value = true
  const tag = treeData.value.find(
    (item: any) => item.linkId === taskDialogConfig.value.from.id,
  )
  const task = tag2Task.value[tag?.id]

  if (task) {
    taskDialogConfig.value.task.type = task.type
    taskDialogConfig.value.task.crontabExpressionFlag =
      task.crontabExpressionFlag
    taskDialogConfig.value.task.crontabExpression = task.crontabExpression

    const { sourceNode, renameNode } = task

    if (sourceNode) {
      taskDialogConfig.value.tableNames = sourceNode.tableNames
      if (sourceNode.tableNames?.length) {
        syncedAlertTitle.value = t('packages_ldp_fdm_create_task_has_synced')
      }

      if (sourceNode.migrateTableSelectType === 'expression') {
        syncedAlertTitle.value = t(
          'packages_ldp_fdm_create_task_has_expression',
        )
      }
    }

    if (renameNode && renameNode.prefix) {
      taskDialogConfig.value.prefix = renameNode.prefix
        .replace(new RegExp(`^${fixedPrefix.value}`), '')
        .replace(/_$/, '')
    }

    taskDialogConfig.value.canStart = await ldpApi.checkCanStartByTag(tag.id)
  } else {
    taskDialogConfig.value.canStart = true
    syncedAlertTitle.value = ''
  }

  checkCanStartIng.value = false
}

function getSourceNode(from: any, tableName: string) {
  const source = getDatabaseNode(from)

  Object.assign(
    source,
    tableName
      ? {
          migrateTableSelectType: 'custom',
          tableNames: [tableName],
        }
      : {
          migrateTableSelectType:
            taskDialogConfig.value.migrateTableSelectType || 'custom',
          tableNames: taskDialogConfig.value.tableNames,
          noPrimaryKeyTableSelectType:
            taskDialogConfig.value.noPrimaryKeyTableSelectType,
        },
  )

  return source
}

function getTaskName(from: any) {
  return `${from.name}_Clone_To_FDM_${generateId(6)}`
}

function getDatabaseNode(db: any) {
  return {
    id: uuid(),
    type: 'database',
    name: db.name,
    connectionId: db.id,
    databaseType: db.database_type,
    attrs: {
      connectionName: db.name,
      connectionType: db.connection_type,
      accessNodeProcessId: db.accessNodeProcessId,
      pdkType: db.pdkType,
      pdkHash: db.pdkHash,
      capabilities: db.capabilities || [],
    },
  }
}

const useDmlPolicy = (db: any) => {
  const capabilities = db.capabilities || []
  let insertPolicy
  let updatePolicy
  let deletePolicy

  const dmlPolicy = {
    insertPolicy: 'update_on_exists',
    updatePolicy: 'ignore_on_nonexists',
    deletePolicy: 'ignore_on_nonexists',
  }

  const enumMap = {
    insertPolicy: ['update_on_exists', 'ignore_on_exists', 'just_insert'],
    updatePolicy: [
      'ignore_on_nonexists',
      'insert_on_nonexists',
      'log_on_nonexists',
    ],
    deletePolicy: ['ignore_on_nonexists', 'log_on_nonexists'],
  }

  if (capabilities) {
    insertPolicy = capabilities.find(
      ({ id }: any) => id === 'dml_insert_policy',
    )
    updatePolicy = capabilities.find(
      ({ id }: any) => id === 'dml_update_policy',
    )
    deletePolicy = capabilities.find(
      ({ id }: any) => id === 'dml_delete_policy',
    )
  }

  const func = (policy: any, policyField: string) => {
    if (policy && policy.alternatives?.length) {
      const values = enumMap[policyField as keyof typeof enumMap]
      const alternative = policy.alternatives.find((key) =>
        values.includes(key),
      )

      if (alternative) {
        dmlPolicy[policyField as keyof typeof dmlPolicy] = alternative
      }
    }
  }

  func(insertPolicy, 'insertPolicy')
  func(updatePolicy, 'updatePolicy')
  func(deletePolicy, 'deletePolicy')

  return dmlPolicy
}

function getTableReNameNode() {
  return {
    id: uuid(),
    type: 'table_rename_processor',
    name: t('packages_business_swimlane_fdm_biaobianji'),
    prefix: `${fixedPrefix.value}${taskDialogConfig.value.prefix}_`,
  }
}

function makeMigrateTask(from: any, tableName: string) {
  const source = getSourceNode(from, tableName)
  const target = getDatabaseNode(props.fdmConnection)
  const tableReNameNode = getTableReNameNode()

  target.dmlPolicy = useDmlPolicy(props.fdmConnection)

  return {
    ...TASK_SETTINGS,
    syncType: 'migrate',
    name: getTaskName(from),
    dag: {
      edges: [
        { source: source.id, target: tableReNameNode.id },
        { source: tableReNameNode.id, target: target.id },
      ],
      nodes: [source, tableReNameNode, target],
    },
  }
}

function openRoute(route: any, newTab = true) {
  if (newTab) {
    window.open(router.resolve(route).href)
  } else {
    router.push(route)
  }
}

function handleClickName(task: any) {
  if (!task?.id) return

  let routeName

  if (!['edit', 'wait_start'].includes(task.status)) {
    routeName = task.syncType === 'migrate' ? 'MigrationMonitor' : 'TaskMonitor'
  } else {
    routeName = task.syncType === 'migrate' ? 'MigrateEditor' : 'DataflowEditor'
  }

  openRoute({
    name: routeName,
    query: {
      tour: false, // TODO: get from store
    },
    params: {
      id: task.id,
    },
  })
}

function taskDialogSubmit(start: boolean) {
  form.value?.validate(async (valid: boolean) => {
    if (!valid) return

    if (!taskDialogConfig.value.tableNames.length) {
      ElMessage.error(t('packages_dag_select_table_tips'))
      return
    }

    const {
      tableName,
      from = {},
      task: settings,
      prefix,
    } = taskDialogConfig.value
    const task = Object.assign(makeMigrateTask(from, tableName), settings)
    // 缓存表名前缀
    prefixMap.value[from.id] = prefix
    creating.value = true

    try {
      const result = await ldpApi.createFDMTask(task, {
        silenceMessage: true,
        params: { start },
      })

      taskDialogConfig.value.visible = false

      ElMessage.success({
        message: h(
          'span',
          {
            class: 'color-primary fs-7 clickable',
            onClick: () => {
              handleClickName(result)
            },
          },
          t('packages_business_task_created_success'),
        ),
      })
    } catch (error: any) {
      console.log(error)
      let msg

      if (error?.data?.code === 'Task.ListWarnMessage' && error.data.data) {
        const keys = Object.keys(error.data.data)
        msg = error.data.data[keys[0]]?.[0]?.msg
      }

      ElMessage.error(
        msg || error?.data?.message || t('public_message_save_fail'),
      )
    }

    creating.value = false

    emit('success', taskDialogConfig.value.from.id, task)
  })
}

function handleChangeCronType(val: string) {
  if (val === 'once') {
    taskDialogConfig.value.task.crontabExpressionFlag = false
  } else {
    taskDialogConfig.value.task.crontabExpressionFlag = true
    if (val !== 'custom') {
      taskDialogConfig.value.task.crontabExpression = val
    }
  }
}

defineExpose({
  open,
})
</script>

<template>
  <ElDialog
    v-model="taskDialogConfig.visible"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <template #header>
      <span class="font-color-dark fs-6 fw-sub">{{
        $t('packages_business_create_clone_task')
      }}</span>
    </template>
    <ElForm
      ref="form"
      :model="taskDialogConfig"
      label-width="180px"
      :rules="formRules"
      @submit.prevent
    >
      <div class="pipeline-desc p-4 mb-4 text-preline rounded-4">
        <span>{{
          $t('packages_business_fdm_create_task_dialog_desc_prefix')
        }}</span
        ><span
          v-if="taskDialogConfig.from"
          class="inline-flex align-center px-1 font-color-dark fw-sub align-top"
        >
          <DatabaseIcon
            :key="taskDialogConfig.from.pdkHash"
            :pdk-hash="taskDialogConfig.from.pdkHash"
            :item="taskDialogConfig.from"
            :size="20"
            class="mr-1"
          />
          <span>{{ taskDialogConfig.from.name }}</span> </span
        ><span
          v-if="taskDialogConfig.tableName"
          class="inline-flex font-color-dark fw-sub"
          >/<span class="px-1">{{ taskDialogConfig.tableName }}</span> </span
        ><span>{{
          $t('packages_business_fdm_create_task_dialog_desc_suffix')
        }}</span>
      </div>

      <ElFormItem :label="$t('packages_business_table_prefix')" prop="prefix">
        <ElInput
          v-model="taskDialogConfig.prefix"
          :maxlength="maxPrefixLength"
          class="inline-flex inline-flex-input"
        >
          <template #prepend>{{ fixedPrefix }}</template>
          <template #append>
            <span
              v-if="taskDialogConfig.tableName"
              :title="taskDialogConfig.tableName"
            >
              _{{ taskDialogConfig.tableName }}
            </span>
            <span v-else> _&lt;original_table_name&gt; </span>
          </template>
        </ElInput>
      </ElFormItem>

      <ElFormItem
        :label="$t('packages_dag_task_setting_sync_type')"
        prop="task.type"
      >
        <ElRadioGroup v-model="taskDialogConfig.task.type">
          <ElTooltip
            :disabled="!taskDialogConfig.notSupportedCDC"
            :content="$t('packages_ldp_not_support_increments')"
          >
            <ElRadio
              label="initial_sync+cdc"
              :disabled="taskDialogConfig.notSupportedCDC"
            >
              {{ $t('packages_dag_task_setting_initial_sync_cdc') }}
            </ElRadio>
          </ElTooltip>

          <ElRadio label="initial_sync">
            {{ $t('public_task_type_initial_sync') }}
          </ElRadio>
        </ElRadioGroup>
      </ElFormItem>

      <div
        v-if="taskDialogConfig.task.type === 'initial_sync'"
        class="flex align-center gap-3"
      >
        <ElFormItem
          class="w-100"
          :label="$t('packages_dag_task_setting_crontabExpressionFlag')"
          prop="task.crontabExpressionType"
        >
          <ElSelect
            v-model="taskDialogConfig.task.crontabExpressionType"
            class="flex-1"
            @change="handleChangeCronType"
          >
            <ElOption v-for="(opt, i) in cronOptions" v-bind="opt" :key="i" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem
          v-if="taskDialogConfig.task.crontabExpressionType === 'custom'"
          prop="task.crontabExpression"
          label-width="0"
        >
          <ElInput v-model="taskDialogConfig.task.crontabExpression" />
        </ElFormItem>
      </div>

      <!-- <ElFormItem :label="$t('packages_dag_nodes_database_xuanzebiao')" prop="migrateTableSelectType">
            <el-radio-group v-model="taskDialogConfig.migrateTableSelectType">
                <el-radio value="custom">{{ $t('packages_dag_nodes_database_anbiaomingxuanze') }}</el-radio>
                <el-radio value="expression">{{ $t('packages_dag_nodes_database_anzhengzebiaoda') }}</el-radio>
            </el-radio-group>
        </ElFormItem> -->

      <template
        v-if="
          !taskDialogConfig.tableName &&
          taskDialogConfig.migrateTableSelectType === 'custom'
        "
      >
        <el-form-item :label="$t('packages_dag_nodes_database_biaoxianshi')">
          <el-select v-model="taskDialogConfig.noPrimaryKeyTableSelectType">
            <el-option :label="$t('public_select_option_all')" value="All" />
            <el-option
              :label="$t('packages_dag_nodes_database_jinyouzhujianbiao')"
              value="HasKeys"
            />
            <el-option
              :label="$t('packages_dag_only_include_pk')"
              value="OnlyPrimaryKey"
            />
            <el-option
              :label="$t('packages_dag_only_include_uk')"
              value="OnlyUniqueIndex"
            />
            <el-option
              :label="$t('packages_dag_nodes_database_jinwuzhujianbiao')"
              value="NoKeys"
            />
          </el-select>
        </el-form-item>

        <div>
          <TableSelector
            v-model:value="taskDialogConfig.tableNames"
            class="w-100"
            style="max-height: 300px"
            :connection-id="taskDialogConfig.from.id"
            :filter-type="taskDialogConfig.noPrimaryKeyTableSelectType"
          >
            <template #right-item="{ row }">
              <span>{{
                `${fixedPrefix}${taskDialogConfig.prefix}_${row}`
              }}</span>
            </template>
          </TableSelector>
        </div>
      </template>
    </ElForm>
    <el-alert
      v-if="!taskDialogConfig.tableName && syncedAlertTitle"
      class="mt-4"
      :closable="false"
      :title="syncedAlertTitle"
      type="info"
      show-icon
    />
    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="taskDialogConfig.visible = false">{{
          $t('public_button_cancel')
        }}</ElButton>
        <ElButton
          :disabled="taskDialogConfig.migrateTableSelectType === 'expression'"
          :loading="creating"
          @click="taskDialogSubmit(false)"
          >{{ $t('packages_business_save_only') }}</ElButton
        >
        <ElButton
          :loading="creating || checkCanStartIng"
          :disabled="
            !taskDialogConfig.canStart ||
            taskDialogConfig.migrateTableSelectType === 'expression'
          "
          type="primary"
          @click="taskDialogSubmit(true)"
        >
          {{ $t('packages_business_save_and_run_now') }}
        </ElButton>
      </span>
    </template>
  </ElDialog>
</template>
