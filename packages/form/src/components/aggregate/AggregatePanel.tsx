import { SchemaExpressionScopeSymbol, useForm } from '@formily/vue'
import {
  getNodeSchema,
  getNodeSchemaPage,
} from '@tap/api/src/core/metadata-instances'
import { useI18n } from '@tap/i18n'
import {
  computed,
  defineComponent,
  inject,
  onMounted,
  ref,
  type PropType,
} from 'vue'
import { mapFieldsData } from '../field-select/FieldSelect'
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
      if (!nodeId) return
      fieldsLoading.value = true
      try {
        let fields: any[] = []
        if (form?.values?.type?.includes?.('migrate')) {
          const result = await getNodeSchemaPage({
            nodeId,
            fields: [
              'original_name',
              'fields',
              'qualified_name',
              'name',
              'indices',
            ],
            page: 1,
            pageSize: 1,
          })
          const { fields: mapped } = mapFieldsData(result?.items?.[0])
          fields = mapped
        } else {
          const data = await getNodeSchema(nodeId)
          const { fields: mapped } = mapFieldsData({
            fields: data?.[0]?.fields || [],
          })
          fields = mapped
        }
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

    return () => (
      <div class="aggregate-panel">
        <div class="aggregate-panel__mode flex align-center gap-2">
          <span class="fw-sub">{t('packages_form_aggregate_mode')}</span>
          <ElTooltip
            content={t('packages_form_aggregate_mode_tip')}
            placement="top"
          >
            <ElSwitch
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
