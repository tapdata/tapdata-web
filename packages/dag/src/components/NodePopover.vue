<template>
  <ElPopover
    v-bind="$attrs"
    v-if="popover.reference"
    ref="nodeMenu"
    v-model:value="popover.show"
    placement="bottom"
    popper-class="rounded-xl p-0"
    :reference="popover.reference"
  >
    <ElScrollbar
      tag="div"
      wrap-class="choose-list-wrap"
      view-class="choose-list p-2"
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

<script>
import { $on, $off, $once, $emit } from '../utils/gogocodeTransfer'
import { Select } from 'element-ui'
import { mapGetters } from 'vuex'

export default {
  name: 'NodePopover',
  props: {
    popover: {},
  },
  components: {
    ElScrollbar: Select.components.ElScrollbar,
  },
  computed: {
    ...mapGetters('dataflow', ['processorNodeTypes']),
  },
  methods: {
    handleClick(node) {
      $emit(this, 'click-node', node)
    },
  },
  emits: ['click-node'],
}
</script>
