<script>
import { getIcon } from '@tap/assets/icons'
import Cookie from '@tap/shared/src/cookie'
import { $on } from '@tap/shared/src/event'
import { mapGetters, mapState } from 'vuex'

export default {
  inject: ['checkAgent', 'buried'],
  data() {
    return {
      demand: '',
      suggestion: '',
      sourceList: [
        {
          type: 'mysql',
          icon: getIcon('mysql'),
        },
        {
          type: 'dummy',
          icon: getIcon('mock-source'),
        } /*,
        {
          type: 'mongodb',
          icon: getIcon('mongodb')
        }*/,
      ],
      targetList: [
        {
          type: 'mongodb',
          icon: getIcon('mongodb'),
        },
        {
          type: 'dummy',
          icon: getIcon('mock-target'),
        } /*,
        {
          type: 'mongodb',
          icon: getIcon('mongodb')
        }*/,
      ],
    }
  },

  computed: {
    ...mapGetters(['isDomesticStation']),
    ...mapState(['user']),
  },

  created() {
    $on(this.$root, 'select-connection-type', this.selectConnectionType)
    $on(this.$root, 'show-guide', this.showGuide)
    $on(this.$root, 'get-user', this.getUser)
  },
  mounted() {
    //获取cookie 是否用户有操作过 稍后部署 且缓存是当前用户 不在弹窗
    const user = window.__USER_INFO__
    this.userInfo = user
    //检查是云市场用户授权码有效期
    // if (user?.enableLicense) {
    //   this.checkLicense(user)
    // }
    const isCurrentUser = Cookie.get('deployLaterUser') === user?.userId
    if (Cookie.get('deployLater') == 1 && isCurrentUser) return
  },
  methods: {
    loadChat() {
      const $zoho = $zoho || {}
      const { isDomesticStation } = this
      $zoho.salesiq = $zoho.salesiq || {
        widgetcode: isDomesticStation
          ? '39c2c81d902fdf4fbcc9b55f1268168c6d58fe89b1de70d9adcb5c4c13d6ff4d604d73c57c92b8946ff9b4782f00d83f'
          : 'siqc6975654b695513072e7c944c1b63ce0561c932c06ea37e561e3a2f7fe5ae1f7',
        values: {},
        ready() {},
      }
      window.$zoho = $zoho
      const d = document
      const s = d.createElement('script')
      s.type = 'text/javascript'
      s.id = 'zsiqscript'
      s.defer = true
      s.src = isDomesticStation
        ? 'https://salesiq.zoho.com.cn/widget'
        : 'https://salesiq.zohopublic.com/widget'
      const t = d.querySelectorAll('script')[0]
      t.parentNode.insertBefore(s, t)
      this.hideCustomTip()

      $zoho.salesiq.ready = function () {
        const user = window.__USER_INFO__
        $zoho.salesiq.visitor.contactnumber(user.telephone)
        $zoho.salesiq.visitor.info({
          tapdata_username: user.nickname || user.username,
          tapdata_phone: user.telephone,
          tapdata_email: user.email,
        })

        $zoho.salesiq.addEventListener('load', function () {
          const siqiframe = document.querySelector('#siqiframe')

          if (siqiframe) {
            const style = document.createElement('style')
            style.type = 'text/css'
            style.innerHTML = `.botactions em { white-space: nowrap; }`
            siqiframe.contentWindow.document
              .querySelectorAll('head')
              .item(0)
              .append(style)
          }
        })
      }
    },

    handleCreateTask() {
      this.$store.dispatch('startGuideTask', {
        demand: this.demand,
        suggestion: this.suggestion,
      })

      this.$router.replace({
        name: 'WelcomeTask',
      })
    },

    command(command) {
      // let downloadUrl = '';
      switch (command) {
        case 'workbench':
          this.$router.push({ name: 'Home' })
          break
        case 'home':
          window.open(this.officialWebsiteAddress, '_blank')
          break
        case 'userCenter':
          this.$router.push({
            name: 'userCenter',
          })
          break
        case 'order':
          this.$router.push({
            name: 'order',
          })
          break
        case 'signOut':
          this.$confirm(
            this.$t('header_log_out_title'),
            this.$t('header_log_out_tip'),
          ).then((res) => {
            if (res) {
              this.clearCookie()
              location.href = './logout'
            }
          })
          break
      }
    },
  },
}
</script>

