<script setup lang="ts">
import { computed, ref } from 'vue'

import type { LogMiningMonitor } from './types'

const props = defineProps<{
  item: LogMiningMonitor
  typeLabel: string
}>()

const emit = defineEmits<{
  delete: []
}>()

const errorDetailVisible = ref(false)
const errorText = computed(() =>
  props.item.processStatus === 'RUNNING' ? '-' : props.item.errorReason || '--',
)
const errorPreviewLimit = 120
const isErrorLong = computed(() => errorText.value.length > 80)
const errorPreview = computed(() =>
  isErrorLong.value
    ? `${errorText.value.slice(0, errorPreviewLimit).trimEnd()}…`
    : errorText.value,
)
</script>

<template>
  <div
    class="grid-content list-box border rounded-xl mb-6 logMining-card reader-process-card"
  >
    <div class="list-box-header reader-process-card__header">
      <div class="list-box-header-left">
        <img class="mr-4 rounded-xl" src="../../../assets/static/db2z.svg" />
        <div class="list-box-header-main">
          <h2 class="name fs-6 mb-1 flex align-center gap-2">
            <i
              class="circular"
              :class="
                item.processStatus === 'RUNNING'
                  ? 'bggreen'
                  : item.processStatus === 'FAILED'
                    ? 'bgred'
                    : 'reader-process-card__status-dot--offline'
              "
            />
            {{ item.name }}
          </h2>
          <span class="ip">{{ typeLabel }}</span>
        </div>
      </div>
      <div class="reader-process-card__header-actions">
        <div class="reader-process-card__header-controls">
          <el-tag
            size="small"
            :type="
              item.processStatus === 'RUNNING'
                ? 'success'
                : item.processStatus === 'FAILED'
                  ? 'danger'
                  : 'info'
            "
          >
            <i
              class="circular mr-1"
              :class="
                item.processStatus === 'RUNNING'
                  ? 'bggreen'
                  : item.processStatus === 'FAILED'
                    ? 'bgred'
                    : 'reader-process-card__status-dot--offline'
              "
            />
            {{
              item.processStatus === 'RUNNING'
                ? $t('public_status_running')
                : item.processStatus === 'FAILED'
                  ? $t('public_status_stop')
                  : $t('public_agent_status_offline')
            }}
          </el-tag>
          <el-button
            text
            type="danger"
            :disabled="!item.proxyProcessId || item.processStatus === 'RUNNING'"
            @click="emit('delete')"
          >
            <el-icon><i-lucide-trash-2 /></el-icon>
            {{ $t('public_button_delete') }}
          </el-button>
        </div>
        <span class="reader-process-card__start-time">
          <span>{{ $t('cluster_log_mining_reader_start_time') }}:</span>
          <span>{{ item.startTime }}</span>
        </span>
      </div>
    </div>

    <div class="list-box-main reader-process-card__main">
      <div class="reader-process-card__metrics">
        <div class="reader-process-card__metric">
          <div
            class="reader-process-card__value reader-process-card__value--address"
          >
            {{ item.address || '--' }}
          </div>
          <div class="reader-process-card__label">
            {{ $t('cluster_log_mining_reader_ip_address') }}
          </div>
        </div>
        <div class="reader-process-card__metric">
          <div class="reader-process-card__value">{{ item.pid ?? '--' }}</div>
          <div class="reader-process-card__label">
            {{ $t('cluster_log_mining_reader_process_id') }}
          </div>
        </div>
        <div class="reader-process-card__metric">
          <div class="reader-process-card__value">{{ item.cpuUsage }}%</div>
          <div class="reader-process-card__label">
            {{ $t('cluster_log_mining_reader_cpu_usage') }}
          </div>
        </div>
        <div class="reader-process-card__metric">
          <div class="reader-process-card__value">{{ item.memoryUsage }}%</div>
          <div class="reader-process-card__label">
            {{ $t('cluster_log_mining_reader_heap_memory_usage') }}
          </div>
        </div>
      </div>

      <div class="reader-process-card__error">
        <span class="reader-process-card__label">
          {{ $t('daas_cluster_agent_error_reason') }}
        </span>
        <div class="reader-process-card__error-content">
          <span
            class="reader-process-card__error-value"
            :class="{
              'reader-process-card__error-value--visible':
                item.processStatus !== 'RUNNING',
            }"
          >
            {{ errorPreview }}
          </span>
          <el-button
            v-if="isErrorLong"
            class="reader-process-card__error-detail"
            link
            type="danger"
            @click="errorDetailVisible = true"
          >
            {{ $t('cluster_log_mining_error_detail') }}
          </el-button>
        </div>
      </div>
    </div>
  </div>

  <el-dialog
    v-model="errorDetailVisible"
    :title="$t('daas_cluster_agent_error_reason')"
    width="min(900px, calc(100vw - 32px))"
    align-center
    append-to-body
  >
    <pre class="reader-process-card__error-stack">{{ errorText }}</pre>
  </el-dialog>
