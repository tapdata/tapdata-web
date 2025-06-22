<script lang="ts">
import Classification from '@tap/component/src/Classification.vue'
import { off, on } from '@tap/shared'
import {
  defineComponent,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  shallowRef,
  type PropType,
} from 'vue'
import { useRoute } from 'vue-router'
import { makeDragNodeImage } from '../shared'
import SelectClassify from './SelectClassify.vue'

import type { TableColumnCtx } from 'element-plus'

interface TableSettings {
  settings: Record<string, { pageSize: number }>
  init: () => void
  getPageSize: (routeName: string, defaultSize?: number) => number
  setPageSize: (routeName: string, pageSize: number) => void
  save: () => void
  load: () => void
}

interface Sort {
  prop: string
  order: 'ascending' | 'descending' | null
}

const tableSettings: TableSettings = {
  settings: {},

  init() {
    this.load()
  },

  getPageSize(routeName: string, defaultSize = 20) {
    return this.settings[routeName]?.pageSize || defaultSize
  },

  setPageSize(routeName: string, pageSize: number) {
    const setting = this.settings[routeName]

    if (setting) {
      setting.pageSize = pageSize
    } else {
      this.settings[routeName] = { pageSize }
    }

    this.save()
  },

  save() {
    localStorage.setItem(
      'TAPDATA_TABLE_SETTINGS',
      JSON.stringify(this.settings),
    )
  },

  load() {
    const settings = localStorage.getItem('TAPDATA_TABLE_SETTINGS')
    if (settings) {
      this.settings = JSON.parse(settings)
    }
  },
}

// Initialize settings on creation
tableSettings.init()

interface Page {
  current: number
  size: number
  total: number
}

interface DragState {
  isDragging: boolean
  draggingObjects: any[]
  dropNode: any
  allowDrop: boolean
}

