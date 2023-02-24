import i18n from '@tap/i18n'
import { defineComponent, ref, watch, onMounted, computed, nextTick } from '@vue/composition-api'
import { observer } from '@formily/reactive-vue'
import { observe } from '@formily/reactive'
import { FormItem, Space, h as createElement, useFieldSchema, useForm, RecursionField } from '@tap/form'
import { getNodeIconSrc } from '@tap/business'
import { metadataInstancesApi } from '@tap/api'
import './style.scss'

export const MergeTableTree = observer(
  defineComponent({
    props: {
      value: Array,
      disabled: Boolean,
      findNodeById: Function,
      loadFieldsMethod: Function,
      treeWidth: {
        type: [Number, String],
        default: 320
      }
    },
    setup(props, { emit, refs, root }) {
      const formRef = useForm()
      const form = formRef.value
      const schemaRef = useFieldSchema()
      const treeRef = ref([])
      const currentKey = ref('')
      const currentPath = ref('')
      const treeStyle = computed(() => {
        let width = props.treeWidth
        if (!isNaN(width)) width += 'px'
        return {
          width
        }
      })

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

      watch(
        treeRef,
        val => {
          // eslint-disable-next-line
          console.log('🤖MergeTableTree.watch', val, treeRef.value)
          emit('change', JSON.parse(JSON.stringify(val)))
        },
        { deep: true }
      )

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
              children: []
            })
          }
        })
        treeRef.value = newTree

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
        // eslint-disable-next-line
        console.log('formRef.value.values.$inputs', formRef.value.values.$inputs)
        makeTree()
      })

      const renderNode = ({ data }) => {
        const dagNode = props.findNodeById(data.id)
        if (!dagNode) return

        const iconSrc = getNodeIconSrc(dagNode)

        return (
          <div class="flex flex-1 align-center ml-n2 overflow-hidden">
            <ElImage class="mr-2" src={iconSrc}></ElImage>
            <div class="flex-1 text-truncate">{dagNode.name}</div>
          </div>
        )
      }

      const updatePath = node => {
        const temp = []
        const nodePath = refs.tree.getNodePath(node)
        nodePath.reduce((parent, item) => {
          if (parent) {
            // temp.push(parent.indexOf(item))
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

      const handleNodeDrop = () => {
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
          <Space class="merge-table-tree-space" align="stretch" size={12} split={true} inline={false}>
            <FormItem.BaseItem
              label={i18n.t('packages_dag_merge_table_tree_index_biaomingchengzhichi')}
              tooltip={i18n.t('packages_dag_merge_table_tree_index_biaozhijianketong')}
            >
              <ElTree
                ref="tree"
                style={treeStyle.value}
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
              />
            </FormItem.BaseItem>
            <div class="flex-fill">
              {currentPath.value &&
                createElement(
                  RecursionField,
                  {
                    // key: currentPath.value,
                    // key: `${currentKey.value}_${currentPath.value}`,
                    props: {
                      onlyRenderProperties: true,
                      name: currentPath.value,
                      schema: schemaRef.value.items
                    }
                  },
                  {}
                )}
            </div>
          </Space>
        )
      }
    }
  })
)
