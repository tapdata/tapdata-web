import i18n from '@tap/i18n'
import { defineComponent, ref, watch, onMounted, nextTick } from '@vue/composition-api'
import { observer } from '@formily/reactive-vue'
import { observe } from '@formily/reactive'
import { FormItem, h as createElement, useFieldSchema, useForm, RecursionField } from '@tap/form'
import { OverflowTooltip, IconButton } from '@tap/component'
import { metadataInstancesApi } from '@tap/api'
import './style.scss'
import NodeIcon from '../../NodeIcon'

export const MergeTableTree = observer(
  defineComponent({
    props: {
      value: Array,
      disabled: Boolean,
      findNodeById: Function,
      loadFieldsMethod: Function
    },
    setup(props, { emit, refs, root }) {
      const formRef = useForm()
      const form = formRef.value
      const schemaRef = useFieldSchema()
      const treeRef = ref([])
      const currentKey = ref('')
      const currentPath = ref('')
      const setPath = pathArr => {
        const path = pathArr.join('.children.')
        currentPath.value = path
        if (pathArr.length === 1) {
          form.setFieldState(`mergeProperties.${path}.mergeType`, {
            display: 'hidden'
          })
          form.setFieldState(`mergeProperties.${path}.joinKeys`, {
            visible: false
          })
        }
        return path
      }

      const flattenTree = (datas, map) => {
        return datas.reduce((result, data) => {
          result[data.id] = data

          if (data.children.length) {
            flattenTree(data.children, map)
          }
          return result
        }, map)
      }

      const makeTree = () => {
        const $inputs = formRef.value.values.$inputs
        const traverse = children => {
          const filter = []
          children.forEach(item => {
            if (!$inputs.includes(item.id) && item.children?.length) {
              filter.push(...traverse(item.children))
            } else if ($inputs.includes(item.id) && item.children?.length) {
              filterIdMap[item.id] = true
              const newItem = { ...item, children: [] }
              newItem.children = traverse(item.children)
              filter.push(newItem)
            } else if ($inputs.includes(item.id) && !item.children?.length) {
              filterIdMap[item.id] = true
              filter.push({ ...item })
            }
          })
          return filter
        }
        let filterIdMap = {}
        let newTree = traverse(JSON.parse(JSON.stringify(props.value)))
        $inputs.forEach(id => {
          if (!filterIdMap[id]) {
            const node = props.findNodeById(id)
            newTree.push({
              id,
              mergeType: 'updateOrInsert',
              targetPath: null,
              tableName: node.name,
              // joinKeys: [],
              children: [],
              enableUpdateJoinKeyValue: false // 关联条件变更
            })
          }
        })
        treeRef.value = newTree
        emit('change', JSON.parse(JSON.stringify(newTree)))

        if (newTree.length) {
          if (!currentKey.value || !$inputs.includes(currentKey.value)) {
            currentKey.value = newTree[0].id
            setPath([0])
          }
        } else {
          currentKey.value = null
          currentPath.value = null
        }

        nextTick(() => {
          refs.tree?.setCurrentKey(currentKey.value)
        })
      }

      makeTree()

      observe(formRef.value.values.$inputs, () => {
        makeTree()
      })

      const renderNode = ({ data }) => {
        const dagNode = props.findNodeById(data.id)
        if (!dagNode) return

        return (
          <div class="flex flex-1 align-center ml-n1 overflow-hidden merge-table-tree-node cursor-pointer">
            <NodeIcon size={20} node={dagNode}></NodeIcon>
            <OverflowTooltip
              class="text-truncate flex-1 lh-1 ml-1"
              placement="left"
              text={dagNode.name}
              open-delay={300}
            />
            <IconButton onClick={() => emit('center-node', data.id)} class="merge-table-tree-node-action">
              location
            </IconButton>
          </div>
        )
      }

      const updatePath = node => {
        const temp = []
        const nodePath = refs.tree.getNodePath(node)
        nodePath.reduce((parent, item) => {
          if (parent) {
            temp.push(parent.findIndex(p => p.id === item.id))
          }
          return item.children
        }, treeRef.value)

        return setPath(temp)
      }

      const loadTargetField = (selfId, selfPath) => {
        form.setFieldState(`*(mergeProperties.${selfPath}.*(joinKeys.*.target))`, {
          loading: true
        })
        metadataInstancesApi.getMergerNodeParentFields(root.$route.params.id, selfId).then(fields => {
          form.setFieldState(`*(mergeProperties.${selfPath}.*(joinKeys.*.target))`, {
            loading: false,
            dataSource: fields.map(item => ({
              label: item.field_name,
              value: item.field_name,
              isPrimaryKey: item.primary_key_position > 0
            }))
          })
        })
      }

      const loadField = (selfId, selfPath, ifWait) => {
        const pathArr = selfPath.split('.children.')
        if (pathArr.length < 2) return
        props.loadFieldsMethod(selfId).then(fields => {
          form.setFieldState(`*(mergeProperties.${selfPath}.*(joinKeys.*.source,arrayKeys))`, {
            loading: false,
            dataSource: fields
          })
        })

        if (ifWait) {
          form.setFieldState(`*(mergeProperties.${selfPath}.*(joinKeys.*.target))`, {
            loading: true
          })
          // 等待自动保存接口响应后查询
          let unwatch = root.$watch(
            () => root.$store.state.dataflow.editVersion,
            () => {
              unwatch()
              loadTargetField(selfId, selfPath)
            }
          )
        } else {
          loadTargetField(selfId, selfPath)
        }
      }

      const handleCurrentChange = (data, node) => {
        const oldKey = currentKey.value
        currentKey.value = data.id
        const path = updatePath(node)
        if (data.id !== oldKey) {
          loadField(currentKey.value, path)
        }
      }

      // 拖拽节点的原父节点
      let draggingNodeParent = null

      const handleNodeDragOver = dragNode => {
        draggingNodeParent = dragNode.parent
      }

      const handleNodeDrop = (dragNode, dropNode, dropType) => {
        const nodeMap = {
          value: flattenTree(props.value || [], {})
        }

        const dragNodeId = dragNode.data.id
        const dragNodePath = refs.tree.getNodePath(dragNodeId)
        const topParentNode = dragNodePath[0]
        const node = nodeMap.value[dragNodeId]
        const targetNode = nodeMap.value[dropNode.key]
        let targetIndex

        if (dropType !== 'none') {
          // 从父级删除
          let parent
          if (!draggingNodeParent.key) {
            parent = props.value
          } else {
            parent = nodeMap.value[draggingNodeParent.key].children
          }

          const index = parent.indexOf(node)
          if (index > -1) {
            parent.splice(index, 1)
          }
        }

        if (dropType === 'before') {
          const parent = dropNode.parent?.key ? nodeMap.value[dropNode.parent.key].children : props.value
          targetIndex = parent.indexOf(targetNode)
          parent.splice(targetIndex, 0, node)
        } else if (dropType === 'after') {
          const parent = dropNode.parent?.key ? nodeMap.value[dropNode.parent.key].children : props.value
          targetIndex = parent.indexOf(targetNode)
          parent.splice(targetIndex + 1, 0, node)
        } else if (dropType === 'inner') {
          nodeMap.value[dropNode.key].children.push(node)
        }

        if (topParentNode.id !== dragNodeId) {
          // 跟随顶级父节点联动
          let parentFlag = nodeMap.value[topParentNode.id].enableUpdateJoinKeyValue
          const { enableRecord = {} } = formRef.value.values.attrs

          if (!parentFlag && dragNodeId in enableRecord) {
            parentFlag = enableRecord[dragNodeId]
          }

          node.enableUpdateJoinKeyValue = parentFlag
        }

        refs.tree.setCurrentKey(currentKey.value)
        const oldPath = currentPath.value
        const path = updatePath(refs.tree.getNode(currentKey.value))
        if (path !== oldPath) {
          loadField(currentKey.value, path, true)
        }
      }

      onMounted(() => {
        if (currentKey.value) {
          refs.tree.setCurrentKey(currentKey.value)
        }
      })

      return () => {
        return (
          <div class="merge-table-tree-space flex overflow-hidden">
            <FormItem.BaseItem
              wrapperWidth={240}
              feedbackLayout="none"
              class="overflow-y-auto px-2 pb-2"
              label={i18n.t('packages_dag_merge_table_tree_index_biaomingchengzhichi')}
              tooltip={i18n.t('packages_dag_merge_table_tree_index_biaozhijianketong')}
            >
              <ElTree
                ref="tree"
                indent={8}
                data={treeRef.value}
                nodeKey="id"
                defaultExpandAll={true}
                highlightCurrent={true}
                expandOnClickNode={false}
                draggable={!props.disabled}
                scopedSlots={{
                  default: renderNode
                }}
                vOn:current-change={handleCurrentChange}
                vOn:node-drop={handleNodeDrop}
                vOn:node-drag-over={handleNodeDragOver}
              />
            </FormItem.BaseItem>
            <div class="border-start flex-1 px-2 overflow-y-auto">
              {currentPath.value &&
                createElement(
                  RecursionField,
                  {
                    props: {
                      onlyRenderProperties: true,
                      name: currentPath.value,
                      schema: schemaRef.value.items
                    }
                  },
                  {}
                )}
            </div>
          </div>
        )
      }
    }
  })
)
