<script>
import { permissionsApi, roleMappingsApi, usersApi } from '@tap/api'
import i18n from '@/i18n'

import { $emit, $off, $on, $once } from '../../../utils/gogocodeTransfer'

const pageSort = [
  { name: 'v2_data-console', children: [{ name: 'v2_data-console' }] },
  {
    name: 'v2_datasource_menu',
    children: [
      {
        name: 'v2_datasource_menu',
        buttons: [
          {
            label: i18n.t('public_connection_button_create'),
            name: 'v2_datasource_creation',
          },
          {
            label: i18n.t('public_connection_button_copy'),
            name: 'v2_datasource_copy',
          },
        ],
        filterData: [
          {
            name: 'v2_datasource_all_data',
          },
        ],
      },
    ],
  },
  {
    name: 'v2_data_pipeline',
    children: [
      {
        name: 'v2_data_replication',
        buttons: [
          {
            label: i18n.t('public_task_create'),
            name: 'v2_data_replication_creation',
            checked: false,
          },
          {
            label: i18n.t('public_task_copy'),
            name: 'v2_data_replication_copy',
            checked: false,
          },
          {
            label: i18n.t('public_task_import'),
            name: 'v2_data_replication_import',
            checked: false,
          },
          {
            label: i18n.t('public_task_export'),
            name: 'v2_data_replication_export',
            checked: false,
          },
        ],
        filterData: [
          {
            name: 'v2_data_replication_all_data',
          },
        ],
      },
      {
        name: 'v2_data_flow',
        buttons: [
          {
            label: i18n.t('public_task_create'),
            name: 'v2_data_flow_creation',
            checked: false,
          },
          {
            label: i18n.t('public_task_copy'),
            name: 'v2_data_flow_copy',
            checked: false,
          },
          {
            label: i18n.t('public_task_import'),
            name: 'v2_data_flow_import',
            checked: false,
          },
          {
            label: i18n.t('public_task_export'),
            name: 'v2_data_flow_export',
            checked: false,
          },
        ],
        filterData: [
          {
            name: 'v2_data_flow_all_data',
          },
        ],
      },
      { name: 'v2_data_check' },
    ],
  },
  {
    name: 'v2_advanced_features',
    children: [
      { name: 'v2_log_collector' },
      { name: 'v2_function_management' },
      { name: 'v2_custom_node' },
      { name: 'v2_shared_cache' },
    ],
  },
  {
    name: 'v2_data_discovery',
    children: [{ name: 'v2_data_object' }, { name: 'v2_data_catalogue' }],
  },
  {
    name: 'v2_data-server',
    children: [
      { name: 'v2_api-application' },
      { name: 'v2_data-server-list' },
      { name: 'v2_api-client' },
      { name: 'v2_api-servers' },
      { name: 'v2_data_server_audit' },
      { name: 'v2_api_monitor' },
    ],
  },
  {
    name: 'v2_system-management',
    children: [
      { name: 'v2_cluster-management_menu' },
      { name: 'v2_external-storage_menu' },
      { name: 'v2_user_management_menu' },
      { name: 'v2_role_management' },
    ],
  },
]