<template>
  <div class="flex absolute-fill">
    <div class="flex-1 flex flex-column justify-center align-center my-8">
      <div class="text-center mb-14">
        <div class="fs-2 fw-sub lh-sm mb-4" v-html="$t('welcome_page_title')" />
        <div
          class="font-color-sslight lh-base mb-10"
          v-html="$t('welcome_page_subtitle')"
        />
      </div>

      <div class="flex align-center">
        <div class="position-relative">
          <div
            class="position-absolute start-50 font-color-sslight text-center lh-base connector-header mt-n3 text-nowrap"
          >
            {{ $t('welcome_datasource') }}
          </div>
          <div class="flex flex-column gap-6 connector-list p-4">
            <div
              v-for="item in sourceList"
              :key="item.type"
              class="connector-list-item flex justify-center align-center"
            >
              <ElImage :src="item.icon" style="width: 30px; height: 30px" />
            </div>
            <div class="connector-list-item flex justify-center align-center">
              <VIcon class="color-primary" :size="24">more</VIcon>
            </div>
          </div>
        </div>

        <div>
          <svg
            width="398"
            height="201"
            viewBox="0 0 398 201"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M149 101.43H102.046C93.4902 101.103 76.3782 103.391 76.3782 115.156C76.3782 126.921 76.3782 148.382 76.3782 168.754C76.3782 175.617 71.3697 181.5 46.3277 181.5C21.2857 181.5 5.00841 181.5 1.78814e-06 181.5"
              stroke="#C9CDD4"
              stroke-width="2"
              stroke-dasharray="6 6"
            />
            <path
              d="M149 101.429H102.046C67 101.429 41.2875 101.5 0 101.5"
              stroke="#C9CDD4"
              stroke-width="2"
              stroke-dasharray="6 6"
            />
            <g filter="url(#filter0_dd_21257_9136)">
              <rect
                x="149"
                y="50.8638"
                width="100"
                height="100"
                rx="16"
                fill="white"
                shape-rendering="crispEdges"
              />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M177.451 85.6866H168.094L161.5 74.9512H192.429C186.466 76.933 181.244 80.6761 177.451 85.6866ZM202.124 87.2405V121.372C198.213 121.384 194.418 120.037 191.389 117.562V91.0104C194.427 88.5501 198.215 87.2031 202.124 87.1932V87.2405Z"
                fill="#3B47E5"
              />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M202.131 74.9516C196.319 74.9489 190.637 76.6699 185.804 79.8968C180.97 83.1238 177.202 87.7117 174.976 93.0804C172.75 98.4491 172.166 104.357 173.298 110.058C174.43 115.758 177.228 120.995 181.336 125.106C185.445 129.216 190.681 132.016 196.381 133.151C202.08 134.285 207.989 133.704 213.359 131.481C218.728 129.257 223.318 125.491 226.547 120.659C229.776 115.827 231.5 110.146 231.5 104.334V67.7969C227.926 73.6342 224.345 79.8971 220.765 85.687V104.334C220.765 108.022 219.671 111.628 217.621 114.694C215.572 117.761 212.66 120.151 209.252 121.562C205.844 122.973 202.095 123.342 198.477 122.622C194.86 121.902 191.538 120.125 188.93 117.517C186.322 114.908 184.547 111.585 183.828 107.968C183.11 104.35 183.48 100.601 184.892 97.1934C186.305 93.7862 188.696 90.8744 191.763 88.8263C194.83 86.7782 198.436 85.6857 202.124 85.687H218.663L225.251 74.9516H202.131Z"
                fill="#F3961A"
              />
            </g>
            <path
              opacity="0.6"
              d="M249 101.43H295.954C304.51 101.103 321.622 103.391 321.622 115.156C321.622 126.921 321.622 148.382 321.622 168.754C321.622 175.617 326.63 181.5 351.672 181.5C376.714 181.5 392.992 181.5 398 181.5"
              stroke="#C9CDD4"
              stroke-width="2"
              stroke-dasharray="6 6"
            />
            <path
              opacity="0.6"
              d="M249 101.371H295.954C304.51 101.701 321.622 99.3905 321.622 87.5075C321.622 75.6244 321.622 53.9487 321.622 33.3734C321.622 26.4415 326.63 20.5 351.672 20.5C376.714 20.5 392.992 20.5 398 20.5"
              stroke="#C9CDD4"
              stroke-width="2"
              stroke-dasharray="6 6"
            />

            <path
              id="target2"
              d="M249 101.429H295.954L398 101"
              stroke="#3B47E5"
              stroke-width="2"
            />
            <path
              id="source1"
              d="M149 101.371H102.046C93.4902 101.701 76.3782 99.3905 76.3782 87.5075C76.3782 75.6244 76.3782 53.9487 76.3782 33.3734C76.3782 20.5 71.3698 20.5 46.3277 20.5C21.2857 20.5 5.0084 20.5 0 20.5"
              stroke="#FE9E1E"
              stroke-width="2"
            />

            <path
              transform="translate(8, 8) rotate(180 0 0)"
              d="M5.07051 6.65677C5.46151 7.04777 5.46151 7.68078 5.07051 8.07078L-1.2935 14.4348C-1.6835 14.8258 -2.3165 14.8258 -2.7075 14.4348C-3.0975 14.0448 -3.0975 13.4118 -2.7075 13.0208L2.94951 7.36377L-2.7075 1.70707C-3.0975 1.31657 -3.0975 0.683475 -2.7075 0.292875C-2.3165 -0.097625 -1.6835 -0.097625 -1.2935 0.292875L5.07051 6.65677Z"
              fill="#FE9E1E"
            >
              <animateMotion
                dur="3s"
                repeatCount="indefinite"
                rotate="auto"
                keyTimes="0;1"
                calcMode="linear"
                keyPoints="1;0"
              >
                <mpath data-v-e4731dd0="" xlink:href="#source1" />
              </animateMotion>
            </path>
            <path
              transform="translate(-8, -8)"
              d="M8.07051 6.65677C8.46151 7.04777 8.46151 7.68078 8.07051 8.07078L1.7065 14.4348C1.3165 14.8258 0.6835 14.8258 0.2925 14.4348C-0.0975 14.0448 -0.0975 13.4118 0.2925 13.0208L5.94951 7.36377L0.2925 1.70707C-0.0975 1.31657 -0.0975 0.683475 0.2925 0.292875C0.6835 -0.097625 1.3165 -0.097625 1.7065 0.292875L8.07051 6.65677Z"
              fill="#3B47E5"
            >
              <animateMotion dur="3s" repeatCount="indefinite" rotate="auto">
                <mpath xlink:href="#target2" />
              </animateMotion>
            </path>
            <defs>
              <filter
                id="filter0_dd_21257_9136"
                x="86.5"
                y="0.863765"
                width="225"
                height="200"
                filterUnits="userSpaceOnUse"
                color-interpolation-filters="sRGB"
              >
                <feFlood flood-opacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset dx="25" dy="12.5" />
                <feGaussianBlur stdDeviation="18.75" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0.231373 0 0 0 0 0.278431 0 0 0 0 0.898039 0 0 0 0.2 0"
                />
                <feBlend
                  mode="normal"
                  in2="BackgroundImageFix"
                  result="effect1_dropShadow_21257_9136"
                />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset dx="-25" dy="-12.5" />
                <feGaussianBlur stdDeviation="18.75" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0.952941 0 0 0 0 0.588235 0 0 0 0 0.101961 0 0 0 0.2 0"
                />
                <feBlend
                  mode="normal"
                  in2="effect1_dropShadow_21257_9136"
                  result="effect2_dropShadow_21257_9136"
                />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="effect2_dropShadow_21257_9136"
                  result="shape"
                />
              </filter>
            </defs>
          </svg>
        </div>

        <div class="position-relative">
          <div
            class="position-absolute start-50 font-color-sslight text-center lh-base connector-header mt-n3 text-nowrap"
          >
            {{ $t('welcome_target_source') }}
          </div>
          <div class="flex flex-column gap-6 connector-list p-4">
            <div
              v-for="item in targetList"
              :key="item.type"
              class="connector-list-item flex justify-center align-center"
            >
              <ElImage :src="item.icon" style="width: 30px; height: 30px" />
            </div>
            <div class="connector-list-item flex justify-center align-center">
              <VIcon class="color-primary" :size="24">more</VIcon>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      class="flex-1 bg-white p-8 flex flex-column justify-center align-center"
    >
      <div class="flex flex-column">
        <div class="fs-4 fw-sub lh-sm mb-10">
          {{ $t('welcome_demand_collection') }}
        </div>

        <ElRadioGroup
          v-model="demand"
          class="flex flex-column gap-4 text-start mb-4"
          size="medium"
        >
          <ElRadio label="project_evaluation" class="m-0 bg-white" border>{{
            $t('welcome_demand_collection_1')
          }}</ElRadio>
          <ElRadio label="interest_in_tech" class="m-0 bg-white" border
            >{{ $t('welcome_demand_collection_2') }}
          </ElRadio>
          <ElRadio label="best_practices_learning" class="m-0 bg-white" border
            >{{ $t('welcome_demand_collection_3') }}
          </ElRadio>
          <ElRadio label="other" class="m-0 bg-white" border
            >{{ $t('dfs_replication_tour_dialog_finished_option_other') }}
          </ElRadio>
        </ElRadioGroup>

        <el-collapse-transition>
          <div v-if="demand === 'other'">
            <ElInput
              v-model="suggestion"
              type="textarea"
              :placeholder="
                $t('dfs_replication_tour_dialog_finished_survey_placeholder')
              "
              :rows="2"
              :maxlength="200"
              show-word-limit
            />
          </div>
        </el-collapse-transition>

        <div class="mt-10">
          <ElButton
            class="btn-shadow"
            size="medium"
            type="primary"
            :disabled="!demand || (demand === 'other' && !suggestion)"
            @click="handleCreateTask"
            >{{ $t('welcome_create_task') }}
          </ElButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.layout-main {
  padding: 0 16px 16px 16px;
}

