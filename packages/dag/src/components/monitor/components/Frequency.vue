<script>
import i18n from '@tap/i18n'
import { $emit, $off, $on, $once } from '../../../../utils/gogocodeTransfer'

export default {
  name: 'Frequency',
  props: {
    value: String,
    title: {
      type: String,
      default: () => {
        return i18n.t('packages_dag_components_frequency_shuaxinpinlu')
      },
    },
    options: {
      type: Array,
      default: () => [
        {
          label: '5s',
          value: 5 * 1000,
        },
        {
          label: '10s',
          value: 10 * 1000,
        },
        {
          label: '30s',
          value: 30 * 1000,
        },
        {
          label: '1m',
          value: 60 * 1000,
        },
        {
          label: '5m',
          value: 5 * 60 * 1000,
        },
        {
          label: '15m',
          value: 15 * 60 * 1000,
        },
        {
          label: '30m',
          value: 30 * 60 * 1000,
        },
        {
          label: '1h',
          value: 60 * 60 * 1000,
        },
        {
          label: '2h',
          value: 2 * 60 * 60 * 1000,
        },
        {
          label: '1d',
          value: 24 * 60 * 60 * 1000,
        },
      ],
    },
  },
  emits: ['change', 'update:value', , 'update:value'],
  data() {
    return {
      period: '',
      items: [],
    }
  },
  mounted() {
    this.items = JSON.parse(JSON.stringify(this.options))
    this.period = this.items[0]?.value
  },
  methods: {
    changeFnc(value) {
      $emit(this, 'change', value)
    },

    openSelect() {
      this.$refs.select?.$el?.click()
    },
  },
}
</script>

<template>
  <div class="time-select__picker">
    <div
      class="picker__item inline-flex align-items-center w-100"
      @click="openSelect"
    >
      <div class="time-select__title">{{ title }}</div>
      <ElSelect
        ref="select"
        v-model="period"
        popper-class="time-select__popper"
        class="ml-2 dark flex-1"
        style="min-width: 100px"
        @change="changeFnc"
      >
        <ElOption
          v-for="(item, index) in items"
          :key="index"
          :label="item.label"
          :value="item.value"
        />
      </ElSelect>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.time-select__picker {
  position: relative;

  :deep(.time-select__popper) {
    width: 270px;
    transform: translateX(-40px);
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

.time-select__title {
  white-space: nowrap;
  line-height: 1.5;
}

.picker__item {
  padding: 0 8px;
  border-radius: 4px;
}
</style>
