<script setup lang="ts">
import {
  getTaskInspectResultsOperations,
  type TaskInspectOperation,
} from '@tap/api'
import { useI18n } from '@tap/i18n'
import dayjs from 'dayjs'
import { ref } from 'vue'

const { t } = useI18n()

const loadingList = ref(false)
const list = ref<TaskInspectOperation[]>([])

const props = defineProps({
  resultId: {
    type: String,
    required: true,
  },
})

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
    }))
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
      :data="list"
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
          <el-tag type="info">{{ row.op }}</el-tag>
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
  </ElDialog>
</template>
