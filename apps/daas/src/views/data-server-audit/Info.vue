<script>
import { fetchApiCall } from '@tap/api'
import PageContainer from '@tap/business/src/components/PageContainer.vue'

import { HighlightCode } from '@tap/form/src/components/highlight-code'
import { calcUnit } from '@tap/shared'
import dayjs from 'dayjs'
import { formatMs } from '@/utils/util'

export default {
  components: { HighlightCode, PageContainer },
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
      fetchApiCall(id)
        .then((data) => {
          if (data) {
            this.auditData = data
            this.auditData.createAt = data.createAt
              ? dayjs(data.createAt).format('YYYY-MM-DD HH:mm:ss')
              : '-'
            const jsonData = this.auditData.body
              ? this.auditData.body
              : this.auditData.query
                ? this.auditData.query
                : this.auditData.reqParams
            this.auditData.jsonParam = {
              validation: false,
              json: jsonData,
              fullCustomQuery: true,
            }
            try {
              this.auditData.jsonParam.json = jsonData
              this.auditData.jsonParam.validation = true
            } catch (error) {
              console.log(`parseJsonData error: ${error}`)
            }

            this.list.forEach((item) => {
              for (const el of Object.keys(data)) {
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
    calcUnit(...args) {
      return calcUnit(...args)
    },
    handleFormat() {
      this.handleJsonTransformation(2)
    },
    handleCompress() {
      this.handleJsonTransformation(null)
    },
    handleJsonTransformation(indent) {
      try {
        const jsonString = this.auditData?.jsonParam?.json
        if (!jsonString) return
        const isCurrentlyFormatted =
          this.auditData.jsonParam.fullCustomQuery === false
        const isTargetFormat = indent !== null
        if (isTargetFormat === isCurrentlyFormatted) return
        const parsedJson = JSON.parse(jsonString)
        this.auditData.jsonParam.json = JSON.stringify(parsedJson, null, indent)
        this.auditData.jsonParam.fullCustomQuery = !isTargetFormat
      } catch (error) {
        console.error('JSON处理失败:', error)
      }
    },
  },
}
</script>

<template>
  <PageContainer v-loading="loading" mode="auto">
    <section class="apiaudit-info-wrap">
      <div class="details-box">
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
      <div class="details-box py-6 mt-6 rounded-2">
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
                class="color-primary pt-4 din-font details-box-item-num"
              >
                {{ formatDuring(item.value) }}
              </div>
              <div
                v-else-if="item.value > 0 && ['speed'].includes(item.key)"
                class="color-primary pt-4 din-font details-box-item-num"
              >
                {{ item.value ? `${calcUnit(item.value, 'b')}/S` : '0 M/S' }}
              </div>
              <div
                v-else
                class="color-primary pt-4 din-font details-box-item-num"
              >
                {{ item.value }}
              </div>
            </div>
            <div v-if="item.key !== 'averResponseTime'" class="line" />
          </li>
        </ul>
      </div>

      <div class="details-box flex-1 mt-6 rounded-2">
        <div class="title fs-7 fw-sub font-color-dark jc-between">
          {{ $t('apiaudit_parameter') }}
          <el-button
            v-if="
              auditData &&
              auditData.jsonParam &&
              auditData.jsonParam.fullCustomQuery
            "
            text
            @click="handleFormat"
          >
            <el-icon class="mr-1"><i-mingcute:brush-line /></el-icon>
            {{ $t('public_format') }}
          </el-button>
          <el-button v-else text @click="handleCompress">
            <el-icon class="mr-1"><i-mingcute:download2Line /></el-icon>
            {{ $t('public_format_compress') }}
          </el-button>
        </div>
        <div v-if="auditData" class="pt-4 editor-box">
          <HighlightCode
            v-if="auditData.jsonParam && auditData.jsonParam.validation"
            class="custom-where-pre where-pre rounded-xl"
            :code="auditData.jsonParam.json"
            language="json"
            copy
          />
          <pre v-else class="editor-pre">{{
            !auditData.jsonParam || !auditData.jsonParam.json
              ? ''
              : auditData.jsonParam.json
          }}</pre>
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

  .where-pre {
    max-height: 14rem;
    overflow: auto;
  }

  .editor-pre {
    height: 250px;
    padding: 20px;
    margin: 0;
    color: var(--text-normal);
    background-color: var(--bg-disable);
    border-radius: 2px;
  }
}
.jc-between {
  display: flex;
  align-items: center;
  justify-items: center;
  justify-content: space-between;
}
</style>
