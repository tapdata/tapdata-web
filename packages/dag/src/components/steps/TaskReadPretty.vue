<script>
import { createForm } from '@formily/core'
import { defineComponent, ref } from 'vue'
import { useStore } from 'vuex'
import SchemaForm from '../SchemaForm.vue'

export default defineComponent({
  name: 'TaskReadPretty',
  components: { SchemaForm },
  props: {
    task: Object,
  },
  setup(props) {
    const store = useStore()
    const nodes = store.getters['dataflow/allNodes']
    const form = ref(null)
    const fieldForm = ref(null)
    const tableEditSchema = {
      type: 'object',
      properties: {
        tableNames: {
          type: 'array',
          'x-component': 'TableRename',
          'x-component-props': {
            findParentNodes: '{{findParentNodes}}',
            listStyle: {
              maxHeight: 'calc((100vh - 120px) * 0.618)',
            },
          },
        },
      },
    }
    const fieldEditSchema = {
      type: 'object',
      properties: {
        fieldsOperation: {
          type: 'object',
          default: {
            prefix: '',
            suffix: '',
            capitalized: '',
          },
        },
        fieldsMapping: {
          type: 'array',
          title: '',
          'x-decorator': 'FormItem',
          'x-component': 'FieldRenameProcessor',
          'x-component-props': {
            nodeId: '{{$values.id}}',
          },
        },
      },
    }
    const scope = {
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

    const initForm = () => {
      const task = props.task
      scope.$taskId = task.id

      console.log('task', task)

      const tableEditNode = nodes.find(
        (item) => item.type === 'table_rename_processor',
      )
      const fieldEditNode = nodes.find(
        (item) => item.type === 'migrate_field_rename_processor',
      )

      if (tableEditNode) {
        form.value = createForm({
          readPretty: true,
          values: tableEditNode,
        })
      }

      if (fieldEditNode) {
        fieldForm.value = createForm({
          readPretty: true,
          values: fieldEditNode,
        })
      }
    }

    initForm()

    return {
      form,
      fieldForm,
      tableEditSchema,
      fieldEditSchema,
      scope,
    }
  },
})
</script>

<template>
  <div class="flex flex-column gap-4">
    <div class="p-4 bg-white rounded-lg">
      <div class="title-prefix-bar mb-4">
        {{ $t('packages_dag_src_migrationeditor_biaobianji') }}
      </div>
      <SchemaForm :form="form" :schema="tableEditSchema" :scope="scope" />
    </div>

    <div class="p-4 bg-white rounded-lg">
      <div class="title-prefix-bar mb-4">
        {{ $t('packages_dag_src_migrationeditor_ziduanbianji') }}
      </div>
      <SchemaForm :form="fieldForm" :schema="fieldEditSchema" :scope="scope" />
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
