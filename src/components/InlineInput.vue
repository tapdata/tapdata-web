<template>
  <div class="inline-input-wrap">
    <span class="inline-input-body" v-show="!editing">
      <span class="ellipsis" :title="value" @click="$emit('click-text')">{{ value }}</span>
      <ElLink class="inline-input-link" style="margin-left: 5px" @click="editing = true">
        <VIcon color="#999" size="14" v-bind="iconConfig">edit-outline</VIcon>
      </ElLink>
    </span>
    <span class="inline-input-body" v-show="editing">
      <ElTooltip manual effect="dark" content="字符长度限制1-32个字符" placement="top-start" :value="disabled">
        <ElInput
          class="input"
          :class="[{ 'valid-input': disabled }, 'block']"
          size="mini"
          v-model="inputValue"
        ></ElInput>
      </ElTooltip>
      <template v-if="type === 'icon'">
        <ElButton class="icon-button ml-4" size="medium" :disabled="disabled" @click="save"
          ><VIcon size="12">check</VIcon></ElButton
        >
        <ElButton class="icon-button ml-2" size="medium" @click="cancel"><VIcon size="12">close</VIcon></ElButton>
      </template>
      <template v-else>
        <ElButton
          class="inline-input-button"
          style="margin-left: 10px"
          type="primary"
          size="mini"
          :disabled="disabled"
          @click="save"
          >保存</ElButton
        >
        <ElButton class="inline-input-button" size="mini" @click="cancel">取消</ElButton>
      </template>
    </span>
  </div>
</template>

<script>
import VIcon from '@/components/VIcon'
export default {
  components: { VIcon },
  props: {
    value: [String, Number],
    type: String,
    iconConfig: Object
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
      if (!value || !value.trim() || !/^.{1,32}$/.test(value)) {
        return true
      }
      return false
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
      this.$emit('save', this.inputValue)
    },
    cancel() {
      this.editing = false
    }
  }
}
</script>

<style lang="scss">
.inline-input-wrap {
  display: inline-block;
  .inline-input-body {
    display: flex;
    align-items: center;
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
