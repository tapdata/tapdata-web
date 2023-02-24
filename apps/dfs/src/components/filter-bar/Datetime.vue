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
      v-model:value="time"
      type="datetime"
      :clearable="false"
      :class="['date-picker', { 'empty-time': !this.time }]"
      ref="datepicker"
      @change="emitFnc"
    ></ElDatePicker>
    <VIcon v-if="showClose" size="12" class="icon-btn ml-1" @click.stop="clear">close</VIcon>
    <VIcon v-else size="10" class="icon-btn ml-1" @click="focusFnc">arrow-down-fill</VIcon>
  </div>
</template>

<script>
import { $on, $off, $once, $emit } from '../../utils/gogocodeTransfer'
import { VIcon } from '@tap/component'

export default {
  name: 'Datetime',
  components: { VIcon },
  props: {
    value: [String, Array, Number, Object],
    title: {
      type: String,
      default: ''
    },
    clearable: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      time: '',
      showClose: false
    }
  },
  watch: {
    value(v) {
      if (v) {
        this.time = v
      }
    }
  },
  mounted() {},
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
      $emit(this.$emit('update:value', time), 'change', time)
    },
    focusFnc() {
      this.$refs.datepicker?.focus()
    }
  },
  emits: ['change', 'update:value']
}
</script>

<style lang="scss" scoped>
.filter-datetime {
  padding-left: 8px;
  .filter-datetime__title {
    margin-right: 8px;
    cursor: pointer;
  }
  .el-date-editor {
    max-width: 150px;
    ::v-deep {
      input::placeholder {
        color: map-get($fontColor, main);
      }
      input {
        color: map-get($fontColor, main);
      }
    }
    &.empty-time {
      width: auto;
      ::v-deep {
        .el-input__inner {
          width: 80px;
        }
      }
    }
  }
  &.none-boder {
    ::v-deep {
      .el-input__inner {
        padding: 0;
        border-color: transparent;
      }
      .el-input__prefix {
        display: none;
      }
    }
  }
  &:hover {
    background-color: #eff1f4;
    ::v-deep {
      .el-input__inner {
        background-color: #eff1f4;
        cursor: pointer;
      }
    }
    .icon-btn {
      color: map-get($fontColor, main);
    }
  }
}
.icon-btn {
  position: absolute;
  top: 11px;
  right: 4px;
  color: map-get($fontColor, sub);
}
</style>
