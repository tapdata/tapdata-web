<script setup lang="ts">
import { OverflowTooltip } from '@tap/component/src/overflow-tooltip'
import { useI18n } from '@tap/i18n'
import { computed } from 'vue'
import MiniChart from './MiniChart.vue'
import type { ServerItem } from '@tap/api/src/core/monitor-server'
import i18n from "@/i18n";

const { t } = useI18n()

interface ServiceCardProps {
  data: ServerItem
}

const props = withDefaults(defineProps<ServiceCardProps>(), {})

const emit = defineEmits<{
  viewDetails: [data: any]
}>()

const configs = {
  running: { type: 'success' as const, text: t('cluster_running') },
  starting: { type: 'primary' as const, text: t('cluster_starting') },
  stopped: { type: 'danger' as const, text: t('cluster_stopped') },
  deploy_fail: { type: 'danger' as const, text: t('cluster_deploy_fail') },
  not_deploy: { type: 'warning' as const, text: t('cluster_deploy_not') },
}

const statusConfig = computed(() => {
  const { serviceStatus } = props.data
  return configs[serviceStatus as keyof typeof configs]
})

const cpuUsage = computed(() => {
  return props.data.cpuUsage.at(-1) || 0
})

const memoryUsage = computed(() => {
  return props.data.memoryUsage.at(-1) || 0
})

const cpuColor = computed(() => {
  // if (cpuUsage.value >= 80) return '#F56C6C'
  // if (cpuUsage.value >= 60) return '#E6A23C'
  return '#409EFF'
})

const memoryColor = computed(() => {
  // if (memoryUsage.value >= 80) return '#F56C6C'
  // if (memoryUsage.value >= 60) return '#E6A23C'
  return '#409EFF'
})

const handleViewDetails = () => {
  emit('viewDetails', props.data)
}
</script>

<template>
  <ElCard class="service-card" shadow="hover">
    <div class="service-card-header">
      <div class="service-info">
        <div class="service-icon">
          <el-icon :size="20">
            <i-lucide-server />
          </el-icon>
        </div>
        <div class="service-title">
          <div class="service-name">
            <OverflowTooltip
              placement="top"
              :enerable="false"
              :text="data.serverName"
            />
          </div>
          <!-- <div class="service-code">{{ data.serverCode }}</div> -->
        </div>
      </div>
      <ElTag :type="statusConfig.type" effect="light" round>
        {{ statusConfig.text }}
      </ElTag>
    </div>

    <div class="service-metrics">
      <div class="metric-item">
        <div class="metric-header">
          <div class="metric-label">
            <el-icon :size="14" class="metric-icon">
              <i-lucide-cpu />
            </el-icon>
            <span>{{ $t('api_monitor_cpu_usage') }}</span>
          </div>
          <div class="metric-value">{{ cpuUsage }}%</div>
        </div>
        <MiniChart
          :data="data.cpuUsage"
          :time="data.ts"
          :color="cpuColor"
          :height="50"
          label="CPU"
          unit="%"
        />
      </div>

      <div class="metric-item">
        <div class="metric-header">
          <div class="metric-label">
            <el-icon :size="14" class="metric-icon">
              <i-lucide-memory-stick />
            </el-icon>
            <span>{{ $t('api_monitor_memory_usage') }}</span>
          </div>
          <div class="metric-value">{{ memoryUsage }}%</div>
        </div>
        <MiniChart
          :data="data.memoryUsage"
          :time="data.ts"
          :color="memoryColor"
          :height="50"
          label="Memory"
          unit="%"
        />
      </div>
    </div>

    <div class="service-stats">
      <div class="stat-group">
        <div class="stat-item">
          <div class="stat-label">{{ $t('api_monitor_request_count') }}</div>
          <div class="stat-value">{{ data.requestCount }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">{{ $t('api_monitor_error_count') }}</div>
          <div v-if="data.errorCount > 0" class="stat-value">
            {{ data.errorCount }}
            <span class="error-rate">({{ data.errorRate }})</span>
          </div>
          <div v-else class="stat-value">0</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">
            {{ $t('api_monitor_connection_pool_max') }}
          </div>
          <div class="stat-value">{{ data.poolMaxConnections ?? '--' }}</div>
        </div>
      </div>
      <div class="stat-group">
        <div class="stat-item">
          <div class="stat-label">
            {{ $t('api_monitor_p95_response_time') }}
          </div>
          <div class="stat-value">{{ data.p95 ?? '--' }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">
            {{ $t('api_monitor_p99_response_time') }}
          </div>
          <div class="stat-value">{{ data.p99 ?? '--' }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">
            {{ $t('api_monitor_connection_pool_used') }}
          </div>
          <div class="stat-value">{{ data.poolUsedConnections ?? '--' }}</div>
        </div>
      </div>
    </div>

    <!-- Footer - 悬停时显示，浮动在底部 -->
    <div>
      <ElButton type="primary" class="w-100" @click="handleViewDetails">
        {{ $t('public_view_details') }}
      </ElButton>
    </div>
  </ElCard>
</template>

<style lang="scss" scoped>
.service-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

    .service-footer-overlay {
      opacity: 1;
      visibility: visible;
    }
  }

  :deep(.el-card__body) {
    padding: 20px;
  }
}

.service-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  .service-info {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;
  }

  .service-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background-color: var(--el-fill-color-light);
    border-radius: 8px;
    color: var(--el-text-color-regular);
    flex-shrink: 0;
  }

  .service-title {
    flex: 1;
    min-width: 0;
  }

  .service-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .service-code {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.service-metrics {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;

  .metric-item {
    .metric-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .metric-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--el-text-color-regular);

      .metric-icon {
        color: var(--el-text-color-secondary);
      }
    }

    .metric-value {
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }
}

.service-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 0;
  border-top: 1px solid var(--el-border-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
  margin-bottom: 16px;

  .stat-group {
    display: flex;
    gap: 12px;
  }

  .stat-item {
    flex: 1;

    .stat-label {
      font-size: 11px;
      color: var(--el-text-color-secondary);
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-value {
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      white-space: nowrap;

      .error-rate {
        font-size: 12px;
        font-weight: 400;
      }
    }
  }
}

.service-footer-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(
    to top,
    rgba(255, 255, 255, 0.98) 0%,
    rgba(255, 255, 255, 0.95) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  pointer-events: none;
  border-radius: 0 0 12px 12px;

  .el-button {
    border-radius: 8px;
    font-weight: 500;
    pointer-events: auto;
  }
}

// 暗色模式支持
.dark .service-footer-overlay {
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.98) 0%,
    rgba(0, 0, 0, 0.95) 50%,
    rgba(0, 0, 0, 0) 100%
  );
}
</style>
