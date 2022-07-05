<template>
  <section v-loading="loading" class="apiaudit-info-wrap section-wrap">
    <div class="details-box bg-white p-6 rounded-2">
      <div class="title fs-7 fw-sub font-color-dark">{{ $t('apiaudit_log_info') }}</div>
      <ElRow class="pt-4" v-if="auditData">
        <ElCol class="font-color-normal pb-4" :span="12">
          <span class="font-text"> API ID:</span>
          <span class="fw-sub">{{ auditData.id ? auditData.id : '-' }}</span></ElCol
        >
        <ElCol class="font-color-normal pb-4" :span="12"
          ><span class="font-text">{{ $t('apiaudit_name') }}:</span>
          <span class="fw-sub">{{ auditData.name || '-' }}</span></ElCol
        >
        <ElCol class="font-color-normal" :span="12"
          ><span class="font-text">{{ $t('apiaudit_link') }}:</span>
          <span class="fw-sub">{{ auditData.apiPath || '-' }}</span></ElCol
        >
        <ElCol class="font-color-normal" :span="12"
          ><span class="font-text">{{ $t('apiaudit_interview_time') }}:</span>
          <span class="fw-sub"> {{ auditData.createAt }}</span></ElCol
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
              class="link-primary pt-4 din-font details-box-item-num"
              v-if="item.value > 0 && ['latency', 'averResponseTime'].includes(item.key)"
            >
              {{ formatDuring(item.value) }}
            </div>
            <div v-else class="link-primary pt-4 din-font details-box-item-num">
              {{ item.value }}
            </div>
          </div>
          <div class="line" v-if="item.key !== 'averResponseTime'"></div>
        </li>
      </ul>
    </div>

    <div class="details-box flex-1 bg-white p-6 mt-6 rounded-2">
      <div class="title fs-7 fw-sub font-color-dark">{{ $t('apiaudit_parameter') }}</div>
      <div class="pt-4 editor-box" v-if="auditData">
        <pre class="editor-pre">{{ auditData.reqParams }}</pre>
      </div>
    </div>
  </section>
</template>

<script>
import { formatMs } from '@/utils/util'
import dayjs from 'dayjs'
import { apiCallsApi } from '@tap/api'

export default {
  name: 'ApiAudit',
  data() {
    return {
      auditData: null,
      loading: true,
      list: [
        { label: this.$t('apiaudit_access_records'), key: 'visitTotalCount', value: 0 },
        { label: this.$t('apiaudit_average_access_rate'), key: 'speed', value: 0 },
        { label: this.$t('apiaudit_access_time'), key: 'latency', value: 0 },
        { label: this.$t('apiaudit_average_response_time'), key: 'averResponseTime', value: 0 }
      ]
    }
  },
  created() {
    this.getData()
  },
  methods: {
    // 获取数据
    getData() {
      let id = this.$route.params?.id
      this.loading = true
      apiCallsApi
        .get([id])
        .then(data => {
          if (data) {
            this.auditData = data
            this.auditData.createAt = data['createAt'] ? dayjs(data['createAt']).format('YYYY-MM-DD HH:mm:ss') : '-'

            this.list.forEach(item => {
              for (let el in data) {
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
      let minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60))
      let seconds = (mss % (1000 * 60)) / 1000
      if (minutes > 1) {
        time = minutes.toFixed(2) + 'min'
      } else if (minutes < 1 && seconds > 1) {
        time = seconds.toFixed(2) + 's'
      } else if (minutes < 1 && seconds < 1 && mss > 0) {
        time = mss + 'ms'
      }
      return time
    },
    formatMs(ms) {
      return formatMs(ms)
    }
  }
}
</script>
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
    color: map-get($fontColor, normal);
    background-color: map-get($bgColor, disable);
    border-radius: 2px;
  }
}
</style>