export default defineComponent({
  name: 'TablePage',
  components: {
    Classification,
    SelectClassify,
  },
  props: {
    title: {
      type: String,
    },
    desc: {
      type: String,
    },
    defaultPageSize: {
      type: Number,
      default: 20,
    },
    hideClassify: {
      type: Boolean,
    },
    classify: {
      type: Object,
    },
    remoteMethod: {
      type: Function as PropType<
        (params: {
          page: Page
          tags: any[]
        }) => Promise<{ data: any[]; total: number }>
      >,
    },
    rowKey: {
      type: [String, Function] as PropType<string | ((row: any) => string)>,
    },
    spanMethod: {
      type: Function as PropType<
        (data: {
          row: any
          rowIndex: number
          column: TableColumnCtx<any>
          columnIndex: number
        }) => number[] | { rowspan: number; colspan: number }
      >,
    },
    defaultSort: {
      type: Object as PropType<Sort>,
    },
    draggable: Boolean,
  },
  emits: ['selectionChange', 'sortChange', 'classifySubmit'],
  setup(props, { emit }) {
    const isUnmounted = ref(false)
    const route = useRoute()
    const isDaas = import.meta.env.VUE_APP_PLATFORM === 'DAAS'
    const loading = ref(false)
    const page = ref<Page>({
      current: 1,
      size: tableSettings.getPageSize(
        route.name as string,
        props.defaultPageSize,
      ),
      total: 0,
    })
    const list = shallowRef([])
    const multipleSelection = ref([])
    const tags = ref([])
    const classificationVisible = ref(false)
    const dragState = ref<DragState>({
      isDragging: false,
      draggingObjects: [],
      dropNode: null,
      allowDrop: true,
    })
    const draggingNodeImage = ref<HTMLElement | null>(null)
    const shiftKeyPressed = ref(false)
    const ifTableHeightAuto = ref(!!import.meta.env.VUE_APP_TABLE_HEIGHT_AUTO)
    const lastSelectIndex = ref<number | undefined>(undefined)
    const table = ref(null)
    const classifyRef = ref(null)
    const classification = ref(null)

    const handleKeyDown = (ev: KeyboardEvent) => {
      shiftKeyPressed.value = ev.shiftKey
    }

    const handleKeyUp = () => {
      setTimeout(() => {
        shiftKeyPressed.value = false
      }, 0)
    }

    const fetch = (
      pageNum: number,
      debounce = 0,
      hideLoading?: boolean,
      callback?: Function,
    ) => {
      if (isUnmounted.value) return

      let timer: ReturnType<typeof setTimeout> | null = null

      if (pageNum === 1) {
        multipleSelection.value = []
        emit('selectionChange', [])
        table.value?.clearSelection()
        lastSelectIndex.value = undefined
      }
      page.value.current = pageNum || page.value.current

      if (!hideLoading) {
        loading.value = true
      }

      if (!props.remoteMethod) return

      props
        .remoteMethod({
          page: page.value,
          tags: tags.value,
        })
        .then(({ data, total }: { data: any[]; total: number }) => {
          page.value.total = total
          list.value = []
          list.value = [...(data || [])]

          if (total > 0 && (!data || !data.length)) {
            if (timer) clearTimeout(timer)
            timer = setTimeout(() => {
              fetch(page.value.current - 1)
            }, 2000)
          }
        })
        .finally(() => {
          loading.value = false
          nextTick(() => {
            table.value?.doLayout()
          })
          if (callback) callback(getData())
        })
    }

    const handleCurrent = (val: number) => {
      multipleSelection.value = []
      emit('selectionChange', [])
      table.value?.clearSelection()
      fetch(val)
    }

    const nodeChecked = (newTags: any[]) => {
      tags.value = newTags
      fetch(1)
    }

    const handleSelectionChange = (val: any[]) => {
      multipleSelection.value = val
      emit('selectionChange', val)
    }

    const showClassify = (tagList: any[]) => {
      classifyRef.value?.show(tagList)
    }

    const getData = () => {
      return list.value
    }

    const clearSelection = () => {
      table.value?.clearSelection()
    }

    const handleToggleClassify = () => {
      classification.value?.toggle()
    }

    const handleDragStart = (row: any, column: any, ev: DragEvent) => {
      if (!row.id || !row.name) return false

      dragState.value.isDragging = true
      const selection = multipleSelection.value

      if (selection.some((it) => it.id === row.id)) {
        dragState.value.draggingObjects = selection
      } else {
        dragState.value.draggingObjects = [row]
      }

      const target = ev.currentTarget as HTMLElement
      draggingNodeImage.value = makeDragNodeImage(
        target.querySelector('.tree-item-icon'),
        row.name,
        dragState.value.draggingObjects.length,
      )
      ev.dataTransfer?.setDragImage(draggingNodeImage.value, 0, 0)
    }

    const handleDragEnd = () => {
      dragState.value.isDragging = false
      dragState.value.draggingObjects = []
      dragState.value.dropNode = null
      draggingNodeImage.value?.remove()
      draggingNodeImage.value = null
    }

    const onSelectRow = (selection: any[], current: any) => {
      try {
        const selected = selection.some((row) => row.id === current.id)

        if (
          shiftKeyPressed.value &&
          multipleSelection.value.length &&
          lastSelectIndex.value !== undefined
        ) {
          let lastIndex = lastSelectIndex.value
          const currentIndex = list.value.findIndex(
            (row) => row.id === current.id,
          )

          if (~lastIndex && ~currentIndex && lastIndex !== currentIndex) {
            const tmp = currentIndex < lastIndex ? -1 : 1

            setTimeout(() => {
              while (lastIndex !== currentIndex) {
                table.value?.toggleRowSelection(list.value[lastIndex], selected)
                lastIndex += tmp
              }
            }, 0)
          }
        }

        lastSelectIndex.value = selected
          ? list.value.findIndex((row) => row.id === current.id)
          : undefined
      } catch (error) {
        console.error(error)
      }
    }

    const handleSizeChange = (val: number) => {
      tableSettings.setPageSize(route.name as string, val)
      fetch(1)
    }

    onMounted(() => {
      fetch(1)
      on(document, 'keydown', handleKeyDown)
      on(document, 'keyup', handleKeyUp)
    })

    onUnmounted(() => {
      isUnmounted.value = true

      off(document, 'keydown', handleKeyDown)
      off(document, 'keyup', handleKeyUp)

      list.value = []
      table.value = null
      classifyRef.value = null
      classification.value = null
    })

    return {
      isDaas,
      loading,
      page,
      list,
      multipleSelection,
      tags,
      classificationVisible,
      dragState,
      draggingNodeImage,
      shiftKeyPressed,
      ifTableHeightAuto,
      lastSelectIndex,
      table,
      classifyRef,
      classification,
      handleKeyDown,
      handleKeyUp,
      fetch,
      handleCurrent,
      nodeChecked,
      handleSelectionChange,
      showClassify,
      getData,
      clearSelection,
      handleToggleClassify,
      handleDragStart,
      handleDragEnd,
      onSelectRow,
      handleSizeChange,
    }
  },
})
</script>

