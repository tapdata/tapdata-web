<template>
  <div class="data-server-wrap">
    <div class="header mb-2">{{ $t('dfs_data_server_demo_title') }}</div>
    <div class="data-server-desc">
      {{ $t('dfs_data_server_demo_desc') }}
    </div>
    <div class="mt-2 mb-4"><img src="../../assets/image/data-server.png" alt="" /></div>
    <div>
      <div class="header mb-2 mt-4">{{ $t('dfs_data_server_storage') }}</div>
      <div class="data-server-desc">
        {{ $t('dfs_data_server_collection') }}
      </div>
      <div class="header mb-2 mt-4">{{ $t('dfs_data_server_real_time') }}</div>
      <div class="data-server-desc">
        {{ $t('dfs_data_server_data_service_mode') }}
      </div>
      <div class="header mb-2 mt-4">{{ $t('dfs_data_server_feature') }}</div>
      <div class="mt-2 mb-4"><img src="../../assets/image/data-server-feature.png" alt="" /></div>
      <div class="header mb-2 mt-4">{{ $t('dfs_data_server_On_Prem') }}</div>
      <div class="mt-4">
        <el-button type="primary" @click="goDemo()">{{ $t('dfs_data_server_apply_for_trial') }}</el-button>
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
