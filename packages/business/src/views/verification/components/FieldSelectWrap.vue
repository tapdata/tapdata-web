<template>
  <FieldSelect
    v-model="selectFields"
    filterable
    multiple
    itemLabel="field_name"
    itemValue="field_name"
    :options="options"
    :placeholder="placeholder"
    @focus="handleFocus"
  />
</template>

<script>
import { FieldSelect } from '@tap/form'
import { defineComponent, computed } from '@vue/composition-api'

export default defineComponent({
  components: {
    FieldSelect
  },
  props: {
    value: {
      type: [String],
      required: true
    },
    options: Array,
    placeholder: String
  },
  setup(props, { emit }) {
    const selectFields = computed({
      get() {
        return props.value ? props.value.split(',') : []
      },
      set(val) {
        emit('input', val?.length ? Array.from(new Set(val.filter(v => !!v.trim()))).join(',') : '')
      }
    })

    const handleFocus = () => {
      emit('focus')
    }

    return {
      selectFields,
      handleFocus
    }
  }
})
</script>

<style lang="scss" scoped>
.multi-selection-data-verify {
  display: flex;
  align-items: center;
}
</style>
<style lang="scss">
.multi-selection-data-verify .el-select__input.is-mini {
  height: 16px;
}
.multi-selection-data-verify {
  .item-select {
    width: 100%;
  }
}
</style>
