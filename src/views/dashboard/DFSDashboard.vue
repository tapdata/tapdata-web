<template>
  <section class="dfs-dashboard-wrap">
    <div class="dashboard-guide">
      <ElCard class="dashboard-guide-item">
        <i class="iconfont icon-shujukuqianyi2 dashboard-guide-item__icon"></i>
        <div class="dashboard-guide-item__content">
          <div class="dashboard-guide-item__title">
            {{ $t('dataFlow.databseMigrationHead') }}
          </div>
          <div class="dashboard-guide-item__desc">
            {{ $t('dataFlow.databseMigration') }}
          </div>
        </div>
      </ElCard>
      <ElCard class="dashboard-guide-item">
        <i class="iconfont icon-shujukuqianyi2 dashboard-guide-item__icon"></i>
        <div class="dashboard-guide-item__content">
          <div class="dashboard-guide-item__title">
            {{ $t('dataFlow.databseFreedomHead') }}
          </div>
          <div class="dashboard-guide-item__desc">
            {{ $t('dataFlow.databseFreedom') }}
          </div>
        </div>
      </ElCard>
      <ElCard class="dashboard-guide-item">
        <i class="iconfont icon-renwubianpai2 dashboard-guide-item__icon"></i>
        <div class="dashboard-guide-item__content">
          <div class="dashboard-guide-item__title">
            {{ $t('dataFlow.dataMigrationHead') }}
          </div>
          <div class="dashboard-guide-item__desc">
            {{ $t('dataFlow.dataFreedom') }}
          </div>
        </div>
      </ElCard>
      <ElCard class="dashboard-guide-item">
        <i class="iconfont icon-database dashboard-guide-item__icon"></i>
        <div class="dashboard-guide-item__content">
          <div class="dashboard-guide-item__title">
            {{ $t('dataFlow.creatSource') }}
          </div>
          <div class="dashboard-guide-item__desc">
            {{ $t('dataFlow.sourceDescription') }}
          </div>
        </div>
      </ElCard>
    </div>
  </section>
</template>

<script>
export default {
  data() {
    return {
      dialogVisible: false
    }
  }
}
</script>

<style lang="scss">
$color: #999999;
.dfs-dashboard-wrap {
  width: 100%;
  height: 100%;
  .dashboard-guide-item__icon {
    color: #48b6e2;
    font-size: 30px;
  }
}
.dashboard-guide {
  display: flex;
  justify-content: space-around;
  padding: 100px 0;
}
.dashboard-guide-item {
  width: 300px;
  cursor: pointer;
  .el-card__body {
    display: flex;
  }
  &:hover {
    border-color: #48b6e2;
  }
}
.dashboard-guide-item__content {
  margin-left: 10px;
}
.dashboard-guide-item__title {
  color: #48b6e2;
  font-size: 16px;
  font-weight: bold;
  line-height: 30px;
}
.dashboard-guide-item__desc {
  margin-top: 10px;
  color: #999;
  font-size: 14px;
}
</style>
