<script>
import i18n from '@tap/i18n'
import { $emit } from '../utils/gogocodeTransfer'

import VIcon from './base/VIcon.vue'
export default {
  components: { VIcon },
  props: {
    value: [String, Number],
    type: String,
    iconConfig: Object,
    wordBreak: Boolean,
    inputStyle: Object,
    inputProps: Object,
    min: {
      type: Number,
      default: 1,
    },
    max: {
      type: Number,
      default: 32,
    },
  },
  emits: ['click-text', 'save', 'update:value', , , 'update:value'],
  data() {
    return {
      editing: false,
      inputValue: '',
    }
  },
  computed: {
    disabled() {
      const value = this.inputValue
      if (!this.editing) {
        return false
      }
      const { min, max } = this
      const reg = new RegExp(`^.{${min},${max}}$`)
      return !reg.test(value)
    },
    tooltip() {
      const { min, max } = this
      return i18n.t('packages_component_src_inlineinput_zifuchangduxian', {
        val1: min,
        val2: max,
      })
    },
  },
  watch: {
    editing(val) {
      if (val) {
        this.inputValue = this.value
      }
    },
  },
  methods: {
    save() {
      this.editing = false
      if (this.inputValue === this.value) {
        return
      }
      $emit(this, 'save', this.inputValue)
    },
    cancel() {
      this.editing = false
    },
  },
}
</script>

<template>
  <div class="inline-input-wrap">
    <span v-show="!editing" class="inline-input-body">
      <span
        :class="[wordBreak ? 'word-break' : 'ellipsis']"
        :title="value"
        @click="$emit('click-text')"
        >{{ value }}</span
      >
      <ElLink
        class="inline-input-link"
        style="margin-left: 5px"
        @click="editing = true"
      >
        <VIcon v-bind="iconConfig" color="#999">edit-outline</VIcon>
      </ElLink>
    </span>
    <span v-show="editing" class="inline-input-body">
      <ElTooltip
        manual
        effect="dark"
        :content="tooltip"
        placement="top-start"
        :visible="disabled"
      >
        <ElInput
          v-bind="inputProps"
          v-model="inputValue"
          class="input"
          :class="[{ 'valid-input': disabled }, 'block']"
          :style="inputStyle"
        />
      </ElTooltip>
      <template v-if="type === 'icon'">
        <ElButton class="icon-button ml-4" :disabled="disabled" @click="save"
          ><VIcon size="12">check</VIcon></ElButton
        >
        <ElButton class="icon-button ml-2" @click="cancel"
          ><VIcon size="12">close</VIcon></ElButton
        >
      </template>
      <template v-else>
        <ElButton
          class="inline-input-button"
          style="margin-left: 10px"
          type="primary"
          :disabled="disabled"
          @click="save"
          >{{ $t('public_button_save') }}</ElButton
        >
        <ElButton class="inline-input-button" @click="cancel">{{
          $t('public_button_cancel')
        }}</ElButton>
      </template>
    </span>
  </div>
</template>

<style lang="scss">
.inline-input-wrap {
  display: inline-block;
  .inline-input-body {
    display: flex;
    align-items: center;
    .word-break {
      word-wrap: break-word;
      word-break: break-all;
      white-space: pre-wrap;
    }
  }
  .inline-input-link {
    font-size: inherit;
  }
  .input {
    width: 200px;
    &.block {
      .el-input__inner {
        display: block;
      }
    }
  }
  .icon-button {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
    width: 28px;
    height: 28px;
    line-height: unset;
  }
  .inline-input-button {
    padding: 5px 8px;
  }
  .valid-input .el-input__inner {
    border-color: #f04134;
  }
}
</style>