export default {
  emits: ['saveBack'],
  data() {
    return {
      loading: false,
      saveloading: false,
      permissLoading: false,
      form: {
        name: '',
        description: '',
        register_user_default: false,
      },
      dataList: [],
      rolemappings: [],
      roleusers: [],
      selectRole: [],
      permissionList: [],
      roleName: '',
      radio: 1,
      moduleList: [],
      adds: [],
      deletes: [],
    }
  },
  created() {
    this.roleName = this.$route.query.name ? this.$route.query.name : ''
    this.getPermission()
  },
  methods: {
    // 获取用户权限数据
    getMappingData(pageData) {
      this.loading = true
      const filter = {
        where: {
          roleId: this.$route.query.id,
        },
      }
      roleMappingsApi
        .get({
          filter: JSON.stringify(filter),
        })
        .then((data) => {
          if (data?.length) {
            data.forEach((item) => {
              if (item.principalType === 'USER') {
                this.roleusers.push(item.principalId)
              }
              if (item.principalType === 'PERMISSION') {
                const selected = this.permissionList.filter(
                  (v) => v.name === item.principalId,
                )
                if (selected && selected.length > 0) {
                  selected[0].self_only = item.self_only
                  this.selectRole.push(selected[0].name)
                }
              }
            })
            this.rolemappings = data?.items

            pageData?.forEach((item) => {
              // 页面权限
              item.children?.forEach((childItem) => {
                childItem.checked = this.selectRole.includes(childItem.name)
                childItem.checkOrigin = this.selectRole.includes(childItem.name)

                // 按钮权限
                childItem.buttons?.forEach((el) => {
                  el.checked = this.selectRole.includes(el.name)
                  el.checkOrigin = this.selectRole.includes(el.name)
                })

                // 显示数据
                childItem.filterData?.forEach((el) => {
                  el.checked = this.selectRole.includes(el.name)
                  el.checkOrigin = this.selectRole.includes(el.name)
                })
              })
            })
          }
        })
        .finally(() => {
          this.loading = false
        })
    },

    // 获取权限信息
    getPermission() {
      const self = this
      this.permissLoading = true
      const filter = { where: { version: 'v2' } }

      permissionsApi
        .get({
          filter: JSON.stringify(filter),
        })
        .then((data) => {
          if (data && data.length) {
            self.permissionList = data

            // 页面排序  ---- 开始
            const pageMap = {}
            self.permissionList.forEach((item) => {
              pageMap[item.name] = item
            })

            const pageMenu = (items) => {
              return items.map((item) => {
                const page = pageMap[item.name]
                const menu = Object.assign({}, item, page)
                if (menu.children) {
                  menu.children = pageMenu(menu.children)
                }
                return menu
              })
            }

            this.dataList = pageMenu(pageSort)
            // 页面排序  ---- 结束
            this.getMappingData(this.dataList)
          }
        })
        .finally(() => {
          this.permissLoading = false
        })
    },

    // 页面单选
    handleCheckChange(data, parentData, type = 'page') {
      //保留当前操作数据
      this.updateData(data.checked, data)

      // 页面权限关闭
      if (type === 'page' && !data.checked) {
        // 如果父元素的页面权限全部不勾选，则父元素也隐藏
        if (
          !!parentData.children?.every((t) => !t.checked) &&
          !this.checkPrincipalId(this.deletes, parentData.name)?.length
        ) {
          parentData.checked = false
          this.updateData(false, parentData)
        }

        // 按钮权限全部关闭
        data.buttons?.forEach((el) => {
          el.checked = false
          this.updateData(el.checked, el)
        })
      }

      // 按钮权限勾选
      if (type === 'button' && data.checked) {
        // 页面权限勾选上
        parentData.checked = true
        this.updateData(parentData.checked, parentData)
      }
    },

    updateData(checked, data) {
      //保留当前操作数据
      const roleId = this.$route.query.id
      if (checked) {
        // 和初始值不一样，则进行记录
        if (
          checked !== data.checkOrigin &&
          this.checkPrincipalId(this.adds, data.name)?.length === 0
        ) {
          this.adds.push({
            principalType: 'PERMISSION',
            principalId: data.name,
            roleId,
          })
        }
        //同时清掉 deletes
        const index = this.deletes?.findIndex(
          (del) => del.principalId === data.name,
        )
        if (index > -1) {
          this.deletes.splice(index, 1)
        }
      } else {
        // 和初始值不一样，则进行记录
        if (
          checked !== data.checkOrigin &&
          this.checkPrincipalId(this.deletes, data.name)
        ) {
          this.deletes.push({
            principalType: 'PERMISSION',
            principalId: data.name,
            roleId,
          })
        }

        //同时清掉 adds
        const index = this.adds?.findIndex(
          (add) => add.principalId === data.name,
        )
        if (index > -1) {
          this.adds.splice(index, 1)
        }
      }
    },
    //查找是否存在某个字段
    checkPrincipalId(data, principalId) {
      return data.filter((item) => item.principalId === principalId) || []
    },
    //新的保存方法
    save() {
      //数据组装
      const roleId = this.$route.query.id
      this.saveloading = true
      const data = {
        adds: this.adds,
        deletes: this.deletes,
      }
      usersApi
        .updatePermissionRoleMapping(roleId, data)
        .then(() => {
          $emit(this, 'saveBack')
          this.$message.success(this.$t('public_message_save_ok'))
          this.adds = []
          this.deletes = []
          this.$router.push({
            name: 'roleList',
          })
        })
        .finally(() => {
          this.saveloading = false
        })
    },
    // 返回
    back() {
      // 检查是否有改动
      if (!this.adds.length && !this.deletes.length) {
        this.$router.push({ name: 'roles' })
        return
      }

      this.$confirm(
        i18n.t('daas_role_role_ninhaiweibaocun'),
        this.$t('public_message_title_prompt'),
        {
          type: 'warning',
          closeOnClickModal: false,
        },
      ).then((flag) => {
        flag && this.save()
      })
    },
  },
}
</script>

