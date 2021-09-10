<template>
  <div v-if="$route.name === 'Workbench'" class="workbench-container px-8">
    <!--	快速开始	-->
    <div class="workbench-start workbench-section">
      <el-row :gutter="40" class="section-header py-6">
        <el-col :span="18" class="main-title">{{ $t('workbench_quick_start') }}</el-col>
        <el-col :span="6" class="aside-title">{{ $t('workbench_notice') }}</el-col>
      </el-row>
      <el-row :gutter="40" class="section-body">
        <el-col :span="6" v-for="(item, index) in createList" :key="index">
          <div class="create-list__item flex p-6">
            <div class="create-list__index block flex justify-content-center align-items-center flex-shrink-0">
              {{ index + 1 }}
            </div>
            <div class="create-list__main ml-4">
              <div class="create-list__name mb-4 fs-6">{{ item.name }}</div>
              <div class="create-list__desc">{{ item.desc }}</div>
              <el-link type="primary" class="float-end pointer" @click="item.action">
                <span>{{ item.btnName }}</span>
                <VIcon class="ml-2" size="12">right</VIcon>
              </el-link>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
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
                <el-link
                  type="primary"
                  class="notice-list__name flex-grow-1 ellipsis block pointer"
                  @click="toNotice(item)"
                >
                  {{ item.name }}
                </el-link>
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
        <el-col :span="18" class="main-title">{{ $t('workbench_overview') }}</el-col>
        <el-col :span="6" class="aside-title">{{ $t('workbench_guide') }}</el-col>
      </el-row>
      <el-row :gutter="40" class="section-body">
        <el-col :span="18">
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
        </el-col>
        <el-col :span="6">
          <div class="aside-main guide-list flex-grow-1 p-6">
            <div class="guide-list__list">
              <el-link
                v-for="(item, index) in guides"
                :key="index"
                type="primary"
                class="guide-list__item mb-4 block pointer"
                @click="clickGuide(item)"
              >
                {{ item.name }}
              </el-link>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
    <ul class="tapdata-contact-warp">
      <li>
        <el-popover placement="left" width="200" trigger="hover" :content="$t('gl_telephone_tip') + '：0755-26656080'">
          <a href="tel:0755-26656080" slot="reference">
            <div class="tapdata-contact__icon">
              <VIcon size="20">telephone-color</VIcon>
            </div>
          </a>
        </el-popover>
      </li>
      <li>
        <el-popover placement="left" width="200" trigger="hover">
          <div class="tapdata-contact__tip">
            <div class="tapdata-contact__text">{{ $t('gl_qr_code_wx_public_account') }}</div>
            <div class="tapdata-contact__img"><img src="../../assets/image/weiixn_larg.png" alt="" /></div>
            <div class="tapdata-contact__text">{{ $t('gl_qr_code_tip') }}</div>
          </div>
          <div class="tapdata-contact__icon" slot="reference">
            <VIcon size="20">wx-color</VIcon>
          </div>
        </el-popover>
      </li>
      <li>
        <el-popover placement="left" width="200" trigger="hover">
          <div class="tapdata-contact__tip">
            <div class="tapdata-contact__text">{{ $t('gl_qr_code_wx_customer_service') }}</div>
            <div class="tapdata-contact__img"><img src="../../assets/image/LarkQR.jpeg" alt="" /></div>
            <div class="tapdata-contact__text">{{ $t('gl_qr_code_tip') }}</div>
          </div>
          <div class="tapdata-contact__icon" slot="reference">
            <VIcon size="20">service-color</VIcon>
          </div>
        </el-popover>
      </li>
    </ul>
  </div>
  <router-view v-else></router-view>
</template>

<script>
import VIcon from '@/components/VIcon'

export default {
  name: 'Workbench',
  components: { VIcon },
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
          value: 1,
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
              label: $t('task_sync_type_initial_sync'),
              value: 0
            },
            {
              label: $t('task_sync_type_cdc'),
              value: 0
            },
            {
              label: $t('task_sync_type_initial_sync_cdc'),
              value: 0
            }
          ]
        }
      ], // 介绍列表
      notices: [], // 公告列表
      guides: [
        {
          name: $t('workbench_guide_novice'),
          action: 'guide'
        },
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
        // size: 1,
        // page: 0,
        sort: ['createAt desc']
      }
      const loading = this.$loading({
        target: this.$refs.agent?.[0]
      })
      this.$axios
        .get('api/tcm/agent?filter=' + encodeURIComponent(JSON.stringify(filter)))
        .then(data => {
          agentList[0].value = data?.total
          let total = data?.total
          let runningCount = data.items.filter(item => item.status === 'Running')?.length ?? 0
          let offlineCount = total - runningCount
          agentList[0].list[0].value = runningCount
          agentList[0].list[1].value = offlineCount
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
            agentList[1].list[0].value = chart8.ready
            agentList[1].list[1].value = chart8.invalid
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
          time: '2021-07-01'
        },
        {
          id: 1,
          type: '',
          name: '异构数据库同步云平台 Tapdata Cloud 开启有奖公测',
          time: '2021-07-31'
        },
        {
          id: 2,
          type: '',
          name: 'Tapdata Cloud 1.0.6 版本发布啦！',
          time: '2021-08-30'
        }
      ]
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
        name: 'DataflowCreate'
      })
    },
    createConnection() {
      this.$root.$emit('select-connection-type')
    },
    toNotice(item) {
      this.$router.push({
        name: 'WorkbenchNotice',
        query: {
          id: item?.id
        }
      })
    },
    clickGuide(item) {
      if (item.action) {
        this.$root.$emit('show-guide')
        return
      }
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
.main-title,
.aside-title {
  font-size: 18px;
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
}
.guide-list {
  height: 190px;
}
</style>
<style lang="scss" scoped>
.tapdata-contact-warp {
  position: fixed;
  right: 21px;
  bottom: 82px;
  padding: 9px;
  z-index: 9;
  li {
    width: 48px;
    height: 48px;
    background: #fff;
    box-shadow: 0 0 8px 0 rgb(0 0 0 / 12%);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 12px;
    cursor: pointer;
    position: relative;
    color: #333;
    .tapdata-contact__icon {
      width: 20px;
      height: 20px;
      img {
        width: 100%;
        height: 100%;
      }
    }
  }
}
.tapdata-contact__text {
  text-align: center;
}
.tapdata-contact__img {
  width: 100px;
  height: 100px;
  margin: 10px auto;
  img {
    width: 100%;
    height: 100%;
  }
}
</style>
