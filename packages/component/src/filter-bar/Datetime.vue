<script>
import { $emit, $off, $on, $once } from '../../utils/gogocodeTransfer'
import VIcon from '../base/VIcon'

export default {
  name: 'Datetime',
  components: { VIcon },
  props: {
    value: [String, Array, Number, Object],
    title: {
      type: String,
      default: '',
    },
    clearable: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['change', 'update:value', , , 'update:value'],
  data() {
    return {
      time: '',
      showClose: false,
    }
  },
  watch: {
    value(v) {
      if (v) {
        this.time = v
      }
    },
  },
  methods: {
    mouseEnterFnc() {
      if (this.time && this.clearable) {
        this.showClose = true
      }
    },
    mouseLeaveFnc() {
      this.showClose = false
    },
    clear() {
      this.time = ''
      this.emitFnc()
    },
    emitFnc() {
      const { time } = this
      $emit($emit(this, 'update:value', time), 'change', time)
    },
    focusFnc() {
      this.$refs.datepicker?.focus()
    },
  },
}
</script>

<template>
  <div
    class="filter-datetime flex none-boder position-relative"
    @mouseenter="mouseEnterFnc"
    @mouseleave="mouseLeaveFnc"
  >
    <div v-if="title" class="filter-datetime__title" @click="focusFnc">
      {{ title }}
    </div>
    <ElDatePicker
      v-bind="$attrs"
      ref="datepicker"
      v-model="time"
      type="datetime"
      :clearable="false"
      :class="['date-picker', { 'empty-time': !time }]"
      @change="emitFnc"
    />
    <VIcon v-if="showClose" size="12" class="icon-btn ml-1" @click.stop="clear"
      >close</VIcon
    >
    <VIcon v-else size="10" class="icon-btn ml-1" @click="focusFnc"
      >arrow-down-fill</VIcon
    >
  </div>
</template>

<style lang="scss" scoped>
.filter-datetime {
  position: relative;
  // padding-left: 8px;
  .filter-datetime__title {
    margin-right: 8px;
    cursor: pointer;
    color: map.get($fontColor, normal);
  }
  .el-date-editor {
    max-width: 150px;
    :deep(input) {
      color: map.get($fontColor, dark);
    }

    :deep(input::placeholder) {
      color: map.get($fontColor, dark);
    }

    &.empty-time {
      width: 90px !important;
      :deep(.el-input__inner) {
        width: 80px;
        text-align: center;
        font-weight: 400;
      }
    }
  }
  &.none-boder {
    :deep(.el-input__inner) {
      padding: 0;
      border-color: transparent;
    }

    :deep(.el-input__prefix) {
      display: none;
    }
  }
  &:hover {
    // background-color: #eff1f4;
    :deep(.el-input__inner) {
      // background-color: #eff1f4;
      // cursor: pointer;
    }

    .icon-btn {
      color: map.get($fontColor, dark);
    }
  }
}
.icon-btn {
  position: absolute;
  top: 11px;
  right: 4px;
  color: map.get($fontColor, slight);
}
</style>
