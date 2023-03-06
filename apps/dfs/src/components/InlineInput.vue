<template>
  <div class="inline-input-wrap">
    <span class="inline-input-body" v-show="!editing">
      <span :class="[wordBreak ? 'word-break' : 'ellipsis']" :title="value" @click="$emit('click-text')">{{
        value
      }}</span>
      <ElLink
        v-if="type === 'text'"
        type="primary"
        class="inline-input-link"
        style="margin-left: 5px"
        :disabled="$disabledReadonlyUserBtn()"
        @click="editing = true"
      >
        {{ editText }}
      </ElLink>
      <ElLink
        v-else
        class="inline-input-link"
        style="margin-left: 5px"
        :disabled="$disabledReadonlyUserBtn()"
        @click="editing = true"
      >
        <VIcon v-bind="iconConfig" color="#999">edit-outline</VIcon>
      </ElLink>
    </span>
    <span class="inline-input-body gap-2" v-show="editing">
      <ElTooltip manual effect="dark" :content="tooltip" placement="top-start" :value="disabled">
        <ElInput
          v-bind="inputProps"
          class="input"
          :class="[{ 'valid-input': disabled }, 'block']"
          size="mini"
          :style="inputStyle"
          v-model:value="inputValue"
        ></ElInput>
      </ElTooltip>
      <template v-if="type === 'icon'">
        <ElButton class="icon-button min-w-0" size="medium" :disabled="disabled" @click="save"
          ><VIcon size="12">check</VIcon></ElButton
        >
        <ElButton class="icon-button min-w-0 m-0" size="medium" @click="cancel"
          ><VIcon size="12">close</VIcon></ElButton
        >
      </template>
      <template v-else-if="type === 'text'">
        <ElButton type="text" class="icon-button min-w-0" size="medium" :disabled="disabled" @click="save">{{
          saveText
        }}</ElButton>
        <ElButton type="text" class="icon-button m-0 min-w-0" size="medium" @click="cancel">{{ cancelText }}</ElButton>
      </template>
      <template v-else>
        <ElButton class="inline-input-button" type="primary" size="mini" :disabled="disabled" @click="save">{{
          $t('button_save')
        }}</ElButton>
        <ElButton class="inline-input-button m-0" size="mini" @click="cancel">{{ $t('button_cancel') }}</ElButton>
      </template>
    </span>
  </div>
</template>

<script>
import { $on, $off, $once, $emit } from '../utils/gogocodeTransfer'
import i18n from '@/i18n'

import { VIcon } from '@tap/component'
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
      default: 1
    },
    max: {
      type: Number,
      default: 32
    },
    editText: {
      type: String,
      default: () => {
        return i18n.global.t('button_edit')
      }
    },
    saveText: {
      type: String,
      default: () => {
        return i18n.global.t('button_save')
      }
    },
    cancelText: {
      type: String,
      default: () => {
        return i18n.global.t('button_cancel')
      }
    }
  },
  data() {
    return {
      editing: false,
      inputValue: ''
    }
  },
  computed: {
    disabled() {
      let value = this.inputValue
      if (!this.editing) {
        return false
      }
      let { min, max } = this
      let reg = new RegExp(`^.{${min},${max}}$`)
      return !reg.test(value)
    },
    tooltip() {
      let { min, max } = this
      return i18n.global.t('components_InlineInput_ziFuChangDuXian', {
        val1: min,
        val2: max
      })
    }
  },
  watch: {
    editing(val) {
      if (val) {
        this.inputValue = this.value
      }
    }
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
    }
  },
  emits: ['click-text', 'save', 'update:value']
}
</script>

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
    &:hover {
      border-color: #d9d9d9;
      background-color: #f5f6f7;
    }

    > span {
      display: contents;
    }
  }
  .inline-input-button {
    padding: 5px 8px;
  }
  .valid-input .el-input__inner {
    border-color: #f04134;
  }
}
</style>
