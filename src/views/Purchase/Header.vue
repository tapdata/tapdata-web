<template>
  <div>
    <orderHeader v-if="isShowDrsHeader" :env="env" />
    <div class="purcahse-header">
      <span>
        数据库复制DRS&nbsp;
        <span>{{ operationMap[action] }}</span>
      </span>
      <ul class="links">
        <li>
          <ElLink class="slight" style="font-size: 12px" @click="toHistory()"
            >购买历史</ElLink
          >
        </li>
        <li>
          <ElLink class="slight" style="font-size: 12px" @click="toProduct()"
            >查看产品详情</ElLink
          >
        </li>
        <li>
          <ElLink class="slight" style="font-size: 12px" @click="toHelp()"
            >帮助文档</ElLink
          >
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    action: String
  },
  data() {
    return {
      isShowDrsHeader: false,
      env: process.env.VUE_APP_ENV,

      operationMap: {
        Purchase: '实例订购',
        Renew: '续订',
        Modify: '规格变更'
      }
    }
  },
  methods: {
    toHistory() {
      location.href = process.env.VUE_APP_BASE_URL + '/usercenter/orders/list'
    },
    toHelp() {
      location.href = process.env.VUE_APP_BASE_URL + '/op-help-center/'
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
