<template>
  <section class="migration-form-page flex flex-column h-100 gap-4">
    <div class="px-5 py-4 bg-white rounded-lg">
      <ElBreadcrumb class="breadcrumb" separator-class="el-icon-arrow-right">
        <ElBreadcrumbItem>{{ $t('public_task_type_migrate') }}</ElBreadcrumbItem>
        <ElBreadcrumbItem>{{ $t('public_task_create') }}</ElBreadcrumbItem>
      </ElBreadcrumb>

      <el-divider class="my-4"></el-divider>

      <el-steps class="form-steps gap-4" :active="currentStep">
        <el-step v-for="(step, index) in steps" :key="index" :title="step.title"></el-step>
      </el-steps>
    </div>

    <div class="rounded-lg flex-1 min-h-0" v-if="hasTask">
      <component
        :is="steps[currentStep].component"
        :key="currentStep"
        v-bind="steps[currentStep].props"
        @prev="prevStep"
        @next="nextStep"
      >
        <template #help>
          <el-button type="text"
            ><VIcon class="mr-1 align-middle" size="18">customer</VIcon
            ><span class="align-middle">我需要帮助</span></el-button
          >
        </template>
      </component>
    </div>
  </section>
</template>

<script>
import { defineComponent, ref, provide } from '@vue/composition-api'
import SourceStep from './components/steps/SourceStep.vue'
import TargetStep from './components/steps/TargetStep.vue'
import TaskStep from './components/steps/TaskStep.vue'
import { taskApi } from '@tap/api'
import i18n from '@tap/i18n'
import { makeStatusAndDisabled } from '@tap/business'
import dayjs from 'dayjs'
import { debounce } from 'lodash'
import { genDatabaseNode, genProcessorNode } from './util'
import { observable } from '@formily/reactive'
import { DEFAULT_SETTINGS } from './constants'
import { computed as reactiveComputed } from '@tap/form'
import { observer } from '@formily/vue'
import { VIcon } from '@tap/component'

