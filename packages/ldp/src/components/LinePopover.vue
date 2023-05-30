<template>
  <ElPopover
    v-if="popover.reference"
    ref="nodeMenu"
    v-model="popover.show"
    placement="bottom"
    popper-class="rounded-lg p-0 line-popover"
    :reference="popover.reference"
    v-on="$listeners"
  >
    <div class="popover-list p-1">
      <div
        v-for="(task, i) in popover.tasks"
        @click="handleClickTask(task)"
        :key="i"
        class="popover-list-item ellipsis px-3"
      >
        {{ task.name }}
        <TaskStatus class="popover-list-item-status" :task="task"></TaskStatus>
      </div>
    </div>
  </ElPopover>
</template>

<script>
import { mapGetters } from 'vuex'
import { TaskStatus } from '@tap/business'

export default {
  name: 'NodePopover',

  props: {
    popover: {}
  },

  computed: {
    ...mapGetters('dataflow', ['processorNodeTypes'])
  },

  components: {
    TaskStatus
  },

  methods: {
    handleClick(node) {
      this.$emit('click-node', node)
    },

    handleClickTask(task) {
      this.$emit('click-task', task)
      this.popover.show = false
    }
  }
}
</script>

<style scoped lang="scss">
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
