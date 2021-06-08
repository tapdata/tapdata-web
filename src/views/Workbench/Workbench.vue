<template>
  <div
    v-if="$route.name === 'Workbench'"
    class="workbench-container flex flex-grow-1"
  >
    <div class="main flex-grow-1">
      <div class="main-header py-6 px-7">
        <div class="main-title flex align-center">
          <img src="../../assets/image/logoIcon.png" alt="" />
          <span class="fs-3 inline-block">欢迎使用Tapdata Cloud</span>
        </div>
        <div class="main-subtitle fs-7">
          <span class="mr-4"
            >安全、简单、永久免费的实时数据流融合服务
            从这里开始您的数据旅途</span
          >
          <img src="../../assets/image/workbench/arrow_right.png" alt="" />
          <span
            class="ml-2 text-decoration-underline pointer"
            @click="showGuide"
            >开启引导</span
          >
        </div>
      </div>
      <div class="main-content">
        <div class="create-list py-6 px-10">
          <ul class="create-list__list flex justify-between">
            <li
              v-for="(item, index) in createList"
              :key="index"
              class="create-list__item"
            >
              <div class="create-list__name flex mb-4 fs-7">
                <VIcon class="v-icon" size="20">{{ item.icon }}</VIcon>
                <span class="ml-2 fw-bolder">{{ item.name }}</span>
              </div>
              <div class="create-list__title mb-4 fs-8 text-wrap">
                {{ item.title }}
              </div>
              <el-button
                class="create-list__btn"
                type="primary"
                size="small"
                :icon="item.hiddenBtnIcon ? '' : 'el-icon-plus'"
                @click="item.action"
                >{{ item.btnName }}</el-button
              >
            </li>
          </ul>
        </div>
        <ul class="introduction-list justify-between flex flex-wrap px-6 py-4">
          <li
            v-for="(item, index) in introductionList"
            :key="index"
            class="introduction-list__item p-4"
          >
            <div
              class="introduction-list__box flex p-4 pointer"
              @click="clickIntro(item)"
            >
              <div class="introduction-list__icon">
                <img :src="getIconSrc(item.icon)" alt="" />
              </div>
              <div class="introduction-list__content ml-4">
                <div class="introduction-list__name mb-3 fs-7">
                  {{ item.name }}
                </div>
                <div
                  class="introduction-list__title"
                  v-for="(t, i) in item.title"
                  :key="i"
                >
                  {{ t }}
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <div class="aside flex flex-column ml-6">
      <div class="notice mb-6">
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

      <div class="guide flex-grow-1">
        <div class="guide-header fs-7 fw-bolder p-6">新手入门</div>
        <div class="guide-list px-5">
          <ul class="guide-list__list pt-3">
            <li
              v-for="(item, index) in guides"
              :key="index"
              class="guide-list__item flex mb-4 py-2 px-4 pointer"
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
          btnName: '部署Agent',
          hiddenBtnIcon: true,
          action: this.createAgent
        },
        {
          name: '连接管理',
          icon: 'connection',
          title: '创建数据连接，并对已有数据连接的状态进行测试和管理',
          btnName: '创建连接',
          action: this.createConnection
        },
        {
          name: '任务管理',
          icon: 'task',
          title:
            '创建数据同步任务，并对已有数据同步任务的类型和状态进行查看和管理',
          btnName: '创建任务',
          action: this.createTask
        }
      ], // 创建列表
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
      this.loadData()
    },
    loadData() {
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
  .main {
    width: 0;
    background: #fff;
    border-bottom-right-radius: 6px;
    border-bottom-left-radius: 6px;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.02);
    .main-header {
      color: #fff;
      background: url(../../assets/image/workbench/workbench_bg.png) no-repeat
        100% / cover;
      border-top-left-radius: 4px;
      border-top-right-radius: 6px;
    }
    .main-title {
      height: 40px;
      line-height: 40px;
      > img {
        width: 45px;
        height: 33px;
      }
    }
    .main-subtitle {
      > img {
        width: 12px;
        height: 12px;
      }
    }
    .main-content {
      border-bottom-right-radius: 6px;
      border-bottom-left-radius: 6px;
    }
    .create-list {
      .create-list__item {
      }
      .create-list__name {
        color: #000;
        > img {
          width: 22px;
          height: 22px;
        }
        ::v-deep .v-icon {
          color: #888;
        }
      }
      .create-list__title {
        width: 195px;
        color: rgba(0, 0, 0, 49.87%);
      }
      .create-list__btn {
        border-radius: 4px;
      }
    }
    .introduction-list {
      .introduction-list__item {
        width: 50%;
        box-sizing: border-box;
      }
      .introduction-list__box {
        height: 150px;
        box-sizing: border-box;
        background: rgba(0, 0, 0, 0.02);
        &:hover {
          background: rgba(234, 239, 254, 0.64);
          .introduction-list__name {
            color: #2c65ff;
          }
          .introduction-list__title {
            color: rgba(44, 101, 255, 49.87%);
          }
        }
      }
      .introduction-list__icon {
        > img {
          width: 56px;
          height: 56px;
        }
      }
      .introduction-list__content {
        .introduction-list__title {
          //min-width: 240px;
          color: rgba(0, 0, 0, 49.87%);
        }
      }
    }
  }
  .aside {
    width: 392px;
    > div {
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.02);
      border-radius: 4px;
      background: #fff;
    }
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
  .guide {
    .guide-list__list {
      border-top: 1px solid #f2f2f2;
      .guide-list__item {
        border-radius: 2px;
        background-color: rgba(0, 0, 0, 2%);
        &:hover {
          background: rgba(234, 239, 254, 0.64);
          .guide-list__name {
            color: #2c65ff;
          }
        }
      }
      .guide-list__icon {
        > img {
          width: 42px;
          height: 42px;
        }
      }
    }
  }
  .pointer {
    cursor: pointer;
  }
}
</style>
