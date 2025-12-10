<script setup lang="ts">
import {
  fetchSkipErrorTable,
  recoverSkipErrorTable,
  type SkipErrorTable,
} from '@tap/api/src/core/task'
import { usePagination } from '@tap/api/src/request'
import ErrorDialog from '@tap/business/src/components/ErrorDialog.vue'
import { dayjs } from '@tap/business/src/shared/dayjs'
import { computed, ref, useTemplateRef } from 'vue'
import type { TableInstance } from 'element-plus'

interface Props {
  dataflow: {
    id: string
    [key: string]: any
  }
  currentTab: string
}

const props = defineProps<Props>()
const emit = defineEmits(['start'])

const statusMap = {
  SKIPPED: {
    text: '已跳过',
    type: 'danger',
  },
  RECOVERING: {
    text: '恢复中',
    type: 'warning',
  },
}

const tableRef = useTemplateRef<TableInstance>('table')
const errorDialog =
  useTemplateRef<InstanceType<typeof ErrorDialog>>('errorDialog')
const selectedRows = ref<SkipErrorTable[]>([])
const tableFilter = ref('')
const dataTotal = ref(0)

const isOperable = computed(() => {
  return props.dataflow.status === 'error'
})

const {
  current,
  pageSize,
  data: tableData,
  total,
  totalPage,
  loading,
  run,
  refresh,
} = usePagination(
  async ({ current, pageSize }) => {
    const data = await fetchSkipErrorTable(props.dataflow.id, {
      limit: pageSize,
      skip: pageSize * (current - 1),
      tableFilter: tableFilter.value,
    })

    data.items.map((item) => {
      item.skipDate = dayjs(item.skipDate).format('YYYY-MM-DD HH:mm:ss')
      item.errorStack = item.errorMessage
      item.fullErrorCode = item.fullErrorCode || item.errorCode
      item.errorCode = item.errorCode.replace(/^\D*/, '')

      const [title, content] = item.errorMessage.split('\n')
      item.errorTitle = title
      item.errorContent = content
      return item
    })

    if (!tableFilter.value) dataTotal.value = data.total

    return data
  },
  {
    debounceInterval: 200,
    initialData: {
      total: 0,
      items: [],
    },
  },
)

const fetchPage = (current: number) => {
  run({
    current,
    pageSize: pageSize.value,
  })
}

const ifSelectable = () => {
  return isOperable.value
}

const handleSelectionChange = (rows: SkipErrorTable[]) => {
  selectedRows.value = rows
}

const handleCellClick = (row: SkipErrorTable, column: any) => {
  if (column.property === 'errorMessage') {
    errorDialog.value?.handleOpen({
      errorStack: row.errorStack,
      errorCode: row.errorCode,
      fullErrorCode: row.fullErrorCode,
    })
    return
  }

  const index = selectedRows.value.findIndex((item) => item.id === row.id)
  tableRef.value?.toggleRowSelection(row, index === -1)
}

const recovering = ref(false)

const handleRecover = async (isAll: boolean) => {
  recovering.value = true
  const sourceTables = selectedRows.value.map((item) => item.sourceTable)
  await recoverSkipErrorTable(
    props.dataflow.id,
    isAll ? '' : sourceTables.join(','),
  ).then(() => {
    fetchPage(1)
  })
  emit('start')
  recovering.value = false
}
</script>

