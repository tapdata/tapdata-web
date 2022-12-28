<template>
  <div class="data-server-wrap">
    <div class="header mb-2">中央化的数据服务，可复用易分发</div>
    <div class="data-server-desc">
      将企业核心数据实时集中到中央化数据平台的方式并通过API 或者反向同步方式，
      为下游的交互式应用、微服务或交互式分析提供新鲜实时的数据。
    </div>
    <div class="mt-2 mb-4"><img src="../../assets/image/data-server.png" alt="" /></div>
    <div>
      <div class="header mb-2 mt-4">中央化存储</div>
      <div class="data-server-desc">
        在经过数据采集+传输以及实时计算后，再将数据放入 Storage
        层进行中央化存储，实际上已经形成了一套逻辑模型，在这里用户无需关心数据存储在哪里，只需要关注真正需要的是哪些数据信息；
      </div>
      <div class="header mb-2 mt-4">数据实时服务</div>
      <div class="data-server-desc">
        在服务层，有两种主流的数据服务模式 Pull 和 Push。API
        支持低代码发布，可按照具体需求发布数据。当所需数据在业务系统中已有存储时，可通过 REVERSE
        ETL，反向把经过整理、治理的数据推送给用户；
      </div>
      <div class="header mb-2 mt-4">data services 特有功能点</div>
      <div class="mt-2 mb-4"><img src="../../assets/image/data-server-feature.png" alt="" /></div>
      <div class="header mb-2 mt-4">Data Services 能力目前仅在 Tapdata On-Prem 版中上线</div>
      <div class="mt-4">
        <el-button type="primary" @click="goDemo()">申请试用</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'list',
  methods: {
    goDemo() {
      window.open('https://tapdata.net/tapdata-on-prem/demo.html', '_blank')
    }
  }
}
</script>

<style scoped lang="scss">
.data-server-wrap {
  background: #fff;
  padding: 20px;
  .header {
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 22px;
  }
  .data-server-title {
    font-weight: 500;
    font-size: 16px;
    line-height: 22px;
    color: #1d2129;
  }
  .data-server-desc {
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    color: #535f72;
  }
}
</style>