<template>
  <div class="table-page-container">
    <div v-if="title" class="table-page-header">
      <slot name="header">
        <div class="page-header-title">
          {{ title }}
          <span v-if="desc" class="page-header-desc" v-html="desc" />
        </div>
      </slot>
    </div>

    <div class="table-page-main">
      <div class="table-page-main-box gap-4">
        <Classification
          v-if="classify && !hideClassify"
          ref="classification"
          v-model:visible="classificationVisible"
          class="mt-n2 ml-n2"
          :com-title="classify.comTitle"
          :authority="classify.authority"
          :view-page="classify.viewPage"
          :types="classify.types"
          :title="classify.title"
          :kai-title="classify.title"
          :drag-state="dragState"
          @node-checked="nodeChecked"
          @update:visible="classificationVisible = $event"
          @drop-in-tag="fetch(1)"
        />
        <div class="table-page-body gap-4">
          <div class="table-page-nav">
            <slot name="nav" :open-classify="handleToggleClassify" />
          </div>
          <div class="table-page-topbar">
            <div class="table-page-search-bar flex align-center gap-2">
              <el-button
                v-if="
                  classify &&
                  !hideClassify &&
                  !classificationVisible &&
                  !classify.hideIcon
                "
                text
                @click="handleToggleClassify"
              >
                <template #icon>
                  <VIcon>expand-list</VIcon>
                </template>
              </el-button>
              <slot name="search" />
            </div>
            <div class="table-page-operation-bar">
              <slot name="operation" />
            </div>
          </div>
          <el-table
            v-bind="$attrs"
            ref="table"
            v-loading="loading"
            class="table-page-table"
            :row-class-name="classificationVisible ? 'grabbable' : ''"
            :height="ifTableHeightAuto ? null : '100%'"
            :element-loading-text="$t('packages_business_dataFlow_dataLoading')"
            :row-key="rowKey"
            :span-method="spanMethod"
            :data="list"
            :default-sort="defaultSort"
            @selection-change="handleSelectionChange"
            @sort-change="$emit('sortChange', $event)"
            @row-dragstart="handleDragStart"
            @row-dragend="handleDragEnd"
            @select="onSelectRow"
          >
            <el-table-column
              v-if="classificationVisible"
              width="28"
              align="center"
              class-name="cell-no-padding"
            >
              <template #default="{ row, column }">
                <el-button
                  draggable="true"
                  class="grabbable table-cell-drag-btn"
                  :class="{
                    'inline-flex': multipleSelection.includes(row),
                  }"
                  text
                  size="small"
                  @dragstart="handleDragStart(row, column, $event)"
                  @dragend="handleDragEnd"
                >
                  <template #icon>
                    <VIcon>drag</VIcon>
                  </template>
                </el-button>
              </template>
            </el-table-column>
            <slot />
            <template #empty>
              <div class="empty">
                <VIcon size="140">no-data-color</VIcon>
                <slot name="noDataText" />
              </div>
            </template>
          </el-table>
          <div class="table-footer">
            <slot name="tableFooter" />
          </div>
          <div
            class="pagination-wrapper flex align-center gap-4"
            :style="
              ifTableHeightAuto
                ? `position: sticky; bottom: 0; z-index: 10; background: #fff;`
                : ''
            "
          >
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

            <el-pagination
              v-model:current-page="page.current"
              v-model:page-size="page.size"
              background
              class="table-page-pagination ml-auto mt-0"
              layout="->,total, sizes,  prev, pager, next, jumper"
              :page-sizes="[10, 20, 50, 100]"
              :total="page.total"
              @size-change="handleSizeChange"
              @current-change="handleCurrent"
            />
          </div>
        </div>
      </div>
    </div>
    <SelectClassify
      v-if="classify"
      ref="classifyRef"
      :types="classify.types"
      @operations-classify="$emit('classifySubmit', $event)"
    />
  </div>
