<script>
import i18n from '@tap/i18n'

import VIcon from '../../base/VIcon.vue'

export default {
  name: 'TextEditable',
  components: {
    VIcon,
  },
  props: {
    value: String,
    readonly: Boolean,
    maxWidth: [String, Number],
    inputMinWidth: [String, Number],
    placeholder: {
      type: String,
      default: () => {
        return i18n.t('public_input_placeholder')
      },
    },
    hiddenIcon: Boolean,
    maxlength: {
      type: Number,
      default: 30,
    },
  },
  emits: ['update:value', 'change'],
  computed: {
    style() {
      const maxWidth = this.maxWidth
      return {
        maxWidth: maxWidth && !isNaN(maxWidth) ? `${maxWidth}px` : maxWidth,
      }
    },
    inputStyle() {
      const width = this.inputMinWidth
      return {
        minWidth: width && !isNaN(width) ? `${width}px` : width,
      }
    },
  },
  watch: {
    value: {
      deep: true,
      immediate: true,

      handler() {
        this.updateStyle()
      },
    },
  },
  methods: {
    handleInput(event) {
      this.$emit('update:value', event.target.value)
    },

    handleChange(event) {
      const val = event.target.value.trim()
      this.$emit('update:value', val)
      this.$emit('change', val)
    },

    handleFocusInput() {
      this.$refs.input.focus()
    },

    updateStyle() {
      this.$nextTick(() => {
        this.$refs.input.style.width = `${this.$refs.shadow.clientWidth}px`
      })
    },
  },
}
</script>

<template>
  <div
    class="text-editable-wrap inline-flex position-relative align-center"
    :style="style"
  >
    <div class="text-editable min-w-0">
      <input
        ref="input"
        :value="value"
        :readonly="readonly"
        :placeholder="placeholder"
        :style="inputStyle"
        :maxlength="maxlength"
        @input="handleInput"
        @change="handleChange"
      />
      <div ref="shadow" class="text-editable-shadow">
        {{ value || placeholder }}
      </div>
    </div>
    <VIcon
      v-if="!readonly"
      v-show="!hiddenIcon"
      class="text-editable-icon ml-2 flex-shrink-0"
      size="14"
      @click="handleFocusInput"
      >edit-outline</VIcon
    >
  </div>
</template>

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
      border-color: var(--color-primary);
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
      color: var(--color-primary);
    }
  }
}
</style>
