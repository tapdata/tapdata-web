import { defineComponent, reactive, ref } from '@vue/composition-api'
import { FilterBar } from '@tap/component'
import { discoveryApi } from '@tap/api'
import './object.scss'

export default defineComponent({
  setup() {
    const list = ref([])
    const data = reactive({
      isShowDetails: false,
      searchParams: '',
      desc: '',
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
    return {
      data,
      list,
      loadData
    }
  },
  render() {
    return (
      <div class="object-page-main-box flex-column pl-4 pr-4">
        <div class="object-page-topbar">
          <div class="object-page-search-bar">
            <FilterBar items={this.data.filterItems} {...{ on: { fetch: this.loadData } }}></FilterBar>
          </div>
        </div>
        <el-table data={this.list}>
          <el-table-column width="55" type="selection"></el-table-column>
          <el-table-column label={this.$t('object_list_name')} prop="name"></el-table-column>
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
        <el-button type="primary" size="mini" style={'width:30px;float:right'}>
          确认
        </el-button>
      </div>
    )
  }
})
