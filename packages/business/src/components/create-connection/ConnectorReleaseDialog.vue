<script setup lang="ts">
import { getConnectorImage } from '@tap/assets'
import { useI18n } from '@tap/i18n'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { DatabaseIcon } from '../DatabaseIcon'
import ConnectorQualityBadge from './ConnectorQualityBadge.vue'

interface Connector {
  pdkId: string
  name: string
  icon?: string
  version?: string
  releaseVersion?: string
  qcType?: string
  pdkHash?: string
  requiresDownload?: boolean
}
interface RegistrationJob {
  jobId: string
  status: string
  progress?: number
  error?: string
  pollError?: string
  operation?: string
  stopTasks?: boolean
  releaseVersion?: string
  version?: string
}
interface AffectedTask {
  id?: string
  name?: string
  syncType?: string
}
const props = withDefaults(
  defineProps<{
    visible: boolean
    item: Connector
    impact: { tasks: AffectedTask[]; inspects: AffectedTask[] }
    job?: RegistrationJob
    pending?: boolean
    impactLoading?: boolean
    impactError?: string
    requestError?: string
  }>(),
  { pending: false, impactLoading: false, impactError: '', requestError: '' },
)
const emit = defineEmits<{
  'update:visible': [value: boolean]
  start: [stopTasks: boolean]
  retry: []
  retryImpact: []
  retryPoll: []
}>()
const { t } = useI18n()
const router = useRouter()
const mode = ref('keep')
const details = ref(false)
const technical = ref(false)
const key = (name: string) => `packages_business_connector_${name}`
const install = computed(() =>
  props.job?.operation
    ? props.job.operation === 'install'
    : !!props.item.requiresDownload,
)
const status = computed(() => props.job?.status || 'confirm')
const running = computed(
  () => !['confirm', 'completed', 'failed'].includes(status.value),
)
const count = computed(
  () => props.impact.tasks.length + props.impact.inspects.length,
)
const stopTasks = computed(() => count.value > 0 && mode.value === 'stop')
const version = computed(
  () => props.job?.releaseVersion || props.item.releaseVersion,
)
const title = computed(() =>
  t(
    key(
      status.value === 'completed'
        ? install.value
          ? 'install_complete'
          : 'update_complete'
        : status.value === 'failed'
          ? install.value
            ? 'install_failed'
            : 'update_failed'
          : running.value
            ? install.value
              ? 'install_running'
              : 'update_running'
            : install.value
              ? 'install_connector'
              : 'update_connector',
    ),
    { name: props.item.name },
  ),
)
const progress = computed(() =>
  Math.max(0, Math.min(100, Number(props.job?.progress) || 0)),
)
const currentStage = computed(() => {
  // "preparing" also occurs before downloading (5%), then again at 72%.
  if (
    status.value === 'queued' ||
    (status.value === 'preparing' && progress.value < 10)
  ) {
    return t(key(install.value ? 'preparing_install' : 'preparing_update'))
  }
  if (status.value === 'registering') return t(key('register'))
  if (status.value === 'preparing' && progress.value >= 70)
    return t(key('prepare'))
  return t(key('download_check'))
})
const monitorRoutes: Record<string, string> = {
  sync: 'TaskMonitor',
  migrate: 'MigrationMonitor',
  logCollector: 'SharedMiningMonitor',
  mem_cache: 'SharedCacheMonitor',
  connHeartbeat: 'HeartbeatMonitor',
}
function taskHref(task: AffectedTask, inspect = false) {
  const name = inspect
    ? 'dataVerifyDetails'
    : monitorRoutes[task.syncType || '']
  return task.id && name && router.hasRoute(name)
    ? router.resolve({ name, params: { id: task.id } }).href
    : undefined
}
watch(
  [() => props.visible, () => props.item.pdkId, status],
  ([visible, , current]) => {
    if (visible && current === 'confirm') {
      mode.value = 'keep'
      details.value = false
      technical.value = false
    }
  },
)
</script>

