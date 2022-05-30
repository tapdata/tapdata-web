import { defineComponent, ref, watch, onMounted, computed, nextTick } from 'vue-demi'
import { observer } from '@formily/reactive-vue'
import { h as createElement, useFieldSchema, useForm, RecursionField } from '@formily/vue'
import { observe } from '@formily/reactive'
import { Space } from '../space'
import './style.scss'
import { getNodeIconSrc } from '@tap/business'
import { MetadataInstances } from '@tap/api'

const metadataApi = new MetadataInstances()

export const MergeTableTree = observer(
  defineComponent({
    props: {
      value: Array,
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
        // currentPath.value = null
        if (pathArr.length === 1) {
          form.setFieldState(`mergeProperties.${path}.joinKeys`, {
            visible: false
          })
        }
        /*nextTick(() => {
          currentPath.value = path
        })*/
        return path
      }

      watch(
        treeRef,
        val => {
          console.log('🤖MergeTableTree.watch', val, treeRef.value)
          emit('change', val)
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
        let newTree = traverse(props.value)
        $inputs.forEach(id => {
          if (!filterIdMap[id]) {
            const node = props.findNodeById(id)
            newTree.push({
              id,
              mergeType: 'updateOrInsert',
              targetPath: node.name,
              // joinKeys: [],
              children: []
            })
          }
        })
        treeRef.value = newTree

        // console.log(`makeTree?${newTree == props.value}`, newTree, props.value) // eslint-disable-line

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

      const loadField = (selfId, selfPath) => {
        const pathArr = selfPath.split('.children.')
        if (pathArr.length < 2) return
        props.loadFieldsMethod(selfId).then(fields => {
          form.setFieldState(`*(mergeProperties.${selfPath}.*(joinKeys.*.source,arrayKeys))`, {
            loading: false,
            dataSource: fields
          })
        })
        setTimeout(() => {
          metadataApi.getMergerNodeParentFields(root.$route.params.id, selfId).then(fields => {
            form.setFieldState(`*(mergeProperties.${selfPath}.*(joinKeys.*.target))`, {
              loading: false,
              dataSource: fields
            })
          })
        }, 500)
      }

      const handleCurrentChange = (data, node) => {
        const oldKey = currentKey.value
        currentKey.value = data.id
        const path = updatePath(node)
        if (data.id !== oldKey) {
          loadField(currentKey.value, path)
        }
        console.log('handleCurrentChange', node) // eslint-disable-line
      }

      const handleNodeDragStart = (node, event) => {
        console.log('handleNodeDragStart', node, event) // eslint-disable-line
        // const dagNode = props.findNodeById(node.data.id)
        // if (!dagNode) return
        //
        // const icon = dagNode.type === 'table' ? dagNode.databaseType : dagNode.type
        // const iconSrc = icon ? require(`web-core/assets/icons/node/${icon}.svg`) : null
        // let div = document.createElement('span')
        // div.id = 'tree-node-drag'
        // div.classList.add('v-chip', 'v-size--default', 'theme--light', 'drag-move-cursor')
        // div.innerHTML = `<span class="v-chip__content">${dagNode.name}</span>`
        // div.style.position = 'absolute'
        // div.style.top = '0px'
        // div.style.left = '-100%'
        // document.body.appendChild(div)
        // event.dataTransfer.setDragImage(div, 0, 0)
      }

      const handleNodeDrop = node => {
        console.log('handleNodeDrop', node, currentKey.value) // eslint-disable-line
        refs.tree.setCurrentKey(currentKey.value)
        const oldPath = currentPath.value
        const path = updatePath(refs.tree.getNode(currentKey.value))
        if (path !== oldPath) {
          loadField(currentKey.value, path)
        }
      }

      onMounted(() => {
        if (currentKey.value) {
          refs.tree.setCurrentKey(currentKey.value)
        }

        // console.log('props.value', props.value, treeRef.value) // eslint-disable-line
      })

      return () => {
        console.log('render', props.value, treeRef.value, currentPath.value) // eslint-disable-line

        return (
          <Space
            class="merge-table-tree-space"
            align="stretch"
            size={32}
            split={true}
            inline={false}
            colSpan={['unset', 1]}
          >
            <ElTree
              ref="tree"
              style={treeStyle.value}
              data={treeRef.value}
              nodeKey="id"
              defaultExpandAll={true}
              highlightCurrent={true}
              expandOnClickNode={false}
              draggable={true}
              scopedSlots={{
                default: renderNode
              }}
              vOn:current-change={handleCurrentChange}
              vOn:node-drag-start={handleNodeDragStart}
              vOn:node-drop={handleNodeDrop}
            />
            <div>
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
            {/*<div>{currentPath.value && <RecursionField name={currentPath.value} schema={schemaRef.value.items} />}</div>*/}
          </Space>
        )
      }
    }
  })
)
