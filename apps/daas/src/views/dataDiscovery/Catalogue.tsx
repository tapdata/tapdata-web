import { defineComponent, reactive, ref, watch, nextTick } from '@vue/composition-api'
import { FilterBar, Drawer, DiscoveryClassification } from '@tap/component'
import { discoveryApi } from '@tap/api'
import DrawerContent from '@/views/dataDiscovery/PreviewDrawer'
import ObjectTable from '@/views/dataDiscovery/ObjectTable'
import './index.scss'

export default defineComponent({
  props: [''],
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
    const loadData = val => {
      let { sourceType, queryKey } = data.searchParams
      data.page.current = val
      let { size, current } = data.page
      let where = {
        page: current,
        pageSize: size,
        tagId: data.currentNode['id'] || ''
      }
      sourceType && (where['sourceType'] = sourceType)
      queryKey && (where['queryKey'] = queryKey)
      data.tableLoading = true
      discoveryApi
        .discoveryList(where)
        .then(res => {
          let { total, items } = res
          list.value = items || []
          data.page.total = total
        })
        .finally(() => {
          data.tableLoading = false
        })
    }
    const loadFilterList = () => {
      let filterType = ['sourceType']
      discoveryApi.filterList(filterType).then(res => {
        let { sourceType } = res
        data.filterItems = [
          {
            label: '资源类型',
            key: 'sourceType',
            type: 'select-inner',
            items: dataAssembly(sourceType),
            selectedWidth: '200px'
          },
          {
            placeholder: '连接对象名',
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
    const handleSourceDrawer = () => {
      data.isShowSourceDrawer = true
      nextTick(() => {
        // @ts-ignore
        refs?.objectTable?.loadFilterList()
        // @ts-ignore
        refs?.objectTable?.loadTableData()
      })
    }
    const closeSourceDrawer = val => {
      data.isShowSourceDrawer = val
      nextTick(() => {
        loadData(1)
        // @ts-ignore
        refs?.classify?.getData()
      })
    }
    const getNodeChecked = node => {
      data.currentNode = node
      loadData(1)
    }
    const renderNode = ({ row }) => {
      return (
        <div class="cursor-pointer">
          <span
            class="col-new-field-name inline-block ellipsis align-middle  mr-4 "
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
        loadData(1)
      }
    )
    return {
      list,
      data,
      closeDrawer,
      closeSourceDrawer,
      handleSourceDrawer,
      renderNode,
      getNodeChecked,
      loadData
    }
  },
  render() {
    return (
      <section class="discovery-page-wrap">
        <div class="discovery-page-main-box flex-row">
          <div class="page-left">
            <DiscoveryClassification
              v-model={this.data.searchParams}
              ref="classify"
              {...{ on: { nodeChecked: this.getNodeChecked } }}
            ></DiscoveryClassification>
          </div>
          <div class="discovery-page-right">
            <div class="flex flex-row align-items-center mb-2">
              <span class="ml-2 mr-2">目录</span>
              <span class="mr-2"> {this.data.currentNode.value} </span>
            </div>
            <div class="catalogue-page-topbar">
              <div class="catalogue-page-search-bar">
                <FilterBar
                  v-model={this.data.searchParams}
                  items={this.data.filterItems}
                  {...{ on: { fetch: this.loadData } }}
                ></FilterBar>
              </div>
              <div class="catalogue-page-operation-bar">
                <el-button
                  type="primary"
                  size="mini"
                  onClick={() => {
                    this.handleSourceDrawer()
                  }}
                >
                  <span>资源绑定</span>
                </el-button>
              </div>
            </div>
            <el-table class="discovery-page-table" data={this.list} v-loading={this.data.tableLoading}>
              <el-table-column
                label="名称"
                prop="name"
                scopedSlots={{
                  default: this.renderNode
                }}
              ></el-table-column>
              <el-table-column label="类型" prop="type"></el-table-column>
              <el-table-column label="描述" prop="desc"></el-table-column>
            </el-table>
            <el-pagination
              background
              class="table-page-pagination mt-3"
              layout="->,total, prev, pager, next, jumper"
              on={{ ['update:current-page']: this.loadData }}
              current-page={this.data.page.current}
              total={this.data.page.total}
              onCurrent-change={this.loadData}
            ></el-pagination>
            <Drawer
              class="object-drawer-wrap"
              width="850px"
              visible={this.data.isShowDetails}
              on={{ ['update:visible']: this.closeDrawer }}
            >
              <DrawerContent ref={'drawerContent'}></DrawerContent>
            </Drawer>
            <el-drawer
              class="object-drawer-wrap"
              size="56%"
              title="资源绑定"
              visible={this.data.isShowSourceDrawer}
              on={{ ['update:visible']: this.closeSourceDrawer }}
            >
              <ObjectTable
                ref={'objectTable'}
                parentNode={this.data.currentNode}
                {...{ on: { fetch: this.closeSourceDrawer } }}
              ></ObjectTable>
            </el-drawer>
          </div>
        </div>
      </section>
    )
  }
})