<template>
  <ElDialog
    :model-value="visible"
    :title="title"
    width="480px"
    append-to-body
    :close-on-click-modal="false"
    @update:model-value="emit('update:visible', $event)"
  >
    <div class="connector-release-well">
      <div class="connector-release-identity">
        <ConnectorQualityBadge :quality="item.qcType" />
        <DatabaseIcon v-if="item.pdkHash && !install" :item="item" :size="30" />
        <ElImage
          v-else-if="item.icon"
          :src="getConnectorImage(item.icon)"
          :alt="item.name"
          class="connector-release-logo"
        />
        <strong>{{ item.name }}</strong>
        <div class="connector-release-version">
          <template v-if="!install && status !== 'completed'"
            ><span>{{ job?.version || item.version }}</span
            ><ElIcon><i-lucide-arrow-right /></ElIcon
          ></template>
          <b>{{ version }}</b
          ><ElIcon v-if="status === 'completed'" class="color-success"
            ><i-lucide-circle-check
          /></ElIcon>
        </div>
      </div>
    </div>
    <template v-if="status === 'confirm'">
      <div v-if="count" class="connector-release-heading">
        <h3>{{ t(key('update_method')) }}</h3>
        <ElButton type="primary" text size="small" @click="details = !details"
          >{{ t(key('impact_count'), { count })
          }}<ElIcon class="ml-1"
            ><i-lucide-chevron-down v-if="details" /><i-lucide-chevron-right
              v-else /></ElIcon
        ></ElButton>
      </div>
      <div v-if="details && count" class="connector-release-tasks">
        <template
          v-for="group in [
            { items: impact.tasks, inspect: false },
            { items: impact.inspects, inspect: true },
          ]"
          :key="String(group.inspect)"
        >
          <div
            v-for="(task, index) in group.items"
            :key="task.id || index"
            class="connector-release-task"
          >
            <a
              v-if="taskHref(task, group.inspect)"
              :href="taskHref(task, group.inspect)"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="t(key('open_task'), { name: task.name })"
              ><span>{{ task.name }}</span
              ><ElIcon class="connector-task-external"
                ><i-lucide-arrow-up-right /></ElIcon
            ></a>
            <span v-else>{{ task.name }}</span
            ><span class="connector-release-task-kind">{{
              t(key(group.inspect ? 'inspect_task' : 'sync_task'))
            }}</span>
          </div>
        </template>
      </div>
      <ElAlert
        v-if="impactError"
        type="error"
        :title="impactError"
        :closable="false"
        class="mt-4"
      />
      <ElButton
        v-if="impactError"
        text
        type="primary"
        @click="emit('retryImpact')"
        >{{ t('public_button_retry') }}</ElButton
      >
      <ElRadioGroup
        v-if="count"
        v-model="mode"
        :disabled="pending || impactLoading || !!impactError"
        class="connector-release-options"
        :aria-label="t(key('update_method'))"
      >
        <ElRadio value="keep" border class="connector-release-option"
          ><div>
            <strong>{{ t(key('keep_tasks')) }}</strong>
            <p>{{ t(key('keep_tasks_description')) }}</p>
          </div></ElRadio
        >
        <ElRadio value="stop" border class="connector-release-option"
          ><div>
            <strong>{{ t(key('stop_tasks')) }}</strong>
            <p>{{ t(key('stop_tasks_description')) }}</p>
          </div></ElRadio
        >
      </ElRadioGroup>
      <p v-if="stopTasks" class="connector-release-consequence">
        <ElIcon><i-lucide-circle-alert /></ElIcon
        >{{ t(key('stop_tasks_notice')) }}
      </p>
      <ElAlert
        v-if="requestError"
        type="error"
        :title="requestError"
        :closable="false"
        class="mt-4"
      />
    </template>
    <template v-else-if="running">
      <ElAlert
        v-if="job?.pollError"
        type="warning"
        :title="job.pollError"
        :closable="false"
        class="mt-4"
      />
      <div class="connector-release-progress">
        <ElIcon
          class="connector-release-progress-icon connector-release-spin color-primary"
          ><i-lucide-loader-circle
        /></ElIcon>
        <span class="connector-release-stage-label">{{ currentStage }}</span>
        <span class="connector-release-percentage" aria-hidden="true"
          >{{ progress }}%</span
        >
        <ElProgress
          class="connector-release-progress-bar"
          :percentage="progress"
          :show-text="false"
          :stroke-width="4"
          :aria-label="t(key('progress'))"
        />
      </div>
    </template>
    <div v-else class="connector-release-result">
      <ElIcon :class="status === 'completed' ? 'color-success' : 'color-danger'"
        ><i-lucide-circle-check
          v-if="status === 'completed'" /><i-lucide-circle-alert v-else
      /></ElIcon>
      <div>
        <strong>{{
          t(
            key(
              status === 'completed'
                ? install
                  ? 'install_complete'
                  : 'update_complete'
                : 'operation_failed',
            ),
          )
        }}</strong>
        <p>
          {{
            status === 'completed'
              ? job?.stopTasks
                ? t(key('restart_complete'))
                : t(key('connector_ready'))
              : t(key('failure_hint'))
          }}
        </p>
      </div>
    </div>
    <template v-if="status === 'failed' && job?.error"
      ><ElButton
        type="primary"
        text
        class="mt-3"
        @click="technical = !technical"
        >{{ t(key('error_details'))
        }}<ElIcon class="ml-1"
          ><i-lucide-chevron-down v-if="technical" /><i-lucide-chevron-right
            v-else /></ElIcon
      ></ElButton>
      <pre v-if="technical" class="connector-release-error">{{
        job.error
      }}</pre>
    </template>
    <template #footer>
      <div class="connector-release-footer">
        <template v-if="status === 'confirm'">
          <ElButton @click="emit('update:visible', false)">{{
            t('public_button_cancel')
          }}</ElButton>
          <ElButton
            type="primary"
            :disabled="impactLoading || !!impactError"
            :loading="pending"
            @click="emit('start', stopTasks)"
            >{{
              install
                ? t(key('install'))
                : stopTasks
                  ? t(key('stop_and_update'))
                  : t(key('update_to'), { version })
            }}</ElButton
          >
        </template>
        <template v-else-if="running"
          ><span class="connector-release-footer-note">{{
            t(key('background_notice'))
          }}</span
          ><ElButton
            v-if="job?.pollError"
            type="primary"
            @click="emit('retryPoll')"
            >{{ t(key('check_status')) }}</ElButton
          ><ElButton @click="emit('update:visible', false)">{{
            t(key('background_continue'))
          }}</ElButton></template
        >
        <ElButton
          v-else-if="status === 'completed'"
          type="primary"
          @click="emit('update:visible', false)"
          >{{ t(key('done')) }}</ElButton
        >
        <template v-else
          ><ElButton @click="emit('update:visible', false)">{{
            t(key('later'))
          }}</ElButton
          ><ElButton type="primary" @click="emit('retry')">{{
            t('public_button_retry')
          }}</ElButton></template
        >
      </div>
    </template>
  </ElDialog>
