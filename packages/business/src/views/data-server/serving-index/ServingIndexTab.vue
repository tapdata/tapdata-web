<script setup lang="ts">
import { copyToClipboard } from '@tap/shared/src/util'
import { computed, inject, ref, type Ref } from 'vue'
import { recommendServingIndex } from './recommend'
import ServingIndexDisplay from './ServingIndexDisplay.vue'

/**
 * P2-3 · API 编辑抽屉「服务索引」tab 内容（TAP-12057，方案 §3.7）。
 *
 * 三区：推荐（P2-5 纯前端 ESR 计算 + P2-7 只读展示 + 可复制 createIndex + explain 免责）、加载（P2-6 全表勾选
 * 面板，本骨架先占位）、已收录（读 form.servingIndexes 只读展示）。查询形态从同屏表单状态 inject 取，无需后端。
 */

// Drawer.vue 经 provide('form', form) 暴露；推荐所需 where/sort/tableName/fullCustomQuery/customWhere 皆在其上。
const form = inject<Ref<any>>('form', ref<any>({}))

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

const savedIndexes = computed<any[]>(() => form.value?.servingIndexes ?? [])

const displayFieldsOf = (index: any) =>
  (index?.fields ?? []).map((f: any) => ({ field: f.field, asc: f.asc }))

const copyStatement = (): void => {
  if (recommendation.value.statement) {
    copyToClipboard(recommendation.value.statement)
  }
}
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

    <!-- 加载区（P2-6 全表勾选面板占位） -->
    <section class="serving-index-tab__section">
      <div class="serving-index-tab__title fw-sub mb-2">
        {{ $t('packages_business_data_server_drawer_jiazaisuoyin') }}
      </div>
      <!-- TODO(P2-6): 触发 POST api/serving-indexes/query → 收 ws 结果 → POST .../load/{moduleId} → 全表勾选面板 -->
      <ElButton disabled size="small">
        {{ $t('packages_business_data_server_drawer_jiazai') }}
      </ElButton>
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

  &__saved-item {
    list-style: none;
  }
}
</style>