.layout-wrap {
  height: 100%;
  padding-top: 52px;
  word-wrap: break-word;
  word-break: break-word;
  background: map.get($color, submenu);

  .left-aside {
    // border-right: 1px map.get($borderColor, aside) solid;
    background: map.get($color, submenu);

    .el-menu {
      background-color: map.get($color, submenu);
    }

    :deep(.el-menu-item),
    :deep(.el-submenu__title) {
      height: 50px;
      line-height: 50px;

      .v-icon {
        color: map.get($iconFillColor, normal);
      }

      &.is-active,
      &:hover {
        background-color: map.get($color, white);
        color: map.get($color, primary);
        border-radius: 8px;
      }

      &.is-active,
      &:hover {
        :deep(.v-icon) {
          color: map.get($color, primary);
        }
      }

      .submenu-item {
        padding-left: 12px;
      }
    }

    .product-name {
      padding-left: 20px;
      font-size: 14px;
      font-weight: 700;
      line-height: 60px;
      color: map.get($fontColor, normal);
    }
  }

  .header {
    display: flex;
    align-items: center;
    font-size: 14px;
  }

  .main {
    display: flex;
    flex-direction: column;
    flex-basis: 0%;
    margin: 0;
    padding: 0;
    //background: rgba(239, 241, 244, 1);
  }

  .breadcrumb {
    padding: 24px 0 24px 24px;
    //height: 40px;
    box-sizing: border-box;

    &.one-breadcrumb {
      font-size: 18px;

      :deep(.el-breadcrumb__inner) {
        color: #000;
      }
    }

    :deep(.el-breadcrumb__separator) {
      color: map.get($fontColor, sub);
    }
  }

  .btn-back {
    padding: 0;
    width: 24px;
    height: 24px;
    font-size: 12px;
  }

  .el-menu-item.is-active .agent-warning-icon {
    display: none;
  }
}

