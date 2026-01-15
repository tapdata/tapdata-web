<script setup lang="ts">
import {
  CircleCheckFilled,
  CircleCloseFilled,
  WarningFilled,
} from '@element-plus/icons-vue'
import {
  fetchGroupInfoRecordList,
  type GroupInfoRecordDto,
} from '@tap/api/core/group-info'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import TablePage from '@tap/business/src/components/TablePage.vue'
import { FilterBar } from '@tap/component'
import dayjs from 'dayjs'
import { ElIcon, ElTag } from 'element-plus'
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import GroupExportDialog from './GroupExportDialog.vue'
import GroupImportDialog from './GroupImportDialog.vue'
import GroupManagementModal from './GroupManagementModal.vue'
import RecordDetailDialog from './RecordDetailDialog.vue'

const route = useRoute()

// 表格引用
const table = ref()

// 导入对话框
const importDialogVisible = ref(false)

// 导出对话框
const exportDialogVisible = ref(false)

// 记录详情对话框
const detailDialogVisible = ref(false)
const currentRecord = ref<GroupInfoRecordDto | null>(null)

// 打开详情弹窗
const handleViewDetail = (row: GroupInfoRecordDto) => {
  currentRecord.value = row
  detailDialogVisible.value = true
}

// 搜索参数
const searchParams = ref({
  keyword: '',
  type: '',
  status: '',
})

Object.assign(searchParams.value, route.query)

// 筛选项配置
const filterItems = ref([
  {
    label: '关键词',
    key: 'keyword',
    type: 'input',
    placeholder: '搜索文件名',
  },
  {
    label: '类型',
    key: 'type',
    type: 'select-inner',
    options: [
      { label: '全部', value: '' },
      { label: '导入', value: 'import' },
      { label: '导出', value: 'export' },
    ],
  },
  {
    label: '状态',
    key: 'status',
    type: 'select',
    placeholder: '全部',
    options: [
      { label: '全部', value: '' },
      { label: '进行中', value: 'importing,exporting' },
      { label: '已完成', value: 'completed' },
      { label: '失败', value: 'failed' },
    ],
  },
])

watch(
  () => route.query,
  () => {
    Object.assign(searchParams.value, route.query)
    table.value.fetch(1)
  },
)

// 排序参数
const sortParams = ref({
  order: 'operationTime',
  sort: 'DESC',
})

// 获取数据
const getData = async ({
  page,
}: {
  page: { current: number; size: number }
}) => {
  const where: Record<string, any> = {}
  const { type, status, keyword } = searchParams.value

  // 关键词搜索
  if (keyword) {
    where.fileName = { like: keyword, options: 'i' }
  }

  // 类型筛选
  if (type) {
    where.type = type
  }

  // 状态筛选
  if (status) {
    const statuses = status.split(',')
    if (statuses.length > 1) {
      where.status = { inq: statuses }
    } else {
      where.status = status
    }
  }

  const filter = {
    where,
    limit: page.size,
    skip: (page.current - 1) * page.size,
    order: `${sortParams.value.order} ${sortParams.value.sort}`,
  }

  const result = await fetchGroupInfoRecordList(filter)

  return {
    data: result.items || [],
    total: result.total || 0,
  }
}

// 处理排序
const handleSortTable = ({ prop, order }: { prop: string; order: string }) => {
  if (prop && order) {
    sortParams.value.order = prop
    sortParams.value.sort = order === 'ascending' ? 'ASC' : 'DESC'
    table.value?.fetch(1)
  }
}

// 格式化时间
const formatTime = (time: string | Date) => {
  return time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'
}

// 获取状态配置
const getStatusConfig = (status: string) => {
  const statusMap = {
    importing: { type: 'warning', text: '导入中', icon: WarningFilled },
    exporting: { type: 'warning', text: '导出中', icon: WarningFilled },
    completed: { type: 'success', text: '已完成', icon: CircleCheckFilled },
    failed: { type: 'danger', text: '失败', icon: CircleCloseFilled },
  }
  return (
    statusMap[status as keyof typeof statusMap] || {
      type: 'info',
      text: status,
      icon: null,
    }
  )
}

