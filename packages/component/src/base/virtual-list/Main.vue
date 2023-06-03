<template>
  <div :class="['virtual-list-wrap', { 'is-border': border }]">
    <div class="header-wrapper">
      <div class="header__list flex">
        <div
          v-for="(item, index) in cols"
          :key="index"
          :class="['column-item', 'column-' + (item.prop || item.type), item.headerClass]"
          :style="{ width: getColWidth(item) }"
        >
          <div v-if="item.type === 'selection'" class="cell">
            <ElCheckbox
              v-model="checkAll"
              :indeterminate="isIndeterminate"
              @change="handleCheckAll(arguments[0])"
            ></ElCheckbox>
          </div>
          <div v-else class="cell">{{ item.label }}</div>
        </div>
      </div>
    </div>
    <div class="body-wrapper">
      <DynamicScroller
        ref="virtualScroller"
        :items="list"
        :key-field="itemKey"
        :min-item-size="40"
        :item-size="itemSize"
        class="vue-recycle-scroller"
      >
        <template #default="{ item, index, active }">
          <DynamicScrollerItem :item="item" :active="active" :data-index="index" :size-dependencies="[item[itemKey]]">
            <div :class="['flex body__row', ...getRowClass(item, index)]">
              <div
                v-for="(colItem, colIndex) in cols"
                :key="colIndex"
                :class="[
                  'column-item',
                  'column-' + (colItem.prop || colItem.type),
                  colItem.class,
                  ...getColClass(colItem)
                ]"
                :style="{ width: getColWidth(colItem) }"
              >
                <div
                  :class="['cell', { 'el-tooltip': colItem.showOverflowTooltip }]"
                  @mouseenter="event => handleCellMouseEnter(event, colItem)"
                  @mouseleave="event => handleCellMouseLeave(event)"
                >
                  <template v-if="colItem.slot">
                    <slot :name="colItem.slot" :row="item" v-bind="{ row: item }"></slot>
                  </template>
                  <template v-else-if="colItem.type === 'index'">{{ index + 1 }}</template>

                  <template v-else-if="colItem.type === 'selection'">
                    <ElCheckbox
                      :value="selections.includes(item)"
                      @change="toggleRowSelection(item, arguments[0])"
                    ></ElCheckbox>
                  </template>
                  <template v-else>{{ item[colItem.prop] }}</template>
                </div>
              </div>
            </div>
          </DynamicScrollerItem>
        </template>
      </DynamicScroller>
      <el-tooltip placement="top" ref="tooltip" :effect="tooltipEffect" :content="tooltipContent"></el-tooltip>
    </div>
  </div>
</template>

<script>
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import { cloneDeep, debounce } from 'lodash'

