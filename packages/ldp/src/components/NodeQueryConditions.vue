<script setup lang="ts">
import { useI18n } from '@tap/i18n'
import { ref, watch } from 'vue'

const { t } = useI18n()

const props = defineProps<{
  conditions: string
}>()

const emit = defineEmits<{
  save: [value: string]
}>()

const expanded = ref(false)
const editing = ref(false)
const draft = ref('')

watch(
  () => props.conditions,
  (val) => {
    if (!editing.value) draft.value = val
  },
  { immediate: true },
)

function startEdit() {
  draft.value = props.conditions
  editing.value = true
}

function cancelEdit() {
  draft.value = props.conditions
  editing.value = false
}

function saveEdit() {
  editing.value = false
  expanded.value = true
  emit('save', draft.value)
}
</script>

<template>
  <div
    :class="[
      'qc-card',
      editing && 'qc-card--editing',
    ]"
  >
    <!-- Header -->
    <div class="qc-header">
      <!-- View mode: clickable title -->
      <template v-if="!editing">
        <button class="qc-title-btn" @click="expanded = !expanded">
          <span class="qc-chevron">
            <i-lucide-chevron-down v-if="expanded" />
            <i-lucide-chevron-right v-else />
          </span>
          <el-icon :size="14" class="qc-filter-icon"><i-lucide-filter /></el-icon>
          <span>{{ t('packages_ldp_trace_qc_title') }}</span>
        </button>
        <button class="qc-edit-btn" @click="startEdit">{{ t('packages_ldp_trace_qc_edit') }}</button>
      </template>
      <!-- Edit mode: static title + action buttons -->
      <template v-else>
        <div class="qc-title-static">
          <el-icon :size="14" class="qc-code-icon"><i-lucide-code /></el-icon>
          <span>{{ t('packages_ldp_trace_qc_edit') }}</span>
        </div>
        <div class="qc-actions">
          <button class="qc-cancel-btn" @click="cancelEdit">{{ t('packages_ldp_trace_qc_cancel') }}</button>
          <button class="qc-save-btn" @click="saveEdit">{{ t('packages_ldp_trace_qc_save') }}</button>
        </div>
      </template>
    </div>

    <!-- View content -->
    <pre v-if="!editing && expanded" class="qc-pre">{{ conditions }}</pre>

    <!-- Edit textarea -->
    <textarea
      v-if="editing"
      v-model="draft"
      class="qc-textarea"
      spellcheck="false"
    />
  </div>
</template>

<style lang="scss" scoped>
.qc-card {
  background: rgb(250 250 250);
  border: 1px solid rgb(228 228 231 / 80%);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  padding: 12px;
  margin-bottom: 16px;
  transition: all 0.2s;

  &--editing {
    background: rgb(238 242 255 / 50%);
    border-color: rgb(224 231 255 / 80%);
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.05);
  }
}

.qc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.qc-title-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: rgb(63 63 70);
  padding: 0;
  transition: color 0.15s;

  &:hover { color: rgb(24 24 27); }
}

.qc-chevron {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: rgb(161 161 170);
}

.qc-filter-icon { color: rgb(161 161 170); }

.qc-edit-btn {
  font-size: 11px;
  font-weight: 500;
  color: rgb(79 70 229);
  background: rgb(238 242 255);
  border: none;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: rgb(224 231 255);
    color: rgb(67 56 202);
  }
}

.qc-title-static {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: rgb(67 56 202);
}

.qc-code-icon { color: rgb(99 102 241); }

.qc-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.qc-cancel-btn {
  font-size: 11px;
  font-weight: 500;
  color: rgb(113 113 122);
  background: none;
  border: none;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: color 0.15s;

  &:hover { color: rgb(63 63 70); }
}

.qc-save-btn {
  font-size: 11px;
  font-weight: 500;
  color: #fff;
  background: rgb(79 70 229);
  border: none;
  padding: 4px 12px;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: background 0.15s;

  &:hover { background: rgb(67 56 202); }
}

.qc-pre {
  margin-top: 12px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  padding: 10px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
  color: rgb(82 82 91);
  max-height: 128px;
  overflow: auto;
  overflow-x: hidden;
  white-space: pre-wrap;
  word-break: break-all;
}

.qc-textarea {
  display: block;
  width: 100%;
  margin-top: 12px;
  background: #fff;
  border: 1px solid rgb(199 210 254 / 50%);
  border-radius: 8px;
  padding: 10px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
  color: rgb(39 39 42);
  min-height: 100px;
  resize: vertical;
  white-space: pre-wrap;
  word-break: break-all;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-sizing: border-box;

  &:focus {
    border-color: rgb(129 140 248);
    box-shadow: 0 0 0 2px rgb(99 102 241 / 20%);
  }
}
</style>
