<script setup lang="ts">
import { computed } from 'vue'

import type { LogMiningMonitor } from './types'

const props = defineProps<{
  item: LogMiningMonitor
  licenseExpireDays?: number
  licenseExpireDate?: string
  commandLoading: boolean
  operationState?: 'starting' | 'stopping'
}>()

const licenseExpireDays = computed(
  () => props.licenseExpireDays ?? Number.POSITIVE_INFINITY,
)

const emit = defineEmits<{
  start: []
  stop: []
  command: [command: string]
  updateLicense: []
}>()
</script>

<template>
  <div
    class="grid-content list-box border rounded-xl mb-6 logMining-card oracle-log-parser-card"
  >
    <div class="list-box-header oracle-log-parser-card__header">
      <div class="list-box-header-left">
        <img class="mr-4 rounded-xl" src="../../../assets/static/oracle.svg" />
        <div class="list-box-header-main">
          <h2 class="name fs-6 mb-1 flex align-center gap-2">
            <i class="circular" :class="!item.isAlive ? 'bgred' : 'bggreen'" />
            {{ item.serviceId }}
          </h2>
          <span class="ip">{{ item.dataSource }}</span>
        </div>
      </div>
      <div class="oracle-log-parser-card__actions">
        <div class="flex align-center gap-2 mb-1">
          <el-tag v-if="item.reportedData.state === 'sleep'" type="success">
            <el-tooltip
              v-if="!item.isAlive"
              :content="$t('cluster_launcher_offline')"
              :enterable="false"
              placement="top"
            >
              <el-icon class="color-warning">
                <i-lucide-triangle-alert />
              </el-icon>
            </el-tooltip>
            {{ $t('public_status_running') }}
          </el-tag>
          <el-tag
            v-else-if="item.reportedData.state === 'notExists'"
            type="info"
          >
            {{ $t('public_agent_status_offline') }}
          </el-tag>
          <el-tag v-else type="danger">{{ $t('public_status_stop') }}</el-tag>
          <ElButton
            v-if="item.reportedData.state === 'sleep'"
            text
            type="danger"
            :loading="commandLoading || !!operationState"
            :disabled="!item.isAlive || !!operationState"
            @click="emit('stop')"
          >
            <template #icon><i-lucide-square /></template>
            <span>{{ $t('public_button_stop') }}</span>
          </ElButton>
          <ElButton
            v-else
            text
            type="primary"
            :loading="commandLoading || !!operationState"
            :disabled="!item.isAlive || !!operationState"
            @click="emit('start')"
          >
            <template #icon><i-lucide-play /></template>
            <span>{{ $t('public_button_start') }}</span>
          </ElButton>
          <el-dropdown @command="emit('command', $event)">
            <el-button text>
              <template #icon><i-lucide-ellipsis /></template>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  :disabled="!item.isAlive || commandLoading"
                  command="restart"
                >
                  <el-icon class="mr-2" size="16">
                    <i-lucide-rotate-cw />
                  </el-icon>
                  {{ $t('public_button_restart') }}
                </el-dropdown-item>
                <el-dropdown-item
                  :disabled="!item.isAlive"
                  command="updateLicense"
                >
                  <el-icon class="mr-2" size="16">
                    <i-lucide-file-key />
                  </el-icon>
                  {{ $t('license_renew_dialog') }}
                </el-dropdown-item>
                <el-dropdown-item
                  :disabled="item.reportedData.state === 'sleep'"
                  divided
                  class="is-danger"
                  command="delete"
                >
                  <el-icon class="mr-2" size="16">
                    <i-lucide-trash-2 />
                  </el-icon>
                  {{ $t('public_button_delete') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <div class="text-xs flex align-center">
          <span class="font-color-sslight inline-flex flex-wrap gap-1">
            <span>{{ $t('packages_business_task_preview_startTime') }}:</span>
            {{ item.startTime }}
          </span>
          <template v-if="licenseExpireDate">
            <el-divider direction="vertical" />
            <span class="font-color-sslight inline-flex flex-wrap gap-1">
              <span>{{ $t('license_expire_date') }}:</span>
              {{ licenseExpireDate }}
            </span>
          </template>
        </div>
      </div>
    </div>

    <div v-if="licenseExpireDays < 8" class="px-4 pb-4">
      <el-alert
        v-if="licenseExpireDays < 1"
        :closable="false"
        type="error"
        show-icon
        class="fit-content"
      >
        <template #title>
          <div class="flex align-center justify-content-between">
            <span>
              {{
                licenseExpireDays === 0
                  ? $t('license_expired_today')
                  : $t('license_expired_days', {
                      val: Math.abs(licenseExpireDays),
                    })
              }}
            </span>
            <el-button type="primary" text @click="emit('updateLicense')">
              <el-icon><i-lucide-upload /></el-icon>
              <span>{{ $t('license_renew_dialog') }}</span>
            </el-button>
          </div>
        </template>
      </el-alert>
      <el-alert
        v-else
        :closable="false"
        type="warning"
        show-icon
        class="fit-content"
      >
        <template #title>
          <div class="flex align-center justify-content-between">
            <span>
              {{ $t('license_expire_days', { val: licenseExpireDays }) }}
            </span>
            <el-button text @click="emit('updateLicense')">
              {{ $t('license_renew_dialog') }}
            </el-button>
          </div>
        </template>
      </el-alert>
    </div>

    <div class="list-box-main oracle-log-parser-card__metrics">
      <div class="usageRate">
        <div class="fs-5 pb-1 fw-bolder">{{ item.cpuUsage }}%</div>
        {{ $t('cluster_cpu_usage') }}
      </div>
      <div class="line" />
      <div class="usageRate">
        <div class="fs-5 pb-1 fw-bolder">{{ item.memoryUsage }}%</div>
        {{ $t('cluster_heap_memory_usage') }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.oracle-log-parser-card {
  overflow: hidden;
}

.oracle-log-parser-card__header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  overflow: hidden;
  padding: 12px 16px;
}

.oracle-log-parser-card__header .list-box-header-left {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
}

.oracle-log-parser-card__header img {
  width: 43px;
  height: 43px;
}

.oracle-log-parser-card__header .list-box-header-main {
  min-width: 0;
}

.oracle-log-parser-card__header .name {
  overflow: hidden;
  margin: 0;
  color: var(--text-dark);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.oracle-log-parser-card__header .ip {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 6px;
  background-color: #ebf3fd;
  color: var(--color-primary);
}

.oracle-log-parser-card__header .circular {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.oracle-log-parser-card__header .bgred {
  background-color: #ee5353 !important;
}

.oracle-log-parser-card__header .bggreen {
  background-color: #71c179 !important;
}

.oracle-log-parser-card__actions {
  display: flex;
  min-width: 0;
  flex: 1 1 auto;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  --btn-space: 0;
}

.oracle-log-parser-card__metrics {
  display: flex;
  justify-content: center;
  padding: 16px 0;
  border-top: 1px solid var(--el-border-color-lighter);
  text-align: center;

  .usageRate {
    width: 50%;
    color: var(--text-slight);
    font-size: 12px;
    font-weight: 400;

    div {
      color: var(--text-dark);
    }
  }

  .line {
    width: 1px;
    height: 50px;
    background-color: #f2f2f2;
  }
}

@media (max-width: 600px) {
  .oracle-log-parser-card__header {
    align-items: flex-start;
  }

  .oracle-log-parser-card__actions > :first-child {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
}
</style>
