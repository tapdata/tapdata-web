<template>
  <div :class="['echart-head', { flex: data.classFlex }]">
    <h2 v-if="data.title">{{ data.title }}</h2>
    <ElTooltip v-if="data.tip" style="margin-left: 10px" placement="top-start" :content="data.tip">
      <i class="echart-head-tooltip__icon el-icon-warning-outline"></i>
    </ElTooltip>
    <span style="flex: 1">
      <VIcon v-if="data && data.loading">loading-circle</VIcon>
    </span>
    <div v-if="data.unit" :class="['unit', 'mt-1', data.classfr]">
      <span>{{ data.unit }}</span>
    </div>
    <ElRadioGroup
      v-if="data.unit"
      v-model:value="time"
      style="margin-left: 10px"
      size="mini"
      :class="data.class"
      @change="changeFnc"
    >
      <ElRadioButton v-if="!this.data.hideSecond" label="second">{{ $t('dataFlow_second') }}</ElRadioButton>
      <ElRadioButton label="minute">{{ $t('dataFlow_min') }}</ElRadioButton>
      <ElRadioButton label="hour">{{ $t('dataFlow_hour') }}</ElRadioButton>
      <ElRadioButton label="day">{{ $t('dataFlow_day') }}</ElRadioButton>
    </ElRadioGroup>
  </div>
</template>

<script>
import { $on, $off, $once, $emit } from '../../utils/gogocodeTransfer'
import { VIcon } from '@tap/component'
export default {
  name: 'EchartHeader',
  components: { VIcon },
  props: {
    data: {
      type: Object,
      default: () => {
        return {
          title: '',
          tip: '',
          unit: '',
          class: '',
          hideSecond: false
        }
      }
    }
  },
  data() {
    return {
      num: 'flow',
      speed: 'qps',
      time: 'minute',
      rowCount: null,
      kbs: null,
      selectColor: ''
    }
  },
  methods: {
    changeFnc(val) {
      $emit(this, 'change', val, this.data)
    }
  },
  emits: ['change']
}
</script>

<style lang="scss" scoped>
.echart-head {
  /*// display: flex;*/
  align-items: center;
  height: 38px;
  padding: 0 10px;
  border-bottom: 1px solid #dcdfe6;
  background-color: #fafafa;
  h2 {
    display: inline-block;
    font-size: 14px;
    color: #333;
    vertical-align: bottom;
  }
  .arrow {
    display: inline-block;
    position: relative;
    width: 20px;
    height: 38px;
    overflow: hidden;

    .el-icon-caret-top {
      position: absolute;
      top: 8px;
    }

    .el-icon-caret-bottom {
      position: absolute;
      top: 16px;
    }
  }
  .unit {
    display: inline-block;
    font-size: 12px;
    span {
      padding: 3px 6px;
      border: 1px solid #ccc;
      border-radius: 3px;
    }
  }
  .echart-head-tooltip__icon {
    color: #999;
  }
}
</style>

<style lang="scss">
.echart-head {
  .el-radio-button--mini .el-radio-button__inner {
    padding: 4px 6px;
  }
  .el-radio-button__orig-radio:checked + .el-radio-button__inner {
    color: #fff;
  }
  .screeningColor,
  .putColor {
    .el-radio-button__orig-radio:checked + .el-radio-button__inner {
      background-color: #409eff;
      border-color: #409eff;
      box-shadow: -1px 0 0 0 #409eff;
    }
  }

  .transfColor {
    .el-radio-button__orig-radio:checked + .el-radio-button__inner {
      background-color: #fb8e00;
      border-color: #fb8e00;
      box-shadow: -1px 0 0 0 #fb8e00;
    }
  }

  .replicateColor {
    .el-radio-button__orig-radio:checked + .el-radio-button__inner {
      background-color: #f56c6c;
      border-color: #f56c6c;
      box-shadow: -1px 0 0 0 #f56c6c;
    }
  }
}
</style>
