import { defineComponent, reactive, ref, nextTick, watch } from '@vue/composition-api'
import { FilterBar } from '@tap/component'
import { discoveryApi } from '@tap/api'
import { useI18n, useMessage } from '@/hooks'
import './index.scss'

export default defineComponent({
  props: ['parentId'],
  setup(props, { root, emit, refs }) {
    const { category, type, sourceCategory, sourceType, queryKey } = root.$route.query || {}
    const list = ref([])
    const { error, success } = useMessage()
    const multipleSelection = ref([])
    const data = reactive({
      isShowDetails: false,
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
        size: 10,
        current: 1,
        total: 0,
        count: 1
      },
      filterItems: []
    })
    const loadTableData = val => {
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
          //选中被绑定的资源
          if (list.value?.length === 0) return
          list.value.forEach(t => {
            if (t?.allTags) {
              let usedRow = t?.allTags.filter(tag => tag.id === props.parentId) || []
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
    const loadFilterList = () => {
      let filterType = ['objCategory', 'objType', 'sourceCategory', 'sourceType']
      discoveryApi.filterList(filterType).then(res => {
        let { objCategory, objType, sourceCategory, sourceType } = res
        data.filterItems = [
          {
            label: '对象分类',
            key: 'category',
            type: 'select-inner',
            items: dataAssembly(objCategory),
            selectedWidth: '200px'
          },
          {
            label: '对象类型',
            key: 'type',
            type: 'select-inner',
            items: dataAssembly(objType)
          },
          {
            label: '来源类型',
            key: 'sourceType',
            type: 'select-inner',
            items: dataAssembly(sourceCategory)
          },
          {
            label: '来源分类',
            key: 'sourceCategory',
            type: 'select-inner',
            items: dataAssembly(sourceType)
          },
          {
            placeholder: '对象名/来源名',
            key: 'queryKey',
            type: 'input'
          }
        ]
      })
    }
    const handleSelectionChange = val => {
      multipleSelection.value = val
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
    const saveAllTags = selection => {
      let data = selection.map(t => {
        return {
          id: t?.id,
          objCategory: t?.category
        }
      })
      submitTags(data, 'postTags', [props.parentId])
    }
    const saveTags = (selection, row) => {
      if (selection?.length > 0) {
        let data = [{ id: row?.id, objCategory: row?.category }]
        let findRow = selection.filter(t => row?.id === t.id) || []
        if (findRow?.length > 0) {
          //绑定 post
          submitTags(data, 'postTags', [props.parentId])
        } else {
          //解绑
          let tagIds = row?.listtags.filter(t => t.id !== props.parentId).map(t => t.id)
          submitTags(data, 'patchTags', tagIds)
        }
      }
    }
    const submitTags = (data, http, tagIds) => {
      let where = {
        tagBindingParams: data,
        tagIds: tagIds
      }
      discoveryApi[http](where)
        .then(() => {
          success('操作成功')
        })
        .catch(err => {
          error(err)
        })
    }
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
              <el-table-column label={this.$t('object_list_source_information')} prop="sourceInfo"></el-table-column>
            </el-table>
            <footer>
              <el-pagination
                background
                class="table-page-pagination mt-3"
                layout="->,total, sizes,  prev, pager, next, jumper"
                on={{ ['update:current-page']: this.loadTableData }}
                current-page={this.data.page.current}
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
