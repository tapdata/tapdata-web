<template>
  <div class="datetime-range flex cursor-pointer">
    <div class="datetime-range__title" @click="clickItem">{{ title }}</div>
    <ElDatePicker v-model="time" v-bind="$attrs" ref="datepicker" clearable class="date-picker"></ElDatePicker>
  </div>
</template>

<script>
export default {
  name: 'DatetimeRange',
  props: {
    value: [String, Array, Number],
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      time: '',
      item: {}
    }
  },
  watch: {
    time(v) {
      console.log('time', v)
    }
  },
  methods: {
    clickItem() {
      this.$refs.datepicker.focus()
    }
  }
}
</script>

<style lang="scss" scoped>
.datetime-range {
  padding: 0 8px;
  .el-input__inner {
    padding: 3px 0;
  }
  .datetime-range__title {
    margin-right: 8px;
    color: map-get($fontColor, sub);
  }
  &:hover {
    background-color: #fafafa;

    .el-date-editor {
      background-color: #fafafa;
      ::v-deep {
        .el-range-input {
          background-color: #fafafa;
        }
      }
    }
  }

  .el-date-editor {
    border: none;
    max-width: 320px;
    ::v-deep {
      .el-range-input {
        cursor: pointer;
      }
    }
  }
}
</style>
