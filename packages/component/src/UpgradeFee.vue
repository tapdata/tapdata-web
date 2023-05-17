<template>
  <el-dialog
    title="订阅升级"
    :visible.sync="visible"
    :append-to-body="true"
    width="680px"
    custom-class="paid-upgrade-dialog"
    :before-close="handleClose"
  >
    <ul class="flex paid-upgrade-ul mt-4">
      <li class="paid-upgrade-left">
        <div style="height: 150px">
          <div class="version mb-2">基础版</div>
          <div class="desc">提供免费实例体验服务</div>
          <div class="paid-upgrade-mb16"><span class="free">免费</span></div>
          <div class="currentList paid-upgrade-mb16">
            <VIcon size="16" class="mr-2 color-primary">check-bold</VIcon> 最大任务数:
            <span class="color-primary">3个</span>
          </div>
          <div class="currentList paid-upgrade-mb16">
            <VIcon size="16" class="mr-2 color-primary">check-bold</VIcon> 数据处理性能较低
          </div>
          <div class="currentList paid-upgrade-mb16">
            <VIcon size="16" class="mr-2 color-primary">check-bold</VIcon> 标准售后支持，响应时间长
          </div>
        </div>
      </li>
      <li class="paid-upgrade-right ml-6">
        <div style="height: 150px">
          <div class="version mb-2">专业版 <span class="color-danger">限时优惠</span></div>
          <div class="desc">提供专业化服务支持</div>
          <el-image :src="getImg('subscription_img_zyb')" alt="" />
          <div class="paid-upgrade-mb16"><span class="free">套餐付费</span></div>
          <div class="currentList paid-upgrade-mb16">
            <VIcon size="16" class="mr-2 color-primary">check-bold</VIcon> 任务数可根据购买规格提升至:
            <span class="color-primary">数百个</span>
          </div>
          <div class="currentList paid-upgrade-mb16">
            <VIcon size="16" class="mr-2 color-primary">check-bold</VIcon> 数据处理性能高
          </div>
          <div class="currentList paid-upgrade-mb16">
            <VIcon size="16" class="mr-2 color-primary">check-bold</VIcon> 高级售后支持, 具有服务可靠性承诺
          </div>
        </div>
        <el-button class="float-end" type="primary" @click="goPaidUpgrade">升 级</el-button>
      </li>
    </ul>
  </el-dialog>
</template>

<script>
export default {
  name: 'UpgradeFeeDialog',
  props: ['visible'],
  methods: {
    goPaidUpgrade() {
      this.$router.push({
        name: 'PaidUpgrade'
      })
    },
    handleClose() {
      this.$emit('update:visible', false)
    },
    getImg(name) {
      return require(`../../assets/images/${name}.png`)
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
    border-radius: 8px;
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
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    color: map-get($color, primary);
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
