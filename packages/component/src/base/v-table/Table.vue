<script>
import { delayTrigger } from '@tap/shared'
import { $emit } from '../../../utils/gogocodeTransfer'
import ColumnItem from './Column'
export default {
  name: 'VTable',
  components: { ColumnItem },
  props: {
    tableClass: {
      type: String,
      default: '',
    },
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
  emits: ['selection-change'],
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
        layout: '->, total, sizes, prev, pager, next, jumper',
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
    tableProps() {
      return {
        ...this.$attrs,
        class: this.tableClass,
      }
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
        this.$emit('selection-change', [])
        this.$refs?.table?.clearSelection()
      }
      this.page.current = pageNum || this.page.current
      if (!this.remoteMethod) {
        if (this.$attrs.isPage) {
          this.page.total = this.data.length
          const { current, size } = this.page
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
    handleSelectionChange(selection) {
      this.multipleSelection = selection
      this.$emit('selection-change', selection)
    },
    clearSelection() {
      this.multipleSelection = []
      this.$emit('selection-change', [])
      this.$refs?.table?.clearSelection()
    },
  },
}
</script>

<template>
  <div ref="vTableContainer" class="v-table-container">
    <ElTable
      v-bind="tableProps"
      ref="table"
      v-loading="loading"
      :data="list"
      class="table-container__table"
      :class="tableClass"
      @selection-change="handleSelectionChange"
    >
      <ColumnItem v-for="(item, index) in columns" :key="index" :item="item">
        <template v-for="(key, slot) of $slots" #[slot]="scope">
          <slot v-bind="scope" :name="slot" />
        </template>
      </ColumnItem>
      <template #empty>
        <div><slot name="empty" /></div>
      </template>
    </ElTable>

    <div v-if="showPage" class="pt-4 px-4 flex align-center gap-3">
      <transition name="el-fade-in-linear">
        <div
          v-if="multipleSelection.length"
          class="flex align-center gap-3"
          style="--btn-space: 0"
        >
          <ElCheckbox :model-value="true" @change="clearSelection" />
          <span class="fw-sub text-nowrap color-primary"
            >{{
              $t('packages_business_selected_rows', {
                val: multipleSelection.length,
              })
            }}
          </span>
          <el-divider
            v-if="$slots.multipleSelectionActions"
            direction="vertical"
            class="mx-0"
          />
          <slot name="multipleSelectionActions" />
        </div>
      </transition>

      <ElPagination
        v-bind="Object.assign({}, options, pageOptions)"
        v-model:current-page="page.current"
        v-model:page-size="page.size"
        :total="page.total"
        class="ml-auto"
        @size-change="fetch(1)"
        @current-change="fetch"
      />
    </div>
  </div>
</template>

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
