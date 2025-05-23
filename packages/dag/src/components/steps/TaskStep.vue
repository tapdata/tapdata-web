<script setup lang="ts">
import { createEffectHook, createForm, onFieldValueChange } from '@formily/core'

import { taskApi } from '@tap/api'
import i18n from '@tap/i18n'
import { debounce } from 'lodash-es'
import { inject, onBeforeUnmount, ref, shallowRef } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import SchemaForm from '../SchemaForm.vue'

// 自定义 Dialog 表单内的 value 变化事件
const onDialogFormValuesChange = createEffectHook(
  'dialog-form-values-change',
  (payload, form) => (listener) => {
    listener(payload, form)
  },
)

const store = useStore()

// Router
const router = useRouter()

// Props & Emits
const emit = defineEmits(['prev', 'next'])

// Injections
const taskRef = inject('task')
const pageVersionRef = inject('pageVersion')
const isGuide = inject('isGuide')
// const transformLoading = inject(TransformLoadingSymbol)

// State
const form = shallowRef(null)
const starting = ref(false)

const schema = {
  type: 'object',
  properties: {
    name: {
      title: i18n.t('public_task_name'), //任务名称
      type: 'string',
      required: true,
      'x-decorator': 'FormItem',
      'x-component': 'Input',
      // 'x-validator': `{{(value) => {
      //           return new Promise((resolve) => {
      //             checkName(value).then(data => {
      //               if(data === true) {
      //                 resolve('${repeatNameMessage}')
      //               } else {
      //                 resolve()
      //               }
      //             })
      //           })
      //         }}}`
    },
    type: {
      title: i18n.t('packages_dag_task_setting_sync_type'),
      type: 'string',
      'x-decorator': 'FormItem',
      'x-component': 'Radio.Group',
      default: 'initial_sync+cdc',
      enum: [
        {
          label: i18n.t('packages_dag_task_setting_initial_sync_cdc'), //全量+增量
          value: 'initial_sync+cdc',
        },
        {
          label: i18n.t('public_task_type_initial_sync'), //全量
          value: 'initial_sync',
        },
        {
          label: i18n.t('public_task_type_cdc'), //增量
          value: 'cdc',
        },
      ],
    },

    // 目标节点
    'dag.nodes.3': {
      type: 'object',
      properties: {
        existDataProcessMode: {
          type: 'string',
          title: i18n.t('packages_dag_nodes_database_chongfuchulice'),
          default: 'keepData',
          enum: [
            {
              label: i18n.t('packages_dag_nodes_database_baochimubiaoduan'),
              value: 'keepData',
            },
            {
              label: i18n.t('packages_dag_nodes_database_qingchumubiaoduan'),
              value: 'dropTable',
              disabled: true,
            },
            {
              label: i18n.t(
                'packages_dag_nodes_targetdatabase_baochimubiaoduan',
              ),
              value: 'removeData',
            },
          ],
          'x-decorator': 'FormItem',
          'x-component': 'Radio.Group',
          'x-reactions': {
            fulfill: {
              run: '{{$self.dataSource[1].disabled = $self.dataSource[2].disabled = $values.type === "cdc"}}',
              state: {
                description: `{{$values.type === "cdc" ? '${i18n.t(
                  'packages_dag_nodes_database_setting_cdc_changjing_desc',
                )}':''}}`,
              },
              schema: {
                // TODO 根据能力改变dataSource
                'x-component-props.options': `{{options=[$self.dataSource[0]],$values.dag.nodes[3].attrs.capabilities.find(item => item.id ==='drop_table_function') && options.push($self.dataSource[1]),$values.dag.nodes[3].attrs.capabilities.find(item => item.id ==='clear_table_function') && options.push($self.dataSource[2]),options}}`,
              },
            },
          },
        },
      },
    },

    // 源节点
    'dag.nodes.0': {
      title: i18n.t('packages_dag_task_setting_sync_type'),
      type: 'object',
      'x-decorator': 'FormItem',
      'x-component': 'SourceDatabaseNode',
    },

    'dag.nodes.0.migrateTableSelectType': {
      title: i18n.t('packages_dag_nodes_database_xuanzebiao'),
      type: 'string',
      default: 'custom',
      'x-display': 'hidden',
    },
  },
}

const scope = {
  checkName: (value) => {
    return new Promise((resolve) => {
      handleCheckName(resolve, value)
    })
  },

  findNodeById: (id) => {
    return store.state.dataflow.NodeMap[id]
  },

  findParentNodes: (id, ifMyself) => {
    const node = scope.findNodeById(id)
    const parents = []

    if (!node) return parents

    const parentIds = node.$inputs || []
    if (ifMyself && !parentIds.length) return [node]
    parentIds.forEach((pid) => {
      const parent = scope.findNodeById(pid)
      if (parent) {
        if (parent.$inputs?.length) {
          parent.$inputs.forEach((ppid) => {
            parents.push(...scope.findParentNodes(ppid, true))
          })
        } else {
          parents.push(parent)
        }
      }
    })

    return parents
  },
}

// Methods
const handleCheckName = debounce(
  (resolve: (value: boolean) => void, value: string) => {
    taskApi.checkName({ name: value }).then((data) => resolve(data))
  },
  500,
)

const onTaskChange = debounce(async () => {
  const data = await taskApi.patch(
    {
      ...taskRef.value,
      pageVersion: pageVersionRef.value,
    },
    {
      silenceMessage: true,
    },
  )

  taskRef.value.editVersion = data.editVersion
}, 100)

const initForm = () => {
  const task = taskRef.value
  scope.$taskId = task.id
  form.value = createForm({
    values: task,
  })

  console.log('task', task)

  setTimeout(() => {
    form.value.addEffects('watchForm', () => {
      onFieldValueChange('*', () => {
        onTaskChange()
      })

      onDialogFormValuesChange((payload, form) => {
        onTaskChange()
        console.log('onDialogFormValuesChange')
      })
    })
  }, 100)
}

