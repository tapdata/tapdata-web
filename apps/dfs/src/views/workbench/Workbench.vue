<template>
  <div v-if="$route.name === 'Workbench'" class="workbench-container">
    <!--	快速开始	-->
    <div class="workbench-start workbench-section">
      <ul class="flex pt-6">
        <!--        <li>-->
        <!--          <div class="create-list__item quick-start-video flex justify-content-center align-items-center">-->
        <!--            <VIcon size="50" class="mr-4">quick-start-read</VIcon>-->
        <!--            <div class="flex flex-column">-->
        <!--              <div class="color-white mb-2">新人教程视频</div>-->
        <!--              <el-button size="mini" class="quick-start-button">点击查看</el-button>-->
        <!--            </div>-->
        <!--          </div>-->
        <!--        </li>-->
        <li v-for="(item, index) in createList" :key="index">
          <div class="create-list__item flex justify-content-center align-items-center p-2">
            <el-link class="create-list__main ml-4" :disabled="$disabledReadonlyUserBtn()" @click="item.action">
              <VIcon class="ml-2 mr-2" size="20">{{ item.icon }}</VIcon>
              <span> {{ index + 1 }}. {{ item.name }} </span>
              <VIcon class="ml-8" size="14">add</VIcon>
            </el-link>
          </div>
        </li>
      </ul>
    </div>
    <!--	{{$t('_workbench_workbench_tansuoshili')}}	-->
    <div class="workbench-overview workbench-section">
      <!-- <ElRow :gutter="40" class="section-header py-6">-->
      <!--  <ElCol :span="18" class="main-title">{{ $t('_workbench_workbench_tansuoshili') }}</ElCol>-->
      <!--  </ElRow>-->
      <!--      <el-tabs class="explore-examples" active-name="first">-->
      <!--        <el-tab-pane label="全部" name="first">-->
      <!--          <ul class="flex flex-row">-->
      <!--            <li-->
      <!--              class="cursor-pointer mr-6"-->
      <!--              v-for="(item, index) in examplesList"-->
      <!--              :key="index"-->
      <!--              @click="goScenes(item.url)"-->
      <!--            >-->
      <!--              <div class="position-relative">-->
      <!--                <img :src="getImg(item.img)" />-->
      <!--                <div v-if="item.title" class="position-absolute position-text">{{ item.title }}</div>-->
      <!--                <div v-if="item.subTitle" class="position-absolute position-sub-text">{{ item.subTitle }}</div>-->
      <!--              </div>-->
      <!--              <div class="text-center">{{ item.title }}{{ item.subTitle }}</div>-->
      <!--            </li>-->
      <!--          </ul>-->
      <!--        </el-tab-pane>-->
      <!--      </el-tabs>-->
      <!--暂时不分类-->
      <div class="explore-examples explore-examples-wrap">
        <div class="main-title mb-2">{{ $t('_workbench_workbench_tansuoshili') }}</div>
        <ul class="flex flex-row">
          <li
            class="cursor-pointer mr-6"
            v-for="(item, index) in examplesList"
            :key="index"
            @click="goScenes(item.url)"
          >
            <div class="position-relative">
              <img :src="getImg(item.img)" />
              <div class="position-absolute position-text flex justify-content-center align-items-center flex-column">
                <div v-if="item.title" class="text-center explore-examples-ellipsis pl-1 pr-1">{{ item.title }}</div>
                <div v-if="item.subTitle" class="text-center explore-examples-ellipsis">{{ item.subTitle }}</div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <!--	概览	-->
    <div class="workbench-overview workbench-section">
      <ElRow :gutter="24" class="section-header py-4">
        <ElCol :span="18" class="main-title">{{ $t('workbench_overview') }}</ElCol>
        <ElCol :span="6" class="aside-title">{{ $t('workbench_notice') }}</ElCol>
      </ElRow>
      <ElRow :gutter="24" class="section-body">
        <ElCol :span="18">
          <ul class="agent-list__list flex">
            <li v-for="(item, index) in agentList" :key="index" class="agent-list__item" :ref="item.key">
              <div class="agent-list__name flex align-items-center mx-auto mb-3">
                <VIcon size="14" class="icon">{{ item.icon }}</VIcon>
                <span class="ml-1 fs-7">{{ item.name }}</span>
              </div>
              <div class="fs-1">
                {{ item.value }}
              </div>
              <div
                class="flex justify-content-between align-items-center mt-3 px-1"
                style="height: 80px"
                v-if="item.list.length > 0"
              >
                <div>
                  <div class="mb-2" v-for="(detail, dIndex) in item.list" :key="dIndex">
                    <span>{{ detail.label }}</span>
                    <span>:</span>
                    <span :class="['ml-1']">{{ detail.value }}</span>
                  </div>
                </div>
                <div style="height: 80px; width: 80px; margin-bottom: 16px">
                  <Chart ref="lineChart" type="pie" :extend="getPieOption(index)"></Chart>
                </div>
              </div>
            </li>
          </ul>
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
                <ElLink v-else class="notice-list__name flex-grow-1 ellipsis block pointer" @click="toNotice(item)">
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
    <!--  任务数据量统计  -->
    <div class="workbench-overview workbench-section">
      <div class="main-title py-6">{{ $t('workbench_statistics_title') }}</div>
      <div class="p-6 common-card">
        <div class="fs-7" style="color: #000">
          <span class="mr-4">{{ $t('workbench_statistics__sub_title') }}</span>
          <span class="mr-1">{{ $t('workbench_statistics__sub_title_label') }}</span>
          <span class="color-primary" style="font-family: DIN">{{ numToThousands(taskInputNumber) }}</span>
        </div>
        <div class="pr-4" style="height: 200px">
          <Chart type="pie" :extend="getLineOption()"></Chart>
        </div>
      </div>
    </div>
    <!-- 版本升级弹窗-->
    <el-dialog
      class="dialog-upgrade"
      :visible.sync="showUpgrade"
      :title="$t('dfs_workbench_workbench_banbenshengjitong')"
      width="670px"
    >
      <div class="dialog-upgrade__text">
        <div>
          <p class="mb-2">{{ $t('dfs_workbench_workbench_zunjingdeyonghu') }}</p>
          <p class="mb-2">{{ $t('dfs_workbench_workbench_zainianyueriwo') }}</p>
          <p>{{ $t('dfs_workbench_workbench_youyuzengjiale') }}</p>
          <p>{{ $t('dfs_workbench_workbench_dangranruguoyou') }}</p>
        </div>
        <p class="mb-2 mt-2 dialog-upgrade__text__header">{{ $t('dfs_workbench_workbench_xiamianshixinban') }}</p>
        <p class="mt-4 mb-2 dialog-upgrade__text__header">{{ $t('dfs_workbench_workbench_jiyuPdk2') }}</p>
        <ul>
          <li>{{ $t('dfs_workbench_workbench_jiyuPdk') }}</li>
          <li>{{ $t('dfs_workbench_workbench_yonghukeanzhao') }}</li>
          <li>{{ $t('dfs_workbench_workbench_xinkaifadeshu') }}</li>
        </ul>
        <p class="mt-4 mb-2 dialog-upgrade__text__header">{{ $t('dfs_workbench_workbench_quanlianghezengliang') }}</p>
        <ul>
          <li>{{ $t('dfs_workbench_workbench_jubeiduishuju3') }}</li>
          <li>{{ $t('dfs_workbench_workbench_jubeiduishuju2') }}</li>
          <li>{{ $t('dfs_workbench_workbench_jubeiduishuju') }}</li>
        </ul>
        <p class="mt-4 mb-2 dialog-upgrade__text__header">{{ $t('dfs_workbench_workbench_renwukeguance') }}</p>
        <ul>
          <li>{{ $t('dfs_workbench_workbench_renwuzhibiaoke') }}</li>
          <li>{{ $t('dfs_workbench_workbench_renwurizhike') }}</li>
          <li>{{ $t('dfs_workbench_workbench_renwugaojingneng') }}</li>
        </ul>
        <p class="mt-4 mb-2 dialog-upgrade__text__header">{{ $t('dfs_workbench_workbench_shujutongbuneng') }}</p>
        <ul>
          <li>{{ $t('dfs_workbench_workbench_xinzengdongtaixin') }}</li>
          <li>{{ $t('dfs_workbench_workbench_xinzengDdl') }}</li>
          <li>{{ $t('dfs_workbench_workbench_xinzengzidingyi2') }}</li>
          <li>{{ $t('dfs_workbench_workbench_xinzengzidingyi') }}</li>
        </ul>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="showUpgrade = false">{{ $t('public_button_cancel') }}</el-button>
      </span>
    </el-dialog>
    <PaidUpgradeDialog :visible.sync="paidUpgradeVisible" :paidPlan="paidPlan"></PaidUpgradeDialog>
    <CheckLicense :visible.sync="aliyunMaketVisible" :user="userInfo"></CheckLicense>
  </div>
  <RouterView v-else></RouterView>
