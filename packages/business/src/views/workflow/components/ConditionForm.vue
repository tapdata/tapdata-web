<script setup lang="ts">
import { fetchInspects } from '@tap/api/src/core/inspects'
import { fetchTasks } from '@tap/api/src/core/task'
import { useI18n } from '@tap/i18n'
import { computed, ref, watch } from 'vue'
import {
  CONDITION_OPERATORS,
  runStatusLabelKey,
  stepLabelKey,
  triggerLabelKey,
} from '../constants'
import {
  buildConditionVariableGroups,
  collectInspectIds,
  findConditionVariableOption,
  INSPECT_RESULT_VALUES,
  INSPECT_STATUS_VALUES,
  previousStepsForCondition,
  STEP_STATUS_VALUES,
  TASK_STATUS_VALUES,
  TRIGGER_TYPE_VALUES,
  type ConditionEnumKey,
  type ConditionRef,
  type ConditionVariableOption,
} from '../conditionVariables'
import { collectTaskIds, emptyCondition, sanitizeConditions } from '../helpers'
import type {
  WorkflowConditionSpec,
  WorkflowSpec,
  WorkflowVariableSchemaItem,
} from '@tap/api/src/core/workflows'

const props = defineProps<{
  disabled?: boolean
  variables?: WorkflowVariableSchemaItem[]
  spec?: WorkflowSpec | null
  currentStepId?: string | null
}>()

const logic = defineModel<'AND' | 'OR'>('logic', { default: 'AND' })
const conditions = defineModel<WorkflowConditionSpec[]>('conditions', {
  default: () => [emptyCondition()],
})

const { t } = useI18n()
const keyword = ref('')
const nameMap = ref<Record<string, string>>({})

const taskIds = computed(() => collectTaskIds(props.spec))
const inspectIds = computed(() => collectInspectIds(props.spec))
const previousSteps = computed(() =>
  previousStepsForCondition(props.spec, props.currentStepId),
)

const taskRefs = computed<ConditionRef[]>(() =>
  taskIds.value.map((id) => ({ id, name: nameMap.value[id] })),
)
const inspectRefs = computed<ConditionRef[]>(() =>
  inspectIds.value.map((id) => ({ id, name: nameMap.value[id] })),
)
const stepRefs = computed<ConditionRef[]>(() =>
  previousSteps.value.map((step) => ({
    id: step.stepId,
    name: step.name || t(stepLabelKey(step.type)),
    type: step.type,
  })),
)

const groups = computed(() =>
  buildConditionVariableGroups({
    schema: props.variables || [],
    tasks: taskRefs.value,
    inspects: inspectRefs.value,
    steps: stepRefs.value,
    t,
  }),
)

const visibleGroups = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  if (!query) return groups.value
  return groups.value
    .map((group) => ({
      ...group,
      options: group.options.filter((item) =>
        item.searchText.toLowerCase().includes(query),
      ),
      emptyHint: undefined,
    }))
    .filter((group) => group.options.length)
})

function asItems(data: unknown): any[] {
  if (Array.isArray(data)) return data
  const items = (data as { items?: unknown } | null)?.items
  return Array.isArray(items) ? items : []
}

async function loadNames() {
  const next: Record<string, string> = { ...nameMap.value }
  try {
    if (taskIds.value.length) {
      const data = await fetchTasks({
        where: { id: { in: taskIds.value } },
        limit: taskIds.value.length,
      })
      for (const item of asItems(data)) {
        const id = String(item?.id || item?._id || '')
        if (id) next[id] = item.name || id
      }
    }
    if (inspectIds.value.length) {
      const data = await fetchInspects({
        where: { id: { in: inspectIds.value } },
        limit: inspectIds.value.length,
      })
      for (const item of asItems(data)) {
        const id = String(item?.id || item?._id || '')
        if (id) next[id] = item.name || id
      }
    }
  } catch {
    // Keep ids as labels when lookup fails.
  }
  nameMap.value = next
}

watch(
  () => [...taskIds.value, ...inspectIds.value].join(','),
  () => {
    loadNames()
  },
  { immediate: true },
)

