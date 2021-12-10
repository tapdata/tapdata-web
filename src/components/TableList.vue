<template>
  <VTable v-bind="$attrs" v-on="$listeners" ref="table" class="table-list">
    <div slot="empty">
      <slot name="empty">
        <div class="instance-table__empty" slot="empty">
          <VIcon size="120">no-data-color</VIcon>
          <div class="flex justify-content-center lh-sm fs-7 font-color-sub">{{ $t('gl_no_data') }}</div>
        </div>
      </slot>
    </div>
    <template v-for="(key, slot) of $scopedSlots" v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope"></slot>
    </template>
  </VTable>
</template>

<script>
import VIcon from '@/components/VIcon'
import VTable from '@/components/v-table'
export default {
  name: 'TableList',
  components: { VIcon, VTable },
  methods: {
    fetch() {
      return this.$refs.table?.fetch(...arguments)
    },
    getData() {
      return this.$refs.table?.getData()
    }
  }
}
</script>
