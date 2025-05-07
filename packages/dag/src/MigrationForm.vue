<script setup lang="ts">
import { observable } from '@formily/reactive'
import { taskApi } from '@tap/api'
import { makeStatusAndDisabled } from '@tap/business'
import { VIcon } from '@tap/component'
import { computed as reactiveComputed } from '@tap/form'
import i18n from '@tap/i18n'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import {
  defineComponent,
  getCurrentInstance,
  nextTick,
  provide,
  ref,
} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import AdvancedSettingsStep from './components/steps/AdvancedSettingsStep.vue'
import SourceStep from './components/steps/SourceStep.vue'
import TargetStep from './components/steps/TargetStep.vue'
import TaskStep from './components/steps/TaskStep.vue'
import { DEFAULT_SETTINGS } from './constants'
import { genDatabaseNode, genProcessorNode } from './util'

// Types
interface Task {
  id: string
  name: string
  status: string
  editVersion: string
  dag: {
    nodes: any[]
    edges: any[]
  }
  [key: string]: any
}

const store = useStore()

console.log('storexx', store)

// Router
const router = useRouter()
const route = useRoute()

// State
const loading = ref(false)
const currentStep = ref(0)
const sourceNodeRef = ref(null)
const targetNodeRef = ref(null)
const hasTask = ref(false)
const pageVersion = ref(Date.now().toString())
const isGuide = ref(route.name === 'WelcomeTask')
const taskSaving = ref(false)
const transformLoading = ref(false)

const instance = getCurrentInstance()

