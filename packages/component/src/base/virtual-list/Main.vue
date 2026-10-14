<script>
import { cloneDeep } from 'lodash-es'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import { $emit } from '../../../utils/gogocodeTransfer'
import { getOverflowTooltipContent } from './tooltip-content.mjs'

export default {
  name: 'Main',
  components: { DynamicScroller, DynamicScrollerItem },
  props: {
    columns: {
      type: Array,
      default: () => [],
    },
    data: {
      type: Array,
      default: () => [],
    },
    remoteMethod: Function,
    itemKey: {
      type: String,
      default: 'id',
    },
    border: {
      type: Boolean,
      default: false,
    },
    itemSize: [Number],
    rowClassName: [String, Function],
    stripe: Boolean,
    highlightCurrentRow: Boolean,
    tooltipEffect: {
      type: String,
      default: 'dark',
    },
  },
  emits: ['selection-change', 'clear-selection'],
  data() {
    return {
      list: [],
      layoutWidth: 1000,
      selections: [],
      checkAll: false,
      active: '',
      isIndeterminate: false,
      tooltipContent: '',
      tooltipPosition: { top: '0px', left: '0px' },
      widthMap: {
        index: 50,
        selection: 40,
      },
    }
  },
  computed: {
    cols() {
      const result = cloneDeep(this.columns)

      const usedWidth = result
        .filter((t) => !['index', 'selection'].includes(t.type))
        .map((t) => t.width || 0)
        .reduce((pre, cur) => {
          return cur + pre
        }, 0)

      const obligateWidth = result
        .filter((t) => ['index', 'selection'].includes(t.type))
        .map((t) => t.width || this.widthMap[t.type])
        .reduce((pre, cur) => {
          return cur + pre
        }, 0)

      const exWidth = this.layoutWidth - usedWidth - obligateWidth
      const noWidthArr = result
        .filter((t) => !['index', 'selection'].includes(t.type))
        .filter((t) => !t.width)
      noWidthArr.forEach((el) => {
        el.width = Math.floor(exWidth / noWidthArr.length)
      })
      return result
    },
  },
  watch: {
    data: {
      deep: true,
      handler(v) {
        v && this.fetch()
      },
    },
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
      const index = this.selections.findIndex(
        (t) => t[this.itemKey] === row[this.itemKey],
      )

      index !== -1 && this.selections.splice(index, 1)
      if (selected) {
        this.selections.push(row)
      }

      const selectionsLen = this.selections.length
      const dataLen = this.data.length
      this.isIndeterminate = !!selectionsLen && selectionsLen < dataLen
      this.checkAll = !!selectionsLen && selectionsLen === dataLen
      $emit(this, 'selection-change', this.selections)
    },

    handleCheckAll(val) {
      this.checkAll = val
      this.selections = val ? [...this.list] : []
      this.isIndeterminate = false
      $emit(this, 'selection-change', this.selections)
    },

    // 选中所有
    toggleAllSelection() {
      this.handleCheckAll(true)
    },

    // 清空所有选中
    clearSelection() {
      this.handleCheckAll(false)
      $emit(this, 'clear-selection')
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
            rowIndex,
          }),
        )
      }

      return classes
    },

    handleCellMouseEnter(event, colItem) {
      if (!colItem.showOverflowTooltip) {
        this.tooltipContent = ''
        return
      }

      const cell = event.target
      const content = getOverflowTooltipContent(cell)
      if (!content) {
        this.tooltipContent = ''
        return
      }

      const rect = cell.getBoundingClientRect()
      this.tooltipPosition = {
        top: `${rect.top < 48 ? rect.bottom + 8 : rect.top - 8}px`,
        left: `${Math.max(12, Math.min(rect.left, window.innerWidth - 332))}px`,
        transform: rect.top < 48 ? 'none' : 'translateY(-100%)',
      }
      this.tooltipContent = content
    },

    handleCellMouseLeave() {
      this.tooltipContent = ''
    },

    getColWidth(item) {
      const map = {
        index: 50,
        selection: 40,
      }

      return `${item.width || map[item.type] || 100}px`
    },

    getColClass(item) {
      const classes = []
      const map = {
        left: 'text-start',
        center: 'text-center',
        right: 'text-end',
      }

      classes.push(map[item.align] || '')

      return classes
    },
  },
}
</script>

