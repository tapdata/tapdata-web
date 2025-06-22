<script>
import { FieldSelect } from '@tap/form/src/components/field-select/FieldSelect'
import { computed, defineComponent } from 'vue'

export default defineComponent({
  name: 'CollateMap',

  components: {
    FieldSelect,
  },
  props: {
    value: {
      type: Object,
      default: () => ({}),
    },
    fields: {
      type: Array,
    },
    sortColumn: {
      type: String,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:value', 'visibleChange'],
  setup(props, { emit }) {
    const setCharset = (value) => {
      selectedFields.value.forEach((key) => {
        props.value[key] = value
      })
    }

    const selectedFields = computed({
      get() {
        return Object.keys(props.value)
      },
      set(value) {
        const result = value.reduce((acc, key) => {
          acc[key] = charset.value
          return acc
        }, {})

        emit('update:value', result)
      },
    })

    const charset = computed({
      get() {
        return selectedFields.value.length
          ? props.value[selectedFields.value[0]]
          : ''
      },
      set(value) {
        setCharset(value)
      },
    })

    const sortColumns = computed(() => {
      return props.sortColumn ? props.sortColumn.split(',') : []
    })

    const sortFields = computed(() => {
      return (
        props.fields?.filter((field) =>
          sortColumns.value.includes(field.field_name),
        ) || []
      )
    })

    return {
      selectedFields,
      charset,
      sortFields,
    }
  },
})
</script>

<template>
  <div class="flex flex-column gap-3">
    <div class="flex flex-column gap-3">
      <FieldSelect
        v-model="selectedFields"
        multiple
        item-label="field_name"
        item-value="field_name"
        :options="sortFields"
        :placeholder="$t('packages_business_please_select_field')"
        class="flex-1"
        :loading="loading"
        @visible-change="$emit('visibleChange', $event)"
      />
      <ElInput
        v-model="charset"
        :placeholder="$t('packages_business_please_input_charset')"
        class="flex-1"
      />
    </div>
  </div>
</template>
