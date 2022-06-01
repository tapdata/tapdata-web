<template>
  <ElPopover
    v-model="visible"
    v-bind="$attrs"
    :class="['v-pop-input', { dark: dark }, { overflow: overflow }]"
    @show="show"
    @mouseenter.native="mouseEnterFnc"
    @mouseleave.native="mouseLeaveFnc"
  >
    <div>
      <ElInput v-model="current"></ElInput>
      <div class="btn-row">
        <ElButton type="primary" @click="confirm">{{ $t('button_confirm') }}</ElButton>
        <ElButton @click="cancel">{{ $t('button_cancel') }}</ElButton>
      </div>
    </div>
    <div slot="reference" class="inner-select">
      <span v-if="!!label" class="inner-select__title">{{ label }}</span>
      <span :class="['inner-select__value', { placeholder: !value }]">{{ value || $t('form_placeholder_input') }}</span>
      <VIcon v-if="showClose" size="12" class="icon-btn ml-1" @click.native.stop="clear">close</VIcon>
      <VIcon v-else size="10" class="icon-btn ml-1">arrow-down-fill</VIcon>
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
    label: [Number, String],
    clearable: {
      type: Boolean,
      default: false
    },
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
      showClose: false,
      current: ''
    }
  },

  methods: {
    init() {
      if (this.value && this.current !== this.value) {
        this.current = this.value
      }
    },
    show() {
      this.init()
    },
    confirm() {
      this.$emit('input', this.current).$emit('change', this.current)
      this.close()
    },
    cancel() {
      this.current = ''
      this.close()
    },
    close() {
      this.visible = false
      this.showClose = false
    },
    clear() {
      this.current = ''
      this.confirm()
    },
    mouseEnterFnc() {
      if (this.value && this.clearable) {
        this.showClose = true
      }
    },
    mouseLeaveFnc() {
      this.showClose = false
    }
  }
}
</script>

<style lang="scss" scoped>
.v-pop-input {
  padding: 0 8px;
  display: inline-block;
  font-size: 14px;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  cursor: pointer;
  height: 32px;
  box-sizing: border-box;
  &.dark {
    border-color: transparent;
    &:hover {
      background-color: #eff1f4;
      .icon-btn {
        color: #000;
      }
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
    //color: map-get($fontColor, sub);
  }
}
.icon-btn {
  color: map-get($fontColor, sub);
}
</style>
