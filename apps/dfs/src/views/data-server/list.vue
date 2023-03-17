<template>
  <div class="data-server-wrap">
    <section class="header-box flex justify-content-end">
      <div class="header-content-box">
        <header class="header mb-4">{{ $t('dfs_data_server_demo_title_edition') }}</header>
        <div class="data-server-desc mb-2">{{ $t('dfs_data_server_demo_title_desc') }}</div>
        <div class="data-server-desc mb-4">{{ $t('dfs_data_server_On_Prem') }}</div>
        <el-button class="data-server-btn" type="primary" @click="goDemo()">{{
          $t('dfs_data_server_apply_for_trial')
        }}</el-button>
      </div>
      <div class="text-center data-server-header-gif">
        <img src="../../assets/image/data-server-header.gif" alt="" />
      </div>
    </section>
    <section>
      <div class="title text-center mt-8mul mb-4">{{ $t('dfs_data_server_demo_title') }}</div>
      <div class="data-server-desc text-center">
        {{ $t('dfs_data_server_demo_desc') }}
      </div>
      <div class="mt-7mul mb-4 text-center"><img src="../../assets/image/data-server.svg" alt="" /></div>
    </section>
    <section class="central-storage">
      <section class="content-item-storage">
        <div class="title mb-4 mt-8mul">{{ $t('dfs_data_server_storage') }}</div>
        <div class="data-server-desc">
          {{ $t('dfs_data_server_collection') }}
        </div>
      </section>
      <section class="flex justify-content-center align-items-center">
        <div class="mt-7mul mb-4 text-center"><img src="../../assets/image/data-server-feature.svg" alt="" /></div>
        <div class="content-item-real-time">
          <div class="title mb-4 mt-8mul">{{ $t('dfs_data_server_real_time') }}</div>
          <div class="data-server-desc">
            {{ $t('dfs_data_server_data_service_mode') }}
          </div>
        </div>
      </section>
    </section>
    <section class="feature flex justify-content-center align-items-center">
      <div class="title mr-8mul">{{ $t('dfs_data_server_feature') }}</div>
      <div class="ml-4"><img src="../../assets/image/data-server-api-time.svg" alt="" /></div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'list',
  inject: ['buried'],
  methods: {
    goDemo() {
      this.buried('dataServerTrial')
      window.open('https://tapdata.net/tapdata-on-prem/demo.html', '_blank')
    }
  }
}
</script>

<style scoped lang="scss">
.data-server-wrap {
  background: #ebeef3;
  .header-box {
    background-color: #f4f6fa;
    height: 530px;
  }
  .header-content-box {
    padding-top: 224px;
    width: 525px;
  }
  .header {
    font-style: normal;
    font-weight: 700;
    font-size: 40px;
    line-height: 40px;
  }
  .data-server-header-gif {
    width: 620px;
    height: 518px;
    img {
      width: 100%;
      height: 100%;
    }
  }
  .title {
    font-style: normal;
    font-weight: 500;
    font-size: 28px;
    line-height: 28px;
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
  .central-storage {
    background-image: url('../../assets/image/data-server-bg.svg');
    background-repeat: no-repeat;
    background-size: 100%;
    background-color: #fff;
    height: 870px;
  }
  .feature {
    background: #fff;
    height: 700px;
  }
  .mt-7mul {
    margin-top: 56px;
  }
  .mt-8mul {
    margin-top: 64px;
  }
  .mr-8mul {
    margin-right: 64px;
  }
  .content-item-storage {
    width: 580px;
    padding-top: 200px;
    padding-left: 200px;
  }
  .content-item-real-time {
    width: 580px;
    padding-left: 85px;
  }
  .data-server-btn {
    font-weight: 500;
    font-size: 18px;
  }
}
</style>
