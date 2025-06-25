<script>
import { connectionsApi, taskApi } from '@tap/api'
import { Chart, VIcon } from '@tap/component'

import { mapMutations } from 'vuex'
import io_scene1 from '@/assets/image/dashboard/io_scene1.png'
import io_scene2 from '@/assets/image/dashboard/io_scene2.png'
import io_scene3 from '@/assets/image/dashboard/io_scene3.png'
import io_scene4 from '@/assets/image/dashboard/io_scene4.png'
import scene1 from '@/assets/image/dashboard/scene1.png'
import scene2 from '@/assets/image/dashboard/scene2.png'

import scene3 from '@/assets/image/dashboard/scene3.png'
import scene4 from '@/assets/image/dashboard/scene4.png'
import scene5 from '@/assets/image/dashboard/scene5.png'
import plan_banner_cn from '@/assets/image/plan_banner_cn.png'
import plan_banner from '@/assets/image/plan_banner.png'
import i18n from '@/i18n'
import timeFunction from '@/mixins/timeFunction'
import { UpgradeDialog } from '@/plugins/upgrade-notice'
import CheckLicense from '@/views/aliyun-market/CheckLicnese'
import { $emit, $off, $on, $once } from '../../../utils/gogocodeTransfer'

export default {
  name: 'Workbench',
  components: { VIcon, Chart },
  mixins: [timeFunction],
  inject: ['checkAgent'],
  data() {
    const $t = this.$t.bind(this)
    const isDomesticStation = this.$store.getters.isDomesticStation

    const examplesList = isDomesticStation
      ? [
          {
            type: 'all',
            title: i18n.t('_workbench_workbench_jiangshujudaoru'),
            subTitle: i18n.t('_workbench_workbench_jiangshujudaorusub'),
            img: scene1,
            url: 'https://tapdata.net/how-to-import-data-into-tablestore-alibaba-cloud.html?fromColId=104',
          },
          {
            type: 'all',
            title: i18n.t('_workbench_workbench_shujuruhucang'),
            subTitle: 'MySQL → Doris',
            img: scene2,
            url: 'https://tapdata.net/real-time-data-entry-into-the-lake-and-warehouse.html?fromColId=104',
          },
          {
            type: 'all',
            title: i18n.t('_workbench_workbench_yigoushishitong'),
            subTitle: 'Oracle → MySQL ',
            img: scene3,
            url: 'https://tapdata.net/real-time-sync-of-hdb-from-oracle-to-mysql.html?fromColId=104',
          },
          {
            type: 'all',
            title: i18n.t('_workbench_workbench_shujurucang'),
            subTitle: 'SQL Server → BigQuery ',
            img: scene4,
            url: 'https://tapdata.net/tapdata-connector-sqlserver-bigquery.html',
          },
          {
            type: 'all',
            title: i18n.t('_workbench_workbench_shujurucang'),
            subTitle: 'MySQL → ClickHouse',
            img: scene5,
            url: 'https://tapdata.net/tapdata-connector-mysql-clickhouse.html?fromColId=104',
          },
        ]
      : [
          {
            type: 'all',
            title: 'Tapdata',
            subTitle: 'Cloud Version Intro',
            img: io_scene1,
            url: 'https://youtu.be/WpV5mAOPNL0?t=280',
          },
          {
            type: 'all',
            title: 'Data Replication Feature',
            subTitle: '',
            img: io_scene2,
            url: 'https://youtu.be/jHbDRDYp7Bs?t=6',
          },
          {
            type: 'all',
            title: 'Data Transformation',
            subTitle: '',
            img: io_scene3,
            url: 'https://youtu.be/xQsaEaPxaXo?t=4',
          },
          {
            type: 'all',
            title: 'Install Agent Locally',
            subTitle: '',
            img: io_scene4,
            url: 'https://youtu.be/e-HTtN7JKJU',
          },
        ]

    return {
      isDomesticStation,
      bannerImg: this.$i18n.locale === 'en' ? plan_banner : plan_banner_cn,
      userInfo: '',
      //云市场
      aliyunMaketVisible: false,
      createList: [
        {
          name: $t('agent_manage'),
          desc: $t('workbench_agent_desc'),
          btnName: $t('public_agent_button_create'),
          action: this.createAgent,
          icon: 'dashboard-agent',
        },
        {
          name: $t('connection_manage'),
          desc: $t('workbench_connection_desc'),
          btnName: $t('public_connection_button_create'),
          action: this.createConnection,
          icon: 'dashboard-connection',
        },
        {
          name: $t('task_manage'),
          desc: $t('workbench_task_desc'),
          btnName: $t('workbench_task_button_create'),
          action: this.createTask,
          icon: 'dashboard-task',
        },
      ], // 创建列表
      agentList: [
        {
          name: $t('workbench_overview_connection'),
          key: 'connection',
          icon: 'connection',
          value: 0,
          list: [
            {
              label: $t('workbench_overview_connection_ready'),
              value: 0,
            },
            {
              label: $t('workbench_overview_connection_invalid'),
              value: 0,
            },
          ],
        },
        {
          name: $t('workbench_overview_task'),
          key: 'task',
          icon: 'task',
          value: 0,
          list: [
            {
              label: $t('public_task_type_initial_sync'),
              value: 0,
            },
            {
              label: $t('public_task_type_cdc'),
              value: 0,
            },
            {
              label: $t('public_task_type_initial_sync_and_cdc'),
              value: 0,
            },
          ],
        },
        {
          name: 'Agent',
          key: 'agent',
          icon: 'agent',
          value: 0,
          list: [
            {
              label: $t('public_status_running'),
              value: 0,
              class: 'success',
            },
            {
              label: $t('public_agent_status_offline'),
              value: 0,
              class: 'error',
            },
          ],
        },
      ], // 介绍列表
      notices: [], // 公告列表
      guides: [
        {
          name: $t('workbench_guide_documentation'),
          url: 'https://www.yuque.com/tapdata/cloud/chan-pin-jian-jie_readme',
        },
        {
          name: $t('workbench_guide_problem'),
          url: 'https://www.yuque.com/tapdata/cloud/iff88o',
        },
        {
          name: $t('workbench_guide_data_safe'),
          url: 'https://www.yuque.com/tapdata/cloud/chan-pin-jian-jie_chan-pin-jia-gou-ji-yuan-li',
        },
      ],
      isGuide: true,
      taskInputNumber: 0,
      barData: [],
      lineDataX: [],
      lineDataY: [],
      colorList: ['rgba(44, 101, 255, 0.85)', 'rgba(44, 101, 255, 0.5)'],
      showUpgrade: false, //版本升级弹窗
      //探索实例
      examplesList,
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    UpgradeDialog,
    ...mapMutations(['setUpgradeFeeVisible']),
    init() {
      this.loadAgent() // agent
      this.getConnectionStats() // 任务
      this.getTaskStats() // 任务
      this.loadNotices() // 通知公告
      this.loadBarData()
      //获取cookie 是否用户有操作过 稍后部署 且缓存是当前用户 不在弹窗
      const user = window.__USER_INFO__
      this.userInfo = user
      //检查是云市场用户授权码有效期
      // if (user?.enableLicense) {
      //   this.checkLicense(user)
      // }
    },
    loadAgent() {
      const agent = this.agentList.find(({ key }) => key === 'agent')
      const loading = this.$loading({
        target: this.$refs.agent?.[0],
      })
      this.$axios
        .get('api/tcm/agent/agentCount')
        .then((data) => {
          agent.value = data.agentTotalCount || 0
          agent.list[0].value = data.agentRunningCount || 0
          agent.list[1].value = agent.value - agent.list[0].value
        })
        .finally(() => {
          loading.close()
        })
    },
    // 获取连接数据
    async getConnectionStats() {
      const connectionLoading = this.$loading({
        target: this.$refs.connection?.[0],
      })
      const data = await connectionsApi.getStats().finally(() => {
        connectionLoading.close()
      })
      const connection = this.agentList.find(({ key }) => key === 'connection')
      const stats = data || {}
      if (stats) {
        connection.value = stats.total
        connection.list[0].value = stats.ready || 0
        connection.list[1].value = stats.invalid || 0
      }
    },
    // 获取任务数据
    async getTaskStats() {
      const taskLoading = this.$loading({
        target: this.$refs.task?.[0],
      })
      const data = await taskApi.getStats().finally(() => {
        taskLoading.close()
      })
      const task = this.agentList.find(({ key }) => key === 'task')
      const stats = data.taskTypeStats
      if (stats) {
        task.value = stats.total
        task.list[0].value = stats.initial_sync || 0
        task.list[1].value = stats.cdc || 0
        task.list[2].value = stats['initial_sync+cdc'] || 0
      }
    },
    loadNotices() {
      this.notices = this.isDomesticStation
        ? [
            {
              id: 31,
              handle: 'UpgradeDialog',
              icon: 'version-rocket',
              name: i18n.t('dfs_service_upgrade_notice'),
              time: '2024-7-22 22:00',
            },
            {
              id: '3.18.0',
              name: 'Tapdata Cloud 3.18.0 Release Notes',
              link: 'https://tapdata.net/cloud_release_notes_3-18-0.html',
              time: '2024-11-29 21:00',
            },
            {
              id: '3.17.0',
              name: 'Tapdata Cloud 3.17.0 Release Notes',
              link: 'https://tapdata.net/cloud_release_notes_3-17-0.html',
              time: '2024-11-15 21:00',
            },
            {
              id: '3.16.0',
              name: 'Tapdata Cloud 3.16.0 Release Notes',
              link: 'https://tapdata.net/cloud_release_notes_3-16-0.html',
              time: '2024-10-30 21:00',
            },
            {
              id: '3.15.0',
              name: 'Tapdata Cloud 3.15.0 Release Notes',
              link: 'https://tapdata.net/cloud_release_notes_3-15-0.html',
              time: '2024-10-17 21:00',
            },
            {
              id: '3.14.0',
              name: 'Tapdata Cloud 3.14.0 Release Notes',
              link: 'https://tapdata.net/cloud_release_notes_3-14-0.html',
              time: '2024-10-10 21:00',
            },
            {
              id: '3.13.0',
              name: 'Tapdata Cloud 3.13.0 Release Notes',
              link: 'https://tapdata.net/cloud_release_notes_3-13-0.html',
              time: '2024-9-20 21:00',
            },
            {
              id: '3.12.0',
              name: 'Tapdata Cloud 3.12.0 Release Notes',
              link: 'https://tapdata.net/cloud_release_notes_3-12-0.html',
              time: '2024-8-21 21:00',
            },
            {
              id: '3.11.0',
              name: 'Tapdata Cloud 3.11.0 Release Notes',
              link: 'https://tapdata.net/cloud_release_notes_3-11-0.html',
              time: '2024-8-6 21:00',
            },
            {
              id: '3.10.0',
              name: 'Tapdata Cloud 3.10.0 Release Notes',
              link: 'https://tapdata.net/cloud_release_notes_3-10-0.html',
              time: '2024-7-20 21:00',
            },
            {
              id: '3.9.0',
              name: 'Tapdata Cloud 3.9.0 Release Notes',
              link: 'https://tapdata.net/cloud_release_notes_3-9-0.html',
              time: '2024-7-5 21:00',
            },
            {
              id: 30,
              name: 'Tapdata Cloud 3.8.0 Release Notes',
              link: 'https://tapdata.net/cloud_release_notes_3-8-0.html',
              time: '2024-6-20 21:00',
            },
            {
              id: 29,
              type: '',
              name: 'Tapdata Cloud 3.7.0 Release Notes',
              link: 'https://tapdata.net/cloud_release_notes_3-7-0.html',
              time: '2024-6-4 21:00',
            },
            {
              id: 28,
              type: '',
              name: 'Tapdata Cloud 3.6.0 Release Notes',
              link: 'https://tapdata.net/cloud_release_notes_3-6-0.html',
              time: '2024-5-21 21:00',
            },
            {
              id: 27,
              type: '',
              name: 'Tapdata Cloud 3.5.16 Release Notes',
              link: 'https://tapdata.net/cloud_release_notes_3-5-16.html',
              time: '2024-5-9 21:00',
            },
            {
              id: 26,
              type: '',
              name: 'Tapdata Cloud 3.5.15 Release Notes',
              link: 'https://tapdata.net/cloud_release_notes_3-5-15.html',
              time: '2024-4-24 21:00',
            },
            {
              id: 25,
              type: '',
              name: 'Tapdata Cloud 3.5.14 Release Notes',
              link: 'https://tapdata.net/cloud_release_notes_3-5-14.html',
              time: '2024-4-19 21:00',
            },
            {
              id: 24,
              type: '',
              name: 'Tapdata Cloud 3.5.13 Release Notes',
              link: 'https://tapdata.net/cloud_release_notes_3-5-13.html',
              time: '2024-3-28 21:00',
            },
            {
              id: 23,
              type: '',
              name: 'Tapdata Cloud 3.5.12 Release Notes',
              link: 'https://tapdata.net/cloud_release_notes_3-5-12.html',
              time: '2024-3-18 21:00',
            },
            {
              id: 22,
              type: '',
              name: 'Tapdata Cloud 3.5.11 Release Notes',
              link: 'https://tapdata.net/cloud_release_notes_3-5-11.html',
              time: '2024-2-15 21:00',
            },
            {
              id: 21,
              type: '',
              name: 'Tapdata Cloud 3.5.9 Release Notes',
              link: 'https://tapdata.net/cloud_release_notes_3-5-9.html',
              time: '2023-12-25 21:00',
            },
            {
              id: 20,
              type: '',
              name: 'Tapdata Cloud 3.5.8 Release Notes',
              link: 'https://tapdata.net/cloud_release_notes_3-5-8.html',
              time: '2023-12-08 21:00',
            },
            {
              id: 19,
              type: '',
              name: 'Tapdata Cloud 3.5.7 Release Notes',
              link: 'https://tapdata.net/cloud_release_notes_3-5-7.html',
              time: '2023-11-24 21:00',
            },
            {
              id: 18,
              type: '',
              name: 'Tapdata Cloud 3.5.6 Release Notes',
              link: 'https://tapdata.net/cloud_release_notes_3-5-6.html',
              time: '2023-11-07 21:00',
            },
            {
              id: 17,
              type: '',
              name: 'Tapdata Cloud 3.5.5 Release Notes',
              link: 'https://tapdata.net/cloud_release_notes_3-5-5.html',
              time: '2023-10-24 21:00',
            },
            {
              id: 16,
              type: '',
              name: 'Tapdata Cloud 3.5.4 Release Notes',
              link: 'https://tapdata.net/cloud_release_notes_3-5-4.html',
              time: '2023-10-12 21:00',
            },
            {
              id: 15,
              type: '',
              name: 'Tapdata Cloud 3.5.2 Release Notes',
              link: 'https://tapdata.net/cloud_release_notes_3-5-2.html',
              time: '2023-09-21 21:00',
            },
            {
              id: 14,
              type: '',
              name: 'Tapdata Cloud 3.5.1 Release Notes',
              link: 'https://tapdata.net/cloud_release_notes_3-5-1.html',
              time: '2023-08-28 21:00',
            },
            {
              id: 13,
              type: '',
              name: 'Tapdata Cloud 3.4 Release Notes',
              link: 'https://tapdata.net/cloud_release_notes_3-4.html',
              time: '2023-08-15 21:00',
            },
            {
              id: 12,
              type: '',
              name: 'Tapdata Cloud 3.2.6 Release Notes',
              link: 'https://tapdata.net/cloud_release_notes_3-2-6.html',
              time: '2023-07-31 21:00',
            },
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
          ]
        : [
            {
              id: 31,
              handle: 'UpgradeDialog',
              icon: 'version-rocket',
              name: i18n.t('dfs_service_upgrade_notice'),
              time: '2024-7-22 22:00',
            },
            {
              id: '3.18.0',
              name: 'Tapdata Cloud 3.18.0 Release Notes',
              link: 'https://tapdata.io/blog/tapdata-cloud-3-18-0',
              time: '2024-11-29 21:00',
            },
            {
              id: '3.17.0',
              name: 'Tapdata Cloud 3.17.0 Release Notes',
              link: 'https://tapdata.io/blog/tapdata-cloud-3-17-0',
              time: '2024-11-15 21:00',
            },
            {
              id: '3.16.0',
              name: 'Tapdata Cloud 3.16.0 Release Notes',
              link: 'https://tapdata.io/blog/tapdata-cloud-3-16-0',
              time: '2024-10-30 21:00',
            },
            {
              id: '3.15.0',
              name: 'Tapdata Cloud 3.15.0 Release Notes',
              link: 'https://tapdata.io/blog/tapdata-cloud-3-15-0',
              time: '2024-10-17 21:00',
            },
            {
              id: '3.14.0',
              name: 'Tapdata Cloud 3.14.0 Release Notes',
              link: 'https://tapdata.io/blog/tapdata-cloud-3-14-0',
              time: '2024-10-10 21:00',
            },
            {
              id: '3.13.0',
              name: 'Tapdata Cloud 3.13.0 Release Notes',
              link: 'https://tapdata.io/blog/tapdata-cloud-3-13-0',
              time: '2024-9-20 21:00',
            },
            {
              id: '3.12.0',
              name: 'Tapdata Cloud 3.12.0 Release Notes',
              link: 'https://tapdata.io/blog/tapdata-cloud-3-12-0',
              time: '2024-8-21 21:00',
            },
            {
              id: '3.11.0',
              name: 'Tapdata Cloud 3.11.0 Release Notes',
              link: 'https://tapdata.io/blog/tapdata-cloud-3-11-0',
              time: '2024-8-6 21:00',
            },
            {
              id: '3.10.0',
              name: 'Tapdata Cloud 3.10.0 Release Notes',
              link: 'https://tapdata.io/blog/tapdata-cloud-3-10-0',
              time: '2024-7-20 21:00',
            },
            {
              id: '3.9.0',
              name: 'Tapdata Cloud 3.9.0 Release Notes',
              link: 'https://tapdata.io/blog/tapdata-cloud-3-9-0',
              time: '2024-7-5 21:00',
            },
            {
              id: 30,
              name: 'Tapdata Cloud 3.8.0 Release Notes',
              link: 'https://tapdata.io/blog/tapdata-cloud-3-8-0',
              time: '2024-6-20 21:00',
            },
            {
              id: 29,
              type: '',
              name: 'Tapdata Cloud 3.7.0 Release Notes',
              link: 'https://tapdata.io/blog/tapdata-cloud-3-7-0',
              time: '2024-6-4 21:00',
            },
            {
              id: 28,
              type: '',
              name: 'Tapdata Cloud 3.6.0 Release Notes',
              link: 'https://tapdata.io/blog/tapdata-cloud-3-6-0',
              time: '2024-5-21 21:00',
            },
            {
              id: 27,
              type: '',
              name: 'Tapdata Cloud 3.5.16 Release Notes',
              link: 'https://tapdata.io/blog/tapdata-cloud-3-5-16',
              time: '2024-5-9 21:00',
            },
            {
              id: 26,
              type: '',
              name: 'Tapdata Cloud 3.5.15 Release Notes',
              link: 'https://tapdata.io/blog/tapdata-cloud-3-5-15/',
              time: '2024-4-24 21:00',
            },
            {
              id: 25,
              type: '',
              name: 'Tapdata Cloud 3.5.14 Release Notes',
              link: 'https://tapdata.io/blog/tapdata-cloud-3-5-14/',
              time: '2024-4-19 21:00',
            },
            {
              id: 24,
              type: '',
              name: 'Tapdata Cloud 3.5.13 Release Notes',
              link: 'https://tapdata.io/blog/tapdata-cloud-3-5-13/',
              time: '2024-3-28 21:00',
            },
            {
              id: 23,
              type: '',
              name: 'Tapdata Cloud 3.5.12 Release Notes',
              link: 'https://tapdata.io/blog/tapdata-cloud-3-5-12/',
              time: '2024-3-18 21:00',
            },
            {
              id: 22,
              type: '',
              name: 'Tapdata Cloud 3.5.11 Release Notes',
              link: 'https://tapdata.io/blog/tapdata-cloud-3-5-11/',
              time: '2024-2-15 21:00',
            },
            {
              id: 21,
              type: '',
              name: 'Tapdata Cloud 3.5.9 Release Notes',
              link: 'https://tapdata.io/release-notes/tapdata-cloud-3-5-9/',
              time: '2023-12-25 21:00',
            },
            {
              id: 20,
              type: '',
              name: 'Tapdata Cloud 3.5.8 Release Notes',
              link: 'https://tapdata.io/release-notes/tapdata-cloud-3-5-8/',
              time: '2023-12-08 21:00',
            },
            {
              id: 19,
              type: '',
              name: 'Tapdata Cloud 3.5.7 Release Notes',
              link: 'https://tapdata.io/release-notes/tapdata-cloud-3-5-7/',
              time: '2023-11-24 21:00',
            },
            {
              id: 18,
              type: '',
              name: 'Tapdata Cloud 3.5.6 Release Notes',
              link: 'https://tapdata.io/release-notes/tapdata-cloud-3-5-6/',
              time: '2023-11-07 21:00',
            },
            {
              id: 17,
              type: '',
              name: 'Tapdata Cloud 3.5.5 Release Notes',
              link: 'https://tapdata.io/release-notes/tapdata-cloud-3-5-5/',
              time: '2023-10-24 21:00',
            },
            {
              id: 16,
              type: '',
              name: 'Tapdata Cloud 3.5.4 Release Notes',
              link: 'https://tapdata.io/release-notes/tapdata-cloud-3-5-4-release-notes/',
              time: '2023-10-12 21:00',
            },
            {
              id: 15,
              type: '',
              name: 'Tapdata Cloud 3.5.2 Release Notes',
              link: 'https://tapdata.io/release-notes/tapdata-cloud-3-5-2-release-notes/',
              time: '2023-09-21 21:00',
            },
            {
              id: 14,
              type: '',
              name: 'Tapdata Cloud 3.5.1 Release Notes',
              link: 'https://tapdata.io/release-notes/tapdata-cloud-3-5-1-release-notes/',
              time: '2023-08-28 21:00',
            },
            {
              id: 13,
              type: '',
              name: 'Tapdata Cloud 3.4 Release Notes',
              link: 'https://tapdata.io/release-notes/tapdata-cloud-3-4-release-notes/',
              time: '2023-08-15 21:00',
            },
            {
              id: 12,
              type: '',
              name: 'Tapdata Cloud 3.2.6 Release Notes',
              link: 'https://tapdata.io/release-notes/tapdata-cloud-3-2-6-release-notes/',
              time: '2023-07-31 21:00',
            },
          ]
    },
    loadBarData() {
      const granularity = 'month'
      this.$axios
        .get('tm/api/DataFlowInsights/statistics', {
          params: {
            granularity,
          },
        })
        .then((data) => {
          const list = data.inputDataStatistics || []
          this.taskInputNumber = (
            data.totalInputDataCount || 0
          ).toLocaleString()
          this.lineDataX = list.map((el) => el.time)
          this.lineDataY = list.map((el) => {
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
        name: 'createAgent',
      })
      this.buried('newAgentStripeDialog')
    },
    async createTask() {
      this.checkAgent(() => {
        this.$router.push({
          name: 'MigrateCreate',
        })
      })
    },
    createConnection() {
      $emit(this.$root, 'select-connection-type')
    },
    toNotice(item) {
      if (item?.id === 1) {
        //当前页弹窗
        this.showUpgrade = true
      } else if (item?.link) {
        window.open(item.link)
      } else if (item.handle) {
        this[item.handle]?.(this)
      } else {
        this.$router.push({
          name: 'WorkbenchNotice',
          query: {
            id: item?.id,
          },
        })
      }
    },
    clickGuide(item) {
      if (item.action) {
        $emit(this.$root, 'show-guide')
        return
      }
      window.open(item.url, '_blank')
    },

    //获取探索示例-背景图
    getImg(name) {
      return new URL(`/images/dashboard/${name}.svg`, import.meta.url).href
    },
    goScenes(url) {
      window.open(url)
    },
    //图表数据组装
    getPieOption(index) {
      const item = this.agentList[index]
      const data = [
        {
          itemStyle: {
            color: '#2C65FF',
          },
          value: item.list[0].value,
          name: item.list[0].label,
        },
        {
          itemStyle: {
            color: '#F3961A',
          },
          value: item.list[1].value,
          name: item.list[1].label,
        },
      ]

      if (item.key === 'task') {
        const node = {
          itemStyle: {
            color: '#0FC6C2',
          },
          value: item.list[2].value,
          name: item.list[2].label,
        }
        data.push(node)
      }
      return {
        tooltip: {
          trigger: 'item',
        },
        series: [
          {
            type: 'pie',
            labelLine: {
              show: false,
            },
            label: {
              show: false,
              position: 'center',
            },
            avoidLabelOverlap: false,
            data,
            radius: ['50%', '70%'],
          },
        ],
      }
    },
    //折线面积图
    getLineOption() {
      return {
        grid: {
          top: 20,
          bottom: 20,
          left: 55,
          right: 20,
        },
        xAxis: {
          boundaryGap: false,
          axisLabel: {
            formatter: (val) => {
              return this.formatTime(val, '', 'MM-DD')
            },
          },
          data: this.lineDataX,
        },
        yAxis: {
          show: true,
          type: 'log',
          min: 1,
          logBase: 10,
          axisLabel: {
            formatter: (val) => {
              let res = val === 1 ? 0 : val
              if (res / 1000 >= 1) {
                res = `${res / 1000}K`
              }
              return res
            },
          },
        },
        tooltip: {
          trigger: 'item',
          formatter: (params) => {
            const item = params
            let val = item.value
            if (val === 1.1) {
              val = 1
            }
            val = val.toLocaleString()
            const html = val
            return html
          },
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
                    color: 'rgba(0, 102, 255, 0.2)', // 0% 处的颜色
                  },
                  {
                    offset: 1,
                    color: 'rgba(44, 127, 252, 0)', // 100% 处的颜色
                  },
                ],
                global: false, // 缺省为 false
              },
            },
            color: '#2C65FF', //线条颜色
          },
        ],
      }
    },

    //检查云市场用户授权码是否过期
    checkLicense(user) {
      const licenseCodes = user?.licenseCodes || []
      //是否有临近过期授权码
      const verify = licenseCodes.filter((it) => it.nearExpiration)
      if (user?.licenseValid && verify?.length > 0) {
        //授权码可用 存在有临近授权码
        this.aliyunMaketVisible = true
        this.userInfo = {
          showNextProcessing: true,
          licenseType: 'checkCode',
          data: verify,
        }
      }
    },
  },
  emits: ['select-connection-type', 'show-guide'],
}
</script>

