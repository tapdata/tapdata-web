<!-- 电科控制台自定义展示 -->
<template>
  <div class="dk-dashboard">
    <div class="panel">
      <div class="panel-title">
        <img :src="require('@/assets/icons/dashboard1.png')" alt="" />
        <span>{{ $t('dkDashboard.dataCount') }}</span>
      </div>
      <div class="panel-content">
        <section class="count" v-loading="countLoading">
          <Annulus
            :number="countInfo.total_records || 0"
            color="#3ae698"
            :text="$t('dkDashboard.annulusTitle1')"
          />
          <Annulus
            :number="countInfo.total_data_size"
            :isCapacity="true"
            color="#686be8"
            :text="$t('dkDashboard.annulusTitle2')"
          />
          <Annulus
            :number="countInfo.total_types || 0"
            color="#2db3ff"
            :text="$t('dkDashboard.annulusTitle3')"
          />
          <Annulus
            :number="countInfo.published_types || 0"
            color="#fcbc5e"
            :text="$t('dkDashboard.annulusTitle4')"
          />
        </section>
        <el-divider />
        <PublishChart />
      </div>
    </div>

    <div class="panel">
      <div class="panel-title">
        <img :src="require('@/assets/icons/dashboard2.png')" alt="" />
        <span>{{ $t('dkDashboard.trendCount') }}</span>
      </div>
      <DataTrend />
    </div>

    <div class="panel">
      <div class="panel-title">
        <img :src="require('@/assets/icons/dashboard3.png')" alt="" />
        <span>{{ $t('dkDashboard.typeCount') }}</span>
      </div>
      <DataTypes />
    </div>
  </div>
</template>

<script>
import Annulus from '@/components/Annulus.vue'
import PublishChart from './components/PublishChart.vue'
import DataTrend from './components/DataTrend.vue'
import DataTypes from './components/DataTypes.vue'

export default {
  components: {
    Annulus,
    PublishChart,
    DataTrend,
    DataTypes
  },
  data() {
    return {
      countLoading: false, // 概览数据loading
      countInfo: {} // 概览数据
    }
  },
  methods: {
    // 获取概览数据
    getCount() {
      this.countLoading = true
      this.$api('insights')
        .findOne({
          'filter[where][stats_time]': this.$moment().format('YYYYMMDD000000'),
          'filter[where][stats_name]': 'total_publish_stats',
          'filter[where][stats_granularity]': 'daily'
        })
        .then(({ data }) => {
          if (data && data.data) {
            this.countInfo = data.data
          }
        })
        .finally(() => {
          this.countLoading = false
        })
    }
  },
  created() {
    this.getCount()
  }
}
</script>

<style lang="scss">
.dk-dashboard {
  .el-table.el-table--border {
    th.is-leaf {
      border-bottom: 1px solid #ebeef5;
    }
    td {
      border-bottom: 1px solid #ebeef5;
    }
  }
  .el-pagination.is-background {
    padding: 20px 10px 10px;
    text-align: right;
    .el-pagination__total,
    .el-pagination__sizes {
      float: left;
    }
  }
}
</style>

<style lang="scss" scoped>
.dk-dashboard {
  padding: 0 16px 16px;
  .panel {
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 12%);
    border-radius: 3px;
    .panel-title {
      border-radius: 3px 3px 0 0;
      height: 42px;
      font-size: 15px;
      padding-left: 16px;
      color: #fff;
      display: flex;
      align-items: center;
      background-color: #36a2eb;
      margin-top: 14px;
      > img {
        margin-right: 6px;
      }
    }
    .panel-content {
      .count {
        display: flex;
        padding: 30px 0;
        justify-content: space-around;
      }
    }
  }
}
</style>