<template>
  <div :class="['virtual-list-wrap', { 'is-border': border }]">
    <div class="header-wrapper">
      <div class="header__list flex bg-main dark:bg-overlay">
        <div
          v-for="(item, index) in cols"
          :key="index"
          :class="[
            'column-item',
            `column-${item.prop || item.type}`,
            item.headerClass,
          ]"
          :style="{ width: getColWidth(item) }"
        >
          <div v-if="item.type === 'selection'" class="cell">
            <ElCheckbox
              v-model="checkAll"
              :indeterminate="isIndeterminate"
              @change="handleCheckAll($event)"
            />
          </div>
          <div v-else-if="item.headerSlot" class="cell">
            <slot :name="item.headerSlot" />
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
        @scroll="handleCellMouseLeave"
      >
        <template #default="{ item, index, active }">
          <DynamicScrollerItem
            :item="item"
            :active="active"
            :data-index="index"
            :size-dependencies="[item[itemKey]]"
          >
            <div :class="['flex body__row', ...getRowClass(item, index)]">
              <div
                v-for="(colItem, colIndex) in cols"
                :key="colIndex"
                :class="[
                  'column-item',
                  `column-${colItem.prop || colItem.type}`,
                  colItem.class,
                  ...getColClass(colItem),
                ]"
                :style="{ width: getColWidth(colItem) }"
              >
                <div
                  :class="[
                    'cell',
                    { 'el-tooltip': colItem.showOverflowTooltip },
                  ]"
                  @mouseenter="(event) => handleCellMouseEnter(event, colItem)"
                  @mouseleave="(event) => handleCellMouseLeave(event)"
                >
                  <template v-if="colItem.slot">
                    <slot
                      v-bind="{ row: item }"
                      :name="colItem.slot"
                      :row="item"
                    />
                  </template>
                  <template v-else-if="colItem.type === 'index'">{{
                    index + 1
                  }}</template>

                  <template v-else-if="colItem.type === 'selection'">
                    <ElCheckbox
                      :model-value="selections.includes(item)"
                      @change="toggleRowSelection(item, $event)"
                    />
                  </template>
                  <template v-else>{{ item[colItem.prop] }}</template>
                </div>
              </div>
            </div>
          </DynamicScrollerItem>
        </template>
      </DynamicScroller>
      <Teleport to="body">
        <div
          v-if="tooltipContent"
          :class="['virtual-list-tooltip', tooltipEffect]"
          :style="tooltipPosition"
          role="tooltip"
        >
          {{ tooltipContent }}
        </div>
      </Teleport>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.virtual-list-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  &.is-border {
    .column-item {
      border-right: 1px solid var(--el-border-color);
      border-bottom: 1px solid var(--el-border-color);
    }

    .header-wrapper {
      border-top: 1px solid var(--el-border-color);
      border-left: 1px solid var(--el-border-color);
    }

    .body-wrapper {
      border-left: 1px solid var(--el-border-color);
    }
  }
}
.header__list {
  color: var(--text-dark);
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
  color: var(--text-light);
  &:hover {
    background-color: var(--el-bg-color-overlay);
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
.virtual-list-tooltip {
  position: fixed;
  z-index: 3000;
  max-width: min(320px, calc(100vw - 24px));
  padding: 6px 8px;
  border-radius: 6px;
  background: #303133;
  color: #fff;
  font-size: 12px;
  line-height: 1.4;
  overflow-wrap: anywhere;
  pointer-events: none;
  box-shadow: 0 2px 8px rgb(0 0 0 / 15%);

  &.light {
    background: #fff;
    color: #303133;
    border: 1px solid #e4e7ed;
  }
}
</style>
