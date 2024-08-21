<template>
  <section class="migration-form-page flex flex-column h-100 gap-4">
    <div class="px-5 py-4 bg-white rounded-lg">
      <ElBreadcrumb class="breadcrumb" separator-class="el-icon-arrow-right">
        <ElBreadcrumbItem>数据复制</ElBreadcrumbItem>
        <ElBreadcrumbItem>创建复制任务</ElBreadcrumbItem>
      </ElBreadcrumb>

      <el-divider class="my-4"></el-divider>

      <el-steps class="form-steps gap-4" :active="currentStep">
        <el-step v-for="(step, index) in steps" :key="index" :title="step.title"></el-step>
      </el-steps>
    </div>

    <div class="rounded-lg flex-1 min-h-0" v-if="task">
      <component :is="steps[currentStep].component" @prev="prevStep" @next="nextStep"></component>
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
// import { computed as reactiveComputed } from '@tap/shared'

export default defineComponent({
  name: 'MigrationForm',
  components: { SourceStep, TargetStep, TaskStep },

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
    const steps = ref([
      {
        title: '创建源连接',
        component: SourceStep
      },
      {
        title: '创建目标连接',
        component: TargetStep
      },
      {
        title: '配置数据复制任务',
        component: TaskStep
      },
      {
        title: '任务启动运行',
        component: SourceStep
      }
    ])
    let taskObs = null

    const taskRef = reactiveComputed(() => taskObs)

    const prevStep = () => {
      currentStep.value -= 1
    }

    const nextStep = () => {
      currentStep.value += 1
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

      nodes.forEach(node => {
        node.$inputs = inputsMap[node.id] || []
        node.$outputs = outputsMap[node.id] || []
      })

      return {
        nodes,
        edges
      }
    }

    const richTask = data => {
      makeStatusAndDisabled(data)

      if (data.status === 'edit') data.btnDisabled.start = false // 任务编辑中，在编辑页面可以启动

      if (data.currentEventTimestamp) {
        data.currentEventTimestampLabel = dayjs(data.currentEventTimestamp).format('YYYY-MM-DD HH:mm:ss')
      }

      richDag(data.dag)
    }

    const getTask = async id => {
      try {
        const { parent_task_sign } = root.$route.query || {}
        const data = await taskApi.get(id, null, { parent_task_sign })

        if (!data) {
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
      const tableEditNode = genProcessorNode('table_rename_processor')
      const fieldEditNode = genProcessorNode('migrate_field_rename_processor')

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
        nodes: [sourceNode, targetNode, tableEditNode, fieldEditNode]
      })

      const task = {
        ...DEFAULT_SETTINGS,
        name: '',
        status: '',
        dag
      }

      const newTask = await genTask(task)

      if (newTask) {
        await root.$router.replace({
          name: 'MigrateForm',
          params: { id: newTask.id }
        })
      }

      return newTask
    }

    const initTask = async () => {
      const { id } = root.$route.params
      let task

      if (id) {
        task = await getTask(id)
      } else {
        task = await getNewTask()
      }

      richTask(task)

      formScope.$taskId = task.id
      taskObs = observable(task)

      console.log('task', taskObs)
    }

    initTask()

    provide('task', taskObs)

    return {
      task: taskRef,
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
}

.form-steps {
  ::v-deep {
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
}
</style>
