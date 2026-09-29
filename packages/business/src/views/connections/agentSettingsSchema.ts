import { findAccessNodeInfo } from '@tap/api/src/core/cluster'
import i18n from '@tap/i18n'

export const AUTOMATIC_AGENT_ALLOCATION = 'AUTOMATIC_PLATFORM_ALLOCATION'
export const MANUAL_AGENT_ALLOCATION = 'MANUALLY_SPECIFIED_BY_THE_USER'
export const AGENT_GROUP_ALLOCATION =
  'MANUALLY_SPECIFIED_BY_THE_USER_AGENT_GROUP'

export type AgentAllocationType =
  | typeof AUTOMATIC_AGENT_ALLOCATION
  | typeof MANUAL_AGENT_ALLOCATION
  | typeof AGENT_GROUP_ALLOCATION

export interface AgentSettingsValues {
  accessNodeType: AgentAllocationType
  accessNodeProcessId: string | null
  priorityProcessId: string | null
}

export interface BatchAgentSettingsPayload {
  requestId: string
  connectionIds: string[]
  settings: AgentSettingsValues
}

interface AgentInfo {
  processId?: string
  agentName?: string
  hostName?: string
  status?: string
  accessNodeType?: string
  accessNodeName?: string
  accessNodes?: AgentInfo[]
}

interface AgentOption {
  value: string
  label: string
  disabled?: boolean
  accessNodeType?: string
  children?: AgentOption[]
}

type Translate = (key: string) => string

