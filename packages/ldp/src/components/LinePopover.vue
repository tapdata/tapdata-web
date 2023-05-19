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
      <div class="popover-list-item ellipsis px-3">我是任务名称</div>
    </div>
  </ElPopover>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'NodePopover',

  props: {
    popover: {}
  },

  computed: {
    ...mapGetters('dataflow', ['processorNodeTypes'])
  },

  methods: {
    handleClick(node) {
      this.$emit('click-node', node)
    }
  }
}
</script>

<style scoped lang="scss">
.line-popover {
  .popover-list {
    &-item {
      margin-bottom: 2px;
      min-width: 148px;
      font-size: 14px;
      line-height: 32px;
      border-radius: 6px;
      cursor: pointer;

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
