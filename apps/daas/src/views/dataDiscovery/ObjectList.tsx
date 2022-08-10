import { defineComponent, reactive, ref } from '@vue/composition-api'
import { TableList, FilterBar, Drawer } from '@tap/component'
import DrawerContent from './PreviewDrawer'
import { useI18n, useMessage } from '@/hooks'
import { discoveryApi } from '@tap/api'
import './object.scss'

export default defineComponent({
  setup() {
    const { $t } = useI18n()
    const { success } = useMessage()
    const list = ref([])
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
          key: 'status',
          type: 'select-inner',
          items: [],
          selectedWidth: '200px'
        },
        {
          label: '对象类型',
          key: 'type',
          type: 'select-inner',
          items: []
        },
        {
          label: '来源类型',
          key: 'type',
          type: 'select-inner',
          items: []
        },
        {
          label: '来源分类',
          key: 'type',
          type: 'select-inner',
          items: []
        },
        {
          placeholder: '对象名/来源名',
          key: 'connectionName',
          type: 'input'
        }
      ]
    })
    const loadData = () => {
      discoveryApi.list().then(res => {
        let { total, items } = res
        list.value = items || []
        data.page.total = total
      })
    }
    const handlePreview = row => {
      data.isShowDetails = true
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
    return {
      data,
      list,
      success,
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
                <FilterBar items={this.data.filterItems} on={{ ['update:fetch']: this.loadData }}></FilterBar>
              </div>
              <div class="object-page-operation-bar">
                <el-button size="mini">
                  <span>删除</span>
                </el-button>
                <el-button type="primary" size="mini">
                  <span>资源绑定</span>
                </el-button>
              </div>
            </div>
            <el-table data={this.list}>
              <el-table-column type="selection" width="55"></el-table-column>
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
              width="'800px'"
              visible={this.data.isShowDetails}
              on={{ ['update:visible']: this.closeDrawer }}
            >
              <DrawerContent ref="drawerContent"></DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>
    )
  }
})
