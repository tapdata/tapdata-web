<template>
  <div class="multi-selection">
    <el-select
      size="mini"
      :value="values"
      multiple
      filterable
      allow-create
      default-first-option
      :placeholder="placeholder"
      @remove-tag="$emit('remove-tag', $event)"
      @change="$emit('change', $event)"
      @input="inputHandler"
    >
      <el-option v-for="opt in options.filter(i => !!i)" :key="opt" :label="opt" :value="opt"> </el-option>
    </el-select>
    <ClipboardButton v-if="showCopyBtn" :content="value" icon></ClipboardButton>
  </div>
</template>

<script>
import { ClipboardButton } from '@tap/form'
export default {
  components: {
    ClipboardButton
  },
  props: {
    value: {
      type: [String],
      required: true
    },
    options: Array,
    placeholder: String,
    showCopyBtn: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    values() {
      let value = this.value
      return value && value.length ? value.split(',') : []
    }
  },
  methods: {
    inputHandler(values) {
      //过滤空字符串并去重，之后使用逗号分隔
      this.$emit('input', Array.from(new Set(values.filter(v => !!v.trim()))).join(','))
    }
  }
}
</script>

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