</template>

<style lang="scss">
.table-page-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-white);
  min-width: 720px;
  flex: 1;
  width: 100%;

  .table-page-nav:empty {
    display: none;
  }

  .table-page-nav .el-tabs {
    .el-tabs__header {
      margin-bottom: 0;
    }
  }

  .table-page-topbar:has(.table-page-search-bar:empty):has(
      .table-page-operation-bar:empty
    ) {
    display: none;
  }

  .table-page-header {
    padding: 20px;
    background: #eff1f4;
    overflow: hidden;
    // border-bottom: 1px solid #dedee4;
    box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.1);
    box-sizing: border-box;

    .page-header-title {
      font-size: 16px;
      color: var(--text-dark);
      font-weight: 600;

      &.link {
        color: rgb(72, 182, 226);
        cursor: pointer;
      }
    }

    .page-header-desc {
      margin-top: 10px;
      font-size: 12px;
      color: var(--text-slight);
    }
  }

  .table-page-main {
    display: flex;
    flex: 1;
    // padding: 0 20px 20px 20px;
    min-height: 0;
    .table-page-main-box {
      display: flex;
      flex: 1;
      width: 100%;
      border-radius: 4px;
      background-color: var(--color-white);
    }
  }

  .table-page-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 4px;
    .el-table--border {
      border: none;
    }
    .table-page-topbar {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      //flex-wrap: wrap-reverse;

      .table-page-operation-bar {
        text-align: right;
      }
    }

    .table-page-table {
      flex: 1;
      border-bottom: none;
      border-radius: 3px;
      font-size: 14px;
      background-color: var(--color-white);
      overflow: hidden;
      // .el-table__fixed-right {
      //   height: 100% !important; //设置高优先，以覆盖内联样式
      // }
      .el-table::before {
        height: 1px;
      }
      .el-table__fixed-body-wrapper {
        background-color: var(--color-white);
      }
      .el-table__fixed {
        height: auto !important; //设置高优先，以覆盖内联样式
      }

      .el-table__inner-wrapper::after {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 1px;
        z-index: calc(var(--el-table-index) + 2);
        background-color: var(--el-table-border-color);
        z-index: calc(var(--el-table-index) + 2);
      }
    }

    .el-table--border td,
    .el-table__body-wrapper
      .el-table--border.is-scrolling-left
      ~ .el-table__fixed {
      border-right: 0;
    }

    .el-table--border td {
      .cell {
        color: var(--text-light);
      }
    }

    .table-footer {
      line-height: 38px;
      &:empty {
        display: none;
      }
    }
  }
}

.pagination-wrapper {
  .el-button + .el-button {
    margin-left: 0;
  }
}
</style>
<!-- .el-table--border .el-table__inner-wrapper::after {
  left: 0px;
  top: 0px;
  width: 100%;
  height: 1px;
  z-index: calc(var(--el-table-index) + 2);
}
<style>
.el-table--border::after, .el-table--border::before, .el-table--border .el-table__inner-wrapper::after, .el-table__inner-wrapper::before {
  content: "";
  position: absolute;
  background-color: var(--el-table-border-color);
  z-index: calc(var(--el-table-index) + 2);
} -->
