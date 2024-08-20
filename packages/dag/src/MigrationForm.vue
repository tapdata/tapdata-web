<template>
  <section class="migration-form-page flex flex-column h-100 gap-4">
    <div class="px-5 py-4 bg-white rounded-lg">
      <ElBreadcrumb class="breadcrumb" separator-class="el-icon-arrow-right">
        <ElBreadcrumbItem>数据复制</ElBreadcrumbItem>
        <ElBreadcrumbItem>创建复制任务</ElBreadcrumbItem>
      </ElBreadcrumb>

      <el-divider class="my-4"></el-divider>

      <el-steps class="form-steps gap-4" :active="currentStep">
        <el-step v-for="(step, index) in steps" :key="index" :title="step.title"></el-step>
      </el-steps>
    </div>

    <div class="rounded-lg flex-1 min-h-0">
      <component :is="steps[currentStep].component" @prev="prevStep" @next="nextStep"></component>
    </div>
  </section>
</template>

<script>
import SourceStep from './components/steps/SourceStep.vue'
import TargetStep from './components/steps/TargetStep.vue'
import TaskStep from './components/steps/TaskStep.vue'

export default {
  name: 'MigrationForm',
  components: { SourceStep, TargetStep, TaskStep },
  data() {
    return {
      currentStep: 0,
      steps: [
        {
          title: '创建源连接',
          component: SourceStep
        },
        {
          title: '创建目标连接',
          component: TargetStep
        },
        {
          title: '配置数据复制任务',
          component: TaskStep
        },
        {
          title: '任务启动运行',
          component: SourceStep
        }
      ]
    }
  },
  methods: {
    prevStep() {
      this.currentStep -= 1
    },
    nextStep() {
      this.currentStep += 1
    }
  }
}
</script>

<style scoped lang="scss">
.migration-form-page {
  background-color: #f1f2f4;
}

.form-steps {
  ::v-deep {
    .el-step {
      display: flex !important;
      align-items: center;
      .el-step__head {
        position: static;
        width: auto;
        &.is-process {
          color: #fff;
          border-color: map-get($color, primary);

          .el-step__icon {
            background-color: map-get($color, primary);
          }
        }
      }
      .el-step__main {
        padding-inline: 8px 16px;
        background-color: #fff;
        z-index: 1;
      }
      .el-step__title {
        line-height: 24px;
        &.is-process {
          color: map-get($color, primary);
        }
      }
      .el-step__description {
        display: none;
      }
    }
  }
}
</style>
