import { defineComponent, reactive, ref, nextTick, watch } from '@vue/composition-api'
import i18n from '@/i18n'
import { FilterBar } from '@tap/component'
import { discoveryApi } from '@tap/api'
import { useMessage } from '@/hooks'
import './index.scss'

export default defineComponent({
  props: ['parentNode'],
  setup(props, { root, emit, refs }) {
    const { category, type, sourceCategory, sourceType, queryKey } = root.$route.query || {}
    const list = ref([])
    const { error, success } = useMessage()
    const multipleSelection = ref([])
    const data = reactive({
      searchParams: {
        category: category || '',
        type: type || '',
        sourceCategory: sourceCategory || '',
        sourceType: sourceType || '',
        queryKey: queryKey || ''
      },
      tableLoading: false,
      desc: '',
      page: {
        size: 20,
        current: 1,
        total: 0,
        count: 1
      },
      filterItems: []
    })
    //加载table 数据
    const loadTableData = val => {
      let { category, type, sourceCategory, sourceType, queryKey } = data.searchParams
      data.page.current = val
      let { size, current } = data.page
      let where = {
        page: current,
        pageSize: size,
        itemTypes: props.parentNode?.item_type || []
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
          //选中被绑定的资源
          if (list.value?.length === 0) return
          list.value.forEach(t => {
            if (t?.allTags) {
              let usedRow = t?.allTags.filter(tag => tag.id === props.parentNode?.id) || []
              if (usedRow?.length > 0) {
                nextTick(() => {
                  // @ts-ignore
                  refs.multipleTable?.toggleRowSelection(t, true)
                })
              }
            }
          })
        })
        .finally(() => {
          data.tableLoading = false
        })
    }
    //请求过滤条件每一个下拉列表的数据
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
            items: dataAssembly(sourceType)
          },
          {
            label: i18n.t('datadiscovery_objectlist_laiyuanfenlei'),
            key: 'sourceCategory',
            type: 'select-inner',
            items: dataAssembly(sourceCategory)
          },
          {
            placeholder: i18n.t('datadiscovery_objectlist_duixiangminglaiyuan'),
            key: 'queryKey',
            type: 'input'
          }
        ]
      })
    }
    //table check box change
    const handleSelectionChange = val => {
      multipleSelection.value = val
    }
    //公用方法 处理数据结构
    const dataAssembly = data => {
      if (data?.length === 0) return
      return data.map(item => {
        return {
          label: item,
          value: item
        }
      })
    }
    //全选 只发一个接口（解绑/绑定）
    const saveAllTags = selection => {
      let data = selection.map(t => {
        return {
          id: t?.id,
          objCategory: t?.category
        }
      })
      if (data?.length === 0) {
        //全选解绑 传当前列表数据
        let listFilter = list.value.map(t => {
          return {
            id: t?.id,
            objCategory: t?.category
          }
        })
        submitTags(listFilter, 'patchTags')
      } else {
        submitTags(data, 'postTags')
      }
    }
    //单个资源绑定
    const saveTags = (selection, row) => {
      let data = [{ id: row?.id, objCategory: row?.category }]
      if (selection?.length > 0) {
        let findRow = selection.filter(t => row?.id === t.id) || []
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
      let where = {
        tagBindingParams: data,
        tagIds: [props.parentNode?.id]
      }
      discoveryApi[http](where)
        .then(() => {
          success(i18n.t('message_operation_succuess'))
        })
        .catch(err => {
          error(err)
        })
    }
    //监听路由变化 筛选条件变化
    watch(
      () => root.$route.query,
      val => {
        loadTableData(1)
      }
    )
    return {
      data,
      list,
      loadTableData,
      loadFilterList,
      handleSelectionChange,
      saveTags,
      saveAllTags
    }
  },
  render() {
    return (
      <section class="discovery-page-wrap">
        <div class="discovery-page-main-box">
          <div class="discovery-page-right" v-loading={this.data.tableLoading}>
            <div class="object-page-topbar">
              <div class="object-page-search-bar mt-2">
                <FilterBar
                  v-model={this.data.searchParams}
                  items={this.data.filterItems}
                  {...{ on: { fetch: this.loadTableData } }}
                ></FilterBar>
              </div>
            </div>
            <el-table
              ref={'multipleTable'}
              class="discovery-page-table"
              data={this.list}
              onselect={this.saveTags}
              onSelect-all={this.saveAllTags}
              onSelection-change={this.handleSelectionChange}
            >
              <el-table-column width="55" type="selection"></el-table-column>
              <el-table-column label={this.$t('object_list_name')} prop="name"></el-table-column>
              <el-table-column label={this.$t('object_list_classification')} prop="category"></el-table-column>
              <el-table-column label={this.$t('object_list_type')} prop="type"></el-table-column>
              <el-table-column label={this.$t('object_list_source_type')} prop="sourceType"></el-table-column>
              <el-table-column
                label={this.$t('datadiscovery_objectlist_laiyuanfenlei')}
                prop="sourceCategory"
              ></el-table-column>
              <el-table-column label={this.$t('object_list_source_information')} prop="sourceInfo"></el-table-column>
            </el-table>
            <footer>
              <el-pagination
                background
                class="table-page-pagination mt-3"
                layout="->,total, prev, pager, next, jumper"
                on={{ ['update:current-page']: this.loadTableData }}
                current-page={this.data.page.current}
                page-size={this.data.page.size}
                total={this.data.page.total}
                onCurrent-change={this.loadTableData}
              ></el-pagination>
            </footer>
          </div>
        </div>
      </section>
    )
  }
})
