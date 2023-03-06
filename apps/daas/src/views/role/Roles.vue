<template>
  <section class="roles-list-wrap h-100">
    <TablePage ref="table" row-key="id" class="roles-list" :remoteMethod="getData" @sort-change="handleSortTable">
      <div slot="search" class="search-bar">
        <FilterBar v-model="searchParams" :items="filterItems" @fetch="table.fetch(1)"> </FilterBar>
      </div>
      <div slot="operation">
        <!--        <el-button-->
        <!--          v-readonlybtn="'role_creation'"-->
        <!--          type="primary"-->
        <!--          class="btn btn-create"-->
        <!--          size="mini"-->
        <!--          @click="openCreateDialog()"-->
        <!--        >-->
        <!--          &lt;!&ndash; <i class="iconfont icon-jia add-btn-icon"></i> &ndash;&gt;-->
        <!--          <span>{{ $t('role_list_create') }}</span>-->
        <!--        </el-button>-->
      </div>
      <el-table-column :label="$t('role_list_role_name')" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <div>{{ scope.row.name }}</div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('role_list_description')" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <div>{{ scope.row.description }}</div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('role_list_associat_users')" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.userCount }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('public_creator')">
        <template slot-scope="scope">
          <div>
            {{ scope.row.userEmail }}
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('role_list_default_role')" width="90">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.register_user_default"
            :disabled="!$has('role_edition')"
            @change="changeRowDefault(scope.row)"
          >
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column :label="$t('public_operation')" width="310">
        <template slot-scope="scope">
          <el-button
            type="text"
            v-readonlybtn="'role_edition'"
            :disabled="$disabledByPermission('role_edition_all_data', scope.row.user_id)"
            @click="handleSettingPermissions(scope.row.id, scope.row.name)"
          >
            {{ $t('role_list_setting_permissions') }}
          </el-button>
          <ElDivider direction="vertical"></ElDivider>
          <el-button
            type="text"
            @click="handleAssociatUsers(scope.row.id)"
            :disabled="$disabledByPermission('role_edition_all_data', scope.row.user_id) || scope.row.name === 'admin'"
            v-readonlybtn="'role_edition'"
          >
            {{ $t('role_list_associat_users') }}
          </el-button>
          <ElDivider direction="vertical"></ElDivider>
          <el-button
            type="text"
            v-readonlybtn="'role_edition'"
            :disabled="$disabledByPermission('role_edition_all_data', scope.row.user_id)"
            @click="openCreateDialog(scope.row.id, scope.row)"
          >
            {{ $t('public_button_edit') }}
          </el-button>
          <ElDivider direction="vertical"></ElDivider>
          <!--          <el-button-->
          <!--            type="text"-->
          <!--            @click="handleDelete(scope.row)"-->
          <!--            :disabled="$disabledByPermission('role_delete_all_data', scope.row.user_id) || scope.row.name === 'admin'"-->
          <!--            v-readonlybtn="'role_delete'"-->
          <!--          >-->
          <!--            {{ $t('public_button_delete') }}-->
          <!--          </el-button>-->
        </template>
      </el-table-column>
    </TablePage>
    <!-- 创建角色 -->
    <el-dialog
      :title="roleId ? $t('role_list_edit') : $t('role_list_create')"
      :close-on-click-modal="false"
      :visible.sync="dialogFormVisible"
      custom-class="create-role"
      width="600px"
    >
      <el-form :model="form" ref="form" label-width="120px">
        <el-form-item
          :label="$t('role_list_role_name')"
          prop="name"
          :rules="[{ required: true, message: $t('role_null'), trigger: 'blur' }]"
        >
          <el-input v-model="form.name" :placeholder="$t('role_list_select_role_name')" size="small"></el-input>
        </el-form-item>
        <el-form-item
          :label="$t('role_list_description')"
          prop="description"
          :rules="[{ required: true, message: $t('role_form_description'), trigger: 'blur' }]"
        >
          <el-input
            type="textarea"
            v-model="form.description"
            autocomplete="off"
            maxlength="200"
            show-word-limit
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('role_list_default_role')">
          <el-switch
            v-model="form.register_user_default"
            inactive-color="#dcdfe6"
            :active-text="form.register_user_default ? $t('role_form_yes') : $t('role_form_no')"
            style="margin-right: 20px"
          ></el-switch>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogFormVisible = false">{{ $t('public_button_cancel') }} </el-button>
        <el-button size="mini" type="primary" @click="createSave">{{ $t('public_button_confirm') }} </el-button>
      </div>
    </el-dialog>

    <!-- 关联用户 -->
    <el-dialog
      :title="$t('role_list_associat_users')"
      :close-on-click-modal="false"
      :visible.sync="dialogUserVisible"
      width="600px"
    >
      <div class="userBox">
        <el-select v-model="roleusers" filterable multiple :placeholder="$t('role_form_selectUser')">
          <el-option v-for="item in userGroup" :key="item.id" :label="item.email" :value="item.id"> </el-option>
        </el-select>
        <div class="num fs-8">{{ $t('role_form_connected') }}: {{ roleusers.length }}</div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogUserVisible = false">{{ $t('public_button_cancel') }}</el-button>
        <el-button size="mini" type="primary" @click="saveUser">{{ $t('public_button_confirm') }}</el-button>
      </span>
    </el-dialog>
  </section>
