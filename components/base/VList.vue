<template>
  <div class="v-list__container">
    <El-table
      v-loading="loading"
      ref="table"
      class="v-list__table mt-3"
      height="100%"
      :data="list"
      @selection-change="handleSelectionChange"
      @sort-change="$emit('sort-change', $event)"
    >
      <slot></slot>
      <div slot="empty"><slot name="empty"></slot></div>
    </El-table>
    <ElPagination
      background
      class="mt-3"
      layout="total, sizes, ->, prev, pager, next, jumper"
      :current-page.sync="page.current"
      :page-sizes="[10, 20, 50, 100]"
      :page-size.sync="page.size"
      :total="page.total"
      @size-change="fetch(1)"
      @current-change="fetch"
    >
    </ElPagination>
  </div>
</template>

<script>
import { delayTrigger } from '../../util'
export default {
  name: 'VList',
  props: {
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
    }
  }
}
</script>

<style scoped>
.v-list__container {
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
