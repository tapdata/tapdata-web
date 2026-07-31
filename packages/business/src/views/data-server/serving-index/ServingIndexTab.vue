<script setup lang="ts">
import {
  loadServingIndexes,
  type LoadedServingIndex,
} from '@tap/api/src/core/serving-index'
import { useI18n } from '@tap/i18n'
import { copyToClipboard } from '@tap/shared/src/util'
import {
  computed,
  getCurrentInstance,
  inject,
  onBeforeUnmount,
  ref,
  type Ref,
} from 'vue'
import { isRecommendationCovered, recommendServingIndex } from './recommend'
import ServingIndexDisplay from './ServingIndexDisplay.vue'

/**
 * P2-3 · API 编辑抽屉「服务型索引」tab 内容（TAP-12057，方案 §3.7）。
 *
 * 三区：推荐（P2-5 ESR 计算 + P2-7 展示 + 可复制 createIndex）、加载（P2-6 触发引擎读回 → 归因/默认勾选
 * 全表面板）、已收录（读 form.servingIndexes 只读展示）。查询形态从同屏表单 inject 取。
 *
 * 加载链路（ADR-0009）：`query` 触发（非阻塞）→ 引擎经 ws 推回 `queryIndexesResult`（按 connId+table+reqId
 * 关联）→ `load` 归因规划 → 全表勾选面板；勾选「应用」写回 form.servingIndexes（P2-4 持久化）。
 */

const { t } = useI18n()

const form = inject<Ref<any>>('form', ref<any>({}))
/**
 * 抽屉是否处于编辑态。**加载/收录只在编辑态开放**：只读态下抽屉不渲染底部「保存」，
 * 此时「应用勾选」只会改内存里的 `form.servingIndexes`、关掉抽屉即丢——用户看到「已收录」
 * 更新了却存不下来（2026-07-31 用户实测反馈）。
 */
const isEdit = inject<Ref<boolean>>('isEdit', ref(false))

// —— 推荐区（P2-5 + P2-7）——
const recommendation = computed(() =>
  recommendServingIndex({
    collection: form.value?.tableName,
    where: form.value?.where ?? [],
    sort: form.value?.sort ?? [],
    fullCustomQuery: form.value?.fullCustomQuery,
    customWhere: form.value?.customWhere,
  }),
)

/** 推荐键 → 展示字段（方向 1/-1 → asc 布尔）。 */
const recommendedFields = computed(() =>
  recommendation.value.keys.map((k) => ({
    field: k.field,
    asc: k.direction === 1,
  })),
)

const copyStatement = (): void => {
  if (recommendation.value.statement) {
    copyToClipboard(recommendation.value.statement)
  }
}

/** 索引（已收录 / 已读回）→ 推荐键形态，供覆盖判定。 */
const toKeys = (index: any) =>
  (index?.fields ?? []).map((f: any) => ({
    field: f.field,
    direction: (f.asc === false ? -1 : 1) as 1 | -1,
  }))


// —— 已收录区 ——
const savedIndexes = computed<any[]>(() => form.value?.servingIndexes ?? [])

const displayFieldsOf = (index: any) =>
  (index?.fields ?? []).map((f: any) => ({ field: f.field, asc: f.asc }))

// —— 加载区（P2-6，ADR-0009）——
const instance = getCurrentInstance()
const $ws = (instance?.proxy as any)?.$ws

type LoadPhase =
  | 'idle'
  | 'querying'
  | 'loading'
  | 'loaded'
  | 'timeout'
  | 'error'
const loadPhase = ref<LoadPhase>('idle')
/** 引擎/TM 回发的错误文案（`status === 'ERROR'` 时展示，避免只见「失败」不见原因）。 */
const loadError = ref('')
const loadedRows = ref<LoadedServingIndex[]>([])

/**
 * 目标表已有索引能服务这条推荐时就不再推荐（只推还没有的）。
 * 比对面 = 本 API **已收录**的 ∪ 最近一次**读回**的物理索引；后者要点过「加载」才有，
 * 未加载时仅以已收录判断——宁可多推一条，也不误报「已存在」。
 */
