<template>
  <div class="py-3 flex flex-column gap-3">
    <div class="flex flex-column gap-3">
      <FieldSelect
        v-model="selectedFields"
        multiple
        itemLabel="field_name"
        itemValue="field_name"
        :options="sortFields"
        :placeholder="$t('packages_business_please_select_field')"
        class="flex-1"
      />
      <ElInput v-model="charset" :placeholder="$t('packages_business_please_input_charset')" class="flex-1" />
    </div>
  </div>
</template>

<script>
import { defineComponent, computed, ref, del, set } from '@vue/composition-api'
import { FieldSelect } from '@tap/form'
import { IconButton } from '@tap/component'

export default defineComponent({
  name: 'CollateMap',
  props: {
    value: {
      type: Object,
      default: () => ({})
    },
    fields: {
      type: Array,
      default: () => []
    },
    sortColumn: {
      type: String,
      required: true
    }
  },

  components: {
    FieldSelect,
    IconButton
  },

  setup(props, { emit }) {
    const setCharset = value => {
      selectedFields.value.forEach(key => {
        set(props.value, key, value)
      })
    }

    const selectedFields = computed({
      get() {
        return Object.keys(props.value)
      },
      set(value) {
        const result = value.reduce((acc, key) => {
          set(acc, key, charset.value)
          return acc
        }, {})

        emit('input', result)
      }
    })

    const charset = computed({
      get() {
        return selectedFields.value.length ? props.value[selectedFields.value[0]] : ''
      },
      set(value) {
        setCharset(value)
      }
    })

    const sortColumns = computed(() => {
      return props.sortColumn ? props.sortColumn.split(',') : []
    })

    const sortFields = computed(() => {
      return props.fields.filter(field => sortColumns.value.includes(field.field_name))
    })

    return {
      selectedFields,
      charset,
      sortFields
    }
  }
})
</script>
