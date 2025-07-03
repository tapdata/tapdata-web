<script>
import { findOneSetting } from '@tap/api'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import { notificationMAP } from '../notification/tyepMap'

export default {
  name: 'List',
  components: { PageContainer },
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
      findOneSetting('76')
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
  <PageContainer
    mode="auto"
    content-class="flex-1 gap-6 min-h-0 overflow-auto px-6 position-relative"
  >
    <div v-loading="loading" class="notification">
      <ElAlert
        class="mb-4"
        :closable="false"
        :title="$t('notify_tip')"
        type="info"
        show-icon
      />
      <div class="notification-main">
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
      <div class="position-sticky py-6 bottom-0 border-top bg-white z-10">
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
    </div>
  </PageContainer>
</template>

<style lang="scss" scoped>
$unreadColor: #ee5353;
.notification {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: var(--font-base-title);
  .notification-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 54px;
    font-size: var(--font-base-title);
    color: var(--color-primary);
    padding: 20px 20px 0 24px;
    .title {
      font-size: 14px;
      font-weight: bold;
      color: var(--text-dark);
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
    .notification-tip {
      padding-top: 5px;
      span {
        padding: 4px 100px 4px 20px;
        font-size: var(--font-base-title);
        white-space: nowrap;
        color: var(--text-light);
        border: 1px solid var(--border-light);
        border-left: 2px solid var(--color-primary);
        box-sizing: border-box;
      }
    }
    .run-notification {
      .title {
        font-size: var(--font-base-title);
        font-weight: bold;
        color: var(--text-dark);
        line-height: 32px;
        margin-bottom: 20px;
      }
      .notice,
      .email {
        color: var(--text-light);
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
          color: var(--text-light);
          font-weight: 500;
        }
        .label {
          color: var(--text-normal);
        }
        .item-input {
          width: 200px;
        }

        :deep(.el-checkbox) {
          .el-checkbox__label {
            color: var(--text-light);
          }
        }
      }
      .input-with-select {
        width: 90px;
      }
    }
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
