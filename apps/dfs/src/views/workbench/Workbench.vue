<template>
  <div v-if="$route.name === 'Workbench'" class="workbench-container">
    <!--	快速开始	-->
    <div class="workbench-start workbench-section">
      <ElRow :gutter="40" class="section-header py-6">
        <ElCol :span="18" class="main-title">{{ $t('workbench_quick_start') }}</ElCol>
        <ElCol :span="6" class="aside-title">{{ $t('workbench_notice') }}</ElCol>
      </ElRow>
      <ElRow :gutter="40" class="section-body">
        <ElCol :span="6" v-for="(item, index) in createList" :key="index">
          <div class="create-list__item flex p-6">
            <div class="create-list__index block flex justify-content-center align-items-center flex-shrink-0">
              {{ index + 1 }}
            </div>
            <div class="create-list__main ml-4">
              <div class="create-list__name mb-4 fs-6">{{ item.name }}</div>
              <div class="create-list__desc">{{ item.desc }}</div>
              <ElLink type="primary" class="float-end pointer" @click="item.action">
                <span>{{ item.btnName }}</span>
                <VIcon class="ml-2" size="12">right</VIcon>
              </ElLink>
            </div>
          </div>
        </ElCol>
        <ElCol :span="6">
          <div class="aside-main notice-list flex-grow-1 p-6">
            <ul class="notice-list__list">
              <li
                v-for="(item, index) in notices.slice(0, 5)"
                :key="index"
                class="notice-list__item flex align-items-center mb-4 px-1 pointer"
              >
                <div v-if="item.type" class="notice-list__type mr-4 p-1">
                  {{ item.type }}
                </div>
                <ElLink
                  v-else
                  type="primary"
                  class="notice-list__name flex-grow-1 ellipsis block pointer"
                  @click="toNotice(item)"
                >
                  {{ item.name }}
                </ElLink>
                <div class="notice-list__time">
                  {{ fromNow(item.time) }}
                </div>
              </li>
            </ul>
          </div>
        </ElCol>
      </ElRow>
    </div>
    <!--	概览	-->
    <div class="workbench-overview workbench-section">
      <ElRow :gutter="40" class="section-header py-6">
        <ElCol :span="18" class="main-title">{{ $t('workbench_overview') }}</ElCol>
        <ElCol :span="6" class="aside-title">{{ $t('workbench_guide') }}</ElCol>
      </ElRow>
      <ElRow :gutter="40" class="section-body">
        <ElCol :span="18">
          <ul class="agent-list__list flex-grow-1 flex justify-content-around px-5">
            <li v-for="(item, index) in agentList" :key="index" class="agent-list__item py-6" :ref="item.key">
              <div class="agent-list__name flex align-items-center justify-content-center mx-auto mb-3">
                <VIcon size="14" class="icon" color="#888">{{ item.icon }}</VIcon>
                <span class="ml-1 fs-7">{{ item.name }}</span>
              </div>
              <div class="color-primary text-center fs-1">
                {{ item.value }}
              </div>
              <div class="agent-list__detail flex flex-wrap justify-content-around mt-3 py-2 px-1">
                <div v-for="(detail, dIndex) in item.list" :key="dIndex" :class="['agent-list__status', detail.class]">
                  <span>{{ detail.label }}</span>
                  <span>:</span>
                  <span :class="['ml-1']">{{ detail.value }}</span>
                </div>
              </div>
            </li>
          </ul>
        </ElCol>
        <ElCol :span="6">
          <div class="aside-main guide-list flex-grow-1 p-6">
            <div class="guide-list__list">
              <ElLink
                v-for="(item, index) in guides"
                :key="index"
                type="primary"
                class="guide-list__item mb-4 block pointer"
                @click="clickGuide(item)"
              >
                {{ item.name }}
              </ElLink>
            </div>
          </div>
        </ElCol>
      </ElRow>
    </div>
    <!--  任务数据量统计  -->
    <div class="workbench-overview workbench-section">
      <div class="main-title py-6">{{ $t('workbench_statistics_title') }}</div>
      <div class="p-6" style="background-color: #fff">
        <div class="fs-7" style="color: #000">
          <span class="mr-4">{{ $t('workbench_statistics__sub_title') }}</span>
          <span class="mr-1">{{ $t('workbench_statistics__sub_title_label') }}</span>
          <span class="color-primary" style="font-family: DIN">{{ numToThousands(taskInputNumber) }}</span>
        </div>
        <div class="pr-4" style="height: 200px">
          <Chart type="bar" :data="barData" :options="barOptions"></Chart>
        </div>
      </div>
    </div>
    <!-- 版本升级弹窗-->
    <el-dialog :visible.sync="showUpgrade" title="版本升级通知">
      <div>
        尊敬的用户,您好：<br />
        在2022年9月29日，我们将会发布重大升级V3.0版本，
        由于增加了很多实用功能，我们被迫舍弃了现有的版本架构重新开发，因此您在当前V2版本中创建的连接和任务将不会同步到新版本，
        不过放心，新版本发布后您仍然可以继续使用旧版本进行您的数据操作，我们保证V2版本和V3版本将长期共存，<br />
        当然，如果有新的任务我们建议您在新版本中创建以便获得更好的使用体验，欢迎您届时体验我们新版功能并提出您的宝贵建议。<br />
        下面是新版本增加的特性：<br />
        基于PDK的数据源注册机制<br />
        ● 基于PDK来实现数据源的开发<br />
        ● 用户可按照PDK的标准灵活定制自己的数据源<br />
        ● 新开发的数据源可以通过注册快速接入平台，无需重启即可使用<br />
        全量和增量阶段的数据一致性校验能力<br />
        ● 具备对数据复制任务全量数据一致性的校验能力<br />
        ● 具备对数据复制任务增量数据一致性的实时校验能力<br />
        ● 具备对数据校验的差异结果发起再次校验的能力<br />
        任务可观测能力<br />
        ● 任务指标可观测能力，可通过关键指标直接反馈任务的运行状态<br />
        ● 任务日志可观测能力，通过标准化的任务日志输出任务关键信息，当出现问题时可以快速定位<br />
        ● 任务告警能力，任务出现异常告警时直接体现在任务运行监控页面，与任务DAG结合，所有问题直观可见<br />
        数据同步能力增强<br />
        ● 新增动态新增表功能，支持将数据库新增表同步至目标<br />
        ● 新增DDL支持能力，支持对Oracle、MySQL、DB2、PG等数据库的常用DDL操作进行同步<br />
        ● 新增合并算子和JOIN算子，支持多表关联合并操作<br />
        ● 新增自定义函数用户可通过jar包导入自定义函数进行使用<br />
        ● 新增自定义算子支持，用户可通过灵活的JS能力来定义自己的算子<br />
      </div>
      <footer class="mt-4">
        <el-button size="mini">关闭</el-button>
      </footer>
    </el-dialog>
  </div>
  <RouterView v-else></RouterView>
