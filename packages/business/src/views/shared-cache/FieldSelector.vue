<script>
import { ClipboardButton } from '@tap/form/src/components/clipboard-button'

export default {
  components: {
    ClipboardButton,
  },
  props: {
    modelValue: {
      type: [String],
      required: true,
    },
    placeholder: String,
    options: Array,
  },
  emits: ['update:modelValue', 'change'],
  computed: {
    values: {
      get() {
        const value = this.modelValue
        return value && value.length ? value.split(',') : []
      },
      set(values) {
        //过滤空字符串并去重，之后使用逗号分隔
        const result = Array.from(
          new Set(values.filter((v) => !!v.trim())),
        ).join(',')

        this.$emit('update:modelValue', result)
        this.$emit('change', result)
      },
    },
  },
  methods: {
    remove(index) {
      const newValues = [...this.values]
      newValues.splice(index, 1)
      this.values = newValues
    },
  },
}
</script>

<template>
  <span class="fields-selector">
    <ElSelect
      v-model="values"
      multiple
      filterable
      allow-create
      default-first-option
      class="fields-selector--input"
      :placeholder="placeholder"
    >
      <ElOption
        v-for="opt in options"
        :key="opt.value"
        :label="opt.label"
        :value="opt.value"
      >
        <span>{{ opt.label }}</span>
        <VIcon v-if="opt.is_index" size="12" class="field-icon ml-1">
          fingerprint
        </VIcon>
      </ElOption>
    </ElSelect>
    <template v-if="values.length">
      <div class="flex fields-selector--display mt-2 rounded-lg">
        <div class="flex flex-warp flex-1 gap-2 p-2">
          <el-tag
            v-for="(field, index) in values"
            :key="field"
            closable
            disable-transitions
            @close="remove(index)"
          >
            {{ field }}
          </el-tag>
        </div>
        <ClipboardButton
          class="fields-selector--clip"
          :content="modelValue"
          icon
        />
      </div>
    </template>
  </span>
</template>

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
  background: map.get($bgColor, normal);
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
  color: map.get($fontColor, dark);
}
.fields-selector--clip {
  position: absolute;
  right: -30px;
  top: 45px;
}
</style>
