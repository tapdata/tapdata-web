<template>
  <Drawer v-model:visible="visible" :width="'400px'">
    <div v-loading="loading" class="details-container">
      <div class="container-item border-item flex pb-5">
        <div class="pt-2">
          <div class="img-box">
            <img :src="getConnectionIcon()" />
          </div>
        </div>
        <div class="ml-4 overflow-hidden">
          <div class="fs-6 mb-2 ellipsis">{{ connection.name }}</div>
          <div>
            <status-tag text target="connection" :status="connection.status"></status-tag>
          </div>
        </div>
      </div>
      <div v-if="!hideOperation" class="button-line container-item border-item pt-4 pb-5">
        <div class="flex">
          <el-tooltip
            :disabled="!isFileSource()"
            :content="$t('packages_business_connections_list_wenjianleixingde')"
            placement="top"
            class="load-schema__tooltip"
          >
            <span>
              <el-button :disabled="isFileSource()" type="primary" class="flex-fill min-w-0" @click="reload()"
                >{{ $t('public_connection_button_load_schema') }}
              </el-button>
            </span>
          </el-tooltip>
          <el-button
            class="flex-fill min-w-0"
            @click="edit()"
            :disabled="
              $disabledReadonlyUserBtn() || connection.agentType === 'Cloud' || getDisabled(connection, 'Edit')
            "
          >
            {{ $t('public_button_edit') }}
          </el-button>
          <el-button class="flex-fill min-w-0" @click="$emit('test', connection)">
            {{ $t('public_connection_button_test') }}
          </el-button>
        </div>
        <el-progress
          v-if="showProgress"
          class="details-progress mt-2"
          color="#2c65ff"
          :percentage="progress"
        ></el-progress>
      </div>
      <div v-for="(item, index) in list" :key="index + ''" class="container-item flex">
        <div class="pt-2">
          <VIcon>{{ item.icon }}</VIcon>
        </div>
        <div class="flex-fill ml-4">
          <div v-for="(temp, k) in item.items" :key="index + '' + k" class="box-line">
            <div class="box-line__label flex justify-content-between">
              <span>{{ temp.label }}:</span>
              <ElLink v-if="temp.labelAction" type="primary" @click="temp.labelAction">{{
                temp.labelActionTitle
              }}</ElLink>
            </div>
            <pre v-if="temp.key === 'databaseLogInfo'" class="box-line__value" v-html="temp.value"></pre>
            <div v-else-if="['permissions'].includes(temp.key)" class="pt-2">
              <ElTag v-for="per in permissions" :key="per.roleId" type="info" class="mr-2 mb-1">{{
                per.roleName
              }}</ElTag>
              <span v-if="!permissions.length">-</span>
            </div>
            <el-tooltip
              v-else-if="
                connection[temp.key] &&
                !['mqType', 'mqQueueSet', 'mqTopicSet', 'shareCdcEnable', 'redoLogParserEnable'].includes(temp.key) &&
                connection[temp.key].toString()
              "
              effect="dark"
              :content="(temp.value || connection[temp.key]).toString()"
              placement="right-end"
            >
              <div class="box-line__value ellipsis" :class="[temp.class]" @click="handleClick(temp)">
                {{ temp.value || connection[temp.key] || '-' }}
              </div>
            </el-tooltip>
            <!-- MQ文字转换 start -->
            <div v-else-if="connection[temp.key] && temp.key === 'mqType'" class="box-line__value ellipsis">
              <span>{{ mqType[connection[temp.key]] || '-' }}</span>
            </div>
            <div
              v-else-if="connection[temp.key] && (temp.key === 'mqQueueSet' || temp.key === 'mqTopicSet')"
              class="box-line__value ellipsis"
            >
              <span>{{ connection[temp.key].length > 0 ? connection[temp.key] : '-' }}</span>
            </div>
            <!-- 共享挖掘文字转换 /裸日志文字转换  start -->
            <div
              v-else-if="connection[temp.key] && (temp.key === 'shareCdcEnable' || temp.key === 'redoLogParserEnable')"
              class="box-line__value ellipsis"
            >
              <span>{{ connection[temp.key] ? $t('packages_business_text_open') : $t('public_button_close') }}</span>
            </div>
            <!-- MQ文字转换 end -->
            <div v-else class="box-line__value ellipsis">
              {{ connection[temp.key] || '-' }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <Test ref="test" :formData="formData" @receive="receiveTestData"></Test>
    <!--  权限管理  -->
    <PermissionsDialog ref="permissionsDialog" />
  </Drawer>
</template>

<script>
import { $on, $off, $once, $emit } from '../../../utils/gogocodeTransfer'
import i18n from '@tap/i18n'

import dayjs from 'dayjs'
import { cloneDeep } from 'lodash-es'
import { connectionsApi, dataPermissionApi, usersApi, proxyApi } from '@tap/api'
import { VIcon, Drawer } from '@tap/component'
import { getIcon } from '@tap/assets/icons'

import StatusTag from '../../components/StatusTag'
import Test from '../connections/Test.vue'
import PermissionsDialog from './PermissionsDialog'
import { getConnectionIcon } from './util'
import { openUrl } from '@tap/shared'

export default {
  name: 'DetailsDrawer',
  components: { VIcon, Drawer, StatusTag, Test, PermissionsDialog },
  inject: ['checkAgent'],
  props: {
    hideOperation: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      isDaas: import.meta.env.VUE_APP_PLATFORM === 'DAAS',
      drawer: false,
      visible: false,
      timer: null,
      databaseLogInfoTimer: null,
      direction: 'rtl',
      loading: false,
      showProgress: false,
      progress: 0,
      connection: {
        btnLoading: {
          deploy: false,
          stop: false,
          delete: false,
        },
      },
      kafkaACK: {
        0: this.$t('packages_business_connection_preview_no_sure'),
        '-1': this.$t('packages_business_connection_preview_master_partition'),
        1: this.$t('packages_business_connection_preview_master_partition'),
        all: this.$t('packages_business_connection_preview_isr_partition'),
      },
      list: [],
      mqType: {
        0: 'ActiveMQ',
        1: 'RabbitMQ',
        2: 'RocketMQ',
      },
      configModel: {
        default: [
          {
            icon: 'time',
            items: [
              {
                label: this.$t('public_connection_table_structure_update_time'),
                key: 'loadSchemaTime',
              },
            ],
          },
          {
            icon: 'database',
            items: [
              {
                label: this.$t('public_connection_form_database_address'),
                key: 'database_host',
              },
            ],
          },
          {
            icon: 'port',
            items: [
              {
                label: this.$t('public_connection_form_host'),
                key: 'database_port',
              },
            ],
          },
          {
            icon: 'name',
            items: [
              {
                label: this.$t('public_connection_form_database_name'),
                key: 'database_name',
              },
            ],
          },
          {
            icon: 'database-user-name',
            items: [
              {
                label: this.$t('public_connection_form_account'),
                key: 'database_username',
              },
            ],
          },
          {
            icon: 'connect_schema',
            items: [
              {
                label: this.$t('public_connection_form_schema'),
                key: 'database_owner',
              },
            ],
          },
          {
            icon: 'additional-string',
            items: [
              {
                label: this.$t('public_connection_form_other_connection_string'),
                key: 'addtionalString',
              },
            ],
          },
          {
            icon: 'origin-time',
            items: [
              {
                label: this.$t('public_connection_form_time_zone_of_time_type'),
                key: 'database_datetype_without_timezone',
              },
            ],
          },
          // {
          //   icon: 'connect_shared_mining',
          //   items: [
          //     {
          //       label: this.$t('packages_business_connection_form_shared_mining'),
          //       key: 'shareCdcEnable'
          //     }
          //   ]
          // },
          // {
          //   icon: 'connect_journal',
          //   items: [
          //     {
          //       label: this.$t('packages_business_connection_form_oracle_redoLog_parser'),
          //       key: 'redoLogParserEnable'
          //     }
          //   ]
          // }
        ],
      },
      formData: {},
      permissions: [],
    }
  },
  beforeUnmount() {
    this.clearTimer()
  },
  watch: {
    visible(val) {
      if (!val) {
        this.clearTimer() //清除定时器
      }
    },
  },
  methods: {
    clearTimer() {
      // 清除定时器
      clearTimeout(this.timer)
      clearTimeout(this.databaseLogInfoTimer)
      this.timer = null
      this.databaseLogInfoTimer = null
    },
    handleClose() {
      this.clearTimer()
      this.visible = false
      this.showProgress = false
      $emit(this, 'close')
    },
    getImgByType(type) {
      if (!type) {
        type = 'default'
      }
      return getIcon(type.toLowerCase())
    },
    transformData(row) {
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
      row.sourceFrom = this.getSourceFrom(row)
      row.loadSchemaTime = row.loadSchemaTime ? dayjs(row.loadSchemaTime).format('YYYY-MM-DD HH:mm:ss') : '-'
      if (row.config.uri && row.config.isUri !== false) {
        row.uri = row.config.uri
      }
      row.heartbeatTable = this.connection.heartbeatTable

      return row
    },
    async open(row) {
      this.visible = true
      this.showProgress = false
      this.formData = cloneDeep(row)
      this.connection = this.transformData(row)
      //组装数据
      this.connection['last_updated'] = dayjs(row.last_updated).format('YYYY-MM-DD HH:mm:ss')
      // await this.getDatabaseLogInfo(row)
      this.loadList(row)
      this.isDaas && this.loadPermissions(row.id)
    },
    edit() {
      const { connection = {} } = this
      const { id, pdkHash, definitionPdkId: pdkId, agentType, name } = connection

      if (agentType === 'Local') {
        this.$confirm(
          i18n.t('packages_business_connections_list_dangqianlianjie') +
            name +
            i18n.t('packages_business_connections_list_zhengzaizuoweiF'),
          '',
          {
            type: 'warning',
            showClose: false,
          },
        ).then((resFlag) => {
          if (!resFlag) {
            return
          }

          this.$router.push({
            name: 'connectionsEdit',
            params: {
              id: id,
            },
            query: {
              pdkHash,
              pdkId,
            },
          })
        })
      } else {
        this.$router.push({
          name: 'connectionsEdit',
          params: {
            id: id,
          },
          query: {
            pdkHash,
            pdkId,
          },
        })
      }
    },
    async beforeTest() {
      this.checkAgent(() => {
        //先将管理端状态改为testing
        connectionsApi
          .updateById(this.connection.id, {
            status: 'testing',
          })
          .then(() => {
            // let testData = JSON.parse(JSON.stringify(this.connection))
            this.$refs.test.start(true)
          })
      })
    },
    async reload(cb) {
      this.checkAgent(() => {
        this.showProgress = true
        this.progress = 0
        this.testSchema(cb)
        $emit(this, 'reload-schema')
      })
    },
    //请求测试
    testSchema(cb) {
      let parms = {
        loadCount: 0,
        loadFieldsStatus: 'loading',
      }
      this.loadFieldsStatus = 'loading'
      connectionsApi.updateById(this.connection.id, parms).then((data) => {
        cb?.()
        if (!this?.$refs?.test) {
          return
        }
        this.loadFieldsStatus = data.loadFieldsStatus //同步reload状态
        this.$refs.test.start(true, false, true)
        this.getProgress()
      })
    },
    getProgress() {
      clearTimeout(this.timer)
      connectionsApi
        .getNoSchema(this.connection.id)
        .then((data) => {
          this.formData = cloneDeep(data)
          this.connection = this.transformData(data)
          //组装数据
          this.connection['last_updated'] = dayjs(data.last_updated).format('YYYY-MM-DD HH:mm:ss')
          this.loadFieldsStatus = data.loadFieldsStatus //同步reload状态
          if (data.loadFieldsStatus === 'finished') {
            this.progress = 100
            setTimeout(() => {
              this.showProgress = false
              this.progress = 0 //加载完成
              this.$message.success(i18n.t('packages_business_connections_preview_schem'))
            }, 1000)
          } else {
            let progress = Math.round((data.loadCount / data.tableCount) * 10000) / 100
            this.progress = progress ? progress : 0
            this.timer = setTimeout(() => {
              this.visible && this.getProgress()
            }, 2000)
          }
        })
        .catch(() => {
          this.showProgress = false
          this.progress = 0 //加载完成
        })
    },
    receiveTestData(data) {
      if (!data.status || data.status === null) return
      this.status = data.status
    },
    async loadList(row = {}) {
      const heartbeatTable = await this.loadHeartbeatTable(row)

      this.connection.heartbeatTable = heartbeatTable?.[0]
      console.log('row', row.databaseLogInfo?.value)
      // 有uri
      if (row.uri) {
        this.list = [
          this.configModel['default']?.[0],
          ...(this.isDaas
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
          this.connection.heartbeatTable
            ? {
                icon: 'link',
                items: [
                  {
                    label: i18n.t('packages_business_connections_databaseform_kaiqixintiaobiao'),
                    key: 'heartbeatTable',
                    value: i18n.t('packages_business_connections_databaseform_chakanxintiaoren'),
                    class: 'cursor-pointer color-primary text-decoration-underline',
                    action: () => {
                      const routeUrl = this.$router.resolve({
                        name: 'HeartbeatMonitor',
                        params: {
                          id: this.connection.heartbeatTable,
                        },
                      })
                      openUrl(routeUrl.href)
                    },
                  },
                ],
              }
            : {},
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
            : {},
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
            : {},
        ]
      } else {
        this.list = [
          ...this.configModel['default'],
          ...(this.isDaas
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
          this.connection.heartbeatTable
            ? {
                icon: 'link',
                items: [
                  {
                    label: i18n.t('packages_business_connections_databaseform_kaiqixintiaobiao'),
                    key: 'heartbeatTable',
                    value: i18n.t('packages_business_connections_databaseform_chakanxintiaoren'),
                    class: 'cursor-pointer color-primary text-decoration-underline',
                    action: () => {
                      const routeUrl = this.$router.resolve({
                        name: 'HeartbeatMonitor',
                        params: {
                          id: this.connection.heartbeatTable,
                        },
                      })
                      openUrl(routeUrl.href)
                    },
                  },
                ],
              }
            : {},
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
            : {},
        ]
      }

      // 权限管理
      this.isDaas &&
        this.list.unshift({
          icon: 'link',
          items: [
            {
              label: i18n.t('packages_business_connections_preview_shujulianjiequan'),
              key: 'permissions',
              labelActionTitle: i18n.t('packages_business_connections_preview_quanxianguanli'),
              labelAction: () => {
                this.$refs.permissionsDialog.open(this.connection)
              },
            },
          ],
        })

      // DatabaseLogInfo
      this.getDatabaseLogInfo(row)
    },
    getConnectionIcon() {
      const { connection } = this
      if (!connection) {
        return
      }
      return getConnectionIcon(connection?.pdkHash)
    },

    sync(list) {
      if (!this.visible) return
      const result = list.find((item) => item.id === this.connection.id)
      if (!result) return
      this.formData = cloneDeep(result)
      this.connection = this.transformData(result)
    },

    getSourceFrom(row = {}) {
      const { definitionScope, beta = false } = row
      const MAP = {
        publicfalse: i18n.t('packages_business_components_connectiontypeselectorsort_renzhengshujuyuan'),
        publictrue: i18n.t('packages_business_components_connectiontypeselectorsort_betashu'),
        customer: i18n.t('packages_business_components_connectiontypeselectorsort_wodeshujuyuan'),
      }
      return MAP[definitionScope + beta] || MAP['customer']
    },

    setConnectionData(row) {
      this.formData = cloneDeep(row)
      this.connection = this.transformData(row)
    },

    isFileSource() {
      return ['CSV', 'EXCEL', 'JSON', 'XML'].includes(this.connection?.database_type)
    },

    async loadHeartbeatTable(row = {}) {
      if (!row.heartbeatEnable) return []
      return await connectionsApi.heartbeatTask(row.id)
    },

    handleClick(temp = {}) {
      temp.action?.()
    },

    loadPermissions(id) {
      const filter = {
        dataType: 'Connections',
        dataId: id,
      }
      dataPermissionApi.permissions(filter).then((data = []) => {
        usersApi
          .role({
            filter: JSON.stringify({
              limit: 1000,
            }),
          })
          .then((roleList = []) => {
            this.permissions = data
              .map((t) => {
                const role = roleList.items?.find((r) => r.id === t.typeId) || {}
                return {
                  checked: t.actions,
                  roleId: t.typeId,
                  roleName: role.name,
                }
              })
              .filter((t) => !!t.roleName)
          })
      })
    },

    getDisabled(row = {}, type) {
      if (!this.isDaas) return false
      const data = row.permissionActions || []
      return !data.includes(type)
    },

    async getDatabaseLogInfo(row = {}) {
      const { id } = row
      const params = {
        className: 'PDKConnectionService',
        method: 'databaseLogInfoService',
        args: [id],
      }
      try {
        const data = await proxyApi.call(params)
        row.databaseLogInfo = data || {}
        // list 添加findDatabaseLogInfo
        let findDatabaseLogInfo = this.list.find((t) => t.items?.[0]?.key === 'databaseLogInfo')
        if (findDatabaseLogInfo) {
          findDatabaseLogInfo.items[0].label = row.databaseLogInfo.key
          findDatabaseLogInfo.items[0].value = row.databaseLogInfo.value
        } else {
          row.databaseLogInfo.value &&
            this.list.push({
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
        this.databaseLogInfoTimer = setTimeout(() => {
          this.getDatabaseLogInfo(row)
        }, 60000)
      } catch (e) {
        console.log(e)
      }
    },
  },
  emits: ['test', 'close', 'reload-schema'],
}
</script>

<style lang="scss" scoped>
.details-container {
  padding: 16px 12px 16px 20px;
  overflow-y: auto;
}
.container-item {
  &.border-item {
    border-bottom: 1px solid map.get($borderColor, light);
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
  border-top: 1px solid map.get($borderColor, light);
}
.box-line__label {
  color: map.get($fontColor, light);
}
.box-line__value {
  max-width: 280px;
  margin-top: 8px;
  color: map.get($fontColor, dark);
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
