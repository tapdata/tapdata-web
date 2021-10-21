<template>
  <div class="v-list">
    <ElTable
      v-loading="loading"
      v-bind="$attrs"
      v-on="$listeners"
      :data="list"
      ref="table"
      height="100%"
      class="v-list__table mt-3"
      @selection-change="handleSelectionChange"
    >
      <ElTableColumn
        v-for="(item, index) in columns"
        v-bind="item"
        :key="index"
        :sortable="item.sortable ? 'custom' : false"
      >
        <template v-if="item.slotName" v-slot="scope">
          <slot :name="item.slotName" :row="scope.row"></slot>
        </template>
        <template v-if="item.dataType === 'time'" v-slot="scope">
          <div>{{ formatTime(scope.row[item.prop], item.fmt) }}</div>
        </template>
      </ElTableColumn>
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
import { delayTrigger } from '../../util'
import moment from 'moment'
export default {
  name: 'VTable',
  props: {
    columns: {
      type: Array,
      default: () => {
        return []
      }
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
  mounted() {
    this.fetch(1)
  },
  methods: {
    fetch(pageNum, debounce = 0, hideLoading, callback) {
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
          this.remoteMethod &&
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
.v-list {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}
.v-list__table {
  flex: 1;
  overflow: auto;
  border-bottom: none;
}
</style>
