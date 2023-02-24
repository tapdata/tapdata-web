<template>
  <ElSteps v-bind="$attrs" :active="activeStep">
    <template v-if="!hasNumber">
      <ElStep
        v-for="(item, index) in stepList"
        :key="index"
        :class="[{ 'is-active': showActive === index + 1 }]"
      >
        <template v-slot:icon>
          <span
            class="circle-icon cursor-pointer"
            @click="$emit('activeStep', index)"
          ></span>
        </template>
        <template v-slot:title>
          <div class="cursor-pointer" @click="$emit('activeStep', index)">
            {{ item.label }}
          </div>
        </template>
        <template v-slot:description>
          <div
            v-if="item.desc"
            class="cursor-pointer"
            @click="$emit('activeStep', index)"
          >
            {{ item.desc }}
          </div>
        </template>
      </ElStep>
    </template>
    <template v-else>
      <ElStep
        v-for="(item, index) in stepList"
        :key="index"
        :title="item.label"
        :description="item.desc"
      ></ElStep>
    </template>
  </ElSteps>
</template>

<script>
export default {
  name: 'VStep',
  props: {
    stepList: {
      type: Array,
      default: () => {
        return []
        // 格式如下：
        // [
        //   {
        //     label: '步骤1',
        //     desc: '这是一段很长很长很长的描述性文字',
        //    }
        // ]
      },
    },
    activeStep: {
      type: Number,
      default: 0,
    },
    hasNumber: {
      type: Boolean,
      default: true,
    },
    showActive: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      active: 0,
    }
  },
  emits: ['activeStep'],
}
</script>

<style lang="scss">
/*// 步骤条*/
.el-steps {
  &.primary {
    .el-step__head {
      border-color: rgba(0, 0, 0, 0.25);
      color: rgba(0, 0, 0, 0.25);
      &.is-process {
        border-color: rgba(44, 101, 255, 1);
        color: rgba(44, 101, 255, 1);
      }
      &.is-success {
        border-color: rgba(44, 101, 255, 1);
        color: rgba(44, 101, 255, 1);
        .is-text {
          background-color: map-get($color, primary);
        }
        .el-step__line {
          background-color: map-get($color, primary);
        }
      }
      .el-step__line {
        height: 1px;
        top: 11px;
        left: 50%;
        right: -50%;
        background-color: map-get($color, disable);
      }
      .el-step__icon {
        background-color: #e9e9e9;
        border: 1px solid #e9e9e9;
        .el-step__icon-inner {
          font-weight: normal;
          color: map-get($fontColor, white);
        }
      }
      &.is-process {
        .el-step__icon {
          background-color: map-get($color, primary);
          border: 1px solid map-get($color, primary);
        }
      }
    }
    .el-step__title {
      font-size: 14px;
      font-weight: 400;
      color: map-get($fontColor, slight);
      &.is-process,
      &.is-success {
        color: map-get($fontColor, dark);
        font-weight: 500;
      }
    }
  }
  &.mini {
    .el-step__icon {
      &.is-icon {
        width: 12px;
      }
    }
    .el-step__icon-inner {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .el-step__icon-inner {
      background-color: map-get($color, disable);
    }
    .is-finish {
      .el-step__icon-inner {
        background-color: map-get($color, primary);
      }
    }
    .el-step__title {
      font-size: 14px;
      &.is-wait {
        color: map-get($fontColor, slight);
      }
      &.is-process {
        font-weight: 700;
        color: map-get($fontColor, slight);
      }
      &.is-finish {
        color: map-get($fontColor, normal);
      }
    }
    .el-step__description {
      color: map-get($fontColor, slight);
    }
  }
}
</style>

<style lang="scss" scoped>
.circle-icon {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: map-get($color, disable);
}
.el-steps {
  ::v-deep {
    .el-step__head .el-step__icon {
      border: 0;
    }
    .el-step__head.is-finish {
      color: map-get($color, disable);
      border-color: map-get($color, disable);
    }
    .el-step__line {
      height: 1px;
      top: 11px;
      left: 50%;
      right: -50%;
      background-color: map-get($color, disable);
    }
    .is-finish {
      .el-step__line {
        background-color: map-get($color, disable);
      }
      .el-step__line-inner {
        transition-delay: -150ms !important;
        border-width: 0px !important;
        width: 0% !important;
      }
    }
    .el-step__title,
    .el-step__description,
    .el-step__description {
      font-size: 14px;
      color: map-get($fontColor, slight);
    }
    .is-active {
      .el-step__title,
      .el-step__description {
        color: map-get($fontColor, normal);
      }
      .is-finish {
        .circle-icon {
          background-color: map-get($color, primary);
        }
      }
    }
  }
}
</style>
