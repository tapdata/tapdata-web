<template>
  <div
    v-if="$route.name === 'Workbench'"
    class="workbench-container flex flex-column"
  >
    <!--  快速开始  -->
    <div class="workbench-start workbench-section flex">
      <div class="main flex-grow-1">
        <div class="main-header flex py-6">
          <div class="main-title mr-4 fs-6 fw-bolder">快速开始</div>
          <div class="main-subtitle py-1 px-4 fs-8 pointer">
            <VIcon class="icon mr-1" size="9">arrow_right</VIcon>
            <span>新手引导</span>
          </div>
        </div>
        <ul class="create-list__list flex justify-between">
          <li
            v-for="(item, index) in createList"
            :key="index"
            class="create-list__item flex p-6 ml-10"
          >
            <div
              class="create-list__index block flex justify-center align-center flex-shrink-0"
            >
              {{ index + 1 }}
            </div>
            <div class="create-list__main ml-4">
              <div class="create-list__name mb-4 fs-7">{{ item.name }}</div>
              <div class="create-list__desc">{{ item.desc }}</div>
              <div
                class="create-list__btn text-end pointer"
                @click="item.action"
              >
                <span>{{ item.btnName }}</span>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div class="aside flex flex-column ml-6 flex-shrink-0">
        <div class="aside-header flex py-6 fs-6 fw-bolder">
          <div class="aside-title">公告通知</div>
        </div>
        <div class="aside-main flex-grow-1 p-6">
          <ul class="notice-list__list">
            <li
              v-for="(item, index) in notices.slice(0, 5)"
              :key="index"
              class="notice-list__item flex align-center py-3 px-1 pointer"
            >
              <div v-if="item.type" class="notice-list__type mr-4 p-1">
                {{ item.type }}
              </div>
              <div
                class="notice-list__name flex-grow-1 ellipsis pointer"
                @click="toNotice"
              >
                {{ item.name }}
              </div>
              <div class="notice-list__time">{{ item.time }}</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <!--  概览  -->
    <div class="workbench-overview workbench-section flex">
      <div class="main flex-grow-1">
        <div class="main-header py-6">
          <div class="main-title mr-4 fs-6 fw-bolder">概览</div>
        </div>
        <ul class="agent-list__list flex justify-between">
          <li
            v-for="(item, index) in agentList"
            :key="index"
            class="agent-list__item p-6 ml-10"
          >
            <div
              class="agent-list__name flex align-center justify-center mx-auto mb-3"
            >
              <VIcon size="12" class="icon">{{ item.icon }}</VIcon>
              <span class="ml-1 fs-7">{{ item.name }}</span>
            </div>
            <div class="agent-list__value text-center fs-1">
              {{ item.value }}
            </div>
            <div class="agent-list__detail flex justify-around mt-3 py-2">
              <div
                v-for="(detail, dIndex) in item.list"
                :key="dIndex"
                class="agent-list__status"
              >
                <span>{{ detail.label }}</span>
                <span>:</span>
                <span
                  :class="[
                    'ml-1',
                    { status: ['正常'].indexOf(detail.value) > -1 }
                  ]"
                  >{{ detail.value }}</span
                >
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div class="aside flex flex-column ml-6 flex-shrink-0">
        <div class="aside-header flex py-6 fs-6 fw-bolder">
          <div class="aside-title">新手入门</div>
        </div>
        <div class="aside-main flex-grow-1 p-6">
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
        <div class="notice mb-6 none">
          <div class="notice-header fs-7 fw-bolder p-6">公告通知</div>
          <div class="notice-list px-5">
            <ul class="notice-list__list pt-3">
              <li
                v-for="(item, index) in notices.slice(0, 5)"
                :key="index"
                class="notice-list__item flex align-center py-3 px-1 pointer"
              >
                <div v-if="item.type" class="notice-list__type mr-4 p-1">
                  {{ item.type }}
                </div>
                <div
                  class="notice-list__name flex-grow-1 ellipsis pointer"
                  @click="toNotice"
                >
                  {{ item.name }}
                </div>
                <div class="notice-list__time">{{ item.time }}</div>
              </li>
            </ul>
          </div>
          <div class="notice-footer p-6">
            <span
              v-if="notices.length > 5"
              class="color-primary pointer"
              @click="toNotice"
              >更多</span
            >
          </div>
        </div>

        <div class="guide flex-grow-1 none">
          <div class="guide-header fs-7 fw-bolder p-6">新手入门</div>
          <div class="guide-list px-5">
            <ul class="guide-list__list pt-3">
              <li
                v-for="(item, index) in guides"
                :key="index"
                class="guide-list__item flex mb-4 pointer"
                @click="clickGuide(item)"
              >
                <div class="guide-list__icon">
                  <img :src="getIconSrc(item.icon)" alt="" />
                </div>
                <div class="guide-list__name ml-4 flex align-center">
                  {{ item.name }}
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
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
          title:
            '创建数据同步任务，并对已有数据同步任务的类型和状态进行查看和管理',
          desc:
            '任务管理主要用来创建同步任务并进行管理。快来创建数据同步任务，并对已有数据同步任务的类型和状态进行查看和管理吧。',
          btnName: '创建任务',
          action: this.createTask
        }
      ], // 创建列表
      agentList: [
        {
          name: 'Agent',
          icon: 'agent',
          value: 1,
          list: [
            {
              label: 'Agent状态',
              value: '正常'
            }
          ]
        },
        {
          name: '连接',
          icon: 'connection',
          value: 1,
          list: [
            {
              label: '有效连接',
              value: 10
            },
            {
              label: '无效连接',
              value: 10
            }
          ]
        },
        {
          name: '任务',
          icon: 'task',
          value: 1,
          list: [
            {
              label: '全量',
              value: 10
            },
            {
              label: '增量',
              value: 10
            },
            {
              label: '全量增量',
              value: 10
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
          url:
            'https://www.yuque.com/tapdata/cloud/chan-pin-jian-jie_shen-me-shi-dfs'
        },
        {
          name: '产品架构及工作原理',
          title: ['-Tapdata cloud manager', '-Tapdata agent'],
          icon: 'introduction_2',
          url:
            'https://www.yuque.com/tapdata/cloud/chan-pin-jian-jie_chan-pin-jia-gou-ji-yuan-li'
        },
        {
          name: '产品优势',
          title: [
            '-创新的实时数据同步技术',
            '-零代码可视化拖拽操作',
            '-完美支持SQL->NOSQL',
            '-全面的数据库支持'
          ],
          icon: 'introduction_3',
          url:
            'https://www.yuque.com/tapdata/cloud/chan-pin-jian-jie_chan-pin-you-shi'
        },
        {
          name: '典型应用场景',
          title: [
            '-数据库现代化',
            '-不停机迁移数据库',
            '-数据异地灾备',
            '-异地多活'
          ],
          icon: 'introduction_4',
          url:
            'https://www.yuque.com/tapdata/cloud/chan-pin-jian-jie_dian-xing-ying-yong-chang-jing'
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
      this.loadAgent()
      this.loadConection()
      this.loadTask()
      this.loadNotices() // 通知公告
    },
    loadAgent() {
      // agent列表
      let agentList = this.agentList
      this.$axios
        .get('tm/api/clusterStates')
        .then(data => {
          // this.agentList = data || []

          // agent状态
          let obj = {
            total: data.length,
            running: 0,
            stopped: 0,
            down: 0
          }
          data.forEach(v => {
            if (v.engine && v.engine.status) {
              obj[v.engine.status] = obj[v.engine.status] + 1
            }
          })
          agentList[0].value = obj.total
        })
        .finally(() => {
          this.transferLoading = false
        })
    },
    loadConection() {
      let agentList = this.agentList
      this.$axios.get('tm/api/Connections/count').then(res => {
        console.log('res', res)
        agentList[1].value = res?.count
      })
    },
    loadTask() {
      let agentList = this.agentList
      this.$axios.get('tm/api/DataFlows/chart').then(data => {
        // 运行任务状态
        const chart4 = data.chart4 || {}
        chart4.total =
          (chart4.initializing || 0) +
          (chart4.initialized || 0) +
          (chart4.cdc || 0)
        agentList[2].value = chart4.total
        agentList[2].list[0].value = chart4.initializing
        agentList[2].list[1].value = chart4.cdc
        agentList[2].list[1].value = chart4.initialized
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
    getIconSrc(icon) {
      return require(`../../assets/image/workbench/${icon}.png`)
      // return require(`../../../public/images/${src}`)
    },
    showGuide(key) {
      this.$emit('show-guide', key)
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
      this.showGuide('dataSource_select')
    },
    toNotice() {
      this.$router.push({ name: 'WorkbenchNotice' })
    },
    clickIntro(item) {
      window.open(item.url, '_blank')
    },
    clickGuide(item) {
      window.open(item.url, '_blank')
    }
  }
}
</script>

<style lang="scss" scoped>
.workbench-container {
  height: 100%;
  min-height: 610px;
  min-width: 1060px;
  .workbench-start {
    height: 270px;
  }
  .main {
    .main-header {
      .main-title {
        height: 24px;
        line-height: 24px;
      }
      .main-subtitle {
        background-color: #dfe8ee;
        .icon {
          color: map-get($color, primary);
        }
      }
    }
    .create-list__item {
      background-color: #fff;
      &:first-child {
        margin-left: 0 !important;
      }
    }
    // 快速开始
    .create-list__index {
      width: 22px;
      height: 22px;
      color: map-get($color, primary);
      border: 1px solid map-get($color, primary);
      border-radius: 50%;
    }
    .create-list__name {
      color: #000;
    }
    .create-list__desc {
      height: 95px;
      color: rgba(0, 0, 0, 0.49);
    }
    .create-list__btn {
      color: map-get($color, primary);
    }
    // 概览
    .agent-list__list {
      background-color: #fff;
    }
    .agent-list__item {
      width: 240px;
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
      .status {
        color: #599f3f;
      }
    }
  }
  .aside {
    width: 392px;
    .aside-header {
      .aside-title {
        height: 24px;
        line-height: 24px;
      }
    }
    .aside-main {
      background-color: #fff;
    }
    .guide-list__name {
      color: map-get($color, primary);
    }
    //> div {
    //  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.02);
    //  border-radius: 4px;
    //  background: #fff;
    //}
  }
  .notice {
    .notice-list__list {
      height: 213px;
      box-sizing: border-box;
      border-top: 1px solid #f2f2f2;
    }
    .notice-list__type {
      background: #f7f8f9;
    }
    .notice-list__name {
      &:hover {
        color: map-get($color, primary);
      }
    }
    .notice-list__time {
      color: rgba(0, 0, 0, 0.5);
    }
    .notice-footer {
      color: map-get($color, primary);
    }
  }
  .pointer {
    cursor: pointer;
  }
}
</style>
