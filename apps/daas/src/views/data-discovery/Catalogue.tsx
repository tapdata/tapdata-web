import i18n from '@/i18n'
import { defineComponent, reactive, ref, watch, nextTick, onMounted } from '@vue/composition-api'
import { FilterBar, Drawer, VIcon } from '@tap/component'
import { TablePage, DiscoveryClassification } from '@tap/business'
import { discoveryApi } from '@tap/api'
import DrawerContent from '@/views/data-discovery/PreviewDrawer'
import ObjectTable from '@/views/data-discovery/ObjectTable'
import './index.scss'
import resize from '@tap/component/src/directives/resize'

export default defineComponent({
  props: [''],
  directives: {
    resize
  },
  setup(props, { refs, root }) {
    const list = ref([])
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
      // @ts-ignore
      refs.table.fetch(1)
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
      data.isShowDetails = true
      nextTick(() => {
        // @ts-ignore
        refs?.drawerContent?.loadData(row)
      })
    }
    const closeDrawer = val => {
      data.isShowDetails = val
    }
    //打开资源绑定抽屉
    const handleSourceDrawer = () => {
      data.isShowSourceDrawer = true
      nextTick(() => {
        // @ts-ignore
        //请求筛选条件-下拉列表
        refs?.objectTable?.loadFilterList()
        // @ts-ignore
        //请求资源绑定目录
        refs?.objectTable?.loadTableData()
      })
    }
    const closeSourceDrawer = val => {
      data.isShowSourceDrawer = val
      nextTick(() => {
        // @ts-ignore
        refs.table.fetch(1)
        // @ts-ignore
        //关闭资源绑定抽屉 刷新数据目录分类树 主要是统计
        refs?.classify?.getData()
      })
    }
    //切换目录
    const getNodeChecked = node => {
      data.currentNode = node
      // @ts-ignore
      refs.table.fetch(1)
    }
    const renderNode = ({ row }) => {
      return (
        <div class="cursor-pointer">
          <span class="tree-item-icon none">
            <VIcon class="color-primary" size={16}>
              table
            </VIcon>
          </span>
          <span
            class="col-new-field-name inline-block ellipsis align-middle color-primary  mr-4 "
            onClick={event => {
              event.stopPropagation()
              handlePreview(row)
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
        // @ts-ignore
        refs.table.fetch(1)
      }
    )
    onMounted(() => {
      // @ts-ignore
      refs.table.fetch(1)
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
        draggingRow,
        refs.root,
        'table-item'
      )
      ev.dataTransfer.setDragImage(draggingNodeImage, 0, 0)
    }

    const handleDragEnd = (row, column, event) => {
      dragState.isDragging = false
      dragState.draggingObjects = []
      dragState.dropNode = null
      refs.root.removeChild(draggingNodeImage)
    }

    const multipleSelectionMap = ref({})
    const handleSelectionChange = val => {
      multipleSelectionMap.value = val.reduce((obj, item) => {
        obj[item.id] = item
        return obj
      }, {})
    }

    const makeDragNodeImage = ($icon, node, parent = document.body, nodeType = 'tree-item') => {
      const dragImage = document.createElement('div')

      if (!node?.length) return dragImage
      dragImage.classList.add('drag-node-image')
      dragImage.style.position = 'absolute'
      dragImage.style.zIndex = '-100'
      dragImage.style.opacity = '1'
      parent.appendChild(dragImage)
      const container = document.createElement('div')
      container.className = 'drag-preview-container'

      if ($icon) {
        const icon = $icon.cloneNode(true)
        icon.className = 'drag-preview-icon'
        container.appendChild(icon)
      }

      const text = document.createElement('div')
      text.className = 'drag-preview-name ellipsis'
      text.innerHTML = nodeType === 'tree-item' ? node[0].data.name : node[0].name
      container.appendChild(text)
      dragImage.appendChild(container)

      if (node.length > 1) {
        let layer = document.createElement('div')
        layer.className = 'drag-preview-layerEffect'
        let dot = document.createElement('div')
        dot.className = node.length > 9 ? 'drag-preview-dot expand' : 'drag-preview-dot'
        dot.innerHTML = node.length
        dragImage.appendChild(layer)
        dragImage.appendChild(dot)
      }

      return dragImage
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
      makeDragNodeImage
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
            makeDragNodeImage={this.makeDragNodeImage}
            onNodeChecked={this.getNodeChecked}
          ></DiscoveryClassification>
        </div>
        <TablePage
          ref="table"
          row-key="id"
          remoteMethod={this.loadData}
          draggable
          on={{
            'row-dragstart': this.handleDragStart,
            'row-dragend': this.handleDragEnd,
            'selection-change': this.handleSelectionChange
          }}
        >
          <template slot="search">
            <div class="flex flex-row align-items-center mb-2">
              <span class="discovery-title ml-2 mr-2">{i18n.t('metadata_meta_type_directory')}</span>
              <span class="discovery-secondary-title mr-2"> {this.data.currentNode.value} </span>
              <span class="discovery-desc ml-2">{this.data.currentNode.desc} </span>
            </div>
            <FilterBar
              v-model={this.data.searchParams}
              items={this.data.filterItems}
              {...{ on: { fetch: this.rest } }}
            ></FilterBar>
          </template>
          <template slot="operation">
            {this.data.currentNode.readOnly ? (
              ' '
            ) : (
              <el-button
                type="primary"
                size="mini"
                onClick={() => {
                  this.handleSourceDrawer()
                }}
              >
                <span>{i18n.t('datadiscovery_catalogue_ziyuanbangding')}</span>
              </el-button>
            )}
          </template>
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column
            label={i18n.t('metadata_name')}
            prop="name"
            show-overflow-tooltip
            width="350px"
            scopedSlots={{
              default: this.renderNode
            }}
          ></el-table-column>
          <el-table-column label={i18n.t('metadata_type')} prop="type"></el-table-column>
          <el-table-column label={i18n.t('module_form_describtion')} prop="desc"></el-table-column>
        </TablePage>
        <Drawer
          class="object-drawer-wrap overflow-hidden"
          width="850px"
          visible={this.data.isShowDetails}
          on={{ ['update:visible']: this.closeDrawer }}
        >
          <DrawerContent ref={'drawerContent'}></DrawerContent>
        </Drawer>
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