<template>
  <div v-loading="loading" class="role flex-fill overflow-auto px-5 pb-5">
    <div class="section-wrap-box">
      <head class="head flex justify-content-between mb-4">
        <div class="flex">
          <div class="mr-3 fs-5 fw-sub">{{ $t('role_settingTitle') }}</div>
          <span>{{ $t('role_currentRole') }}: {{ roleName }}</span>
        </div>
        <div>
          <el-button @click="back">{{ $t('public_button_back') }} </el-button>
          <el-button
            type="primary"
            :loading="saveloading"
            @click="save('ruleForm')"
            >{{ $t('public_button_save') }}
          </el-button>
        </div>
      </head>

      <div class="role-tableBox">
        <div
          class="alert-tip flex align-items-center mb-4 bg-warning-light rounded-2 px-4 py-2"
        >
          <VIcon class="color-warning mr-3" size="20">warning</VIcon>
          <span>{{ $t('daas_role_role_gouxuanxiangyingmo') }}</span>
        </div>
        <ul class="role-table page-table">
          <li class="role-head">
            <el-row class="e-row">
              <el-col class="e-col borderRight" :span="4">{{
                $t('daas_role_role_gongnengmokuai')
              }}</el-col>
              <el-col class="e-col borderRight" :span="4">{{
                $t('daas_role_role_yemianquanxian')
              }}</el-col>
              <el-col class="e-col borderRight" :span="14">{{
                $t('daas_role_role_gongnengquanxian')
              }}</el-col>
              <el-col class="e-col flex align-items-center" :span="2">
                <span>{{ $t('daas_role_role_chakanquanbushu') }}</span>
                <ElTooltip
                  transition="tooltip-fade-in"
                  placement="top"
                  :content="$t('daas_role_role_chakanquanbushu')"
                >
                  <VIcon size="16" class="color-info ml-2">info</VIcon>
                </ElTooltip>
              </el-col>
            </el-row>
          </li>
          <li v-for="item in dataList" :key="item.id">
            <el-row class="e-row flex">
              <el-col
                class="e-col flex justify-content-center align-items-center"
                :span="4"
              >
                <span>{{ item.description }}</span>
              </el-col>
              <el-col class="e-col border-start" :span="4">
                <div
                  v-for="(second, secondIndex) in item.children"
                  :key="secondIndex"
                  :class="['pl-3', secondIndex !== 0 ? 'border-top' : '']"
                >
                  <el-checkbox
                    v-if="second.id"
                    v-cloak
                    v-model="second.checked"
                    @change="handleCheckChange(second, item, 'page')"
                  >
                    <span>
                      {{ second.description }}
                    </span>
                  </el-checkbox>
                </div>
              </el-col>
              <el-col class="e-col border-start border-end" :span="14">
                <div
                  v-for="(second, secondIndex) in item.children"
                  :key="secondIndex"
                  :class="['pl-3', secondIndex !== 0 ? 'border-top' : '']"
                >
                  <el-checkbox
                    v-if="!second.buttons || !second.buttons.length"
                    v-cloak
                    :model-value="true"
                    disabled
                  >
                    <span>{{ $t('daas_role_role_quanbugongneng') }}</span>
                  </el-checkbox>
                  <el-checkbox
                    v-for="(sItem, sIndex) in second.buttons"
                    v-else
                    v-cloak
                    v-model="sItem.checked"
                    class="mr-10"
                    @change="handleCheckChange(sItem, second, 'button')"
                  >
                    <span>{{ sItem.label }} </span>
                  </el-checkbox>
                </div>
              </el-col>
              <el-col class="e-col" :span="2">
                <div
                  v-for="(second, secondIndex) in item.children"
                  :key="secondIndex"
                  :class="[
                    'pl-3',
                    secondIndex !== 0 && second.filterData
                      ? 'border-top border-bottom'
                      : '',
                  ]"
                >
                  <span v-if="!second.filterData" class="invisible">-</span>
                  <el-switch
                    v-for="(sItem, sIndex) in second.filterData"
                    v-else
                    v-model="sItem.checked"
                    @change="handleCheckChange(sItem, second, 'data')"
                  />
                </div>
              </el-col>
            </el-row>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.role {
  box-sizing: border-box;
  .head {
    height: 28px;
    line-height: 28px;
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
      color: map.get($fontColor, dark);
      font-weight: bold;
    }
    span {
      font-size: 12px;
      color: map.get($fontColor, light);
    }
  }

  .role-tableBox {
    display: flex;
    flex-direction: column;
    padding: 10px 0;
    box-sizing: border-box;
    overflow: auto;
    .headTitle {
      padding-bottom: 8px;
      h4 {
        display: inline-block;
        padding-right: 20px;
        font-size: 14px;
        color: map.get($fontColor, dark);
      }
      p {
        display: inline-block;
        font-size: 12px;
        color: map.get($fontColor, light);
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
        color: map.get($fontColor, light);
        background-color: map.get($bgColor, main);
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

      :deep(.e-row) {
        .allSelectBox {
          line-height: 20px;
        }
        .el-checkbox {
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
          .el-checkbox__input {
            padding-top: 3px;
            vertical-align: top;
          }

          .e-checkbox {
            padding: 5px 0;
            margin: 0;
            font-size: 12px;
            color: map.get($fontColor, light);
          }
        }
      }
    }

    .page-table {
      li {
        line-height: 40px;
      }
    }
  }
}
[v-cloak] {
  display: none;
}
.alert-tip {
  border-left: 4px solid #ffcf8b;
}
</style>
