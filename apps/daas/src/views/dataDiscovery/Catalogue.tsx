import { defineComponent, reactive } from '@vue/composition-api'
import { Classification, TableList, FilterBar } from '@tap/component'
import './catalogue.scss'

export default defineComponent({
  setup() {
    const data = reactive({
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
            <Classification v-model={this.data.searchParams} ref="classify" types=""></Classification>
          </div>
          <div class="page-right">
            <div class="flex flex-row align-items-center mb-2">
              <span class="ml-2 mr-2">目录</span>
              <span class="mr-2"> FDM </span>
              <span>
                <ElInput class="border-0" size="mini" v-model={this.data.desc} clearable></ElInput>
              </span>
            </div>
            <div class="catalogue-page-topbar">
              <div class="catalogue-page-search-bar">
                <FilterBar items={this.data.filterItems}></FilterBar>
              </div>
              <div class="catalogue-page-operation-bar">
                <ElButton size="mini">
                  <span>资源解绑</span>
                </ElButton>
                <ElButton type="primary" size="mini">
                  <span>资源绑定</span>
                </ElButton>
              </div>
            </div>
            <TableList columns={this.data.columns}>
              <template slot="select" slot-scope="scope">
                <span></span>
              </template>
            </TableList>
          </div>
        </div>
      </div>
    )
  }
})
