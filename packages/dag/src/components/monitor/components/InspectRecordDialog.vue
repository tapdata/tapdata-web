<script setup lang="ts">
import axios from 'axios'
import dayjs from 'dayjs'
import { ref } from 'vue'

const loadingList = ref(false)
const list = ref([])

const props = defineProps({
  resultId: {
    type: String,
    required: true,
  },
})

interface Operation {
  ts: number // 操作时间
  op: string // 操作类型
  msg: string // 操作信息
  userId: string // 用户编号
  user: string // 用户名
}

async function fetchList(): Promise<void> {
  loadingList.value = true
  try {
    const data = await axios.get<Operation[]>(
      `/api/task-inspect-results/${props.resultId}/operations`,
    )
    list.value = data
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
    <el-table v-loading="loadingList" :data="list">
      <el-table-column
        prop="user"
        :label="$t('packages_dag_inspect_operation_user')"
        width="150"
      />
      <el-table-column
        prop="op"
        :label="$t('packages_dag_inspect_operation_type')"
        width="180"
      />
      <el-table-column
        prop="msg"
        :label="$t('packages_dag_inspect_operation_message')"
        show-overflow-tooltip
      />
      <el-table-column
        :label="$t('packages_dag_inspect_operation_time')"
        width="180"
        sortable
      >
        <template #default="{ row }">
          {{ formatTime(row.ts) }}
        </template>
      </el-table-column>
    </el-table>
  </ElDialog>
</template>
