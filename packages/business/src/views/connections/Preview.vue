<script setup lang="ts">
import {
  dataPermissionApi,
  getHeartbeatTaskByConnectionId,
  proxyApi,
  updateConnectionById,
  usersApi,
} from '@tap/api'
import Drawer from '@tap/component/src/Drawer.vue'
import { Modal } from '@tap/component/src/modal'
import i18n from '@tap/i18n'
import { openUrl } from '@tap/shared'
import dayjs from 'dayjs'
import { cloneDeep } from 'lodash-es'
import { inject, onBeforeUnmount, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { DatabaseIcon } from '../../components/DatabaseIcon'
import StatusTag from '../../components/StatusTag.vue'
import PermissionsDialog from './PermissionsDialog.vue'
import { getConnectionIcon as getConnectionIconUtil } from './util'
import type Test from './Test.vue'

interface Connection {
  id: string
  name: string
  status: string
  config: {
    host?: string
    port?: string
    database?: string
    sid?: string
    schema?: string
    user?: string
    username?: string
    extParams?: string
    addtionalString?: string
    timezone?: string
    uri?: string
    isUri?: boolean
  }
  pdkHash: string
  definitionPdkId: string
  agentType: string
  heartbeatEnable?: boolean
  heartbeatTable?: string
  database_type?: string
  uri?: string
  databaseLogInfo?: {
    key: string
    value: string
  }
  last_updated: string
  loadSchemaTime?: string
  btnLoading: {
    deploy: boolean
    stop: boolean
    delete: boolean
  }
  permissionActions?: string[]
  // Additional properties from transformData
  database_host?: string
  database_port?: string
  database_name?: string
  database_owner?: string
  database_username?: string
  addtionalString?: string
  database_datetype_without_timezone?: string
  sourceFrom?: string
  // Additional properties for source from
  definitionScope?: string
  beta?: boolean
  loadFieldsStatus?: string
}

interface ListItem {
  icon: string
  items: {
    label: string
    key: string
    value?: string
    class?: string
    action?: () => void
    labelAction?: () => void
    labelActionTitle?: string
  }[]
}

defineProps<{
  hideOperation?: boolean
}>()

const emit = defineEmits<{
  (e: 'test', connection: Connection): void
  (e: 'close'): void
  (e: 'loadSchema', connection: Connection): void
}>()

const router = useRouter()
const checkAgent = inject('checkAgent') as (cb?: () => void) => void

const isDaas = import.meta.env.VUE_APP_PLATFORM === 'DAAS'
const visible = ref(false)
const timer = ref<ReturnType<typeof setTimeout> | null>(null)
const databaseLogInfoTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const loading = ref(false)
const showProgress = ref(false)
const progress = ref(0)
const connection = reactive<Connection>({
  btnLoading: {
    deploy: false,
    stop: false,
    delete: false,
  },
} as Connection)

const list = ref<ListItem[]>([])
const mqType = {
  0: 'ActiveMQ',
  1: 'RabbitMQ',
  2: 'RocketMQ',
}

const configModel = {
  default: [
    {
      icon: 'time',
      items: [
        {
          label: i18n.t('public_connection_table_structure_update_time'),
          key: 'loadSchemaTime',
        },
      ],
    },
    {
      icon: 'database',
      items: [
        {
          label: i18n.t('public_connection_form_database_address'),
          key: 'database_host',
        },
      ],
    },
    {
      icon: 'port',
      items: [
        {
          label: i18n.t('public_connection_form_host'),
          key: 'database_port',
        },
      ],
    },
    {
      icon: 'name',
      items: [
        {
          label: i18n.t('public_connection_form_database_name'),
          key: 'database_name',
        },
      ],
    },
    {
      icon: 'database-user-name',
      items: [
        {
          label: i18n.t('public_connection_form_account'),
          key: 'database_username',
        },
      ],
    },
    {
      icon: 'connect_schema',
      items: [
        {
          label: i18n.t('public_connection_form_schema'),
          key: 'database_owner',
        },
      ],
    },
    {
      icon: 'additional-string',
      items: [
        {
          label: i18n.t('public_connection_form_other_connection_string'),
          key: 'addtionalString',
        },
      ],
    },
    {
      icon: 'origin-time',
      items: [
        {
          label: i18n.t('public_connection_form_time_zone_of_time_type'),
          key: 'database_datetype_without_timezone',
        },
      ],
    },
  ],
}

const formData = ref<Connection>({} as Connection)
const permissions = ref<
  { checked: string[]; roleId: string; roleName: string }[]
>([])

const clearTimer = () => {
  clearTimeout(timer.value)
  clearTimeout(databaseLogInfoTimer.value)
  timer.value = null
  databaseLogInfoTimer.value = null
}

const handleClose = () => {
  clearTimer()
  visible.value = false
  showProgress.value = false
  emit('close')
}

const transformData = (row: Connection) => {
  if (!row.config) {
    row.config = {}
  }
  row.database_host = row.config.host
  row.database_port = row.config.port
  row.database_name = row.config.database || row.config.sid
  row.database_owner = row.config.schema
  row.database_username = row.config.user || row.config.username
  row.addtionalString = row.config.extParams || row.config.addtionalString
  row.database_datetype_without_timezone = row.config.timezone
  row.sourceFrom = getSourceFrom(row)
  row.loadSchemaTime = row.loadSchemaTime
    ? dayjs(row.loadSchemaTime).format('YYYY-MM-DD HH:mm:ss')
    : '-'
  if (row.config.uri && row.config.isUri !== false) {
    row.uri = row.config.uri
  }
  row.heartbeatTable = connection.heartbeatTable

  if (row.loadFieldsStatus === 'loading') {
    showProgress.value = true
    progress.value = Math.floor((row.loadCount * 100) / row.tableCount || 0)
  } else {
    showProgress.value = false
    progress.value = 0
  }

  return row
}

const open = async (row: Connection) => {
  visible.value = true
  Object.assign(connection, transformData(row))
  connection.last_updated = dayjs(row.last_updated).format(
    'YYYY-MM-DD HH:mm:ss',
  )
  await loadList(row)
  if (isDaas) {
    await loadPermissions(row.id)
  }
}

const edit = async () => {
  const { id, pdkHash, definitionPdkId: pdkId, agentType, name } = connection

  if (agentType === 'Local') {
    const confirmed = await Modal.confirm(
      `${i18n.t('packages_business_connections_list_dangqianlianjie')}${name}${i18n.t('packages_business_connections_list_zhengzaizuoweiF')}`,
    )

    if (!confirmed) return

    router.push({
      name: 'connectionsEdit',
      params: {
        id,
      },
      query: {
        pdkHash,
        pdkId,
      },
    })
  } else {
    router.push({
      name: 'connectionsEdit',
      params: {
        id,
      },
      query: {
        pdkHash,
        pdkId,
      },
    })
  }
}

const beforeTest = () => {
  checkAgent(() => {
    updateConnectionById(connection.id, {
      status: 'testing',
    }).then(() => {
      testRef.value?.start(true)
    })
  })
}

const loadSchema = () => {
  showProgress.value = true
  progress.value = 0
  emit('loadSchema', connection)
}

const loadList = async (row: Connection = {} as Connection) => {
  const heartbeatTable = await loadHeartbeatTable(row)

  connection.heartbeatTable = heartbeatTable?.[0]

  if (row.uri) {
    list.value = [
      configModel.default?.[0],
      ...(isDaas
        ? []
        : [
            {
              icon: 'link',
              items: [
                {
                  label: i18n.t('public_connection_form_link_plugin_source'),
                  key: 'sourceFrom',
                },
              ],
            },
          ]),
      connection.heartbeatTable
        ? {
            icon: 'link',
            items: [
              {
                label: i18n.t(
                  'packages_business_connections_databaseform_kaiqixintiaobiao',
                ),
                key: 'heartbeatTable',
                value: i18n.t(
                  'packages_business_connections_databaseform_chakanxintiaoren',
                ),
                class: 'cursor-pointer color-primary text-decoration-underline',
                action: () => {
                  const routeUrl = router.resolve({
                    name: 'HeartbeatMonitor',
                    params: {
                      id: connection.heartbeatTable,
                    },
                  })
                  openUrl(routeUrl.href)
                },
              },
            ],
          }
        : null,
      row.uri
        ? {
            icon: 'link',
            items: [
              {
                label: 'URI',
                key: 'uri',
                value: row.uri,
                class: 'text-break text-wrap',
              },
            ],
          }
        : null,
      row.databaseLogInfo?.value
        ? {
            icon: 'warning-circle',
            items: [
              {
                label: row.databaseLogInfo.key,
                key: 'databaseLogInfo',
                value: row.databaseLogInfo.value,
              },
            ],
          }
        : null,
    ].filter(Boolean) as ListItem[]
  } else {
    list.value = [
      ...configModel.default,
      ...(isDaas
        ? []
        : [
            {
              icon: 'link',
              items: [
                {
                  label: i18n.t('public_connection_form_link_plugin_source'),
                  key: 'sourceFrom',
                },
              ],
            },
          ]),
      connection.heartbeatTable
        ? {
            icon: 'link',
            items: [
              {
                label: i18n.t(
                  'packages_business_connections_databaseform_kaiqixintiaobiao',
                ),
                key: 'heartbeatTable',
                value: i18n.t(
                  'packages_business_connections_databaseform_chakanxintiaoren',
                ),
                class: 'cursor-pointer color-primary text-decoration-underline',
                action: () => {
                  const routeUrl = router.resolve({
                    name: 'HeartbeatMonitor',
                    params: {
                      id: connection.heartbeatTable,
                    },
                  })
                  openUrl(routeUrl.href)
                },
              },
            ],
          }
        : null,
      row.databaseLogInfo?.value
        ? {
            icon: 'warning-circle',
            items: [
              {
                label: row.databaseLogInfo.key,
                key: 'databaseLogInfo',
                value: row.databaseLogInfo.value,
              },
            ],
          }
        : null,
    ].filter(Boolean) as ListItem[]
  }

  if (isDaas) {
    list.value.unshift({
      icon: 'link',
      items: [
        {
          label: i18n.t(
            'packages_business_connections_preview_shujulianjiequan',
          ),
          key: 'permissions',
          labelActionTitle: i18n.t(
            'packages_business_connections_preview_quanxianguanli',
          ),
          labelAction: () => {
            permissionsDialogRef.value?.open(connection)
          },
        },
      ],
    })
  }

  await getDatabaseLogInfo(row)
}

const getConnectionIcon = () => {
  if (!connection) {
    return
  }
  return getConnectionIconUtil(connection?.pdkHash)
}

const sync = (list: Connection[]) => {
  if (!visible.value) return
  const result = list.find((item) => item.id === connection.id)
  if (!result) return
  formData.value = cloneDeep(result)
  Object.assign(connection, transformData(result))
}

const getSourceFrom = (row: Connection = {} as Connection) => {
  const { definitionScope, beta = false } = row
  const MAP = {
    publicfalse: i18n.t(
      'packages_business_components_connectiontypeselectorsort_renzhengshujuyuan',
    ),
    publictrue: i18n.t(
      'packages_business_components_connectiontypeselectorsort_betashu',
    ),
    customer: i18n.t(
      'packages_business_components_connectiontypeselectorsort_wodeshujuyuan',
    ),
  }
  return MAP[definitionScope + beta] || MAP.customer
}

const isFileSource = () => {
  return ['CSV', 'EXCEL', 'JSON', 'XML'].includes(connection?.database_type)
}

const loadHeartbeatTable = async (row: Connection = {} as Connection) => {
  if (!row.heartbeatEnable) return []
  return await getHeartbeatTaskByConnectionId(row.id)
}

const handleClick = (temp: { action?: () => void }) => {
  temp.action?.()
}

const loadPermissions = (id: string) => {
  const filter = {
    dataType: 'Connections',
    dataId: id,
  }
  dataPermissionApi.permissions(filter).then((data: any = []) => {
    usersApi
      .role({
        filter: JSON.stringify({
          limit: 1000,
        }),
      })
      .then((roleList) => {
        permissions.value = data
          .map((t) => {
            const role = roleList.items?.find((r) => r.id === t.typeId) || {
              name: '',
            }
            return {
              checked: t.actions,
              roleId: t.typeId,
              roleName: role.name,
            }
          })
          .filter((t) => !!t.roleName)
      })
  })
}

const getDisabled = (row: Connection = {} as Connection, type: string) => {
  if (!isDaas) return false
  const data = row.permissionActions || []
  return !data.includes(type)
}

const getDatabaseLogInfo = async (row: Connection = {} as Connection) => {
  const { id } = row
  const params = {
    className: 'PDKConnectionService',
    method: 'databaseLogInfoService',
    args: [id],
  }
  try {
    const data = await proxyApi.call(params)
    row.databaseLogInfo = data
    const findDatabaseLogInfo = list.value.find(
      (t) => t.items?.[0]?.key === 'databaseLogInfo',
    )
    if (findDatabaseLogInfo) {
      findDatabaseLogInfo.items[0].label = row.databaseLogInfo.key
      findDatabaseLogInfo.items[0].value = row.databaseLogInfo.value
    } else {
      row.databaseLogInfo.value &&
        list.value.push({
          icon: 'warning-circle',
          items: [
            {
              label: row.databaseLogInfo.key,
              key: 'databaseLogInfo',
              value: row.databaseLogInfo.value,
            },
          ],
        })
    }
    databaseLogInfoTimer.value = setTimeout(() => {
      getDatabaseLogInfo(row)
    }, 60000)
  } catch (error) {
    console.log(error)
  }
}

const testRef = ref<InstanceType<typeof Test> | null>(null)
const permissionsDialogRef = ref<InstanceType<typeof PermissionsDialog> | null>(
  null,
)

onBeforeUnmount(() => {
  clearTimer()

  permissionsDialogRef.value = null
})

defineExpose({
  open,
  sync,
  handleClose,
  beforeTest,
})
</script>

<template>
  <Drawer v-model="visible" width="400px">
    <template #header>
      <div class="flex align-center gap-2 font-color-dark overflow-hidden">
        <DatabaseIcon
          v-if="connection.pdkHash"
          class="flex-shrink-0"
          :pdk-hash="connection.pdkHash"
          :size="24"
        />
        <div class="fs-6 ellipsis">{{ connection.name }}</div>
        <status-tag text target="connection" :status="connection.status" />
      </div>
    </template>

    <div v-loading="loading" class="details-container">
      <div v-if="!hideOperation" class="mb-4">
        <div class="flex">
          <el-button
            v-if="showProgress"
            loading
            type="primary"
            class="flex-fill min-w-0"
          >
            {{ progress }}%
          </el-button>
          <el-tooltip
            v-else
            :disabled="!isFileSource()"
            :content="$t('packages_business_connections_list_wenjianleixingde')"
            placement="top"
            class="load-schema__tooltip"
          >
            <span class="mr-3">
              <el-button
                :disabled="isFileSource()"
                type="primary"
                class="flex-fill min-w-0"
                @click="loadSchema"
                >{{ $t('public_connection_button_load_schema') }}
              </el-button>
            </span>
          </el-tooltip>
          <el-button
            class="flex-fill min-w-0"
            :disabled="
              connection.agentType === 'Cloud' ||
              getDisabled(connection, 'Edit')
            "
            @click="edit()"
          >
            {{ $t('public_button_edit') }}
          </el-button>
          <el-button
            class="flex-fill min-w-0"
            @click="$emit('test', connection)"
          >
            {{ $t('public_connection_button_test') }}
          </el-button>
        </div>
      </div>
      <div
        v-for="(item, index) in list"
        :key="`${index}`"
        class="container-item flex"
      >
        <div class="pt-2">
          <VIcon>{{ item.icon }}</VIcon>
        </div>
        <div class="flex-fill ml-4">
          <div
            v-for="(temp, k) in item.items"
            :key="`${index}${k}`"
            class="box-line"
          >
            <div class="box-line__label flex justify-content-between">
              <span>{{ temp.label }}:</span>
              <el-button
                v-if="temp.labelAction"
                text
                type="primary"
                @click="temp.labelAction"
                >{{ temp.labelActionTitle }}</el-button
              >
            </div>
            <pre
              v-if="temp.key === 'databaseLogInfo'"
              class="box-line__value"
              v-html="temp.value"
            />
            <div v-else-if="['permissions'].includes(temp.key)" class="pt-2">
              <ElTag
                v-for="per in permissions"
                :key="per.roleId"
                type="info"
                class="mr-2 mb-1"
                >{{ per.roleName }}</ElTag
              >
              <span v-if="!permissions.length">-</span>
            </div>
            <el-tooltip
              v-else-if="
                connection[temp.key] &&
                ![
                  'mqType',
                  'mqQueueSet',
                  'mqTopicSet',
                  'shareCdcEnable',
                  'redoLogParserEnable',
                ].includes(temp.key) &&
                connection[temp.key].toString()
              "
              effect="dark"
              :content="(temp.value || connection[temp.key]).toString()"
              placement="right-end"
            >
              <div
                class="box-line__value ellipsis"
                :class="[temp.class]"
                @click="handleClick(temp)"
              >
                {{ temp.value || connection[temp.key] || '-' }}
              </div>
            </el-tooltip>
            <div
              v-else-if="connection[temp.key] && temp.key === 'mqType'"
              class="box-line__value ellipsis"
            >
              <span>{{ mqType[connection[temp.key]] || '-' }}</span>
            </div>
            <div
              v-else-if="
                connection[temp.key] &&
                (temp.key === 'mqQueueSet' || temp.key === 'mqTopicSet')
              "
              class="box-line__value ellipsis"
            >
              <span>{{
                connection[temp.key].length > 0 ? connection[temp.key] : '-'
              }}</span>
            </div>
            <div
              v-else-if="
                connection[temp.key] &&
                (temp.key === 'shareCdcEnable' ||
                  temp.key === 'redoLogParserEnable')
              "
              class="box-line__value ellipsis"
            >
              <span>{{
                connection[temp.key]
                  ? $t('packages_business_text_open')
                  : $t('public_button_close')
              }}</span>
            </div>
            <div v-else class="box-line__value ellipsis">
              {{ connection[temp.key] || '-' }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <PermissionsDialog ref="permissionsDialogRef" />
  </Drawer>
</template>

<style lang="scss" scoped>
.details-container {
  overflow-y: auto;
}
.container-item {
  &.border-item {
    border-bottom: 1px solid var(--border-light);
  }
  &.button-line {
    margin-bottom: -1px;
  }
}
.el-button + .el-button {
  margin-left: 10px;
}
.box-line {
  padding: 8px 0;
  border-top: 1px solid var(--border-light);
}
.box-line__label {
  color: var(--text-light);
}
.box-line__value {
  max-width: 280px;
  margin-top: 8px;
  color: var(--text-dark);
}
.img-box {
  width: 24px;
  img {
    width: 100%;
    height: 100%;
  }
}
.load-schema__tooltip {
  margin-right: 10px;
}
</style>

<style lang="scss">
.details-container {
  .details-progress {
    .el-progress-bar {
      width: 97%;
    }
  }
}
</style>