</template>

<script>
import i18n from '@/i18n'

import { connectionsApi, taskApi } from '@tap/api'
import { VIcon, Chart } from '@tap/component'
import { numToThousands } from '@/util'
import timeFunction from '@/mixins/timeFunction'

export default {
  name: 'Workbench',
  components: { VIcon, Chart },
  mixins: [timeFunction],
  data() {
    const $t = this.$t.bind(this)
    return {
      createList: [
        {
          name: $t('agent_manage'),
          desc: $t('workbench_agent_desc'),
          btnName: $t('workbench_agent_button_create'),
          action: this.createAgent
        },
        {
          name: $t('connection_manage'),
          desc: $t('workbench_connection_desc'),
          btnName: $t('workbench_connection_button_create'),
          action: this.createConnection
        },
        {
          name: $t('task_manage'),
          desc: $t('workbench_task_desc'),
          btnName: $t('workbench_task_button_create'),
          action: this.createTask
        }
      ], // 创建列表
      agentList: [
        {
          name: 'Agent',
          key: 'agent',
          icon: 'agent',
          value: 0,
          list: [
            {
              label: $t('agent_status_running'),
              value: 0,
              class: 'success'
            },
            {
              label: $t('agent_status_stopped'),
              value: 0,
              class: 'error'
            }
          ]
        },
        {
          name: $t('workbench_overview_connection'),
          key: 'connection',
          icon: 'connection',
          value: 0,
          list: [
            {
              label: $t('workbench_overview_connection_ready'),
              value: 0
            },
            {
              label: $t('workbench_overview_connection_invalid'),
              value: 0
            }
          ]
        },
        {
          name: $t('workbench_overview_task'),
          key: 'task',
          icon: 'task',
          value: 0,
          list: [
            {
              label: $t('task_initial_sync'),
              value: 0
            },
            {
              label: $t('task_sync_type_cdc'),
              value: 0
            },
            {
              label: $t('task_initial_sync_cdc'),
              value: 0
            }
          ]
        }
      ], // 介绍列表
      notices: [], // 公告列表
      guides: [
        {
          name: $t('workbench_guide_documentation'),
          url: 'https://www.yuque.com/tapdata/cloud/chan-pin-jian-jie_readme'
        },
        {
          name: $t('workbench_guide_problem'),
          url: 'https://www.yuque.com/tapdata/cloud/iff88o'
        },
        {
          name: $t('workbench_guide_data_safe'),
          url: 'https://www.yuque.com/tapdata/cloud/chan-pin-jian-jie_chan-pin-jia-gou-ji-yuan-li'
        }
      ],
      isGuide: true,
      taskInputNumber: 0,
      barData: [],
      barOptions: {
        barWidth: '50%',
        grid: {
          top: 20,
          bottom: 0,
          left: 0,
          right: 0
        },
        xAxis: {
          axisLabel: {
            formatter: val => {
              return this.formatTime(val, '', 'MM-DD')
            }
          },
          axisLine: {
            onZero: false
          }
        },
        yAxis: {
          show: true,
          type: 'log',
          min: 1,
          logBase: 10,
          axisLabel: {
            formatter: val => {
              let res = val === 1 ? 0 : val
              if (res / 1000 >= 1) {
                res = res / 1000 + 'K'
              }
              return res
            }
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: params => {
            let item = params
            let val = item.value
            if (val === 1.1) {
              val = 1
            }
            val = numToThousands(val)
            let html = item.marker + params.name + `<span style="padding: 0 4px"></span><br/>` + val
            return html
          }
        }
      },
      colorList: ['rgba(44, 101, 255, 0.85)', 'rgba(44, 101, 255, 0.5)'],
      showUpgrade: false //版本升级弹窗
    }
  },
  created() {
    this.loadChat()
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.loadAgent() // agent
      this.getConnectionStats() // 任务
      this.getTaskStats() // 任务
      this.loadNotices() // 通知公告
      this.loadBarData()
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
    // 获取连接数据
    async getConnectionStats() {
      const connectionLoading = this.$loading({
        target: this.$refs.connection?.[0]
      })
      const data = await connectionsApi.getStats().finally(() => {
        connectionLoading.close()
      })
      let agentList = this.agentList
      const stats = data || {}
      if (stats) {
        agentList[1].value = stats.total
        agentList[1].list[0].value = stats.ready || 0
        agentList[1].list[1].value = stats.invalid || 0
      }
    },
    // 获取任务数据
    async getTaskStats() {
      const taskLoading = this.$loading({
        target: this.$refs.task?.[0]
      })
      const data = await taskApi.getStats().finally(() => {
        taskLoading.close()
      })
      let agentList = this.agentList
      const stats = data.taskTypeStats
      if (stats) {
        agentList[2].value = stats.total
        agentList[2].list[0].value = stats.initial_sync || 0
        agentList[2].list[1].value = stats.cdc || 0
        agentList[2].list[2].value = stats['initial_sync+cdc'] || 0
      }
    },
    loadNotices() {
      this.notices = [
        {
          id: 1,
          type: '',
          name: '【重要】版本升级和服务切换重要公告',
          time: '2022-09-29 18:00'
        },
        {
          id: 16,
          type: '',
          name: i18n.t('workbench_Workbench_tAPDA12'),
          time: '2022-05-12 18:00'
        },
        {
          id: 15,
          type: '',
          name: i18n.t('workbench_Workbench_tAPDA1'),
          time: '2022-04-22 19:00'
        },
        {
          id: 14,
          type: '',
          name: i18n.t('workbench_Workbench_tAPDA5'),
          time: '2022-04-07 21:00:00'
        },
        {
          id: 13,
          type: '',
          name: i18n.t('workbench_Workbench_tAPDA4'),
          time: '2022-03-30 18:00:00'
        },
        {
          id: 12,
          type: '',
          name: i18n.t('workbench_Workbench_tAPDA3'),
          time: '2022-03-11 14:00:00'
        },
        {
          id: 11,
          type: '',
          name: i18n.t('workbench_Workbench_tAPDA2'),
          time: '2022-02-28 14:00:00'
        },
        {
          id: 10,
          type: '',
          name: i18n.t('workbench_Workbench_tAPDA'),
          time: '2022-02-12 14:00:00'
        },
        {
          id: 8,
          type: '',
          name: i18n.t('workbench_Notice_tAPDA12'),
          time: '2021-12-21'
        }
      ]
    },
    loadBarData() {
      let granularity = 'month'
      this.$axios
        .get('tm/api/DataFlowInsights/statistics', {
          params: {
            granularity
          }
        })
        .then(data => {
          const list = data.inputDataStatistics || []
          this.taskInputNumber = data.totalInputDataCount || 0
          this.barData = list.map((el, index) => {
            let value = el.count
            if (value === 1) {
              value = 1.1
            }
            return {
              name: el.time,
              value: value,
              color: this.colorList[index % 2]
            }
          })
        })
    },
    createAgent() {
      this.$router.push({
        name: 'Instance',
        query: {
          create: true
        }
      })
    },
    createTask() {
      this.$router.push({
        name: 'MigrateCreate'
      })
    },
    createConnection() {
      this.$root.$emit('select-connection-type')
    },
    toNotice(item) {
      if (item?.id === 1) {
        //当前页弹窗
        this.showUpgrade = true
      } else {
        this.$router.push({
          name: 'WorkbenchNotice',
          query: {
            id: item?.id
          }
        })
      }
    },
    clickGuide(item) {
      if (item.action) {
        this.$root.$emit('show-guide')
        return
      }
      window.open(item.url, '_blank')
    },
    hideCustomTip() {
      setTimeout(() => {
        let tDom = document.getElementById('titlediv')
        if (tDom) {
          tDom.style.display = 'none'
        } else {
          this.hideCustomTip()
        }
      }, 5000)
    },
    numToThousands() {
      return numToThousands(...arguments)
    },
    loadChat() {
      let $zoho = $zoho || {}
      $zoho.salesiq = $zoho.salesiq || {
        widgetcode: '39c2c81d902fdf4fbcc9b55f1268168c6d58fe89b1de70d9adcb5c4c13d6ff4d604d73c57c92b8946ff9b4782f00d83f',
        values: {},
        ready: function () {}
      }
      window.$zoho = $zoho
      let d = document
      let s = d.createElement('script')
      s.type = 'text/javascript'
      s.id = 'zsiqscript'
      s.defer = true
      s.src = 'https://salesiq.zoho.com.cn/widget'
      let t = d.getElementsByTagName('script')[0]
      t.parentNode.insertBefore(s, t)
      this.hideCustomTip()
    }
  }
}
</script>

<style lang="scss" scoped>
.workbench-container {
  height: 100%;
  min-height: 610px;
  min-width: 1100px;
  box-sizing: border-box;
  .pointer {
    cursor: pointer;
  }
}
.main-title,
.aside-title {
  font-size: 18px;
  line-height: 24px;
}
// 快速开始
.create-list__item {
  background-color: #fff;
  //min-width: 200px;
  height: 213px;
  box-sizing: border-box;
  border-radius: 4px;
  &:hover {
    box-shadow: 0 2px 11px 8px #e0e2e7;
  }
}
.create-list__index {
  width: 22px;
  height: 22px;
  color: map-get($color, primary);
  border: 1px solid map-get($color, primary);
  border-radius: 50%;
}
.create-list__main {
  flex: 1;
  overflow: hidden;
}
.create-list__name {
  color: #000;
  white-space: nowrap;
}
.create-list__desc {
  height: 110px;
  overflow: auto;
  color: rgba(0, 0, 0, 0.49);
}
.aside-main {
  height: 213px;
  background-color: #fff;
  box-sizing: border-box;
  border-radius: 4px;
}
.agent-list__list {
  background-color: #fff;
  border-radius: 4px;
}
.agent-list__item {
  //min-width: 250px;
  height: 190px;
  box-sizing: border-box;
  background-color: #fff;
}
.agent-list__name {
  .vicon {
    color: #888;
  }
}
.agent-list__detail {
  width: 232px;
  background-color: #fafafb;
  color: rgba(0, 0, 0, 0.5);
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
  color: rgba(0, 0, 0, 0.5);
  white-space: nowrap;
  width: 80px;
  text-align: right;
}
.guide-list {
  height: 190px;
}
</style>
