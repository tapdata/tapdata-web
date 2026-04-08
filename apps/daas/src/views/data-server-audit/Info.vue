<script setup lang="ts">
import { fetchApiCall } from '@tap/api/src/core/api-calls'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import { HighlightCode } from '@tap/form/src/components/highlight-code'
import { useI18n } from '@tap/i18n'
import { calcUnit } from '@tap/shared'
import dayjs from 'dayjs'
import { reactive, ref } from 'vue'
import { useRoute } from 'vue-router'

const { t } = useI18n()
const route = useRoute()

const auditData = ref<any>(null)
const loading = ref(true)

const list = reactive([
  { label: t('apiaudit_access_records'), key: 'visitTotalCount', value: 0 },
  { label: t('apiaudit_total_records'), key: 'totalRows', value: 0 },
  { label: t('apiaudit_average_access_rate'), key: 'speed', value: 0 },
  { label: t('apiaudit_access_time'), key: 'latency', value: 0 },
  {
    label: t('apiaudit_average_response_time'),
    key: 'dataQueryTotalTime',
    value: 0,
  },
])

function getData() {
  const id = route.params?.id as string
  loading.value = true
  fetchApiCall(id)
    .then((data: any) => {
      if (data) {
        auditData.value = data
        auditData.value.createAt = data.createAt
          ? dayjs(data.createAt).format('YYYY-MM-DD HH:mm:ss')
          : '-'
        auditData.value.reqTime = auditData.value.reqTime
          ? dayjs(auditData.value.reqTime).format('YYYY-MM-DD HH:mm:ss')
          : '-'
        const jsonData = auditData.value.body
          ? auditData.value.body
          : auditData.value.query
            ? auditData.value.query
            : auditData.value.reqParams
        auditData.value.jsonParam = {
          validation: false,
          json: jsonData,
          fullCustomQuery: true,
        }
        try {
          auditData.value.jsonParam.json = jsonData
          auditData.value.jsonParam.validation = true
        } catch (error) {
          console.error(`parseJsonData error: ${error}`)
        }

        list.forEach((item) => {
          for (const el of Object.keys(data)) {
            if (item.key === el) {
              item.value = data[el]
            }
          }
        })
      }
    })
    .finally(() => {
      loading.value = false
    })
}

function formatDuring(mss: number) {
  let time = ''
  const minutes = Math.floor((mss % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = (mss % (1000 * 60)) / 1000
  if (minutes > 1) {
    time = `${minutes.toFixed(2)}min`
  } else if (minutes < 1 && seconds > 1) {
    time = `${seconds.toFixed(2)}s`
  } else if (minutes < 1 && seconds < 1 && mss > 0) {
    time = `${mss}ms`
  }
  return time
}

function formatReqHeaders(headers: any) {
  if (typeof headers === 'string') return headers
  try {
    return JSON.stringify(headers, null, 2)
  } catch {
    return String(headers)
  }
}

function handleFormat() {
  handleJsonTransformation(2)
}

function handleCompress() {
  handleJsonTransformation(null)
}

function handleJsonTransformation(indent: number | null) {
  try {
    const jsonString = auditData.value?.jsonParam?.json
    if (!jsonString) return
    const isCurrentlyFormatted =
      auditData.value.jsonParam.fullCustomQuery === false
    const isTargetFormat = indent !== null
    if (isTargetFormat === isCurrentlyFormatted) return
    const parsedJson = JSON.parse(jsonString)
    auditData.value.jsonParam.json = JSON.stringify(
      parsedJson,
      null,
      indent ?? undefined,
    )
    auditData.value.jsonParam.fullCustomQuery = !isTargetFormat
  } catch (error) {
    console.error('JSON处理失败:', error)
  }
}

// 初始化
getData()
</script>

<template>
  <PageContainer v-loading="loading" mode="auto">
    <template #back>
      <el-button text class="mr-1" @click="$router.back()">
        <template #icon>
          <VIcon>left</VIcon>
        </template>
      </el-button>
    </template>
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
            <span class="fw-sub"> {{ auditData.reqTime }}</span></ElCol
          >
          <ElCol class="font-color-normal pb-4" :span="12"
            ><span class="font-text">{{ $t('apiaudit_ip') }}:</span>
            <span class="fw-sub break-all"> {{ auditData.userIp }}</span></ElCol
          >
          <ElCol class="font-color-normal pb-4" :span="12"
            ><span class="font-text">{{ $t('apiaudit_access_type') }}:</span>
            <span class="fw-sub">{{ auditData.method || '-' }}</span></ElCol
          >
          <ElCol class="font-color-normal pb-4" :span="12"
            ><span class="font-text align-middle"
              >{{ $t('apiaudit_visit_result') }}:</span
            >
            <span
              v-if="!auditData.failed"
              class="status-badge status-badge--success"
            >
              <span class="status-badge__dot" />
              {{ auditData.code }} {{ $t('apiaudit_success') }}
            </span>
            <span v-else class="status-badge status-badge--danger">
              <span class="status-badge__dot" />
              {{ auditData.code }} {{ $t('public_status_failed') }}
            </span>
          </ElCol>
          <ElCol
            v-if="auditData.failed && auditData.codeMsg"
            class="font-color-normal pb-4"
            :span="24"
            ><span class="font-text">{{ $t('apiaudit_reason_fail') }}:</span>
            <span class="fw-sub" style="color: var(--el-color-danger)">{{
              auditData.codeMsg
            }}</span></ElCol
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
                  ['latency', 'dataQueryTotalTime'].includes(item.key)
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

      <div
        v-if="auditData && auditData.reqHeaders"
        class="details-box flex-1 mt-6 rounded-2"
      >
        <div class="title fs-7 fw-sub font-color-dark">
          {{ $t('public_request_headers') }}
        </div>
        <div class="editor-box">
          <HighlightCode
            class="custom-where-pre where-pre rounded-xl"
            :code="formatReqHeaders(auditData.reqHeaders)"
            language="json"
            copy
          />
        </div>
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
            <el-icon class="mr-1"><i-mingcute-brush-line /></el-icon>
            {{ $t('public_format') }}
          </el-button>
          <el-button v-else text @click="handleCompress">
            <el-icon class="mr-1"><i-mingcute-download2Line /></el-icon>
            {{ $t('public_format_compress') }}
          </el-button>
        </div>
        <div v-if="auditData" class="editor-box">
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
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    &__dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      display: inline-block;
    }
    &--success {
      color: var(--color-success);
      .status-badge__dot {
        background-color: var(--color-success);
      }
    }
    &--danger {
      color: var(--color-danger);
      .status-badge__dot {
        background-color: var(--color-danger);
      }
    }
  }
}
.jc-between {
  display: flex;
  align-items: center;
  justify-items: center;
  justify-content: space-between;
}
</style>
