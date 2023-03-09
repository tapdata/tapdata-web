import { defineComponent, reactive, ref, watch, nextTick, onMounted } from '@vue/composition-api'
import i18n from '@tap/i18n'
import { FilterBar, Drawer, VIcon } from '@tap/component'
import { discoveryApi } from '@tap/api'
import { TablePage, DiscoveryClassification, makeDragNodeImage } from '../../index'
import DrawerContent from './PreviewDrawer'
import ObjectTable from './ObjectTable'
import TableView from '../../components/TableView'
import resize from '@tap/component/src/directives/resize'
import './index.scss'

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
    const loadData = ({ page }) => {
      let { sourceType, queryKey } = data.searchParams
      let { size, current } = page
      let where = {
        page: current,
        pageSize: size,
        tagId: data?.currentNode?.['id'] || ''
      }
      sourceType && (where['objType'] = sourceType)
      queryKey && (where['queryKey'] = queryKey)
      return discoveryApi.discoveryList(where).then(res => {
        let { total, items } = res
        return {
          total: total,
          data: items
        }
      })
    }
    const rest = () => {
      // refs.table.fetch(1)
    }
    const loadFilterList = () => {
      let filterType = ['objType']
      discoveryApi.filterList(filterType).then(res => {
        let { objType } = res
        data.filterItems = [
          {
            label: i18n.t('datadiscovery_catalogue_ziyuanleixing'),
            key: 'sourceType',
            type: 'select-inner',
            items: dataAssembly(objType),
            selectedWidth: '200px'
          },
          {
            placeholder: i18n.t('datadiscovery_catalogue_lianjieduixiangming'),
            key: 'queryKey',
            type: 'input'
          }
        ]
      })
    }
    const dataAssembly = data => {
      if (data?.length === 0) return
      return data.map(item => {
        return {
          label: item,
          value: item
        }
      })
    }
    //打开资源概览
    const handlePreview = row => {
      refs.tableView.open(row)
      data.isShowDetails = true
      /*
      nextTick(() => {
        refs?.drawerContent?.loadData(row)
      })*/
    }
    const closeDrawer = val => {
      data.isShowDetails = val
    }
    //打开资源绑定抽屉
    const handleSourceDrawer = () => {
      data.isShowSourceDrawer = true
      nextTick(() => {
        //请求筛选条件-下拉列表
        refs?.objectTable?.loadFilterList()

        //请求资源绑定目录
        refs?.objectTable?.loadTableData()
      })
    }
    const closeSourceDrawer = val => {
      data.isShowSourceDrawer = val
      nextTick(() => {
        // refs.table.fetch(1)

        //关闭资源绑定抽屉 刷新数据目录分类树 主要是统计
        refs?.classify?.getData()
      })
    }
    //切换目录
    const getNodeChecked = node => {
      data.currentNode = node
      objectList.value = node.children
      console.log('getNodeChecked', node) // eslint-disable-line
      // refs.table.fetch(1)
    }

    const iconMap = {
      table: 'table',
      defaultApi: 'apiServer_navbar'
    }
    const renderNode = ({ row }) => {
      let icon = 'folder-outline'

      if (row.isObject) {
        icon = iconMap[row.type]
      }
      return (
        <div class="cursor-pointer">
          <VIcon class="color-primary mr-2" size={18}>
            {icon}
          </VIcon>
          <span class="tree-item-icon none">
            <VIcon class="color-primary" size={18}>
              {icon}
            </VIcon>
          </span>
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
    loadFilterList()
    watch(
      () => root.$route.query,
      val => {
        // refs.table.fetch(1)
      }
    )
    onMounted(() => {
      // refs.table.fetch(1)
    })

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

    return {
      list,
      data,
      closeDrawer,
      closeSourceDrawer,
      handleSourceDrawer,
      renderNode,
      getNodeChecked,
      loadData,
      rest,
      handleDragStart,
      handleDragEnd,
      handleSelectionChange,
      dragState,
      objectList
    }
  },
  render() {
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
            v-model={this.data.searchParams}
            ref="classify"
            dragState={this.dragState}
            onNodeChecked={this.getNodeChecked}
          ></DiscoveryClassification>
        </div>
        <div class="flex flex-column flex-1">
          <div class="p-3">
            <ElBreadcrumb separator-class="el-icon-arrow-right">
              <ElBreadcrumbItem class="discovery-title">所有目录</ElBreadcrumbItem>
              <ElBreadcrumbItem class="discovery-title">Source</ElBreadcrumbItem>
            </ElBreadcrumb>
          </div>
          <div staticClass="flex-1" class={{ none: !this.data.isShowDetails }}>
            <TableView ref="tableView"></TableView>
          </div>
          <div staticClass="flex-1" class={{ none: this.data.isShowDetails }}>
            <ElTable
              class={{ none: this.data.isShowDetails }}
              ref="table"
              row-key="id"
              draggable
              data={this.objectList}
              treeProps={{ children: 'no_children' }}
              on={{
                'row-dragstart': this.handleDragStart,
                'row-dragend': this.handleDragEnd,
                'selection-change': this.handleSelectionChange
              }}
            >
              <el-table-column type="selection" width="55"></el-table-column>
              <el-table-column
                label={i18n.t('public_name')}
                prop="name"
                show-overflow-tooltip
                width="350px"
                scopedSlots={{
                  default: this.renderNode
                }}
              ></el-table-column>
              <el-table-column label={i18n.t('public_change_time')} prop="changeTime"></el-table-column>
            </ElTable>
          </div>
        </div>
        {/*<Drawer
          class="object-drawer-wrap overflow-hidden"
          width="850px"
          visible={this.data.isShowDetails}
          on={{ ['update:visible']: this.closeDrawer }}
        >
          <DrawerContent ref={'drawerContent'}></DrawerContent>
        </Drawer>*/}
        <el-drawer
          class="object-drawer-wrap"
          size="58%"
          title={i18n.t('datadiscovery_catalogue_ziyuanbangding')}
          visible={this.data.isShowSourceDrawer}
          on={{ ['update:visible']: this.closeSourceDrawer }}
        >
          <ObjectTable
            ref={'objectTable'}
            parentNode={this.data.currentNode}
            {...{ on: { fetch: this.closeSourceDrawer } }}
          ></ObjectTable>
        </el-drawer>
      </section>
    )
  }
})
