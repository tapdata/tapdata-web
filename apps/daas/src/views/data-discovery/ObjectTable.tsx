import { discoveryApi } from '@tap/api'
import { TablePage } from '@tap/business'
import { FilterBar } from '@tap/component'
import { defineComponent, nextTick, onMounted, reactive, ref, watch } from 'vue'
import i18n from '@/i18n'
import './index.scss'

interface CustomContext extends SetupContext {
  refs: {
    multipleTable: InstanceType<typeof TablePage>
  }
}

export default defineComponent({
  props: ['parentNode'],
  setup(props, { root, emit, refs }) {
    const multipleTableRef = ref()
    const { category, type, sourceCategory, sourceType, queryKey } =
      root.$route.query || {}
    const list = ref([])
    const multipleSelection = ref([])
    const data = reactive({
      searchParams: {
        category: category || '',
        type: type || '',
        sourceCategory: sourceCategory || '',
        sourceType: sourceType || '',
        queryKey: queryKey || '',
      },
      tableLoading: false,
      desc: '',
      page: {
        size: 20,
        current: 1,
        total: 0,
        count: 1,
      },
      filterItems: [],
    })
    //加载table 数据
    const loadTableData = ({ page }) => {
      const { category, type, sourceCategory, sourceType, queryKey } =
        data.searchParams
      const { size, current } = page
      const where = {
        page: current,
        pageSize: size,
        itemTypes: props.parentNode?.item_type || [],
      }
      category && (where.category = category)
      type && (where.type = type)
      sourceType && (where.sourceType = sourceType)
      sourceCategory && (where.sourceCategory = sourceCategory)
      queryKey && (where.queryKey = queryKey)
      return discoveryApi.list(where).then((res) => {
        const { total, items } = res
        list.value = items || []
        //选中被绑定的资源
        if (list.value?.length === 0)
          return {
            total,
            data: items,
          }
        list.value.forEach((t) => {
          if (t?.allTags) {
            const usedRow =
              t?.allTags.filter((tag) => tag.id === props.parentNode?.id) || []
            if (usedRow?.length > 0) {
              nextTick(() => {
                // @ts-ignore
                multipleTableRef.value?.toggleRowSelection(t, true)
              })
            }
          }
        })
        return {
          total,
          data: items,
        }
      })
    }
    //请求过滤条件每一个下拉列表的数据
    const loadFilterList = () => {
      const filterType = [
        'objCategory',
        'objType',
        'sourceCategory',
        'sourceType',
      ]
      discoveryApi.filterList(filterType).then((res) => {
        const { objCategory, objType, sourceCategory, sourceType } = res
        data.filterItems = [
          {
            label: i18n.t('object_list_classification'),
            key: 'category',
            type: 'select-inner',
            items: dataAssembly(objCategory),
            selectedWidth: '200px',
          },
          {
            label: i18n.t('object_list_type'),
            key: 'type',
            type: 'select-inner',
            items: dataAssembly(objType),
          },
          {
            label: i18n.t('object_list_source_type'),
            key: 'sourceType',
            type: 'select-inner',
            items: dataAssembly(sourceType),
          },
          {
            label: i18n.t('datadiscovery_objectlist_laiyuanfenlei'),
            key: 'sourceCategory',
            type: 'select-inner',
            items: dataAssembly(sourceCategory),
          },
          {
            placeholder: i18n.t('datadiscovery_objectlist_duixiangminglaiyuan'),
            key: 'queryKey',
            type: 'input',
          },
        ]
      })
    }
    //table check box change
    const handleSelectionChange = (val) => {
      multipleSelection.value = val
    }
    //公用方法 处理数据结构
    const dataAssembly = (data) => {
      if (data?.length === 0) return
      return data.map((item) => {
        return {
          label: item,
          value: item,
        }
      })
    }
    //全选 只发一个接口（解绑/绑定）
    const saveAllTags = (selection) => {
      const data = selection.map((t) => {
        return {
          id: t?.id,
          objCategory: t?.category,
        }
      })
      if (data?.length === 0) {
        //全选解绑 传当前列表数据
        const listFilter = list.value.map((t) => {
          return {
            id: t?.id,
            objCategory: t?.category,
          }
        })
        submitTags(listFilter, 'patchTags')
      } else {
        submitTags(data, 'postTags')
      }
    }
    //单个资源绑定
    const saveTags = (selection, row) => {
      const data = [{ id: row?.id, objCategory: row?.category }]
      if (selection?.length > 0) {
        const findRow = selection.filter((t) => row?.id === t.id) || []
        if (findRow?.length > 0) {
          //绑定 post
          submitTags(data, 'postTags')
        } else {
          //解绑
          submitTags(data, 'patchTags')
        }
      } else {
        //解绑
        submitTags(data, 'patchTags')
      }
    }
    //统一提交绑定数据
    const submitTags = (data, http) => {
      const where = {
        tagBindingParams: data,
        tagIds: [props.parentNode?.id],
      }
      discoveryApi[http](where)
        .then(() => {
          ElMessage.success(i18n.t('public_message_operation_success'))
        })
        .catch((error_) => {
          ElMessage.error(error_)
        })
    }
    //监听路由变化 筛选条件变化
    watch(
      () => root.$route.query,
      (val) => {
        multipleTableRef.value.fetch(1)
      },
    )
    onMounted(() => {
      multipleTableRef.value.fetch(1)
    })
    return {
      data,
      list,
      loadTableData,
      loadFilterList,
      handleSelectionChange,
      saveTags,
      saveAllTags,
      multipleTableRef,
    }
  },
  render() {
    return (
      <section class="discovery-page-wrap catalogue-drawer-resource-wrap">
        <TablePage
          ref="multipleTableRef"
          row-key="id"
          remoteMethod={this.loadTableData}
          onselect={this.saveTags}
          onSelect-all={this.saveAllTags}
          onSelection-change={this.handleSelectionChange}
        >
          <template slot="search">
            <FilterBar
              items={this.data.filterItems}
              v-model={this.data.searchParams}
              onFetch={this.loadTableData}
            ></FilterBar>
          </template>
          <el-table-column width="55" type="selection"></el-table-column>
          <el-table-column
            label={this.$t('object_list_name')}
            prop="name"
            show-overflow-tooltip
            width="350px"
          >
            {this.renderNode}
          </el-table-column>
          <el-table-column
            width="145px"
            label={this.$t('object_list_classification')}
            prop="category"
          ></el-table-column>
          <el-table-column
            width="100px"
            label={this.$t('object_list_type')}
            prop="type"
          ></el-table-column>
          <el-table-column
            width="140px"
            label={this.$t('object_list_source_type')}
            prop="sourceType"
          ></el-table-column>
          <el-table-column
            width="145px"
            label={this.$t('datadiscovery_objectlist_laiyuanfenlei')}
            prop="sourceCategory"
          ></el-table-column>
          <el-table-column
            label={this.$t('object_list_source_information')}
            prop="sourceInfo"
            show-overflow-tooltip
            width="350px"
          ></el-table-column>
        </TablePage>
      </section>
    )
  },
})
