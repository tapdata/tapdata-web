<script setup lang="ts">
import { useI18n } from '@tap/i18n'
import { computed } from 'vue'

/**
 * P2-7 · 服务型索引只读展示（TAP-12057，方案 §3.7.2）。
 *
 * 字段 + 方向着色（升序绿 / 降序红）+ unique/普通徽标（徽标语汇复用 FieldSelect：unique=fingerprint、
 * 普通=sort-descending，i18n 复用 public_unique_index / public_normal_index）。推荐区与已保存/已加载列表两用。
 * 纯展示、无副作用：方向语义同 P0（asc==false→降序，true/缺省→升序）。
 */

interface DisplayField {
  field: string
  /** 方向：false=降序，true/缺省=升序（同 P0 / ServingIndexField）。 */
  asc?: boolean
}

const props = defineProps<{
  fields: DisplayField[]
  unique?: boolean
  /** 可选索引名（已保存列表展示；推荐区可不传）。 */
  name?: string
}>()

const { t } = useI18n()

const badgeTooltip = computed(() =>
  t(props.unique ? 'public_unique_index' : 'public_normal_index'),
)

const isDesc = (f: DisplayField): boolean => f.asc === false
</script>

<template>
  <span class="serving-index-display flex align-center gap-1">
    <ElTooltip
      :content="badgeTooltip"
      placement="top"
      :open-delay="200"
      transition="none"
    >
      <span class="flex align-center" :class="{ 'text-primary': unique }">
        <VIcon size="14">{{
          unique ? 'fingerprint' : 'sort-descending'
        }}</VIcon>
      </span>
    </ElTooltip>

    <span v-if="name" class="serving-index-display__name mr-1">{{ name }}</span>

    <span class="serving-index-display__keys flex align-center">
      <span
        v-for="(f, i) in fields"
        :key="`${f.field}-${i}`"
        class="serving-index-display__field flex align-center"
      >
        <span class="serving-index-display__field-name">{{ f.field }}</span>
        <span
          class="serving-index-display__dir"
          :class="isDesc(f) ? 'is-desc' : 'is-asc'"
          :aria-label="isDesc(f) ? 'desc' : 'asc'"
          >{{ isDesc(f) ? '↓' : '↑' }}</span
        >
        <span v-if="i < fields.length - 1" class="serving-index-display__sep"
          >,&nbsp;</span
        >
      </span>
    </span>
  </span>
</template>

<style lang="scss" scoped>
.serving-index-display {
  &__name {
    color: var(--el-text-color-secondary);
    font-family: var(--el-font-family-mono, monospace);
  }

  &__field-name {
    font-family: var(--el-font-family-mono, monospace);
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
