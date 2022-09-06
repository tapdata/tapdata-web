<template>
  <div class="notification" v-loading="loading">
    <div class="notification-head">
      <div class="title">{{ $t('notify_system_notice') }}</div>
    </div>
    <div class="notification-main" style="overflow-y: auto">
      <section class="notification-tip">
        <span> {{ $t('notify_tip') }}</span>
      </section>
      <section class="run-notification" v-show="runNotification && runNotification.length > 0">
        <span class="title">{{ $t('notify_job_operation_notice') }}</span>
        <ul>
          <li v-for="(item, index) in runNotification" :key="index">
            <span class="label">{{ notificationMAP[item.label] }}</span>
            <el-checkbox class="notice" v-model="item.notice">{{ $t('notify_system_notice') }}</el-checkbox>
            <el-checkbox class="email" v-model="item.email">{{ $t('notify_email_notice') }}</el-checkbox>
            <div class="mt-4" v-if="item.lagTime">
              <span class="label" v-if="item.lagTime">{{ notificationMAP[item.lagTime] }}</span>
              <span v-if="item.label === 'CDCLagTime'">
                <el-input
                  v-model="item.lagTimeInterval"
                  class="item-input"
                  size="mini"
                  onkeyup="this.value=this.value.replace(/[^\d]/g,'') "
                  onafterpaste="this.value=this.value.replace(/[^\d]/g,'') "
                >
                  <el-select v-model="item.lagTimeUtil" slot="append" placeholder="请选择" class="input-with-select">
                    <el-option label="hour" value="hour"></el-option>
                    <el-option label="second" value="second"></el-option>
                  </el-select>
                </el-input>
              </span>
            </div>

            <div class="mt-4" v-if="item.noticeInterval && item.email">
              <span class="label" v-if="item.noticeInterval && item.email">
                {{ notificationMAP[item.noticeInterval] }}
              </span>
              <span v-if="item.label === 'CDCLagTime' && item.email">
                <el-input
                  v-model="item.noticeIntervalInterval"
                  class="item-input"
                  size="mini"
                  onkeyup="this.value=this.value.replace(/[^\d]/g,'') "
                  onafterpaste="this.value=this.value.replace(/[^\d]/g,'') "
                >
                  <el-select
                    v-model="item.noticeIntervalUtil"
                    slot="append"
                    placeholder="请选择"
                    class="input-with-select"
                  >
                    <el-option label="hour" value="hour"></el-option>
                    <el-option label="second" value="second"></el-option>
                  </el-select>
                </el-input>
              </span>
              <span v-if="item.label === 'jobEncounterError' && item.email">
                <el-input
                  v-model="item.Interval"
                  class="item-input"
                  size="mini"
                  onkeyup="this.value=this.value.replace(/[^\d]/g,'') "
                  onafterpaste="this.value=this.value.replace(/[^\d]/g,'') "
                >
                  <el-select v-model="item.util" slot="append" placeholder="请选择" class="input-with-select">
                    <el-option label="hour" value="hour"></el-option>
                    <el-option label="second" value="second"></el-option>
                  </el-select>
                </el-input>
              </span>
            </div>
          </li>
        </ul>
      </section>
      <section class="run-notification" v-show="systemNotification && systemNotification.length > 0">
        <span class="title">{{ $t('notify_system_setting') }}</span>
        <ul>
          <li v-for="(item, index) in systemNotification" :key="index">
            <span class="label">{{ notificationMAP[item.label] }}</span>
            <el-checkbox class="notice" v-model="item.notice">{{ $t('notify_system_notice') }}</el-checkbox>
            <el-checkbox class="email" v-model="item.email">{{ $t('notify_email_notice') }}</el-checkbox>
          </li>
        </ul>
      </section>
      <section class="run-notification" v-show="agentNotification && agentNotification.length > 0">
        <span class="title">{{ $t('notification_agentNotice') }}</span>
        <ul>
          <li v-for="(item, index) in agentNotification" :key="index">
            <span class="label">{{ notificationMAP[item.label] }}</span>
            <el-checkbox class="notice" v-model="item.notice">{{ $t('notify_system_notice') }}</el-checkbox>
            <el-checkbox class="email" v-model="item.email">{{ $t('notify_email_notice') }}</el-checkbox>
          </li>
        </ul>
      </section>
    </div>
    <div class="notification-footer">
      <ElButton
        class="btn"
        @click="submit"
        size="mini"
        type="primary"
        :disabled="!runNotification || !systemNotification || !agentNotification"
        >{{ $t('dataForm_submit') }}</ElButton
      >
    </div>
    <!-- <div class="notification-main">
      <div class="notification-right-list"></div>
    </div> -->
  </div>
