<template>
  <div class="time-select__picker">
    <div class="picker__item inline-flex align-items-center cursor-pointer">
      <div class="time-select__title">{{ title }}</div>
      <ElSelect
        v-model="period"
        :popper-append-to-body="false"
        popper-class="time-select__popper"
        class="ml-2 dark"
        size="mini"
        ref="select"
        @change="changeFnc"
      >
        <ElOption v-for="(item, index) in items" :key="index" :label="item.label" :value="item.value"></ElOption>
      </ElSelect>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Frequency',

  props: {
    value: String,
    title: {
      type: String,
      default: () => {
        return '刷新频率'
      }
    },
    options: {
      type: Array,
      default: () => [
        {
          label: '5s',
          value: 5 * 1000
        },
        {
          label: '10s',
          value: 10 * 1000
        },
        {
          label: '30s',
          value: 30 * 1000
        },
        {
          label: '1m',
          value: 60 * 1000
        },
        {
          label: '5m',
          value: 5 * 60 * 1000
        },
        {
          label: '15m',
          value: 15 * 60 * 1000
        },
        {
          label: '30m',
          value: 30 * 60 * 1000
        },
        {
          label: '1h',
          value: 60 * 60 * 1000
        },
        {
          label: '2h',
          value: 2 * 60 * 60 * 1000
        },
        {
          label: '1d',
          value: 24 * 60 * 60 * 1000
        }
      ]
    }
  },

  data() {
    return {
      period: '',
      items: []
    }
  },

  mounted() {
    this.items = JSON.parse(JSON.stringify(this.options))
    this.period = this.items[0]?.value
  },

  methods: {
    changeFnc(value) {
      this.$emit('change', value)
    }
  }
}
</script>

<style lang="scss" scoped>
.time-select__picker {
  position: relative;
  ::v-deep {
    .time-select__popper {
      width: 270px;
      transform: translateX(-40px);
    }
    // 灰色风格下拉框
    .el-select {
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
}
.time-select__title {
  white-space: nowrap;
  line-height: 1.5;
}
.picker__item {
  padding: 0 4px;
  &:hover {
    background: #eef3ff;
  }
}
</style>
