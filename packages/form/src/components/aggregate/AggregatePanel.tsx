import { SchemaExpressionScopeSymbol, useForm } from '@formily/vue'
import { getNodeSchema } from '@tap/api/src/core/metadata-instances'
import { useI18n } from '@tap/i18n'
import {
  computed,
  defineComponent,
  inject,
  onMounted,
  ref,
  type PropType,
} from 'vue'
import { BaseFieldSelect, mapFieldsData } from '../field-select'
import { AggregateFields, type AggregateField } from './AggregateFields'
import { buildPipelineJSON } from './buildPipeline'
import { GroupFields, type GroupField } from './GroupFields'
import { MatchFilter, type MatchCondition } from './MatchFilter'
import { PipelineEditor, type FieldItem } from './PipelineEditor'
import { PipelinePreview } from './PipelinePreview'
import { resolveSourceInfo } from './resolveSourceInfo'
import './style.scss'

export const AggregatePanel = defineComponent({
  name: 'AggregatePanel',
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    value: {
      type: Object as PropType<{
        useRawPipeline: boolean
        rawPipeline: string
        matchConditions: MatchCondition[]
        groupFields: GroupField[]
        aggregateFields: AggregateField[]
        // 源节点信息（自动加载）
        connectionName: string
        databaseName: string
        tableName: string
        connectionId: string
        databaseType: string
        // 事件处理逻辑
        enableDeleteWhenEmpty: boolean
        effectiveUpdateFields: string[]
        groupChangeFields: string[]
      }>,
      default: () => ({
        useRawPipeline: false,
        rawPipeline: '[\n  \n]',
        matchConditions: [],
        groupFields: [],
        aggregateFields: [],
        connectionName: '',
        databaseName: '',
        tableName: '',
        connectionId: '',
        databaseType: '',
        enableDeleteWhenEmpty: false,
        effectiveUpdateFields: [],
        groupChangeFields: [],
      }),
    },
  },
  emits: ['change'],
  setup(props, { emit }) {
    const activeCollapse = ref(['match', 'group', 'aggregate'])
    const fieldOptions = ref<any[]>([])
    const rawFields = ref<FieldItem[]>([])
    const fieldsLoading = ref(false)

    const { t } = useI18n()

    // Load fields via formily form context
    let form: any
    let nodeId: string | undefined
    let findNodeById: ((id: string) => any) | undefined
    try {
      const formRef = useForm()
      form = formRef.value
      nodeId = form?.values?.id

      // 从 formily scope 中获取 findNodeById
      const scopeRef = inject<any>(SchemaExpressionScopeSymbol, null)
      findNodeById = scopeRef?.value?.findNodeById
    } catch {
      // Not inside a formily context
    }

    const loadFields = async () => {
      // 使用前置节点的 ID 加载字段
      const inputNodeId = form?.values?.$inputs?.[0]
      if (!inputNodeId) return
      fieldsLoading.value = true
      try {
        let fields: any[] = []
        const data = await getNodeSchema(inputNodeId)
        const { fields: mapped } = mapFieldsData(data?.[0])
        fields = mapped
        fieldOptions.value = fields
        rawFields.value = fields.map((f: any) => ({
          field_name: f.field_name || f.value,
          data_type: f.type || f.data_type,
        }))
      } catch (error) {
        console.error('AggregatePanel loadFields error', error)
      } finally {
        fieldsLoading.value = false
      }
    }

    const loadSourceInfo = async () => {
      if (!nodeId || !findNodeById) return
      try {
        const info = await resolveSourceInfo(nodeId, findNodeById)
        if (info) {
          emitChange({
            ...props.value,
            connectionName: info.connectionName,
            databaseName: info.databaseName,
            tableName: info.tableName,
            connectionId: info.connectionId,
            databaseType: info.databaseType,
          })
        }
      } catch (error) {
        console.error('AggregatePanel loadSourceInfo error', error)
      }
    }

    onMounted(() => {
      loadFields()
      loadSourceInfo()
    })

    const emitChange = (val: any) => emit('change', val)

    const config = computed({
      get: () => props.value,
      set: (val) => emitChange(val),
    })

    const useRawPipeline = computed({
      get: () => config.value.useRawPipeline,
      set: (val) => {
        emitChange({ ...config.value, useRawPipeline: val })
      },
    })

    const rawPipeline = computed({
      get: () => config.value.rawPipeline,
      set: (val) => {
        emitChange({ ...config.value, rawPipeline: val })
      },
    })

    const pipelineJson = computed(() => buildPipelineJSON(config.value))

    const enableDeleteWhenEmpty = computed({
      get: () => config.value.enableDeleteWhenEmpty ?? false,
      set: (val: boolean) =>
        emitChange({ ...config.value, enableDeleteWhenEmpty: val }),
    })

    const effectiveUpdateFields = computed({
      get: () => config.value.effectiveUpdateFields ?? [],
      set: (val: string[]) =>
        emitChange({ ...config.value, effectiveUpdateFields: val }),
    })

    const groupChangeFields = computed({
      get: () => config.value.groupChangeFields ?? [],
      set: (val: string[]) =>
        emitChange({ ...config.value, groupChangeFields: val }),
    })

    const hasEventConfig = computed(
      () =>
        enableDeleteWhenEmpty.value ||
        effectiveUpdateFields.value.length > 0 ||
        groupChangeFields.value.length > 0,
    )

    const groupFieldNames = computed(() =>
      (config.value.groupFields || []).map((g) => g.field).filter(Boolean),
    )

    const hasGroupButNoEffective = computed(
      () =>
        groupFieldNames.value.length > 0 &&
        groupChangeFields.value.length === 0,
    )

    return () => (
      <div class="aggregate-panel">
        <div class="aggregate-panel__mode flex align-center gap-2">
          <span class="fw-sub">{t('packages_form_aggregate_mode')}</span>
          <ElTooltip
            content={t('packages_form_aggregate_mode_tip')}
            placement="top"
          >
            <ElSwitch
              disabled={props.disabled}
              class="ml-auto"
              modelValue={useRawPipeline.value}
              onUpdate:modelValue={(val: any) => (useRawPipeline.value = !!val)}
              active-text={t('packages_form_aggregate_raw_pipeline')}
              inactive-text={t('packages_form_aggregate_visual')}
            />
          </ElTooltip>
        </div>

        {useRawPipeline.value ? (
          <div class="aggregate-panel__raw">
            <PipelineEditor
              disabled={props.disabled}
              modelValue={rawPipeline.value}
              fields={rawFields.value}
              height={320}
              onChange={(val: string) => (rawPipeline.value = val)}
            />
          </div>
        ) : (
          <ElCollapse v-model={activeCollapse.value}>
            {/* $match */}
            <ElCollapseItem name="match">
              {{
                title: () =>
                  renderCollapseTitle(
                    t('packages_form_aggregate_match_title'),
                    config.value.matchConditions.length,
                    t('packages_form_aggregate_match_tip'),
                  ),
                default: () => (
                  <MatchFilter
                    disabled={props.disabled}
                    conditions={config.value.matchConditions}
                    fieldOptions={fieldOptions.value}
                    loading={fieldsLoading.value}
                    onUpdate:conditions={(val: MatchCondition[]) =>
                      emitChange({ ...config.value, matchConditions: val })
                    }
                  />
                ),
              }}
            </ElCollapseItem>
            {/* $group */}
            <ElCollapseItem name="group">
              {{
                title: () =>
                  renderCollapseTitle(
                    t('packages_form_aggregate_group_title'),
                    config.value.groupFields.length,
                    t('packages_form_aggregate_group_tip'),
                  ),
                default: () => (
                  <GroupFields
                    disabled={props.disabled}
                    fields={config.value.groupFields}
                    fieldOptions={fieldOptions.value}
                    loading={fieldsLoading.value}
                    onUpdate:fields={(val: GroupField[]) =>
                      emitChange({ ...config.value, groupFields: val })
                    }
                  />
                ),
              }}
            </ElCollapseItem>
            {/* Aggregations */}
            <ElCollapseItem name="aggregate">
              {{
                title: () =>
                  renderCollapseTitle(
                    t('packages_form_aggregate_fields_title'),
                    config.value.aggregateFields.length,
                    t('packages_form_aggregate_fields_tip'),
                  ),
                default: () => (
                  <AggregateFields
                    disabled={props.disabled}
                    fields={config.value.aggregateFields}
                    fieldOptions={fieldOptions.value}
                    loading={fieldsLoading.value}
                    onUpdate:fields={(val: AggregateField[]) =>
                      emitChange({ ...config.value, aggregateFields: val })
                    }
                  />
                ),
              }}
            </ElCollapseItem>
          </ElCollapse>
        )}

        {/* 事件处理逻辑 */}
        <div class="event-handling">
          <div class="event-handling__header">
            <div class="event-handling__header-left">
              <el-icon size={14} class="event-handling__icon">
                <i-lucide-zap />
              </el-icon>
              <span class="event-handling__title">
                {t('packages_form_aggregate_event_title')}
              </span>
              {hasEventConfig.value && (
                <ElTag type="primary" size="small">
                  {t('packages_form_aggregate_event_configured')}
                </ElTag>
              )}
            </div>
          </div>

          <div class="event-handling__body pt-0">
            {/* 删除事件处理 */}
            {/* <div class="event-handling__card">
              <div class="event-handling__card-title">
                <el-icon size={16} class="text-red-500">
                  <i-lucide-trash-2 />
                </el-icon>
                <div>
                  <div class="text-sm font-medium">
                    {t('packages_form_aggregate_event_delete_title')}
                  </div>
                  <div class="event-handling__desc">
                    {t('packages_form_aggregate_event_delete_desc')}
                  </div>
                </div>
              </div>

              <div class="event-handling__switch-row">
                <div class="event-handling__switch-left">
                  <el-icon size={16} class="text-amber-500">
                    <i-lucide-alert-triangle />
                  </el-icon>
                  <span class="text-sm">
                    {t('packages_form_aggregate_event_delete_switch')}
                  </span>
                  <ElTooltip
                    placement="top"
                    content={t(
                      'packages_form_aggregate_event_delete_switch_tip',
                    )}
                  >
                    <el-icon class="event-handling__info-sm">
                      <i-lucide-info />
                    </el-icon>
                  </ElTooltip>
                </div>
                <ElSwitch
                  disabled={props.disabled}
                  modelValue={enableDeleteWhenEmpty.value}
                  onUpdate:modelValue={(val: any) =>
                    (enableDeleteWhenEmpty.value = !!val)
                  }
                />
              </div>

              {enableDeleteWhenEmpty.value && (
                <div class="event-handling__warning">
                  <el-icon size={14} class="event-handling__warning-icon">
                    <i-lucide-alert-circle />
                  </el-icon>
                  <span class="text-xs">
                    {t('packages_form_aggregate_event_delete_warning')}
                  </span>
                </div>
              )}
            </div> */}

            {/* 有效更新字段 */}
            <div class="event-handling__card">
              <div class="event-handling__card-title">
                <el-icon size={14} class="text-blue-500">
                  <i-lucide-refresh-cw />
                </el-icon>
                <div class="flex-1">
                  <div class="flex align-center gap-2">
                    <span class="text-sm font-medium">
                      {t('packages_form_aggregate_event_update_title')}
                    </span>
                  </div>
                  <div class="event-handling__desc">
                    {t('packages_form_aggregate_event_update_desc')}
                  </div>
                </div>
              </div>

              <BaseFieldSelect
                disabled={props.disabled}
                modelValue={effectiveUpdateFields.value}
                options={fieldOptions.value}
                loading={fieldsLoading.value}
                {...({
                  multiple: true,
                  filterable: true,
                  clearable: true,
                  placeholder: t(
                    'packages_form_aggregate_event_update_placeholder',
                  ),
                  onChange: (val: string[]) =>
                    (effectiveUpdateFields.value = val),
                } as any)}
              />
            </div>

            <div class="event-handling__card">
              <div class="event-handling__card-title">
                <el-icon size={14} class="text-blue-500">
                  <i-lucide-refresh-cw />
                </el-icon>
                <div class="flex-1">
                  <div class="flex align-center gap-2">
                    <span class="text-sm font-medium">
                      {t('packages_form_aggregate_event_group_change_title')}
                    </span>
                    <ElTooltip placement="top">
                      {{
                        content: () => (
                          <div style="max-width: 280px">
                            <p>
                              {t(
                                'packages_form_aggregate_event_update_tip_intro',
                              )}
                            </p>
                            <ol class="pl-4 mt-1" style="list-style: decimal">
                              <li>
                                {t(
                                  'packages_form_aggregate_event_update_tip_step1',
                                )}
                              </li>
                              <li>
                                {t(
                                  'packages_form_aggregate_event_update_tip_step2',
                                )}
                              </li>
                            </ol>
                            <p class="mt-1">
                              {t(
                                'packages_form_aggregate_event_update_tip_note',
                              )}
                            </p>
                          </div>
                        ),
                        default: () => (
                          <el-icon class="event-handling__info-sm">
                            <i-lucide-info />
                          </el-icon>
                        ),
                      }}
                    </ElTooltip>
                  </div>
                  <div class="event-handling__desc">
                    {t('packages_form_aggregate_event_group_change_desc')}
                  </div>
                </div>
              </div>

              <BaseFieldSelect
                disabled={props.disabled}
                modelValue={groupChangeFields.value}
                options={fieldOptions.value}
                loading={fieldsLoading.value}
                {...({
                  multiple: true,
                  filterable: true,
                  clearable: true,
                  placeholder: t(
                    'packages_form_aggregate_event_group_change_placeholder',
                  ),
                  onChange: (val: string[]) => (groupChangeFields.value = val),
                } as any)}
              />

              {hasGroupButNoEffective.value && (
                <div class="event-handling__hint">
                  <el-icon size={14} class="event-handling__hint-icon">
                    <i-lucide-alert-triangle />
                  </el-icon>
                  <span class="text-xs">
                    {t('packages_form_aggregate_event_update_hint')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {!useRawPipeline.value && <PipelinePreview code={pipelineJson.value} />}
      </div>
    )
  },
})

function renderCollapseTitle(title: string, count: number, tooltip: string) {
  return (
    <div class="flex align-center gap-2">
      <span class="font-medium">{title}</span>
      {count > 0 && <ElBadge class="lh-1" value={count} type="primary" />}
      <ElTooltip content={tooltip} placement="top">
        <el-icon class="text-gray-400 cursor-help">
          <i-lucide-info />
        </el-icon>
      </ElTooltip>
    </div>
  )
}
