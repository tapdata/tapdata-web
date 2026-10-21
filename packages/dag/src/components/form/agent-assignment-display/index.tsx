import { observer } from '@formily/reactive-vue'
import { useForm } from '@tap/form'
import i18n from '@tap/i18n'
import { defineComponent, inject } from 'vue'
import { getAccessNodeDisplayName } from '../../../utils/accessNodePolicy'
import './style.scss'

const GROUP = 'MANUALLY_SPECIFIED_BY_THE_USER_AGENT_GROUP'
const ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function displayAgentName(agent: any) {
  const candidates = [
    agent?.agentName,
    agent?.hostName,
    agent?.systemInfo?.hostname,
    agent?.hostname,
    agent?.accessNodeName,
    getAccessNodeDisplayName(agent),
  ]
  return candidates.find((name) => name && !ID_PATTERN.test(name))
}

export const AgentAssignmentDisplay = observer(
  defineComponent({
    name: 'AgentAssignmentDisplay',
    setup() {
      const form = useForm()
      const scope = inject<any>('formScope')

      return () => {
        const attrs = form.value.values.attrs || {}
        const agentMap = scope?.$agentMap || {}
        const agentOptions = scope?.$agents || []
        const processId = attrs.accessNodeProcessId
        const processIds: string[] = attrs.accessNodeProcessIdList || []
        const selectedInfo = processId && agentMap[processId]
        const isGroup =
          attrs.accessNodeType === GROUP ||
          selectedInfo?.accessNodeType === GROUP ||
          Boolean(selectedInfo?.accessNodes) ||
          (!processId && processIds.length > 0)
        const isAutomatic = !isGroup && !processId

        const groupOptions = agentOptions.filter(
          (option: any) => option.accessNodeType === GROUP,
        )
        const ids = new Set(processIds.filter(Boolean))
        const exactGroup = groupOptions.find(
          (option: any) => processId && option.value === processId,
        )
        const matchingGroups = groupOptions.filter(
          (option: any) =>
            ids.size > 0 &&
            [...ids].every((id) =>
              option.children?.some((child: any) => child.value === id),
            ),
        )
        const group = isGroup
          ? exactGroup ||
            groupOptions.find(
              (option: any) =>
                ids.size > 0 &&
                option.children?.length === ids.size &&
                option.children.every((child: any) => ids.has(child.value)),
            ) ||
            (matchingGroups.length === 1 ? matchingGroups[0] : undefined)
          : undefined
        const groupInfo = group && agentMap[group.value]
        const members =
          groupInfo?.accessNodes ||
          group?.children
            ?.map((child: any) => agentMap[child.value])
            .filter(Boolean) ||
          []
        const manualAgent = selectedInfo
        const title = isAutomatic
          ? i18n.t('packages_dag_connection_form_automatic')
          : isGroup
            ? groupInfo?.accessNodeName ||
              group?.label?.replace(/（.*$/, '') ||
              i18n.t('packages_dag_agent_display_unavailable')
            : displayAgentName(manualAgent) ||
              i18n.t('packages_dag_agent_display_unavailable')
        const mode = isAutomatic
          ? i18n.t('packages_dag_connection_form_automatic')
          : isGroup
            ? i18n.t('packages_business_connection_form_group')
            : i18n.t('packages_dag_connection_form_manual')

        return (
          <div
            class={['agent-assignment', isGroup && 'agent-assignment--group']}
          >
            <div class="agent-assignment__main">
              <span class="agent-assignment__icon" aria-hidden="true">
                <ElIcon size={17}>
                  {isAutomatic ? (
                    <ILucideShuffle />
                  ) : isGroup ? (
                    <ILucideTags />
                  ) : (
                    <ILucideServer />
                  )}
                </ElIcon>
              </span>
              <span class="agent-assignment__text">
                <span class="agent-assignment__mode">{mode}</span>
                <span class="agent-assignment__name" title={title}>
                  {title}
                </span>
              </span>
            </div>
            {isGroup && members.length > 0 && (
              <div class="agent-assignment__members">
                {members.map((member: any) => {
                  const name =
                    displayAgentName(agentMap[member.processId] || member) ||
                    i18n.t('packages_dag_agent_display_unavailable')
                  const preferred =
                    attrs.priorityProcessId &&
                    member.processId === attrs.priorityProcessId
                  return (
                    <span
                      key={member.processId}
                      class={[
                        'agent-assignment__member',
                        preferred && 'agent-assignment__member--preferred',
                      ]}
                      title={name}
                    >
                      <span
                        class={[
                          'agent-assignment__member-dot',
                          member.status !== 'running' &&
                            'agent-assignment__member-dot--offline',
                        ]}
                      />
                      <span class="agent-assignment__member-name">{name}</span>
                      {preferred && (
                        <span class="agent-assignment__priority">
                          <ElIcon size={12}>
                            <ILucideStar />
                          </ElIcon>
                          {i18n.t('packages_dag_agent_display_priority')}
                        </span>
                      )}
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        )
      }
    },
  }),
)
