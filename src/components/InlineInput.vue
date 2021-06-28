<template>
  <div class="inline-input-wrap">
    <span class="inline-input-body" v-show="!editing">
      <span class="ellipsis" :title="value">{{ value }}</span>
      <ElLink class="inline-input-link" style="margin-left: 5px;" @click="editing = true">
        <i class="iconfont td-icon-bianji"></i>
      </ElLink>
    </span>
    <span class="inline-input-body" v-show="editing">
      <ElTooltip manual effect="dark" content="字符长度限制1-32个字符" placement="top-start" :value="disabled">
        <ElInput class="input" :class="{ 'valid-input': disabled }" size="mini" v-model="inputValue"></ElInput>
      </ElTooltip>
      <ElButton
        class="inline-input-button"
        style="margin-left: 10px;"
        type="primary"
        size="mini"
        :disabled="disabled"
        @click="save"
        >保存</ElButton
      >
      <ElButton class="inline-input-button" size="mini" @click="cancel">取消</ElButton>
    </span>
  </div>
</template>

<script>
export default {
  props: {
    value: [String, Number]
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
  }
  .inline-input-button {
    padding: 5px 8px;
  }
  .valid-input .el-input__inner {
    border-color: #f04134;
  }
}
</style>
