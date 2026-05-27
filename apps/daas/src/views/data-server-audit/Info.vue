<script setup lang="ts">
import { fetchApiCall } from '@tap/api/src/core/api-calls'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import { useI18n } from '@tap/i18n'
import { copyToClipboard } from '@tap/shared'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const { t } = useI18n()
const route = useRoute()

const auditData = ref<any>(null)
const loading = ref(true)

const colorMap: Record<string, string> = {
  POST: '#478C6C',
  PATCH: '#F2994B',
  DELETE: '#DB5050',
  GET: '#09819C',
}

function formatBytesMetric(v: any) {
  const num = Number(v)
  if (!Number.isFinite(num) || num <= 0) return { displayValue: '0', unit: 'B' }
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0
  let val = num
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024
    i++
  }
  const text = val >= 100 ? val.toFixed(0) : val.toFixed(1).replace(/\.0$/, '')
  return { displayValue: text, unit: units[i] }
}

function formatMsMetric(v: any) {
  const ms = Number(v)
  if (!Number.isFinite(ms) || ms <= 0) return { displayValue: '0', unit: 'ms' }
  if (ms < 1000) {
    const text = ms >= 100 ? ms.toFixed(0) : ms.toFixed(1).replace(/\.0$/, '')
    return { displayValue: text, unit: 'ms' }
  }
  if (ms < 60_000)
    return {
      displayValue: (ms / 1000).toFixed(2).replace(/\.?0+$/, ''),
      unit: 's',
    }
  return {
    displayValue: (ms / 60_000).toFixed(2).replace(/\.?0+$/, ''),
    unit: 'min',
  }
}

function formatPhaseDuration(ms: number) {
  if (!Number.isFinite(ms) || ms <= 0) return '0 ms'
  if (ms < 1000) {
    return `${ms >= 100 ? ms.toFixed(0) : ms.toFixed(1).replace(/\.0$/, '')} ms`
  }
  if (ms < 60_000) return `${(ms / 1000).toFixed(2).replace(/\.?0+$/, '')} s`
  return `${(ms / 60_000).toFixed(2).replace(/\.?0+$/, '')} min`
}

const HTTP_METHOD_VARIANTS: Record<string, string> = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  PATCH: 'patch',
  DELETE: 'delete',
  HEAD: 'head',
  OPTIONS: 'options',
}

const methodVariant = computed(() => {
  const m = String(auditData.value?.method || '').toUpperCase()
  return HTTP_METHOD_VARIANTS[m] || 'default'
})

const metricsCards = computed(() => {
  const d = auditData.value || {}
  const bytes = formatBytesMetric(d.responseBytes)
  const latency = formatMsMetric(d.latency)
  const httpTime = formatMsMetric(d.httpTime)
  const dbTime = formatMsMetric(d.dataQueryTotalTime)
  const totalRows = Number(d.totalRows) || 0
  const visitTotal = Number(d.visitTotalCount) || 0
  return [
    {
      key: 'responseBytes',
      label: t('apiaudit_response_size'),
      ...bytes,
      accent: false,
    },
    {
      key: 'latency',
      label: t('apiaudit_total_time'),
      ...latency,
      accent: false,
    },
    // {
    //   key: 'httpTime',
    //   label: t('apiaudit_api_time'),
    //   ...httpTime,
    //   accent: false,
    // },
    // {
    //   key: 'dataQueryTotalTime',
    //   label: t('apiaudit_db_time'),
    //   ...dbTime,
    //   accent: false,
    // },
    {
      key: 'totalRows',
      label: t('apiaudit_match_rows'),
      displayValue: String(totalRows),
      unit: '',
      accent: false,
    },
    {
      key: 'visitTotalCount',
      label: t('apiaudit_return_rows'),
      displayValue: String(visitTotal),
      unit: '',
      accent: false,
    },
  ]
})

