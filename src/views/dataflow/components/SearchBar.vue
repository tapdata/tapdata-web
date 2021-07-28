<template>
  <div class="search-container">
    <div :class="{ prefix: true, active: value.length > 0 }">
      <span class="el-icon-search"></span>
    </div>
    <div class="text">
      <input placeholder="搜索节点..." ref="input" :value="value" @input="onInput" />
    </div>
    <div class="suffix" v-if="value.length > 0" @click="clear">
      <span class="clear el-icon-circle-close clickable"></span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchBar',
  props: ['value'],
  mounted() {
    if (this.$props.eventBus) {
      this.$props.eventBus.$on('focus', () => {
        this.focus()
      })
    }
    setTimeout(() => {
      this.focus()
    }, 0)
  },
  methods: {
    focus() {
      const input = this.$refs.input
      if (input) {
        input.focus()
      }
    },
    onInput(event) {
      const input = event.target
      this.$emit('input', input.value)
    },
    clear() {
      this.$emit('input', '')
    }
  }
}
</script>

<style lang="scss" scoped>
.search-container {
  display: flex;
  height: 40px;
  flex-shrink: 0;
  align-items: center;
  padding: 0 14px;
  border-bottom: 1px solid #dbdfe7;
  //background-color: #f2f4f8;
  background-color: #fff;
}

.prefix {
  text-align: center;
  font-size: 16px;
  margin-right: 14px;

  &.active {
    color: var(--primary) !important;
  }
}

.text {
  flex-grow: 1;

  input {
    width: 100%;
    border: none !important;
    outline: none;
    font-size: 14px;
    -webkit-appearance: none;

    &::placeholder,
    &::-webkit-input-placeholder {
      color: #909399;
    }
  }
}

.suffix {
  min-width: 20px;
  text-align: center;
  display: inline-block;
}

.clear {
  border-radius: 50%;
  height: 16px;
  width: 16px;
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  color: #c0c4cc;

  &:hover {
    color: #909399;
  }

  &:before {
    line-height: 16px;
    display: flex;
    height: 16px;
    width: 16px;
    font-size: 16px;
    align-items: center;
    justify-content: center;
  }
}
</style>
