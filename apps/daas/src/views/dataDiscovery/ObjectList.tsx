import { defineComponent, reactive, ref, watch } from '@vue/composition-api'
import i18n from '@/i18n'
import { FilterBar, Drawer } from '@tap/component'
import DrawerContent from './PreviewDrawer'
import { useMessage } from '@/hooks'
import { discoveryApi } from '@tap/api'
import './index.scss'

export default defineComponent({
  props: [''],
  setup(props, { refs, root }) {
    const { success } = useMessage()
    const list = ref([])
    const { category, type, sourceCategory, sourceType, queryKey } = root.$route.query || {}
    const data = reactive({
      tableLoading: false,
      searchParams: {
        category: category || '',
        type: type || '',
        sourceCategory: sourceCategory || '',
        sourceType: sourceType || '',
        queryKey: queryKey || ''
      },
      activeName: 'first',
      activeUser: 'admin',
      isShowDetails: false,
      page: {
        size: 20,
        current: 1,
        total: 0,
        count: 1
      },
      filterItems: []
    })
    const loadData = val => {
      let { category, type, sourceCategory, sourceType, queryKey } = data.searchParams
      data.page.current = val
      let { size, current } = data.page
      let where = {
        page: current,
        pageSize: size
      }
      category && (where['category'] = category)
      type && (where['type'] = type)
      sourceType && (where['sourceType'] = sourceType)
      sourceCategory && (where['sourceCategory'] = sourceCategory)
      queryKey && (where['queryKey'] = queryKey)
      data.tableLoading = true
      discoveryApi
        .list(where)
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
      let filterType = ['objCategory', 'objType', 'sourceCategory', 'sourceType']
      discoveryApi.filterList(filterType).then(res => {
        let { objCategory, objType, sourceCategory, sourceType } = res
        data.filterItems = [
          {
            label: i18n.t('object_list_classification'),
            key: 'category',
            type: 'select-inner',
            items: dataAssembly(objCategory),
            selectedWidth: '200px'
          },
          {
            label: i18n.t('object_list_type'),
            key: 'type',
            type: 'select-inner',
            items: dataAssembly(objType)
          },
          {
            label: i18n.t('object_list_source_type'),
            key: 'sourceType',
            type: 'select-inner',
            items: dataAssembly(sourceCategory)
          },
          {
            label: i18n.t('datadiscovery_objectlist_laiyuanfenlei'),
            key: 'sourceCategory',
            type: 'select-inner',
            items: dataAssembly(sourceType)
          },
          {
            placeholder: i18n.t('datadiscovery_objectlist_duixiangminglaiyuan'),
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
      // @ts-ignore
      refs.drawerContent.loadData(row)
    }
    const closeDrawer = val => {
      data.isShowDetails = val
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
    loadData(1)
    loadFilterList()
    watch(
      () => root.$route.query,
      val => {
        loadData(1)
      }
    )
    return {
      data,
      list,
      success,
      loadData,
      renderNode,
      closeDrawer
    }
  },
  render() {
    return (
      <section class="discovery-page-wrap">
        <div class="discovery-page-main-box">
          <div class="discovery-page-right">
            <div class="object-page-topbar">
              <div class="object-page-search-bar">
                <FilterBar
                  items={this.data.filterItems}
                  v-model={this.data.searchParams}
                  {...{ on: { fetch: this.loadData } }}
                ></FilterBar>
              </div>
            </div>
            <el-table class="discovery-page-table" data={this.list} v-loading={this.data.tableLoading}>
              <el-table-column
                label={this.$t('object_list_name')}
                prop="name"
                scopedSlots={{
                  default: this.renderNode
                }}
              ></el-table-column>
              <el-table-column label={this.$t('object_list_classification')} prop="category"></el-table-column>
              <el-table-column label={this.$t('object_list_type')} prop="type"></el-table-column>
              <el-table-column label={this.$t('object_list_source_type')} prop="sourceType"></el-table-column>
              <el-table-column label={this.$t('object_list_source_information')} prop="sourceInfo"></el-table-column>
            </el-table>
            <el-pagination
              background
              class="table-page-pagination mt-3"
              layout="->,total,  prev, pager, next, jumper"
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
          </div>
        </div>
      </section>
    )
  }
})
