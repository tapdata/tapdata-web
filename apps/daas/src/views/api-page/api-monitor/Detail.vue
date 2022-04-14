<template>
  <section class="api-monitor-detail-wrap flex flex-direction">
    <div class="flex-direction flex-1 pt-5">
      <div class="flex flex-direction flex-1">
        <div class="flex-1">
          <div class="api-monitor-detail-wrap__text">API访问次数</div>
          <div class="api-monitor-detail-wrap__value">600</div>
        </div>
        <div class="flex-1">
          <div class="api-monitor-detail-wrap__text">API访问次数</div>
          <div class="api-monitor-detail-wrap__value">600</div>
        </div>
        <div class="flex-1">
          <div class="api-monitor-detail-wrap__text">API访问次数</div>
          <div class="api-monitor-detail-wrap__value">600</div>
        </div>
      </div>
      <div class="flex flex-direction flex-1 pb-5">
        <div class="flex-1">
          <div class="api-monitor-detail-wrap__text">API访问次数</div>
          <div class="api-monitor-detail-wrap__value">600</div>
        </div>
        <div class="flex-1">
          <div class="api-monitor-detail-wrap__text">API访问次数</div>
          <div class="api-monitor-detail-wrap__value">600</div>
        </div>
        <div class="flex-1">
          <div class="api-monitor-detail-wrap__text">API访问次数</div>
          <div class="api-monitor-detail-wrap__value">600</div>
        </div>
      </div>
    </div>
    <div class="flex-1 pt-3">
      <FilterBar v-model="searchParams" :items="filterItems" :hideRefresh="true" @fetch="getDetail()"> </FilterBar>
    </div>
    <div class="flex-1 pt-5">
      <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
      <div style="margin: 15px 0"></div>
      <el-checkbox-group v-model="clientName">
        <el-checkbox v-for="item in clientNameList" :key="item" :label="item"></el-checkbox>
      </el-checkbox-group>
    </div>
  </section>
</template>

<script>
import FilterBar from '@/components/filter-bar'
export default {
  name: 'Detail',
  components: { FilterBar },
  props: ['id'],
  data() {
    return {
      filterItems: [],
      searchParams: {
        guanluary: 5,
        type: 'visitTotalLine'
      },
      typesOptions: [
        { label: '访问行数', value: 'visitTotalLine' },
        { label: '耗时', value: 'timeConsuming' },
        { label: '传输速率', value: 'speed' },
        { label: '响应时间', value: 'latency' }
      ],
      timeList: [
        { label: '5分钟', value: 5 },
        { label: '10分钟', value: 10 },
        { label: '30分钟', value: 30 },
        { label: '60分钟', value: 60 }
      ],
      clientName: '',
      checkAll: false,
      isIndeterminate: true,
      clientNameList: ['cli1', 'cli2', 'cli3']
    }
  },
  created() {
    this.getFilterItems()
  },
  mounted() {
    this.getDetail()
  },
  watch: {
    '$route.query'() {
      this.getDetail()
    }
  },
  methods: {
    getDetail() {
      let filter = {
        where: {
          id: this.id,
          guanluary: 5,
          start: new Date().getTime(),
          type: 'visitTotalLine'
        }
      }
      this.$api('ApiMonitor')
        .apiDetail({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          let data = res.data
          this.apiList = data.items
          this.page.apiListTotal = data.total
        })
    },
    getFilterItems() {
      this.filterItems = [
        {
          label: this.$t('task_list_status'),
          key: 'type',
          type: 'select-inner',
          items: this.typesOptions,
          selectedWidth: '200px'
        },
        {
          label: this.$t('task_list_sync_type'),
          key: 'guanluary',
          type: 'select-inner',
          items: this.timeList
        }
      ]
    },
    handleCheckAllChange() {
      //全选
      this.isIndeterminate = false
    }
  }
}
</script>

<style scoped lang="scss">
.api-monitor-detail-wrap {
  .api-monitor-detail-wrap__text {
    font-size: 12px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.85);
    text-align: center;
  }
  .api-monitor-detail-wrap__value {
    font-size: 20px;
    color: #2c65ff;
    line-height: 38px;
    text-align: center;
  }
}
</style>
