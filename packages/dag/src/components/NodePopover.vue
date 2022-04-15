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
    <ElScrollbar tag="div" wrap-class="choose-list-wrap" view-class="choose-list p-2">
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
import { Select } from 'element-ui'
import { mapGetters } from 'vuex'

export default {
  name: 'NodePopover',

  props: {
    popover: {}
  },

  components: {
    ElScrollbar: Select.components.ElScrollbar
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
