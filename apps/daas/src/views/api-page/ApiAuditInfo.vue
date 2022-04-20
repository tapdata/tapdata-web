<template>
  <section class="apiaudit-info-wrap section-wrap">
    <div class="details-box bg-white p-6 rounded-2">
      <div class="title fs-7 fw-sub font-color-dark">{{ $t('apiaudit_log_info') }}</div>
      <ElRow class="pt-4" v-if="auditData">
        <ElCol class="font-color-normal pb-4" :span="12">
          <span class="font-text"> API ID:</span> <span>{{ auditData.id ? auditData.id : '-' }}</span></ElCol
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
        <!-- <CodeEditor
          v-model="auditData.reqParams"
          ref="editor"
          lang="javascript"
          height="200"
          :options="{ readOnly: true }"
        ></CodeEditor> -->
      </div>
    </div>
  </section>
</template>

<script>
// import CodeEditor from '@/components/CodeEditor'
import { formatMs } from '@/utils/util'
export default {
  name: 'ApiAudit',
  // components: { CodeEditor },
  data() {
    return {
      auditData: null,
      list: [
        { label: this.$t('apiaudit_access_records'), key: 'visitTotalCount', value: 0 },
        { label: this.$t('apiaudit_access_bandwidth'), key: 'visitTotal', value: 0 },
        { label: this.$t('apiaudit_average_access_rate'), key: 'speed', value: 0 },
        { label: this.$t('apiaudit_access_time'), key: 'latency', value: 0 },
        { label: this.$t('apiaudit_average_response_time'), key: 'averResponseTime', value: 0 }
      ]
    }
  },
  created() {
    this.getData()
  },
  mounted() {},
  methods: {
    // 获取数据
    getData() {
      let id = this.$route.params?.id
      return this.$api('ApiCalls')
        .get([id])
        .then(res => {
          if (res) {
            this.auditData = res.data
            this.auditData.createAt = res.data['createAt']
              ? this.$moment(res.data['createAt']).format('YYYY-MM-DD HH:mm:ss')
              : '-'

            this.list.forEach(item => {
              for (let el in res.data) {
                if (item.key === el) {
                  item.value = res.data[el]
                }
              }
            })
          }
        })
    },
    formatDuring(mss) {
      let time = ''
      // let days = parseInt(mss / (1000 * 60 * 60 * 24))
      // let hours = parseInt((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      let minutes = parseInt((mss % (1000 * 60 * 60)) / (1000 * 60))
      let seconds = (mss % (1000 * 60)) / 1000
      if (minutes > 0) {
        time = minutes.toFixed(2) + 'min'
      } else if (!minutes && seconds > 0) {
        time = seconds.toFixed(2) + 's'
      } else if (!minutes && !seconds && mss > 0) {
        time = mss.toFixed(2) + 'ms'
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
    background-color: #f5f6f8;
    border-radius: 2px;
  }
}
</style>