const recommendationCovered = computed(() =>
  isRecommendationCovered(recommendation.value.keys, [
    ...savedIndexes.value.map(toKeys),
    ...loadedRows.value.map((r) => toKeys(r.index)),
  ]),
)

const moduleId = computed<string>(() => form.value?.id ?? '')
const connectionId = computed<string>(() => form.value?.connectionId ?? '')
const tableName = computed<string>(() => form.value?.tableName ?? '')
// 加载需已保存 API（moduleId 供归因）+ 连接 + 表。新建 API 先存后加载（Tier-A 默认，NEEDS-PO 复核）。
const canLoad = computed(
  () => !!moduleId.value && !!connectionId.value && !!tableName.value,
)
const loading = computed(
  () => loadPhase.value === 'querying' || loadPhase.value === 'loading',
)

/** 索引身份签名 = 有序字段:方向（与后端红线一致：名/unique 不参与）。 */
const sigOf = (index: any): string =>
  (index?.fields ?? [])
    .map((f: any) => `${f.field}:${f.asc === false ? -1 : 1}`)
    .join(',')

/** 是否为声明项（= 勾选）；`collected` 缺省按 true（历史数据只存勾选项，语义须不变）。 */
const isCollected = (idx: any): boolean => idx?.collected !== false

/** 列表一行：来自读回的物理索引，或仅存在于声明里的（库中尚未建 / 已被删）。 */
interface MergedRow {
  index: any
  checkable: boolean
  attribution?: string
  attributionApi?: string
  /** 仅在声明里、最近一次读回没见到。 */
  declaredOnly?: boolean
}

/**
 * **单一列表**：最近一次读回的物理索引 ∪ 仅存在于声明里的；勾选与否即是否收录。
 * 未点过「加载」时只列声明项；点「加载」刷新为库中现状（列表旧了就重新加载）。
 */
const mergedRows = computed<MergedRow[]>(() => {
  // 列表 = form.servingIndexes（编辑态下加载会把库里读到的并进去、保存即整体入库）
  //      ∪ 尚未并入表单的读回项。后者是**只读态**的情形：只读不改表单，但点了加载就该看见库中现状。
  // 归因等易变信息只来自最近一次读回，不入库。
  const loadedBySig = new Map(loadedRows.value.map((r) => [sigOf(r.index), r]))
  const rows: MergedRow[] = savedIndexes.value.map((idx: any) => {
    const loaded = loadedBySig.get(sigOf(idx))
    loadedBySig.delete(sigOf(idx))
    return {
      index: idx,
      checkable: loaded ? loaded.checkable : true,
      // 本次读回的最新；没加载过则用上次存下来的（可能过期，重新加载即刷新）。
      attribution: loaded?.attribution ?? idx.attribution,
      attributionApi: loaded?.attributionApi ?? idx.attributionApi,
      // 「库中未见」只有确实读回过才成立；没加载时无从判断，不打标。
      declaredOnly: loadPhase.value === 'loaded' && !loaded,
    }
  })
  for (const loaded of loadedBySig.values()) {
    // `_id_` 不由本功能管理：既不展示也不入库。
    if (
      loaded.attribution === 'SYSTEM_INDEX' ||
      sigOf(loaded.index) === '_id:1'
    )
      continue
    rows.push({
      index: { ...loaded.index, collected: false },
      checkable: loaded.checkable,
      attribution: loaded.attribution,
      attributionApi: loaded.attributionApi,
    })
  }
  return rows
})

let currentReqId = ''
let loadTimer: ReturnType<typeof setTimeout> | null = null
const clearLoadTimer = (): void => {
  if (loadTimer) {
    clearTimeout(loadTimer)
    loadTimer = null
  }
}

/**
 * ws 读回结果。载荷形状是引擎的 `WebSocketEventResult`：业务体在 **`result`** 下、
 * 成败看 `status`（`ERROR` 时 `error` 为文案）。按 connectionId + tableName + reqId 关联（ADR-0009）。
 */
