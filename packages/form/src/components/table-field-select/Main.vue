<script>
import { metadataInstancesApi } from '@tap/api'
import { cloneDeep, isEmpty } from 'lodash-es'

export default {
  name: 'AsyncSelect',

  props: {
    value: Object,
    nodeId: String,
    tableName: String,
    defaultFields: Array,
    refresh: String,
  },

  data() {
    return {
      result: {},
      selected: {
        table: '',
        fields: [],
      },
      options: [],
    }
  },

  watch: {
    tableName() {
      this.clear()
      this.loadOptions()
    },
    refresh() {
      this.init()
    },
  },

  mounted() {
    this.init()
    this.handleChange()
    this.loadOptions()
  },

  methods: {
    init() {
      if (this.value?.[this.tableName]?.length) {
        this.selected.table = this.tableName
        this.selected.fields = cloneDeep(this.value[this.tableName])
      } else {
        this.selected.table = this.tableName
        this.selected.fields = cloneDeep(this.defaultFields)
      }
    },

    async loadOptions() {
      const data = await metadataInstancesApi.nodeSchema(this.nodeId)
      this.options = data[0].fields
        .map((item) => ({
          label: item.field_name,
          value: item.field_name,
          isPrimaryKey: item.primary_key_position > 0,
          indicesUnique: !!item.indicesUnique,
          type: item.data_type,
        }))
        .filter((item) => !item.is_deleted)
    },

    handleChange() {
      if (this.$attrs.disabled) return
      this.result[this.selected.table] = cloneDeep(this.selected.fields)
      const result = cloneDeep(this.result)
      if (isEmpty(result)) {
        result[this.tableName] = cloneDeep(this.defaultFields)
      }

      this.$emit('update:value', result)
      this.$emit('change', result)
    },

    clear() {
      this.selected.table = ''
      this.selected.fields = []
      this.result = {}
    },
  },
}
</script>

<template>
  <div>
    <ElSelect
      v-bind="$attrs"
      v-model="selected.fields"
      multiple
      filterable
      allow-create
      default-first-option
      class="fields-selector--input"
      @change="handleChange"
    >
      <ElOption
        v-for="opt in options"
        :key="opt.value"
        :label="opt.label"
        :value="opt.value"
      />
    </ElSelect>
  </div>
</template>
