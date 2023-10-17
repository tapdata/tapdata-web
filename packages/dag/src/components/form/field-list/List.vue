<template>
  <div class="field-inference__list">
    <VTable
      :columns="columnsList"
      :data="tableList"
      :has-pagination="false"
      ref="table"
      height="100%"
      :row-class-name="tableRowClassName"
    >
      <template v-slot:field_name="scope">
        <span class="flex align-center"
          ><span class="ellipsis">{{ scope.row.field_name }}</span>
          <VIcon v-if="scope.row.primary_key_position > 0" size="12" class="text-warning ml-1">key</VIcon>
        </span>
      </template>
    </VTable>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import { VTable, VIcon } from '@tap/component'
import i18n from '@tap/i18n'

export default {
  name: 'List',

  components: { VTable, VIcon },

  props: {
    data: {
      type: Object,
      default: () => {
        return {
          qualified_name: '',
          fields: []
        }
      }
    },
    showDelete: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      columns: [
        {
          label: i18n.t('packages_form_field_mapping_list_xuhao'),
          type: 'index',
          prop: 'index',
          width: '60px'
        },
        {
          label: i18n.t('packages_form_field_add_del_index_ziduanmingcheng'),
          prop: 'field_name',
          slotName: 'field_name',
          'min-width': '90px',
          'show-overflow-tooltip': true
        },
        {
          label: i18n.t('packages_form_dag_dialog_field_mapping_type'),
          prop: 'data_type',
          'min-width': '126px'
        }
      ]
    }
  },

  computed: {
    ...mapGetters('dataflow', ['activeType', 'activeNode', 'stateIsReadonly']),

    columnsList() {
      return this.columns
    },

    tableList() {
      const { fields } = this.data
      let list = fields || []
      const result = this.showDelete ? list : list.filter(t => !t.is_deleted)
      return result.sort((a, b) => a.is_deleted - b.is_deleted)
    }
  },

  methods: {
    doLayout() {
      this.$refs.table.doLayout()
    },

    tableRowClassName({ row }) {
      return row.is_deleted ? 'is-deleted' : ''
    }
  }
}
</script>

<style lang="scss" scoped>
.field-inference__list {
  height: 100%;
  ::v-deep {
    .is-deleted {
      color: map-get($color, disable);
    }
  }
}
</style>
