<script>
import { IconButton, VIcon } from '@tap/component'
import i18n from '@/i18n'

import { $emit, $off, $on, $once } from '../../utils/gogocodeTransfer'

export default {
  components: { VIcon, IconButton },
  props: {
    value: [String, Number],
    type: String,
    inputWidth: String,
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
    editText: {
      type: String,
      default: () => {
        return i18n.t('public_button_edit')
      },
    },
    saveText: {
      type: String,
      default: () => {
        return i18n.t('public_button_save')
      },
    },
    cancelText: {
      type: String,
      default: () => {
        return i18n.t('public_button_cancel')
      },
    },
  },
  emits: ['click-text', 'save', 'update:value'],
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
      return i18n.t('components_InlineInput_ziFuChangDuXian', {
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
        :style="{
          width: inputStyle && inputStyle.width,
        }"
        :class="[wordBreak ? 'word-break' : 'ellipsis']"
        :title="value"
        @click="$emit('click-text')"
        >{{ value }}</span
      >
      <ElLink
        v-if="type === 'text'"
        type="primary"
        class="inline-input-link"
        @click="editing = true"
      >
        {{ editText }}
      </ElLink>
      <IconButton v-else class="ml-3" @click="editing = true">edit</IconButton>
    </span>
    <span v-show="editing" class="inline-input-body gap-2">
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
          :class="{ 'valid-input': disabled }"
          :style="inputStyle"
        />
      </ElTooltip>
      <template v-if="type === 'icon'">
        <ElButton class="icon-button min-w-0" :disabled="disabled" @click="save"
          ><VIcon size="12">check</VIcon></ElButton
        >
        <ElButton class="icon-button min-w-0 m-0" @click="cancel"
          ><VIcon size="12">close</VIcon></ElButton
        >
      </template>
      <template v-else-if="type === 'text'">
        <ElButton text class="min-w-0" :disabled="disabled" @click="save">{{
          saveText
        }}</ElButton>
        <ElButton text class="m-0 min-w-0" @click="cancel">{{
          cancelText
        }}</ElButton>
      </template>
      <template v-else>
        <ElButton
          class="inline-input-button"
          type="primary"
          :disabled="disabled"
          @click="save"
          >{{ $t('public_button_save') }}</ElButton
        >
        <ElButton class="inline-input-button m-0" @click="cancel">{{
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
