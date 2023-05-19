<template>
  <el-dialog
    :title="$t('packages_component_src_upgradefee_dingyueshengji')"
    :visible.sync="visible"
    :append-to-body="true"
    width="680px"
    custom-class="paid-upgrade-dialog"
    :before-close="handleClose"
  >
    <ul class="flex paid-upgrade-ul mt-4">
      <li class="paid-upgrade-left flex flex-column">
        <div class="px-4 py-4 flex-1">
          <div class="version mb-2">{{ $t('packages_component_src_upgradefee_jichuban') }}</div>
          <div class="desc">{{ $t('packages_component_src_upgradefee_tigongmianfeishi') }}</div>
          <div class="paid-upgrade-l-height flex align-items-center">
            <span class="free">{{ $t('packages_component_src_upgradefee_mianfei') }}</span>
          </div>
          <div class="currentList paid-upgrade-mb16 mt-2 flex">
            <VIcon size="16" class="mr-2 color-primary">check-bold</VIcon
            >{{ $t('packages_component_src_upgradefee_zuidarenwushu') }}
            <span class="color-primary">&nbsp{{ $t('packages_component_src_upgradefee_ge') }}</span>
          </div>
          <div class="currentList paid-upgrade-mb16 flex">
            <VIcon size="16" class="mr-2 color-primary">check-bold</VIcon
            ><span>{{ $t('packages_component_src_upgradefee_biaozhunshouhouzhi') }}</span>
          </div>
        </div>
        <div class="footer flex justify-content-between align-items-center px-4">
          {{ $t('packages_component_src_upgradefee_dangqianbanben') }}
        </div>
      </li>
      <li class="paid-upgrade-right ml-6 flex flex-column bg">
        <div class="px-4 py-4 flex-1">
          <div class="flex">
            <div>
              <div class="version mb-2">
                {{ $t('packages_component_src_upgradefee_zhuanyeban')
                }}<span class="discount inline-block fs-8 fw-normal">{{
                  $t('packages_component_src_upgradefee_xianshiyouhui')
                }}</span>
              </div>
              <div class="desc">{{ $t('packages_component_src_upgradefee_tigongzhuanyehua') }}</div>
              <div
                class="paid-upgrade-height flex align-items-center"
                :class="[{ 'paid-upgrade-cn-height': this.$i18n.locale === 'zh-CN' }]"
              >
                <span class="free">{{ $t('packages_component_src_upgradefee_taocanfufei') }}</span>
              </div>
            </div>
          </div>
          <div class="currentList paid-upgrade-mb16 mt-2 flex">
            <VIcon size="16" class="mr-2 color-primary">check-bold</VIcon
            ><span>{{ $t('packages_component_src_upgradefee_renwushukegen') }}</span>
          </div>
          <div class="currentList paid-upgrade-mb16 flex">
            <VIcon size="16" class="mr-2 color-primary">check-bold</VIcon
            ><span>{{ $t('packages_component_src_upgradefee_shujuchulixing') }}</span>
          </div>
          <div class="currentList paid-upgrade-mb16 flex">
            <VIcon size="16" class="mr-2 color-primary">check-bold</VIcon
            ><span>{{ $t('packages_component_src_upgradefee_gaojishouhouzhi') }}</span>
          </div>
        </div>
        <div
          class="footer bg-color-primary color-white flex justify-content-between align-items-center px-4 cursor-pointer"
          @click="goPaidUpgrade"
        >
          {{ $t('packages_component_src_upgradefee_dingyuezhuanyeban') }}<VIcon size="17">right</VIcon>
        </div>
      </li>
    </ul>
  </el-dialog>
</template>

<script>
import { VIcon } from '@tap/component'
export default {
  name: 'UpgradeFeeDialog',
  components: { VIcon },

  props: ['visible'],
  methods: {
    goPaidUpgrade() {
      this.$router.push({
        name: 'createAgent'
      })
      this.handleClose()
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
  }
  .paid-upgrade-right {
    border: 1px solid map-get($color, primary);
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
    max-width: 252px;
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
    max-width: 200px;
    color: map-get($color, light);
  }
  .discount {
    color: #ff7d00;
    background: rgba(255, 125, 0, 0.1);
    border-radius: 4px;
    padding: 2px 4px;
  }
  .bg {
    background: url('../../assets/images/subscription_img_zyb.png');
    background-repeat: no-repeat;
    background-position: right;
    background-position-y: top;
  }
  .paid-upgrade-height {
    height: 78px;
  }
  .paid-upgrade-cn-height {
    height: 114px;
  }
  .paid-upgrade-l-height {
    height: 120px;
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
  .paid-upgrade-mt32 {
    margin-top: 32px;
  }
  .paid-upgrade-mb45 {
    margin-bottom: 45px;
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
  .footer {
    height: 40px;
    background: #f5f7fa;
    border-bottom-right-radius: 8px;
    border-bottom-left-radius: 8px;
  }
}
::v-deep {
  .el-dialog__body {
    padding: 0 20px 30px 20px;
  }
}
</style>