const handlePrev = () => {
  emit('prev')
}

const handleNext = async () => {
  await form.value.validate()
  emit('next')
}

const handleStart = async () => {
  starting.value = true

  try {
    await form.value.validate()
    await TaskApi.saveAndStart(taskRef.value, {
      silenceMessage: true,
    })

    migrateStore.setGuideComplete()
    router.push({
      name: 'MigrationMonitorSimple',
      params: {
        id: taskRef.value.id,
      },
    })
  } catch {
    message.error('Failed to start task')
  } finally {
    starting.value = false
  }
}

// Lifecycle
onBeforeUnmount(() => {
  form.value?.onUnmount()
})

// Initialize
initForm()

/* export default defineComponent({
  name: 'TaskStep',
  components: {
    SchemaForm,
  },
  setup(props, { emit, root }) {
    const repeatNameMessage = i18n.t(
      'packages_dag_task_form_error_name_duplicate',
    )
    const handleCheckName = debounce(function (resolve, value) {
      taskApi
        .checkName({
          name: value,
          // id
        })
        .then((data) => {
          resolve(data)
        })
    }, 500)
    const taskRef = inject('task')
    const pageVersionRef = inject('pageVersion')
    const isGuide = inject('isGuide')
    const form = ref(null)
    const starting = ref(false)

    console.log('taskRef', taskRef)

    const onTaskChange = debounce(async () => {
      const data = await taskApi.patch(
        {
          ...taskRef.value,
          // id: taskRef.value.id,
          // editVersion: taskRef.value.editVersion,
          pageVersion: pageVersionRef.value,
          // dag: taskRef.value.dag
        },
        {
          silenceMessage: true,
        },
      )

      // 防止触发 FormValuesChange
      // const rawObj = raw(taskRef.value)
      taskRef.value.editVersion = data.editVersion

      console.log('onTaskChange')
    }, 100)

    const initForm = () => {
      const task = taskRef.value
      scope.$taskId = task.id
      form.value = createForm({
        values: task,
      })

      // 防止挂载表单时触发valueChange
      setTimeout(() => {
        form.value.addEffects('watchForm', () => {
          onFieldValueChange('*', (field) => {
            onTaskChange()
            console.log('onFieldValueChange', field)
          })

          onDialogFormValuesChange((payload, form) => {
            onTaskChange()
            console.log('onDialogFormValuesChange')
          })
        })
      }, 100)
    }

    initForm()

    const handlePrev = () => {
      emit('prev')
    }

    const handleNext = async () => {
      await form.value.validate()
      emit('next')
    }

    const start = async () => {
      this.buried('migrationStart')

      this.unWatchStatus?.()
      this.unWatchStatus = this.$watch('dataflow.status', (v) => {
        if (
          ['error', 'complete', 'running', 'stop', 'schedule_failed'].includes(
            v,
          )
        ) {
          this.$refs.console?.loadData()
          if (v !== 'running') {
            this.$refs.console?.stopAuto()
          } else {
            this.toggleConsole(false)
            this.gotoViewer(false)
          }
          // this.unWatchStatus()
        }
        if (['MigrateViewer'].includes(this.$route.name)) {
          if (['renewing'].includes(v)) {
            this.handleConsoleAutoLoad()
          } else {
            this.toggleConsole(false)
          }
        }
      })

      const hasError = await this.$refs.skipError.checkError(this.dataflow)
      if (hasError) return

      const flag = await this.save(true)
      if (flag) {
        this.dataflow.disabledData.edit = true
        this.dataflow.disabledData.start = true
        this.dataflow.disabledData.stop = true
        this.dataflow.disabledData.reset = true
        // this.gotoViewer()
        this.beforeStartTask()
        this.buried('taskSubmit', { result: true })
      } else {
        this.buried('taskSubmit', { result: false })
      }
    }

    const handleStart = async () => {
      starting.value = true
      await form.value.validate()

      let isOk = false
      try {
        await taskApi.saveAndStart(taskRef.value, {
          silenceMessage: true,
        })

        isOk = true

        store.dispatch('setGuideComplete')

        root.$router.push({
          name: 'MigrationMonitorSimple',
          params: {
            id: taskRef.value.id,
          },
        })
      } catch {
        // this.handleError(e)
      } finally {
        starting.value = false
      }
    }

    onBeforeUnmount(() => {
      form.value.onUnmount()
    })

    return {
      form,
      schema,
      scope,
      starting,
      isGuide,

      handlePrev,
      handleNext,
      handleStart,
    }
  },
}) */
</script>

<template>
  <div
    class="position-relative flex flex-column gap-4 h-100 min-h-0 overflow-y-auto"
  >
    <div class="p-4 bg-white rounded-lg">
      <div class="title-prefix-bar mb-4">
        {{ $t('public_configuration_task') }}
      </div>
      <SchemaForm :form="form" :schema="schema" :scope="scope" />
    </div>

    <div
      class="step-footer flex align-center position-sticky z-index bottom-0 p-4 mt-auto border backdrop-filter-light z-10 rounded-lg"
    >
      <el-button @click="handlePrev">{{
        $t('public_button_previous')
      }}</el-button>
      <el-button
        v-if="isGuide"
        :loading="starting"
        type="primary"
        @click="handleStart"
        >{{ $t('packages_business_task_start_task') }}</el-button
      >
      <el-button
        v-else
        :loading="starting"
        type="primary"
        @click="handleNext"
        >{{ $t('public_button_next') }}</el-button
      >
      <el-divider class="mx-4" direction="vertical" />
      <slot name="help" />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
