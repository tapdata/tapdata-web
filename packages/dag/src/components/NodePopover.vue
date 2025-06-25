<script>
import { ElSelect as Select } from 'element-plus'
import { mapGetters } from 'vuex'

export default {
  name: 'NodePopover',
  components: {
    ElScrollbar: Select.components.ElScrollbar,
  },
  props: {
    popover: {},
  },
  emits: ['clickNode'],
  computed: {
    ...mapGetters('dataflow', ['processorNodeTypes']),
  },
  methods: {
    handleClick(node) {
      this.$emit('clickNode', node)
    },
  },
}
</script>

<template>
  <ElPopover
    v-if="popover.reference"
    v-bind="$attrs"
    ref="nodeMenu"
    v-model:visible="popover.show"
    placement="bottom"
    popper-class="rounded-xl p-0"
    :reference-el="popover.reference"
    width="auto"
  >
    <ElScrollbar
      tag="div"
      wrap-class="choose-list-wrap"
      view-class="choose-list p-1"
    >
      <div
        v-for="(n, ni) in processorNodeTypes"
        :key="ni"
        class="choose-item ellipsis px-4"
        @click="handleClick(n, ni)"
      >
        {{ n.name }}
      </div>
    </ElScrollbar>
  </ElPopover>
</template>