export function createAgentSettingsProperties(
  t: Translate,
  isDaas: boolean,
): Record<string, any> {
  const automaticLabel = JSON.stringify(
    t('packages_business_connection_form_automatic'),
  )
  const manualLabel = JSON.stringify(
    t('packages_business_connection_form_manual'),
  )
  const groupLabel = JSON.stringify(
    t('packages_business_connection_form_group'),
  )
  const chooseAgentLabel = JSON.stringify(t('packages_business_choose_agent'))
  const chooseAgentGroupLabel = JSON.stringify(
    t('packages_business_choose_agent_group'),
  )
  const agentRequiredMessage = JSON.stringify(
    t('packages_business_agent_select_placeholder'),
  )
  const agentNotFoundMessage = JSON.stringify(
    t('packages_business_agent_select_not_found'),
  )
  const rocksdbAgentMessage = JSON.stringify(
    t('packages_business_agent_select_not_found_for_rocksdb'),
  )

  const options = isDaas
    ? `[
        { label: ${automaticLabel}, value: '${AUTOMATIC_AGENT_ALLOCATION}' },
        { label: ${manualLabel}, value: '${MANUAL_AGENT_ALLOCATION}' },
        { label: ${groupLabel}, value: '${AGENT_GROUP_ALLOCATION}' }
      ]`
    : `[
        { label: ${automaticLabel}, value: '${AUTOMATIC_AGENT_ALLOCATION}' },
        { label: ${manualLabel}, value: '${MANUAL_AGENT_ALLOCATION}' }
      ]`

  return {
    accessNodeType: {
      type: 'string',
      title: t('packages_business_connection_form_access_node'),
      default: AUTOMATIC_AGENT_ALLOCATION,
      'x-decorator': 'FormItem',
      'x-decorator-props': {
        tooltip: t('packages_business_connection_form_access_node_tip'),
      },
      'x-component': 'Select',
      enum: [
        {
          label: t('packages_business_connection_form_automatic'),
          value: AUTOMATIC_AGENT_ALLOCATION,
        },
        {
          label: t('packages_business_connection_form_manual'),
          value: MANUAL_AGENT_ALLOCATION,
        },
        ...(isDaas
          ? [
              {
                label: t('packages_business_connection_form_group'),
                value: AGENT_GROUP_ALLOCATION,
              },
            ]
          : []),
      ],
      'x-reactions': [
        {
          dependencies: ['__TAPDATA.shareCdcEnable'],
          fulfill: {
            state: {
              value: `{{!$isDaas && $deps[0] ? '${MANUAL_AGENT_ALLOCATION}' : $self.value}}`,
              dataSource: `{{!$isDaas && $deps[0] ? [
                { label: ${automaticLabel}, value: '${AUTOMATIC_AGENT_ALLOCATION}', disabled: true },
                { label: ${manualLabel}, value: '${MANUAL_AGENT_ALLOCATION}' }
              ] : !$isDaas ? [
                { label: ${automaticLabel}, value: '${AUTOMATIC_AGENT_ALLOCATION}' },
                { label: ${manualLabel}, value: '${MANUAL_AGENT_ALLOCATION}' }
              ] : ${options}}}`,
            },
          },
        },
        {
          target: '__TAPDATA.accessNodeProcessId',
          effects: ['onFieldInputValueChange'],
          fulfill: {
            state: {
              value: '',
            },
          },
        },
      ],
    },
    accessNodeOption: {
      type: 'string',
      'x-display': 'hidden',
      'x-reactions': [
        {
          dependencies: ['.accessNodeType'],
          fulfill: {
            state: {
              visible: `{{['${MANUAL_AGENT_ALLOCATION}', '${AGENT_GROUP_ALLOCATION}'].includes($deps[0])}}`,
            },
          },
        },
        '{{useAsyncDataSource(loadAccessNode, "dataSource", {value: $self.value})}}',
      ],
    },
    agentWrap: {
      type: 'void',
      'x-component': 'Space',
      'x-component-props': {
        class: 'w-100 align-items-start',
      },
      'x-reactions': {
        dependencies: ['.accessNodeType'],
        fulfill: {
          state: {
            visible: `{{['${MANUAL_AGENT_ALLOCATION}', '${AGENT_GROUP_ALLOCATION}'].includes($deps[0])}}`,
          },
        },
      },
      properties: {
        accessNodeProcessId: {
          type: 'string',
          description: `{{$values.__TAPDATA.shareCdcEnable ? ${rocksdbAgentMessage} : ''}}`,
          'x-decorator': 'FormItem',
          'x-decorator-props': {
            colon: false,
            class: 'flex-1',
          },
          'x-component': 'Select',
          'x-component-props': {
            onChange: "{{ () => $self.setSelfErrors('') }}",
          },
          'x-reactions': [
            {
              dependencies: ['.accessNodeType', '.accessNodeOption#dataSource'],
              fulfill: {
                state: {
                  title: `{{'${AGENT_GROUP_ALLOCATION}' === $deps[0] ? ${chooseAgentGroupLabel} : ${chooseAgentLabel}}}`,
                },
                run: `
                  if (!$deps[1]) return
                  $self.dataSource = $deps[1].filter(item => item.accessNodeType === $deps[0])
                  if ($self.value && $self.dataSource.length && !$self.dataSource.some(item => item.value === $self.value)) {
                    $self.setSelfErrors(${agentNotFoundMessage})
                  }
                `,
              },
            },
          ],
          'x-validator': `{{(value, rule, ctx) => {
            if (!value) {
              let msg = ${agentRequiredMessage}
              const { shareCDCExternalStorageId } = $values.__TAPDATA
              if (shareCDCExternalStorageId) {
                const dataSource = $form.query('__TAPDATA.shareCDCExternalStorageId').get('dataSource')
                const type = dataSource.find(item => item.value === shareCDCExternalStorageId)?.type
                if (type === 'rocksdb') msg = ${rocksdbAgentMessage}
              }
              return msg
            } else if (ctx.field.dataSource?.length && !ctx.field.dataSource.some(item => item.value === value)) {
              $self.setSelfErrors('')
              return ${agentNotFoundMessage}
            }
          }}}`,
        },
        priorityProcessId: {
          title: t('packages_business_priorityProcessId'),
          type: 'string',
          default: '',
          'x-decorator': 'FormItem',
          'x-decorator-props': {
            class: 'flex-1',
          },
          'x-component': 'Select',
          'x-reactions': {
            dependencies: [
              '.accessNodeType',
              '.accessNodeOption#dataSource',
              '.accessNodeProcessId',
            ],
            fulfill: {
              state: {
                visible: `{{'${AGENT_GROUP_ALLOCATION}' === $deps[0]}}`,
              },
              run: `
                let children = []
                if ($deps[1] && $deps[2]) {
                  children = $deps[1].find(item => item.accessNodeType === $deps[0] && item.value === $deps[2])?.children || []
                }
                $self.dataSource = [
                  { label: ${automaticLabel}, value: '' }
                ].concat(children)
                if ($self.value && !children.some(item => item.value === $self.value)) {
                  $self.value = ''
                }
              `,
            },
          },
        },
      },
    },
  }
}

export async function loadAccessNodeOptions(
  _field: unknown,
  others: { value?: string } = {},
): Promise<AgentOption[]> {
  const data: AgentInfo[] = await findAccessNodeInfo({})

  const mapAgent = (item: AgentInfo): AgentOption => ({
    value: item.processId || '',
    label: `${item.agentName || item.hostName}（${
      item.status === 'running'
        ? i18n.t('public_status_running')
        : i18n.t('public_agent_status_offline')
    }）`,
    disabled: item.status !== 'running',
    accessNodeType: item.accessNodeType,
  })

  return (
    data
      ?.filter(
        (item) =>
          item.status === 'running' ||
          item.accessNodeType === AGENT_GROUP_ALLOCATION ||
          item.processId === others.value,
      )
      .map((item) => {
        if (item.accessNodeType === AGENT_GROUP_ALLOCATION) {
          return {
            value: item.processId || '',
            label: `${item.accessNodeName}（${i18n.t('public_status_running')}：${
              item.accessNodes?.filter((agent) => agent.status === 'running')
                .length || 0
            }）`,
            accessNodeType: item.accessNodeType,
            children: item.accessNodes?.map(mapAgent) || [],
          }
        }
        return mapAgent(item)
      }) || []
  )
}
