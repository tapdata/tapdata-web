<script setup lang="ts">
import { useI18n } from '@tap/i18n'
import { computed } from 'vue'

/**
 * P2-7 · 服务型索引只读展示（TAP-12057，方案 §3.7.2）。
 *
 * 字段 + 方向着色（升序绿 / 降序红）+ unique/普通徽标（徽标语汇复用 FieldSelect：unique=fingerprint、
 * 普通=sort-descending，i18n 复用 public_unique_index / public_normal_index）。推荐区与索引列表两用。
 * 纯展示、无副作用：方向语义同 P0（asc==false→降序，true/缺省→升序）。
 *
 * 两种版式：
 * - `inline`（默认，推荐区）：徽标 + 字段挤一行，本来就短。
 * - `stacked`（索引列表）：**索引名一行、字段键一行**。名和键混排时两者都是等宽串、又都可能很长，
 *   挤一行既分不清哪段是名哪段是键，超出还看不全（2026-08-05 用户反馈）。两处都不截断——
 *   名折行、键按 chip 自动换行铺满，宁可行高不齐也要能看全（用户当场选定）。
 */

interface DisplayField {
  field: string
  /** 方向：false=降序，true/缺省=升序（同 P0 / ServingIndexField）。 */
  asc?: boolean
}

const props = withDefaults(
  defineProps<{
    fields: DisplayField[]
    unique?: boolean
    /** 可选索引名（列表展示；推荐区可不传）。 */
    name?: string
    layout?: 'inline' | 'stacked'
  }>(),
  { layout: 'inline' },
)

const { t } = useI18n()

const badgeTooltip = computed(() =>
  t(props.unique ? 'public_unique_index' : 'public_normal_index'),
)

/** 名字缺省时不留一行空标题——徽标退回键那一行，版式自愈（读回的索引一定有名，这是兜底）。 */
const stacked = computed(() => props.layout === 'stacked' && !!props.name)

const isDesc = (f: DisplayField): boolean => f.asc === false
</script>

<template>
  <div
    class="serving-index-display"
    :class="stacked ? 'is-stacked' : 'is-inline'"
  >
    <div v-if="stacked" class="serving-index-display__head">
      <ElTooltip
        :content="badgeTooltip"
        placement="top"
        :open-delay="200"
        transition="none"
      >
        <span
          class="serving-index-display__badge"
          :class="{ 'text-primary': unique }"
        >
          <VIcon size="14">{{
            unique ? 'fingerprint' : 'sort-descending'
          }}</VIcon>
        </span>
      </ElTooltip>
      <span class="serving-index-display__name">{{ name }}</span>
    </div>

    <div class="serving-index-display__keys">
      <ElTooltip
        v-if="!stacked"
        :content="badgeTooltip"
        placement="top"
        :open-delay="200"
        transition="none"
      >
        <span
          class="serving-index-display__badge"
          :class="{ 'text-primary': unique }"
        >
          <VIcon size="14">{{
            unique ? 'fingerprint' : 'sort-descending'
          }}</VIcon>
        </span>
      </ElTooltip>

      <span v-if="!stacked && name" class="serving-index-display__name">{{
        name
      }}</span>

      <span
        v-for="(f, i) in fields"
        :key="`${f.field}-${i}`"
        class="serving-index-display__field"
      >
        <span class="serving-index-display__field-name">{{ f.field }}</span>
        <span
          class="serving-index-display__dir"
          :class="isDesc(f) ? 'is-desc' : 'is-asc'"
          :aria-label="isDesc(f) ? 'desc' : 'asc'"
          >{{ isDesc(f) ? '↓' : '↑' }}</span
        >
        <span
          v-if="!stacked && i < fields.length - 1"
          class="serving-index-display__sep"
          >,</span
        >
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.serving-index-display {
  // 名与键都可能很长（复合索引的自动名尤甚）：一律折行看全、不截断、不横向溢出。
  min-width: 0;

  &.is-inline {
    display: inline-flex;
  }

  &__head {
    display: flex;
    align-items: flex-start;
    gap: 4px;
    min-width: 0;
  }

  &__keys {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
    min-width: 0;
  }

  .is-stacked &__keys {
    // 与上一行的名字左对齐（让开徽标宽度），一眼看出「这些键属于上面那个索引」。
    padding-left: 18px;
    margin-top: 2px;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    // 与相邻文字的首行基线对齐（名字折行时徽标不跟着往下掉）。
    height: 20px;
  }

  &__name {
    color: var(--el-text-color-secondary);
    font-family: var(--el-font-family-mono, monospace);
    line-height: 20px;
    word-break: break-all;
  }

  .is-inline &__name {
    margin-right: 4px;
  }

  &__field {
    display: inline-flex;
    align-items: baseline;
    max-width: 100%;
    line-height: 18px;
  }

  // 列表版式下把每个键做成 chip：键与键之间有边界，长复合索引换行后也数得清。
  .is-stacked &__field {
    padding: 0 6px;
    border-radius: 3px;
    background: var(--el-fill-color-light);
  }

  &__field-name {
    font-family: var(--el-font-family-mono, monospace);
    word-break: break-all;
  }

  &__dir {
    margin-left: 2px;
    font-weight: 600;

    &.is-asc {
      color: var(--el-color-success);
    }

    &.is-desc {
      color: var(--el-color-danger);
    }
  }
}
</style>
