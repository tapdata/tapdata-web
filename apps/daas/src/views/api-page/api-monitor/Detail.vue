<template>
  <section class="flex flex-direction">
    <div class="flex-direction flex-1">
      <div class="flex flex-direction flex-1">
        <div class="flex-1">
          <div>API访问次数</div>
          <div>600</div>
        </div>
        <div class="flex-1">
          <div>API访问次数</div>
          <div>600</div>
        </div>
        <div class="flex-1">
          <div>API访问次数</div>
          <div>600</div>
        </div>
      </div>
      <div class="flex flex-direction flex-1">
        <div class="flex-1">
          <div>API访问次数</div>
          <div>600</div>
        </div>
        <div class="flex-1">
          <div>API访问次数</div>
          <div>600</div>
        </div>
        <div class="flex-1">
          <div>API访问次数</div>
          <div>600</div>
        </div>
      </div>
    </div>
    <div class="flex-1">
      <FilterBar v-model="searchParams" :items="filterItems" @fetch="getDetail()"> </FilterBar>
    </div>
    <div class="flex-1">
      <ul>
        <li>客戶端</li>
        <li>客戶端</li>
        <li>客戶端</li>
        <li>客戶端</li>
      </ul>
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
        time: '',
        type: ''
      },
      statusOptions: [
        { label: this.$t('task_list_status_all'), value: '' },
        { label: '已发布', value: 'active' },
        { label: '待发布', value: 'pending' }
      ]
    }
  },
  created() {
    this.getFilterItems()
    let { status } = this.$route.query
    this.searchParams.status = status ?? ''
  },
  mounted() {
    this.getDetail()
  },
  watch: {
    '$route.query'() {
      this.getDetail()
    }
  },
  getDetail() {
    let filter = {
      where: {
        id: this.id,
        guanluary: 5,
        start: 1649687341337,
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
        key: 'status',
        type: 'select-inner',
        items: this.statusOptions,
        selectedWidth: '200px'
      },
      {
        label: this.$t('task_list_sync_type'),
        key: 'clientName',
        type: 'select-inner',
        items: this.clientNameList
      },
      {
        placeholder: this.$t('task_list_search_placeholder'),
        key: 'keyword',
        type: 'input'
      }
    ]
  }
}
</script>

<style scoped></style>
