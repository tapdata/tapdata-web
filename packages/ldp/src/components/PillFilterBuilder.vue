<script setup lang="ts">
import { BaseFieldSelect as FieldSelect } from '@tap/form'
import { useI18n } from '@tap/i18n'

const { t } = useI18n()

export interface FieldDef {
  name: string
  type: 'string' | 'number' | 'date' | 'objectId'
  primaryKey?: boolean
}

export interface FilterRow {
  field: string
  operator: string
  value: string
}

const props = defineProps<{
  fields: any[]
  modelValue: FilterRow[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', rows: FilterRow[]): void
}>()

function addRow() {
  emit('update:modelValue', [
    ...props.modelValue,
    { field: '', operator: '=', value: '' },
  ])
}

function removeRow(index: number) {
  if (props.modelValue.length <= 1) return
  emit(
    'update:modelValue',
    props.modelValue.filter((_, i) => i !== index),
  )
}

function updateRow(index: number, key: keyof FilterRow, val: string) {
  emit(
    'update:modelValue',
    props.modelValue.map((r, i) => (i === index ? { ...r, [key]: val } : r)),
  )
}

const OPERATORS = ['=', '!=', 'LIKE'] as const
</script>

<template>
  <div class="pill-builder">
    <TransitionGroup name="pill-pop">
      <div v-for="(row, index) in modelValue" :key="index" class="pill">
        <!-- ── Field Select ── -->
        <div class="pill__seg pill__seg--field">
          <FieldSelect
            :model-value="row.field"
            :placeholder="t('packages_ldp_trace_filter_field')"
            filterable
            item-label="field_name"
            item-value="field_name"
            :options="fields"
            class="pill__field-select"
            @update:model-value="(v: string) => updateRow(index, 'field', v)"
          />
        </div>
        <!-- ── Divider ── -->
        <span class="pill__divider" />
        <!-- ── Operator Select ── -->
        <div class="pill__seg pill__seg--op bg-light justify-center">
          <el-icon>
            <i-lucide-equal />
          </el-icon>
          <!-- <el-select
            :model-value="row.operator"
            :teleported="true"
            @update:model-value="(v: string) => updateRow(index, 'operator', v)"
          >
            <el-option
              v-for="op in OPERATORS"
              :key="op"
              :label="op"
              :value="op"
            />
          </el-select> -->
        </div>
        <!-- ── Divider ── -->
        <span class="pill__divider" />
        <!-- ── Value Input ── -->
        <input
          :value="row.value"
          class="pill__input"
          :placeholder="t('packages_ldp_trace_filter_value')"
          @input="
            updateRow(index, 'value', ($event.target as HTMLInputElement).value)
          "
        />
        <!-- ── Delete ── -->
        <button
          class="pill__del"
          :disabled="modelValue.length <= 1"
          @click="removeRow(index)"
        >
          <el-icon size="14"><i-lucide-trash-2 /></el-icon>
        </button>
      </div>
    </TransitionGroup>
    <!-- Add Rule -->
    <button class="pill-add" @click="addRow">
      <el-icon size="14"><i-lucide-plus /></el-icon>
      <span>Add Rule</span>
    </button>
  </div>
</template>

<style lang="scss" scoped>
// ─── Builder container ───
.pill-builder {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-start;
}

// ─── Pill (single filter row) ───
.pill {
  position: relative;
  display: flex;
  align-items: stretch;
  height: 40px;
  border-radius: 14px;
  border: 1px solid #e4e4e7;
  background: #fff;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.04);
  transition:
    border-color 0.15s,
    box-shadow 0.15s;

  &:focus-within {
    border-color: #818cf8;
    box-shadow: 0 0 0 3px rgb(99 102 241 / 0.12);
    z-index: 20;
  }
  &:hover {
    z-index: 20;
  }

  // ── Kill ALL el-select / el-input chrome inside the pill ──
  :deep(.el-select) {
    --el-select-border-color-hover: transparent;
  }
  :deep(.el-input__wrapper) {
    box-shadow: none !important;
    border: none !important;
    background: transparent !important;
    padding: 0 10px;
    height: 38px;
  }
  :deep(.el-input__wrapper:hover) {
    box-shadow: none !important;
  }
  :deep(.el-input__wrapper.is-focus) {
    box-shadow: none !important;
  }
  :deep(.el-input__inner) {
    font-size: 13px;
    color: #18181b;
  }
}

// ─── Segments ───
.pill__seg {
  flex-shrink: 0;
  position: relative;
  display: flex;
  align-items: center;
  :deep(.el-select__wrapper) {
    box-shadow: none !important;
  }
}
.pill__seg--field {
  min-width: 160px;
  :deep(.el-select-v2) {
    .el-select-v2__wrapper {
      box-shadow: none !important;
      border: none !important;
      background: transparent !important;
      padding: 0 6px;
      height: 38px;
    }
  }
}
.pill__seg--op {
  width: 56px;
  --el-fill-color-blank: var(--bg-light);
  :deep(.el-input__inner) {
    text-align: center;
    font-weight: 600;
    font-size: 13px;
    color: #52525b;
  }
  :deep(.el-input__suffix) {
    display: none;
  }
}

// ─── Divider between segments ───
.pill__divider {
  width: 1px;
  align-self: stretch;
  background: #e4e4e7;
  flex-shrink: 0;
}

// ─── Value input ───
.pill__input {
  flex: 1;
  min-width: 120px;
  height: 38px;
  padding: 0 12px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  color: #18181b;
  &::placeholder {
    color: #a1a1aa;
  }
}

// ─── Delete button ───
.pill__del {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border: none;
  background: transparent;
  color: #d4d4d8;
  cursor: pointer;
  border-radius: 0 14px 14px 0;
  transition:
    color 0.12s,
    background 0.12s;
  &:hover:not(:disabled) {
    color: #ef4444;
    background: #fef2f2;
  }
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
}

// ─── Add Rule ───
.pill-add {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  padding: 0 18px;
  border-radius: 14px;
  border: 1px dashed #c7d2fe;
  background: rgb(238 242 255 / 0.5);
  color: #4f46e5;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    background: #eef2ff;
    border-color: #818cf8;
  }
}

// ─── TransitionGroup ───
.pill-pop-enter-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.pill-pop-leave-active {
  transition: all 0.18s ease-in;
}
.pill-pop-enter-from {
  opacity: 0;
  transform: scale(0.92);
}
.pill-pop-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