<template>
  <div class="workbench-container overflow-hidden flex flex-column">
    <ElRow type="flex" :gutter="16" class="align-items-stretch mb-4">
      <ElCol :span="18">
        <!--探索示例-->
        <div
          class="workbench-overview workbench-section bg-white rounded-xl p-4 shadow-sm h-100"
        >
          <div class="main-title mb-4">
            {{ $t('_workbench_workbench_tansuoshili') }}
          </div>
          <ul class="flex flex-row overflow-x-auto gap-4">
            <li
              v-for="(item, index) in examplesList"
              :key="index"
              class="cursor-pointer"
              @click="goScenes(item.url)"
            >
              <div class="position-relative">
                <ElImage class="scene-img" :src="item.img" />
                <div
                  class="position-absolute position-text flex justify-content-center align-items-center flex-column fs-8 py-2"
                  style="min-height: 40px"
                >
                  <div
                    v-if="item.title"
                    class="text-center explore-examples-ellipsis pl-1 pr-1"
                  >
                    {{ item.title }}
                  </div>
                  <div
                    v-if="item.subTitle"
                    class="text-center explore-examples-ellipsis"
                  >
                    {{ item.subTitle }}
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </ElCol>
      <ElCol :span="6">
        <div class="bg-white rounded-xl p-4 shadow-sm h-100">
          <div class="main-title mb-4">Welcome to Tapdata</div>
          <div class="clickable" @click="setUpgradeFeeVisible(true)">
            <ElImage :src="bannerImg" />
          </div>
        </div>
      </ElCol>
    </ElRow>

    <ElRow type="flex" :gutter="16" class="min-h-0">
      <ElCol :span="18">
        <!--概览	-->
        <div class="bg-white rounded-xl p-4 shadow-sm">
          <div class="main-title mb-4">{{ $t('workbench_overview') }}</div>
          <div class="section-body">
            <ul class="agent-list__list flex">
              <li
                v-for="(item, index) in agentList"
                :key="index"
                :ref="item.key"
                class="agent-list__item px-4 py-6"
              >
                <div
                  class="agent-list__name flex align-items-center mx-auto mb-3"
                >
                  <VIcon size="16" class="icon">{{ item.icon }}</VIcon>
                  <span class="ml-1 fs-6">{{ item.name }}</span>
                </div>
                <div class="fs-1">
                  {{ item.value }}
                </div>
                <div
                  v-if="item.list.length > 0"
                  class="flex justify-content-between align-items-center mt-3 px-1"
                >
                  <div class="flex flex-column gap-2">
                    <div v-for="(detail, dIndex) in item.list" :key="dIndex">
                      <span>{{ detail.label }}</span>
                      <span>:</span>
                      <span :class="['ml-1']">{{ detail.value }}</span>
                    </div>
                  </div>
                  <div style="height: 80px; width: 80px">
                    <Chart
                      ref="lineChart"
                      type="pie"
                      :extend="getPieOption(index)"
                    />
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </ElCol>
      <ElCol :span="6" class="mh-100">
        <div class="bg-white rounded-xl p-4 shadow-sm mh-100 flex flex-column">
          <div class="aside-title mb-4">{{ $t('workbench_notice') }}</div>
          <div class="notice-list flex-grow-1 min-h-0 overflow-y-auto">
            <ul class="notice-list__list">
              <li
                v-for="(item, index) in notices"
                :key="index"
                class="notice-list__item flex align-items-center mb-4 px-1 pointer"
              >
                <div v-if="item.icon" class="">
                  <VIcon size="18">{{ item.icon }}</VIcon>
                </div>
                <div v-if="item.type" class="notice-list__type mr-4 p-1">
                  {{ item.type }}
                </div>
                <ElLink
                  v-else
                  class="notice-list__name flex-grow-1 ellipsis block pointer"
                  @click="toNotice(item)"
                >
                  {{ item.name }}
                </ElLink>
                <div class="notice-list__time font-color-sslight">
                  {{ fromNow(item.time) }}
                </div>
              </li>
            </ul>
          </div>
        </div>
      </ElCol>
    </ElRow>

    <!-- 版本升级弹窗-->
    <el-dialog
      v-model="showUpgrade"
      class="dialog-upgrade"
      :title="$t('dfs_workbench_workbench_banbenshengjitong')"
      width="670px"
    >
      <div class="dialog-upgrade__text">
        <div>
          <p class="mb-2">
            {{ $t('dfs_workbench_workbench_zunjingdeyonghu') }}
          </p>
          <p class="mb-2">{{ $t('dfs_workbench_workbench_zainianyueriwo') }}</p>
          <p>{{ $t('dfs_workbench_workbench_youyuzengjiale') }}</p>
          <p>{{ $t('dfs_workbench_workbench_dangranruguoyou') }}</p>
        </div>
        <p class="mb-2 mt-2 dialog-upgrade__text__header">
          {{ $t('dfs_workbench_workbench_xiamianshixinban') }}
        </p>
        <p class="mt-4 mb-2 dialog-upgrade__text__header">
          {{ $t('dfs_workbench_workbench_jiyuPdk2') }}
        </p>
        <ul>
          <li>{{ $t('dfs_workbench_workbench_jiyuPdk') }}</li>
          <li>{{ $t('dfs_workbench_workbench_yonghukeanzhao') }}</li>
          <li>{{ $t('dfs_workbench_workbench_xinkaifadeshu') }}</li>
        </ul>
        <p class="mt-4 mb-2 dialog-upgrade__text__header">
          {{ $t('dfs_workbench_workbench_quanlianghezengliang') }}
        </p>
        <ul>
          <li>{{ $t('dfs_workbench_workbench_jubeiduishuju3') }}</li>
          <li>{{ $t('dfs_workbench_workbench_jubeiduishuju2') }}</li>
          <li>{{ $t('dfs_workbench_workbench_jubeiduishuju') }}</li>
        </ul>
        <p class="mt-4 mb-2 dialog-upgrade__text__header">
          {{ $t('dfs_workbench_workbench_renwukeguance') }}
        </p>
        <ul>
          <li>{{ $t('dfs_workbench_workbench_renwuzhibiaoke') }}</li>
          <li>{{ $t('dfs_workbench_workbench_renwurizhike') }}</li>
          <li>{{ $t('dfs_workbench_workbench_renwugaojingneng') }}</li>
        </ul>
        <p class="mt-4 mb-2 dialog-upgrade__text__header">
          {{ $t('dfs_workbench_workbench_shujutongbuneng') }}
        </p>
        <ul>
          <li>{{ $t('dfs_workbench_workbench_xinzengdongtaixin') }}</li>
          <li>{{ $t('dfs_workbench_workbench_xinzengDdl') }}</li>
          <li>{{ $t('dfs_workbench_workbench_xinzengzidingyi2') }}</li>
          <li>{{ $t('dfs_workbench_workbench_xinzengzidingyi') }}</li>
        </ul>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="showUpgrade = false">{{
            $t('public_button_cancel')
          }}</el-button>
        </span>
      </template>
    </el-dialog>
    <!--<CheckLicense :visible.sync="aliyunMaketVisible" :user="userInfo"></CheckLicense>-->
  </div>
