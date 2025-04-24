<script>
import { FieldSelect } from '@tap/form'
import { computed, defineComponent } from 'vue'

export default defineComponent({
  components: {
    FieldSelect,
  },
  props: {
    value: {
      type: [String],
      required: true,
    },
    options: Array,
    placeholder: String,
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    const selectFields = computed({
      get() {
        return props.value ? props.value.split(',') : []
      },
      set(val) {
        emit(
          'update:value',
          val?.length
            ? Array.from(new Set(val.filter((v) => !!v.trim()))).join(',')
            : '',
        )
      },
    })

    const handleFocus = () => {
      emit('focus')
    }

    return {
      selectFields,
      handleFocus,
    }
  },
})
</script>

<template>
  <FieldSelect
    v-model="selectFields"
    filterable
    multiple
    item-label="field_name"
    item-value="field_name"
    :options="options"
    :placeholder="placeholder"
    @focus="handleFocus"
  />
</template>

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
