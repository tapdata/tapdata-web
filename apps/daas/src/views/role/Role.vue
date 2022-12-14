<template>
  <div class="role" v-loading="loading">
    <div class="section-wrap-box">
      <head class="head">
        <i class="iconfont icon-left-circle back-btn-icon link-primary cursor-pointer" @click="back"></i>
        <h1 class="pl-2">{{ $t('role_settingTitle') }}</h1>
        <span>{{ $t('role_currentRole') }}: {{ roleName }}</span>
      </head>

      <div class="role-tableBox">
        <div class="headTitle">
          <h4>{{ $t('role_pageVisible') }}</h4>
          <p>{{ $t('role_pageShowTip') }}</p>
        </div>
        <ul class="role-table page-table">
          <li class="role-head">
            <el-row class="e-row">
              <el-col class="e-col borderRight" :span="21">
                {{ $t('role_choosePage') }}
              </el-col>
              <el-col class="e-col" :span="3">{{ $t('role_bulkOperate') }} </el-col>
            </el-row>
          </li>
          <li v-for="item in dataList" :key="item.id">
            <el-row class="e-row">
              <el-col class="e-col borderRight" :span="21">
                <template v-for="second in item.children">
                  <el-checkbox
                    :key="second.name"
                    v-model="second.checkAll"
                    v-if="second.id"
                    @change="handleCheckChange($event, item)"
                    v-cloak
                  >
                    <span>
                      {{ second.description }}
                    </span>
                  </el-checkbox>
                </template>
              </el-col>
              <el-col class="e-col" :span="3">
                <el-checkbox v-model="item.checked" @change="handleAllCheck($event, item)" v-cloak>
                  <span>
                    {{ $t('role_all_check') }}
                  </span>
                </el-checkbox>
              </el-col>
            </el-row>
          </li>
        </ul>
        <!--        <div class="headTitle">-->
        <!--          <h4>{{ $t('role_funcPermission') }}</h4>-->
        <!--          <p>{{ $t('role_choosePermissionTip') }}</p>-->
        <!--        </div>-->
        <!--        <ul class="role-table">-->
        <!--          <li class="role-head">-->
        <!--            <el-row class="e-row">-->
        <!--              <el-col class="e-col" :span="3">-->
        <!--                {{ $t('role_module') }}-->
        <!--              </el-col>-->
        <!--              <el-col class="e-col borderLeft" :span="18">-->
        <!--                {{ $t('role_functionDataPermission') }}-->
        <!--              </el-col>-->
        <!--              <el-col class="e-col borderLeft" :span="3">{{ $t('role_bulkOperate') }} </el-col>-->
        <!--            </el-row>-->
        <!--          </li>-->
        <!--          <li class="module-style">-->
        <!--            <el-row class="e-row" v-for="item in moduleList" :key="item.id">-->
        <!--              <el-col :span="3" style="line-height: 40px">-->
        <!--                <span class="nav">{{ $t('role_module_meun_' + item.name) }}</span>-->
        <!--              </el-col>-->
        <!--              <el-col :span="21" class="e-col borderLine">-->
        <!--                &lt;!&ndash; 权限 &ndash;&gt;-->
        <!--                <el-row class="box">-->
        <!--                  <el-col class="e-col" :span="20" v-if="item.children">-->
        <!--                    <el-checkbox-->
        <!--                      v-for="second in item.children"-->
        <!--                      :key="second.name"-->
        <!--                      v-model="second.checked"-->
        <!--                      v-show="second.id"-->
        <!--                      :disabled="second.type === 'read'"-->
        <!--                      @change="handleOneCheckAll($event, item, item.children, second, 'children')"-->
        <!--                      :class="[{ 'checkbox-position': !second.allName }, 'checkbox-radio']"-->
        <!--                      v-cloak-->
        <!--                    >-->
        <!--                      <div>{{ $t('role_name_' + second.name) }}</div>-->
        <!--                      <el-checkbox-->
        <!--                        class="e-checkbox"-->
        <!--                        v-show="second.allName"-->
        <!--                        :disabled="!second.checked || second.allName === 'data_catalog_all_data'"-->
        <!--                        v-model="second.checkAllData"-->
        <!--                        @change="handleOneAllData($event, item, item.children, second, 'children')"-->
        <!--                        v-cloak-->
        <!--                      >-->
        <!--                        <div>{{ $t('role_allData') }}</div>-->
        <!--                      </el-checkbox>-->
        <!--                    </el-checkbox>-->
        <!--                  </el-col>-->
        <!--                  <el-col :span="4" v-if="item.children" style="padding-top: 8px">-->
        <!--                    <el-checkbox-->
        <!--                      v-model="item.checkAll"-->
        <!--                      @change="handleAuthoritySelectAll($event, item, item.children)"-->
        <!--                      v-cloak-->
        <!--                    >-->
        <!--                      <div>{{ $t('role_chooseAllFunction') }}</div>-->
        <!--                    </el-checkbox>-->
        <!--                    <el-checkbox-->
        <!--                      class="e-checkbox"-->
        <!--                      v-model="item.checkedAllData"-->
        <!--                      @change="handleCheckedAllData($event, item, item.children)"-->
        <!--                      v-cloak-->
        <!--                    >-->
        <!--                      <div>{{ $t('role_chooseAllRole') }}</div>-->
        <!--                    </el-checkbox>-->
        <!--                  </el-col>-->
        <!--                </el-row>-->
        <!--                <div class="line" v-if="item.children && item.classification"></div>-->
        <!--                &lt;!&ndash; 分类权限 &ndash;&gt;-->
        <!--                <el-row class="box heightStyle" v-if="item.classification">-->
        <!--                  <el-col class="e-col" :span="20">-->
        <!--                    <el-checkbox-->
        <!--                      v-for="second in item.classification"-->
        <!--                      :key="second.name"-->
        <!--                      v-model="second.checked"-->
        <!--                      v-show="second.id"-->
        <!--                      :disabled="second.type === 'read'"-->
        <!--                      @change="handleOneCheckAll($event, item, item.classification, second, 'classify')"-->
        <!--                      :class="[{ 'checkbox-position': !second.allName }, 'checkbox-radio']"-->
        <!--                      v-cloak-->
        <!--                    >-->
        <!--                      <div>{{ $t('role_name_' + second.name) }}</div>-->
        <!--                      &lt;!&ndash; <el-checkbox-->
        <!--											class="e-checkbox"-->
        <!--											v-show="second.allName"-->
        <!--											:disabled="!item.checked"-->
        <!--											v-model="second.checkAllData"-->
        <!--											@change="handleChange($event, item, second)"-->
        <!--											v-cloak-->
        <!--										>-->
        <!--											<div>All data</div>-->
        <!--										</el-checkbox> &ndash;&gt;-->
        <!--                    </el-checkbox>-->
        <!--                  </el-col>-->
        <!--                  <el-col class="e-col allSelectBox" :span="4">-->
        <!--                    <el-checkbox-->
        <!--                      class="checkbox-radio checkbox-position"-->
        <!--                      v-model="item.classifiyCheckAll"-->
        <!--                      @change="handleAuthoritySelectAll($event, item, item.classification)"-->
        <!--                      v-cloak-->
        <!--                    >-->
        <!--                      <div>{{ $t('role_chooseAllFunction') }}</div>-->
        <!--                    </el-checkbox>-->
        <!--                  </el-col>-->
        <!--                </el-row>-->
        <!--                <div class="line" v-if="item.classification && item.functional"></div>-->
        <!--                &lt;!&ndash; 导入导出 &ndash;&gt;-->
        <!--                <el-row class="box heightStyle" v-if="item.functional">-->
        <!--                  <el-col class="e-col" :span="20">-->
        <!--                    <el-checkbox-->
        <!--                      v-for="second in item.functional"-->
        <!--                      :key="second.name"-->
        <!--                      v-show="second.id"-->
        <!--                      :disabled="second.type === 'read'"-->
        <!--                      v-model="second.checked"-->
        <!--                      @change="handleOneCheckAll($event, item, item.functional, second, 'functional')"-->
        <!--                      :class="[{ 'checkbox-position': !second.allName }, 'checkbox-radio']"-->
        <!--                      v-cloak-->
        <!--                    >-->
        <!--                      <div>{{ $t('role_name_' + second.name) }}</div>-->
        <!--                    </el-checkbox>-->
        <!--                  </el-col>-->
        <!--                  <el-col class="e-col" :span="4">-->
        <!--                    <el-checkbox-->
        <!--                      class="checkbox-radio checkbox-position"-->
        <!--                      v-model="item.functionCheckAll"-->
        <!--                      @change="handleAuthoritySelectAll($event, item, item.functional)"-->
        <!--                      v-cloak-->
        <!--                    >-->
        <!--                      <div>{{ $t('role_chooseAllFunction') }}</div>-->
        <!--                    </el-checkbox>-->
        <!--                  </el-col>-->
        <!--                </el-row>-->
        <!--              </el-col>-->
        <!--            </el-row>-->
        <!--          </li>-->
        <!--        </ul>-->
      </div>
      <div class="btn">
        <el-button size="mini" @click="back">{{ $t('button_back') }} </el-button>
        <el-button size="mini" type="primary" :loading="saveloading" @click="saveSubmit('ruleForm')"
          >{{ $t('app_save') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { roleMappingsApi, permissionsApi, usersApi } from '@tap/api'

let pageSort = [
  // { children: [{ name: 'Dashboard_menu' }] },
  { children: [{ name: 'v2_datasource_menu' }] },
  {
    name: 'data_transmission',
    children: [
      { name: 'v2_data_replication' },
      { name: 'v2_data_flow' },
      { name: 'v2_log_collector_menu' },
      { name: 'v2_function_management_list' },
      { name: 'v2_custom_node_menu' },
      { name: 'v2_shared_cache_menu' }
    ]
  },
  {
    name: 'data_government',
    children: [
      { name: 'v2_data_object' },
      { name: 'v2_data_catalogue' }
      // { name: 'data_quality_menu' },
      // { name: 'time_to_live_menu' },
      // { name: 'data_lineage_menu' },
      // { name: 'data_rules_menu' },
      // { name: 'Topology_menu' },
      // { name: 'dictionary_menu' }
    ]
  },
  {
    name: 'data_publish',
    children: [
      { name: 'v2_data-server-list' },
      { name: 'v2_api-client' },
      { name: 'v2_api-servers' },
      { name: 'v2_data_server_audit-list' },
      { name: 'v2_api_monitor' }
    ]
  },
  // { children: [{ name: 'data_collect_menu' }] },
  {
    name: 'system_management',
    children: [
      // { name: 'schedule_jobs_menu' },
      { name: 'v2_cluster-management_menu' },
      // { name: 'agents_menu' },
      // { name: 'servers_oversee_menu' },
      { name: 'v2_user_management_menu' },
      { name: 'v2_role_management_menu' }
      // { name: 'system_settings_menu' }
    ]
  }
]

let moduleMapping = [
  // { name: 'Dashboard', functional: [{ name: 'Dashboard' }] },
  {
    name: 'datasource',
    children: [
      { name: 'datasource', allName: 'datasource_all_data' },
      { name: 'datasource_creation' },
      { name: 'datasource_edition', allName: 'datasource_edition_all_data' },
      { name: 'datasource_delete', allName: 'datasource_delete_all_data' }
    ],
    classification: [{ name: 'datasource_category_management' }, { name: 'datasource_category_application' }]
  },
  {
    name: 'Data_SYNC',
    children: [
      { name: 'Data_SYNC', allName: 'Data_SYNC_all_data' },
      { name: 'SYNC_job_creation' },
      { name: 'SYNC_job_edition', allName: 'SYNC_job_edition_all_data' },
      { name: 'SYNC_job_delete', allName: 'SYNC_job_delete_all_data' },
      { name: 'SYNC_job_operation', allName: 'SYNC_job_operation_all_data' }
    ],
    classification: [{ name: 'SYNC_category_management' }, { name: 'SYNC_category_application' }],
    functional: [{ name: 'SYNC_job_import' }, { name: 'SYNC_job_export' }]
  },

  {
    name: 'Data_verify',
    children: [
      { name: 'Data_verify', allName: 'Data_verify_all_data' },
      { name: 'verify_job_creation' },
      { name: 'verify_job_edition', allName: 'verify_job_edition_all_data' },
      { name: 'verify_job_delete', allName: 'verify_job_delete_all_data' }
      // { name: 'verify_job_execution', allName: 'verify_job_execution_all_data' }
    ]
  },
  {
    name: 'SYNC_Function_management',
    functional: [{ name: 'SYNC_Function_management' }]
  },
  {
    name: 'log_collector',
    functional: [{ name: 'log_collector' }]
  },
  {
    name: 'custom_node',
    functional: [{ name: 'custom_node' }]
  },
  {
    name: 'shared_cache',
    functional: [{ name: 'shared_cache' }]
  },
  {
    name: 'data_government',
    classification: [{ name: 'data_catalog_category_application' }, { name: 'data_catalog_category_management' }]
  },
  {
    name: 'data_catalog',
    children: [
      { name: 'data_catalog', allName: 'data_catalog_all_data' },
      { name: 'new_model_creation' },
      {
        name: 'data_catalog_edition',
        allName: 'data_catalog_edition_all_data'
      },
      { name: 'meta_data_deleting', allName: 'meta_data_deleting_all_data' }
    ]
  },
  // {
  //   name: 'data_quality',
  //   children: [
  //     { name: 'data_quality', allName: 'data_quality_all_data' },
  //     { name: 'data_quality_edition', allName: 'data_quality_edition_all_data' }
  //   ]
  // },
  // {
  //   name: 'dictionary',
  //   children: [{ name: 'dictionary', allName: 'dictionary_all_data' }]
  // },
  // {
  //   name: 'data_rules',
  //   children: [
  //     { name: 'data_rules', allName: 'data_rules_all_data' },
  //     { name: 'data_rule_management', allName: 'data_rule_management_all_data' }
  //   ]
  // },
  // {
  //   name: 'time_to_live',
  //   children: [
  //     { name: 'time_to_live', allName: 'time_to_live_all_data' },
  //     {
  //       name: 'time_to_live_management',
  //       allName: 'time_to_live_management_all_data'
  //     }
  //   ]
  // },
  // {
  //   name: 'data_lineage',
  //   functional: [{ name: 'data_lineage' }]
  // },

  {
    name: 'API_management',
    children: [
      { name: 'API_management', allName: 'API_management_all_data' },
      { name: 'API_creation' },
      { name: 'API_edition', allName: 'API_edition_all_data' },
      { name: 'API_delete', allName: 'API_delete_all_data' },
      { name: 'API_publish', allName: 'API_publish_all_data' }
    ],
    classification: [{ name: 'API_category_application' }, { name: 'API_category_management' }],
    functional: [{ name: 'API_import' }, { name: 'API_export' }]
  },
  {
    name: 'API_data_explorer',
    functional: [
      { name: 'API_data_explorer' },
      { name: 'API_data_creation' },
      { name: 'API_data_explorer_deleting' },
      { name: 'API_data_explorer_export' },
      { name: 'API_data_download' }
    ],
    classification: [{ name: 'API_data_explorer_tagging' }, { name: 'API_data_time_zone_editing' }]
  },
  {
    name: 'API_doc_test',
    functional: [{ name: 'API_doc_test' }]
  },
  {
    name: 'API_stats',
    functional: [{ name: 'API_stats' }]
  },
  {
    name: 'API_clients',
    functional: [{ name: 'API_clients' }, { name: 'API_clients_amangement' }]
  },
  {
    name: 'API_server',
    functional: [{ name: 'API_server' }, { name: 'API_server_management' }]
  },
  {
    name: 'Cluster_management',
    children: [
      { name: 'Cluster_management', allName: 'Cluster_management_all_data' },
      { name: 'Cluster_operation' },
      { name: 'status_log' }
    ]
  },
  {
    name: 'user_management',
    children: [
      { name: 'user_management', allName: 'user_management_all_data' },
      { name: 'user_creation' },
      { name: 'user_edition', allName: 'user_edition_all_data' },
      { name: 'user_delete', allName: 'user_delete_all_data' }
    ],
    classification: [{ name: 'user_category_management' }, { name: 'user_category_application' }]
  },
  {
    name: 'role_management',
    children: [
      { name: 'role_management', allName: 'role_management_all_data' },
      { name: 'role_creation' },
      { name: 'role_edition', allName: 'role_edition_all_data' },
      { name: 'role_delete', allName: 'role_delete_all_data' }
    ]
  },
  {
    name: 'system_settings',
    functional: [{ name: 'system_settings' }, { name: 'system_settings_modification' }, { name: 'notice_settings' }]
  }
]
export default {
  data() {
    return {
      loading: false,
      saveloading: false,
      permissLoading: false,
      form: {
        name: '',
        description: '',
        register_user_default: false
      },
      dataList: [],
      rolemappings: [],
      roleusers: [],
      selectRole: [],
      permissionList: [],
      roleName: '',
      radio: 1,
      moduleList: []
    }
  },

  created() {
    this.roleName = this.$route.query.name ? this.$route.query.name : ''
    this.getPermission()
  },

  methods: {
    // 获取用户权限数据
    getMappingData(mappingData, pageData) {
      this.loading = true
      let filter = {
        where: {
          roleId: this.$route.query.id
        }
      }
      roleMappingsApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(data => {
          if (data?.length) {
            data.forEach(item => {
              if (item.principalType === 'USER') {
                this.roleusers.push(item.principalId)
              }
              if (item.principalType === 'PERMISSION') {
                let selected = this.permissionList.filter(v => v.name === item.principalId)
                if (selected && selected.length > 0) {
                  selected[0].self_only = item.self_only
                  this.selectRole.push(selected[0].name)
                }
              }
            })
            this.rolemappings = data?.items
            if (pageData.length) {
              pageData.forEach(item => {
                if (this.selectRole && this.selectRole.length) {
                  if (item.children && item.children.length) {
                    let checkedCount = [],
                      pageLength = []
                    item.children.filter(childItem => {
                      this.$set(childItem, 'checkAll', this.selectRole.includes(childItem.name))
                      if (childItem.checkAll) {
                        checkedCount.push(childItem)
                      }
                      if (childItem.id) {
                        pageLength.push(childItem)
                      }
                    })
                    this.$set(item, 'checked', checkedCount.length === pageLength.length)
                  }
                }
              })
            }
            if (mappingData.length) {
              mappingData.filter(item => {
                if (this.selectRole && this.selectRole.length) {
                  if (item.children && item.children.length) {
                    let checkedCount = [],
                      allCheckedCount = []
                    item.children.filter(childItem => {
                      this.$set(childItem, 'checkAllData', this.selectRole.includes(childItem.allName))

                      this.$set(childItem, 'checked', this.selectRole.includes(childItem.name))
                      if (childItem.checked) {
                        checkedCount.push(childItem)
                      }
                      if (childItem.checkAllData) {
                        allCheckedCount.push(childItem)
                      }
                    })
                    let allData = item.children.filter(el => {
                      return el.allName
                    })

                    this.$set(item, 'checkAll', checkedCount.length === item.children.length)
                    this.$set(item, 'checkedAllData', allCheckedCount.length === allData.length)
                  }
                  if (item.classification && item.classification.length) {
                    let checkedCount = []
                    item.classification.filter(classify => {
                      this.$set(classify, 'checked', this.selectRole.includes(classify.name))
                      if (classify.checked) {
                        checkedCount.push(classify)
                      }
                    })
                    this.$set(item, 'classifiyCheckAll', checkedCount.length === item.classification.length)
                  }
                  if (item.functional && item.functional.length) {
                    let checkedCount = []
                    item.functional.filter(fun => {
                      this.$set(fun, 'checked', this.selectRole.includes(fun.name))
                      if (fun.checked) {
                        checkedCount.push(fun)
                      }
                    })
                    this.$set(item, 'functionCheckAll', checkedCount.length === item.functional.length)
                  }
                }
              })
            }
          }
          if (data?.length === 0) {
            if (mappingData.length)
              mappingData.filter(item => {
                if (item.children && item.children.length) {
                  item.children.filter(childItem => {
                    this.$set(childItem, 'checked', childItem.type === 'read')
                  })
                }
              })
          }
        })
        .finally(() => {
          this.loading = false
        })
    },

    // 获取权限信息
    getPermission() {
      let self = this
      this.permissLoading = true
      permissionsApi
        .get({})
        .then(data => {
          if (data && data.length) {
            self.permissionList = [
              {
                id: '6399bc064211520d34e963ae',
                description: '控制台',
                name: 'v2_dashboard',
                needPermission: true,
                order: 1,
                parentId: '',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_dashboard',
                    path: '/dashboard'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963af',
                description: '连接管理',
                name: 'v2_datasource_menu',
                needPermission: true,
                order: 2,
                parentId: '',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_datasource_menu',
                    path: '/connections'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963b0',
                description: '连接创建',
                name: 'v2_datasource_creation',
                needPermission: true,
                order: 1,
                parentId: 'v2_datasource_menu',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_datasource_creation',
                    path: '/connections/create'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963b1',
                description: '连接编辑',
                name: 'v2_datasource_edition',
                needPermission: true,
                order: 2,
                parentId: 'v2_datasource_menu',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_datasource_edition',
                    path: '/connections/:id/edit'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963b2',
                description: '数据管道',
                name: 'v2_data_pipeline',
                needPermission: true,
                order: 3,
                parentId: '',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_data_pipeline',
                    path: ''
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963b3',
                description: '数据复制',
                name: 'v2_data_replication',
                needPermission: true,
                order: 1,
                parentId: 'v2_data_pipeline',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_data_replication',
                    path: '/migrate'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963b4',
                description: '数据复制-监控',
                name: 'v2_data_replication_monitor',
                needPermission: true,
                order: 1,
                parentId: 'v2_data_replication',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_data_replication_monitor',
                    path: '/migrate/monitor/:id'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963b5',
                description: '数据复制-编辑 dag',
                name: 'v2_data_replication_dag_edit',
                needPermission: true,
                order: 2,
                parentId: 'v2_data_replication',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_data_replication_dag_edit',
                    path: '/migrate/editor'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963b6',
                description: '数据复制-编辑',
                name: 'v2_data_replication_edit',
                needPermission: true,
                order: 3,
                parentId: 'v2_data_replication',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_data_replication_edit',
                    path: '/migrate/editor/:id'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963b7',
                description: '数据复制-详情',
                name: 'v2_data_replication_details',
                needPermission: true,
                order: 4,
                parentId: 'v2_data_replication',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_data_replication_details',
                    path: '/migrate/viewer/:id'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963b8',
                description: '数据复制-运行监控',
                name: 'v2_data_replication_record_monitor',
                needPermission: true,
                order: 5,
                parentId: 'v2_data_replication',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_data_replication_record_monitor',
                    path: '/migrate/monitor-record/:id'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963b9',
                description: '数据开发',
                name: 'v2_data_flow',
                needPermission: true,
                order: 2,
                parentId: 'v2_data_pipeline',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_data_flow',
                    path: '/dataflow'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963ba',
                description: '数据开发-监控',
                name: 'v2_data_flow_monitor',
                needPermission: true,
                order: 1,
                parentId: 'v2_data_flow',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_data_flow_monitor',
                    path: '/dataflow/monitor/:id'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963bb',
                description: '数据开发-编辑 dag',
                name: 'v2_data_flow_dag_edit',
                needPermission: true,
                order: 2,
                parentId: 'v2_data_flow',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_data_flow_dag_edit',
                    path: '/dataflow/editor'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963bc',
                description: '数据开发-编辑',
                name: 'v2_data_flow_edit',
                needPermission: true,
                order: 3,
                parentId: 'v2_data_flow',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_data_flow_edit',
                    path: '/dataflow/editor/:id'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963bd',
                description: '数据开发-详情',
                name: 'v2_data_flow_details',
                needPermission: true,
                order: 4,
                parentId: 'v2_data_flow',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_data_flow_details',
                    path: '/dataflow/viewer/:id'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963be',
                description: '共享挖掘',
                name: 'v2_log_collector',
                needPermission: true,
                order: 3,
                parentId: 'v2_data_pipeline',
                resources: [
                  {
                    type: 'button',
                    code: 'v2_log_collector',
                    path: ''
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963bf',
                description: '共享挖掘-列表',
                name: 'v2_log_collector_menu',
                needPermission: true,
                order: 1,
                parentId: 'v2_log_collector',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_log_collector_menu',
                    path: '/sharedMining'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963c0',
                description: '共享挖掘-详情',
                name: 'v2_log_collector_detail',
                needPermission: true,
                order: 2,
                parentId: 'v2_log_collector',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_log_collector_detail',
                    path: '/sharedMining/details/:id'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963c1',
                description: '函数管理',
                name: 'v2_function_management',
                needPermission: true,
                order: 4,
                parentId: 'v2_data_pipeline',
                resources: [
                  {
                    type: 'button',
                    code: 'v2_function_management',
                    path: ''
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963c2',
                description: '函数管理-列表',
                name: 'v2_function_management_list',
                needPermission: true,
                order: 1,
                parentId: 'v2_function_management',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_function_management_list',
                    path: '/function'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963c3',
                description: '函数管理-创建',
                name: 'v2_function_management_create',
                needPermission: true,
                order: 2,
                parentId: 'v2_function_management',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_function_management_create',
                    path: '/function/create'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963c4',
                description: '函数管理-导入',
                name: 'v2_function_management_import',
                needPermission: true,
                order: 3,
                parentId: 'v2_function_management',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_function_management_import',
                    path: '/function/import'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963c5',
                description: '函数管理-编辑',
                name: 'v2_function_management_edit',
                needPermission: true,
                order: 4,
                parentId: 'v2_function_management',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_function_management_edit',
                    path: '/function/edit/:id'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963c6',
                description: '函数管理-详情',
                name: 'v2_function_management_details',
                needPermission: true,
                order: 5,
                parentId: 'v2_function_management',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_function_management_details',
                    path: '/function/details/:id'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963c7',
                description: '自定义节点',
                name: 'v2_custom_node',
                needPermission: true,
                order: 5,
                parentId: 'v2_data_pipeline',
                resources: [
                  {
                    type: 'button',
                    code: 'v2_custom_node',
                    path: ''
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963c8',
                description: '自定义节点-列表',
                name: 'v2_custom_node_menu',
                needPermission: true,
                order: 1,
                parentId: 'v2_custom_node',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_custom_node_menu',
                    path: '/custom-node'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963c9',
                description: '共享缓存',
                name: 'v2_shared_cache',
                needPermission: true,
                order: 6,
                parentId: 'v2_data_pipeline',
                resources: [
                  {
                    type: 'button',
                    code: 'v2_shared_cache',
                    path: ''
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963ca',
                description: '共享缓存-列表',
                name: 'v2_shared_cache_menu',
                needPermission: true,
                order: 1,
                parentId: 'v2_shared_cache',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_shared_cache_menu',
                    path: '/shared-cache'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963cb',
                description: '共享缓存-创建',
                name: 'v2_shared_cache_create',
                needPermission: true,
                order: 2,
                parentId: 'v2_shared_cache',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_shared_cache_create',
                    path: '/shared-cache/create'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963cc',
                description: '共享缓存-编辑',
                name: 'v2_shared_cache_edit',
                needPermission: true,
                order: 3,
                parentId: 'v2_shared_cache',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_shared_cache_edit',
                    path: '/shared-cache/:id/edit'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963cd',
                description: '数据发现',
                name: 'v2_data_discovery',
                needPermission: true,
                order: 4,
                parentId: '',
                resources: [
                  {
                    type: 'button',
                    code: 'v2_data_discovery',
                    path: ''
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963ce',
                description: '数据对象',
                name: 'v2_data_object',
                needPermission: true,
                order: 1,
                parentId: '',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_data_object',
                    path: '/object'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963cf',
                description: '数据目录',
                name: 'v2_data_catalogue',
                needPermission: true,
                order: 2,
                parentId: '',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_data_catalogue',
                    path: '/catalogue'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963d0',
                description: '数据服务',
                name: 'v2_data-server',
                needPermission: true,
                order: 5,
                parentId: '',
                resources: [
                  {
                    type: 'button',
                    code: 'v2_data-server',
                    path: ''
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963d1',
                description: '服务管理',
                name: 'v2_data-server-list',
                needPermission: true,
                order: 1,
                parentId: 'v2_data-server',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_data-server-list',
                    path: '/data-server'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963d2',
                description: 'api客户端',
                name: 'v2_api-client',
                needPermission: true,
                order: 2,
                parentId: 'v2_data-server',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_api-client',
                    path: '/data-server'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963d3',
                description: 'api服务端',
                name: 'v2_api-servers',
                needPermission: true,
                order: 3,
                parentId: 'v2_data-server',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_api-client',
                    path: '/api-servers'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963d4',
                description: '服务审计',
                name: 'v2_data_server_audit',
                needPermission: true,
                order: 4,
                parentId: 'v2_data-server',
                resources: [
                  {
                    type: 'button',
                    code: 'v2_data_server_audit',
                    path: ''
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963d5',
                description: '服务审计-列表',
                name: 'v2_data_server_audit-list',
                needPermission: true,
                order: 1,
                parentId: 'v2_data_server_audit',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_data_server_audit-list',
                    path: '/data-server-audit'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963d6',
                description: '服务审计-详情',
                name: 'v2_data_server_audit-details',
                needPermission: true,
                order: 2,
                parentId: 'v2_data_server_audit',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_data_server_audit-details',
                    path: '/data-server-audit/:id/details'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963d7',
                description: '服务监控',
                name: 'v2_api_monitor',
                needPermission: true,
                order: 5,
                parentId: 'v2_data-server',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_api_monitor',
                    path: '/api-monitor'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963d8',
                description: '系统管理',
                name: 'v2_system-management',
                needPermission: true,
                order: 6,
                parentId: '',
                resources: [
                  {
                    type: 'button',
                    code: 'v2_system-management',
                    path: ''
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963d9',
                description: '集群管理',
                name: 'v2_cluster-management_menu',
                needPermission: true,
                order: 1,
                parentId: 'v2_system-management',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_cluster-management_menu',
                    path: '/cluster'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963da',
                description: '用户管理',
                name: 'v2_user_management_menu',
                needPermission: true,
                order: 2,
                parentId: 'v2_system-management',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_user_management_menu',
                    path: '/user'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963db',
                description: '角色管理',
                name: 'v2_role_management',
                needPermission: true,
                order: 3,
                parentId: 'v2_system-management',
                resources: [
                  {
                    type: 'button',
                    code: 'v2_role_management',
                    path: ''
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963dc',
                description: '角色管理-列表',
                name: 'v2_role_management_menu',
                needPermission: true,
                order: 1,
                parentId: 'v2_role_management',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_role_management_menu',
                    path: '/role'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963dd',
                description: '角色管理-创建',
                name: 'v2_role_creation',
                needPermission: true,
                order: 2,
                parentId: 'v2_role_management',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_role_creation',
                    path: '/role/create'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963de',
                description: '角色管理-编辑',
                name: 'v2_role_edition',
                needPermission: true,
                order: 3,
                parentId: 'v2_role_management',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_role_edition',
                    path: '/role/:id/edit'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963df',
                description: '设置',
                name: 'v2_setting',
                needPermission: true,
                order: 7,
                parentId: '',
                resources: [
                  {
                    type: 'button',
                    code: 'v2_setting',
                    path: ''
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963e0',
                description: '设置中心',
                name: 'v2_setting-center',
                needPermission: true,
                order: 1,
                parentId: 'v2_setting',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_setting-center',
                    path: '/settingCenter'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963e1',
                description: '个人设置',
                name: 'v2_account-setting',
                needPermission: true,
                order: 2,
                parentId: 'v2_setting',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_account-setting',
                    path: '/accountSetting'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963e2',
                description: '通知设置',
                name: 'v2_notification-setting',
                needPermission: true,
                order: 3,
                parentId: 'v2_setting',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_notification-setting',
                    path: '/notificationSetting'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963e3',
                description: '系统设置',
                name: 'v2_system_settings_menu',
                needPermission: true,
                order: 4,
                parentId: 'v2_setting',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_system_settings_menu',
                    path: '/settings'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              },
              {
                id: '6399bc064211520d34e963e4',
                description: '告警设置',
                name: 'v2_alarm_settings_menu',
                needPermission: true,
                order: 5,
                parentId: 'v2_setting',
                resources: [
                  {
                    type: 'page',
                    code: 'v2_alarm_settings_menu',
                    path: '/alarmSetting'
                  }
                ],
                status: 'enable',
                type: 'read',
                version: 'v2'
              }
            ]

            // 页面排序  ---- 开始
            let pageMap = {}
            self.permissionList.forEach(item => {
              pageMap[item.name] = item
            })
            let pageMenu = items => {
              return items.map(item => {
                let page = pageMap[item.name]
                let menu = Object.assign({}, item, page)
                if (menu.children) {
                  menu.children = pageMenu(menu.children)
                }
                return menu
              })
            }

            let moduleFun = items => {
              return items.map(item => {
                let page = pageMap[item.name]
                let menu = Object.assign({}, item, page)
                if (menu.children) {
                  menu.children = moduleFun(menu.children)
                }
                if (menu.classification) {
                  menu.classification = moduleFun(menu.classification)
                }
                if (menu.functional) {
                  menu.functional = moduleFun(menu.functional)
                }
                return menu
              })
            }

            this.dataList = pageMenu(pageSort)
            this.moduleList = moduleFun(moduleMapping)
            // 页面排序  ---- 结束
            this.getMappingData(this.moduleList, this.dataList)
          }
        })
        .finally(() => {
          this.permissLoading = false
        })
    },

    // 页面单选
    handleCheckChange(event, item) {
      if (typeof item.checkAll === 'undefined') {
        this.$set(item, 'checkAll', false)
      }

      let checkedCount = item.children.filter(el => {
        return el.checkAll
      })
      item.checked = checkedCount.length === item.children.length
    },

    // 页面全选
    handleAllCheck(event, item) {
      if (typeof item.checked === 'undefined') {
        this.$set(item, 'checked', false)
      } else {
        item.checkAll = event
      }
      if (typeof item.checkAll === 'undefined') {
        this.$set(item, 'checkAll', true)
      }
      if (item.children && item.children.length) {
        for (let i = 0; i < item.children.length; i++) {
          if (item.checked) {
            this.$set(item.children[i], 'checkAll', true)
          } else {
            this.$set(item.children[i], 'checkAll', false)
          }
        }
      }
    },

    // 权限单个选择
    handleOneCheckAll(event, item, children, second, type) {
      if (typeof item.checked === 'undefined') {
        this.$set(item, 'checked', true)
      }

      // if (!event) {
      // 	second.checkAllData = false;
      // 	item.checkedAllData = false;
      // }

      let checkedCount = children.filter(el => {
        return el.checked
      })

      switch (type) {
        case 'children':
          item.checkAll = checkedCount.length === children.length
          break
        case 'classify':
          item.classifiyCheckAll = checkedCount.length === children.length
          break
        default:
          item.functionCheckAll = checkedCount.length === children.length
          break
      }
    },
    // 权限全选
    handleAuthoritySelectAll(event, item, children) {
      if (typeof item.checkAll === 'undefined') {
        this.$set(item, 'checkAll', false)
      } else {
        item.checked = event
      }
      if (typeof item.checked === 'undefined') {
        this.$set(item, 'checked', true)
      }
      if (children && children.length) {
        for (let i = 0; i < children.length; i++) {
          if (event) {
            this.$set(children[i], 'checked', true)
          } else {
            if (children[i].type !== 'read') {
              this.$set(children[i], 'checked', false)
            }

            // this.$set(children[i], 'checkAllData', false);
            // this.$set(item, 'checkedAllData', false);
          }
        }
      }
    },

    // 权限全部数据单选
    handleOneAllData(event, item, children, second) {
      if (typeof second.checkAllData === 'undefined') {
        this.$set(second, 'checkAllData', true)
      }
      if (typeof item.checkAll === 'undefined') {
        this.$set(item, 'checkAll', false)
      } else {
        item.checked = event
      }
      let checkedCount = children.filter(el => {
        if (el.allName) {
          return el.checkAllData
        }
      })
      let allDataCount = children.filter(el => {
        return el.allName
      })
      item.checkedAllData = checkedCount.length === allDataCount.length ? true : false
    },

    // 权限全部数据全选
    handleCheckedAllData(event, item, children) {
      if (typeof item.checkedAllData === 'undefined') {
        this.$set(item, 'checkedAllData', false)
      } else {
        item.checkAllData = event
      }
      if (children && children.length) {
        for (let i = 0; i < children.length; i++) {
          if (event && children[i].checked) {
            this.$set(children[i], 'checkAllData', true)
          } else {
            if (children[i].allName !== 'data_catalog_all_data') {
              this.$set(children[i], 'checkAllData', false)
            }
          }
        }
      }
    },

    // 保存
    saveSubmit() {
      let self = this
      self.saveloading = true
      const roleId = this.$route.query.id

      // 获取选中数据
      let pageArr = [],
        pageMenuArr = [],
        childreArr = [],
        childreArrAll = [],
        classifyArr = [],
        functionalArr = []
      this.dataList.forEach(item => {
        item.children.forEach(child => {
          if (child.checkAll) {
            pageArr.push(child.name)
            pageMenuArr.push(item.name)
          }
        })
      })
      this.moduleList.forEach(item => {
        if (item.children && item.children.length)
          item.children.forEach(child => {
            if (child.checkAllData) {
              childreArrAll.push(child.allName)
            }
            if (child.checked) {
              childreArr.push(child.name)
            }
          })
        if (item.classification && item.classification.length)
          item.classification.forEach(classify => {
            if (classify.checked) {
              classifyArr.push(classify.name)
            }
          })
        if (item.functional && item.functional.length)
          item.functional.forEach(fun => {
            if (fun.checked) {
              functionalArr.push(fun.name)
            }
          })
      })

      let saveRoleArr = [...pageMenuArr, ...pageArr, ...childreArr, ...childreArrAll, ...classifyArr, ...functionalArr]

      let newRoleMappings = []

      saveRoleArr.forEach(selectPermission => {
        if (selectPermission)
          newRoleMappings.push({
            principalType: 'PERMISSION',
            principalId: selectPermission,
            roleId: roleId
          })
      })

      usersApi
        .deletePermissionRoleMapping(roleId, {
          data: { data: newRoleMappings }
        })
        .then(() => {
          this.$emit('saveBack')
          this.$message.success(this.$t('message_save_ok'))
        })
        .finally(() => {
          self.saveloading = false
        })
    },

    // 返回
    back() {
      this.$router.push({ name: 'roles' })
    }
  }
}
</script>

<style lang="scss" scoped>
.role {
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  .head {
    display: block;
    border-bottom: 1px solid #dedee4;
    i {
      display: inline-block;
      cursor: pointer;
    }
    h1 {
      display: inline-block;
      height: 60px;
      padding-right: 30px;
      line-height: 60px;
      font-size: 16px;
      color: map-get($fontColor, dark);
      font-weight: bold;
    }
    span {
      font-size: 12px;
      color: map-get($fontColor, light);
    }
  }

  .role-tableBox {
    // display: flex;
    // flex-direction: column;
    height: calc(100% - 120px);
    padding: 10px 0;
    box-sizing: border-box;
    overflow: auto;
    .headTitle {
      padding-bottom: 8px;
      h4 {
        display: inline-block;
        padding-right: 20px;
        font-size: 14px;
        color: map-get($fontColor, dark);
      }
      p {
        display: inline-block;
        font-size: 12px;
        color: map-get($fontColor, light);
      }
    }

    .role-table {
      position: relative;
      margin-bottom: 20px;
      border: 1px solid #e0e0e0;
      overflow: auto;
      // .header {
      // 	height: 40px;
      // 	line-height: 40px;
      // 	text-align: center;
      // 	border-bottom: 1px solid #e7e7e7;
      // 	background: #f8f8f9;
      // }

      li {
        min-height: 39px;
        // line-height: 40px;
        overflow: hidden;
        border-bottom: 1px solid #e7e7e7;
        &:last-child {
          border-bottom: 0;
        }
      }
      .role-head {
        min-height: 29px;
        height: 30px !important;
        line-height: 30px;
        font-size: 12px;
        color: map-get($fontColor, light);
        background-color: map-get($bgColor, main);
        .e-col {
          padding-left: 12px;
        }
      }
      .module-style {
        .e-row {
          border-bottom: 1px solid #e7e7e7;
          &:last-child {
            border-bottom: 0;
          }
          .nav {
            display: block;
            padding-left: 12px;
            font-size: 14px;
          }

          .box {
            .e-col {
              padding-top: 8px;
              border-right: 1px solid #e7e7e7;
              border-bottom: 0;
              box-sizing: border-box;
              &:last-child {
                border: 0;
              }
            }
          }
        }
        .heightStyle {
          line-height: 40px;
          .e-col {
            padding-top: 0 !important;
            line-height: 34px;
            min-height: 40px;

            .checkbox-radio {
              vertical-align: middle;
            }
          }
        }
      }
      .line {
        width: 100%;
        height: 1px;
        background: #e7e7e7;
      }
      .borderRight {
        border-right: 1px solid #e7e7e7;
      }
      .borderLine {
        border-left: 1px solid #e7e7e7;
        border-bottom: 0;
        // border-right: 1px solid #e7e7e7;
      }
    }

    .page-table {
      li {
        line-height: 40px;
      }
    }
  }
  .btn {
    width: 100%;
    padding-top: 18px;
    text-align: center;
    border-top: 1px solid #e7e7e7;
  }
}

[v-cloak] {
  display: none;
}
</style>
<style lang="scss">
.role {
  .role-table {
    .e-row {
      .allSelectBox {
        line-height: 20px;
      }
      .el-checkbox {
        // display: inline;
        min-width: 170px;
        margin: 0 10px;
        line-height: 20px;
        box-sizing: border-box;
      }
      .checkbox-position {
        line-height: 1px;
        vertical-align: top;
        .el-checkbox__input {
          padding-top: 0;
          vertical-align: top;
        }
      }
      .checkbox-radio {
        min-width: 170px;
        .el-checkbox__input {
          padding-top: 3px;
          vertical-align: top;
        }

        .e-checkbox {
          // display: block !important;
          padding: 5px 0;
          margin: 0;
          font-size: 12px;
          color: map-get($fontColor, light);
        }
      }
    }
  }
}
</style>