export default {
  name: 'Main',

  components: { DynamicScroller, DynamicScrollerItem },

  props: {
    columns: {
      type: Array,
      default: () => []
    },
    data: {
      type: Array,
      default: () => []
    },
    remoteMethod: Function,
    itemKey: {
      type: String,
      default: 'id'
    },
    border: {
      type: Boolean,
      default: false
    },
    itemSize: [Number],
    rowClassName: [String, Function],
    stripe: Boolean,
    highlightCurrentRow: Boolean,
    tooltipEffect: {
      type: String,
      default: 'dark'
    }
  },

  data() {
    return {
      list: [],
      layoutWidth: 1000,
      selections: [],
      checkAll: false,
      active: '',
      isIndeterminate: false,
      tooltipContent: '',
      widthMap: {
        index: 50,
        selection: 40
      }
    }
  },

  computed: {
    cols() {
      let result = cloneDeep(this.columns)

      const usedWidth = result
        .map(t => t.width || 0)
        .reduce((pre, cur) => {
          return cur + pre
        }, 0)

      const obligateWidth = result
        .filter(t => ['index', 'selection'].includes(t.type))
        .map(t => this.widthMap[t.type])
        .reduce((pre, cur) => {
          return cur + pre
        }, 0)

      const exWidth = this.layoutWidth - usedWidth - obligateWidth
      let noWidthArr = result.filter(t => !['index', 'selection'].includes(t.type)).filter(t => !t.width)
      noWidthArr.forEach(el => {
        el.width = Math.floor(exWidth / noWidthArr.length)
      })
      return result
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

  created() {
    this.activateTooltip = debounce(tooltip => tooltip.handleShowPopper(), 50)
  },

  mounted() {
    this.layoutWidth = this.$el.offsetWidth
    this.fetch()
  },

  methods: {
    fetch() {
      if (!this.remoteMethod) {
        this.list = cloneDeep(this.data)
        return
      }
    },

    toggleRowSelection(row = {}, selected) {
      const index = this.selections.findIndex(t => t === row)

      index > -1 && this.selections.splice(index, 1)
      if (selected) {
        this.selections.push(row)
      }

      const selectionsLen = this.selections.length
      const dataLen = this.data.length
      this.isIndeterminate = !!selectionsLen && selectionsLen < dataLen
      this.checkAll = !!selectionsLen && selectionsLen === dataLen
      this.$emit('selection-change', this.selections)
    },

    handleCheckAll(val) {
      this.checkAll = val
      this.selections = val ? [...this.list] : []
      this.isIndeterminate = false
      this.$emit('selection-change', this.selections)
    },

    // 选中所有
    toggleAllSelection() {
      this.handleCheckAll(true)
    },

    // 清空所有选中
    clearSelection() {
      this.handleCheckAll(false)
      this.$emit('clear-selection')
    },

    getCheckboxValue(item) {
      return this.selections.includes(item)
    },

    getRowClass(row, rowIndex) {
      const classes = []

      if (this.stripe && rowIndex % 2 === 1) {
        classes.push('el-table__row--striped')
      }

      const rowClassName = this.rowClassName
      if (typeof rowClassName === 'string') {
        classes.push(rowClassName)
      } else if (typeof rowClassName === 'function') {
        classes.push(
          rowClassName.call(null, {
            row,
            rowIndex
          })
        )
      }

      return classes
    },

    handleCellMouseEnter(event, colItem) {
      if (!colItem.showOverflowTooltip) return

      const cell = event.target
      const cellChild = event.target

      if (cellChild.scrollWidth > cellChild.offsetWidth && this.$refs.tooltip) {
        const tooltip = this.$refs.tooltip
        this.tooltipContent = cell.innerText || cell.textContent || cell.querySelector('input')?.value
        tooltip.referenceElm = cell
        tooltip.$refs.popper && (tooltip.$refs.popper.style.display = 'none')
        tooltip.doDestroy()
        tooltip.setExpectedState(true)
        this.activateTooltip(tooltip)
      }
    },

    handleCellMouseLeave() {
      const tooltip = this.$refs.tooltip

      if (tooltip) {
        tooltip.setExpectedState(false)
        tooltip.handleClosePopper()
      }
    },

    getColWidth(item) {
      const map = {
        index: 50,
        selection: 40
      }

      return (item.width || map[item.type] || 100) + 'px'
    },

    getColClass(item) {
      const classes = []
      const map = {
        left: 'text-start',
        center: 'text-center',
        right: 'text-end'
      }

      classes.push(map[item.align] || '')

      return classes
    }
  }
}
</script>

<style lang="scss" scoped>
.virtual-list-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;

  &.is-border {
    .column-item {
      border-right: 1px solid #ebeef5;
      border-bottom: 1px solid #ebeef5;
    }

    .header-wrapper {
      border-top: 1px solid #ebeef5;
      border-left: 1px solid #ebeef5;
    }

    .body-wrapper {
      border-left: 1px solid #ebeef5;
    }
  }
}

.header__list {
  background-color: #fafafa;
  color: #333c4a;
  font-weight: 500;
}

.body-wrapper {
  flex: 1;
  height: 0;
}

.vue-recycle-scroller {
  height: 100%;
}

.body__row {
  color: #535f72;

  &:hover {
    background-color: #f2f3f5;
  }
}

.column-item {
  padding: 8px 0;
  width: 110px;
  flex-shrink: 0;

  &.column-index {
    width: 60px;
  }

  &.column-selection {
    width: 40px;
  }
}

.cell {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  line-height: 23px;
  padding-left: 10px;
  padding-right: 10px;
  overflow-wrap: break-word;
  word-break: normal;
  box-sizing: border-box;

  &.el-tooltip {
    white-space: nowrap;
    min-width: 50px;
  }
}
</style>
