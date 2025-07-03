<script>
import { VTable } from '@tap/component/src/base/v-table'

import i18n from '@/i18n'

export default {
  components: { VTable },
  data() {
    return {
      loading: true,
      list: [
        {
          id: 11,
          type: '',
          name: 'Tapdata Cloud 3.2.2 Release Notes',
          link: 'https://mp.weixin.qq.com/s/4hqjUoaa3WS5ejjEvKfwoA',
          time: '2023-05-4 21:00',
        },
        {
          id: 10,
          type: '',
          name: 'Tapdata Cloud 3.2.1 Release Notes',
          link: 'https://mp.weixin.qq.com/s/sHROGfP0tG_ftHPRCT1UIA',
          time: '2023-04-20 21:00',
        },
        {
          id: 9,
          type: '',
          name: 'Tapdata Cloud 3.1.9 Release Notes',
          link: 'https://mp.weixin.qq.com/s/eBHKEZBVkuQ0ah8Kv0wRKQ',
          time: '2023-03-20 21:00',
        },
        {
          id: 8,
          type: '',
          name: 'Tapdata Cloud 3.1.8 Release Notes',
          link: 'https://mp.weixin.qq.com/s/WQZx38g93lYuPpsWjbETZg',
          time: '2023-03-2 21:00',
        },
        {
          id: 7,
          type: '',
          name: this.$t('workbench_Notice_tAPDA12'),
          time: '2023-03-2 21:00',
        },
        {
          id: 6,
          type: '',
          name: 'Tapdata Cloud 3.1.7 Release Notes',
          link: 'https://mp.weixin.qq.com/s/npognQxT4O4xzc4u1bb4mg',
          time: '2023-02-21 21:00',
        },
        {
          id: 5,
          type: '',
          name: 'Tapdata Cloud 3.1.6 Release Notes',
          link: 'https://mp.weixin.qq.com/s/rG_ag8LY-WSte4VnIgThXA',
          time: '2023-02-3 21:00',
        },
        {
          id: 4,
          type: '',
          name: 'Tapdata Cloud 3.1.5 Release Notes',
          link: 'https://mp.weixin.qq.com/s/JYPt9aExnCL9tyOENe7QOA',
          time: '2023-01-20 21:00',
        },
        {
          id: 3,
          type: '',
          name: 'Tapdata Cloud 3.1.4 Release Notes',
          link: 'https://mp.weixin.qq.com/s/dUuqGQZGEI10cOLpbzqbHA',
          time: '2023-01-3 21:00',
        },
        {
          id: 2,
          type: '',
          name: 'Tapdata Cloud 3.1.3 Release Notes',
          link: 'https://mp.weixin.qq.com/s/mwMNTGsglm9rQi-k9zqRgg',
          time: '2022-12-15 21:00',
        },
        {
          id: 1,
          type: '',
          name: i18n.t('dfs_workbench_workbench_zhongyaobanbensheng'),
          time: '2022-12-03 18:00',
        },
      ], // 展示的数据
      columns: [
        {
          label: i18n.t('packages_business_notice_list_gonggaobiaoti'),
          prop: 'name',
          slotName: 'noticeName',
        },
        {
          label: i18n.t('packages_business_task_monitor_time'),
          prop: 'time',
          dataType: 'time',
          with: '100px',
        },
      ],
    }
  },
  methods: {
    toNotice(item) {
      if (item?.id === 1) {
        //当前页弹窗
        this.showUpgrade = true
      } else if (item?.link) {
        window.open(item.link)
      } else {
        this.$router.push({
          name: 'WorkbenchNotice',
          query: {
            id: item?.id,
          },
        })
      }
    },
  },
}
</script>

<template>
  <section
    v-if="$route.name === 'noticeList'"
    class="operation-logs-wrapper g-panel-container"
  >
    <div class="main">
      <VTable
        ref="table"
        row-key="id"
        :columns="columns"
        :data="list"
        height="100%"
        :has-pagination="false"
      >
        <template #noticeName="{ row }">
          <span class="cursor-pointer color-primary" @click="toNotice(row)">{{
            row.name
          }}</span>
        </template>
      </VTable>
    </div>
  </section>
  <RouterView v-else />
</template>
