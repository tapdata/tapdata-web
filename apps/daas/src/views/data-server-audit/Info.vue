<script>
import { apiCallsApi } from '@tap/api'
import PageContainer from '@tap/business/src/components/PageContainer.vue'

import { calcUnit } from '@tap/shared'
import dayjs from 'dayjs'
import { formatMs } from '@/utils/util'

export default {
  components: { PageContainer },
  data() {
    return {
      auditData: null,
      loading: true,
      list: [
        {
          label: this.$t('apiaudit_access_records'),
          key: 'visitTotalCount',
          value: 0,
        },
        {
          label: this.$t('apiaudit_average_access_rate'),
          key: 'speed',
          value: 0,
        },
        { label: this.$t('apiaudit_access_time'), key: 'latency', value: 0 },
        {
          label: this.$t('apiaudit_average_response_time'),
          key: 'averResponseTime',
          value: 0,
        },
      ],
    }
  },
  created() {
    this.getData()
  },
  methods: {
    // 获取数据
    getData() {
      const id = this.$route.params?.id
      this.loading = true
      apiCallsApi
        .get([id])
        .then((data) => {
          if (data) {
            this.auditData = data
            this.auditData.createAt = data.createAt
              ? dayjs(data.createAt).format('YYYY-MM-DD HH:mm:ss')
              : '-'

            this.list.forEach((item) => {
              for (const el in data) {
                if (item.key === el) {
                  item.value = data[el]
                }
              }
            })
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    formatDuring(mss) {
      let time = ''
      const minutes = Number.parseInt((mss % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = (mss % (1000 * 60)) / 1000
      if (minutes > 1) {
        time = `${minutes.toFixed(2)}min`
      } else if (minutes < 1 && seconds > 1) {
        time = `${seconds.toFixed(2)}s`
      } else if (minutes < 1 && seconds < 1 && mss > 0) {
        time = `${mss}ms`
      }
      return time
    },
    formatMs(ms) {
      return formatMs(ms)
    },
    calcUnit() {
      return calcUnit(...arguments)
    },
  },
}
</script>

<template>
  <PageContainer mode="auto">
    <section v-loading="loading" class="apiaudit-info-wrap">
      <div class="details-box bg-white rounded-2">
        <div class="title fs-7 fw-sub font-color-dark">
          {{ $t('apiaudit_log_info') }}
        </div>
        <ElRow v-if="auditData" class="pt-4">
          <ElCol class="font-color-normal pb-4" :span="12">
            <span class="font-text"> API ID:</span>
            <span class="fw-sub">{{
              auditData.apiId ? auditData.apiId : '-'
            }}</span></ElCol
          >
          <ElCol class="font-color-normal pb-4" :span="12"
            ><span class="font-text">{{ $t('apiaudit_name') }}:</span>
            <span class="fw-sub">{{ auditData.name || '-' }}</span></ElCol
          >
          <ElCol class="font-color-normal pb-4" :span="12"
            ><span class="font-text">{{ $t('apiaudit_link') }}:</span>
            <span class="fw-sub">{{ auditData.apiPath || '-' }}</span></ElCol
          >
          <ElCol class="font-color-normal pb-4" :span="12"
            ><span class="font-text">{{ $t('apiaudit_interview_time') }}:</span>
            <span class="fw-sub"> {{ auditData.createAt }}</span></ElCol
          >
          <ElCol class="font-color-normal pb-4" :span="12"
            ><span class="font-text">{{ $t('apiaudit_ip') }}:</span>
            <span class="fw-sub break-all"> {{ auditData.userIp }}</span></ElCol
          >
        </ElRow>
      </div>
      <div class="details-box bg-white py-6 mt-6 rounded-2">
        <ul class="flex flex-row justify-content-center">
          <li
            v-for="item in list"
            :key="item.key"
            class="details-box-item flex flex-sm-row justify-content-between text-center align-items-center"
          >
            <div class="w-100 text-center">
              <div class="fs-8 font-color-normal">{{ item.label }}</div>
              <div
                v-if="
                  item.value > 0 &&
                  ['latency', 'averResponseTime'].includes(item.key)
                "
                class="link-primary pt-4 din-font details-box-item-num"
              >
                {{ formatDuring(item.value) }}
              </div>
              <div
                v-else-if="item.value > 0 && ['speed'].includes(item.key)"
                class="link-primary pt-4 din-font details-box-item-num"
              >
                {{ item.value ? `${calcUnit(item.value, 'b')}/S` : '0 M/S' }}
              </div>
              <div
                v-else
                class="link-primary pt-4 din-font details-box-item-num"
              >
                {{ item.value }}
              </div>
            </div>
            <div v-if="item.key !== 'averResponseTime'" class="line" />
          </li>
        </ul>
      </div>

      <div class="details-box flex-1 bg-white mt-6 rounded-2">
        <div class="title fs-7 fw-sub font-color-dark">
          {{ $t('apiaudit_parameter') }}
        </div>
        <div v-if="auditData" class="pt-4 editor-box">
          <pre class="editor-pre">{{ auditData.body ? auditData.body : (auditData.query ? auditData.query : auditData.reqParams) }}</pre>
        </div>
      </div>
    </section>
  </PageContainer>
</template>

<style lang="scss" scoped>
.apiaudit-info-wrap {
  .details-box-item {
    flex: 1;
    text-align: center;
    .line {
      width: 1px;
      height: 58px;
      background-color: #f2f2f2;
    }

    .details-box-item-num {
      font-size: 30px;
    }
  }
  .font-text {
    display: inline-block;
    width: 80px;
  }
  .editor-pre {
    height: 200px;
    padding: 20px;
    margin: 0;
    color: var(--text-normal);
    background-color: var(--bg-disable);
    border-radius: 2px;
  }
}
</style>
