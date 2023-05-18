<template>
  <ElPopover
    v-if="popover.reference"
    ref="nodeMenu"
    v-model="popover.show"
    placement="bottom"
    popper-class="rounded-xl p-0"
    :reference="popover.reference"
    v-on="$listeners"
  >
    <div class="choose-item ellipsis px-4">我是任务名称</div>
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