// 获取类型文本
const getTypeText = (type: string) => {
  return type === 'import' ? '导入' : '导出'
}

// 分组管理弹窗
const groupManagementVisible = ref(false)

const handleOpenGroupManagement = () => {
  groupManagementVisible.value = true
}

const handleGroupManagementSaved = () => {
  // 可以在这里刷新列表或显示成功消息
  table.value?.fetch()
}

// 导入成功回调
const handleImportSuccess = () => {
  table.value?.fetch()
}
</script>

<template>
  <PageContainer>
    <template #actions>
      <el-button @click="handleOpenGroupManagement">
        <template #icon>
          <i-lucide-layers />
        </template>
        分组管理
      </el-button>
      <el-button @click="importDialogVisible = true">
        <template #icon>
          <i-lucide-download />
        </template>
        导入
      </el-button>
      <el-button @click="exportDialogVisible = true">
        <template #icon>
          <i-lucide-upload />
        </template>
        导出
      </el-button>
    </template>
    <TablePage
      ref="table"
      row-key="id"
      :remote-method="getData"
      :default-sort="{ prop: 'operationTime', order: 'descending' }"
      @sort-change="handleSortTable"
    >
      <template #search>
        <div class="search-bar">
          <FilterBar
            v-model:value="searchParams"
            :items="filterItems"
            @fetch="table.fetch(1)"
          />
        </div>
      </template>

      <!-- 类型列 -->
      <el-table-column prop="type" label="类型" width="100" align="center">
        <template #default="{ row }">
          <ElTag
            :type="row.type === 'import' ? 'primary' : 'success'"
            disable-transitions
          >
            {{ getTypeText(row.type) }}
          </ElTag>
        </template>
      </el-table-column>

      <!-- 文件名列 -->
      <el-table-column
        prop="fileName"
        label="文件名"
        min-width="250"
        show-overflow-tooltip
      />

      <!-- 状态列 -->
      <el-table-column prop="status" label="状态" width="120" align="center">
        <template #default="{ row }">
          <div class="flex align-center justify-center gap-1">
            <ElIcon
              v-if="getStatusConfig(row.status).icon"
              :class="`color-${getStatusConfig(row.status).type}`"
            >
              <component :is="getStatusConfig(row.status).icon" />
            </ElIcon>
            <span>{{ getStatusConfig(row.status).text }}</span>
          </div>
        </template>
      </el-table-column>

      <!-- 操作人列 -->
      <el-table-column
        prop="operator"
        label="操作人"
        width="150"
        show-overflow-tooltip
      />

      <!-- 操作时间列 -->
      <el-table-column
        prop="operationTime"
        label="操作时间"
        width="180"
        sortable="custom"
      >
        <template #default="{ row }">
          {{ formatTime(row.operationTime) }}
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column label="操作" width="100" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" text @click="handleViewDetail(row)">
            查看详情
          </el-button>
        </template>
      </el-table-column>
    </TablePage>

    <!-- 分组管理弹窗 -->
    <GroupManagementModal
      v-model="groupManagementVisible"
      @saved="handleGroupManagementSaved"
    />

    <!-- 分组导入弹窗 -->
    <GroupImportDialog
      v-model="importDialogVisible"
      @success="handleImportSuccess"
    />

    <!-- 分组导出弹窗 -->
    <GroupExportDialog v-model="exportDialogVisible" />

    <!-- 导入记录详情弹窗 -->
    <RecordDetailDialog v-model="detailDialogVisible" :record="currentRecord" />
  </PageContainer>
</template>

<style lang="scss" scoped>
.search-bar {
  width: 100%;
}
</style>
