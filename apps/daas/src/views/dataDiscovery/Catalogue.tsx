import { defineComponent, reactive } from '@vue/composition-api'
import { Classification, TableList, FilterBar, Drawer } from '@tap/component'
import ObjectTable from '@/views/dataDiscovery/ObjectTable'
import './catalogue.scss'

export default defineComponent({
  setup() {
    const data = reactive({
      isShowDetails: false,
      searchParams: '',
      desc: '',
      columns: [
        {
          label: '名称',
          prop: 'name'
        },
        {
          label: '类型',
          prop: 'type'
        },
        {
          label: '描述',
          prop: 'desc'
        }
      ],
      filterItems: [
        {
          label: '资源类型',
          key: 'type',
          type: 'select-inner',
          items: [],
          selectedWidth: '200px'
        },
        {
          placeholder: '连接对象名',
          key: 'connectionName',
          type: 'input'
        }
      ]
    })
    return {
      data
    }
  },
  render() {
    return (
      <div class="classify-wrap">
        <div class="catalogue-page-main-box flex">
          <div class="page-left">
            <Classification v-model={this.data.searchParams} ref="classify"></Classification>
          </div>
          <div class="page-right">
            <div class="flex flex-row align-items-center mb-2">
              <span class="ml-2 mr-2">目录</span>
              <span class="mr-2"> FDM </span>
              <span>
                <el-input class="border-0" size="mini" v-model={this.data.desc} clearable></el-input>
              </span>
            </div>
            <div class="catalogue-page-topbar">
              <div class="catalogue-page-search-bar">
                <FilterBar items={this.data.filterItems}></FilterBar>
              </div>
              <div class="catalogue-page-operation-bar">
                <el-button type="primary" size="mini">
                  <span>资源绑定</span>
                </el-button>
              </div>
            </div>
            <TableList columns={this.data.columns}></TableList>
            <Drawer
              class="object-drawer-wrap"
              width={'800px'}
              visible={this.data.isShowDetails}
              {...{ on: { 'update:visible': this.data.isShowDetails } }}
            >
              <ObjectTable></ObjectTable>
            </Drawer>
          </div>
        </div>
      </div>
    )
  }
})