<template>
  <ElTabPane name="skipErrorTable">
    <template #label>
      <span class="flex align-center gap-2">
        异常表记录
        <span
          class="rounded-pill lh-5 px-1.5 fw-sub"
          style="background-color: var(--bg-code); min-width: 20px"
          >1</span
        >
      </span>
    </template>
    <div class="h-100 w-100 flex flex-column">
      <div class="flex align-center lh-8 p-3 gap-3" style="--btn-space: 0">
        <el-input
          v-model="tableFilter"
          clearable
          placeholder="搜索表名"
          style="width: 240px"
          @input="fetchPage(1)"
        >
          <template #prefix>
            <el-icon><i-lucide-search /></el-icon>
          </template>
        </el-input>
        <el-button
          class="rounded-lg"
          circle
          :loading="loading"
          @click="refresh"
        >
          <template #icon>
            <i-lucide-refresh-cw />
          </template>
        </el-button>
        <div class="flex-1" />
        <template v-if="isOperable">
          <div class="font-color-light">
            已选择 <span class="color-primary">{{ selectedRows.length }}</span
            ><span> / {{ total }}</span> 个表
          </div>
          <el-divider direction="vertical" class="mx-0" />
          <el-button
            type="primary"
            plaind
            :disabled="!selectedRows.length"
            :loading="recovering"
            @click="handleRecover(false)"
          >
            <template #icon>
              <i-lucide-rotate-ccw />
            </template>
            恢复选中
          </el-button>
          <el-button
            plaind
            :disabled="!dataTotal"
            :loading="recovering"
            @click="handleRecover(true)"
          >
            <template #icon>
              <i-lucide-rotate-ccw />
            </template>
            恢复全部
          </el-button>
        </template>
      </div>
      <el-table
        ref="table"
        v-loading="loading"
        row-key="id"
        :data="tableData!.items"
        class="has-border-t"
        height="100%"
        row-class-name="cursor-pointer"
        @selection-change="handleSelectionChange"
        @cell-click="handleCellClick"
      >
        <el-table-column
          v-if="isOperable"
          type="selection"
          width="32"
          align="center"
        />
        <el-table-column label="源表名" prop="sourceTable" width="180" />
        <el-table-column label="目标表名" prop="targetTable" width="180" />
        <el-table-column label="状态" prop="status" width="140">
          <template #default="{ row }">
            <div
              class="inline-flex align-center gap-1 border rounded-lg p-1 px-2 lh-1"
            >
              <div
                class="rounded-pill w-1.5 h-1.5"
                :class="`bg-color-${statusMap[row.status].type}`"
              />
              <span class="font-color-light text-xs">
                {{ statusMap[row.status].text }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="跳过时间" prop="skipDate" width="180" />
        <el-table-column label="错误信息" prop="errorMessage">
          <template #default="{ row }">
            <div class="flex gap-1 lh-4 error-message">
              <el-icon class="color-danger" :size="16">
                <i-lucide-circle-alert />
              </el-icon>
              <div class="min-w-0 font-mono">
                <div class="ellipsis error-message-title">
                  <el-link
                    v-if="row.fullErrorCode"
                    type="primary"
                    class="align-baseline mr-1"
                    >{{ row.fullErrorCode }}</el-link
                  >{{ row.errorTitle }}
                </div>
                <div class="font-color-sslight ellipsis mt-1">
                  {{ row.errorContent }}
                </div>
              </div>
            </div>
            <!-- <div class="line-clamp-2">
            <el-icon class="color-danger mr-1" style="vertical-align: -2px">
              <i-lucide-circle-alert />
            </el-icon>
            <el-link
              v-if="row.errorCode"
              type="primary"
              class="align-baseline"
              >{{ row.errorCode }}</el-link
            >
            {{ row.errorMessage }}
          </div> -->
          </template>
        </el-table-column>

        <template #empty>
          <el-empty :image-size="48" class="lh-base">
            <template #description>
              <span class="lh-base"> 暂无异常表记录 </span>
            </template>
          </el-empty>
        </template>
      </el-table>
      <el-pagination
        v-if="totalPage > 1 || pageSize > 10"
        v-model:current-page="current"
        v-model:page-size="pageSize"
        class="p-3"
        :total="total"
        background
        layout="->,total, prev, pager, next, sizes"
      />

      <ErrorDialog ref="errorDialog" :task-id="dataflow.id" />
    </div>
  </ElTabPane>
</template>

<style scoped lang="scss">
.error-message {
  cursor: pointer;
  &:hover .error-message-title {
    text-decoration: underline;
    .el-link {
      text-decoration: underline;
    }
  }
}
</style>
