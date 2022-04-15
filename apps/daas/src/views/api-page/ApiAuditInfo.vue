<template>
  <section class="apiaudit-info-wrap section-wrap">
    <div class="details-box bg-white p-6 rounded-2">
      <div class="title fs-7 fw-sub font-color-normal">{{ $t('apiaudit_log_info') }}</div>
      <ElRow class="pt-4">
        <ElCol class="font-color-light pb-4" :span="12"> <span>API ID </span>:{{ auditData.id }}</ElCol>
        <ElCol class="font-color-light pb-4" :span="12"
          ><span>{{ $t('apiaudit_name') }}</span
          >: {{ auditData.name }}</ElCol
        >
        <ElCol class="font-color-light" :span="12"
          ><span>{{ $t('apiaudit_link') }}</span
          >: {{ auditData.apiPath }}</ElCol
        >
        <ElCol class="font-color-light" :span="12"
          ><span>{{ $t('apiaudit_interview_time') }}</span
          >: {{ auditData.createAt }}</ElCol
        >
      </ElRow>
    </div>
    <div class="details-box bg-white p-6 mt-6 rounded-2">
      <ul class="flex flex-row justify-content-center">
        <li v-for="item in list" :key="item.key" class="details-box-item">
          <div class="fs-8 font-color-light">{{ item.label }}</div>
          <div class="link-primary fs-2 din-font">{{ item.value }}</div>
        </li>
      </ul>
    </div>

    <div class="details-box bg-white p-6 mt-6 rounded-2">
      <div class="title fs-7 fw-sub font-color-normal">{{ $t('apiaudit_parameter') }}</div>
      <div class="pt-4 editor-box">
        <CodeEditor
          v-model="auditData.reqParams"
          ref="editor"
          lang="javascript"
          height="200"
          :options="{ readOnly: true }"
        ></CodeEditor>
      </div>
    </div>
  </section>
</template>

<script>
import CodeEditor from '@/components/CodeEditor'
export default {
  name: 'ApiAudit',
  components: { CodeEditor },
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
          }
        })
    }
  }
}
</script>
<style lang="scss" scoped>
.apiaudit-info-wrap {
  .details-box-item {
    padding: 0 20px;
    text-align: center;
  }
}
</style>