const onQueryResult = (data: any): void => {
  const payload = data?.result
  if (
    payload?.connectionId !== connectionId.value ||
    payload?.tableName !== tableName.value ||
    payload?.reqId !== currentReqId
  )
    return
  clearLoadTimer()
  if (data?.status === 'ERROR') {
    loadError.value = data?.error ?? ''
    loadPhase.value = 'error'
    return
  }
  loadPhase.value = 'loading'
  loadServingIndexes(moduleId.value, payload.indexes ?? [])
    .then((rows) => {
      const list = rows ?? []
      loadedRows.value = list
      // 后端的默认勾选（匹配本 API / 已被本 API 收录，§3.8.3「首个命中即定」）并入当前声明：
      // 勾选态即收录态，读回只是**补上**建议项，不会摘掉用户已声明的（保存前一律可改）。
      // 把读回的物理索引并入表单：**未勾选的也留下**，保存后下次打开无需再加载即可看到全貌。
      // 只读态纯展示，绝不动声明（没有保存按钮，改了也存不下）。
      if (isEdit.value) {
        // `_id_` 是 MongoDB 自带的、也不由本功能管理：既不展示也不入库。
        const fresh = new Map(
          list
            .filter(
              (r) =>
                r.attribution !== 'SYSTEM_INDEX' && sigOf(r.index) !== '_id:1',
            )
            .map((r) => [sigOf(r.index), r]),
        )
        // **按现有顺序就地更新**，不用库返回的顺序重排——否则每点一次加载列表就跳一次。
        const merged: any[] = []
        for (const prev of savedIndexes.value) {
          const r = fresh.get(sigOf(prev))
          if (r) {
            merged.push({
              ...r.index,
              collected: isCollected(prev), // 保留用户已有的勾选态
              // 归因随之落库，下次打开无需再加载即可看到标签（纯展示，可能过期）。
              attribution: r.attribution,
              attributionApi: r.attributionApi,
            })
            fresh.delete(sigOf(prev))
          } else if (isCollected(prev)) {
            // 库中已无但仍勾选的保留（「声明了还没建」，P3 会去创建）；
            // 既没勾、库里也没有的，既非现状也非意图，随本次加载清理掉。
            merged.push(prev)
          }
        }
        // 新读到的追加在末尾，按后端默认勾选（§3.8.3 首个命中即定）。
        for (const r of fresh.values()) {
          merged.push({
            ...r.index,
            collected: !!r.defaultChecked,
            attribution: r.attribution,
            attributionApi: r.attributionApi,
          })
        }
        form.value.servingIndexes = merged
      }
      loadPhase.value = 'loaded'
    })
    .catch(() => {
      loadPhase.value = 'error'
    })
}

/**
 * 发起读回。**必须经 ws 发**（不是 REST）：TM 的会话表按引擎 `agentId` / 浏览器 Spring `session.getId()` 建键，
 * 前端自生成的 `?id=` uuid 不参与路由；经 ws 发起时 TM 用真实会话键作 sender，引擎 `receiver=sender` 回推才命中。
 * 见 ADR-0009 修订与 TM 侧 `ws/handler/QueryIndexesHandler`。
 */
