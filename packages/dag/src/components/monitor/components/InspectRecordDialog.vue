<script setup lang="ts">
import {
  getTaskInspectResultsOperations,
  type TaskInspectOperation,
} from '@tap/api'
import { useI18n } from '@tap/i18n'
import dayjs from 'dayjs'
import { computed, ref } from 'vue'

const { t } = useI18n()

const loadingList = ref(false)
const list = ref<TaskInspectOperation[]>([])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 计算当前页数据
const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return list.value.slice(start, end)
})

function handleCurrentChange(page: number) {
  currentPage.value = page
}
function handleSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
}

const props = defineProps({
  resultId: {
    type: String,
    required: true,
  },
})

const OP_STATUS_MAP = {
  AUTO_RECOVER_CHECK: 'warning',
  MANUAL_RECOVER_CHECK: 'warning',
}

const OP_TYPE_MAP = {
  CDC_CHECK: t('public_op_cdc_check'),
  AUTO_RECHECK: t('public_op_auto_recheck'),
  AUTO_RECOVER: t('public_op_auto_recover'),
  AUTO_RECOVER_CHECK: t('public_op_auto_recover_check'),
  MANUAL_CHECK: t('public_op_manual_check'),
  MANUAL_RECOVER: t('public_op_manual_recover'),
  MANUAL_RECOVER_CHECK: t('public_op_manual_recover_check'),
}

async function fetchList(): Promise<void> {
  loadingList.value = true
  try {
    const data = await getTaskInspectResultsOperations(props.resultId)
    list.value = data.map((item) => ({
      ...item,
      op: OP_TYPE_MAP[item.op as keyof typeof OP_TYPE_MAP],
      opStatus: OP_STATUS_MAP[item.op as keyof typeof OP_STATUS_MAP] || 'info',
    }))
    total.value = list.value.length
    currentPage.value = 1 // 重置到第一页
  } catch (error) {
    console.error('Failed to fetch inspect list:', error)
  } finally {
    loadingList.value = false
  }
}

const onOpen = () => {
  fetchList()
}

function formatTime(timestamp: number): string {
  if (!timestamp) return '--'
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
}
</script>

<template>
  <ElDialog
    :title="$t('packages_dag_inspect_operation_record')"
    width="60%"
    append-to-body
    :close-on-click-modal="false"
    @open="onOpen"
  >
    <el-table
      v-loading="loadingList"
      class="has-border-t"
      :data="paginatedList"
      :default-sort="{ prop: 'ts', order: 'descending' }"
    >
      <el-table-column
        prop="user"
        :label="$t('packages_dag_inspect_operation_user')"
      />
      <el-table-column
        prop="op"
        :label="$t('packages_dag_inspect_operation_type')"
      >
        <template #default="{ row }">
          <el-tag :type="row.opStatus">
            {{ row.op }}
          </el-tag>
        </template>
      </el-table-column>
      <!-- <el-table-column
        prop="msg"
        :label="$t('packages_dag_inspect_operation_message')"
        show-overflow-tooltip
      /> -->
      <el-table-column
        prop="ts"
        :label="$t('packages_dag_inspect_operation_time')"
        sortable
      >
        <template #default="{ row }">
          {{ formatTime(row.ts) }}
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      class="mt-3"
      :total="total"
      :page-sizes="[10, 20, 50, 100]"
      layout="->,total, sizes, prev, pager, next, jumper"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    />
  </ElDialog>
</template>