const executionWindow = computed(() => {
  const d = auditData.value
  if (!d) return null
  const startMs = Number(d.callStart)
  const endMs = Number(d.callEnd)
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return null
  const fmt = (ts: number) => dayjs(ts).format('YYYY-MM-DD HH:mm:ss.SSS')
  return {
    start: fmt(startMs),
    end: fmt(endMs),
  }
})

const timingPhases = computed(() => {
  const d = auditData.value
  if (!d) return []
  const callStart = Number(d.callStart)
  const callEnd = Number(d.callEnd)
  const dbStartRaw = Number(d.dataQueryFromTime)
  const dbEndRaw = Number(d.dataQueryEndTime)

  const reqOk =
    Number.isFinite(callStart) &&
    Number.isFinite(callEnd) &&
    callEnd >= callStart
  const total = reqOk ? Math.max(0, callEnd - callStart) : 0

  const dbStart = Math.min(dbStartRaw, dbEndRaw)
  const dbEnd = Math.max(dbStartRaw, dbEndRaw)
  const dbOk =
    reqOk &&
    Number.isFinite(dbStartRaw) &&
    Number.isFinite(dbEndRaw) &&
    dbStart >= callStart &&
    dbEnd <= callEnd

  let d0 = 0
  let d1 = 0
  let d2 = 0
  if (dbOk) {
    d0 = Math.max(0, dbStart - callStart)
    d1 = Math.max(0, dbEnd - dbStart)
    d2 = Math.max(0, callEnd - dbEnd)
  } else if (reqOk) {
    d0 = total
  }

  const safeTotal = total > 0 ? total : 1
  const p0 = (d0 / safeTotal) * 100
  const p1 = (d1 / safeTotal) * 100
  const p2 = (d2 / safeTotal) * 100

  return [
    {
      key: 'api',
      label: t('apiaudit_phase_api'),
      durationMs: d0,
      percent: total > 0 ? p0 : 0,
      offset: 0,
      variant: 'gray',
      durationText: formatPhaseDuration(d0),
    },
    {
      key: 'db',
      label: t('apiaudit_phase_db'),
      durationMs: d1,
      percent: total > 0 ? p1 : 0,
      offset: total > 0 ? p0 : 0,
      variant: 'orange',
      durationText: formatPhaseDuration(d1),
    },
    {
      key: 'response',
      label: t('apiaudit_phase_response'),
      durationMs: d2,
      percent: total > 0 ? p2 : 0,
      offset: total > 0 ? p0 + p1 : 0,
      variant: 'blue',
      durationText: formatPhaseDuration(d2),
    },
  ]
})

const totalDurationText = computed(() => {
  const d = auditData.value
  if (!d) return '-'
  const ms = Number(d.callEnd) - Number(d.callStart)
  return formatPhaseDuration(ms)
})

const errorTypeLabel = computed(() => {
  const d = auditData.value
  if (!d?.failed) return ''
  return d.errorCode || d.errorType || ''
})

function highlightJson(input: string) {
  if (!input) return ''
  const escaped = String(input)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
  return escaped.replaceAll(
    /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = 'jh-num'
      if (match.startsWith('"')) {
        cls = /:\s*$/.test(match) ? 'jh-key' : 'jh-str'
      } else if (/true|false/.test(match)) {
        cls = 'jh-bool'
      } else if (/null/.test(match)) {
        cls = 'jh-null'
      }
      return `<span class="${cls}">${match}</span>`
    },
  )
}

function jsonToText(v: any) {
  if (v == null) return ''
  if (typeof v === 'string') return v
  try {
    return JSON.stringify(v, null, 2)
  } catch {
    return String(v)
  }
}

const paramsRaw = computed(() => jsonToText(auditData.value?.jsonParam?.json))

const headersRaw = computed(() => jsonToText(auditData.value?.reqHeaders))

const paramsHtml = computed(() => highlightJson(paramsRaw.value))

const headersHtml = computed(() => highlightJson(headersRaw.value))

async function handleCopy(text: string) {
  if (!text) return
  await copyToClipboard(text)
  ElMessage.success(t('public_message_copy_success'))
}

