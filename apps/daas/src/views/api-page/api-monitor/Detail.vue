<template>
  <section class="api-monitor-detail-wrap flex flex-direction" v-loading="loadingDetail">
    <div class="flex-direction flex-1 pt-5">
      <div class="flex flex-direction flex-1">
        <div class="flex-1">
          <div class="api-monitor-detail-wrap__text">API访问次数</div>
          <div class="api-monitor-detail-wrap__value">{{ detail.visitTotalCount || 0 }}</div>
        </div>
        <div class="flex-1">
          <div class="api-monitor-detail-wrap__text">API传输量</div>
          <div class="api-monitor-detail-wrap__value">{{ detail.visitQuantity || 0 }}</div>
        </div>
        <div class="flex-1">
          <div class="api-monitor-detail-wrap__text">API访问耗时</div>
          <div class="api-monitor-detail-wrap__value">{{ detail.timeConsuming || 0 }}</div>
        </div>
      </div>
      <div class="flex flex-direction flex-1 pb-5">
        <div class="flex-1">
          <div class="api-monitor-detail-wrap__text">API访问行数</div>
          <div class="api-monitor-detail-wrap__value">{{ detail.visitTotalLine || 0 }}</div>
        </div>
        <div class="flex-1">
          <div class="api-monitor-detail-wrap__text">API传输速率</div>
          <div class="api-monitor-detail-wrap__value">{{ detail.speed || 0 }}</div>
        </div>
        <div class="flex-1">
          <div class="api-monitor-detail-wrap__text">API响应时间</div>
          <div class="api-monitor-detail-wrap__value">{{ detail.responseTime || 0 }}</div>
        </div>
      </div>
    </div>
    <div class="flex-1 pt-3">
      <FilterBar v-model="searchParams" :items="filterItems" :hideRefresh="true" @fetch="getDetail()"> </FilterBar>
    </div>
    <div class="flex-1 pt-5">
      <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
      <div style="margin: 15px 0"></div>
      <el-checkbox-group v-model="clientName" @change="handleCheckedCitiesChange">
        <el-checkbox v-for="item in clientNameList" :key="item.id" :label="item.id">{{ item.name }}</el-checkbox>
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
      detail: '',
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
      allElection: [],
      clientName: [],
      checkAll: false,
      isIndeterminate: true,
      loadingDetail: false,
      clientNameList: [
        {
          name: 'Data Explorer',
          id: '5c0e750b7a5cd42464a5099d'
        }
      ]
    }
  },
  created() {
    this.getFilterItems()
  },
  mounted() {
    this.getDetail()
    this.allElectionFun()
  },
  watch: {
    '$route.query'() {
      this.getDetail()
    }
  },
  methods: {
    getDetail() {
      let data = {
        id: this.id,
        guanluary: this.searchParams.guanluary || 5,
        clientId: [],
        start: new Date().getTime(),
        type: this.searchParams.type || 'visitTotalLine'
      }
      this.loadingDetail = true
      this.$api('ApiMonitor')
        .apiDetail(data)
        .then(res => {
          this.detail = res.data
          //全选值
          this.allElectionFun()
        })
        .finally(() => {
          this.loadingDetail = false
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
    handleCheckAllChange(val) {
      this.clientName = val ? this.allElection : []
      this.isIndeterminate = false
    },
    //选择所有
    allElectionFun() {
      for (var i = 0; i < this.clientNameList.length; i++) {
        this.allElection.push(this.clientNameList[i].id)
      }
    },
    handleCheckedCitiesChange(value) {
      let checkedCount = value.length
      this.checkAll = checkedCount === this.clientNameList.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.clientNameList.length
      //刷新数据
      this.getDetail()
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
