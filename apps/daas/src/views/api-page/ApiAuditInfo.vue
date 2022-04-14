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
      <ul>
        <li></li>
      </ul>
    </div>
  </section>
</template>

<script>
export default {
  name: 'ApiAudit',
  data() {
    return {
      auditData: null,
      list: {
        access_records: ''
      }
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
}
</style>
