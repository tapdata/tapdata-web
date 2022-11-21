<template>
  <el-dialog
    title="需要更多的服务？"
    :visible.sync="visible"
    :append-to-body="true"
    width="680px"
    custom-class="paid-upgrade-dialog"
  >
    <span class="paid-upgrade-desc">您使用的是免费版本，目前任务数量已经达到上限，请升级您的服务计划。</span>
    <ul class="flex paid-upgrade-ul mt-4">
      <li class="paid-upgrade-left">
        <div style="height: 150px">
          <div class="version mb-2">基础版 <span class="current">当前试用版</span></div>
          <div class="paid-upgrade-mb16"><span class="free">免费</span><span class="desc">试用所有功能</span></div>
        </div>
        <div class="link paid-upgrade-mb16"></div>
        <div class="currentList paid-upgrade-mb16">√ 最大任务数: 3</div>
        <div class="currentList paid-upgrade-mb16">√ 已用任务数: 3</div>
        <el-link type="primary">参与激励计划，奖励2个额外免费任务数</el-link>
      </li>
      <li class="paid-upgrade-right ml-6">
        <div style="height: 150px">
          <div class="version mb-2">标准版</div>
          <div class="desc paid-upgrade-mb16">收费详情（每年）</div>
          <div class="content mb-2 flex justify-content-between">
            <span>基础月费含5个任务</span> <span class="version">¥12000</span>
          </div>
          <div class="content flex justify-content-between">
            <span>每个额外的任务</span> <span class="version">¥300</span>
          </div>
        </div>
        <div class="link paid-upgrade-mb16"></div>
        <div class="currentList paid-upgrade-mb16">√ 任务数不限</div>
        <div class="currentList paid-upgrade-mb16">√ 提供SLA支持</div>
        <el-button class="float-end" type="primary" @click="goPaidUpgrade">升 级</el-button>
      </li>
    </ul>
  </el-dialog>
</template>

<script>
export default {
  name: 'PaidUpgradeDialog',
  props: ['visible'],
  methods: {
    goPaidUpgrade() {
      this.$router.push({
        name: 'PaidUpgrade'
      })
    }
  }
}
</script>

<style scoped lang="scss">
.paid-upgrade-dialog {
  .paid-upgrade-desc {
    font-weight: 400;
    font-size: 14px;
    color: map-get($fontColor, light);
  }
  .paid-upgrade-ul li {
    width: 304px;
    border: 1px solid map-get($borderColor, light);
    border-radius: 4px;
    padding: 16px;
  }
  .current {
    font-weight: 400;
    font-size: 10px;
    line-height: 14px;
    color: map-get($color, lprimary);
    border: 1px solid map-get($color, disprimary);
    border-radius: 2px;
    padding: 2px;
  }
  .version {
    font-weight: 600;
    font-size: 16px;
    line-height: 21px;
    color: map-get($fontColor, dark);
  }
  .link {
    border-bottom: 1px solid map-get($borderColor, light);
  }
  .free {
    font-weight: 500;
    font-size: 12px;
    line-height: 17px;
    color: map-get($color, dark);
  }
  .desc {
    font-weight: 400;
    font-size: 12px;
    line-height: 17px;
    color: map-get($color, light);
  }
  .content {
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    color: map-get($color, normal);
  }
  .paid-upgrade-mb16 {
    margin-bottom: 16px;
  }
  .text {
    font-size: 12px;
  }
  .currentList {
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    color: map-get($color, dark);
  }
}
::v-deep {
  .el-dialog__body {
    padding: 0 20px 30px 20px;
  }
}
</style>
