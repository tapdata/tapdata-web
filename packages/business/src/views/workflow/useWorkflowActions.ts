import {
  getWorkflow,
  runWorkflow,
  testWorkflow,
  type TriggerDecision,
  type WorkflowDefinitionDto,
} from '@tap/api/src/core/workflows'
import { useI18n } from '@tap/i18n'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import { isEventTrigger, triggerContextIds } from './helpers'

export function useWorkflowActions() {
  const { t } = useI18n()
  const contextVisible = ref(false)
  const contextOptions = ref<Array<{ id: string; name: string }>>([])
  let resolvePick: ((id?: string) => void) | null = null

  function askContextThen(id: string) {
    resolvePick?.(id)
    resolvePick = null
  }

  function cancelContext() {
    resolvePick?.(undefined)
    resolvePick = null
  }

  async function pickContextTask(ids: string[]) {
    contextOptions.value = ids.map((id) => ({ id, name: id }))
    contextVisible.value = true
    return await new Promise<string | undefined>((resolve) => {
      resolvePick = resolve
    })
  }

  async function runOrTest(
    row: WorkflowDefinitionDto,
    mode: 'run' | 'test',
  ): Promise<TriggerDecision | undefined> {
    const detail = row.spec ? row : await getWorkflow(row.id)
    const trigger = detail.spec?.trigger
    let contextTaskId: string | undefined
    if (isEventTrigger(trigger?.type) || isEventTrigger(row.triggerSummary)) {
      const ids = triggerContextIds(trigger)
      if (!ids.length) {
        ElMessage.warning(t('packages_business_workflow_context_missing_list'))
        return undefined
      }
      contextTaskId = await pickContextTask(ids)
      if (!contextTaskId) return undefined
    }
    const body = contextTaskId ? { contextTaskId } : undefined
    return mode === 'run'
      ? await runWorkflow(row.id, body)
      : await testWorkflow(row.id, body)
  }

  return {
    contextVisible,
    contextOptions,
    askContextThen,
    cancelContext,
    runOrTest,
  }
}
