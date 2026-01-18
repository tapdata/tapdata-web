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
import { useI18n } from '@tap/i18n'
import dayjs from 'dayjs'
import { ElIcon, ElTag } from 'element-plus'
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import GroupExportDialog from './GroupExportDialog.vue'
import GroupImportDialog from './GroupImportDialog.vue'
import GroupManagementModal from './GroupManagementModal.vue'
import RecordDetailDialog from './RecordDetailDialog.vue'

const { t } = useI18n()
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
    label: t('public_keywords'),
    key: 'keyword',
    type: 'input',
    placeholder: t('public_input_placeholder_search'),
  },
  {
    label: t('public_type'),
    key: 'type',
    type: 'select-inner',
    options: [
      { label: t('public_select_option_all'), value: '' },
      { label: t('data_import_export_import'), value: 'import' },
      { label: t('data_import_export_export'), value: 'export' },
    ],
  },
  // {
  //   label: t('public_status'),
  //   key: 'status',
  //   type: 'select',
  //   placeholder: t('public_select_option_all'),
  //   options: [
  //     { label: t('public_select_option_all'), value: '' },
  //     { label: t('public_status_running'), value: 'importing,exporting' },
  //     { label: t('data_import_export_completed'), value: 'completed' },
  //     { label: t('data_import_export_failed'), value: 'failed' },
  //   ],
  // },
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
    importing: {
      type: 'warning',
      text: t('data_import_export_importing'),
      icon: WarningFilled,
    },
    exporting: {
      type: 'warning',
      text: t('data_import_export_exporting'),
      icon: WarningFilled,
    },
    completed: {
      type: 'success',
      text: t('data_import_export_completed'),
      icon: CircleCheckFilled,
    },
    failed: {
      type: 'danger',
      text: t('data_import_export_failed'),
      icon: CircleCloseFilled,
    },
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
  return type === 'import'
    ? t('data_import_export_import')
    : t('data_import_export_export')
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
        {{ t('data_import_export_group_management') }}
      </el-button>
      <el-button @click="importDialogVisible = true">
        <template #icon>
          <i-lucide-download />
        </template>
        {{ t('data_import_export_import') }}
      </el-button>
      <el-button @click="exportDialogVisible = true">
        <template #icon>
          <i-lucide-upload />
        </template>
        {{ t('data_import_export_export') }}
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
      <el-table-column
        prop="type"
        :label="t('public_type')"
        width="100"
        align="center"
      >
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
        :label="t('public_file_name')"
        min-width="250"
        show-overflow-tooltip
      />

      <!-- 状态列 -->
      <el-table-column
        prop="status"
        :label="t('public_status')"
        width="120"
        align="center"
      >
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
        :label="t('data_import_export_operator')"
        width="150"
        show-overflow-tooltip
      />

      <!-- 操作时间列 -->
      <el-table-column
        prop="operationTime"
        :label="t('data_import_export_operation_time')"
        width="180"
        sortable="custom"
      >
        <template #default="{ row }">
          {{ formatTime(row.operationTime) }}
        </template>
      </el-table-column>

      <!-- 操作列 -->
      <el-table-column
        :label="t('public_operation')"
        width="100"
        align="center"
        fixed="right"
      >
        <template #default="{ row }">
          <el-button type="primary" text @click="handleViewDetail(row)">
            {{ t('data_import_export_view_detail') }}
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
