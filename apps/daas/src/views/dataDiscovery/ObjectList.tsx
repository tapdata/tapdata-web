import { defineComponent, reactive, ref } from '@vue/composition-api'
import { FilterBar, Drawer } from '@tap/component'
import DrawerContent from './PreviewDrawer'
import { useI18n, useMessage } from '@/hooks'
import { discoveryApi } from '@tap/api'
import './object.scss'

export default defineComponent({
  props: [''],
  setup(props, { refs }) {
    const { $t } = useI18n()
    const { success } = useMessage()
    const list = ref([])
    const objType = ref([])
    const objCategory = ref([])
    const sourceCategory = ref([])
    const sourceType = ref([])
    const data = reactive({
      searchParams: {
        taskName: '',
        connectionName: ''
      },
      activeName: 'first',
      activeUser: 'admin',
      isShowDetails: false,
      page: {
        size: 10,
        current: 1,
        total: 0,
        count: 1
      },
      filterItems: [
        {
          label: '对象分类',
          key: 'category',
          type: 'select-inner',
          items: objCategory.value,
          selectedWidth: '200px'
        },
        {
          label: '对象类型',
          key: 'type',
          type: 'select-inner',
          items: objType.value
        },
        {
          label: '来源类型',
          key: 'sourceType',
          type: 'select-inner',
          items: sourceCategory.value
        },
        {
          label: '来源分类',
          key: 'sourceCategory',
          type: 'select-inner',
          items: sourceType.value
        },
        {
          placeholder: '对象名/来源名',
          key: 'queryKey',
          type: 'input'
        }
      ]
    })
    const loadData = () => {
      // @ts-ignore
      let { category, type, sourceCategory, sourceType, queryKey } = data.searchParams
      let where = {}
      category && (where['category'] = category)
      type && (where['type'] = type)
      sourceType && (where['sourceType'] = sourceType)
      sourceCategory && (where['sourceCategory'] = sourceCategory)
      queryKey && (where['queryKey'] = queryKey)

      discoveryApi.list(where).then(res => {
        let { total, items } = res
        list.value = items || []
        data.page.total = total
      })
    }
    const loadFilterList = () => {
      discoveryApi.filterList().then(res => {
        let { objCategory, objType, sourceCategory, sourceType } = res
        objCategory.value = objCategory ? objCategory : []
        objType.value = objType || []
        sourceCategory.value = sourceCategory || []
        sourceType.value = sourceType || []
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
    loadData()
    loadFilterList()
    return {
      data,
      list,
      success,
      objCategory,
      objType,
      sourceCategory,
      sourceType,
      $t,
      loadData,
      renderNode,
      closeDrawer
    }
  },
  render() {
    return (
      <div class="classify-wrap">
        <div class="object-page-main-box flex">
          <div class="object-page-right">
            <div class="object-page-topbar">
              <div class="object-page-search-bar">
                <FilterBar items={this.data.filterItems} {...{ on: { fetch: this.loadData } }}></FilterBar>
              </div>
            </div>
            <el-table data={this.list}>
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
              layout="->,total, sizes,  prev, pager, next, jumper"
              on={{ ['update:current-page']: this.loadData }}
              current-page={this.data.page.current}
              total={this.data.page.total}
              onCurrent-change={this.loadData}
            ></el-pagination>
            <Drawer
              class="object-drawer-wrap"
              width="'1200px'"
              visible={this.data.isShowDetails}
              on={{ ['update:visible']: this.closeDrawer }}
            >
              <DrawerContent ref={'drawerContent'}></DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>
    )
  }
})
