<template>
  <div class="role section-wrap" v-loading="loading">
    <div class="section-wrap-box">
      <head class="head">
        <i class="iconfont icon-left-circle back-btn-icon link-primary cursor-pointer" @click="back"></i>
        <h1 class="pl-2">{{ $t('role.settingTitle') }}</h1>
        <span>{{ $t('role.currentRole') }}: {{ roleName }}</span>
      </head>

      <div class="role-tableBox">
        <div class="headTitle">
          <h4>{{ $t('role.pageVisible') }}</h4>
          <p>{{ $t('role.pageShowTip') }}</p>
        </div>
        <ul class="role-table page-table">
          <li class="role-head">
            <el-row class="e-row">
              <el-col class="e-col borderRight" :span="21">
                {{ $t('role.choosePage') }}
              </el-col>
              <el-col class="e-col" :span="3">{{ $t('role.bulkOperate') }} </el-col>
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
                      {{ $t('role_page_' + second.name) }}
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
        <div class="headTitle">
          <h4>{{ $t('role.funcPermission') }}</h4>
          <p>{{ $t('role.choosePermissionTip') }}</p>
        </div>
        <ul class="role-table">
          <li class="role-head">
            <el-row class="e-row">
              <el-col class="e-col" :span="3">
                {{ $t('role.module') }}
              </el-col>
              <el-col class="e-col borderLeft" :span="18">
                {{ $t('role.functionDataPermission') }}
              </el-col>
              <el-col class="e-col borderLeft" :span="3">{{ $t('role.bulkOperate') }} </el-col>
            </el-row>
          </li>
          <li class="module-style">
            <el-row class="e-row" v-for="item in moduleList" :key="item.id">
              <el-col :span="3" style="line-height: 40px">
                <span class="nav">{{ $t('role_module_meun_' + item.name) }}</span>
              </el-col>
              <el-col :span="21" class="e-col borderLine">
                <!-- 权限 -->
                <el-row class="box">
                  <el-col class="e-col" :span="20" v-if="item.children">
                    <el-checkbox
                      v-for="second in item.children"
                      :key="second.name"
                      v-model="second.checked"
                      v-show="second.id"
                      :disabled="second.type === 'read'"
                      @change="handleOneCheckAll($event, item, item.children, second, 'children')"
                      :class="[{ 'checkbox-position': !second.allName }, 'checkbox-radio']"
                      v-cloak
                    >
                      <div>{{ $t('role_name_' + second.name) }}</div>
                      <el-checkbox
                        class="e-checkbox"
                        v-show="second.allName"
                        :disabled="!second.checked || second.allName === 'data_catalog_all_data'"
                        v-model="second.checkAllData"
                        @change="handleOneAllData($event, item, item.children, second, 'children')"
                        v-cloak
                      >
                        <div>{{ $t('role.allData') }}</div>
                      </el-checkbox>
                    </el-checkbox>
                  </el-col>
                  <el-col :span="4" v-if="item.children" style="padding-top: 8px">
                    <el-checkbox
                      v-model="item.checkAll"
                      @change="handleAuthoritySelectAll($event, item, item.children)"
                      v-cloak
                    >
                      <div>{{ $t('role.chooseAllFunction') }}</div>
                    </el-checkbox>
                    <el-checkbox
                      class="e-checkbox"
                      v-model="item.checkedAllData"
                      @change="handleCheckedAllData($event, item, item.children)"
                      v-cloak
                    >
                      <div>{{ $t('role.chooseAllRole') }}</div>
                    </el-checkbox>
                  </el-col>
                </el-row>
                <div class="line" v-if="item.children && item.classification"></div>
                <!-- 分类权限 -->
                <el-row class="box heightStyle" v-if="item.classification">
                  <el-col class="e-col" :span="20">
                    <el-checkbox
                      v-for="second in item.classification"
                      :key="second.name"
                      v-model="second.checked"
                      v-show="second.id"
                      :disabled="second.type === 'read'"
                      @change="handleOneCheckAll($event, item, item.classification, second, 'classify')"
                      :class="[{ 'checkbox-position': !second.allName }, 'checkbox-radio']"
                      v-cloak
                    >
                      <div>{{ $t('role_name_' + second.name) }}</div>
                      <!-- <el-checkbox
											class="e-checkbox"
											v-show="second.allName"
											:disabled="!item.checked"
											v-model="second.checkAllData"
											@change="handleChange($event, item, second)"
											v-cloak
										>
											<div>All data</div>
										</el-checkbox> -->
                    </el-checkbox>
                  </el-col>
                  <el-col class="e-col allSelectBox" :span="4">
                    <el-checkbox
                      class="checkbox-radio checkbox-position"
                      v-model="item.classifiyCheckAll"
                      @change="handleAuthoritySelectAll($event, item, item.classification)"
                      v-cloak
                    >
                      <div>{{ $t('role.chooseAllFunction') }}</div>
                    </el-checkbox>
                  </el-col>
                </el-row>
                <div class="line" v-if="item.classification && item.functional"></div>
                <!-- 导入导出 -->
                <el-row class="box heightStyle" v-if="item.functional">
                  <el-col class="e-col" :span="20">
                    <el-checkbox
                      v-for="second in item.functional"
                      :key="second.name"
                      v-show="second.id"
                      :disabled="second.type === 'read'"
                      v-model="second.checked"
                      @change="handleOneCheckAll($event, item, item.functional, second, 'functional')"
                      :class="[{ 'checkbox-position': !second.allName }, 'checkbox-radio']"
                      v-cloak
                    >
                      <div>{{ $t('role_name_' + second.name) }}</div>
                    </el-checkbox>
                  </el-col>
                  <el-col class="e-col" :span="4">
                    <el-checkbox
                      class="checkbox-radio checkbox-position"
                      v-model="item.functionCheckAll"
                      @change="handleAuthoritySelectAll($event, item, item.functional)"
                      v-cloak
                    >
                      <div>{{ $t('role.chooseAllFunction') }}</div>
                    </el-checkbox>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </li>
        </ul>
      </div>
      <div class="btn">
        <el-button size="mini" @click="back">{{ $t('dataVerify.back') }} </el-button>
        <el-button size="mini" type="primary" :loading="saveloading" @click="saveSubmit('ruleForm')"
          >{{ $t('app.save') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { roleMappingsApi } from '@tap/api'

let pageSort = [
  // { children: [{ name: 'Dashboard_menu' }] },
  { children: [{ name: 'datasource_menu' }] },
  {
    name: 'data_transmission',
    children: [
      { name: 'Data_SYNC_menu' },
      { name: 'Data_verify_menu' },
      { name: 'log_collector_menu' },
      { name: 'SYNC_Function_management_menu' },
      { name: 'custom_node_menu' },
      { name: 'shared_cache_menu' }
    ]
  },
  {
    name: 'data_government',
    children: [
      { name: 'data_catalog_menu' },
      { name: 'data_search_menu' }
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
      { name: 'API_management_menu' },
      { name: 'API_data_explorer_menu' },
      { name: 'API_doc_test_menu' },
      { name: 'API_stats_menu' },
      { name: 'API_clients_menu' },
      { name: 'API_server_menu' }
    ]
  },
  // { children: [{ name: 'data_collect_menu' }] },
  {
    name: 'system_management',
    children: [
      // { name: 'schedule_jobs_menu' },
      { name: 'Cluster_management_menu' },
      // { name: 'agents_menu' },
      // { name: 'servers_oversee_menu' },
      { name: 'user_management_menu' },
      { name: 'role_management_menu' }
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
  // {
  //   name: 'data_collect',
  //   children: [{ name: 'data_collect', allName: 'data_collect_all_data' }]
  // },

  // {
  //   name: 'schedule_jobs',
  //   functional: [{ name: 'schedule_jobs' }, { name: 'schedule_jobs_management' }]
  // },
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
      self
        .$api('Permissions')
        .get({})
        .then(data => {
          if (data && data.length) {
            self.permissionList = data

            // 页面排序  ---- 开始
            let pageMap = {}
            data.forEach(item => {
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

      self
        .$api('users')
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
