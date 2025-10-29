<script setup lang="ts">
import TaskStatus from '@tap/business/src/components/TaskStatus.vue'

interface Task {
  name: string
  status: string
}

interface Props {
  reference?: HTMLElement | null
  tasks: Task[]
}

defineProps<Props>()

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
        {{ task.name }}
        <TaskStatus class="popover-list-item-status zoom-xs" :task="task" />
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
        background-color: #edf1f9;
      }

      :deep(.task-status-block) {
        min-width: unset;
      }
    }
    &.auto-width &-item {
      min-width: unset;
    }
  }
}
</style>
