<template>
  <div class="picker__item inline-flex align-items-center cursor-pointer" @click="openSelect">
    <div class="select__title">{{ label }}</div>
    <ElSelect
      v-bind="$attrs"
      v-model="period"
      :popper-append-to-body="false"
      popper-class="time-select__popper"
      class="ml-2 dark flex-fill"
      ref="select"
      @change="changeFnc"
    >
      <ElOption v-for="(item, index) in list" :key="index" :label="item.label" :value="item.value"></ElOption>
    </ElSelect>
  </div>
</template>

<script>
import { $on, $off, $once, $emit } from '../utils/gogocodeTransfer'
import i18n from '@tap/i18n'

export default {
  name: 'DarkSelect',
  props: {
    value: String,
    label: {
      type: String,
      default: () => {
        return i18n.t('public_title')
      },
    },
    items: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      period: '',
      list: [],
    }
  },
  mounted() {
    this.list = JSON.parse(JSON.stringify(this.items))
    this.period = this.value
  },
  methods: {
    changeFnc(value) {
      $emit($emit(this, 'update:value', value), 'change', value)
    },

    openSelect() {
      this.$refs.select?.$el?.click()
    },
  },
  emits: ['change', 'update:value', , , 'update:value'],
}
</script>

<style lang="scss" scoped>
.select__title {
  white-space: nowrap;
  line-height: 1.5;
}
.picker__item {
  padding: 0 4px;
  border-radius: 2px;
  &:hover {
    background: #eef3ff;
  }
  :deep(.el-select) {
    &.dark {
      .el-input__inner {
        border: none;
        background-color: inherit;
      }
      .el-icon-arrow-up:before {
        content: '\e78f';
      }
    }
  }
}
</style>