const startLoad = (): void => {
  if (!canLoad.value || !$ws) return
  loadPhase.value = 'querying'
  loadError.value = ''
  loadedRows.value = []
  const reqId = `si-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  currentReqId = reqId
  $ws.ready(() => {
    $ws.off('queryIndexesResult')
    $ws.on('queryIndexesResult', onQueryResult)
    $ws.send({
      type: 'queryIndexes',
      data: {
        connectionId: connectionId.value,
        tableName: tableName.value,
        reqId,
      },
    })
    clearLoadTimer()
    // 引擎离线时 TM 把消息落库、无人应答——须超时兜底（ADR-0009 雷区②）。
    loadTimer = setTimeout(() => {
      if (loadPhase.value === 'querying') loadPhase.value = 'timeout'
    }, 60000)
  })
}

/**
 * 单一列表 + 勾选即收录：勾选态**直接读写** `form.servingIndexes`，没有中间的「应用」步骤。
 * 变更仍需抽屉底部「保存」才落库（`isEdit` 之外不开放勾选）。
 */
const isChecked = (row: MergedRow): boolean => isCollected(row.index)

const toggleRow = (row: MergedRow): void => {
  if (!row.checkable || !isEdit.value || !form.value) return
  const key = sigOf(row.index)
  // 翻转 collected 而不是增删条目：未勾选的也要留在列表里（保存后下次打开仍可见）。
  form.value.servingIndexes = savedIndexes.value.map((idx: any) =>
    sigOf(idx) === key ? { ...idx, collected: !isCollected(idx) } : idx,
  )
}

/** 归因 → i18n key（UNCLASSIFIED 不显示标签）。 */
const attributionLabelKey: Record<string, string> = {
  SYSTEM_INDEX: 'packages_business_data_server_drawer_guiyin_xitong',
  UNSUPPORTED: 'packages_business_data_server_drawer_guiyin_buzhichi',
  MATCHES_API: 'packages_business_data_server_drawer_guiyin_pipei',
  COLLECTED_BY_THIS_API: 'packages_business_data_server_drawer_guiyin_benapi',
  COLLECTED_BY_OTHER_API: 'packages_business_data_server_drawer_guiyin_qitaapi',
}

/** 归因展示标签（无归因或无对应 key，如 UNCLASSIFIED，返回空串不展示）。 */
const attributionLabel = (attribution?: string): string => {
  const key = attribution ? attributionLabelKey[attribution] : undefined
  return key ? t(key) : ''
}

onBeforeUnmount(() => {
  clearLoadTimer()
  $ws?.off?.('queryIndexesResult')
})
</script>

<template>
  <div class="serving-index-tab flex flex-column pt-4">
    <!-- 推荐区（P2-5 + P2-7） -->
    <section class="serving-index-tab__section">
      <div class="serving-index-tab__title">
        {{ $t('packages_business_data_server_drawer_tuijiansuoyin') }}
      </div>

      <ElAlert
        v-if="recommendation.refused"
        type="info"
        :closable="false"
        show-icon
        :title="$t('packages_business_data_server_drawer_tuijianbukeyong')"
      />

      <div v-else-if="recommendationCovered" class="serving-index-tab__empty">
        {{ $t('packages_business_data_server_drawer_tuijianyicunzai') }}
      </div>

      <div
        v-else-if="recommendation.statement"
        class="serving-index-tab__card"
      >
        <div class="serving-index-tab__card-head flex align-center gap-2">
          <ServingIndexDisplay :fields="recommendedFields" />
          <ElButton
            class="ml-auto"
            size="small"
            text
            type="primary"
            @click="copyStatement"
          >
            {{ $t('public_button_copy') }}
          </ElButton>
        </div>
        <code class="serving-index-tab__code">{{
          recommendation.statement
        }}</code>
        <div class="serving-index-tab__disclaimer">
          {{ $t('packages_business_data_server_drawer_explainmianze') }}
        </div>
      </div>

      <div v-else class="serving-index-tab__empty">
        {{ $t('packages_business_data_server_drawer_wuketuijian') }}
      </div>
    </section>

    <!-- 索引列表（P2-6）：读回 ∪ 已声明，勾选即收录 -->
    <section class="serving-index-tab__section">
      <div class="serving-index-tab__title">
        {{ $t('packages_business_data_server_drawer_suoyinliebiao') }}
      </div>

      <div v-if="isEdit && !moduleId" class="serving-index-tab__empty">
        {{ $t('packages_business_data_server_drawer_xianbaocunapi') }}
      </div>

      <template v-else>
        <div class="serving-index-tab__hint color-disable">
          {{
            isEdit
              ? $t('packages_business_data_server_drawer_gouxuanjishoulu')
              : $t('packages_business_data_server_drawer_bianjihoushoulu')
          }}
        </div>

        <div class="flex align-center gap-2">
          <ElButton
            size="small"
            :loading="loading"
            :disabled="!canLoad"
            @click="startLoad"
          >
            {{ $t('packages_business_data_server_drawer_jiazai') }}
          </ElButton>
          <span
            v-if="loadPhase === 'querying'"
            class="color-disable serving-index-tab__hint"
          >
            {{ $t('packages_business_data_server_drawer_jiazaizhong') }}
          </span>
          <span
            v-else-if="loadPhase === 'timeout'"
            class="color-warning serving-index-tab__hint"
          >
            {{ $t('packages_business_data_server_drawer_jiazaichaoshi') }}
          </span>
          <span
            v-else-if="loadPhase === 'error'"
            class="color-danger serving-index-tab__hint"
            :title="loadError"
          >
            {{ $t('packages_business_data_server_drawer_jiazaishibai')
            }}<template v-if="loadError">：{{ loadError }}</template>
          </span>
        </div>

        <ul v-if="mergedRows.length" class="serving-index-tab__list m-0 p-0">
          <li
            v-for="(row, i) in mergedRows"
            :key="i"
            class="serving-index-tab__row flex align-center gap-2"
            :class="{ 'is-disabled': !row.checkable }"
          >
            <ElCheckbox
              :model-value="isChecked(row)"
              :disabled="!row.checkable || !isEdit"
              @change="toggleRow(row)"
            />
            <ServingIndexDisplay
              :name="row.index.name"
              :unique="row.index.unique"
              :fields="displayFieldsOf(row.index)"
            />
            <ElTag
              v-if="row.declaredOnly"
              class="ml-auto flex-shrink-0"
              size="small"
              type="warning"
              disable-transitions
            >
              {{ $t('packages_business_data_server_drawer_guiyin_weijian') }}
            </ElTag>
            <ElTag
              v-else-if="attributionLabel(row.attribution)"
              class="ml-auto flex-shrink-0"
              size="small"
              type="info"
              disable-transitions
            >
              {{ attributionLabel(row.attribution) }}
              <template v-if="row.attributionApi"
                >（{{ row.attributionApi }}）</template
              >
            </ElTag>
          </li>
        </ul>

        <div
          v-else-if="loadPhase === 'loaded'"
          class="serving-index-tab__empty"
        >
          {{ $t('packages_business_data_server_drawer_wusuoyinkejiazai') }}
        </div>

        <div v-else class="serving-index-tab__empty">
          {{ $t('packages_business_data_server_drawer_zanwushoulu') }}
        </div>
      </template>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.serving-index-tab {
  &__section {
    display: flex;
    flex-direction: column;
    gap: 8px;

    // 区块间距对齐抽屉其它区块（.data-server-panel__title 的 margin-top: 32px）
    & + & {
      margin-top: 24px;
    }
  }

  /**
   * 与抽屉其它区块（Data Source / Service Access …）同款标题：3px 主色竖条 + 14px/500。
   * 那套样式定义在 Drawer.vue 的 scoped 块里、够不到子组件内部，故在此复刻。
   */
  &__title {
    position: relative;
    padding-left: 12px;
    height: 22px;
    line-height: 22px;
    font-weight: 500;
    font-size: 14px;
    color: var(--text-dark);
    user-select: none;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 1.2em;
      border-radius: 1.5px;
      background-color: var(--color-primary);
    }
  }

  &__card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
    background: var(--el-fill-color-blank);
  }

  &__code {
    display: block;
    padding: 8px 10px;
    background: var(--el-fill-color-light);
    border-radius: 4px;
    font-family: var(--el-font-family-mono, monospace);
    font-size: 12px;
    line-height: 1.6;
    word-break: break-all;
  }

  &__disclaimer {
    font-size: 12px;
    line-height: 1.5;
    color: var(--el-text-color-secondary);
  }

  &__hint {
    font-size: 12px;
  }

  /** 加载面板与已收录列表共用：带边框的列表容器 + 行分隔线。 */
  &__list {
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 6px;
    overflow: hidden;
  }

  &__row {
    list-style: none;
    padding: 8px 12px;
    min-height: 36px;

    & + & {
      border-top: 1px solid var(--el-border-color-lighter);
    }

    &:hover {
      background: var(--el-fill-color-light);
    }

    &.is-disabled {
      color: var(--el-text-color-disabled);
      background: var(--el-fill-color-lighter);
    }
  }

  &__empty {
    padding: 12px;
    border: 1px dashed var(--el-border-color-lighter);
    border-radius: 6px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}
</style>
