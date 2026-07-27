<script setup lang="ts">
import {
  loadServingIndexes,
  queryServingIndexes,
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
import { recommendServingIndex } from './recommend'
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

const form = inject<Ref<any>>('form', ref<any>({}))

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
const loadedRows = ref<LoadedServingIndex[]>([])
const checkedKeys = ref<Set<string>>(new Set())

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

let currentReqId = ''
let loadTimer: ReturnType<typeof setTimeout> | null = null
const clearLoadTimer = (): void => {
  if (loadTimer) {
    clearTimeout(loadTimer)
    loadTimer = null
  }
}

/** ws 读回结果：按 connectionId + tableName + reqId 关联（ADR-0009），命中即调 load 归因。 */
const onQueryResult = (data: any): void => {
  if (
    data?.connectionId !== connectionId.value ||
    data?.tableName !== tableName.value ||
    data?.reqId !== currentReqId
  )
    return
  clearLoadTimer()
  loadPhase.value = 'loading'
  loadServingIndexes(moduleId.value, data.indexes ?? [])
    .then((rows) => {
      const list = rows ?? []
      loadedRows.value = list
      checkedKeys.value = new Set(
        list.filter((r) => r.defaultChecked).map((r) => sigOf(r.index)),
      )
      loadPhase.value = 'loaded'
    })
    .catch(() => {
      loadPhase.value = 'error'
    })
}

const startLoad = (): void => {
  if (!canLoad.value || !$ws) return
  loadPhase.value = 'querying'
  loadedRows.value = []
  checkedKeys.value = new Set()
  const reqId = `si-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  currentReqId = reqId
  const clientId = $ws.getId()
  $ws.ready(() => {
    $ws.off('queryIndexesResult')
    $ws.on('queryIndexesResult', onQueryResult)
    queryServingIndexes(connectionId.value, {
      tableName: tableName.value,
      reqId,
      clientId,
    }).catch(() => {
      clearLoadTimer()
      loadPhase.value = 'error'
    })
    clearLoadTimer()
    // 引擎离线时 sendMessage 静默落队列——须超时兜底（ADR-0009 雷区②）。
    loadTimer = setTimeout(() => {
      if (loadPhase.value === 'querying') loadPhase.value = 'timeout'
    }, 60000)
  })
}

const isChecked = (row: LoadedServingIndex): boolean =>
  checkedKeys.value.has(sigOf(row.index))

const toggleRow = (row: LoadedServingIndex): void => {
  if (!row.checkable) return
  const key = sigOf(row.index)
  const next = new Set(checkedKeys.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  checkedKeys.value = next
}

// 应用勾选：以面板勾选集**整体替换** form.servingIndexes（加载=唯一源头 ADR-0003；Tier-A 默认，NEEDS-PO 复核）。
const applyChecked = (): void => {
  if (!form.value) return
  form.value.servingIndexes = loadedRows.value
    .filter((r) => checkedKeys.value.has(sigOf(r.index)))
    .map((r) => r.index)
  loadPhase.value = 'idle'
}

/** 归因 → i18n key（UNCLASSIFIED 不显示标签）。 */
const attributionLabelKey: Record<string, string> = {
  SYSTEM_INDEX: 'packages_business_data_server_drawer_guiyin_xitong',
  UNSUPPORTED: 'packages_business_data_server_drawer_guiyin_buzhichi',
  MATCHES_API: 'packages_business_data_server_drawer_guiyin_pipei',
  COLLECTED_BY_THIS_API: 'packages_business_data_server_drawer_guiyin_benapi',
  COLLECTED_BY_OTHER_API: 'packages_business_data_server_drawer_guiyin_qitaapi',
}

const { t } = useI18n()
/** 归因展示标签（无对应 key，如 UNCLASSIFIED，返回空串不展示）。 */
const attributionLabel = (attribution: string): string => {
  const key = attributionLabelKey[attribution]
  return key ? t(key) : ''
}

onBeforeUnmount(() => {
  clearLoadTimer()
  $ws?.off?.('queryIndexesResult')
})
</script>

<template>
  <div class="serving-index-tab flex flex-column gap-4 pt-4">
    <!-- 推荐区（P2-5 + P2-7） -->
    <section class="serving-index-tab__section">
      <div class="serving-index-tab__title fw-sub mb-2">
        {{ $t('packages_business_data_server_drawer_tuijiansuoyin') }}
      </div>

      <ElAlert
        v-if="recommendation.refused"
        type="info"
        :closable="false"
        show-icon
        :title="$t('packages_business_data_server_drawer_tuijianbukeyong')"
      />

      <template v-else-if="recommendation.statement">
        <ServingIndexDisplay :fields="recommendedFields" />
        <div class="serving-index-tab__stmt flex align-center gap-2 mt-2">
          <code class="serving-index-tab__code flex-1">{{
            recommendation.statement
          }}</code>
          <ElButton size="small" @click="copyStatement">
            {{ $t('public_button_copy') }}
          </ElButton>
        </div>
        <div class="serving-index-tab__disclaimer color-warning mt-1">
          {{ $t('packages_business_data_server_drawer_explainmianze') }}
        </div>
      </template>

      <div v-else class="color-disable">
        {{ $t('packages_business_data_server_drawer_wuketuijian') }}
      </div>
    </section>

    <!-- 加载区（P2-6 全表勾选面板） -->
    <section class="serving-index-tab__section">
      <div class="serving-index-tab__title fw-sub mb-2">
        {{ $t('packages_business_data_server_drawer_jiazaisuoyin') }}
      </div>

      <div v-if="!moduleId" class="color-disable">
        {{ $t('packages_business_data_server_drawer_xianbaocunapi') }}
      </div>

      <template v-else>
        <div class="flex align-center gap-2 mb-2">
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
          >
            {{ $t('packages_business_data_server_drawer_jiazaishibai') }}
          </span>
        </div>

        <template v-if="loadPhase === 'loaded'">
          <div v-if="!loadedRows.length" class="color-disable">
            {{ $t('packages_business_data_server_drawer_wusuoyinkejiazai') }}
          </div>
          <template v-else>
            <ul class="serving-index-tab__rows flex flex-column gap-2 m-0 p-0">
              <li
                v-for="(row, i) in loadedRows"
                :key="i"
                class="serving-index-tab__row flex align-center gap-2"
                :class="{ 'is-disabled': !row.checkable }"
              >
                <ElCheckbox
                  :model-value="isChecked(row)"
                  :disabled="!row.checkable"
                  @change="toggleRow(row)"
                />
                <ServingIndexDisplay
                  :name="row.index.name"
                  :unique="row.index.unique"
                  :fields="displayFieldsOf(row.index)"
                />
                <ElTag
                  v-if="attributionLabel(row.attribution)"
                  size="small"
                  type="info"
                  class="ml-1"
                >
                  {{ attributionLabel(row.attribution) }}
                  <template v-if="row.attributionApi"
                    >（{{ row.attributionApi }}）</template
                  >
                </ElTag>
              </li>
            </ul>
            <div class="mt-2">
              <ElButton size="small" type="primary" @click="applyChecked">
                {{ $t('packages_business_data_server_drawer_yingyonggouxuan') }}
              </ElButton>
            </div>
          </template>
        </template>
      </template>
    </section>

    <!-- 已收录区（只读展示 form.servingIndexes） -->
    <section class="serving-index-tab__section">
      <div class="serving-index-tab__title fw-sub mb-2">
        {{ $t('packages_business_data_server_drawer_yishoulusuoyin') }}
      </div>
      <ul v-if="savedIndexes.length" class="flex flex-column gap-2 m-0 p-0">
        <li
          v-for="(idx, i) in savedIndexes"
          :key="idx.name || i"
          class="serving-index-tab__saved-item"
        >
          <ServingIndexDisplay
            :name="idx.name"
            :unique="idx.unique"
            :fields="displayFieldsOf(idx)"
          />
        </li>
      </ul>
      <div v-else class="color-disable">
        {{ $t('packages_business_data_server_drawer_zanwushoulu') }}
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.serving-index-tab {
  &__code {
    padding: 4px 8px;
    background: var(--el-fill-color-light);
    border-radius: 4px;
    font-family: var(--el-font-family-mono, monospace);
    word-break: break-all;
  }

  &__disclaimer {
    font-size: 12px;
  }

  &__hint {
    font-size: 12px;
  }

  &__row {
    list-style: none;

    &.is-disabled {
      opacity: 0.55;
    }
  }

  &__saved-item {
    list-style: none;
  }
}
</style>