// 获取数据
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
        auditData.value.callStartTime = auditData.value.callStart
          ? dayjs(auditData.value.callStart).format('YYYY-MM-DD HH:mm:ss.SSS')
          : '-'
        auditData.value.callEndTime = auditData.value.callEnd
          ? dayjs(auditData.value.callEnd).format('YYYY-MM-DD HH:mm:ss.SSS')
          : '-'
        auditData.value.dataQueryFrom = auditData.value.dataQueryFromTime
          ? dayjs(auditData.value.dataQueryFromTime).format(
              'YYYY-MM-DD HH:mm:ss.SSS',
            )
          : '-'
        auditData.value.dataQueryEnd = auditData.value.dataQueryEndTime
          ? dayjs(auditData.value.dataQueryEndTime).format(
              'YYYY-MM-DD HH:mm:ss.SSS',
            )
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
      }
    })
    .finally(() => {
      loading.value = false
    })
}

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
    <template #title>
      <div class="apiaudit-header flex align-items-center gap-3">
        <span class="apiaudit-header__title fs-5 font-color-dark lh-8 ellipsis">
          {{ $t('apiaudit_log_info') }}
        </span>
        <span
          v-if="auditData?.method"
          class="status-block color-white"
          :style="{ 'background-color': colorMap[auditData.method] }"
          >{{ auditData.method }}</span
        >
        <el-tag
          v-if="auditData?.method || auditData?.apiPath"
          class="is-code apiaudit-endpoint"
          :disable-transitions="true"
        >
          <span v-if="auditData?.apiPath" class="apiaudit-endpoint__path">
            {{ auditData.apiPath }}
          </span>
        </el-tag>
        <span
          v-if="auditData && !auditData.failed"
          class="status-pill status-pill--success"
        >
          <span class="status-pill__dot" />
          {{ auditData.code }} {{ $t('apiaudit_success') }}
        </span>
        <span v-else-if="auditData" class="status-pill status-pill--danger">
          <span class="status-pill__dot" />
          {{ auditData.code }} {{ $t('public_status_failed') }}
        </span>
      </div>
    </template>

    <section v-if="auditData" class="apiaudit-info">
      <div
        v-if="auditData.failed"
        class="apiaudit-banner apiaudit-banner--error"
      >
        <el-icon class="apiaudit-banner__icon">
          <i-mingcute-alert-line />
        </el-icon>
        <div class="apiaudit-banner__body">
          <div class="apiaudit-banner__title">
            <span class="apiaudit-banner__code">{{ auditData.code }}</span>
            <span class="apiaudit-banner__status">{{
              $t('public_status_failed')
            }}</span>
            <span v-if="errorTypeLabel" class="apiaudit-banner__type">{{
              errorTypeLabel
            }}</span>
          </div>
          <div v-if="auditData.codeMsg" class="apiaudit-banner__msg">
            {{ auditData.codeMsg }}
          </div>
        </div>
      </div>

      <div class="apiaudit-grid">
        <div class="apiaudit-grid__left">
          <div class="apiaudit-card">
            <div class="apiaudit-card__header">
              <h3 class="apiaudit-card__title">
                {{ $t('apiaudit_overview') }}
              </h3>
            </div>
            <dl class="apiaudit-meta">
              <div class="apiaudit-meta__row">
                <dt>{{ $t('apiaudit_visitor_ip') }}</dt>
                <dd class="break-all">{{ auditData.userIp || '-' }}</dd>
              </div>
              <div class="apiaudit-meta__row">
                <dt>{{ $t('apiaudit_name') }}</dt>
                <dd>{{ auditData.name || '-' }}</dd>
              </div>
              <div class="apiaudit-meta__row">
                <dt>API ID</dt>
                <dd>{{ auditData.apiId || '-' }}</dd>
              </div>
            </dl>
          </div>

          <div class="apiaudit-card">
            <div class="apiaudit-card__header">
              <h3 class="apiaudit-card__title">
                {{ $t('apiaudit_parameter') }}
              </h3>
              <el-tooltip
                v-if="paramsRaw"
                :content="$t('public_button_copy')"
                placement="top"
              >
                <button
                  type="button"
                  class="apiaudit-copy-btn"
                  @click="handleCopy(paramsRaw)"
                >
                  <el-icon><i-mingcute-copy-2-line /></el-icon>
                </button>
              </el-tooltip>
            </div>
            <pre
              v-if="paramsHtml"
              class="apiaudit-code"
            ><code v-html="paramsHtml" /></pre>
            <div v-else class="apiaudit-empty">-</div>
          </div>

          <div v-if="auditData.reqHeaders" class="apiaudit-card">
            <div class="apiaudit-card__header">
              <h3 class="apiaudit-card__title">
                {{ $t('public_request_headers') }}
              </h3>
              <el-tooltip :content="$t('public_button_copy')" placement="top">
                <button
                  type="button"
                  class="apiaudit-copy-btn"
                  @click="handleCopy(headersRaw)"
                >
                  <el-icon><i-mingcute-copy-2-line /></el-icon>
                </button>
              </el-tooltip>
            </div>
            <pre class="apiaudit-code"><code v-html="headersHtml" /></pre>
          </div>
        </div>

        <aside class="apiaudit-grid__right">
          <div class="apiaudit-metrics">
            <div
              v-for="m in metricsCards"
              :key="m.key"
              class="apiaudit-metric"
              :class="{ 'is-accent': m.accent }"
            >
              <div class="apiaudit-metric__label">{{ m.label }}</div>
              <div class="apiaudit-metric__value">
                <span class="apiaudit-metric__num">{{ m.displayValue }}</span>
                <span v-if="m.unit" class="apiaudit-metric__unit">{{
                  m.unit
                }}</span>
              </div>
            </div>
          </div>

          <div class="apiaudit-card apiaudit-timing-card">
            <div class="apiaudit-card__header">
              <h3 class="apiaudit-card__title">
                {{ $t('apiaudit_time_line') }}
              </h3>
            </div>
            <div class="apiaudit-timing pt-0">
              <div class="apiaudit-timing__head">
                <div class="apiaudit-timing__head-cell">
                  {{ $t('apiaudit_phase') }}
                </div>
                <div class="apiaudit-timing__head-cell">
                  {{ $t('apiaudit_duration') }}
                </div>
              </div>
              <div
                v-for="phase in timingPhases"
                :key="phase.key"
                class="apiaudit-timing__row"
              >
                <div class="apiaudit-timing__label">{{ phase.label }}</div>
                <div class="apiaudit-timing__track">
                  <div
                    class="apiaudit-timing__bar"
                    :class="`apiaudit-timing__bar--${phase.variant}`"
                    :style="{
                      left: `${phase.offset}%`,
                      width: `${Math.max(phase.percent, phase.durationMs > 0 ? 1 : 0)}%`,
                    }"
                  />
                </div>
                <div class="apiaudit-timing__duration">
                  {{ phase.durationText }}
                </div>
              </div>
              <div class="apiaudit-timing__total">
                <div class="apiaudit-timing__total-label">
                  {{ $t('apiaudit_total') }}
                </div>
                <div class="apiaudit-timing__total-value">
                  {{ totalDurationText }}
                </div>
              </div>
            </div>
            <div
              v-if="executionWindow"
              class="apiaudit-timing__window flex-wrap"
            >
              <el-icon class="apiaudit-timing__window-icon">
                <i-mingcute-time-line />
              </el-icon>
              <div class="apiaudit-timing__window-label">
                {{ $t('apiaudit_execution_window') }}
              </div>
              <div class="apiaudit-timing__window-value">
                {{ executionWindow.start }} → {{ executionWindow.end }}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  </PageContainer>