.connector-list {
  width: fit-content;
  border-radius: 16px;
  //box-shadow: inset 3px 3px 7px rgba(136, 150, 163, 0.58), inset -3px -3px 7px #FFFFFF;
  background-image: url('../../assets/image/connector_list_shadow_bg.svg');

  &-item {
    width: 60px;
    height: 60px;
    background-image: url('../../assets/image/connector_item_shadow_bg.svg');
    //box-shadow: 0px 0px 0.224852px 0.224852px rgba(0, 0, 0, 0.07), 0px 0px 0.224852px 0.674556px rgba(0, 0, 0, 0.05), 0px 0.899408px 3.59763px 0.899408px rgba(0, 0, 0, 0.12), 0px 0px 0px 4px #F2F2F2;
    border-radius: 10px;
  }
}

.connector-header {
  transform: translate(-50%, -100%);
}

.btn-shadow {
  box-shadow: 0px 5px 10px 0px #3b47e54d;
}

.dfs-header {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 52px !important;
  padding: 0 7px;
  background: map.get($color, submenu);
  box-sizing: border-box;

  .logo {
    display: block;
    width: auto;
    height: 30px;

    img {
      display: block;
      height: 100%;
      width: 100%;
      object-fit: contain;
    }
  }

  .button-bar {
    display: flex;
    align-items: center;

    .command-item {
      padding: 4px 8px;
      cursor: pointer;
      color: map.get($fontColor, light);

      &:hover {
        color: map.get($color, primary);
        background-color: map.get($color, white);
        border-radius: 4px;

        &.icon {
          color: map.get($color, primary);
        }
      }
    }

    .agent-status {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-right: 5px;
      padding: 0 15px 0 10px;
      height: 24px;
      line-height: 24px;
      color: #fff;
      font-size: 12px;
      border-radius: 20px;
      cursor: pointer;
      background-color: rgba(255, 255, 255, 0.1);

      i.status-color {
        display: inline-block;
        width: 12px;
        height: 12px;
        margin-right: 5px;
        vertical-align: middle;
        border-radius: 50%;
      }
    }

    .btn-create {
      margin-right: 20px;
    }

    .btn {
      margin-left: 8px;
      color: #999;
      cursor: pointer;

      i {
        display: inline-block;
        line-height: 28px;
        text-align: center;
        height: 28px;
        width: 28px;
        font-size: 18px;
      }

      &:hover {
        color: #fff;
      }
    }

    .menu-user {
      .menu-button {
        color: rgba(204, 204, 204, 1);
        background: rgba(85, 85, 85, 1);
        border: none;
      }
    }

    .img {
      width: 17px;
      height: 17px;
    }
  }
}

.dfs-header__body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 52px !important;
}
</style>

<style>
.zsiqfanim,
.zsiqfanim *,
.siqanim,
.siqanim * {
  pointer-events: all;
}

.text-gradient {
  background: linear-gradient(90deg, #3b47e5 2.08%, #9747ff 97.92%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
}
</style>
