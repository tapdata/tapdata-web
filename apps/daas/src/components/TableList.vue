<template>
  <VTable v-bind="$attrs" v-on="$listeners" ref="table" border class="table-list">
    <div slot="empty" class="pt-6">
      <slot name="empty">
        <div class="instance-table__empty" slot="empty">
          <VIcon size="120">null</VIcon>
          <div class="flex justify-content-center lh-sm fs-7 font-color-slight">
            {{ $t('dag_dialog_field_mapping_no_data') }}
          </div>
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
export default {
  name: 'TableList',
  components: { VIcon },
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
<style scoped lang="scss">
.table-list {
  ::v-deep {
    .el-table {
      border: none;
    }
    .el-table__header {
      .el-table__cell {
        border-right: 0;
        &.is-leaf {
          border-bottom: 0;
        }
        &:hover {
          border-right: 1px solid map-get($borderColor, light);
        }
      }
      th {
        color: map-get($fontColor, normal);
        font-weight: 500;
        white-space: nowrap;
        background-color: map-get($bgColor, normal);
      }
    }
    .el-table__body {
      td {
        color: map-get($fontColor, light);
      }
    }
    &:after {
      width: 0;
    }
  }
}
</style>