</template>

<style lang="scss" scoped>
.reader-process-card {
  overflow: hidden;
  border-color: var(--el-border-color-lighter) !important;
  background: var(--el-bg-color);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    border-color: var(--el-color-primary-light-5) !important;
    box-shadow: 0 4px 16px rgb(31 45 61 / 6%);
  }
}

.reader-process-card__header {
  display: flex;
  width: 100%;
  min-width: 0;
  align-items: center;
  justify-content: space-between;
  min-height: 67px;
  overflow: hidden;
  box-sizing: border-box;
  padding: 12px 16px;
}

.reader-process-card__header .list-box-header-left {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  min-width: 0;

  img {
    width: 43px;
    height: 43px;
  }
}

.reader-process-card__header .list-box-header-main {
  min-width: 0;
}

.reader-process-card__header .name {
  max-width: 100%;
  overflow: hidden;
  margin: 0;
  color: var(--text-dark);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reader-process-card__header .ip {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 6px;
  background-color: #ebf3fd;
  color: var(--color-primary);
}

.reader-process-card__header .circular {
  display: inline-block;
  width: 6px;
  height: 6px;
  flex: 0 0 6px;
  border-radius: 50%;
}

.reader-process-card__header .bggreen {
  background-color: #71c179 !important;
}

.reader-process-card__header .bgred {
  background-color: #ee5353 !important;
}

.reader-process-card__header-actions {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  align-items: flex-end;
  margin-left: auto;
  gap: 4px;
}

.reader-process-card__header-controls {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.reader-process-card__start-time {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  max-width: 100%;
  color: var(--text-dark, var(--el-text-color-primary));
  font-size: 12px;
  line-height: 18px;
  text-align: right;
  white-space: nowrap;
}

.reader-process-card__status-dot--offline {
  background-color: var(--el-color-info) !important;
}

.reader-process-card__main {
  display: block !important;
  padding: 0 !important;
  border-top: 0 !important;
  text-align: left !important;
}

.reader-process-card__metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  padding: 16px 8px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.reader-process-card__metric {
  position: relative;
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 4px 12px;
  text-align: center;

  &:not(:first-child)::before {
    position: absolute;
    top: 5px;
    bottom: 5px;
    left: 0;
    width: 1px;
    background: var(--el-border-color-lighter);
    content: '';
  }
}

.reader-process-card__value {
  width: 100%;
  overflow: hidden;
  color: var(--text-dark, var(--el-text-color-primary));
  font-size: 16px;
  font-weight: 600;
  line-height: 22px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reader-process-card__value--address {
  overflow: visible;
  overflow-wrap: anywhere;
  text-overflow: clip;
  white-space: normal;
}

.reader-process-card__label {
  color: var(--text-slight, var(--el-text-color-secondary));
  font-size: 12px;
  line-height: 18px;
}

.reader-process-card__error {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 11px 16px 13px;
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-lighter);
}

.reader-process-card__error-content {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.reader-process-card__error-value {
  display: block;
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  color: var(--text-dark, var(--el-text-color-primary));
  font-size: 13px;
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reader-process-card__error-value--visible {
  color: var(--el-color-danger);
  font-weight: 500;
}

.reader-process-card__error-detail {
  flex: 0 0 auto;
  height: auto;
  margin: 0;
  padding: 0;
  color: var(--text-slight, var(--el-text-color-secondary)) !important;
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
}

.reader-process-card__error-stack {
  max-height: 65vh;
  overflow: auto;
  margin: 0;
  padding: 16px;
  border-radius: 6px;
  background: var(--el-fill-color-light);
  color: var(--el-color-danger);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

@media (max-width: 1100px) {
  .reader-process-card__metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .reader-process-card__metric:nth-child(3)::before {
    display: none;
  }

  .reader-process-card__metric:nth-child(n + 3) {
    padding-top: 12px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}

@media (max-width: 600px) {
  .reader-process-card__header {
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .reader-process-card__header .list-box-header-left,
  .reader-process-card__header-actions {
    flex: 1 0 100%;
  }

  .reader-process-card__header-actions {
    margin-left: 0;
  }

  .reader-process-card__metrics {
    grid-template-columns: minmax(0, 1fr);
    padding: 8px 12px;
  }

  .reader-process-card__metric:not(:first-child) {
    border-top: 1px solid var(--el-border-color-lighter);
  }

  .reader-process-card__metric:not(:first-child)::before {
    display: none;
  }

  .reader-process-card__error {
    grid-template-columns: minmax(0, 1fr);
    gap: 4px;
  }

  .reader-process-card__start-time {
    font-size: 11px;
  }
}
</style>
