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
  emits: ['activeStep'],
  data() {
    return {
      active: 0,
    }
  },
}
</script>

<template>
  <ElSteps v-bind="$attrs" :active="activeStep">
    <template v-if="!hasNumber">
      <ElStep
        v-for="(item, index) in stepList"
        :key="index"
        :class="[{ 'is-active': showActive === index + 1 }]"
      >
        <template #icon>
          <span
            class="circle-icon cursor-pointer"
            @click="$emit('activeStep', index)"
          />
        </template>
        <template #title>
          <div class="cursor-pointer" @click="$emit('activeStep', index)">
            {{ item.label }}
          </div>
        </template>
        <template #description>
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
      />
    </template>
  </ElSteps>
</template>

<style lang="scss">
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
          background-color: var(--color-primary);
        }
        .el-step__line {
          background-color: var(--color-primary);
        }
      }
      .el-step__line {
        height: 1px;
        top: 11px;
        left: 50%;
        right: -50%;
        background-color: var(--color-disable);
      }
      .el-step__icon {
        background-color: #e9e9e9;
        border: 1px solid #e9e9e9;
        .el-step__icon-inner {
          font-weight: normal;
          color: var(--text-white);
        }
      }
      &.is-process {
        .el-step__icon {
          background-color: var(--color-primary);
          border: 1px solid var(--color-primary);
        }
      }
    }
    .el-step__title {
      font-size: 14px;
      font-weight: 400;
      color: var(--text-slight);
      &.is-process,
      &.is-success {
        color: var(--text-dark);
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
      background-color: var(--color-disable);
    }
    .is-finish {
      .el-step__icon-inner {
        background-color: var(--color-primary);
      }
    }
    .el-step__title {
      font-size: 14px;
      &.is-wait {
        color: var(--text-slight);
      }
      &.is-process {
        font-weight: 700;
        color: var(--text-slight);
      }
      &.is-finish {
        color: var(--text-normal);
      }
    }
    .el-step__description {
      color: var(--text-slight);
    }
  }
}
</style>

<style lang="scss" scoped>
.circle-icon {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-disable);
}
.el-steps {
  :deep(.el-step__head .el-step__icon) {
    border: 0;
  }

  :deep(.el-step__head.is-finish) {
    color: var(--color-disable);
    border-color: var(--color-disable);
  }

  :deep(.el-step__line) {
    height: 1px;
    top: 11px;
    left: 50%;
    right: -50%;
    background-color: var(--color-disable);
  }

  :deep(.is-finish) {
    .el-step__line {
      background-color: var(--color-disable);
    }
    .el-step__line-inner {
      transition-delay: -150ms !important;
      border-width: 0px !important;
      width: 0% !important;
    }
  }

  :deep(.el-step__title),
  :deep(.el-step__description),
  :deep(.el-step__description) {
    font-size: 14px;
    color: var(--text-slight);
  }

  :deep(.is-active) {
    .el-step__title,
    .el-step__description {
      color: var(--text-normal);
    }
    .is-finish {
      .circle-icon {
        background-color: var(--color-primary);
      }
    }
  }
}
</style>
