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
      timelineCoreWidth: 0,
      timelinePointMinGapPx: 12,
      timelineResizeObserver: null,
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
    timelineLabelMetaClassMap() {
      const points = this.timelinePoints || []
      const width = Number(this.timelineCoreWidth)
      const overlapPx = 160
      const map = {}

      const getX = (idx) => {
        if (!Number.isFinite(width) || width <= 0) return Number.NaN
        const left = Number(points?.[idx]?.left)
        if (!Number.isFinite(left)) return Number.NaN
        return (left / 100) * width
      }

      const applyGroup = (type, side) => {
        const idxs = points
          .map((p, i) => ({ p, i }))
          .filter((x) => x.p?.type === type)
          .map((x) => x.i)
          .sort(
            (a, b) =>
              (Number(points[a]?.left) || 0) - (Number(points[b]?.left) || 0),
          )

        for (const i of idxs) {
          map[points[i].key] = [`audit-timeline__meta--${side}`]
        }

        if (idxs.length < 2) return

        for (let k = 0; k < idxs.length - 1; k++) {
          const a = idxs[k]
          const b = idxs[k + 1]
          const ax = getX(a)
          const bx = getX(b)
          if (!Number.isFinite(ax) || !Number.isFinite(bx)) continue
          if (Math.abs(bx - ax) < overlapPx) {
            map[points[a].key] = [
              `audit-timeline__meta--${side}`,
              'audit-timeline__meta--align-right',
            ]
            map[points[b].key] = [
              `audit-timeline__meta--${side}`,
              'audit-timeline__meta--align-left',
            ]
          }
        }
      }

      applyGroup('req', 'top')
      applyGroup('db', 'bottom')
      return map
    },
    timelinePoints() {
      if (!this.auditData) return []

      const callStart = Number(this.auditData.callStart)
      const callEnd = Number(this.auditData.callEnd)
      const dbStartRaw = Number(this.auditData.dataQueryFromTime)
      const dbEndRaw = Number(this.auditData.dataQueryEndTime)

      const reqOk =
        Number.isFinite(callStart) &&
        Number.isFinite(callEnd) &&
        callEnd >= callStart
      const reqInstant = reqOk && callStart === callEnd
      const dbStart = Math.min(dbStartRaw, dbEndRaw)
      const dbEnd = Math.max(dbStartRaw, dbEndRaw)
      const dbOk =
        reqOk &&
        Number.isFinite(dbStartRaw) &&
        Number.isFinite(dbEndRaw) &&
        dbStart >= callStart &&
        dbEnd <= callEnd

      const formatTimelineTime = (ts) =>
        Number.isFinite(ts) ? dayjs(ts).format('YYYY-MM-DD HH:mm:ss.SSS') : '-'

      const reqPoints = [
        {
          key: 'callStart',
          label: this.$t('apiaudit_req_start_point'),
          ts: callStart,
          text: this.auditData.callStartTime || '-',
          type: 'req',
        },
        {
          key: 'callEnd',
          label: this.$t('apiaudit_req_end_point'),
          ts: callEnd,
          text: this.auditData.callEndTime || '-',
          type: 'req',
        },
      ]

      if (!dbOk) {
        const base = [
          { ...reqPoints[0], left: reqInstant ? 50 : 0, dotVariant: 'single' },
          {
            ...reqPoints[1],
            left: reqInstant ? 50 : 100,
            dotVariant: 'single',
          },
        ]
        if (!reqInstant) return base
        base[0].dotVariant = 'triple'
        base[1].dotVariant = 'triple'
        return base
      }

      const points = [
        reqPoints[0],
        {
          key: 'dataQueryFromTime',
          label: this.$t('apiaudit_db_start_point'),
          ts: dbStart,
          text: formatTimelineTime(dbStart),
          type: 'db',
        },
        {
          key: 'dataQueryEndTime',
          label: this.$t('apiaudit_db_end_point'),
          ts: dbEnd,
          text: formatTimelineTime(dbEnd),
          type: 'db',
        },
        reqPoints[1],
      ]

      const segs = this.timelineSegments
      const w0 = Number(segs?.[0]?.width) || 0
      const w1 = Number(segs?.[1]?.width) || 0
      const lefts = reqInstant ? [50, 50, 50, 50] : [0, w0, w0 + w1, 100]
      const result = points.map((p, i) => ({
        ...p,
        left: lefts[i],
        dotVariant: 'single',
      }))

      const EPS = 1e-6
      const order = result
        .map((p, i) => ({ i, left: Number(p.left) }))
        .filter((x) => Number.isFinite(x.left))
        .sort((a, b) => a.left - b.left)

      const groups = []
      let current = []
      for (const item of order) {
        if (!current.length) {
          current = [item]
          continue
        }
        const prev = current.at(-1)
        if (Math.abs(item.left - prev.left) <= EPS) current.push(item)
        else {
          groups.push(current)
          current = [item]
        }
      }
      if (current.length) groups.push(current)

      for (const g of groups) {
        if (g.length < 2) continue
        const idxs = g.map((x) => x.i)
        const hasReq = idxs.some((i) => result[i]?.type === 'req')
        const hasDb = idxs.some((i) => result[i]?.type === 'db')

        if (hasReq && hasDb) {
          for (const i of idxs) {
            if (result[i]?.type === 'req') result[i].dotVariant = 'double-outer'
            if (result[i]?.type === 'db') result[i].dotVariant = 'double-inner'
          }
          continue
        }

        for (const i of idxs) result[i].dotVariant = 'triple'
      }

      return result
    },
    timelineSegments() {
      if (!this.auditData) return []

      const callStart = Number(this.auditData.callStart)
      const dbStartRaw = Number(this.auditData.dataQueryFromTime)
      const dbEndRaw = Number(this.auditData.dataQueryEndTime)
      const callEnd = Number(this.auditData.callEnd)

      const reqOk =
        Number.isFinite(callStart) &&
        Number.isFinite(callEnd) &&
        callEnd >= callStart
      if (reqOk && callStart === callEnd) {
        return [
          {
            key: 'req',
            type: 'req',
            width: 100,
            startText: this.auditData.callStartTime || '-',
            endText: this.auditData.callEndTime || '-',
          },
        ]
      }
      const dbStart = Math.min(dbStartRaw, dbEndRaw)
      const dbEnd = Math.max(dbStartRaw, dbEndRaw)
      const dbOk =
        reqOk &&
        Number.isFinite(dbStartRaw) &&
        Number.isFinite(dbEndRaw) &&
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

      return this.applyTimelineSegmentMinWidth([
        {
          key: 'req-pre',
          type: 'req',
          width: w0,
          durationMs: d0,
          startText: this.auditData.callStartTime || '-',
          endText: Number.isFinite(dbStart)
            ? dayjs(dbStart).format('YYYY-MM-DD HH:mm:ss.SSS')
            : '-',
        },
        {
          key: 'db',
          type: 'db',
          width: w1,
          durationMs: d1,
          startText: Number.isFinite(dbStart)
            ? dayjs(dbStart).format('YYYY-MM-DD HH:mm:ss.SSS')
            : '-',
          endText: Number.isFinite(dbEnd)
            ? dayjs(dbEnd).format('YYYY-MM-DD HH:mm:ss.SSS')
            : '-',
        },
        {
          key: 'req-post',
          type: 'req',
          width: w2,
          durationMs: d2,
          startText: Number.isFinite(dbEnd)
            ? dayjs(dbEnd).format('YYYY-MM-DD HH:mm:ss.SSS')
            : '-',
          endText: this.auditData.callEndTime || '-',
        },
      ])
    },
  },
  watch: {
    auditData() {
      this.$nextTick(() => {
        this.tryInitTimelineResizeObserver()
      })
    },
  },
  created() {
    this.getData()
  },
  mounted() {
    this.tryInitTimelineResizeObserver()
  },
  beforeUnmount() {
    if (this.timelineResizeObserver) {
      this.timelineResizeObserver.disconnect()
      this.timelineResizeObserver = null
    }
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
      const ms = Number(mss)
      if (!Number.isFinite(ms) || ms <= 0) return '0ms'

      if (ms >= 24 * 60 * 60 * 1000) return '24h+'
      if (ms >= 60 * 60 * 1000) return `${(ms / (60 * 60 * 1000)).toFixed(2)}h`
      if (ms >= 60 * 1000) return `${(ms / (60 * 1000)).toFixed(2)}min`
      if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`

      return `${Math.round(ms)}ms`
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
    isTimelinePointTooltipActive(pointIndex) {
      if (
        this.hoverTimelineSeg === null ||
        this.hoverTimelineSeg === undefined ||
        !this.isTimelinePointActive(pointIndex)
      ) {
        return false
      }

      const a = Number(this.hoverTimelineSeg)
      const b = a + 1
      const p1 = this.timelinePoints?.[a]
      const p2 = this.timelinePoints?.[b]
      const l1 = Number(p1?.left)
      const l2 = Number(p2?.left)
      if (!Number.isFinite(l1) || !Number.isFinite(l2)) return true
      if (Math.abs(l1 - l2) > 1e-6) return true

      const t1 = p1?.type
      const t2 = p2?.type
      if (t1 !== t2) {
        const prefer = t1 === 'req' ? a : t2 === 'req' ? b : a
        return pointIndex === prefer
      }
      return pointIndex === a
    },
    timelineTooltipPlacement(pointIndex) {
      if (
        this.hoverTimelineSeg === null ||
        this.hoverTimelineSeg === undefined ||
        !this.isTimelinePointActive(pointIndex)
      ) {
        return 'top'
      }

      const pointType = this.timelinePoints?.[pointIndex]?.type
      const side = pointType === 'req' ? 'bottom' : 'top'

      const a = Number(this.hoverTimelineSeg)
      const b = a + 1
      const otherIndex = pointIndex === a ? b : a
      if (!Number.isFinite(otherIndex)) return side

      const width = Number(this.timelineCoreWidth)
      const p1Left = Number(this.timelinePoints?.[pointIndex]?.left)
      const p2Left = Number(this.timelinePoints?.[otherIndex]?.left)
      if (
        !Number.isFinite(width) ||
        width <= 0 ||
        !Number.isFinite(p1Left) ||
        !Number.isFinite(p2Left)
      ) {
        return side
      }

      const x1 = (p1Left / 100) * width
      const x2 = (p2Left / 100) * width
      const tooltipOverlapPx = 240
      if (Math.abs(x1 - x2) >= tooltipOverlapPx) return side

      if (x1 < x2) return `${side}-end`
      if (x1 > x2) return `${side}-start`
      return side
    },
    updateTimelineCoreWidth() {
      const el = this.$refs.timelineCore
      const width = el && el.clientWidth ? el.clientWidth : 0
      this.timelineCoreWidth = width
    },
    tryInitTimelineResizeObserver() {
      this.updateTimelineCoreWidth()
      if (this.timelineResizeObserver) return
      const el = this.$refs.timelineCore
      if (!el || typeof ResizeObserver === 'undefined') return
      this.timelineResizeObserver = new ResizeObserver(() => {
        this.updateTimelineCoreWidth()
      })
      this.timelineResizeObserver.observe(el)
    },
    applyTimelinePointMinGap(points) {
      const width = Number(this.timelineCoreWidth)
      if (!Number.isFinite(width) || width <= 0) return points
      if (!points || points.length <= 2) return points

      const n = points.length
      const maxGap = width / (n - 1)
      const minGap = Math.max(0, Math.min(this.timelinePointMinGapPx, maxGap))

      const xs = points.map((p) => (Number(p.left) / 100) * width)
      xs[0] = 0
      xs[n - 1] = width

      for (let i = 1; i < n - 1; i++) {
        xs[i] = Math.max(xs[i], xs[i - 1] + minGap)
      }
      for (let i = n - 2; i >= 1; i--) {
        xs[i] = Math.min(xs[i], xs[i + 1] - minGap)
      }
      for (let i = 1; i < n - 1; i++) {
        xs[i] = Math.max(xs[i], xs[i - 1] + minGap)
      }

      return points.map((p, i) => ({
        ...p,
        left: width ? (xs[i] / width) * 100 : p.left,
      }))
    },
    applyTimelineSegmentMinWidth(segments) {
      const width = Number(this.timelineCoreWidth)
      if (!Number.isFinite(width) || width <= 0) return segments
      if (!segments || segments.length <= 1) return segments

      const minGapPx = Number(this.timelinePointMinGapPx) || 12

      const basePx = segments.map((s) => (Number(s.width) / 100) * width)
      const minPxList = segments.map((s) => {
        const duration = Number(s.durationMs)
        if (!Number.isFinite(duration) || duration <= 0) return 0
        return minGapPx
      })

      const totalMin = minPxList.reduce((sum, v) => sum + v, 0)
      const scale = totalMin > width && totalMin > 0 ? width / totalMin : 1
      const scaledMinPx = minPxList.map((v) => v * scale)

      const px = basePx.map((v, i) => Math.max(v, scaledMinPx[i]))
      let excess = px.reduce((sum, v) => sum + v, 0) - width

      if (excess > 0.0001) {
        const order = px
          .map((v, i) => ({ i, adjustable: v - scaledMinPx[i] }))
          .filter((x) => x.adjustable > 0.0001)
          .sort((a, b) => b.adjustable - a.adjustable)

        for (const item of order) {
          if (excess <= 0) break
          const delta = Math.min(item.adjustable, excess)
          px[item.i] -= delta
          excess -= delta
        }
      }

      const totalPx = px.reduce((sum, v) => sum + v, 0)
      const fixScale = totalPx > 0 ? width / totalPx : 1

      return segments.map((s, i) => ({
        ...s,
        width: ((px[i] * fixScale) / width) * 100,
      }))
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
          <div class="title fs-7 fw-sub font-color-dark">
            {{ $t('apiaudit_time_line') }}
          </div>
          <div class="audit-timeline mt-4">
            <div class="audit-timeline__bar-wrap">
              <div class="audit-timeline__pad" />
              <div ref="timelineCore" class="audit-timeline__core">
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
                      {
                        'audit-timeline__point--double-outer':
                          p.dotVariant === 'double-outer',
                        'audit-timeline__point--double-inner':
                          p.dotVariant === 'double-inner',
                        'audit-timeline__point--triple':
                          p.dotVariant === 'triple',
                      },
                      { 'is-active': isTimelinePointActive(i) },
                    ]"
                    :style="{ left: `${p.left}%` }"
                  >
                    <ElTooltip
                      :content="p.text"
                      :disabled="!isTimelinePointTooltipActive(i)"
                      :visible="isTimelinePointTooltipActive(i)"
                      :enterable="false"
                      :show-after="0"
                      :hide-after="0"
                      :placement="timelineTooltipPlacement(i)"
                      :popper-options="timelineTooltipPopperOptions"
                    >
                      <div class="audit-timeline__dot-wrap">
                        <div
                          class="audit-timeline__dot"
                          :class="[
                            p.dotVariant === 'double-inner' &&
                              'audit-timeline__dot--double-inner',
                            p.dotVariant === 'triple' &&
                              'audit-timeline__dot--triple',
                          ]"
                        />
                      </div>
                    </ElTooltip>
                    <div
                      class="audit-timeline__meta"
                      :class="timelineLabelMetaClassMap[p.key]"
                    >
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
    width: var(--dot-size, 10px);
    height: var(--dot-size, 10px);
    z-index: 5;
  }

  .audit-timeline__dot {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: var(--el-bg-color);
    border: 2px solid var(--el-border-color);
    transition:
      transform 240ms ease,
      border-color 240ms ease,
      background-color 240ms ease,
      box-shadow 240ms ease;
  }

  .audit-timeline__point--double-outer,
  .audit-timeline__point--double-inner,
  .audit-timeline__point--triple {
    --dot-size: 12px;
  }

  .audit-timeline__point--triple {
    --dot-middle-size: 8px;
    --dot-inner-size: 4px;
    --timeline-inner-accent: var(--timeline-accent);
  }

  .audit-timeline__point--double-inner {
    --dot-size: 6px;
  }

  .audit-timeline__dot--double-inner {
    background: var(--timeline-accent);
    border: none;
  }

  .audit-timeline__dot--triple::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: var(--dot-middle-size, 8px);
    height: var(--dot-middle-size, 8px);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    background: var(--el-bg-color);
    border: 2px solid var(--el-border-color);
    box-sizing: border-box;
  }

  .audit-timeline__dot--triple::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: var(--dot-inner-size, 4px);
    height: var(--dot-inner-size, 4px);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    background: var(--timeline-inner-accent);
  }

  .audit-timeline__meta {
    position: absolute;
    top: auto;
    left: 0;
    transform: translateX(-50%);
    width: 150px;
    text-align: center;
    white-space: normal;
    pointer-events: none;
  }

  .audit-timeline__meta--align-right {
    transform: translateX(-100%);
    text-align: right;
  }

  .audit-timeline__meta--align-left {
    transform: translateX(0);
    text-align: left;
  }

  .audit-timeline__meta--top {
    bottom: 18px;
  }

  .audit-timeline__meta--bottom {
    top: 14px;
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
    white-space: nowrap;
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