</template>

<style scoped>
.connector-release-well {
  padding: 6px;
  border-radius: 16px;
  background: var(--el-fill-color-light);
}
.connector-release-identity {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 0.5px solid #10182814;
  border-radius: 11px;
  background: var(--el-bg-color);
  box-shadow: 0 1px 2px #1018280d;
}
.connector-release-identity > strong {
  font-size: 15px;
  font-weight: 550;
}
.connector-release-logo {
  width: 30px;
  height: 30px;
  flex: none;
}
.connector-release-version {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}
.connector-release-version > span {
  color: var(--el-text-color-regular);
}
.connector-release-version .el-icon {
  font-size: 13px;
}
.connector-release-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin: 23px 0 12px;
}
.connector-release-heading h3 {
  font-size: 14px;
  font-weight: 550;
  margin: 0;
}
.connector-release-tasks {
  padding: 5px 13px;
  margin-bottom: 14px;
  background: var(--el-fill-color-light);
  border-radius: 10px;
}
.connector-release-task {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  font-size: 13px;
  line-height: 20px;
}
.connector-release-task + .connector-release-task {
  border-top: 1px solid var(--el-border-color-lighter);
}
.connector-release-task-kind {
  font-size: 12px;
  white-space: nowrap;
  color: var(--el-text-color-regular);
}
.connector-release-task > a {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  color: var(--el-text-color-primary);
  text-decoration: none;
}
.connector-release-task > a:hover {
  color: var(--el-color-primary);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.connector-release-task > a:focus-visible {
  outline: 2px solid var(--el-color-primary-light-5);
  outline-offset: 3px;
}
.connector-task-external {
  font-size: 13px;
  opacity: 0;
  transition: opacity 0.12s;
}
.connector-release-task:hover .connector-task-external,
.connector-release-task:focus-within .connector-task-external {
  opacity: 1;
}
.connector-release-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: stretch;
  gap: 12px;
  width: 100%;
  margin-top: 12px;
}
.connector-release-option.el-radio.is-bordered {
  display: flex;
  align-items: flex-start;
  width: 100%;
  height: auto;
  min-height: 88px;
  margin: 0;
  padding: 14px 12px;
  border-radius: var(--el-border-radius-large);
}
.connector-release-option :deep(.el-radio__input) {
  margin-top: 4px;
}
.connector-release-option :deep(.el-radio__label) {
  white-space: normal;
  min-width: 0;
}
.connector-release-option strong {
  display: block;
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
}
.connector-release-option p {
  margin: 6px 0 0;
  font-size: 12px;
  line-height: 20px;
  color: var(--el-text-color-secondary);
}
.connector-release-consequence {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 12px;
  line-height: 20px;
  color: var(--el-color-warning-dark-2);
  margin: 14px 0 0;
}
.connector-release-consequence .el-icon {
  font-size: 14px;
  margin-top: 3px;
  flex: none;
}
.connector-release-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}
.connector-release-footer .el-button + .el-button {
  margin-left: 0;
}
.connector-release-footer-note {
  margin-right: auto;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.connector-release-progress {
  display: grid;
  grid-template-columns: 16px minmax(0, 1fr) auto;
  align-items: center;
  column-gap: 10px;
  margin-top: 24px;
  font-size: 13px;
  line-height: 20px;
  color: var(--el-text-color-primary);
}
.connector-release-stage-label {
  font-weight: 500;
}
.connector-release-progress-icon {
  font-size: 16px;
}
.connector-release-percentage {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-secondary);
}
.connector-release-progress-bar {
  grid-column: 2 / -1;
  margin-top: 8px;
}
.connector-release-spin {
  animation: connector-release-spin 1.3s linear infinite;
}
.connector-release-result {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 22px;
}
.connector-release-result > .el-icon {
  font-size: 17px;
  margin-top: 2px;
  flex: none;
}
.connector-release-result strong {
  font-size: 14px;
  font-weight: 500;
}
.connector-release-result p {
  font-size: 13px;
  line-height: 21px;
  margin: 5px 0 0;
  color: var(--el-text-color-regular);
}
.connector-release-error {
  margin: 8px 0 0;
  padding: 10px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  font:
    11px/18px ui-monospace,
    SFMono-Regular,
    monospace;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}
@keyframes connector-release-spin {
  to {
    transform: rotate(360deg);
  }
}
@media (max-width: 480px) {
  .connector-release-options {
    grid-template-columns: 1fr;
  }
  .connector-release-option.el-radio.is-bordered {
    min-height: 76px;
  }
  .connector-release-identity {
    flex-wrap: wrap;
  }
  .connector-release-version {
    gap: 6px;
  }
}
@media (hover: none) {
  .connector-task-external {
    opacity: 1;
  }
}
@media (prefers-reduced-motion: reduce) {
  .connector-release-spin {
    animation: none;
  }
  .connector-task-external {
    transition: none;
  }
}
</style>
