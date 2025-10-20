<script>
import { ClipboardButton } from '@tap/form/src/components/clipboard-button'
export default {
  components: {
    ClipboardButton,
  },
  props: {
    value: {
      type: [String],
      required: true,
    },
    options: Array,
    placeholder: String,
    showCopyBtn: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['remove-tag', 'change', 'update:value'],
  computed: {
    values() {
      const value = this.value
      return value && value.length ? value.split(',') : []
    },
  },
  methods: {
    inputHandler(values) {
      //过滤空字符串并去重，之后使用逗号分隔
      this.$emit(
        'update:value',
        Array.from(new Set(values.filter((v) => !!v.trim()))).join(','),
      )
    },
  },
}
</script>

<template>
  <div class="multi-selection">
    <el-select
      :model-value="values"
      multiple
      filterable
      allow-create
      default-first-option
      :placeholder="placeholder"
      @remove-tag="$emit('remove-tag', $event)"
      @change="$emit('change', $event)"
      @input="inputHandler"
    >
      <el-option
        v-for="opt in options.filter((i) => !!i)"
        :key="opt"
        :label="opt"
        :value="opt"
      />
    </el-select>
    <ClipboardButton v-if="showCopyBtn" :content="value" icon />
  </div>
</template>

<style lang="scss" scoped>
.multi-selection {
  display: flex;
  align-items: center;
}
</style>

<style lang="scss">
.multi-selection .el-select__input.is-mini {
  height: 16px;
}
.multi-selection .el-select {
  padding-right: 8px;
}
</style>
