<script setup lang="ts">
import { useI18n } from '@tap/i18n'
import {
  formatAgentProcessEndpoint,
  getAgentProcessErrorReason,
  getAgentProcessInfo,
  getAgentProcessStatusPresentation,
} from './agent-process-status'
import InfiniteSelect from './InfiniteSelect.vue'

defineOptions({ inheritAttrs: false })

const { t } = useI18n()
const InfiniteSelectComponent = InfiniteSelect as any

const getStatus = (status: unknown) =>
  getAgentProcessStatusPresentation(status, t)

const getProcess = (item: any) => getAgentProcessInfo(item)
const getName = (item: any, fallback: unknown = '') =>
  String(getProcess(item).agentName || fallback)
const getProcessStatus = (item: any) => getStatus(getProcess(item).status)
const getEndpoint = (item: any) => formatAgentProcessEndpoint(getProcess(item))
const getErrorReason = (item: any) => getAgentProcessErrorReason(item)
</script>

<template>
  <InfiniteSelectComponent v-bind="$attrs" fit-input-width>
    <template #label="{ label, item }">
      <div class="agent-process-select__label">
        <ElTooltip
          class="agent-process-select__name-tooltip"
          :content="getName(item, label)"
          placement="top"
          effect="dark"
        >
          <span class="agent-process-select__name">
            {{ getName(item, label) }}
          </span>
        </ElTooltip>
        <ElTooltip
          v-if="getProcessStatus(item).text"
          :content="getErrorReason(item)"
          :disabled="!getErrorReason(item)"
          placement="top"
          effect="dark"
        >
          <ElTag
            :type="getProcessStatus(item).type"
            size="small"
            disable-transitions
          >
            {{ getProcessStatus(item).text }}
          </ElTag>
        </ElTooltip>
        <ElTag
          v-if="getEndpoint(item)"
          type="info"
          effect="plain"
          size="small"
          disable-transitions
        >
          {{ getEndpoint(item) }}
        </ElTag>
      </div>
    </template>

    <template #option="{ item }">
      <div class="agent-process-select__option">
        <div class="agent-process-select__main">
          <ElTooltip
            class="agent-process-select__name-tooltip"
            :content="getName(item, getProcess(item).proxyProcessId)"
            placement="top"
            effect="dark"
          >
            <span class="agent-process-select__name">
              {{ getName(item, getProcess(item).proxyProcessId) }}
            </span>
          </ElTooltip>
          <ElTooltip
            v-if="getProcessStatus(item).text"
            :content="getErrorReason(item)"
            :disabled="!getErrorReason(item)"
            placement="top"
            effect="dark"
          >
            <ElTag
              :type="getProcessStatus(item).type"
              size="small"
              disable-transitions
            >
              {{ getProcessStatus(item).text }}
            </ElTag>
          </ElTooltip>
        </div>
        <ElTag
          v-if="getEndpoint(item)"
          type="info"
          effect="plain"
          size="small"
          disable-transitions
        >
          {{ getEndpoint(item) }}
        </ElTag>
      </div>
    </template>
  </InfiniteSelectComponent>
</template>

<style scoped lang="scss">
.agent-process-select {
  &__label,
  &__option,
  &__main {
    display: flex;
    align-items: center;
    min-width: 0;
  }

  &__label,
  &__option {
    gap: 8px;
    width: 100%;
  }

  &__option {
    justify-content: space-between;
  }

  &__main {
    flex: 1 1 auto;
    gap: 8px;
    min-width: 0;
  }

  &__name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :deep(.agent-process-select__name-tooltip) {
    flex: 1 1 auto;
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
  }

  :deep(.el-tag) {
    flex: none;
  }
}
</style>
