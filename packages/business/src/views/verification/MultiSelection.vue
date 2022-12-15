<template>
  <div class="multi-selection-data-verify">
    <el-select
      size="mini"
      :value="values"
      multiple
      filterable
      allow-create
      default-first-option
      class="item-select select-flied"
      :placeholder="placeholder"
      @remove-tag="$emit('remove-tag', $event)"
      @change="$emit('change', $event)"
      @input="inputHandler"
      @focus="handleFocus"
    >
      <el-option
        v-for="opt in options.filter(i => !!i)"
        :key="opt.id + opt.field_name"
        :label="opt.field_name"
        :value="opt.field_name"
      >
        <span>{{ opt.field_name }}</span>
        <span
          style="
            margin-left: 5px;
            background: rgb(245, 108, 108);
            color: map-get($fontColor, white);
            border-radius: 3px;
            display: inline-block;
            height: 22px;
            width: 24px;
            text-align: center;
            line-height: 22px;
            font-size: 12px;
          "
          v-if="opt.primary_key_position > 0"
          >PK</span
        >
      </el-option>
    </el-select>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: [String],
      required: true
    },
    options: Array,
    placeholder: String
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
    },

    handleFocus() {
      this.$emit('focus')
    }
  }
}
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
