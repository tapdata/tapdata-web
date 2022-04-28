<template>
  <ElSteps class="v-step-container" v-bind="$attrs" v-on="$listeners" :active="activeStep">
    <ElStep
      v-if="hasNumber"
      v-for="(item, index) in stepList"
      :key="index"
      :title="item.label"
      :description="item.desc"
    ></ElStep>
    <ElStep
      v-if="!hasNumber"
      v-for="(item, index) in stepList"
      :key="index"
      :class="[{ 'is-ative': showActive === index + 1 }]"
    >
      <span slot="icon" class="circle-icon cursor-pointer" @click="$emit('activeStep', index)"></span>
      <div slot="title" class="cursor-pointer" @click="$emit('activeStep', index)">
        {{ item.label }}
      </div>
      <div v-if="item.time" slot="description" class="cursor-pointer" @click="$emit('activeStep', index)">
        {{ item.time }}
      </div>
    </ElStep>
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
        //     time:'
        //    }
        // ]
      }
    },
    activeStep: {
      type: Number,
      default: 0
    },
    hasNumber: {
      type: Boolean,
      default: true
    },
    showActive: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      active: 0
    }
  },
  mounted() {
    console.log(this.hasNumber)
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
.v-step-container {
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
      .el-step__line {
        height: 2px;
        top: 11px;
        left: 50%;
        right: -50%;
        background-color: map-get($color, disable);
      }
      .is-finish {
        .circle-icon {
          background-color: map-get($color, primary);
        }
        .el-step__line {
          background-color: map-get($color, primary);
        }
      }
      .el-step__description,
      .el-step__description {
        color: map-get($fontColor, slight);
      }
      .is-ative {
        .el-step__title,
        .el-step__description {
          color: map-get($color, primary);
        }
      }
    }
  }
}
</style>