</template>

<style lang="scss" scoped>
$code-bg: #1e1e1e;
$code-fg: #e5e7eb;
$code-key: #9cdcfe;
$code-str: #ce9178;
$code-num: #b5cea8;
$code-bool: #569cd6;
$code-null: #c586c0;

.apiaudit-header {
  min-width: 0;
  flex: 1;
}

.apiaudit-header__title {
  flex-shrink: 0;
}

.apiaudit-url {
  font-family:
    'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 13px;
  color: var(--text-light, #6b7280);
  background: rgba(0, 0, 0, 0.03);
  padding: 2px 8px;
  border-radius: 4px;
  min-width: 0;
}

.apiaudit-endpoint {
  display: inline-flex;
  align-items: center;
  gap: 0;
  padding: 0;
  min-width: 0;
  overflow: hidden;

  :deep(.el-tag__content) {
    display: inline-flex;
    align-items: center;
    min-width: 0;
    gap: 0;
  }
}

.apiaudit-endpoint__method {
  display: inline-flex;
  align-items: center;
  align-self: stretch;
  padding: 0 8px;
  font-family:
    'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.4px;
  color: #fff;
  flex-shrink: 0;

  &--get {
    background: #16a34a;
  }
  &--post {
    background: #2563eb;
  }
  &--put {
    background: #d97706;
  }
  &--patch {
    background: #7c3aed;
  }
  &--delete {
    background: #dc2626;
  }
  &--head,
  &--options {
    background: #475569;
  }
  &--default {
    background: #6b7280;
  }
}

.apiaudit-endpoint__path {
  padding: 0 8px;
  font-family:
    'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.apiaudit-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.apiaudit-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid;

  &--error {
    background: #fef2f2;
    border-color: #fecaca;
    color: #991b1b;
  }

  &__icon {
    margin-top: 2px;
    font-size: 18px;
    color: #dc2626;
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 14px;
  }

  &__code {
    font-family:
      'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  }

  &__type {
    font-weight: 500;
    font-size: 12px;
    background: rgba(220, 38, 38, 0.1);
    padding: 1px 6px;
    border-radius: 4px;
  }

  &__msg {
    margin-top: 4px;
    font-size: 13px;
    color: #7f1d1d;
    word-break: break-word;
  }
}

.apiaudit-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

.apiaudit-grid__left,
.apiaudit-grid__right {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.apiaudit-grid__right {
  position: sticky;
  top: 0;
}

.apiaudit-card {
  background: var(--bg-card);
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  border: 1px solid var(--el-border-color-lighter);
  padding: 16px 20px;
}

.apiaudit-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.apiaudit-card__title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-dark, #1f2937);
}

.apiaudit-copy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-light, #6b7280);
  cursor: pointer;
  font-size: 15px;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    background: var(--el-fill-color-light);
    color: var(--text-dark, #1f2937);
  }

  &:active {
    background: #e5e7eb;
  }
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;

  &__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  &--success {
    color: #15803d;
    /* background: #dcfce7; */

    .status-pill__dot {
      background: #16a34a;
    }
  }

  &--danger {
    color: #b91c1c;
    /* background: #fee2e2; */

    .status-pill__dot {
      background: #dc2626;
    }
  }
}

.apiaudit-meta {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px 24px;
}

.apiaudit-meta__row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;

  &--full {
    grid-column: 1 / -1;
  }

  dt {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: var(--text-light, #6b7280);
  }

  dd {
    margin: 0;
    font-size: 13px;
    color: var(--text-dark, #1f2937);
    word-break: break-all;
    font-family:
      'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  }
}

.apiaudit-code {
  margin: 0;
  background: $code-bg;
  color: $code-fg;
  border-radius: 8px;
  padding: 14px 16px;
  font-family:
    'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12.5px;
  line-height: 1.65;
  max-height: 360px;
  overflow: auto;
  white-space: pre;

  code {
    font-family: inherit;
  }

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.18);
    border-radius: 4px;
  }

  :deep(.jh-key) {
    color: $code-key;
  }
  :deep(.jh-str) {
    color: $code-str;
  }
  :deep(.jh-num) {
    color: $code-num;
  }
  :deep(.jh-bool) {
    color: $code-bool;
  }
  :deep(.jh-null) {
    color: $code-null;
  }
}

.apiaudit-empty {
  padding: 24px;
  text-align: center;
  color: var(--text-light, #6b7280);
  background: #fafafa;
  border-radius: 8px;
  font-size: 13px;
}

.apiaudit-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.apiaudit-metric {
  background: var(--bg-card);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;

  &__label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: var(--text-light, #6b7280);
  }

  &__value {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  &__num {
    font-size: 22px;
    font-weight: 600;
    line-height: 1.2;
    color: var(--text-dark, #1f2937);
    font-family:
      'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  }

  &__unit {
    font-size: 12px;
    color: var(--text-light, #6b7280);
  }

  &.is-accent .apiaudit-metric__num {
    color: var(--el-color-primary, #2563eb);
  }
}

.apiaudit-timing-card {
  padding: 0;
  overflow: hidden;

  .apiaudit-card__header {
    margin: 0;
    padding: 14px 20px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }
}

.apiaudit-timing {
  padding: 8px 20px 12px;
  display: flex;
  flex-direction: column;
}

.apiaudit-timing__head {
  display: grid;
  grid-template-columns: minmax(120px, 1fr) minmax(0, 2fr) 64px;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.apiaudit-timing__head-cell {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--text-light, #6b7280);

  &:last-child {
    text-align: right;
  }
}

.apiaudit-timing__row {
  display: grid;
  grid-template-columns: minmax(120px, 1fr) minmax(0, 2fr) 64px;
  align-items: center;
  gap: 12px;
  padding: 6px 8px;
  margin: 0 -8px;
  border-radius: 6px;
  transition: background-color 0.15s ease;

  &:hover {
    background: var(--el-fill-color-light);

    .apiaudit-timing__track::before {
      background: var(--el-fill-color-darker);
    }
  }
}

.apiaudit-timing__label {
  font-size: 12px;
  color: var(--text-light);
  min-width: 0;
}

.apiaudit-timing__track {
  position: relative;
  height: 16px;
  min-width: 0;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--el-fill-color-light);
    transform: translateY(-50%);
    transition: background-color 0.15s ease;
  }
}

.apiaudit-timing__bar {
  position: absolute;
  top: 50%;
  height: 12px;
  transform: translateY(-50%);
  border-radius: 0.25rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.04);
  min-width: 2px;

  &--gray {
    background: #d4d4d8;
  }
  &--orange {
    background: #fb923c;
  }
  &--blue {
    background: #3b82f6;
  }
}

.apiaudit-timing__duration {
  font-size: 12px;
  color: var(--text-dark, #1f2937);
  text-align: right;
  font-variant-numeric: tabular-nums;
  font-family:
    'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.apiaudit-timing__total {
  display: grid;
  grid-template-columns: minmax(120px, 1fr) minmax(0, 2fr) 64px;
  gap: 12px;
  padding: 12px 0 4px;
  border-top: 1px solid var(--el-border-color-lighter);
  margin-top: 4px;
}

.apiaudit-timing__total-label {
  grid-column: 1 / 3;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-dark, #1f2937);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.apiaudit-timing__total-value {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-dark, #1f2937);
  text-align: right;
  font-variant-numeric: tabular-nums;
  font-family:
    'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.apiaudit-timing__window {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--bg-light);
  border-top: 1px solid var(--el-border-color-lighter);
  font-size: 11.5px;
  color: var(--text-light, #6b7280);
}

.apiaudit-timing__window-icon {
  font-size: 14px;
  color: var(--text-light, #6b7280);
  flex-shrink: 0;
}

.apiaudit-timing__window-label {
  font-weight: 600;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  flex-shrink: 0;
}

.apiaudit-timing__window-value {
  font-family:
    'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  color: var(--text-normal, #374151);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 1200px) {
  .apiaudit-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .apiaudit-grid__right {
    position: static;
  }
}
</style>
