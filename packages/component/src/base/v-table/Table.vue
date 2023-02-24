<template>
  <div ref="vTableContainer" class="v-table-container">
    <ElTable
      v-bind="$attrs"
      v-loading="loading"
      :data="list"
      ref="table"
      class="table-container__table"
    >
      <ColumnItem v-for="(item, index) in columns" :item="item" :key="index">
        <template v-for="(key, slot) of $scopedSlots" v-slot:[slot]="scope">
          <slot v-bind="scope" :name="slot"></slot>
        </template>
      </ColumnItem>
      <template v-slot:empty>
        <div><slot name="empty"></slot></div>
      </template>
    </ElTable>
    <ElPagination
      v-bind="Object.assign({}, options, pageOptions)"
      v-if="showPage"
      class="mt-3"
      v-model:current-page="page.current"
      v-model:page-size="page.size"
      :total="page.total"
      @size-change="fetch(1)"
      @current-change="fetch"
    >
    </ElPagination>
  </div>
</template>

<script>
import { $on, $off, $once, $emit } from '../../utils/gogocodeTransfer'
import ColumnItem from './Column'
import { delayTrigger } from '@tap/shared'
export default {
  name: 'VTable',
  components: { ColumnItem },
  props: {
    columns: {
      type: Array,
      default: () => {
        return []
        // 格式如下：
        // [
        //   {
        //     label: '地址信息',
        //     prop: 'address',
        //     children: [
        //       {
        //         label: '省份',
        //         prop: 'province'
        //       },
        //       {
        //         label: '城市',
        //         prop: 'city',
        //         children: [
        //           {
        //             label: '区',
        //             prop: 'area'
        //           },
        //           {
        //             label: '县',
        //             prop: 'county'
        //           }
        //         ]
        //       }
        //     ]
        //   },
        //   {
        //     label: '用户名',
        //     prop: 'username',
        //     minWidth: 160
        //   },
        //   {
        //     label: '操作时间',
        //     prop: 'createTime',
        //     dataType: 'time',
        //     width: 180
        //   },
        //   {
        //     label: '操作描述',
        //     prop: 'desc',
        //     headerSlot: 'descHeader', // 表头
        //     slotName: 'desc',
        //     minWidth: 300
        //   }
        // ]
      },
    },
    data: {
      type: Array,
      default: () => [],
    },
    hasPagination: {
      type: Boolean,
      default: true,
    },
    remoteMethod: Function,
    pageOptions: {
      type: Object,
      default: () => {
        return {}
      },
    },
    remoteData: {
      type: [String, Object, Array],
    },
    hideOnSinglePage: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      loading: false,
      page: {
        current: 1,
        size: this.pageOptions.pageSize || 20,
        total: 0,
      },
      list: [],
      multipleSelection: [],
      options: {
        background: true,
        layout: 'total, sizes, ->, prev, pager, next, jumper',
        pageSizes: [10, 20, 50, 100],
      },
      nonePage: false,
      itemHeight: 42,
    }
  },
  computed: {
    showPage() {
      if (this.hideOnSinglePage) {
        return this.hasPagination && !this.nonePage
      }
      return this.hasPagination
    },
    table() {
      return this.$refs?.table
    },
  },
  watch: {
    data: {
      deep: true,
      handler(v) {
        v && this.fetch()
      },
    },
    remoteData: {
      deep: true,
      handler(v1, v2) {
        if (JSON.stringify(v1) !== JSON.stringify(v2)) {
          this.fetch()
        }
      },
    },
  },
  mounted() {
    this.fetch(1)
  },
  methods: {
    fetch(pageNum, debounce = 0, hideLoading, callback) {
      if (pageNum === 1) {
        this.multipleSelection = []
        $emit(this, 'selection-change', [])
        this.$refs?.table?.clearSelection()
      }
      this.page.current = pageNum || this.page.current
      if (!this.remoteMethod) {
        if (this.$attrs.isPage) {
          this.page.total = this.data.length
          let { current, size } = this.page
          this.list = this.data.slice((current - 1) * size, current * size)
          return
        }
        this.list = this.data
        this.nonePage = this.list.length <= this.page.size
        return
      }
      this.$nextTick(() => {
        delayTrigger(() => {
          if (!hideLoading) {
            this.loading = true
          }
          this.remoteMethod({
            page: this.page,
            data: this.list,
          })
            .then(({ data, total }) => {
              this.page.total = total
              if (JSON.stringify(this.list) !== JSON.stringify(data)) {
                this.list = data || []
              }
              this.nonePage = this.page.total <= this.list.length
              if (total > 0 && (!data || !data.length)) {
                setTimeout(() => {
                  this.fetch(this.page.current - 1)
                }, 0)
              }
            })
            .finally(() => {
              this.loading = false
              callback?.(this.getData())
            })
        }, debounce)
      })
    },
    getData() {
      return this.list
    },
    doLayout() {
      this.table.doLayout()
    },
    getPage() {
      return this.page
    },
  },
  emits: ['selection-change'],
}
</script>

<style lang="scss" scoped>
.v-table-container {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}
.table-container__table {
  flex: 1;
  overflow: auto;
  border-bottom: none;
}
</style>