export default defineComponent({
  name: 'MigrationForm',

  props: {
    editRouteName: {
      type: String,
      default: 'MigrateForm'
    }
  },

  components: { VIcon, SourceStep, TargetStep, TaskStep },

  setup(props, { root }) {
    const handleCheckName = debounce(function (resolve, value) {
      taskApi
        .checkName({
          name: value
          // id
        })
        .then(data => {
          resolve(data)
        })
    }, 500)
    const formScope = {
      checkName: value => {
        return new Promise(resolve => {
          handleCheckName(resolve, value)
        })
      },

      findNodeById: id => {
        return root.$store.state.dataflow.NodeMap[id]
      },

      findParentNodes: (id, ifMyself) => {
        let node = formScope.findNodeById(id)
        const parents = []

        if (!node) return parents

        let parentIds = node.$inputs || []
        if (ifMyself && !parentIds.length) return [node]
        parentIds.forEach(pid => {
          let parent = formScope.findNodeById(pid)
          if (parent) {
            if (parent.$inputs?.length) {
              parent.$inputs.forEach(ppid => {
                parents.push(...formScope.findParentNodes(ppid, true))
              })
            } else {
              parents.push(parent)
            }
          }
        })

        return parents
      }
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
          dag: taskRef.value.dag
        },
        {
          silenceMessage: true
        }
      )

      taskRef.value.editVersion = data.editVersion
    }

    const onSourceNext = async () => {
      await patchTask()
    }

    const onTargetNext = async () => {
      await patchTask()
    }

    const steps = ref([
      {
        title: i18n.t('public_create_source_connection'),
        component: SourceStep,
        props: {
          type: 'source'
        },
        onNext: onSourceNext
      },
      {
        title: i18n.t('public_create_target_connection'),
        component: SourceStep,
        props: {
          type: 'target'
        },
        onNext: onTargetNext
      },
      {
        title: i18n.t('public_configuration_task'),
        component: TaskStep
      },
      {
        title: i18n.t('packages_business_task_start_task'),
        component: SourceStep
      }
    ])
    let taskRef = ref(null)
    let sourceNodeRef = ref(null)
    let targetNodeRef = ref(null)
    let hasTask = ref(false)

    const prevStep = () => {
      currentStep.value -= 1
    }

    const nextStep = async slient => {
      if (!slient && steps.value[currentStep.value]?.onNext) {
        await steps.value[currentStep.value].onNext()
      }

      currentStep.value += 1

      root.$store.dispatch('setGuideStep', currentStep.value)
    }

    const handlePageReturn = () => {
      root.$router.push({
        name: 'migrateList'
      })
      window.name = null
    }

    const richDag = ({ edges, nodes }) => {
      if (!nodes?.length) return {}
      const outputsMap = {}
      const inputsMap = {}

      edges.forEach(({ source, target }) => {
        let _source = outputsMap[source]
        let _target = inputsMap[target]

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

      nodes.forEach(node => {
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
          nodeTypeMap['table_rename_processor'],
          nodeTypeMap['migrate_field_rename_processor'],
          nodeTypeMap.target
        ],
        edges
      }
    }

    const richTask = data => {
      makeStatusAndDisabled(data)

      if (data.status === 'edit') data.btnDisabled.start = false // 任务编辑中，在编辑页面可以启动

      if (data.currentEventTimestamp) {
        data.currentEventTimestampLabel = dayjs(data.currentEventTimestamp).format('YYYY-MM-DD HH:mm:ss')
      }

      data.dag = richDag(data.dag)

      return data
    }

    const getTask = async id => {
      try {
        const { parent_task_sign } = root.$route.query || {}
        const data = await taskApi.get(id, null, { parent_task_sign })

        if (!data || ['deleted', 'deleting', 'delete_failed'].includes(data.status)) {
          root.$message.error(i18n.t('packages_dag_mixins_editor_renwubucunzai'))
          handlePageReturn()
          return
        }

        data.dag = data.temp || data.dag
        data.syncType = data.shareCache ? 'shareCache' : data.syncType

        // this.reformDataflow(data)
        // this.startLoopTask(id)
        // this.titleSet()

        return data
      } catch (e) {
        console.error(e)
        root.$message.error(i18n.t('packages_dag_mixins_editor_renwujiazaichu'))
        handlePageReturn()
      }
    }

    const genTaskName = async source => {
      const taskNames = await taskApi.get({
        filter: JSON.stringify({
          limit: 99999999,
          fields: { name: 1 },
          where: { name: { like: `^${source}\\d+$` } }
        })
      })
      let def = 1
      if (taskNames?.items.length) {
        let arr = [0]
        taskNames.items.forEach(item => {
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
      } catch (e) {
        if (e?.data?.code === 'Task.RepeatName') {
          const newName = await genTaskName(base.name)
          newTask = await genTask(newName)
        } else if (e?.data?.code === 'InvalidPaidPlan') {
          root.$router.push({
            name: 'migrateList'
          })
        }
      }

      return newTask
    }

    const getNewTask = async () => {
      const sourceNode = genDatabaseNode()
      const targetNode = genDatabaseNode()
      const tableEditNode = genProcessorNode('table_rename_processor', {
        name: i18n.t('packages_dag_src_migrationeditor_biaobianji')
      })
      const fieldEditNode = genProcessorNode('migrate_field_rename_processor', {
        name: i18n.t('packages_dag_src_migrationeditor_ziduanbianji')
      })

      const dag = richDag({
        edges: [
          {
            source: sourceNode.id,
            target: tableEditNode.id
          },
          {
            source: tableEditNode.id,
            target: fieldEditNode.id
          },
          {
            source: fieldEditNode.id,
            target: targetNode.id
          }
        ],
        nodes: [sourceNode, tableEditNode, fieldEditNode, targetNode]
      })

      const task = {
        ...DEFAULT_SETTINGS,
        name: '',
        desc: 'form',
        status: '',
        dag
      }

      const newTask = await genTask(task)

      if (newTask) {
        await root.$router.replace({
          name: props.editRouteName,
          params: { id: newTask.id },
          query: {
            ...root.$route.query
          }
        })
      }

      return newTask
    }

    const handleEditFlush = result => {
      if (result.data) {
        if (result.data.id !== taskRef.value.id) {
          console.debug(i18n.t('packages_dag_mixins_editor_wsshoudaole'), result.data)
          return
        }
        // reformDataflow(result.data, true)
        root.$store.commit('dataflow/setTransformLoading', !result.data.transformed)
      }
    }

    const initWS = task => {
      root.$ws.off('editFlush', handleEditFlush)
      root.$ws.on('editFlush', handleEditFlush)
      root.$ws.send({
        type: 'editFlush',
        taskId: task.id,
        data: {
          opType: 'subscribe'
        }
      })
    }

    const initTask = async () => {
      const { id } = root.$route.params
      let task

      if (id) {
        task = await getTask(id)
      } else {
        task = await getNewTask()

        if (root.$route.name === 'WelcomeTask') {
          root.$store.dispatch('setGuideTask', task.id)
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

    initTask()

    provide('currentStep', currentStep)
    provide('task', taskRef)
    provide('source', sourceNodeRef)
    provide('target', targetNodeRef)
    provide('pageVersion', pageVersion)

    return {
      task: taskRef,
      hasTask,
      currentStep,
      steps,
      loading,
      formScope,

      // API
      prevStep,
      nextStep
    }
  }
})
</script>

<style scoped lang="scss">
.migration-form-page {
  background-color: #f1f2f4;

  ::v-deep {
    .form-steps {
      .el-step {
        display: flex !important;
        align-items: center;
        .el-step__head {
          position: static;
          width: auto;
          &.is-process {
            color: #fff;
            border-color: map-get($color, primary);

            .el-step__icon {
              background-color: map-get($color, primary);
            }
          }
        }
        .el-step__main {
          padding-inline: 8px 16px;
          background-color: #fff;
          z-index: 1;
        }
        .el-step__title {
          line-height: 24px;
          &.is-process {
            color: map-get($color, primary);
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
}
</style>
