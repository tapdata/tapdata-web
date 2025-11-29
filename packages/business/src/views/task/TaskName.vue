<script setup lang="ts">
import { useI18n } from '@tap/i18n'
defineProps<{
  row: any
}>()

const { t } = useI18n()

const taskType = {
  initial_sync: t('public_task_type_initial_sync'),
  cdc: t('public_task_type_cdc'),
  'initial_sync+cdc': t('public_task_type_initial_sync_and_cdc'),
}

const emit = defineEmits<{
  clickName: [task: any]
  editInfo: [task: any]
}>()
</script>

<template>
  <div>
    <div class="dataflow-name flex flex-wrap">
      <ElLink
        role="ellipsis"
        type="primary"
        underline="never"
        class="justify-content-start ellipsis block mr-1 position-relative min-w-0 task-name-link"
        :class="['name', { 'has-children': row.hasChildren }]"
        @click.stop="$emit('clickName', row)"
      >
        <span class="inline-flex min-w-0">
          <span class="ellipsis">{{ row.name }}</span>
          <el-tooltip
            v-if="!row.desc"
            placement="top"
            :hide-after="0"
            :content="$t('packages_business_edit_task_info')"
            :enterable="false"
          >
            <el-button
              size="small"
              text
              class="edit-info-btn"
              @click.stop="$emit('editInfo', row)"
            >
              <template #icon>
                <el-icon><i-lucide-file-pen /></el-icon>
              </template>
            </el-button>
          </el-tooltip>
          <el-popover
            v-else
            placement="top"
            :content="row.desc"
            :hide-after="0"
            popper-style="width: auto;max-width: 448px"
          >
            <template #reference>
              <el-button
                size="small"
                text
                class="edit-info-btn"
                style="--el-button-text-color: var(--icon-n1)"
                @click.stop="$emit('editInfo', row)"
              >
                <template #icon>
                  <el-icon><i-lucide-file-text /></el-icon>
                </template>
              </el-button>
            </template>
            <template #default>
              <div class="mb-2 flex align-center gap-1">
                {{ row.name }}
                <el-button
                  class="flex-shrink-0"
                  size="small"
                  text
                  @click="$emit('editInfo', row)"
                >
                  <template #icon>
                    <el-icon><i-lucide-file-pen /></el-icon>
                  </template>
                </el-button>
              </div>
              <div
                class="bg-gray-50 dark:bg-card rounded-lg p-2 border border-gray-100"
              >
                <div>{{ row.desc }}</div>
              </div>
            </template>
          </el-popover>
        </span>
      </ElLink>

      <span
        v-if="row.listtags"
        class="justify-content-start ellipsis flex flex-wrap align-center gap-1"
      >
        <span
          v-for="item in row.listtags"
          :key="item.id"
          class="tag ellipsis"
          :title="item.value"
          >{{ item.value }}</span
        >
      </span>
    </div>
    <div class="fs-8 font-color-sslight lh-base flex align-center">
      <span class="align-middle">{{ row.type ? taskType[row.type] : '' }}</span>
      <VIcon
        v-if="row.attrs && row.attrs.editorType === 'form'"
        size="18"
        class="align-middle ml-1"
        >dynamic-form-outline</VIcon
      >
      <template v-if="row.status === 'running' && row.metricInfo">
        <el-divider direction="vertical" />
        <el-tooltip
          :content="row.metricInfo.lastUpdateTime"
          :enterable="false"
          :disabled="!row.metricInfo.hasWarning"
        >
          <div class="flex align-center gap-1">
            <el-icon v-if="row.metricInfo.hasWarning" class="color-warning"
              ><i-lucide-triangle-alert
            /></el-icon>
            <span class="font-color-sslight">CPU:</span>
            <span class="fw-sub">{{ row.metricInfo.cpuUsage }}</span>
            <span class="font-color-sslight ml-2">MEM:</span>
            <span class="fw-sub">{{ row.metricInfo.memoryUsage }}</span>
          </div>
        </el-tooltip>
      </template>
    </div>
  </div>
</template>
