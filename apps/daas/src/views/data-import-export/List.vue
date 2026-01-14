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
import { computed, reactive, ref } from 'vue'
import GroupExportDialog from './GroupExportDialog.vue'
import GroupImportDialog from './GroupImportDialog.vue'
import GroupManagementModal from './GroupManagementModal.vue'

// 表格引用
const table = ref()

// 导入对话框
const importDialogVisible = ref(false)

// 导出对话框
const exportDialogVisible = ref(false)

// 搜索参数
const searchParams = reactive({
  keyword: '',
  type: '',
  status: '',
})

// 筛选项配置
const filterItems = computed(() => [
  {
    label: '关键词',
    key: 'keyword',
    type: 'input',
    placeholder: '搜索文件名或操作人',
    value: searchParams.keyword,
  },
  {
    label: '类型',
    key: 'type',
    type: 'select',
    placeholder: '全部类型',
    value: searchParams.type,
    options: [
      { label: '全部类型', value: '' },
      { label: '导入', value: 'import' },
      { label: '导出', value: 'export' },
    ],
  },
  {
    label: '状态',
    key: 'status',
    type: 'select',
    placeholder: '全部状态',
    value: searchParams.status,
    options: [
      { label: '全部状态', value: '' },
      { label: '进行中', value: 'importing,exporting' },
      { label: '已完成', value: 'completed' },
      { label: '失败', value: 'failed' },
    ],
  },
])

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

  // 关键词搜索
  if (searchParams.keyword) {
    where.or = [
      { fileName: { like: searchParams.keyword, options: 'i' } },
      { operator: { like: searchParams.keyword, options: 'i' } },
    ]
  }

  // 类型筛选
  if (searchParams.type) {
    where.type = searchParams.type
  }

  // 状态筛选
  if (searchParams.status) {
    const statuses = searchParams.status.split(',')
    if (statuses.length > 1) {
      where.status = { inq: statuses }
    } else {
      where.status = searchParams.status
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

// 展开行
const expandedRows = ref<string[]>([])

const handleExpandChange = (row: GroupInfoRecordDto, expanded: boolean) => {
  if (expanded) {
    expandedRows.value.push(row.id)
  } else {
    const index = expandedRows.value.indexOf(row.id)
    if (index !== -1) {
      expandedRows.value.splice(index, 1)
    }
  }
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
      @expand-change="handleExpandChange"
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

      <!-- 错误信息列 -->
      <el-table-column
        prop="message"
        label="备注"
        min-width="200"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          <span v-if="row.message" class="color-danger">{{ row.message }}</span>
          <span v-else class="font-color-slight">-</span>
        </template>
      </el-table-column>

      <!-- 展开详情 -->
      <el-table-column type="expand">
        <template #default="{ row }">
          <div class="expand-content p-4">
            <div v-if="row.details && row.details.length > 0">
              <div
                v-for="(detail, index) in row.details"
                :key="index"
                class="detail-group mb-4"
              >
                <div class="detail-group-header mb-2">
                  <span class="fw-bold">分组：{{ detail.groupName }}</span>
                  <span v-if="detail.message" class="ml-2 color-warning">{{
                    detail.message
                  }}</span>
                </div>
                <el-table
                  :data="detail.recordDetails"
                  size="small"
                  border
                  class="detail-table"
                >
                  <el-table-column
                    prop="resourceType"
                    label="资源类型"
                    width="150"
                  >
                    <template #default="{ row: detailRow }">
                      <ElTag size="small" type="info" disable-transitions>
                        {{ detailRow.resourceType }}
                      </ElTag>
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="resourceName"
                    label="资源名称"
                    min-width="200"
                    show-overflow-tooltip
                  />
                  <el-table-column
                    prop="action"
                    label="操作"
                    width="120"
                    align="center"
                  >
                    <template #default="{ row: detailRow }">
                      <ElTag
                        size="small"
                        :type="
                          detailRow.action === 'IMPORTED' ||
                          detailRow.action === 'EXPORTED'
                            ? 'success'
                            : detailRow.action === 'REPLACED'
                              ? 'warning'
                              : detailRow.action === 'ERRORED'
                                ? 'danger'
                                : 'info'
                        "
                        disable-transitions
                      >
                        {{ detailRow.action }}
                      </ElTag>
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="message"
                    label="备注"
                    min-width="200"
                    show-overflow-tooltip
                  >
                    <template #default="{ row: detailRow }">
                      <span v-if="detailRow.message" class="color-danger">{{
                        detailRow.message
                      }}</span>
                      <span v-else class="font-color-slight">-</span>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
            <div v-else class="text-center font-color-slight">暂无详细记录</div>
          </div>
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
  </PageContainer>
</template>

<style lang="scss" scoped>
.search-bar {
  width: 100%;
}

.expand-content {
  background-color: var(--bg-color-light);
}

.detail-group {
  &:last-child {
    margin-bottom: 0;
  }
}

.detail-group-header {
  padding: 8px 12px;
  background-color: var(--bg-color);
  border-radius: 4px;
}

.detail-table {
  :deep(.el-table__body) {
    background-color: white;
  }
}
</style>
