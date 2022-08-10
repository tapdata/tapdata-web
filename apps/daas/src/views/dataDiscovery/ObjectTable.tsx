import { defineComponent, reactive } from '@vue/composition-api'
import { TablePage, FilterBar } from '@tap/component'
import './catalogue.scss'

export default defineComponent({
  setup() {
    const data = reactive({
      isShowDetails: false,
      searchParams: '',
      desc: '',
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
    const getData = () => {
      console.log('1234')
    }
    return {
      data,
      getData
    }
  },
  render() {
    return (
      <TablePage ref="table" row-key="id+indexName" class="share-list" remoteMethod={this.getData}>
        <template slot="search">
          <FilterBar v-model={this.data.searchParams} items="filterItems" fetch="table.fetch(1)"></FilterBar>
        </template>
        <el-table-column width="55" type="selection"></el-table-column>
        <el-table-column min-width="250" label={this.$t('object_list_name')} prop="name"></el-table-column>
        <el-table-column min-width="120" label={this.$t('object_list_classification')}></el-table-column>
        <el-table-column min-width="150" label={this.$t('object_list_type')}></el-table-column>
        <el-table-column min-width="110" label={this.$t('object_list_source_type')}></el-table-column>
        <el-table-column min-width="210" label={this.$t('object_list_source_information')}></el-table-column>
      </TablePage>
    )
  }
})
