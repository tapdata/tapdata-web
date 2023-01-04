<template>
  <div class="data-server-wrap">
    <div class="header-box">
      <header class="header mb-2">{{ $t('dfs_data_server_demo_title_edition') }}</header>
      <div class="data-server-desc mb-2">{{ $t('dfs_data_server_demo_title_desc') }}</div>
      <div class="data-server-desc mb-4">{{ $t('dfs_data_server_On_Prem') }}</div>
      <el-button type="primary" @click="goDemo()">{{ $t('dfs_data_server_apply_for_trial') }}</el-button>
    </div>
    <div class="title mt-8 mb-2">{{ $t('dfs_data_server_demo_title') }}</div>
    <div class="data-server-desc">
      {{ $t('dfs_data_server_demo_desc') }}
    </div>
    <div class="mt-2 mb-4"><img src="../../assets/image/data-server.svg" alt="" /></div>
    <div>
      <div class="title mb-4 mt-8">{{ $t('dfs_data_server_storage') }}</div>
      <div class="data-server-desc">
        {{ $t('dfs_data_server_collection') }}
      </div>
      <div class="title mb-4 mt-8">{{ $t('dfs_data_server_real_time') }}</div>
      <div class="data-server-desc">
        {{ $t('dfs_data_server_data_service_mode') }}
      </div>
      <div class="mt-2 mb-4"><img src="../../assets/image/data-server-api-time.svg" alt="" /></div>
      <div class="title mb-4 mt-8">{{ $t('dfs_data_server_feature') }}</div>
      <div class="mt-2 mb-4"><img src="../../assets/image/data-server-feature.svg" alt="" /></div>
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
  .header-box {
    background-image: url('../../assets/image/data-server-header.png');
    background-repeat: no-repeat;
    padding: 20px;
  }
  .header {
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 22px;
  }
  .title {
    font-style: normal;
    font-weight: 500;
    font-size: 24px;
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
