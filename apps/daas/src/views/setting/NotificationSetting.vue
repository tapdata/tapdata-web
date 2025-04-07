<script>
import { settingsApi } from '@tap/api'
import { notificationMAP } from '../notification/tyepMap'

export default {
  name: 'List',
  data() {
    return {
      notificationMAP,
      runNotification: [],
      systemNotification: [],
      agentNotification: [],
      loading: false,
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
        .then((data) => {
          const value = JSON.parse(data?.value || '{}')
          this.runNotification = value.runNotification
          this.systemNotification = value.systemNotification
          this.agentNotification = value.agentNotification
        })
        .finally(() => {
          this.loading = false
        })
    },
    submit() {
      const where = {
        _id: '76',
      }
      const data = {
        runNotification: this.runNotification,
        systemNotification: this.systemNotification,
        agentNotification: this.agentNotification,
      }
      if (!data) {
        return
      }
      settingsApi
        .enterpriseUpdate(where, data)
        .then(() => {
          this.$message.success(this.$t('public_message_save_ok'))
        })
        .finally(() => {
          this.loading = false
        })
    },
  },
}
</script>

<template>
  <div v-loading="loading" class="notification">
    <div class="notification-head">
      <div class="title">{{ $t('notify_system_notice') }}</div>
    </div>
    <div class="notification-main" style="overflow-y: auto">
      <section class="notification-tip">
        <span> {{ $t('notify_tip') }}</span>
      </section>
      <section
        v-show="runNotification && runNotification.length > 0"
        class="run-notification"
      >
        <span class="title">{{ $t('notify_job_operation_notice') }}</span>
        <ul>
          <li v-for="(item, index) in runNotification" :key="index">
            <span class="label">{{ notificationMAP[item.label] }}</span>
            <el-checkbox v-model="item.notice" class="notice">{{
              $t('notify_system_notice')
            }}</el-checkbox>
            <!--<el-checkbox class="email" v-model="item.email">{{ $t('notify_email_notice') }}</el-checkbox>-->
            <div v-if="item.lagTime" class="mt-4">
              <span v-if="item.lagTime" class="label">{{
                notificationMAP[item.lagTime]
              }}</span>
              <span v-if="item.label === 'CDCLagTime'">
                <el-input
                  v-model="item.lagTimeInterval"
                  class="item-input"
                  onkeyup="this.value=this.value.replace(/[^\d]/g,'') "
                  onafterpaste="this.value=this.value.replace(/[^\d]/g,'') "
                >
                  <template #append>
                    <el-select
                      v-model="item.lagTimeUtil"
                      :placeholder="$t('public_select_placeholder')"
                      class="input-with-select"
                    >
                      <el-option label="hour" value="hour" />
                      <el-option label="second" value="second" />
                    </el-select>
                  </template>
                </el-input>
              </span>
            </div>

            <div v-if="item.noticeInterval && item.email" class="mt-4">
              <span v-if="item.noticeInterval && item.email" class="label">
                {{ notificationMAP[item.noticeInterval] }}
              </span>
              <span v-if="item.label === 'CDCLagTime' && item.email">
                <el-input
                  v-model="item.noticeIntervalInterval"
                  class="item-input"
                  onkeyup="this.value=this.value.replace(/[^\d]/g,'') "
                  onafterpaste="this.value=this.value.replace(/[^\d]/g,'') "
                >
                  <template #append>
                    <el-select
                      v-model="item.noticeIntervalUtil"
                      :placeholder="$t('public_select_placeholder')"
                      class="input-with-select"
                    >
                      <el-option label="hour" value="hour" />
                      <el-option label="second" value="second" />
                    </el-select>
                  </template>
                </el-input>
              </span>
              <span v-if="item.label === 'jobEncounterError' && item.email">
                <el-input
                  v-model="item.Interval"
                  class="item-input"
                  onkeyup="this.value=this.value.replace(/[^\d]/g,'') "
                  onafterpaste="this.value=this.value.replace(/[^\d]/g,'') "
                >
                  <template #append>
                    <el-select
                      v-model="item.util"
                      :placeholder="$t('public_select_placeholder')"
                      class="input-with-select"
                    >
                      <el-option label="hour" value="hour" />
                      <el-option label="second" value="second" />
                    </el-select>
                  </template>
                </el-input>
              </span>
            </div>
          </li>
        </ul>
      </section>
      <section
        v-show="systemNotification && systemNotification.length > 0"
        class="run-notification"
      >
        <span class="title">{{ $t('notify_system_setting') }}</span>
        <ul>
          <li v-for="(item, index) in systemNotification" :key="index">
            <span class="label">{{ notificationMAP[item.label] }}</span>
            <el-checkbox v-model="item.notice" class="notice">{{
              $t('notify_system_notice')
            }}</el-checkbox>
            <!--<el-checkbox class="email" v-model="item.email">{{ $t('notify_email_notice') }}</el-checkbox>-->
          </li>
        </ul>
      </section>
      <section
        v-show="agentNotification && agentNotification.length > 0"
        class="run-notification"
      >
        <span class="title">{{ $t('notification_agentNotice') }}</span>
        <ul>
          <li v-for="(item, index) in agentNotification" :key="index">
            <span class="label">{{ notificationMAP[item.label] }}</span>
            <el-checkbox v-model="item.notice" class="notice">{{
              $t('notify_system_notice')
            }}</el-checkbox>
            <!--<el-checkbox class="email" v-model="item.email">{{ $t('notify_email_notice') }}</el-checkbox>-->
          </li>
        </ul>
      </section>
    </div>
    <div class="notification-footer">
      <ElButton
        class="btn"
        type="primary"
        :disabled="
          !runNotification || !systemNotification || !agentNotification
        "
        @click="submit"
        >{{ $t('public_button_save') }}</ElButton
      >
    </div>
    <!-- <div class="notification-main">
          <div class="notification-right-list"></div>
        </div> -->
  </div>
</template>

<style lang="scss" scoped>
$unreadColor: #ee5353;
.notification {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  font-size: $fontBaseTitle;
  .notification-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 54px;
    font-size: $fontBaseTitle;
    color: map.get($color, primary);
    padding: 20px 20px 0 24px;
    .title {
      font-size: 14px;
      font-weight: bold;
      color: map.get($fontColor, dark);
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
        font-size: $fontBaseTitle;
        white-space: nowrap;
        color: map.get($fontColor, light);
        border: 1px solid map.get($borderColor, light);
        border-left: 2px solid map.get($color, primary);
        box-sizing: border-box;
      }
    }
    .run-notification {
      margin-top: 15px;
      .title {
        font-size: $fontBaseTitle;
        font-weight: bold;
        color: map.get($fontColor, dark);
        line-height: 32px;
        margin-bottom: 20px;
      }
      .notice,
      .email {
        color: map.get($fontColor, light);
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
          color: map.get($fontColor, light);
          font-weight: 500;
        }
        .label {
          color: map.get($fontColor, normal);
        }
        .item-input {
          width: 200px;
        }

        :deep(.el-checkbox) {
          .el-checkbox__label {
            color: map.get($fontColor, light);
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
    border-top: 1px solid map.get($borderColor, light);
  }
}
</style>

<style lang="scss">
.notification {
  .el-tabs__item {
    height: 32px;
    line-height: 32px;
  }
}
</style>
