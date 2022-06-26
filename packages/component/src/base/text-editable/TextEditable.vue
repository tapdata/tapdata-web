<template>
  <div class="text-editable-wrap inline-flex position-relative align-center" :style="style">
    <div class="text-editable min-w-0">
      <input
        ref="input"
        :value="value"
        :readonly="readonly"
        :placeholder="placeholder"
        :style="inputStyle"
        @input="handleInput"
        @change="handleChange"
      />
      <div ref="shadow" class="text-editable-shadow">{{ value || placeholder }}</div>
    </div>
    <VIcon
      v-if="!readonly"
      v-show="!hiddenIcon"
      @click="handleFocusInput"
      class="text-editable-icon ml-2 flex-shrink-0"
      size="14"
      >edit-outline</VIcon
    >
  </div>
</template>

<script>
export default {
  name: 'TextEditable',

  props: {
    value: String,
    readonly: Boolean,
    maxWidth: [String, Number],
    inputMinWidth: [String, Number],
    placeholder: {
      type: String,
      default: '请输入'
    },
    hiddenIcon: Boolean
  },

  computed: {
    style() {
      const maxWidth = this.maxWidth
      return {
        maxWidth: maxWidth && !isNaN(maxWidth) ? `${maxWidth}px` : maxWidth
      }
    },
    inputStyle() {
      const width = this.inputMinWidth
      return {
        minWidth: width && !isNaN(width) ? `${width}px` : width
      }
    }
  },

  watch: {
    value: {
      immediate: true,
      handler() {
        this.updateStyle()
      }
    }
  },

  methods: {
    handleInput(event) {
      this.$emit('input', event.target.value)
    },

    handleChange(event) {
      this.$emit('change', event.target.value)
    },

    handleFocusInput() {
      this.$refs.input.focus()
    },

    updateStyle() {
      this.$nextTick(() => {
        this.$refs.input.style.width = this.$refs.shadow.clientWidth + 'px'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.text-editable-wrap {
  .text-editable {
    padding: 0 4px;
    height: 28px;
    font-size: 14px;
    border: 1px solid transparent;
    border-radius: 4px;
    transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
    &:hover,
    &:focus-within {
      border-color: map-get($color, primary);
    }
    input {
      max-width: 100%;
      outline: none;
      box-shadow: none;
      color: inherit;
      background: 0 0;
      line-height: 26px;
      border: none;
    }
    &-shadow {
      position: absolute;
      height: 0;
      overflow: scroll;
      white-space: pre;
      visibility: hidden;
    }
    &-icon:hover {
      color: map-get($color, primary);
    }
  }
}
</style>
