<template>
  <div v-if="$route.name === 'Workbench'" class="workbench-container px-8">
    <!--	快速开始	-->
    <div class="workbench-start workbench-section">
      <el-row :gutter="40" class="section-header py-6">
        <el-col :span="18" class="main-title fs-6 fw-bolder">快速开始</el-col>
        <el-col :span="6" class="aside-title fs-6 fw-bolder">公告通知</el-col>
      </el-row>
      <el-row :gutter="40" class="section-body">
        <el-col :span="6" v-for="(item, index) in createList" :key="index">
          <div class="create-list__item flex p-6">
            <div class="create-list__index block flex justify-center align-center flex-shrink-0">
              {{ index + 1 }}
            </div>
            <div class="create-list__main ml-4">
              <div class="create-list__name mb-4 fs-7">{{ item.name }}</div>
              <div class="create-list__desc">{{ item.desc }}</div>
              <div class="create-list__btn text-end pointer" @click="item.action">
                <span>{{ item.btnName }}</span>
                <VIcon class="ml-2" size="12">arrowright</VIcon>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="aside-main notice-list flex-grow-1 p-6">
            <ul class="notice-list__list">
              <li
                v-for="(item, index) in notices.slice(0, 5)"
                :key="index"
                class="notice-list__item flex align-center py-3 px-1 pointer"
              >
                <div v-if="item.type" class="notice-list__type mr-4 p-1">
                  {{ item.type }}
                </div>
                <div class="notice-list__name flex-grow-1 ellipsis pointer" @click="toNotice">
                  {{ item.name }}
                </div>
                <div class="notice-list__time">
                  {{ formatFromNow(item.time) }}
                </div>
              </li>
            </ul>
          </div>
        </el-col>
      </el-row>
    </div>
    <!--	概览	-->
    <div class="workbench-overview workbench-section">
      <el-row :gutter="40" class="section-header py-6">
        <el-col :span="18" class="main-title fs-6 fw-bolder">概览</el-col>
        <el-col :span="6" class="aside-title fs-6 fw-bolder">新手入门</el-col>
      </el-row>
      <el-row :gutter="40" class="section-body">
        <el-col :span="18">
          <ul class="agent-list__list flex-grow-1 flex justify-around">
            <li v-for="(item, index) in agentList" :key="index" class="agent-list__item p-6" :ref="item.key">
              <div class="agent-list__name flex align-center justify-center mx-auto mb-3">
                <VIcon size="12" class="icon" color="#888">{{ item.icon }}</VIcon>
                <span class="ml-1 fs-7">{{ item.name }}</span>
              </div>
              <div class="agent-list__value text-center fs-1">
                {{ item.value }}
              </div>
              <div class="agent-list__detail flex flex-wrap justify-around mt-3 py-2 px-1">
                <div v-for="(detail, dIndex) in item.list" :key="dIndex" class="agent-list__status mr-2">
                  <span>{{ detail.label }}</span>
                  <span>:</span>
                  <span :class="['ml-1', { success: detail.value === '运行中' }, { error: detail.value === '离线' }]">{{
                    detail.value
                  }}</span>
                </div>
              </div>
            </li>
          </ul>
        </el-col>
        <el-col :span="6">
          <div class="aside-main guide-list flex-grow-1 p-6">
            <ul class="guide-list__list pt-3">
              <li
                v-for="(item, index) in guides"
                :key="index"
                class="guide-list__item flex mb-4 pointer"
                @click="clickGuide(item)"
              >
                <div class="guide-list__name">
                  {{ item.name }}
                </div>
              </li>
            </ul>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
  <router-view v-else></router-view>
</template>

<script>
import VIcon from '@/components/VIcon'

