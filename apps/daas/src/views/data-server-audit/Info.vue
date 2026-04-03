<script>
import { fetchApiCall } from '@tap/api/src/core/api-calls'
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
      hoverTimelineSeg: null,
      timelineTooltipPopperOptions: {
        modifiers: [
          {
            name: 'offset',
            options: { offset: [0, 8] },
          },
          {
            name: 'flip',
            options: {
              fallbackPlacements: [
                'top-start',
                'top-end',
                'bottom',
                'bottom-start',
                'bottom-end',
              ],
            },
          },
          {
            name: 'preventOverflow',
            options: { padding: 8 },
          },
        ],
      },
      list: [
        {
          label: this.$t('apiaudit_total_records'),
          key: 'totalRows',
          value: 0,
        },
        {
          label: this.$t('apiaudit_access_records'),
          key: 'visitTotalCount',
          value: 0,
        },
        {
          label: this.$t('apiaudit_access_records_byte'),
          key: 'responseBytes',
          value: 0,
        },
        { label: this.$t('apiaudit_access_time'), key: 'latency', value: 0 },
        {
          label: this.$t('apiaudit_average_access_time'),
          key: 'httpTime',
          value: 0,
        },
        {
          label: this.$t('apiaudit_average_response_time'),
          key: 'dataQueryTotalTime',
          value: 0,
        },
        {
          label: this.$t('apiaudit_average_access_db_rate'),
          key: 'dbRate',
          value: 0,
        },
      ],
    }
  },
  computed: {
    timelinePoints() {
      if (!this.auditData) return []

      const callStart = Number(this.auditData.callStart)
      const callEnd = Number(this.auditData.callEnd)
      const dbStart = Number(this.auditData.dataQueryFromTime)
      const dbEnd = Number(this.auditData.dataQueryEndTime)

      const reqOk =
        Number.isFinite(callStart) &&
        Number.isFinite(callEnd) &&
        callEnd >= callStart
      const dbOk =
        reqOk &&
        Number.isFinite(dbStart) &&
        Number.isFinite(dbEnd) &&
        dbEnd >= dbStart &&
        dbStart >= callStart &&
        dbEnd <= callEnd

      const reqPoints = [
        {
          key: 'callStart',
          label: this.$t('apiaudit_req_start_point'),
          ts: this.auditData.callStart,
          text: this.auditData.callStartTime || '-',
          type: 'req',
        },
        {
          key: 'callEnd',
          label: this.$t('apiaudit_req_end_point'),
          ts: this.auditData.callEnd,
          text: this.auditData.callEndTime || '-',
          type: 'req',
        },
      ]

      if (!dbOk) {
        return [
          { ...reqPoints[0], left: 0 },
          { ...reqPoints[1], left: 100 },
        ]
      }

      const points = [
        reqPoints[0],
        {
          key: 'dataQueryFromTime',
          label: this.$t('apiaudit_db_start_point'),
          ts: this.auditData.dataQueryFromTime,
          text: this.auditData.dataQueryFrom || '-',
          type: 'db',
        },
        {
          key: 'dataQueryEndTime',
          label: this.$t('apiaudit_db_end_point'),
          ts: this.auditData.dataQueryEndTime,
          text: this.auditData.dataQueryEnd || '-',
          type: 'db',
        },
        reqPoints[1],
      ]

      const d0 = Math.max(0, dbStart - callStart)
      const d1 = Math.max(0, dbEnd - dbStart)
      const d2 = Math.max(0, callEnd - dbEnd)
      const total = d0 + d1 + d2

      let w0 = 33.3333
      let w1 = 33.3333
      if (total > 0) {
        w0 = (d0 / total) * 100
        w1 = (d1 / total) * 100
      }

      const lefts = [0, w0, w0 + w1, 100]
      return points.map((p, i) => ({ ...p, left: lefts[i] }))
    },
    timelineSegments() {
      if (!this.auditData) return []

      const callStart = Number(this.auditData.callStart)
      const dbStart = Number(this.auditData.dataQueryFromTime)
      const dbEnd = Number(this.auditData.dataQueryEndTime)
      const callEnd = Number(this.auditData.callEnd)

      const reqOk =
        Number.isFinite(callStart) &&
        Number.isFinite(callEnd) &&
        callEnd >= callStart
      const dbOk =
        reqOk &&
        Number.isFinite(dbStart) &&
        Number.isFinite(dbEnd) &&
        dbEnd >= dbStart &&
        dbStart >= callStart &&
        dbEnd <= callEnd

      if (!dbOk) {
        return [
          {
            key: 'req',
            type: reqOk ? 'req' : 'other',
            width: 100,
            startText: this.auditData.callStartTime || '-',
            endText: this.auditData.callEndTime || '-',
          },
        ]
      }

      let w0 = 33.3333
      let w1 = 33.3333
      let w2 = 33.3334

      const d0 = Math.max(0, dbStart - callStart)
      const d1 = Math.max(0, dbEnd - dbStart)
      const d2 = Math.max(0, callEnd - dbEnd)
      const total = d0 + d1 + d2
      if (total > 0) {
        w0 = (d0 / total) * 100
        w1 = (d1 / total) * 100
        w2 = 100 - w0 - w1
      }

      return [
        {
          key: 'req-pre',
          type: 'req',
          width: w0,
          startText: this.auditData.callStartTime || '-',
          endText: this.auditData.dataQueryFrom || '-',
        },
        {
          key: 'db',
          type: 'db',
          width: w1,
          startText: this.auditData.dataQueryFrom || '-',
          endText: this.auditData.dataQueryEnd || '-',
        },
        {
          key: 'req-post',
          type: 'req',
          width: w2,
          startText: this.auditData.dataQueryEnd || '-',
          endText: this.auditData.callEndTime || '-',
        },
      ]
    },
  },
  created() {
    this.getData()
  },
  methods: {
    dayjs,
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
            this.auditData.callStartTime = this.auditData.callStart
              ? dayjs(this.auditData.callStart).format(
                  'YYYY-MM-DD HH:mm:ss.SSS',
                )
              : '-'
            this.auditData.callEndTime = this.auditData.callEnd
              ? dayjs(this.auditData.callEnd).format('YYYY-MM-DD HH:mm:ss.SSS')
              : '-'
            this.auditData.dataQueryFrom = this.auditData.dataQueryFromTime
              ? dayjs(this.auditData.dataQueryFromTime).format(
                  'YYYY-MM-DD HH:mm:ss.SSS',
                )
              : '-'
            this.auditData.dataQueryEnd = this.auditData.dataQueryEndTime
              ? dayjs(this.auditData.dataQueryEndTime).format(
                  'YYYY-MM-DD HH:mm:ss.SSS',
                )
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
              console.error(`parseJsonData error: ${error}`)
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
    formatReqHeaders(headers) {
      if (typeof headers === 'string') return headers
      try {
        return JSON.stringify(headers, null, 2)
      } catch {
        return String(headers)
      }
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
    isTimelinePointActive(pointIndex) {
      if (
        this.hoverTimelineSeg === null ||
        this.hoverTimelineSeg === undefined
      ) {
        return false
      }
      return (
        pointIndex === this.hoverTimelineSeg ||
        pointIndex === this.hoverTimelineSeg + 1
      )
    },
    timelineTooltipPlacement(pointIndex) {
      if (
        this.hoverTimelineSeg === null ||
        this.hoverTimelineSeg === undefined ||
        !this.isTimelinePointActive(pointIndex)
      ) {
        return 'top'
      }

      const startIndex = this.hoverTimelineSeg
      const endIndex = this.hoverTimelineSeg + 1
      const startLeft = Number(this.timelinePoints?.[startIndex]?.left)
      const endLeft = Number(this.timelinePoints?.[endIndex]?.left)
      const segWidth = endLeft - startLeft
      const shouldSplit =
        Number.isFinite(segWidth) && segWidth >= 0 && segWidth <= 18

      if (!shouldSplit) return 'top'
      return pointIndex === endIndex ? 'bottom' : 'top'
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
          <ElCol class="font-color-normal pb-4" :span="12"
            ><span class="font-text"
              >{{ $t('apiaudit_interview_time_req') }}:</span
            >
            <span class="fw-sub">
              {{ auditData.callStartTime }} ~ {{ auditData.callEndTime }}</span
            ></ElCol
          >
          <ElCol class="font-color-normal pb-4" :span="12"
            ><span class="font-text"
              >{{ $t('apiaudit_interview_time_db') }}:</span
            >
            <span class="fw-sub">
              {{ auditData.dataQueryFrom }} ~ {{ auditData.dataQueryEnd }}</span
            ></ElCol
          >
        </ElRow>
      </div>

      <div>
        <div v-if="auditData" class="details-box py-6 mt-6 rounded-2">
          <div class="title fs-7 fw-sub font-color-dark">{{$t('apiaudit_time_line')}}</div>
          <div class="audit-timeline mt-4">
            <div class="audit-timeline__bar-wrap">
              <div class="audit-timeline__pad" />
              <div class="audit-timeline__core">
                <div class="audit-timeline__bar">
                  <div
                    v-for="(seg, idx) in timelineSegments"
                    :key="seg.key"
                    class="audit-timeline__seg"
                    :class="[
                      `audit-timeline__seg--${seg.type}`,
                      { 'is-hover': hoverTimelineSeg === idx },
                    ]"
                    :style="{ width: `${seg.width}%` }"
                    @mouseenter="hoverTimelineSeg = idx"
                    @mouseleave="hoverTimelineSeg = null"
                  />
                </div>

                <div class="audit-timeline__points">
                  <div
                    v-for="(p, i) in timelinePoints"
                    :key="p.key"
                    class="audit-timeline__point"
                    :class="[
                      `audit-timeline__point--${p.type}`,
                      { 'is-active': isTimelinePointActive(i) },
                    ]"
                    :style="{ left: `${p.left}%` }"
                  >
                    <ElTooltip
                      :content="p.text"
                      :disabled="!isTimelinePointActive(i)"
                      :visible="isTimelinePointActive(i)"
                      :enterable="false"
                      :show-after="0"
                      :hide-after="0"
                      :placement="timelineTooltipPlacement(i)"
                      :popper-options="timelineTooltipPopperOptions"
                    >
                      <div class="audit-timeline__dot-wrap">
                        <div class="audit-timeline__dot" />
                      </div>
                    </ElTooltip>
                    <div class="audit-timeline__meta">
                      <div class="audit-timeline__label">{{ p.label }}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="audit-timeline__pad" />
            </div>
          </div>
        </div>
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
                  ['latency', 'httpTime', 'dataQueryTotalTime'].includes(
                    item.key,
                  )
                "
                class="color-primary pt-4 din-font details-box-item-num"
              >
                {{ formatDuring(item.value) }}
              </div>
              <div
                v-else-if="
                  item.value > 0 && ['httpRate', 'dbRate'].includes(item.key)
                "
                class="color-primary pt-4 din-font details-box-item-num"
              >
                {{ item.value ? `${calcUnit(item.value, 'b')}/S` : '0 M/S' }}
              </div>
              <div
                v-else-if="
                  item.value > 0 && ['responseBytes'].includes(item.key)
                "
                class="color-primary pt-4 din-font details-box-item-num"
              >
                {{ item.value ? `${calcUnit(item.value, 'B')}` : '0B' }}
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

  .audit-timeline {
    position: relative;
    padding: 12px 8px 0;
  }

  .audit-timeline__bar-wrap {
    position: relative;
    padding-bottom: 62px;
    display: flex;
    align-items: center;
  }

  .audit-timeline__pad {
    flex: 1;
    height: 4px;
    background: var(--el-border-color);
    border-radius: 999px;
    pointer-events: none;
  }

  .audit-timeline__core {
    width: 70%;
    position: relative;
  }

  .audit-timeline__bar {
    position: relative;
    width: 100%;
    height: 4px;
    border-radius: 999px;
    overflow: visible;
    background: var(--el-border-color);
    display: flex;
    align-items: stretch;
  }

  .audit-timeline__seg {
    position: relative;
    height: 4px;
    transform-origin: center;
    transition:
      transform 320ms ease,
      filter 320ms ease;
    z-index: 1;
    border-radius: 999px;
    cursor: default;
  }

  .audit-timeline__seg.is-hover {
    transform: scaleY(2);
    z-index: 3;
    filter: saturate(1.05);
  }

  .audit-timeline__seg--req {
    background: var(--el-color-warning);
  }

  .audit-timeline__seg--db {
    background: var(--el-color-primary);
  }

  .audit-timeline__seg--other {
    background: var(--el-border-color);
  }

  .audit-timeline__points {
    position: absolute;
    top: 2px;
    left: 0;
    right: 0;
    height: 0;
    pointer-events: none;
  }

  .audit-timeline__point {
    position: absolute;
    top: 0;
    width: 0;
    transform: translateX(-50%);
    transition: filter 240ms ease;
    z-index: 4;
  }

  .audit-timeline__dot-wrap {
    position: absolute;
    top: 0;
    left: 0;
    transform: translate(-50%, -50%);
    width: 10px;
    height: 10px;
    z-index: 5;
  }

  .audit-timeline__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--el-bg-color);
    border: 2px solid var(--el-border-color);
    transition:
      transform 240ms ease,
      border-color 240ms ease,
      background-color 240ms ease,
      box-shadow 240ms ease;
  }

  .audit-timeline__meta {
    position: absolute;
    top: 10px;
    left: 0;
    transform: translateX(-50%);
    width: 150px;
    text-align: center;
    white-space: normal;
  }

  .audit-timeline__point--req {
    --timeline-accent: var(--el-color-warning);
    --timeline-accent-shadow: rgba(230, 162, 60, 0.18);
  }

  .audit-timeline__point--db {
    --timeline-accent: var(--el-color-primary);
    --timeline-accent-shadow: rgba(64, 158, 255, 0.18);
  }

  .audit-timeline__point--other {
    --timeline-accent: var(--el-border-color);
    --timeline-accent-shadow: rgba(144, 147, 153, 0.15);
  }

  .audit-timeline__point--db .audit-timeline__meta {
    top: 28px;
  }

  .audit-timeline__point--req .audit-timeline__dot,
  .audit-timeline__point--db .audit-timeline__dot,
  .audit-timeline__point--other .audit-timeline__dot {
    border-color: var(--timeline-accent);
  }

  .audit-timeline__label {
    font-size: 11px;
    line-height: 14px;
    color: var(--text-light);
    margin-bottom: 2px;
    transition:
      color 240ms ease,
      font-weight 240ms ease;
  }

  .audit-timeline__time {
    font-size: 11px;
    line-height: 14px;
    color: var(--text-light);
    transition:
      color 240ms ease,
      font-weight 240ms ease;
  }

  .audit-timeline__point.is-active .audit-timeline__dot {
    transform: scale(1.15);
    border-color: var(--timeline-accent);
    background: var(--el-bg-color-overlay);
    box-shadow: 0 0 0 4px var(--timeline-accent-shadow);
  }

  .audit-timeline__point.is-active .audit-timeline__label,
  .audit-timeline__point.is-active .audit-timeline__time {
    color: var(--text-dark);
    font-weight: 600;
  }
}
.jc-between {
  display: flex;
  align-items: center;
  justify-items: center;
  justify-content: space-between;
}
</style>