const formScope = {
  checkName: (value: string) => {
    return new Promise((resolve) => {
      taskApi.checkName({ name: value }).then((data) => resolve(data))
    })
  },

  findNodeById: (id: string) => {
    return store.state.dataflow.NodeMap[id]
  },

  findParentNodes: (id: string, ifMyself?: boolean) => {
    const node = formScope.findNodeById(id)
    const parents: any[] = []

    if (!node) return parents

    const parentIds = node.$inputs || []
    if (ifMyself && !parentIds.length) return [node]

    parentIds.forEach((pid: string) => {
      const parent = formScope.findNodeById(pid)
      if (parent) {
        if (parent.$inputs?.length) {
          parent.$inputs.forEach((ppid: string) => {
            parents.push(...formScope.findParentNodes(ppid, true))
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
const patchTask = async () => {
  taskSaving.value = true
  const data = await taskApi.patch(
    {
      id: taskRef.value!.id,
      editVersion: taskRef.value!.editVersion,
      pageVersion: pageVersion.value,
      dag: taskRef.value!.dag,
    },
    {
      silenceMessage: true,
    },
  )

  taskRef.value!.editVersion = data.editVersion
  taskSaving.value = false
}

const onSourceNext = async () => {
  await patchTask()
}

const onTargetNext = async () => {
  await patchTask()
}

const prevStep = () => {
  currentStep.value -= 1
}

const nextStep = async (silent?: boolean) => {
  if (!silent && steps.value[currentStep.value]?.onNext) {
    await steps.value[currentStep.value].onNext()
  }

  currentStep.value += 1
  store.dispatch('setGuideStep', currentStep.value)
}

const handlePageReturn = () => {
  router.push({ name: 'Migrate' })
}

const richDag = ({ edges, nodes }: { edges: any[]; nodes: any[] }) => {
  if (!nodes?.length) return {}

  const outputsMap: Record<string, string[]> = {}
  const inputsMap: Record<string, string[]> = {}

  edges.forEach(({ source, target }) => {
    if (!outputsMap[source]) {
      outputsMap[source] = [target]
    } else {
      outputsMap[source].push(target)
    }

    if (!inputsMap[target]) {
      inputsMap[target] = [source]
    } else {
      inputsMap[target].push(source)
    }
  })

  const nodeTypeMap: Record<string, any> = {}

  nodes.forEach((node) => {
    node.$inputs = inputsMap[node.id] || []
    node.$outputs = outputsMap[node.id] || []

    if (node.type === 'database') {
      if (!node.$inputs.length) {
        nodeTypeMap.source = node
      } else if (!node.$outputs.length) {
        nodeTypeMap.target = node
      }
    } else {
      nodeTypeMap[node.type] = node
    }
  })

  return {
    nodes: [
      nodeTypeMap.source,
      nodeTypeMap.table_rename_processor,
      nodeTypeMap.migrate_field_rename_processor,
      nodeTypeMap.target,
    ],
    edges,
  }
}

const richTask = (data: Task) => {
  makeStatusAndDisabled(data)

  if (data.status === 'edit') {
    data.btnDisabled.start = false
  }

  if (data.currentEventTimestamp) {
    data.currentEventTimestampLabel = dayjs(data.currentEventTimestamp).format(
      'YYYY-MM-DD HH:mm:ss',
    )
  }

  data.dag = richDag(data.dag)

  return data
}

const getTask = async (id) => {
  try {
    const { parent_task_sign } = route.query || {}
    const data = await taskApi.get(id, null, { parent_task_sign })

    if (
      !data ||
      ['deleted', 'deleting', 'delete_failed'].includes(data.status)
    ) {
      ElMessage.error('Task not found')
      handlePageReturn()
      return
    }

    data.dag = data.temp || data.dag
    data.syncType = data.shareCache ? 'shareCache' : data.syncType

    // this.reformDataflow(data)
    // this.startLoopTask(id)
    // this.titleSet()

    return data
  } catch (error) {
    console.error(error)
    ElMessage.error('Error loading task')
    handlePageReturn()
  }
}

const genTaskName = async (source: string) => {
  const taskNames = await taskApi.get({
    filter: JSON.stringify({
      limit: 99999999,
      fields: { name: 1 },
      where: { name: { like: `^${source}\\d+$` } },
    }),
  })
  let def = 1
  if (taskNames?.items.length) {
    const arr = [0]
    taskNames.items.forEach((item) => {
      const res = item.name.match(new RegExp(`^${source}(\\d+)$`))
      if (res && res[1]) arr.push(+res[1])
    })
    arr.sort((a, b) => a - b)
    def = arr.pop() + 1
  }
  return `${source}${def}`
}

const genTask = async (base, name) => {
  if (!name) {
    name = await genTaskName(`${i18n.t('public_task')} `)
  }

  base.name = name

  let newTask

  try {
    newTask = await taskApi.post(base)
  } catch (error) {
    if (error?.data?.code === 'Task.RepeatName') {
      const newName = await genTaskName(base.name)
      newTask = await genTask(base, newName)
    } else if (error?.data?.code === 'InvalidPaidPlan') {
      router.push({
        name: 'migrateList',
      })
    }
  }

  return newTask
}

const steps = ref([
  {
    title: i18n.t('public_create_source_connection'),
    component: SourceStep,
    props: {
      type: 'source',
    },
    onNext: onSourceNext,
  },
  {
    title: i18n.t('public_create_target_connection'),
    component: SourceStep,
    props: {
      type: 'target',
    },
    onNext: onTargetNext,
  },
  {
    title: i18n.t('public_configuration_task'),
    component: TaskStep,
  },
  {
    title: i18n.t('packages_business_task_start_task'),
    component: SourceStep,
  },
])

// Add advanced settings step if not in guide mode
if (!isGuide.value) {
  steps.value.splice(-1, 0, {
    title: i18n.t('packages_dag_task_stetting_basic_setting'),
    component: AdvancedSettingsStep,
  })
}

const getNewTask = async () => {
  const sourceNode = genDatabaseNode()
  const targetNode = genDatabaseNode()
  const tableEditNode = genProcessorNode('table_rename_processor', {
    name: 'Table Editor',
  })
  const fieldEditNode = genProcessorNode('migrate_field_rename_processor', {
    name: 'Field Editor',
  })

  const dag = richDag({
    edges: [
      {
        source: sourceNode.id,
        target: tableEditNode.id,
      },
      {
        source: tableEditNode.id,
        target: fieldEditNode.id,
      },
      {
        source: fieldEditNode.id,
        target: targetNode.id,
      },
    ],
    nodes: [sourceNode, tableEditNode, fieldEditNode, targetNode],
  })

  const task = {
    ...DEFAULT_SETTINGS,
    name: '',
    attrs: {
      editorType: 'form',
    },
    status: '',
    dag,
  }

  const newTask = await genTask(task)

  if (newTask) {
    await router.replace({
      name: 'MigrateForm',
      params: { id: newTask.id },
      query: {
        ...route.query,
      },
    })
  }

  return newTask
}

const taskObs = observable({})
const taskRef = reactiveComputed(() => {
  return taskObs
})

// Initialize task
const initTask = async () => {
  const { id } = route.params
  let task: Task

  if (id) {
    task = await getTask(id)
  } else {
    task = await getNewTask()
    if (route.name === 'WelcomeTask') {
      store.dispatch('setGuideTask', task.id)
    }
  }

  task = richTask(task)

  Object.assign(taskObs, task)

  formScope.$taskId = task.id
  sourceNodeRef.value = taskRef.value.dag.nodes[0]
  targetNodeRef.value = taskRef.value.dag.nodes[3]

  hasTask.value = true

  if (!sourceNodeRef.value.connectionId) {
    currentStep.value = 0
  } else if (!targetNodeRef.value.connectionId) {
    currentStep.value = 1
  } else {
    currentStep.value = 2
  }

  initWS()
}

const initWS = () => {
  instance.proxy.$ws.off('editFlush', handleEditFlush)
  instance.proxy.$ws.on('editFlush', handleEditFlush)
  instance.proxy.$ws.send({
    type: 'editFlush',
    taskId: taskRef.value.id,
    data: {
      opType: 'subscribe',
    },
  })
}

const handleEditFlush = (result) => {
  transformLoading.value = !result.data.transformed
}

// Provide values for child components
provide('currentStep', currentStep)
provide('task', taskRef)
provide('source', sourceNodeRef)
provide('target', targetNodeRef)
provide('pageVersion', pageVersion)
provide('isGuide', isGuide)

// provide(TaskSavingSymbol, taskSaving)
// provide(TransformLoadingSymbol, transformLoading)

// Initialize
initTask()

/* export default defineComponent({
  name: 'MigrationForm',

  components: { VIcon, SourceStep, TargetStep, TaskStep },

  props: {
    editRouteName: {
      type: String,
      default: 'MigrateForm',
    },
  },

  setup(props) {
    const router = useRouter()
    const route = useRoute()
    const store = useStore()
    const instance = getCurrentInstance()
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
    const formScope = {
      checkName: (value) => {
        return new Promise((resolve) => {
          handleCheckName(resolve, value)
        })
      },

      findNodeById: (id) => {
        return store.state.dataflow.NodeMap[id]
      },

      findParentNodes: (id, ifMyself) => {
        const node = formScope.findNodeById(id)
        const parents = []

        if (!node) return parents

        const parentIds = node.$inputs || []
        if (ifMyself && !parentIds.length) return [node]
        parentIds.forEach((pid) => {
          const parent = formScope.findNodeById(pid)
          if (parent) {
            if (parent.$inputs?.length) {
              parent.$inputs.forEach((ppid) => {
                parents.push(...formScope.findParentNodes(ppid, true))
              })
            } else {
              parents.push(parent)
            }
          }
        })

        return parents
      },
    }
    const loading = ref(false)
    const currentStep = ref(0)

    const pageVersion = ref(Date.now().toString())

    const patchTask = async () => {
      const data = await taskApi.patch(
        {
          id: taskRef.value.id,
          editVersion: taskRef.value.editVersion,
          pageVersion: pageVersion.value,
          dag: taskRef.value.dag,
        },
        {
          silenceMessage: true,
        },
      )

      taskRef.value.editVersion = data.editVersion
    }

    const onSourceNext = async () => {
      await patchTask()
    }

    const onTargetNext = async () => {
      await patchTask()
    }

    const isGuide = ref(route.name === 'WelcomeTask')

    const steps = ref([
      {
        title: i18n.t('public_create_source_connection'),
        component: SourceStep,
        props: {
          type: 'source',
        },
        onNext: onSourceNext,
      },
      {
        title: i18n.t('public_create_target_connection'),
        component: SourceStep,
        props: {
          type: 'target',
        },
        onNext: onTargetNext,
      },
      {
        title: i18n.t('public_configuration_task'),
        component: TaskStep,
      },
      {
        title: i18n.t('packages_business_task_start_task'),
        component: SourceStep,
      },
    ])

    if (!isGuide.value) {
      steps.value.splice(-1, 0, {
        title: i18n.t('packages_dag_task_stetting_basic_setting'),
        component: AdvancedSettingsStep,
      })
    }

    let taskRef = ref(null)
    const sourceNodeRef = ref(null)
    const targetNodeRef = ref(null)
    const hasTask = ref(false)

    const prevStep = () => {
      currentStep.value -= 1
    }

    const nextStep = async (slient) => {
      if (!slient && steps.value[currentStep.value]?.onNext) {
        await steps.value[currentStep.value].onNext()
      }

      currentStep.value += 1

      store.dispatch('setGuideStep', currentStep.value)
    }

    const handlePageReturn = () => {
      router.push({
        name: 'migrateList',
      })
      window.name = null
    }

    const richDag = ({ edges, nodes }) => {
      if (!nodes?.length) return {}
      const outputsMap = {}
      const inputsMap = {}

      edges.forEach(({ source, target }) => {
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

      const nodeTypeMap = {}

      nodes.forEach((node) => {
        node.$inputs = inputsMap[node.id] || []
        node.$outputs = outputsMap[node.id] || []

        if (node.type === 'database') {
          if (!node.$inputs.length) {
            nodeTypeMap.source = node
          } else if (!node.$outputs.length) {
            nodeTypeMap.target = node
          }
        } else {
          nodeTypeMap[node.type] = node
        }
      })

      console.log('nodeTypeMap', nodeTypeMap)

      return {
        nodes: [
          nodeTypeMap.source,
          nodeTypeMap.table_rename_processor,
          nodeTypeMap.migrate_field_rename_processor,
          nodeTypeMap.target,
        ],
        edges,
      }
    }

    const richTask = (data) => {
      makeStatusAndDisabled(data)

      if (data.status === 'edit') data.btnDisabled.start = false // 任务编辑中，在编辑页面可以启动

      if (data.currentEventTimestamp) {
        data.currentEventTimestampLabel = dayjs(
          data.currentEventTimestamp,
        ).format('YYYY-MM-DD HH:mm:ss')
      }

      data.dag = richDag(data.dag)

      return data
    }

    const getTask = async (id) => {
      try {
        const { parent_task_sign } = route.query || {}
        const data = await taskApi.get(id, null, { parent_task_sign })

        if (
          !data ||
          ['deleted', 'deleting', 'delete_failed'].includes(data.status)
        ) {
          ElMessage.error(i18n.t('packages_dag_mixins_editor_renwubucunzai'))
          handlePageReturn()
          return
        }

        data.dag = data.temp || data.dag
        data.syncType = data.shareCache ? 'shareCache' : data.syncType

        // this.reformDataflow(data)
        // this.startLoopTask(id)
        // this.titleSet()

        return data
      } catch (error) {
        console.error(error)
        ElMessage.error(i18n.t('packages_dag_mixins_editor_renwujiazaichu'))
        handlePageReturn()
      }
    }

    const genTaskName = async (source) => {
      const taskNames = await taskApi.get({
        filter: JSON.stringify({
          limit: 99999999,
          fields: { name: 1 },
          where: { name: { like: `^${source}\\d+$` } },
        }),
      })
      let def = 1
      if (taskNames?.items.length) {
        const arr = [0]
        taskNames.items.forEach((item) => {
          const res = item.name.match(new RegExp(`^${source}(\\d+)$`))
          if (res && res[1]) arr.push(+res[1])
        })
        arr.sort((a, b) => a - b)
        def = arr.pop() + 1
      }
      return `${source}${def}`
    }

    const genTask = async (base, name) => {
      if (!name) {
        name = await genTaskName(`${i18n.t('public_task')} `)
      }

      base.name = name

      let newTask

      try {
        newTask = await taskApi.post(base)
      } catch (error) {
        if (error?.data?.code === 'Task.RepeatName') {
          const newName = await genTaskName(base.name)
          newTask = await genTask(base, newName)
        } else if (error?.data?.code === 'InvalidPaidPlan') {
          router.push({
            name: 'migrateList',
          })
        }
      }

      return newTask
    }

    const getNewTask = async () => {
      const sourceNode = genDatabaseNode()
      const targetNode = genDatabaseNode()
      const tableEditNode = genProcessorNode('table_rename_processor', {
        name: i18n.t('packages_dag_src_migrationeditor_biaobianji'),
      })
      const fieldEditNode = genProcessorNode('migrate_field_rename_processor', {
        name: i18n.t('packages_dag_src_migrationeditor_ziduanbianji'),
      })

      const dag = richDag({
        edges: [
          {
            source: sourceNode.id,
            target: tableEditNode.id,
          },
          {
            source: tableEditNode.id,
            target: fieldEditNode.id,
          },
          {
            source: fieldEditNode.id,
            target: targetNode.id,
          },
        ],
        nodes: [sourceNode, tableEditNode, fieldEditNode, targetNode],
      })

      const task = {
        ...DEFAULT_SETTINGS,
        name: '',
        attrs: {
          editorType: 'form',
        },
        status: '',
        dag,
      }

      const newTask = await genTask(task)

      if (newTask) {
        await router.replace({
          name: props.editRouteName,
          params: { id: newTask.id },
          query: {
            ...route.query,
          },
        })
      }

      return newTask
    }

    const handleEditFlush = (result) => {
      if (result.data) {
        if (result.data.id !== taskRef.value.id) {
          console.debug(
            i18n.t('packages_dag_mixins_editor_wsshoudaole'),
            result.data,
          )
          return
        }
        // reformDataflow(result.data, true)
        store.commit('dataflow/setTransformLoading', !result.data.transformed)
      }
    }

    const initWS = (task) => {
      instance.proxy.$ws.off('editFlush', handleEditFlush)
      instance.proxy.$ws.on('editFlush', handleEditFlush)
      instance.proxy.$ws.send({
        type: 'editFlush',
        taskId: task.id,
        data: {
          opType: 'subscribe',
        },
      })
    }

    const initTask = async () => {
      const { id } = route.params
      let task

      if (id) {
        task = await getTask(id)
      } else {
        task = await getNewTask()

        if (route.name === 'WelcomeTask') {
          store.dispatch('setGuideTask', task.id)
        }
      }

      task = richTask(task)

      formScope.$taskId = task.id
      taskRef.value = observable(task)
      sourceNodeRef.value = taskRef.value.dag.nodes[0]
      targetNodeRef.value = taskRef.value.dag.nodes[3]

      hasTask.value = true
      console.log('task', taskRef.value)

      initWS(task)

      if (!sourceNodeRef.value.connectionId) {
        currentStep.value = 0
      } else if (!targetNodeRef.value.connectionId) {
        currentStep.value = 1
      } else {
        currentStep.value = 2
      }
    }

    const openChat = () => {
      window.$zoho.salesiq.chat.start?.()
    }

    initTask()

    provide('currentStep', currentStep)
    provide('task', taskRef)
    provide('source', sourceNodeRef)
    provide('target', targetNodeRef)
    provide('pageVersion', pageVersion)
    provide('isGuide', isGuide)

    return {
      task: taskRef,
      hasTask,
      currentStep,
      steps,
      loading,
      formScope,

      // API
      prevStep,
      nextStep,
      openChat,
    }
  },
}) */
</script>

<template>
  <section class="migration-form-page flex flex-column h-100 gap-4">
    <div class="px-5 py-4 bg-white rounded-lg">
      <ElBreadcrumb class="breadcrumb" separator-class="el-icon-arrow-right">
        <ElBreadcrumbItem>{{
          $t('public_task_type_migrate')
        }}</ElBreadcrumbItem>
        <ElBreadcrumbItem>{{ $t('public_task_create') }}</ElBreadcrumbItem>
      </ElBreadcrumb>

      <el-divider class="my-4" />

      <el-steps class="form-steps gap-4" :active="currentStep">
        <el-step
          v-for="(step, index) in steps"
          :key="index"
          :title="step.title"
        />
      </el-steps>
    </div>

    <div v-if="hasTask" class="rounded-lg flex-1 min-h-0">
      <component
        :is="steps[currentStep].component"
        :key="currentStep"
        v-bind="steps[currentStep].props"
        @prev="prevStep"
        @next="nextStep"
      >
        <template #help>
          <el-button text type="primary" @click="openChat"
            ><VIcon class="mr-1 align-middle" size="18">customer</VIcon
            ><span class="align-middle">{{
              $t('public_need_help')
            }}</span></el-button
          >
        </template>
      </component>
    </div>
  </section>
</template>

<style scoped lang="scss">
.migration-form-page {
  // background-color: #f1f2f4;

  :deep(.form-steps) {
    .el-step {
      display: flex !important;
      align-items: center;
      overflow: hidden;
      .el-step__head {
        position: static;
        width: auto;
        &.is-process {
          color: #fff;
          border-color: map.get($color, primary);

          .el-step__icon {
            background-color: map.get($color, primary);
          }
        }
      }
      .el-step__main {
        overflow: hidden;
        padding-inline: 8px 16px;
        background-color: #fff;
        z-index: 1;
      }
      .el-step__title {
        line-height: 24px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        &.is-process {
          color: map.get($color, primary);
        }
      }
      .el-step__description {
        display: none;
      }
    }
  }

  .step-footer {
    > .el-divider:first-child {
      display: none;
    }
  }
}
</style>
