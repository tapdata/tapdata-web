<template>
  <el-dialog
    :title="$t('dfs_subscribe_to_professional_plan')"
    :visible.sync="visible"
    :append-to-body="true"
    width="880px"
    custom-class="paid-upgrade-dialog"
    :before-close="handleClose"
  >
    <div v-if="tooltip" class="py-2 px-4 bg-warning-light flex align-items-center">
      <VIcon size="20" class="color-warning">info</VIcon>
      <span class="ml-2 color-warning">{{ tooltip }}</span>
    </div>
    <ul class="flex paid-upgrade-ul mt-6 mx-4">
      <li class="paid-upgrade-left flex flex-column disabled">
        <div class="px-4 py-4 flex-1">
          <div class="version mb-2">{{ $t('packages_component_src_upgradefee_jichuban') }}</div>
          <div class="desc mt-6">{{ $t('packages_component_src_upgradefee_tigongmianfeishi') }}</div>
          <div class="paid-upgrade-l-height flex align-items-center">
            <span class="free">{{ $t('packages_component_src_upgradefee_mianfei') }}</span>
          </div>
          <ElDivider></ElDivider>
          <div class="currentList paid-upgrade-mb16 flex">
            <VIcon size="16" class="mr-2 color-primary">check</VIcon
            ><span>{{ $t('packages_component_src_basic_component') }}</span>
          </div>
          <div class="currentList paid-upgrade-mb16 mt-2 flex">
            <VIcon size="16" class="mr-2 color-primary">check</VIcon
            >{{ $t('packages_component_src_upgradefee_zuidarenwushu') }}
            <span class="color-primary">&nbsp{{ $t('packages_component_src_upgradefee_ge') }}</span>
          </div>
          <div class="currentList paid-upgrade-mb16 flex">
            <VIcon size="16" class="mr-2 color-primary">check</VIcon
            ><span>{{ $t('packages_component_src_upgradefee_biaozhunshouhouzhi') }}</span>
          </div>
        </div>
        <div class="footer flex justify-content-between align-items-center px-4">
          {{ $t('packages_component_src_upgradefee_dangqianbanben') }}
        </div>
      </li>
      <li
        class="paid-upgrade-right copilot-pricing-card-container ml-6 flex flex-column bg cursor-pointer position-relative"
        @click="goPaidUpgrade"
      >
        <img
          alt=""
          width="50"
          height="56"
          class="copilot-pricing-card-bg-glow width-full height-full left-0 top-0 position-absolute d-block"
          loading="lazy"
          decoding="async"
          aria-hidden="true"
          style="z-index：0"
          :src="require('@tap/assets/images/pricing-card-glow.png')"
        />
        <div class="copilot-pricing-card-glow-border1">
          <div class="px-4 pb-4 flex-1 bg-white paid-upgrade-right-border">
            <div class="flex bg mr-n4 rounded-4">
              <div class="pt-4">
                <div class="version mb-2">
                  {{ $t('packages_component_src_upgradefee_zhuanyeban') }}
                  <span class="discount inline-block fs-8 fw-normal">{{
                    $t('packages_component_src_upgradefee_xianshiyouhui')
                  }}</span>
                </div>
                <div class="desc_professional mt-6">{{ $t('packages_component_src_upgradefee_tigongzhuanyehua') }}</div>
                <div
                  class="paid-upgrade-height flex align-items-center"
                  :class="[{ 'paid-upgrade-cn-height': this.$i18n.locale === 'zh-CN' }]"
                >
                  <span class="pay">{{ $t('packages_component_src_upgradefee_taocanfufei') }}</span>
                </div>
                <ElDivider></ElDivider>
              </div>
            </div>
            <div class="currentList paid-upgrade-mb16 mt-2 flex">
              <VIcon size="16" class="mr-2 color-primary mt-0 flex left-bold">right</VIcon
              ><span>{{ $t('packages_component_src_upgradefee_desc_1') }}</span>
            </div>
            <div class="currentList paid-upgrade-mb16 mt-2 flex">
              <VIcon size="16" class="mr-2 color-primary">check</VIcon
              ><span>{{ $t('packages_component_src_upgradefee_renwushukegen') }}</span>
            </div>
            <div class="currentList paid-upgrade-mb16 flex">
              <VIcon size="16" class="mr-2 color-primary">check</VIcon
              ><span>{{ $t('packages_component_src_upgradefee_shujuchulixing') }}</span>
            </div>
            <div class="currentList paid-upgrade-mb16 flex">
              <VIcon size="16" class="mr-2 color-primary">check</VIcon
              ><span>{{ $t('packages_component_src_upgradefee_gaojishouhouzhi') }}</span>
            </div>
          </div>
          <div
            class="footer-right flex justify-content-between align-items-center px-4 cursor-pointer"
            @click="goPaidUpgrade"
          >
            {{ $t('dfs_subscribe_to_professional_plan') }}<VIcon size="20">right</VIcon>
          </div>
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

  props: ['visible', 'tooltip', 'goPage'],
  methods: {
    goPaidUpgrade() {
      if (this.goPage) {
        this.handleClose()
        this.goPage()
        return
      }
      this.$router.push({
        name: 'createAgent'
      })
      this.handleClose()
    },
    handleClose() {
      this.$emit('update:visible', false)
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
    width: 420px;
    border-radius: 8px;
  }
  .paid-upgrade-left {
    border: 1px solid map-get($borderColor, sslight);
    &.disabled {
      cursor: not-allowed;
    }
  }
  .paid-upgrade-right {
    &:hover {
      //box-shadow: 0 1px 4px rgba(0, 0, 0, 0.09);
    }
  }
  .paid-upgrade-right-border {
    border-top-right-radius: 8px;
    border-top-left-radius: 8px;
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
    //line-height: 21px;
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
    color: gray;
  }
  .pay {
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    color: #ff7d00;
  }
  .desc {
    font-weight: 400;
    font-size: 14px;
    line-height: 17px;
    max-width: 300px;
    color: map-get($color, light);
  }
  .desc_professional {
    font-weight: 400;
    font-size: 16px;
    line-height: 17px;
    max-width: 300px;
    color: #5684ff;
  }

  .discount {
    color: #ff7d00;
    background: rgba(255, 125, 0, 0.1);
    border-radius: 4px;
    padding: 1px 5px;
    margin-left: 10px;
    //position: fixed;
  }
  .bg {
    background: url('../../../assets/images/subscription_img_zyb.png');
    background-repeat: no-repeat;
    background-position: right;
    background-position-y: top;
  }
  .paid-upgrade-height {
    height: 38px;
    margin-top: 30px;
  }
  .paid-upgrade-cn-height {
    height: 38px;
    margin-top: 30px;
  }
  .paid-upgrade-l-height {
    height: 38px;
    margin-top: 30px;
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
  .left-bold {
    -moz-transform: rotate(-180deg);
    -webkit-transform: rotate(-180deg);
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
  .footer-right {
    height: 40px;
    background: map-get($color, primary);
    color: map-get($color, white);
    border-bottom-right-radius: 8px;
    border-bottom-left-radius: 8px;
    &:hover {
      background: #5684ff;
      border-color: #5684ff;
      color: #ffffff;
    }
  }
}
.copilot-pricing-card-container:hover .copilot-pricing-card-bg-glow {
  opacity: 1;
  transform: scale(1.28);
  transition-duration: 0.3s;
}

.copilot-pricing-card-container .copilot-pricing-card-bg-glow {
  opacity: 1;
  transform: scale(1);
  transition-duration: 0.5s;
}

.copilot-pricing-card-bg-glow {
  opacity: 0.4;
  transform: scale(1.2);
}
.d-block {
  display: block !important;
}
.height-full {
  height: 100% !important;
}
.width-full {
  width: 100% !important;
}
.left-0 {
  left: 0 !important;
}
.top-0 {
  top: 0 !important;
}
.position-absolute {
  position: absolute !important;
}
.copilot-pricing-card-glow-border1 {
  padding: 1.5px;
  z-index: 2;
  border-radius: 8px;
  background: -webkit-linear-gradient(135deg, #a3e4d7, #a77bf3);
  background: linear-gradient(135deg, #a3e4d7, #a77bf3);
}
::v-deep {
  .el-dialog__body {
    padding: 0 20px 30px 20px;
  }
}
</style>
