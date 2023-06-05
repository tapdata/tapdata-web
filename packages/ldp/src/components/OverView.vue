<template>
  <!--	概览	-->
  <div class="workbench-overview workbench-section" v-show="visible">
    <div class="section-header flex justify-content-between border-bottom">
      <div class="px-4 pt-2">
        <div class="main-title font-color-dark fw-light fs-6 mb-2">{{ $t('workbench_overview') }}</div>
        <ul class="flex justify-content-around mb-2">
          <li
            v-for="(item, index) in agentList"
            :key="index"
            class="agent-list__item flex justify-content-between"
            :ref="item.key"
          >
            <div>
              <VIcon size="14" class="icon">{{ item.icon }}</VIcon>
              <span class="ml-1 fs-7 item_name">{{ item.name }}</span>
              <div class="fs-4 font-color-dark fw-bold item_number">{{ item.value }}</div>
            </div>
            <div
              class="flex justify-content-between align-items-center px-1 item_circle"
              style="height: 54px"
              v-if="item.list.length > 0"
            >
              <div style="height: 80px; width: 80px">
                <Chart ref="lineChart" type="pie" :extend="getPieOption(index)"></Chart>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div class="w-50 border-start pt-2">
        <div class="flex justify-content-between">
          <div class="aside-title px-4 mb-2 font-color-dark fw-light fs-6">{{ $t('workbench_notice') }}</div>
          <div class="cursor-pointer px-4 font-color-title" @click="goNoticeList">{{ $t('more_workbench_notice') }}</div>
        </div>
        <br/>
        <div class="aside-main notice-list flex-grow-1 px-4">
          <ul class="notice-list__list h-100 overflow-y-auto">
            <li
              v-for="(item, index) in notices.slice(0, 3)"
              :key="index"
              class="notice-list__item flex align-items-center mb-2 px-1 pointer"
            >
              <div v-if="item.type" class="notice-list__type mr-4 p-1">
                {{ item.type }}
              </div>
              <ElLink v-else class="notice-list__name flex-grow-1 ellipsis block pointer" @click="toNotice(item)">
                {{ item.name }}
              </ElLink>
              <div class="notice-list__time font-color-slight">
                {{ fromNow(item.time) }}
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Chart, VIcon } from '@tap/component'
import { fromNow } from '@tap/shared'
export default {
  name: 'OverView',
  components: { VIcon, Chart },
  props: ['visible'],
  data() {
    return {
      agentList: [
        {
          name: 'Agent',
          key: 'agent',
          icon: 'agent',
          value: 0,
          list: [
            {
              label: this.$t('public_status_running'),
              value: 0,
              class: 'success'
            },
            {
              label: this.$t('public_agent_status_offline'),
              value: 0,
              class: 'error'
            }
          ]
        },
        {
          name: this.$t('workbench_overview_connection'),
          key: 'connection',
          icon: 'connection',
          value: 0,
          list: [
            {
              label: this.$t('workbench_overview_connection_ready'),
              value: 0
            },
            {
              label: this.$t('workbench_overview_connection_invalid'),
              value: 0
            }
          ]
        },
        {
          name: this.$t('workbench_overview_task'),
          key: 'task',
          icon: 'task',
          value: 0,
          list: [
            {
              label: this.$t('public_task_type_initial_sync'),
              value: 0
            },
            {
              label: this.$t('public_task_type_cdc'),
              value: 0
            },
            {
              label: this.$t('public_task_type_initial_sync_and_cdc'),
              value: 0
            }
          ]
        }
      ], // 介绍列表
      notices: [] // 公告列表
    }
  },
  created() {
    this.loadAgent() // agent
    this.loadNotices()
  },
  methods: {
    fromNow(date) {
      return fromNow(date)
    },
    loadAgent() {
      let agentList = this.agentList
      const loading = this.$loading({
        target: this.$refs.agent?.[0]
      })
      this.$axios
        .get('api/tcm/agent/agentCount')
        .then(data => {
          agentList[0].value = data.agentTotalCount || 0
          agentList[0].list[0].value = data.agentRunningCount || 0
          agentList[0].list[1].value = agentList[0].value - agentList[0].list[0].value
        })
        .finally(() => {
          loading.close()
        })
    },
    loadNotices() {
      this.notices = [
        {
          id: 11,
          type: '',
          name: 'Tapdata Cloud 3.2.2 Release Notes',
          link: 'https://mp.weixin.qq.com/s/4hqjUoaa3WS5ejjEvKfwoA',
          time: '2023-05-4 21:00'
        },
        {
          id: 10,
          type: '',
          name: 'Tapdata Cloud 3.2.1 Release Notes',
          link: 'https://mp.weixin.qq.com/s/sHROGfP0tG_ftHPRCT1UIA',
          time: '2023-04-20 21:00'
        },
        {
          id: 9,
          type: '',
          name: 'Tapdata Cloud 3.1.9 Release Notes',
          link: 'https://mp.weixin.qq.com/s/eBHKEZBVkuQ0ah8Kv0wRKQ',
          time: '2023-03-20 21:00'
        }
      ]
    },
    //图表数据组装
    getPieOption(index) {
      let data = [
        {
          itemStyle: {
            color: '#00b42a'
          },
          value: this.agentList[index].list[0].value,
          name: this.agentList[index].list[0].label
        },
        {
          itemStyle: {
            color: '#ff7d00'
          },
          value: this.agentList[index].list[1].value,
          name: this.agentList[index].list[1].label
        }
      ]
      if (index === 2) {
        let node = {
          itemStyle: {
            color: '#2C65FF'
          },
          value: this.agentList[index].list[2].value,
          name: this.agentList[index].list[2].label
        }
        data.push(node)
      }
      return {
        tooltip: {
          trigger: 'item'
        },
        series: [
          {
            type: 'pie',
            labelLine: {
              show: false
            },
            label: {
              show: false,
              position: 'center'
            },
            avoidLabelOverlap: false,
            data: data,
            radius: ['50%', '70%']
          }
        ]
      }
    },

    //公告列表
    goNoticeList() {
      this.$router.push('notice')
    }
  }
}
</script>

<style scoped lang="scss">
.agent-list__list {
  background: map-get($color, white);
}
.agent-list__item {
  width: 220px;
  border: 1px solid #e1e3e9;
  border-radius: 8px;
  margin-right: 24px;
  padding: 12px 12px 8px 12px;
  color: map-get($fontColor, dark);
}
.agent-list__item:last-child {
  margin-right: 0;
}
.agent-list__name {
  .vicon {
    color: map-get($fontColor, dark);
  }
}
.font-color-title {
  color: #2c65ff;
}
.agent-list__detail {
  width: 232px;
  background-color: #fafafb;
  color: map-get($fontColor, light);
  .agent-list__status {
    white-space: nowrap;
    margin-right: 8px;
    &:last-child {
      margin-right: 0;
    }
  }
  .success {
    color: #599f3f;
  }
  .error {
    color: #f7a237;
  }
}
// 通知公告
.notice-list__type {
  background: #f7f8f9;
}
.notice-list__time {
  white-space: nowrap;
  //width: 80px;
  text-align: right;
}
.notice-list__list {
  line-height: 1.5;
}
.item_name {
  padding: 5px;
}
.item_number {
  margin-top: 10px;
  margin-left: 5px;
}
.item_circle {
  margin-right: 0px !important;
}
</style>