</template>

<style lang="scss" scoped>
.workbench-container {
  height: 100%;
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
  font-weight: 500;
}

// 快速开始
.create-list__item {
  width: 276px;
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
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
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

.agent-list__list {
  background: var(--color-white);
}

.agent-list__item {
  width: 33%;
  border-radius: 8px;
  margin-right: 16px;
  padding: 16px;
  background-color: #f5f7fa;
  color: var(--text-dark);
}

.agent-list__item:last-child {
  margin-right: 0;
}

.agent-list__name {
  .vicon {
    color: var(--text-dark);
  }
}

.agent-list__detail {
  width: 232px;
  background-color: #fafafb;
  color: var(--text-light);

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
  text-align: right;
}

.guide-list {
  height: 190px;
}

.dialog-upgrade__text {
  font-size: 12px;
  color: var(--text-light);
}

.dialog-upgrade__text__header {
  font-size: 14px;
  color: var(--text-normal);
}

.dialog-upgrade {
  :deep(.el-dialog__body) {
    padding: 0 20px;
  }
}

.notice-list {
  //height: 190px;
  border-radius: 8px;

  .notice-list__list {
    .notice-list__item:last-child {
      margin-bottom: 0 !important;
    }
  }
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
  color: var(--color-white);
  width: 100%;
  line-height: 14px;
}

.explore-examples-ellipsis {
  /* white-space: nowrap; */
  overflow: hidden;
  text-overflow: ellipsis;
}

.position-sub-text {
  top: 33px;
  left: 52px;
  color: var(--color-white);
}

.quick-start-button {
  padding: 4px 15px;
  border-radius: 5px;
}

.scene-img {
  width: 161px;
  height: 92px;
}

.welcome-banner {
  height: 76px;
  background: linear-gradient(
    90deg,
    rgba(22, 73, 255, 0.8) 0%,
    rgba(50, 102, 244, 0.8) 39.58%,
    rgba(79, 50, 255, 0.8) 100%
  );

  .el-image {
    height: 50px;
  }
}
</style>
