<template>
  <div class="position-relative h-100 bg-white rounded-lg min-h-0 overflow-y-auto">
    <div class="p-4">
      <div class="title-prefix-bar mb-4">配置任务</div>
      <SchemaForm :form="form" :schema="schema" :scope="scope" />
    </div>

    <div class="position-sticky z-index bottom-0 p-4 border-top backdrop-filter-light z-10">
      <el-button click="$emit('prev')">上一步</el-button>
      <el-button type="primary" @click="$emit('next')">启动任务</el-button>
    </div>
  </div>
</template>

<script>
import i18n from '@tap/i18n'
import { taskApi } from '@tap/api'
import { debounce, merge } from 'lodash'
import { createForm, onFormValuesChange, onFieldValueChange } from '@formily/core'
import { observable, action, untracked, raw } from '@formily/reactive'
import SchemaForm from '../SchemaForm.vue'
import { DEFAULT_SETTINGS } from '../../constants'
import { genDatabaseNode, genProcessorNode } from '../../util'
import { defineComponent, inject, nextTick, ref } from '@vue/composition-api'

export default defineComponent({
  name: 'TaskStep',
  components: {
    SchemaForm
  },
  setup(props, { root }) {
    let repeatNameMessage = i18n.t('packages_dag_task_form_error_name_duplicate')
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
    const taskRef = inject('task')
    const pageVersionRef = inject('pageVersion')
    const form = ref(null)

    const schema = {
      type: 'object',
      properties: {
        name: {
          title: i18n.t('public_task_name'), //任务名称
          type: 'string',
          required: true,
          'x-decorator': 'FormItem',
          'x-component': 'Input',
          'x-validator': `{{(value) => {
                    return new Promise((resolve) => {
                      checkName(value).then(data => {
                        if(data === true) {
                          resolve('${repeatNameMessage}')
                        } else {
                          resolve()
                        }
                      })
                    })
                  }}}`
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
              value: 'initial_sync+cdc'
            },
            {
              label: i18n.t('public_task_type_initial_sync'), //全量
              value: 'initial_sync'
            },
            {
              label: i18n.t('public_task_type_cdc'), //增量
              value: 'cdc'
            }
          ]
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
                  value: 'keepData'
                },
                {
                  label: i18n.t('packages_dag_nodes_database_qingchumubiaoduan'),
                  value: 'dropTable',
                  disabled: true
                },
                {
                  label: i18n.t('packages_dag_nodes_targetdatabase_baochimubiaoduan'),
                  value: 'removeData'
                }
              ],
              'x-decorator': 'FormItem',
              'x-component': 'Radio.Group',
              'x-reactions': {
                fulfill: {
                  run: '{{$self.dataSource[1].disabled = $self.dataSource[2].disabled = $values.type === "cdc"}}',
                  state: {
                    description: `{{$values.type === "cdc" ? '${i18n.t(
                      'packages_dag_nodes_database_setting_cdc_changjing_desc'
                    )}':''}}`
                  },
                  schema: {
                    // TODO 根据能力改变dataSource
                    'x-component-props.options': `{{options=[$self.dataSource[0]],$values.dag.nodes[3].attrs.capabilities.find(item => item.id ==='drop_table_function') && options.push($self.dataSource[1]),$values.dag.nodes[3].attrs.capabilities.find(item => item.id ==='clear_table_function') && options.push($self.dataSource[2]),options}}`
                  }
                }
              }
            }
          }
        },

        // 源节点
        'dag.nodes.0': {
          title: i18n.t('packages_dag_task_setting_sync_type'),
          type: 'object',
          'x-decorator': 'FormItem',
          'x-component': 'SourceDatabaseNode'
        },

        'dag.nodes.0.migrateTableSelectType': {
          title: i18n.t('packages_dag_nodes_database_xuanzebiao'),
          type: 'string',
          default: 'custom',
          'x-display': 'hidden'
        }
      }
    }
    const scope = {
      checkName: value => {
        return new Promise(resolve => {
          handleCheckName(resolve, value)
        })
      },

      findNodeById: id => {
        return root.$store.state.dataflow.NodeMap[id]
      },

      findParentNodes: (id, ifMyself) => {
        let node = scope.findNodeById(id)
        const parents = []

        if (!node) return parents

        let parentIds = node.$inputs || []
        if (ifMyself && !parentIds.length) return [node]
        parentIds.forEach(pid => {
          let parent = scope.findNodeById(pid)
          if (parent) {
            if (parent.$inputs?.length) {
              parent.$inputs.forEach(ppid => {
                parents.push(...scope.findParentNodes(ppid, true))
              })
            } else {
              parents.push(parent)
            }
          }
        })

        return parents
      }
    }

    const onTaskChange = debounce(async () => {
      const data = await taskApi.patch(
        {
          ...taskRef.value,
          // id: taskRef.value.id,
          // editVersion: taskRef.value.editVersion,
          pageVersion: pageVersionRef.value
          // dag: taskRef.value.dag
        },
        {
          silenceMessage: true
        }
      )

      // 防止触发 FormValuesChange
      const rawObj = raw(taskRef.value)
      rawObj.editVersion = data.editVersion
    }, 100)

    const initForm = () => {
      const task = taskRef.value
      scope.$taskId = task.id
      form.value = createForm({
        values: task
      })

      // 防止挂载表单时触发valueChange
      setTimeout(() => {
        form.value.addEffects('watchForm', () => {
          onFormValuesChange(form => {
            onTaskChange()
            console.log('onFormValuesChange', form.values)
          })

          onFieldValueChange('dag.nodes', field => {
            console.log('onFieldValueChange', field)
            // onTaskChange()
          })

          onFieldValueChange('*', field => {
            console.log('onTableRenameValueChange*', field)
          })
        })
      }, 100)
    }

    initForm()

    return {
      form,
      schema,
      scope
    }
  }
})
</script>

<style lang="scss" scoped></style>
