<template>
  <div>
    <div class="purcahse-header">
      <span
        >{{ $t('purchase_Header_shuJuKuFuZhi') }}<span>{{ operationMap[action] }}</span>
      </span>
      <ul class="links">
        <li>
          <ElLink class="slight" style="font-size: 12px" @click="toHistory()">{{
            $t('purchase_Header_gouMaiLiShi')
          }}</ElLink>
        </li>
        <li>
          <ElLink class="slight" style="font-size: 12px" @click="toProduct()">{{
            $t('purchase_Header_zhaKanChanPinXiang')
          }}</ElLink>
        </li>
        <li>
          <ElLink class="slight" style="font-size: 12px" @click="toHelp()">{{
            $t('purchase_Header_bangZhuWenDang')
          }}</ElLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import i18n from '@/i18n'

export default {
  props: {
    action: String
  },
  data() {
    return {
      operationMap: {
        Purchase: i18n.t('purchase_Header_shiLiDingGou'),
        Renew: i18n.t('purchase_Header_xuDing'),
        Modify: i18n.t('purchase_Header_guiGeBianGeng')
      }
    }
  },
  methods: {
    toHistory() {
      location.href = process.env.BASE_URL + '/usercenter/orders/list'
    },
    toHelp() {
      location.href = process.env.BASE_URL + '/op-help-center/'
    },
    toProduct() {
      //TODO 跳转产品详情
    }
  }
}
</script>

<style lang="scss" scoped>
.purcahse-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  font-size: 16px;
  .links {
    display: flex;
    color: map-get($fontColor, slight);
    li {
      padding: 0 7px;
      line-height: 18px;
      border-right: 2px solid #f2f2f2;
      &:last-child {
        border: none;
      }
    }
  }
  .order-header-container {
    .iconfont {
      display: unset;
      line-height: unset;
    }
  }
}
</style>
