import { observer } from '@formily/reactive-vue'
import { useForm } from '@tap/form'
import i18n from '@tap/i18n'
import { defineComponent, type PropType } from 'vue'
import './style.scss'

const AUTOMATIC = 'AUTOMATIC_PLATFORM_ALLOCATION'
const MANUAL = 'MANUALLY_SPECIFIED_BY_THE_USER'
const GROUP = 'MANUALLY_SPECIFIED_BY_THE_USER_AGENT_GROUP'

export const TaskAgentSettings = observer(
  defineComponent({
    name: 'TaskAgentSettings',
    props: {
      getOptions: {
        type: Function as PropType<(accessNodeType: string) => any[]>,
        required: true,
      },
      getConnectionCount: {
        type: Function as PropType<() => number>,
        required: true,
      },
      refreshConnectionConfigs: {
        type: Function as PropType<() => Promise<void>>,
        required: true,
      },
    },
    setup(props) {
      const formRef = useForm()

      const setMode = (mode: string) => {
        const form = formRef.value
        form.setValuesIn('accessNodeType', mode)
        form.setValuesIn('accessNodeProcessId', '')
        form.setValuesIn('priorityProcessId', '')
      }

      const setProcessId = (processId: string) => {
        const form = formRef.value
        form.setValuesIn('accessNodeProcessId', processId)
        form.setValuesIn('priorityProcessId', '')
      }

      return () => {
        const form = formRef.value
        const values = form.values || {}
        const mode = values.accessNodeType || AUTOMATIC
        const isAutomatic = mode === AUTOMATIC
        const isGroup = mode === GROUP
        const options = props.getOptions(mode) || []
        const processId = values.accessNodeProcessId || ''
        const selected = options.find(
          (option: any) => option.value === processId,
        )
        const priorityOptions = selected?.children || []
        const selectionInvalid = Boolean(processId && !selected)
        const disabled = form.disabled
        const connectionCount = props.getConnectionCount() || 0

        return (
          <section
            class={[
              'task-agent-settings',
              !isAutomatic && 'task-agent-settings--custom',
            ]}
          >
            <div class="task-agent-settings__header">
              <span class="task-agent-settings__icon" aria-hidden="true">
                <ElIcon size={17}>
                  {isAutomatic ? (
                    <ILucideShuffle />
                  ) : (
                    <ILucideSlidersHorizontal />
                  )}
                </ElIcon>
              </span>
              <div class="task-agent-settings__summary">
                <div class="task-agent-settings__title">
                  {isAutomatic
                    ? i18n.t('packages_dag_connection_form_automatic')
                    : i18n.t('packages_dag_task_agent_custom')}
                </div>
                <div class="task-agent-settings__description">
                  {isAutomatic
                    ? i18n.t('packages_dag_task_agent_auto_desc')
                    : connectionCount
                      ? i18n.t('packages_dag_task_agent_compatible_summary', {
                          connections: connectionCount,
                          agents: options.length,
                        })
                      : i18n.t('packages_dag_task_agent_options_summary', {
                          agents: options.length,
                        })}
                </div>
              </div>
              {isAutomatic ? (
                <ElButton
                  text
                  disabled={disabled}
                  onClick={() => setMode(MANUAL)}
                >
                  {{
                    icon: () => <ILucideSlidersHorizontal />,
                    default: () => i18n.t('packages_dag_task_agent_customize'),
                  }}
                </ElButton>
              ) : (
                <ElButton
                  text
                  disabled={disabled}
                  onClick={() => setMode(AUTOMATIC)}
                >
                  {{
                    icon: () => <ILucideRotateCcw />,
                    default: () =>
                      i18n.t('packages_dag_task_agent_use_automatic'),
                  }}
                </ElButton>
              )}
            </div>

            {!isAutomatic && (
              <div class="task-agent-settings__body">
                <ElSegmented
                  class="task-agent-settings__mode"
                  modelValue={mode}
                  disabled={disabled}
                  options={[
                    {
                      label: i18n.t('packages_dag_connection_form_manual'),
                      value: MANUAL,
                    },
                    {
                      label: i18n.t('packages_business_connection_form_group'),
                      value: GROUP,
                    },
                  ]}
                  onChange={setMode}
                />

                {options.length ? (
                  <div class="task-agent-settings__fields">
                    <label class="task-agent-settings__field">
                      <span class="task-agent-settings__label">
                        {i18n.t(
                          isGroup
                            ? 'packages_business_choose_agent_group'
                            : 'packages_business_choose_agent',
                        )}
                      </span>
                      <ElSelect
                        modelValue={processId}
                        disabled={disabled}
                        class={['w-100', selectionInvalid && 'is-error']}
                        placeholder={i18n.t(
                          isGroup
                            ? 'packages_business_choose_agent_group'
                            : 'packages_business_choose_agent',
                        )}
                        onUpdate:modelValue={setProcessId}
                        onVisibleChange={(visible: boolean) => {
                          if (visible) props.refreshConnectionConfigs()
                        }}
                      >
                        {options.map((option: any) => (
                          <ElOption
                            key={option.value}
                            value={option.value}
                            label={option.label}
                            disabled={option.disabled}
                          />
                        ))}
                      </ElSelect>
                    </label>

                    {isGroup && processId && !selectionInvalid && (
                      <label class="task-agent-settings__field">
                        <span class="task-agent-settings__label">
                          {i18n.t('packages_business_priorityProcessId')}
                        </span>
                        <ElSelect
                          modelValue={values.priorityProcessId || ''}
                          disabled={disabled}
                          class="w-100"
                          onUpdate:modelValue={(value: string) =>
                            form.setValuesIn('priorityProcessId', value)
                          }
                        >
                          <ElOption
                            value=""
                            label={i18n.t(
                              'packages_business_connection_form_automatic',
                            )}
                          />
                          {priorityOptions.map((option: any) => (
                            <ElOption
                              key={option.value}
                              value={option.value}
                              label={option.label}
                              disabled={option.disabled}
                            />
                          ))}
                        </ElSelect>
                      </label>
                    )}
                  </div>
                ) : (
                  <div class="task-agent-settings__empty">
                    <ElIcon size={16}>
                      <ILucideCircleAlert />
                    </ElIcon>
                    <div>
                      <div class="task-agent-settings__empty-title">
                        {i18n.t('packages_dag_task_agent_no_compatible')}
                      </div>
                      <div class="task-agent-settings__empty-description">
                        {i18n.t(
                          connectionCount
                            ? 'packages_dag_task_agent_no_compatible_desc'
                            : 'packages_dag_task_agent_no_available_desc',
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {selectionInvalid && (
                  <div class="task-agent-settings__error" role="alert">
                    <ElIcon size={14}>
                      <ILucideCircleAlert />
                    </ElIcon>
                    {i18n.t('packages_dag_task_agent_selection_invalid')}
                  </div>
                )}
              </div>
            )}
          </section>
        )
      }
    },
  }),
)
