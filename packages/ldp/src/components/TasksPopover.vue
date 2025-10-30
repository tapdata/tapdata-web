<script setup lang="ts">
import { inject } from 'vue'
import TaskStatusDot from './TaskStatusDot.vue'

interface Task {
  name: string
  status: string
}

interface Props {
  reference?: HTMLElement | null
  tasks: Task[]
}

defineProps<Props>()

const taskReplicateLagMap = inject<Record<string, string>>(
  'taskReplicateLagMap',
)!

const show = defineModel<boolean>()

const emit = defineEmits<{
  clickTask: [task: Task]
}>()

const handleClickTask = (task: Task) => {
  emit('clickTask', task)

  show.value = false
}
</script>

<template>
  <ElPopover
    v-model:visible="show"
    placement="bottom"
    popper-class="p-0 line-popover"
    :virtual-ref="reference"
    :hide-after="0"
    virtual-triggering
    trigger="click"
    width="auto"
  >
    <div class="popover-list p-1">
      <div
        v-for="(task, i) in tasks"
        :key="i"
        class="popover-list-item ellipsis px-2 flex align-center gap-2 rounded-lg"
        @click="handleClickTask(task)"
      >
        <TaskStatusDot :status="task.status" />
        {{ task.name }}
        <div
          v-if="
            task.status === 'running' && taskReplicateLagMap[task.id as string]
          "
          class="inline-flex align-center gap-1 rounded-4 px-1 py-0.5 lh-base"
          style="background-color: var(--bg-code)"
        >
          <el-icon class="font-color-sslight" size="12"
            ><i-lucide-clock /></el-icon
          ><span class="font-color-sslight fs-8">{{
            taskReplicateLagMap[task.id as string]
          }}</span>
        </div>
        <!-- <TaskStatus class="popover-list-item-status zoom-xs" :task="task" /> -->
      </div>
    </div>
  </ElPopover>
</template>

<style lang="scss" scoped>
.line-popover {
  .popover-list {
    &-item {
      min-width: 148px;
      font-size: 14px;
      line-height: 32px;
      cursor: pointer;

      &-status {
        line-height: normal;
      }

      &:hover {
        background-color: var(--el-fill-color);
      }

      :deep(.task-status-block) {
        min-width: unset;
        padding-inline: 6px;
      }
    }
    &.auto-width &-item {
      min-width: unset;
    }
  }
}
</style>