export default {
  name: 'Workbench',
  components: { VIcon },
  data() {
    return {
      createList: [
        {
          name: 'Agent管理',
          // icon: 'account',
          icon: 'agent',
          title: '部署Agent，并对已有Agent的状态进行查看和管理',
          desc:
            '欢迎来到Tapdata Cloud，即将开启您的实时数据同步之旅！初次使用请先安装部署Agent，不然无法创建连接和任务哦。',
          btnName: '部署Agent',
          hiddenBtnIcon: true,
          action: this.createAgent
        },
        {
          name: '连接管理',
          icon: 'connection',
          title: '创建数据连接，并对已有数据连接的状态进行测试和管理',
          desc:
            '数据连接主要用来建立Agent与用户源数据库和目标数据库的连接。快来创建数据连接，并对已有数据连接的状态进行测试和管理吧。',
          btnName: '创建连接',
          action: this.createConnection
        },
        {
          name: '任务管理',
          icon: 'task',
          title: '创建数据同步任务，并对已有数据同步任务的类型和状态进行查看和管理',
          desc:
            '任务管理主要用来创建同步任务并进行管理。快来创建数据同步任务，并对已有数据同步任务的类型和状态进行查看和管理吧。',
          btnName: '创建任务',
          action: this.createTask
        }
      ], // 创建列表
      agentList: [
        {
          name: 'Agent',
          key: 'agent',
          icon: 'agent',
          value: 1,
          list: [
            {
              label: 'Agent状态',
              value: '离线'
            }
          ]
        },
        {
          name: '连接',
          key: 'connection',
          icon: 'connection',
          value: 0,
          list: [
            {
              label: '有效连接',
              value: 0
            },
            {
              label: '无效连接',
              value: 0
            }
          ]
        },
        {
          name: '任务',
          key: 'task',
          icon: 'task',
          value: 0,
          list: [
            {
              label: '全量',
              value: 0
            },
            {
              label: '增量',
              value: 0
            },
            {
              label: '全量增量',
              value: 0
            }
          ]
        }
      ],
      introductionList: [
        {
          name: '什么是Tapdata Cloud',
          title: [
            'Tapdata Cloud是由Tapdata提供的集数据同步、数据融合（即将上线）、数据服务（即将上线）为一体的实时数据融合服务'
            // 'Tapdata提供的集数据同步、数据融合（即将上线）、数据服务（即将上线）为一体实时数据融合服务'
          ],
          icon: 'introduction_1',
          url: 'https://www.yuque.com/tapdata/cloud/chan-pin-jian-jie_shen-me-shi-dfs'
        },
        {
          name: '产品架构及工作原理',
          title: ['-Tapdata cloud manager', '-Tapdata agent'],
          icon: 'introduction_2',
          url: 'https://www.yuque.com/tapdata/cloud/chan-pin-jian-jie_chan-pin-jia-gou-ji-yuan-li'
        },
        {
          name: '产品优势',
          title: ['-创新的实时数据同步技术', '-零代码可视化拖拽操作', '-完美支持SQL->NOSQL', '-全面的数据库支持'],
          icon: 'introduction_3',
          url: 'https://www.yuque.com/tapdata/cloud/chan-pin-jian-jie_chan-pin-you-shi'
        },
        {
          name: '典型应用场景',
          title: ['-数据库现代化', '-不停机迁移数据库', '-数据异地灾备', '-异地多活'],
          icon: 'introduction_4',
          url: 'https://www.yuque.com/tapdata/cloud/chan-pin-jian-jie_dian-xing-ying-yong-chang-jing'
        }
      ], // 介绍列表
      notices: [], // 公告列表
      guides: [
        {
          name: '快速入门',
          icon: 'quick_to_start',
          url: 'https://www.yuque.com/tapdata/cloud/kuai-su-ru-men_readme'
        },
        {
          name: '产品文档',
          icon: 'document',
          url: 'https://www.yuque.com/tapdata/cloud/chan-pin-jian-jie_readme'
        }
      ],
      isGuide: true
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.loadAgent() // agent
      this.loadConnection() // 连接、任务
      this.loadNotices() // 通知公告
    },
    loadAgent() {
      let agentList = this.agentList
      let filter = {
        where: {},
        size: 1,
        page: 0,
        sort: ['createAt desc']
      }
      const loading = this.$loading({
        target: this.$refs.agent?.[0]
      })
      this.$axios
        .get('api/tcm/agent?filter=' + encodeURIComponent(JSON.stringify(filter)))
        .then(data => {
          agentList[0].list[0].value = data?.items?.[0]?.status === 'Running' ? '运行中' : '离线'
        })
        .finally(() => {
          loading.close()
        })
    },
    loadConnection() {
      let agentList = this.agentList
      const connectionLoading = this.$loading({
        target: this.$refs.connection?.[0]
      })
      const taskLoading = this.$loading({
        target: this.$refs.task?.[0]
      })
      this.$axios
        .get('tm/api/DataFlows/chart')
        .then(data => {
          // 连接
          const chart8 = data.chart8
          if (chart8) {
            agentList[1].value = chart8.total
            agentList[1].list[0].value = chart8.invalid
            agentList[1].list[1].value = chart8.ready
          }

          // 任务
          const chart9 = data.chart9
          if (chart9) {
            agentList[2].value = chart9.total
            agentList[2].list[0].value = chart9.initial_sync
            agentList[2].list[1].value = chart9.cdc
            agentList[2].list[2].value = chart9['initial_sync+cdc']
          }
        })
        .finally(() => {
          connectionLoading.close()
          taskLoading.close()
        })
    },
    loadNotices() {
      this.notices = [
        {
          id: 0,
          type: '',
          name: 'Tapdata Cloud上线公测',
          time: '2021-05-28'
        }
      ]
    },
    createAgent() {
      let downloadUrl = window.App.$router.resolve({
        name: 'FastDownload'
      })

      window.open(downloadUrl.href, '_blank')
    },
    createTask() {
      this.$emit('create-task')
    },
    createConnection() {
      this.$emit('select-connection-type')
    },
    toNotice() {
      this.$router.push({ name: 'WorkbenchNotice' })
    },
    clickIntro(item) {
      window.open(item.url, '_blank')
    },
    clickGuide(item) {
      window.open(item.url, '_blank')
    },
    formatFromNow(date) {
      return this.$moment(date)?.fromNow()
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
.main-title {
  height: 24px;
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
}
.create-list__name {
  color: #000;
}
.create-list__desc {
  height: 110px;
  color: rgba(0, 0, 0, 0.49);
}
.create-list__btn {
  color: map-get($color, primary);
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
.agent-list__value {
  color: map-get($color, primary);
}
.agent-list__detail {
  background-color: #fafafb;
  color: rgba(0, 0, 0, 0.5);
  .agent-list__status {
    white-space: nowrap;
    &:last-child {
      margin-right: 0 !important;
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
.notice-list__name {
  color: map-get($color, primary);
  //&:hover {
  //	color: map-get($color, primary);
  //}
}
.notice-list__time {
  color: rgba(0, 0, 0, 0.5);
}
.notice-footer {
  color: map-get($color, primary);
}
.guide-list {
  height: 190px;
}
.guide-list__name {
  color: map-get($color, primary);
}
</style>
