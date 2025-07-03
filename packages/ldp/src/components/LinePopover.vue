<script>
import TaskStatus from '@tap/business/src/components/TaskStatus.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'NodePopover',
  props: {
    popover: {},
  },
  computed: {
    ...mapGetters('dataflow', ['processorNodeTypes']),
  },
  components: {
    TaskStatus,
  },
  methods: {
    handleClick(node) {
      this.$emit('click-node', node)
    },

    handleClickTask(task) {
      this.$emit('click-task', task)
      this.popover.show = false
    },
  },
  emits: ['click-node', 'click-task'],
}
</script>

<template>
  <ElPopover
    v-if="popover.reference"
    v-bind="$attrs"
    ref="nodeMenu"
    v-model="popover.show"
    placement="bottom"
    popper-class="rounded-lg p-0 line-popover"
    :reference="popover.reference"
  >
    <div class="popover-list p-1">
      <div
        v-for="(task, i) in popover.tasks"
        :key="i"
        class="popover-list-item ellipsis px-3"
        @click="handleClickTask(task)"
      >
        {{ task.name }}
        <TaskStatus class="popover-list-item-status" :task="task" />
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
      border-radius: 6px;
      cursor: pointer;

      &-status {
        line-height: normal;
      }

      &:hover {
        background-color: #edf1f9;
      }
    }
    &.auto-width &-item {
      min-width: unset;
    }
  }
}
</style>
