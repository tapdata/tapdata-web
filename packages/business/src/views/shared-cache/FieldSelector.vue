<template>
  <span class="fields-selector">
    <ElSelect
      multiple
      filterable
      allow-create
      default-first-option
      class="fields-selector--input"
      :value="values"
      :placeholder="placeholder"
      @input="inputHandler"
    >
      <ElOption v-for="opt in options" :key="opt.value" :label="opt.label" :value="opt.value">
        <span>{{ opt.label }}</span>
        <VIcon v-if="opt.is_index" size="12" class="field-icon ml-1"> fingerprint </VIcon>
      </ElOption>
    </ElSelect>
    <template v-if="values.length">
      <div class="fields-selector--display flex p-2 mt-2">
        <div class="fields-selector--item mr-2" v-for="(field, index) in values" :key="field">
          <span>{{ field }}</span>
          <ElLink @click="remove(index)"><i class="el-icon-close"></i></ElLink>
        </div>
      </div>
      <ClipboardButton class="fields-selector--clip" :content="value" icon></ClipboardButton>
    </template>
  </span>
</template>

<script>
import { ClipboardButton } from '@tap/form'

export default {
  components: { ClipboardButton },
  props: {
    value: {
      type: [String],
      required: true
    },
    placeholder: String,
    options: Array
  },
  computed: {
    values() {
      let value = this.value
      return value && value.length ? value.split(',') : []
    }
  },
  methods: {
    inputHandler(values) {
      //过滤空字符串并去重，之后使用逗号分隔
      const result = Array.from(new Set(values.filter(v => !!v.trim()))).join(',')
      this.$emit('input', result).$emit('change', result)
    },
    remove(index) {
      this.values.splice(index, 1)
      this.inputHandler(this.values)
    }
  }
}
</script>

<style lang="scss">
.fields-selector {
  position: relative;
  display: inline-block;
  width: 100%;
}
.fields-selector--input {
  width: 100%;
}
.fields-selector--display {
  flex-wrap: wrap;
  max-height: 100px;
  background: map-get($bgColor, normal);
  border-radius: 4px;
  overflow: auto;
}
.fields-selector--item {
  margin: 8px 8px 8px 0;
  padding: 2px 6px;
  height: 24px;
  line-height: 20px;
  text-align: center;
  background: #f2f3f5;
  font-size: 12px;
  color: map-get($fontColor, dark);
}
.fields-selector--clip {
  position: absolute;
  right: -30px;
  top: 45px;
}
</style>