watch(
  conditions,
  (list) => {
    const next = sanitizeConditions(list)
    if (JSON.stringify(next) === JSON.stringify(list || [])) return
    conditions.value = next
  },
  { immediate: true },
)

function addCondition() {
  conditions.value = [...(conditions.value || []), emptyCondition()]
}

function removeCondition(index: number) {
  const next = [...(conditions.value || [])]
  next.splice(index, 1)
  conditions.value = next.length ? next : [emptyCondition()]
}

function optionOf(item: WorkflowConditionSpec) {
  return findConditionVariableOption(groups.value, item.variable)
}

function enumValues(key?: ConditionEnumKey) {
  switch (key) {
    case 'triggerType':
      return TRIGGER_TYPE_VALUES.map((value) => ({
        value,
        label: t(triggerLabelKey(value)),
      }))
    case 'taskStatus':
      return TASK_STATUS_VALUES.map((value) => ({
        value,
        label:
          value === 'Retrying'
            ? t('packages_business_workflow_task_status_retrying')
            : t(`public_status_${value}`),
      }))
    case 'inspectStatus':
      return INSPECT_STATUS_VALUES.map((value) => ({
        value,
        label: inspectStatusLabel(value),
      }))
    case 'inspectResult':
      return INSPECT_RESULT_VALUES.map((value) => ({
        value,
        label: t(`packages_business_workflow_inspect_result_${value}`),
      }))
    case 'stepStatus':
      return STEP_STATUS_VALUES.map((value) => ({
        value,
        label: t(runStatusLabelKey(value)),
      }))
    default:
      return []
  }
}

function inspectStatusLabel(value: string) {
  if (value === 'done') return t('packages_business_workflow_inspect_status_done')
  return t(`public_status_${value}`)
}

function operatorsOf(item: WorkflowConditionSpec) {
  const option = optionOf(item)
  if (option?.valueType === 'boolean' || option?.enumKey) {
    return CONDITION_OPERATORS.filter((op) => op === 'eq' || op === 'ne')
  }
  if (option?.valueType === 'number' || item.valueType === 'number') {
    return CONDITION_OPERATORS
  }
  return CONDITION_OPERATORS.filter((op) => op === 'eq' || op === 'ne')
}

function applyOption(item: WorkflowConditionSpec, option?: ConditionVariableOption | null) {
  if (!option) return
  const previousType = item.valueType
  item.valueType = option.valueType
  const allowed = operatorsOf(item)
  if (!allowed.includes(item.operator as (typeof CONDITION_OPERATORS)[number])) {
    item.operator = 'eq'
  }
  const values = enumValues(option.enumKey)
  if (values.length) {
    if (!values.some((entry) => entry.value === item.value)) {
      item.value = values[0]?.value ?? ''
    }
    return
  }
  if (option.valueType === 'boolean') {
    item.value = Boolean(item.value)
    return
  }
  if (option.valueType === 'number') {
    item.value = previousType === 'number' ? Number(item.value) || 0 : 0
    return
  }
  if (previousType !== 'string') item.value = ''
}

function onVariableChange(item: WorkflowConditionSpec, path: string) {
  item.variable = path
  applyOption(item, findConditionVariableOption(groups.value, path))
}

function setValueType(
  item: WorkflowConditionSpec,
  type: WorkflowConditionSpec['valueType'],
) {
  item.valueType = type
  if (type === 'boolean') item.value = false
  else if (type === 'number') item.value = 0
  else item.value = ''
}

function filterVariables(query: string) {
  keyword.value = query
}

function onVisibleChange(open: boolean) {
  if (!open) keyword.value = ''
}

function isNumberField(item: WorkflowConditionSpec) {
  return optionOf(item)?.valueType === 'number' || item.valueType === 'number'
}
</script>

