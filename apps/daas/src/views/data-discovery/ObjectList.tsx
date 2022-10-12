import { defineComponent, reactive, ref, computed, watch, onMounted } from '@vue/composition-api'
import i18n from '@/i18n'
import { FilterBar, Drawer } from '@tap/component'
import { TablePage } from '@tap/business'
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
        category: category || '', //对象分类
        type: type || '', //对象类型
        sourceCategory: sourceCategory || '', //来源分类
        sourceType: sourceType || '', //来源类型
        queryKey: queryKey || '' //输入搜索值
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
    const loadData = ({ page }) => {
      let { category, type, sourceCategory, sourceType, queryKey } = data.searchParams
      let { size, current } = page
      let where = {
        page: current,
        pageSize: size
      }
      category && (where['category'] = category)
      type && (where['type'] = type)
      sourceType && (where['sourceType'] = sourceType)
      sourceCategory && (where['sourceCategory'] = sourceCategory)
      queryKey && (where['queryKey'] = queryKey)
      return discoveryApi.list(where).then(res => {
        let { total, items } = res
        return {
          total: total,
          data: items
        }
      })
    }
    //请求筛选条件-下拉列表
    const loadFilterList = () => {
      let filterType = ['objCategory', 'objType', 'sourceCategory', 'sourceType']
      discoveryApi.filterList(filterType).then(res => {
        let { objCategory, objType, sourceCategory, sourceType } = res
        data.filterItems = [
          {
            label: i18n.t('object_list_classification'),
            key: 'category', //对象分类
            type: 'select-inner',
            items: dataAssembly(objCategory),
            selectedWidth: '200px'
          },
          {
            label: i18n.t('object_list_type'),
            key: 'type', //对象类型
            type: 'select-inner',
            items: dataAssembly(objType)
          },
          {
            label: i18n.t('object_list_source_type'),
            key: 'sourceType', //来源类型
            type: 'select-inner',
            items: dataAssembly(sourceType)
          },
          {
            label: i18n.t('datadiscovery_objectlist_laiyuanfenlei'),
            key: 'sourceCategory', //来源分类
            type: 'select-inner',
            items: dataAssembly(sourceCategory)
          },
          {
            placeholder: i18n.t('datadiscovery_objectlist_duixiangminglaiyuan'),
            key: 'queryKey', //输入搜索名称
            type: 'input'
          }
        ]
      })
    }
    //公用方法 格式化数据
    const dataAssembly = data => {
      if (data?.length === 0) return
      return data.map(item => {
        return {
          label: item,
          value: item
        }
      })
    }
    //打开对象概览
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
    loadFilterList()
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
        <TablePage ref="table" row-key="id" remoteMethod={this.loadData}>
          <template slot="search">
            <FilterBar
              items={this.data.filterItems}
              v-model={this.data.searchParams}
              {...{ on: { fetch: this.loadData } }}
            ></FilterBar>
          </template>
          <el-table-column
            label={this.$t('object_list_name')}
            prop="name"
            show-overflow-tooltip
            width="350px"
            scopedSlots={{
              default: this.renderNode
            }}
          ></el-table-column>
          <el-table-column
            width="145px"
            label={this.$t('object_list_classification')}
            prop="category"
          ></el-table-column>
          <el-table-column width="100px" label={this.$t('object_list_type')} prop="type"></el-table-column>
          <el-table-column width="140px" label={this.$t('object_list_source_type')} prop="sourceType"></el-table-column>
          <el-table-column
            width="145px"
            label={this.$t('datadiscovery_objectlist_laiyuanfenlei')}
            prop="sourceCategory"
          ></el-table-column>
          <el-table-column label={this.$t('object_list_source_information')} prop="sourceInfo"></el-table-column>
        </TablePage>
        <Drawer
          class="object-drawer-wrap"
          width="850px"
          visible={this.data.isShowDetails}
          on={{ ['update:visible']: this.closeDrawer }}
        >
          <DrawerContent ref={'drawerContent'}></DrawerContent>
        </Drawer>
      </section>
    )
  }
})