</template>

<script>
import { roleApi, usersApi, roleMappingsApi, permissionsApi } from '@tap/api'
import { FilterBar } from '@tap/component'
import { TablePage } from '@tap/business'

import { toRegExp } from '@/utils/util'

export default {
  components: {
    TablePage,
    FilterBar
  },
  data() {
    return {
      searchParams: {
        keyword: ''
        // time: ''
      },
      order: 'last_updated DESC',
      tableData: [],
      roleusers: [],
      userGroup: [],
      permissions: [],
      oldUser: [],
      loading: false,
      pagesize: 20,
      totalNum: 0,
      currentPage: 1,
      dialogFormVisible: false,
      dialogUserVisible: false,
      form: {
        name: '',
        description: '',
        register_user_default: false
      },
      roleId: '',
      filterItems: []
    }
  },
  created() {
    this.getUserData()
    this.getFilterItems()
  },
  watch: {
    '$route.query'() {
      this.table.fetch(1)
    }
  },
  computed: {
    table() {
      return this.$refs.table
    }
  },
  methods: {
    // 获取数据
    getData({ page }) {
      let { current, size } = page
      let { keyword } = this.searchParams
      let where = {}
      if (keyword && keyword.trim()) {
        let filterObj = { like: toRegExp(keyword), options: 'i' }
        where.or = [{ name: filterObj }]
      }
      let filter = {
        order: this.order,
        limit: size,
        skip: (current - 1) * size,
        where
      }
      return usersApi
        .role({
          filter: JSON.stringify(filter)
        })
        .then(data => {
          return {
            total: data?.total || 0,
            data: data?.items || []
          }
        })
    },
    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'last_updated'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
      this.table.fetch(1)
    },
    // 新建角色(弹窗开关)
    openCreateDialog(id, item) {
      this.dialogFormVisible = true
      if (id) {
        this.roleId = id
        this.form = {
          name: item.name,
          description: item.description,
          register_user_default: item.register_user_default
        }
      } else {
        this.roleId = ''
        this.form = {
          name: '',
          description: '',
          register_user_default: false
        }
        permissionsApi.get({}).then(data => {
          if (data && data?.length) {
            this.permissions = data
          }
        })
        this.table.fetch()
      }
    },
    // 设置权限
    handleSettingPermissions(id, name) {
      this.$router.push({ name: 'role', query: { id: id, name: name } })
    },

    // 确认删除角色
    handleDelete(item) {
      this.$confirm(this.$t('role_list_delete_remind', [item.name]), '', {
        type: 'warning'
      }).then(flag => {
        if (flag) {
          roleApi.delete(item.id, item.name).then(() => {
            this.table.fetch()
            this.$message.success(this.$t('role_list_delete_success'))
          })
        }
      })
    },
    // 查看删除角色权限
    delLinkRole(id) {
      this.$router.push({ name: 'role', query: { id } })
    },

    // 创建保存
    createSave() {
      let self = this
      this.$refs.form.validate(valid => {
        if (valid) {
          const record = {
            name: this.form.name,
            description: this.form.description,
            register_user_default: this.form.register_user_default
          }
          const method = this.roleId ? 'patch' : 'post'
          if (this.roleId) {
            record.id = this.roleId
          }
          let newRoleMappings = []

          roleApi[method](record)
            .then(data => {
              if (data) {
                if (method === 'post') {
                  this.permissions.forEach(selectPermission => {
                    if (selectPermission.type === 'read' && !selectPermission.isMenu)
                      newRoleMappings.push({
                        principalType: 'PERMISSION',
                        principalId: selectPermission.name,
                        roleId: data?.id
                      })
                  })
                  self
                    .$api('users')
                    .deletePermissionRoleMapping(data?.id, {
                      data: { data: newRoleMappings }
                    })
                    .then(data => {
                      if (data) {
                        // roleMappingModel.post(newRoleMappings);
                        this.$message.success(this.$t('public_message_save_ok'))
                      }
                    })
                } else {
                  this.$message.success(this.$t('public_message_save_ok'))
                }
                this.table.fetch()
              }
            })
            .finally(() => {
              self.dialogFormVisible = false
            })
        } else {
          return false
        }
      })
    },

    // 已关联用户
    async handleAssociatUsers(id) {
      this.dialogUserVisible = true
      this.roleId = id
      let _this = this
      _this.roleusers = []
      _this.oldUser = []
      let filter = {
        where: {
          roleId: id,
          principalType: 'USER'
        },
        limit: 999
      }
      await roleMappingsApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(data => {
          if (data?.length) {
            _this.roleusers = data.map(item => item.principalId)
            _this.oldUser = data
          }
        })
    },

    // 获取用户列表
    async getUserData() {
      await usersApi
        .get({
          filter: JSON.stringify({
            limit: 999
          })
        })
        .then(data => {
          if (data?.items) {
            data?.items.forEach(item => {
              if (!item.role) {
                this.userGroup.push(item)
              }
            })
          }
        })
    },

    // 保存关联用户
    saveUser() {
      let newRoleMappings = []
      this.oldUser.forEach(delRolemapping => {
        roleMappingsApi.delete(delRolemapping.id)
      })
      // _this.oldUser
      this.roleusers.forEach(roleuser => {
        if (roleuser) {
          newRoleMappings.push({
            principalType: 'USER',
            principalId: roleuser,
            roleId: this.roleId
          })
        }
      })
      roleMappingsApi.saveAll(newRoleMappings).then(data => {
        if (data) {
          this.roleusers = []
          data.forEach(item => {
            this.roleusers.push(item.principalId)
          })

          this.table.fetch()
          this.$message.success(this.$t('public_message_save_ok'))
        }
      })
      // .catch(e => {
      //   if (e.response && e.response.msg) {
      //     if (e.response.msg.indexOf('already exists')) {
      //       this.$message.error(this.$t('role_form_already_exists'))
      //     } else {
      //       this.$message.error(`${e.response.msg}`)
      //     }
      //   }
      // })
      this.dialogUserVisible = false
    },
    // 改变列表默认值val
    changeRowDefault(data) {
      const record = {
        id: data.id,
        name: data.name,
        description: data.description,
        register_user_default: data.register_user_default
      }

      roleApi.patch(record).then(() => {
        this.table.fetch()
      })
    },

    getFilterItems() {
      this.filterItems = [
        {
          placeholder: this.$t('role_list_select_role_name'),
          key: 'keyword',
          type: 'input'
        }
      ]
    }
  }
}
</script>
<style scoped lang="scss">
.roles {
  display: flex;
  width: 100%;
  height: 100%;

  .roles-list {
    background-color: rgba(239, 241, 244, 100);

    .search-bar {
      display: flex;

      li + li {
        margin-left: 10px;
      }
    }

    .btn + .btn {
      margin-left: 5px;
    }

    .btn {
      padding: 7px;
      background: map-get($bgColor, main);

      i.iconfont {
        font-size: 12px;
      }

      &.btn-dropdowm {
        margin-left: 5px;
      }

      &.btn-create {
        margin-left: 5px;
      }
    }
  }
}
</style>
<style lang="scss">
.roles-list-wrap {
  .userBox {
    .el-select,
    .el-input {
      width: 100%;
    }

    .num {
      padding-top: 10px;
    }
  }

  .dialog-footer {
    .el-button {
      width: 80px;
    }
  }
}
</style>
