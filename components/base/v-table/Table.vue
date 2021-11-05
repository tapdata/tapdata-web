<template>
  <div class="v-table-container">
    <ElTable
      v-loading="loading"
      v-bind="$attrs"
      v-on="$listeners"
      :data="list"
      ref="table"
      height="100%"
      class="table-container__table mt-3"
      @selection-change="handleSelectionChange"
    >
      <ColumnItem v-for="(item, index) in columns" :item="item" :key="index">
        <template v-for="(key, slot) of $scopedSlots" v-slot:[slot]="scope">
          <slot :name="slot" v-bind="scope"></slot>
        </template>
      </ColumnItem>
      <div slot="empty"><slot name="empty"></slot></div>
    </ElTable>
    <ElPagination
      v-if="hasPagination"
      background
      class="mt-3"
      :layout="layout"
      :current-page.sync="page.current"
      :page-sizes="[10, 20, 50, 100]"
      :page-size.sync="page.size"
      :total="page.total"
      :hide-on-single-page="hideOnSinglePage"
      @size-change="fetch(1)"
      @current-change="fetch"
    >
    </ElPagination>
  </div>
</template>

<script>
import ColumnItem from './Column'
import { delayTrigger } from '../../../util'
import moment from 'moment'
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
      }
    },
    data: {
      type: Array,
      default: () => []
    },
    hasPagination: {
      type: Boolean,
      default: true
    },
    hideOnSinglePage: {
      type: Boolean,
      default: false
    },
    layout: {
      type: String,
      default: 'total, sizes, ->, prev, pager, next, jumper'
    },
    defaultPageSize: {
      type: Number,
      default: 20
    },
    remoteMethod: Function,
    rowKey: [String, Function],
    spanMethod: [Function]
  },
  data() {
    return {
      loading: false,
      page: {
        current: 1,
        size: this.defaultPageSize,
        total: 0
      },
      list: [],
      multipleSelection: []
    }
  },
  watch: {
    data: {
      deep: true,
      handler(v) {
        v && this.fetch()
      }
    }
  },
  mounted() {
    this.fetch(1)
  },
  methods: {
    fetch(pageNum, debounce = 0, hideLoading, callback) {
      if (!this.remoteMethod) {
        this.list = this.data
        return
      }
      if (pageNum === 1) {
        this.multipleSelection = []
        this.$emit('selection-change', [])
        this.$refs?.table?.clearSelection()
      }
      this.page.current = pageNum || this.page.current
      this.$nextTick(() => {
        delayTrigger(() => {
          if (!hideLoading) {
            this.loading = true
          }
          this.remoteMethod({
            page: this.page,
            data: this.list
          })
            .then(({ data, total }) => {
              this.page.total = total
              this.list = data || []
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
    handleSelectionChange(val) {
      this.multipleSelection = val
      this.$emit('selection-change', val)
    },
    formatTime(time, fmt = 'YYYY-MM-DD HH:mm:ss') {
      return moment(time).format(fmt)
    }
  }
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
