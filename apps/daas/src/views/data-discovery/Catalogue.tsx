import { discoveryApi } from '@tap/api'
import { makeDragNodeImage } from '@tap/business'
import { VIcon } from '@tap/component'
import resize from '@tap/component/src/directives/resize'
import { defineComponent, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import i18n from '@/i18n'
import './index.scss'

export default defineComponent({
  props: [''],
  directives: {
    resize,
  },
  setup(props, { refs, root }) {
    const route = useRoute()
    const classifyRef = ref()
    const tableRef = ref()
    const drawerContentRef = ref()
    const objectTableRef = ref()

    const list = ref([])
    const { sourceType, queryKey } = route.query || {}
    const data = reactive({
      isShowDetails: false,
      isShowSourceDrawer: false, //资源绑定
      tableLoading: false,
      searchParams: {
        sourceType: sourceType || '',
        queryKey: queryKey || '',
      },
      page: {
        size: 20,
        current: 1,
        total: 0,
        count: 1,
      },
      currentNode: '',
      filterItems: [],
    })
    const loadData = ({ page }) => {
      const { sourceType, queryKey } = data.searchParams
      const { size, current } = page
      const where = {
        page: current,
        pageSize: size,
        tagId: data?.currentNode?.id || '',
      }
      sourceType && (where.objType = sourceType)
      queryKey && (where.queryKey = queryKey)
      return discoveryApi.discoveryList(where).then((res) => {
        const { total, items } = res
        return {
          total,
          data: items,
        }
      })
    }
    const rest = () => {
      tableRef.value.fetch(1)
    }
    const loadFilterList = () => {
      const filterType = ['objType']
      discoveryApi.filterList(filterType).then((res) => {
        const { objType } = res
        data.filterItems = [
          {
            label: i18n.t('datadiscovery_catalogue_ziyuanleixing'),
            key: 'sourceType',
            type: 'select-inner',
            items: dataAssembly(objType),
            selectedWidth: '200px',
          },
          {
            placeholder: i18n.t('datadiscovery_catalogue_lianjieduixiangming'),
            key: 'queryKey',
            type: 'input',
          },
        ]
      })
    }
    const dataAssembly = (data) => {
      if (data?.length === 0) return
      return data.map((item) => {
        return {
          label: item,
          value: item,
        }
      })
    }
    //打开资源概览
    const handlePreview = (row) => {
      data.isShowDetails = true
      nextTick(() => {
        // @ts-ignore
        drawerContentRef.value?.loadData(row)
      })
    }
    const closeDrawer = (val) => {
      data.isShowDetails = val
    }
    //打开资源绑定抽屉
    const handleSourceDrawer = () => {
      data.isShowSourceDrawer = true
      nextTick(() => {
        //请求筛选条件-下拉列表
        objectTableRef.value?.loadFilterList()
        // @ts-ignore
        //请求资源绑定目录
        objectTableRef.value?.loadTableData()
      })
    }
    const closeSourceDrawer = (val) => {
      data.isShowSourceDrawer = val
      nextTick(() => {
        // @ts-ignore
        tableRef.value.fetch(1)
        // @ts-ignore
        //关闭资源绑定抽屉 刷新数据目录分类树 主要是统计
        classifyRef.value?.getData()
      })
    }
    //切换目录
    const getNodeChecked = (node) => {
      data.currentNode = node
      // @ts-ignore
      tableRef.value.fetch(1)
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
            onClick={(event) => {
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
      () => {
        tableRef.value.fetch(1)
      },
    )
    onMounted(() => {
      // @ts-ignore
      tableRef.value.fetch(1)
    })

    const dragState = reactive({
      isDragging: false,
      draggingObjects: [],
      dropNode: null,
      allowDrop: true,
    })

    let draggingNodeImage
    const handleDragStart = (row, column, ev) => {
      dragState.isDragging = true
      console.log('nodeDragStart', row, column, event) // eslint-disable-line
      const draggingRow = [row]

      if (row.id in multipleSelectionMap.value) {
        const selectionRows = Object.values(multipleSelectionMap.value)
        draggingRow.length = selectionRows.length
        dragState.draggingObjects = selectionRows
      } else {
        dragState.draggingObjects = [row]
      }

      draggingNodeImage = makeDragNodeImage(
        ev.currentTarget.querySelector('.tree-item-icon'),
        row.name,
        dragState.draggingObjects.length,
      )
      ev.dataTransfer.setDragImage(draggingNodeImage, 0, 0)
    }

    const handleDragEnd = () => {
      dragState.isDragging = false
      dragState.draggingObjects = []
      dragState.dropNode = null
      draggingNodeImage.remove()
      draggingNodeImage = null
    }

    const multipleSelectionMap = ref({})
    const handleSelectionChange = (val: { id: string }[]) => {
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
      classifyRef,
      tableRef,
      drawerContentRef,
    }
  },
  render() {
    return (
      <section class="discovery-page-wrap flex">
        <div
          {...{
            directives: [
              {
                name: 'resize',
                value: {
                  minWidth: 300,
                  maxWidth: 600,
                },
                modifiers: {
                  right: true,
                },
              },
            ],
          }}
          class="page-left border-right"
        >
          <DiscoveryClassification
            v-model={this.data.searchParams}
            ref="classifyRef"
            dragState={this.dragState}
            onNodeChecked={this.getNodeChecked}
          ></DiscoveryClassification>
        </div>
        <TablePage
          ref="tableRef"
          row-key="id"
          remoteMethod={this.loadData}
          draggable
          onRowDragstart={this.handleDragStart}
          onRowDragend={this.handleDragEnd}
          onSelectionChange={this.handleSelectionChange}
        >
          <template slot="search">
            <div class="flex flex-row align-items-center mb-2">
              <span class="discovery-title ml-2 mr-2">
                {i18n.t('metadata_meta_type_directory')}
              </span>
              <span class="discovery-secondary-title mr-2">
                {' '}
                {this.data.currentNode.value}{' '}
              </span>
              <span class="discovery-desc ml-2">
                {this.data.currentNode.desc}{' '}
              </span>
            </div>
            <FilterBar
              v-model={this.data.searchParams}
              items={this.data.filterItems}
              onFetch={this.rest}
            ></FilterBar>
          </template>
          <template slot="operation">
            {this.data.currentNode.readOnly ? (
              ' '
            ) : (
              <el-button
                type="primary"
                onClick={() => {
                  this.handleSourceDrawer()
                }}
              >
                <span>{i18n.t('datadiscovery_catalogue_ziyuanbangding')}</span>
              </el-button>
            )}
          </template>
          <el-table-column
            type="selection"
            width="32"
            align="center"
          ></el-table-column>
          <el-table-column
            label={i18n.t('public_name')}
            prop="name"
            show-overflow-tooltip
            width="350px"
          >
            {this.renderNode}
          </el-table-column>
          <el-table-column
            label={i18n.t('public_type')}
            prop="type"
          ></el-table-column>
          <el-table-column
            label={i18n.t('public_description')}
            prop="desc"
          ></el-table-column>
        </TablePage>
        <Drawer
          class="object-drawer-wrap overflow-hidden"
          width="850px"
          visible={this.data.isShowDetails}
          onUpdate:visible={this.closeDrawer}
        >
          <DrawerContent ref="drawerContentRef"></DrawerContent>
        </Drawer>
        <el-drawer
          class="object-drawer-wrap"
          size="58%"
          title={i18n.t('datadiscovery_catalogue_ziyuanbangding')}
          modelValue={this.data.isShowSourceDrawer}
          onUpdate:modelValue={this.closeSourceDrawer}
        >
          <ObjectTable
            ref="objectTableRef"
            parentNode={this.data.currentNode}
            onFetch={this.closeSourceDrawer}
          ></ObjectTable>
        </el-drawer>
      </section>
    )
  },
})