</template>

<script>
import i18n from '@/i18n'

import { connectionsApi, taskApi, paidApi } from '@tap/api'
import { VIcon, Chart, PaidUpgradeDialog } from '@tap/component'
import { numToThousands } from '@/util'
import timeFunction from '@/mixins/timeFunction'
import CheckLicense from '@/views/aliyun-market/CheckLicnese'

export default {
  name: 'Workbench',
  components: { VIcon, Chart, PaidUpgradeDialog, CheckLicense },
  inject: ['checkAgent'],
  mixins: [timeFunction],
  data() {
    const $t = this.$t.bind(this)
    return {
      userInfo: '',
      //云市场
      aliyunMaketVisible: false,
      createList: [
        {
          name: $t('agent_manage'),
          desc: $t('workbench_agent_desc'),
          btnName: $t('public_agent_button_create'),
          action: this.createAgent,
          icon: 'dashboard-agent'
        },
        {
          name: $t('connection_manage'),
          desc: $t('workbench_connection_desc'),
          btnName: $t('public_connection_button_create'),
          action: this.createConnection,
          icon: 'dashboard-connection'
        },
        {
          name: $t('task_manage'),
          desc: $t('workbench_task_desc'),
          btnName: $t('workbench_task_button_create'),
          action: this.createTask,
          icon: 'dashboard-task'
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
              label: $t('public_status_running'),
              value: 0,
              class: 'success'
            },
            {
              label: $t('public_agent_status_offline'),
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
              label: $t('public_task_type_initial_sync'),
              value: 0
            },
            {
              label: $t('public_task_type_cdc'),
              value: 0
            },
            {
              label: $t('public_task_type_initial_sync_and_cdc'),
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
      lineDataX: [],
      lineDataY: [],
      colorList: ['rgba(44, 101, 255, 0.85)', 'rgba(44, 101, 255, 0.5)'],
      showUpgrade: false, //版本升级弹窗
      //付费升级
      paidUpgradeVisible: false,
      paidPlan: '',
      //探索实例
      examplesList: [
        {
          type: 'all',
          title: i18n.t('_workbench_workbench_jiangshujudaoru'),
          subTitle: i18n.t('_workbench_workbench_jiangshujudaorusub'),
          img: 'table-store',
          url: 'https://tapdata.net/how-to-import-data-into-tablestore-alibaba-cloud.html?fromColId=104'
        },
        {
          type: 'all',
          title: i18n.t('_workbench_workbench_shujuruhucang'),
          subTitle: 'MySQL → Doris',
          img: 'mysql-doris',
          url: 'https://tapdata.net/real-time-data-entry-into-the-lake-and-warehouse.html?fromColId=104'
        },
        {
          type: 'all',
          title: i18n.t('_workbench_workbench_yigoushishitong'),
          subTitle: 'Oracle → MySQL ',
          img: 'oracle-mysql',
          url: 'https://tapdata.net/real-time-sync-of-hdb-from-oracle-to-mysql.html?fromColId=104'
        },
        {
          type: 'all',
          title: i18n.t('_workbench_workbench_shujurucang'),
          subTitle: 'SQL Server → BigQuery ',
          img: 'bigQuery',
          url: 'https://tapdata.net/tapdata-connector-sqlserver-bigquery.html'
        },
        {
          type: 'all',
          title: i18n.t('_workbench_workbench_shujurucang'),
          subTitle: 'MySQL → ClickHouse',
          img: 'clickHouse',
          url: 'https://tapdata.net/tapdata-connector-mysql-clickhouse.html?fromColId=104'
        }
      ]
    }
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
      //获取cookie 是否用户有操作过 稍后部署 且缓存是当前用户 不在弹窗
      let user = window.__USER_INFO__
      this.userInfo = user
      //检查是云市场用户授权码有效期
      if (user?.enableLicense) {
        this.checkLicense(user)
      }
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
          id: 9,
          type: '',
          name: 'Tapdata Cloud 3.1.9 Release Notes',
          link: 'https://mp.weixin.qq.com/s/eBHKEZBVkuQ0ah8Kv0wRKQ',
          time: '2023-03-20 21:00'
        },
        {
          id: 8,
          type: '',
          name: 'Tapdata Cloud 3.1.8 Release Notes',
          link: 'https://mp.weixin.qq.com/s/WQZx38g93lYuPpsWjbETZg',
          time: '2023-03-2 21:00'
        },
        {
          id: 7,
          type: '',
          name: this.$t('workbench_Notice_tAPDA12'),
          time: '2023-03-2 21:00'
        },
        {
          id: 6,
          type: '',
          name: 'Tapdata Cloud 3.1.7 Release Notes',
          link: 'https://mp.weixin.qq.com/s/npognQxT4O4xzc4u1bb4mg',
          time: '2023-02-21 21:00'
        },
        {
          id: 5,
          type: '',
          name: 'Tapdata Cloud 3.1.6 Release Notes',
          link: 'https://mp.weixin.qq.com/s/rG_ag8LY-WSte4VnIgThXA',
          time: '2023-02-3 21:00'
        },
        {
          id: 4,
          type: '',
          name: 'Tapdata Cloud 3.1.5 Release Notes',
          link: 'https://mp.weixin.qq.com/s/JYPt9aExnCL9tyOENe7QOA',
          time: '2023-01-20 21:00'
        },
        {
          id: 3,
          type: '',
          name: 'Tapdata Cloud 3.1.4 Release Notes',
          link: 'https://mp.weixin.qq.com/s/dUuqGQZGEI10cOLpbzqbHA',
          time: '2023-01-3 21:00'
        },
        {
          id: 2,
          type: '',
          name: 'Tapdata Cloud 3.1.3 Release Notes',
          link: 'https://mp.weixin.qq.com/s/mwMNTGsglm9rQi-k9zqRgg',
          time: '2022-12-15 21:00'
        },
        {
          id: 1,
          type: '',
          name: i18n.t('dfs_workbench_workbench_zhongyaobanbensheng'),
          time: '2022-12-03 18:00'
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
          this.lineDataX = list.map(el => el.time)
          this.lineDataY = list.map(el => {
            let value = el.count
            if (value === 1) {
              value = 1.1
            }
            return value
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
    async createTask() {
      this.paidPlan = await paidApi.getUserPaidPlan()
      if (!this.paidPlan?.valid) {
        this.paidUpgradeVisible = true
        return
      }
      this.checkAgent(() => {
        this.$router.push({
          name: 'MigrateCreate'
        })
      })
    },
    createConnection() {
      this.$root.$emit('select-connection-type')
    },
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
    numToThousands() {
      return numToThousands(...arguments)
    },

    //获取探索示例-背景图
    getImg(name) {
      return require(`../../../public/images/dashboard/${name}.svg`)
    },
    goScenes(url) {
      window.open(url)
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
    //折线面积图
    getLineOption() {
      return {
        grid: {
          top: 20,
          bottom: 20,
          left: 55,
          right: 20
        },
        xAxis: {
          boundaryGap: false,
          axisLabel: {
            formatter: val => {
              return this.formatTime(val, '', 'MM-DD')
            }
          },
          data: this.lineDataX
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
            let html = val
            return html
          }
        },
        series: [
          {
            data: this.lineDataY,
            connectNulls: true,
            type: 'line',
            areaStyle: {
              color: {
                type: 'linear',
                x: 1,
                y: 0,
                x2: 0,
                y2: 0,
                colorStops: [
                  {
                    offset: 0,
                    color: 'rgba(0, 102, 255, 0.2)' // 0% 处的颜色
                  },
                  {
                    offset: 1,
                    color: 'rgba(44, 127, 252, 0)' // 100% 处的颜色
                  }
                ],
                global: false // 缺省为 false
              }
            },
            color: '#2C65FF' //线条颜色
          }
        ]
      }
    },

    //检查云市场用户授权码是否过期
    checkLicense(user) {
      var licenseCodes = user?.licenseCodes || []
      //是否有临近过期授权码
      let verify = licenseCodes.filter(it => it.nearExpiration)
      if (user?.licenseValid && verify?.length > 0) {
        //授权码可用 存在有临近授权码
        this.aliyunMaketVisible = true
        this.userInfo = {
          showNextProcessing: true,
          licenseType: 'checkCode',
          data: verify
        }
      }
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
  padding: 0 24px 24px 24px;
  .pointer {
    cursor: pointer;
  }
}
.main-title,
.aside-title {
  font-size: 18px;
  line-height: 24px;
  font-weight: 500;
}
// 快速开始
.create-list__item {
  width: 230px;
  height: 70px;
  margin-right: 24px;
  background-color: #fff;
  box-sizing: border-box;
  border: 1px solid #e1e3e9;
  border-radius: 8px;
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

.aside-main {
  height: 213px;
  background-color: #fff;
  box-sizing: border-box;
  border-radius: 4px;
}
.agent-list__list {
  background: map-get($color, white);
}
.agent-list__item {
  width: 33%;
  height: 190px;
  border: 1px solid #e1e3e9;
  border-radius: 8px;
  margin-right: 24px;
  padding: 16px;
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
  color: map-get($fontColor, light);
  white-space: nowrap;
  width: 80px;
  text-align: right;
}
.guide-list {
  height: 190px;
}
.dialog-upgrade__text {
  font-size: 12px;
  color: map-get($fontColor, light);
}
.dialog-upgrade__text__header {
  font-size: 14px;
  color: map-get($fontColor, normal);
}
.dialog-upgrade {
  ::v-deep {
    .el-dialog__body {
      padding: 0 20px;
    }
  }
}
.notice-list {
  height: 190px;
  border: 1px solid #e1e3e9;
  border-radius: 8px;
}
.common-card {
  border: 1px solid #e1e3e9;
  border-radius: 8px;
}
.quick-start-video {
  background: linear-gradient(
    89.97deg,
    rgba(128, 61, 217, 0.8) 0.03%,
    rgba(131, 132, 255, 0.8) 50.06%,
    rgba(104, 142, 247, 0.8) 76.93%,
    rgba(93, 153, 248, 0.8) 99.98%
  );
}
.explore-examples {
  background: #f4f6fc;
  border-radius: 10px;
  padding: 20px;
}
.explore-examples-wrap {
  margin-top: 24px;
}
.position-text {
  top: 0;
  left: 0;
  color: map-get($color, white);
  width: 100%;
  height: 60px;
}
.explore-examples-ellipsis {
  /* white-space: nowrap; */
  width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.position-sub-text {
  top: 33px;
  left: 52px;
  color: map-get($color, white);
}
.quick-start-button {
  padding: 4px 15px;
  border-radius: 5px;
}
</style>
