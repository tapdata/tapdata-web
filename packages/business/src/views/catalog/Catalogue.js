import { defineComponent, reactive, ref, watch, nextTick, onMounted } from '@vue/composition-api'
import i18n from '@tap/i18n'
import { VIcon, ProTable } from '@tap/component'
import { makeDragNodeImage } from '../../index'
import ClassificationTree from '../../components/ClassificationTree'
import { DatabaseIcon } from '../../components'
import TablePreview from '../swimlane/TablePreview'
import resize from '@tap/component/src/directives/resize'
import './index.scss'

const ICON = {
  folder: 'folder-outline',
  table: 'table',
  api: 'apiServer_navbar'
}
export default defineComponent({
  directives: {
    resize
  },
  setup(props, { refs, root }) {
    const list = ref([])
    const objectList = ref([])
    const catalogList = ref([])
    const { sourceType, queryKey } = root.$route.query || {}
    const options = reactive({
      isShowDetails: false,
      isShowSourceDrawer: false, //资源绑定
      tableLoading: false,
      searchParams: {
        sourceType: sourceType || '',
        queryKey: queryKey || ''
      },
      page: {
        size: 20,
        current: 1,
        total: 0,
        count: 1
      },
      currentNode: '',
      filterItems: []
    })
    const currentNode = ref({})
    const pathMatch = ref([])

    const matchParent = node => {
      let arr = [node]
      node = node.parent

      while (node && node.level > 0) {
        arr.unshift(node)
        node = node.parent
      }

      return arr
    }

    const handleNodeClick = (data, node) => {
      pathMatch.value = matchParent(node)
      options.isShowDetails = data.isObject
      if (data.isObject) {
        nextTick(() => {
          console.log('refs.tableView', refs.tableView) // eslint-disable-line
          setTimeout(() => {
            refs.tableView.open(data)
          }, 100)
        })
      } else {
        currentNode.value = data
      }

      console.log('handleNodeClick', data, node, matchParent(node)) // eslint-disable-line
    }

    const renderIcon = data => {
      if (data.LDP_TYPE === 'connection') {
        return <DatabaseIcon item={data} size={20} />
      } else {
        return <VIcon size="18">{ICON[data.LDP_TYPE]}</VIcon>
      }
    }

    const dragState = reactive({
      isDragging: false,
      draggingObjects: [],
      dropNode: null,
      allowDrop: true
    })

    let draggingNodeImage
    const handleDragStart = (row, column, ev) => {
      dragState.isDragging = true
      console.log('nodeDragStart', row, column, event) // eslint-disable-line
      let draggingRow = [row]

      if (row.id in multipleSelectionMap.value) {
        let selectionRows = Object.values(multipleSelectionMap.value)
        draggingRow.length = selectionRows.length
        dragState.draggingObjects = selectionRows
      } else {
        dragState.draggingObjects = [row]
      }

      draggingNodeImage = makeDragNodeImage(
        ev.currentTarget.querySelector('.tree-item-icon'),
        row.name,
        dragState.draggingObjects.length
      )
      ev.dataTransfer.setDragImage(draggingNodeImage, 0, 0)
    }

    const handleDragEnd = (row, column, event) => {
      dragState.isDragging = false
      dragState.draggingObjects = []
      dragState.dropNode = null
      document.body.removeChild(draggingNodeImage)
      draggingNodeImage = null
    }

    const multipleSelectionMap = ref({})
    const handleSelectionChange = val => {
      multipleSelectionMap.value = val.reduce((obj, item) => {
        obj[item.id] = item
        return obj
      }, {})
    }

    const setTreeCurrent = data => {
      refs.tree.setCurrent(data)
    }

    return () => {
      return (
        <section ref="root" class="discovery-page-wrap flex catalog-container">
          <div
            {...{
              directives: [
                {
                  name: 'resize',
                  value: {
                    minWidth: 300,
                    maxWidth: 600
                  },
                  modifiers: {
                    right: true
                  }
                }
              ]
            }}
            class="page-left border-right pt-3 pr-3 overflow-auto"
          >
            <ClassificationTree
              ref="tree"
              renderIcon={renderIcon}
              dragState={dragState}
              onNodeChecked={handleNodeClick}
            />
          </div>
          <div class="flex flex-column flex-1 min-w-0">
            <div class="p-3">
              <div class="path-breadcrumb flex align-center">
                {pathMatch.value.map((node, i) => {
                  let notLast = i < pathMatch.value.length - 1
                  return (
                    <div class="path-breadcrumb-item flex align-center">
                      <div
                        class="path-breadcrumb-item__name rounded-2 px-1"
                        onClick={() => {
                          notLast && setTreeCurrent(node.data)
                        }}
                      >
                        {node.data.name}
                      </div>
                      {notLast && (
                        <VIcon size={24} class="path-breadcrumb-item__separator ml-1">
                          arrow-right
                        </VIcon>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            <div staticClass="flex-1 min-h-0 position-relative">
              <ProTable
                class={['catalog-table']}
                ref="table"
                row-key="id"
                height="100%"
                draggable
                data={currentNode.value.children}
                treeProps={{ children: 'no_children' }}
                on={{
                  'row-click': setTreeCurrent,
                  'row-dragstart': handleDragStart,
                  'row-dragend': handleDragEnd,
                  'selection-change': handleSelectionChange
                }}
              >
                <el-table-column type="selection" width="24" class-name="ck-cell-wrap"></el-table-column>
                <el-table-column label={i18n.t('public_name')} prop="name" show-overflow-tooltip width="350px">
                  {({ row }) => {
                    return (
                      <div class="cursor-pointer flex align-center">
                        <div class="tree-item-icon flex align-center mr-2">{renderIcon(row)}</div>
                        <span>{row.name}</span>
                      </div>
                    )
                  }}
                </el-table-column>
                <el-table-column label={i18n.t('public_change_time')} prop="changeTime"></el-table-column>
              </ProTable>

              {options.isShowDetails && (
                <div class="position-absolute top-0 bottom-0 left-0 right-0 w-100 bg-white object-preview-wrap pl-3">
                  <TablePreview
                    tag="div"
                    ref="tableView"
                    class="border rounded-4 sw-table-drawer h-100 overflow-y-auto"
                  ></TablePreview>
                </div>
              )}
            </div>
          </div>
        </section>
      )
    }
  }
})