</template>

<script>
import { notificationMAP } from '../notification/tyepMap'
import { settingsApi } from '@tap/api'

export default {
  name: 'list',
  data() {
    return {
      notificationMAP: notificationMAP,
      runNotification: [],
      systemNotification: [],
      agentNotification: [],
      loading: false
    }
  },
  created() {
    this.getData()
  },
  methods: {
    getData() {
      this.loading = true
      settingsApi
        .findOne('76')
        .then(data => {
          let value = JSON.parse(data?.value || '{}')
          this.runNotification = value.runNotification
          this.systemNotification = value.systemNotification
          this.agentNotification = value.agentNotification
        })
        .finally(() => {
          this.loading = false
        })
    },
    submit() {
      let where = {
        _id: '76'
      }
      let data = {
        runNotification: this.runNotification,
        systemNotification: this.systemNotification,
        agentNotification: this.agentNotification
      }
      if (!data) {
        return
      }
      settingsApi
        .enterpriseUpdate(where, data)
        .then(() => {
          this.$message.success(this.$t('message_save_ok'))
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style scoped lang="scss">
$unreadColor: #ee5353;
.notification {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  font-size: 12px;
  .notification-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 54px;
    font-size: 12px;
    color: map-get($color, primary);
    padding: 20px 20px 0 24px;
    .title {
      font-size: 14px;
      font-weight: bold;
      color: map-get($fontColor, dark);
      line-height: 34px;
    }
    .search {
      margin-right: 10px;
      width: 200px;
    }
  }
  .notification-main {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex-grow: 1;
    padding-left: 24px;
    .notification-tip {
      padding-top: 5px;
      span {
        padding: 4px 100px 4px 20px;
        font-size: 12px;
        white-space: nowrap;
        color: map-get($fontColor, light);
        border: 1px solid map-get($borderColor, light);
        border-left: 2px solid map-get($color, primary);
        box-sizing: border-box;
      }
    }
    .run-notification {
      margin-top: 15px;
      .title {
        font-size: 14px;
        font-weight: bold;
        color: map-get($fontColor, dark);
        line-height: 32px;
        margin-bottom: 20px;
      }
      // ::v-deep {
      //   .el-checkbox__label {
      //     color: #86909c;
      //   }
      // }
      .notice,
      .email {
        color: map-get($fontColor, light);
      }
      ul {
        // margin-left: 0;
        margin-top: 20px;
      }
      ul li {
        margin-bottom: 20px;
        .label {
          display: inline-block;
          width: 30%;
          color: map-get($fontColor, light);
          font-weight: 500;
        }
        .label {
          color: map-get($fontColor, normal);
        }
        .item-input {
          width: 200px;
        }
        ::v-deep {
          .el-checkbox {
            .el-checkbox__label {
              color: map-get($fontColor, light);
            }
          }
        }
      }
      .input-with-select {
        width: 90px;
      }
    }
  }
  .notification-footer {
    flex: 0 0 auto;
    width: 100%;
    padding: 0 20px;
    line-height: 60px;
    height: 60px;
    text-align: right;
    border-top: 1px solid map-get($borderColor, light);
  }
}

// .notification-main {
//   display: flex;
//   flex-direction: column;
//   justify-content: space-between;
//   height: 100%;
//   .notification-left-sidebar {
//     background: rgba(250, 250, 250, 1);
//     border: 1px solid rgba(230, 230, 232, 1);
//     width: 250px;
//     .title {
//       height: 14px;
//       font-size: 14px;
//       font-weight: bold;
//       color: rgba(51, 51, 51, 1);
//       line-height: 34px;
//       margin: 30px 20px;
//     }
//     ul li {
//       height: 44px;
//       font-size: 12px;
//       font-weight: 400;
//       color: rgba(102, 102, 102, 1);
//       line-height: 44px;
//       background: rgba(238, 238, 238, 1);
//       padding-left: 20px;
//       cursor: pointer;
//     }
//   }
//   .notification-right-list {
//     width: 100%;
//     flex: 1;
//     display: flex;
//     flex-direction: column;
//     overflow: hidden;
//     padding-left: 20px;
//   }

// }
.pagination {
  float: right;
  margin-top: 10px;
}
</style>
<style lang="scss">
.notification {
  .el-tabs__item {
    height: 32px;
    line-height: 32px;
    font-size: 12px;
  }
}
</style>
