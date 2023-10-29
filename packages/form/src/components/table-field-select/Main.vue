<template>
  <div>
    <ElSelect
      multiple
      filterable
      allow-create
      default-first-option
      v-bind="$attrs"
      class="fields-selector--input"
      v-model="selected.fields"
      @change="handleChange"
    >
      <ElOption v-for="opt in options" :key="opt.value" :label="opt.label" :value="opt.value"></ElOption>
    </ElSelect>
  </div>
</template>

<script>
import { cloneDeep, isEmpty } from 'lodash'
import { metadataInstancesApi } from '@tap/api'

export default {
  name: 'AsyncSelect',

  props: {
    value: Object,
    nodeId: String,
    tableName: String,
    defaultFields: Array
  },

  data() {
    return {
      result: {},
      selected: {
        table: '',
        fields: []
      },
      options: []
    }
  },

  watch: {
    tableName(v) {
      this.clear()
      this.loadData()
    }
  },

  mounted() {
    if (!isEmpty(this.value)) {
      this.selected.table = this.tableName
      this.selected.fields = cloneDeep(this.value[this.tableName])
    } else {
      this.selected.table = this.tableName
      this.selected.fields = cloneDeep(this.defaultFields)
    }
    this.handleChange()
    this.loadData()
  },

  methods: {
    async loadData() {
      const data = await metadataInstancesApi.nodeSchema(this.nodeId)
      this.options = data[0].fields
        .map(item => ({
          label: item.field_name,
          value: item.field_name,
          isPrimaryKey: item.primary_key_position > 0,
          indicesUnique: !!item.indicesUnique,
          type: item.data_type
        }))
        .filter(item => !item.is_deleted)
    },

    handleChange() {
      this.result[this.selected.table] = cloneDeep(this.selected.fields)
      let result = cloneDeep(this.result)
      if (isEmpty(result)) {
        result[this.tableName] = cloneDeep(this.defaultFields)
      }

      this.$emit('input', result).$emit('change', result)
    },

    clear() {
      this.selected.table = ''
      this.selected.fields = []
      this.result = {}
    }
  }
}
</script>
