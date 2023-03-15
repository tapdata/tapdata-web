import { defineComponent, reactive, ref, watch, nextTick, onMounted } from '@vue/composition-api'
import i18n from '@tap/i18n'
import { FilterBar, Drawer, VIcon } from '@tap/component'
import { discoveryApi } from '@tap/api'
import { TablePage, DiscoveryClassification, ClassificationTree, makeDragNodeImage } from '../../index'
import DrawerContent from './PreviewDrawer'
import ObjectTable from './ObjectTable'
import TableView from '../../components/TableView'
import { DatabaseIcon } from '../../components'
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
    const data = reactive({
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

    const handleNodeClick = node => {
      data.currentNode = node
      objectList.value = node.children
      currentNode.value = node
      console.log('handleNodeClick', node) // eslint-disable-line
    }

    const iconMap = {
      table: 'table',
      defaultApi: 'apiServer_navbar'
    }

    const renderIcon = data => {
      if (data.LDP_TYPE === 'connection') {
        return <DatabaseIcon item={data} size={20} />
      } else {
        return <VIcon size="18">{ICON[data.LDP_TYPE]}</VIcon>
      }
    }

    const renderNode = ({ row }) => {
      return (
        <div class="cursor-pointer flex align-center">
          <div class="tree-item-icon flex align-center mr-2">{renderIcon(row)}</div>
          <span
            onClick={event => {
              event.stopPropagation()
              objectList.value = row.children
              // handlePreview(row)
            }}
          >
            {row.name}
          </span>
        </div>
      )
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

    return () => {
      return (
        <section ref="root" class="discovery-page-wrap flex">
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
            class="page-left border-right"
          >
            <DiscoveryClassification
              ref="classify"
              dragState={dragState}
              onNodeChecked={handleNodeClick}
            ></DiscoveryClassification>
          </div>
          <div class="flex flex-column flex-1">
            <div class="p-3">
              <ElBreadcrumb separator-class="el-icon-arrow-right">
                <ElBreadcrumbItem class="discovery-title">Source</ElBreadcrumbItem>
              </ElBreadcrumb>
            </div>
            <div staticClass="flex-1" class={{ none: !data.isShowDetails }}>
              <TableView ref="tableView"></TableView>
            </div>
            <div staticClass="flex-1" class={{ none: data.isShowDetails }}>
              <ElTable
                class={{ none: data.isShowDetails }}
                ref="table"
                row-key="id"
                draggable
                data={currentNode.value.children}
                treeProps={{ children: 'no_children' }}
                on={{
                  'row-dragstart': handleDragStart,
                  'row-dragend': handleDragEnd,
                  'selection-change': handleSelectionChange
                }}
              >
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column
                  label={i18n.t('public_name')}
                  prop="name"
                  show-overflow-tooltip
                  width="350px"
                  scopedSlots={{
                    default: renderNode
                  }}
                ></el-table-column>
                <el-table-column label={i18n.t('public_change_time')} prop="changeTime"></el-table-column>
              </ElTable>
            </div>
          </div>
        </section>
      )
    }
  }
})