<template>
  <div class="flex flex-column gap-3">
    <div class="fs-7 font-color-sslight">
      {{ t('packages_business_workflow_condition_hint') }}
    </div>
    <ElRadioGroup v-model="logic" :disabled="disabled">
      <ElRadioButton label="AND">{{
        t('packages_business_workflow_logic_and')
      }}</ElRadioButton>
      <ElRadioButton label="OR">{{
        t('packages_business_workflow_logic_or')
      }}</ElRadioButton>
    </ElRadioGroup>
    <div
      v-for="(item, index) in conditions"
      :key="index"
      class="flex flex-column gap-2 p-3 border rounded-lg"
    >
      <div class="flex gap-2">
        <ElSelect
          :model-value="item.variable"
          filterable
          allow-create
          clearable
          :filter-method="filterVariables"
          :disabled="disabled"
          class="flex-1"
          :placeholder="t('packages_business_workflow_variable')"
          @visible-change="onVisibleChange"
          @update:model-value="(v) => onVariableChange(item, String(v || ''))"
        >
          <ElOptionGroup
            v-for="group in visibleGroups"
            :key="group.key"
            :label="group.label"
          >
            <ElOption
              v-if="group.emptyHint"
              :label="group.emptyHint"
              :value="`__hint_${group.key}`"
              disabled
            />
            <ElOption
              v-for="variable in group.options"
              :key="variable.path"
              :label="variable.label"
              :value="variable.path"
            >
              <div class="flex flex-column py-1">
                <span>{{ variable.label }}</span>
                <span class="fs-7 font-color-sslight">{{
                  variable.description
                }}</span>
              </div>
            </ElOption>
          </ElOptionGroup>
        </ElSelect>
        <ElSelect
          v-if="item.variable"
          v-model="item.operator"
          :disabled="disabled"
          style="width: 110px"
        >
          <ElOption
            v-for="op in operatorsOf(item)"
            :key="op"
            :label="t(`packages_business_workflow_op_${op}`)"
            :value="op"
          />
        </ElSelect>
        <ElButton
          text
          type="danger"
          :disabled="disabled || (conditions?.length || 0) <= 1"
          @click="removeCondition(index)"
        >
          <el-icon><i-lucide-trash-2 /></el-icon>
        </ElButton>
      </div>
      <div
        v-if="item.variable && optionOf(item)?.description"
        class="fs-7 font-color-sslight"
      >
        {{ optionOf(item)?.description }}
      </div>
      <div v-if="item.variable" class="flex gap-2">
        <ElSelect
          v-if="!optionOf(item)"
          :model-value="item.valueType"
          :disabled="disabled"
          style="width: 120px"
          @update:model-value="(v) => setValueType(item, v)"
        >
          <ElOption
            :label="t('packages_business_workflow_type_string')"
            value="string"
          />
          <ElOption
            :label="t('packages_business_workflow_type_number')"
            value="number"
          />
          <ElOption
            :label="t('packages_business_workflow_type_boolean')"
            value="boolean"
          />
        </ElSelect>
        <ElSelect
          v-if="optionOf(item)?.enumKey"
          v-model="item.value"
          :disabled="disabled"
          class="flex-1"
        >
          <ElOption
            v-for="entry in enumValues(optionOf(item)?.enumKey)"
            :key="String(entry.value)"
            :label="entry.label"
            :value="entry.value"
          />
        </ElSelect>
        <ElSelect
          v-else-if="item.valueType === 'boolean'"
          v-model="item.value"
          :disabled="disabled"
          class="flex-1"
        >
          <ElOption :label="t('public_yes')" :value="true" />
          <ElOption :label="t('public_no')" :value="false" />
        </ElSelect>
        <ElInputNumber
          v-else-if="isNumberField(item)"
          v-model="item.value"
          :disabled="disabled"
          class="flex-1"
          controls-position="right"
          :placeholder="t('packages_business_workflow_value_ms')"
        />
        <ElInput
          v-else
          v-model="item.value"
          :disabled="disabled"
          class="flex-1"
        />
      </div>
    </div>
    <ElButton :disabled="disabled" @click="addCondition">
      <el-icon class="mr-1"><i-lucide-plus /></el-icon>
      {{ t('packages_business_workflow_add_condition') }}
    </ElButton>
  </div>
</template>
