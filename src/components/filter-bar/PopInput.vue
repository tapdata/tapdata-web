<template>
  <ElPopover v-model="visible" v-bind="$attrs" :class="['v-pop-input', { dark: dark }, { overflow: overflow }]">
    <div>
      <ElInput v-model="current" @change="confirm"></ElInput>
      <div class="btn-row">
        <ElButton type="primary" @click="confirm">{{ $t('gl_button_confirm') }}</ElButton>
        <ElButton @click="close">{{ $t('gl_button_cancel') }}</ElButton>
      </div>
    </div>
    <div slot="reference" class="inner-select">
      <span class="inner-select__title">{{ title }}</span>
      <span :class="['inner-select__value', { placeholder: !value }]">{{ value || '请输入' }}</span>
      <VIcon v-if="value" size="12" class="close-btn ml-1" @click.stop="clear">close</VIcon>
    </div>
  </ElPopover>
</template>

<script>
import VIcon from '@/components/VIcon'

export default {
  name: 'PopInput',
  components: { VIcon },
  props: {
    value: [Number, String],
    title: [Number, String],
    dark: {
      type: Boolean,
      dafault: false
    },
    overflow: {
      type: Boolean,
      dafault: false
    }
  },
  watch: {
    value(v) {
      v && this.init()
    }
  },
  data() {
    return {
      visible: false,
      current: ''
    }
  },

  methods: {
    init() {
      console.log('innerLabel', this.innerLabel)
      if (this.value && this.current !== this.value) {
        this.current = this.value
      }
    },
    confirm() {
      this.$emit('input', this.current).$emit('change', this.current)
      this.close()
    },
    close() {
      this.visible = false
    },
    clear() {
      this.current = ''
      this.confirm()
    }
  }
}
</script>

<style lang="scss" scoped>
.v-pop-input {
  padding: 0 8px;
  display: inline-block;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  &.dark {
    border-color: transparent;
    &:hover {
      background-color: #fafafa;
    }
  }
  &.overflow {
    .inner-select__value {
      max-width: 60px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  ::v-deep {
    .el-popover__reference-wrapper {
      display: inline-block;
    }
  }
}
.btn-row {
  margin-top: 12px;
}
.inner-select {
  display: flex;
  align-items: center;
}
.inner-select__title {
  display: inline-block;
  color: map-get($fontColor, sub);
}
.inner-select__value {
  display: inline-block;
  padding-left: 8px;
  color: map-get($fontColor, main);
  &.placeholder {
    color: map-get($fontColor, sub);
  }
}
</style>
