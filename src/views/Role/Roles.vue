<template>
  <div class="roles">
    <div class="roles-box">
      <!-- <SubHead :tittle="headTitle"></SubHead> -->
      <div class="mappingTemplate">{{ $t('role.roleManagement') }}</div>
      <div class="topbar">
        <!-- <div class="panelBtn"></div> -->
        <ul class="search-bar">
          <li class="item">
            <el-input
              :placeholder="$t('role.selectRoleName')"
              v-model="searchNav.keyword"
              size="mini"
              class="input-with-select"
              suffix-icon="el-icon-search"
            >
              <el-select
                v-model="searchNav.selectedSeachType"
                slot="prepend"
                size="mini"
              >
                <el-option
                  :label="$t('role.fuzzyMatching')"
                  value="0"
                ></el-option>
                <el-option
                  :label="$t('role.preciseMatching')"
                  value="1"
                ></el-option>
              </el-select>
            </el-input>
          </li>
          <li class="item" v-if="searchNav.keyword">
            <el-button size="mini" type="text" @click="reset()">{{
              $t('button.query')
            }}</el-button>
          </li>
          <li class="item" v-if="searchNav.keyword">
            <el-button
              type="text"
              class="restBtn"
              size="mini"
              @click="reset('reset')"
            >
              {{ $t('dataFlow.reset') }}
            </el-button>
          </li>
        </ul>
        <div class="topbar-buttons">
          <el-button
            class="btn btn-create"
            v-readonlybtn="'role_creation'"
            size="mini"
            icon="el-icon-plus"
            @click="createRole()"
            >{{ $t('role.create') }}</el-button
          >
        </div>
      </div>
      <div class="table-box">
        <el-table
          v-loading="loading"
          :element-loading-text="$t('dataFlow.dataLoading')"
          :data="tableData"
          height="100%"
          style="border: 1px solid #dedee4"
          class="role-table"
          row-key="id"
          border
        >
          <el-table-column
            :label="$t('role.roleName')"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="scope">
              <div>{{ scope.row.name }}</div>
            </template>
          </el-table-column>
          <el-table-column
            :label="$t('role.description')"
            :show-overflow-tooltip="true"
          >
            <template slot-scope="scope">
              <div>{{ scope.row.description }}</div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('role.associatUsers')" width="100">
            <template slot-scope="scope">
              <span>{{ scope.row.userCount }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('role.founder')">
            <template slot-scope="scope">
              <div>
                {{ scope.row.userEmail }}
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('role.defaultRole')" width="90">
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.register_user_default"
                :disabled="!$has('role_edition')"
                @change="changeRowDefault(scope.row)"
              >
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column :label="$t('role.operate')" width="300">
            <template slot-scope="scope">
              <el-button
                type="text"
                v-readonlybtn="'role_edition'"
                :disabled="
                  $disabledByPermission(
                    'role_edition_all_data',
                    scope.row.user_id
                  )
                "
                @click="handleSettingPermissions(scope.row.id, scope.row.name)"
              >
                {{ $t('role.settingPermissions') }}
              </el-button>

              <el-button
                type="text"
                @click="handleAssociatUsers(scope.row.id)"
                :disabled="
                  $disabledByPermission(
                    'role_edition_all_data',
                    scope.row.user_id
                  ) || scope.row.name === 'admin'
                "
                v-readonlybtn="'role_edition'"
              >
                {{ $t('role.associatUsers') }}
              </el-button>
              <el-button
                type="text"
                v-readonlybtn="'role_edition'"
                :disabled="
                  $disabledByPermission(
                    'role_edition_all_data',
                    scope.row.user_id
                  )
                "
                @click="createRole(scope.row.id, scope.row)"
              >
                {{ $t('role.edit') }}
              </el-button>
              <el-button
                type="text"
                @click="handleDelete(scope.row)"
                :disabled="
                  $disabledByPermission(
                    'role_delete_all_data',
                    scope.row.user_id
                  ) || scope.row.name === 'admin'
                "
                v-readonlybtn="'role_delete'"
              >
                {{ $t('role.delete') }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          class="pagination"
          background
          layout="prev, pager, next,sizes,total"
          :page-sizes="[20, 30, 50, 100]"
          :page-size="pagesize"
          :total="totalNum"
          :current-page.sync="currentPage"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        >
        </el-pagination>
      </div>
    </div>
    <!-- 创建角色 -->
    <el-dialog
      :title="$t('role.createRole')"
      :close-on-click-modal="false"
      :visible.sync="dialogFormVisible"
      width="600px"
    >
      <el-form :model="form" ref="form" label-width="115px">
        <el-form-item
          :label="$t('role.roleName')"
          prop="name"
          :rules="[
            { required: true, message: $t('role.role_null'), trigger: 'blur' }
          ]"
        >
          <el-input
            v-model="form.name"
            :placeholder="$t('role.selectRoleName')"
            size="small"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('role.roleDesc')" style="margin-bottom: 10px">
          <el-input
            type="textarea"
            :placeholder="$t('role.selectDesc')"
            v-model="form.description"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('role.defaultRole')">
          <el-switch
            v-model="form.register_user_default"
            inactive-color="#dcdfe6"
            :active-text="
              form.register_user_default ? $t('role.yes') : $t('role.no')
            "
            style="margin-right: 20px"
          ></el-switch>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogFormVisible = false">{{
          $t('message.cancel')
        }}</el-button>
        <el-button size="mini" type="primary" @click="createSave">{{
          $t('message.confirm')
        }}</el-button>
      </div>
    </el-dialog>

    <!-- 关联用户 -->
    <el-dialog
      :title="$t('role.associatUsers')"
      :close-on-click-modal="false"
      :visible.sync="dialogUserVisible"
      width="600px"
    >
      <div class="userBox">
        <el-select
          v-model="roleusers"
          filterable
          multiple
          :placeholder="$t('role.selectUser')"
        >
          <el-option
            v-for="item in userGroup"
            :key="item.id"
            :label="item.email"
            :value="item.id"
          >
          </el-option>
        </el-select>
        <div class="num">
          {{ $t('role.connected') }}: {{ roleusers.length }}
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogUserVisible = false">{{
          $t('message.cancel')
        }}</el-button>
        <el-button size="mini" type="primary" @click="saveUser">{{
          $t('dataForm.submit')
        }}</el-button>
      </span>
    </el-dialog>

    <!-- 删除角色 -->
    <el-dialog
      :title="$t('dataFlow.importantReminder')"
      :close-on-click-modal="false"
      :visible.sync="deleteDialogVisible"
      width="30%"
    >
      <p>
        {{ $t('role.delete_remind') }}
        <span
          @click="delLinkRole(deleteObj.id)"
          style="color: #48b6e2; cursor: pointer"
        >
          {{ deleteObj.name }}</span
        >
        ?
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="deleteDialogVisible = false">{{
          $t('message.cancel')
        }}</el-button>
        <el-button size="mini" type="primary" @click="confirmDelete">
          {{ $t('classification.deleteNode') }}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
// import SubHead from '@/components/SubHead';
import factory from '@/api/factory'
const rolesModel = factory('role')
const usersModel = factory('users')
const roleMappingModel = factory('roleMapping')
export default {
  name: 'Roles',
  // components: { SubHead },
  data() {
    return {
      headTitle: this.$t('role.roleManagement'),
      searchNav: {
        selectedSeachType: '0',
        keyword: ''
      },
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
      form: {
        name: '',
        description: '',
        register_user_default: false
      },
      deleteDialogVisible: false,
      dialogUserVisible: false,
      roleId: '',
      deleteObj: {
        id: '',
        name: ''
      }
    }
  },
  created() {
    this.handleDataApi()
    this.getUserData()
  },
  watch: {
    'searchNav.keyword'() {
      this.handleDataApi()
    },
    'searchNav.selectedSeachType'() {
      this.handleDataApi()
    }
  },
  methods: {
    // 获取角色列表
    async handleDataApi(params) {
      // let { sortBy, descending, page, rowsPerPage } = this.pagination;
      let where = {}
      let order = 'createTime DESC'
      if (this.order) {
        order = this.order
      }

      let searchkw = this.searchNav.keyword
      if (searchkw && this.searchNav.selectedSeachType === '0') {
        where.name = { like: searchkw, options: 'i' }
      } else if (searchkw && this.searchNav.selectedSeachType === '1') {
        where.name = searchkw
      }

      let _params = Object.assign(
        {
          filter: JSON.stringify({
            where: where,
            order: order,
            limit: this.pagesize,
            skip: (this.currentPage - 1) * this.pagesize
          })
        },
        params
      )

      await usersModel.role(_params).then((res) => {
        if (res && res.data) {
          this.tableData = res.data
        }
      })
      await rolesModel.count(_params).then((res) => {
        if (res && res.data) {
          this.totalNum = res.data.count
        }
      })
    },

    // 新建角色(弹窗开关)
    createRole(id, item) {
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
        this.$api('Permissions')
          .get({})
          .then((res) => {
            if (res && res.data && res.data.length) {
              this.permissions = res.data
            }
          })
      }
    },

    // 设置权限
    handleSettingPermissions(id, name) {
      this.$router.push({ name: 'role', query: { id: id, name: name } })
    },

    // 已关联用户
    async handleAssociatUsers(id) {
      this.dialogUserVisible = true
      this.roleId = id
      let _this = this
      _this.roleusers = []
      _this.oldUser = []

      await roleMappingModel
        .get({ 'filter[where][roleId]': id })
        .then((res) => {
          if (res && res.data) {
            res.data.forEach((roleMapping) => {
              if (roleMapping.principalType === 'USER') {
                _this.roleusers.push(roleMapping.principalId)
                _this.oldUser.push(roleMapping)
              }
            })
          }
        })
    },

    // 删除角色
    handleDelete(data) {
      this.deleteObj = {
        id: data.id,
        name: data.name
      }
      this.deleteDialogVisible = true
    },

    // 确认删除角色
    async confirmDelete() {
      rolesModel
        .delete(this.deleteObj.id, this.deleteObj.name)
        .then((res) => {
          if (res && res.data) {
            this.handleDataApi()
            this.$message.success(this.$t('role.delete_success'))
          }
        })
        .catch(() => {
          this.$message.error(this.$t('role.delete_error'))
        })
        .finally(() => {
          this.deleteDialogVisible = false
        })
    },

    // 删除角色权限查看
    delLinkRole(id) {
      this.$router.push({ name: 'role', query: { id } })
    },

    // 创建保存
    createSave() {
      let self = this
      this.$refs.form.validate((valid) => {
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

          rolesModel[method](record)
            .then((res) => {
              if (res && res.data) {
                self.handleDataApi()
                if (method === 'post') {
                  this.permissions.forEach((selectPermission) => {
                    if (
                      selectPermission.type === 'read' &&
                      !selectPermission.isMenu
                    )
                      newRoleMappings.push({
                        principalType: 'PERMISSION',
                        principalId: selectPermission.name,
                        roleId: res.data.id
                      })
                  })
                  self
                    .$api('users')
                    .deletePermissionRoleMapping(res.data.id, {
                      data: { data: newRoleMappings }
                    })
                    .then((res) => {
                      if (res && res.data) {
                        // roleMappingModel.post(newRoleMappings);
                        this.$message.success(this.$t('message.saveOK'))
                      }
                    })
                }
              }
            })
            .catch((e) => {
              if (e.response && e.response.msg) {
                if (e.response.msg.indexOf('already exists')) {
                  this.$message.error(this.$t('role.alreadyExists'))
                } else {
                  this.$message.error(`${e.response.msg}`)
                }
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

    // 获取用户列表
    async getUserData() {
      await usersModel.get({}).then((res) => {
        if (res && res.data) {
          res.data.forEach((item) => {
            if (!item.role) {
              this.userGroup.push(item)
            }
          })
        }
      })
    },

    // 保存用户
    saveUser() {
      let newRoleMappings = []
      this.oldUser.forEach((delRolemapping) => {
        roleMappingModel.delete(delRolemapping.id)
      })
      // _this.oldUser
      this.roleusers.forEach((roleuser) => {
        if (roleuser) {
          newRoleMappings.push({
            principalType: 'USER',
            principalId: roleuser,
            roleId: this.roleId
          })
        }
      })
      roleMappingModel
        .post(newRoleMappings)
        .then((res) => {
          if (res && res.data) {
            res.data.forEach((item) => {
              this.roleusers.push(item.principalId)
            })
            this.handleDataApi()
            this.$message.success(this.$t('message.saveOK'))
          }
        })
        .catch((e) => {
          if (e.response && e.response.msg) {
            if (e.response.msg.indexOf('already exists')) {
              this.$message.error(this.$t('role.alreadyExists'))
            } else {
              this.$message.error(`${e.response.msg}`)
            }
          }
        })
      this.dialogUserVisible = false
    },

    // 重置
    reset(name) {
      if (name === 'reset') {
        this.searchNav = {
          selectedSeachType: '0',
          keyword: ''
        }
      }

      this.handleDataApi()
    },

    // 改变列表默认值val
    changeRowDefault(data) {
      const record = {
        id: data.id,
        name: data.name,
        description: data.description,
        register_user_default: data.register_user_default
      }

      rolesModel.patch(record).then((res) => {
        if (res && res.data) {
          this.handleDataApi()
        }
      })
    },

    // 分页
    handleCurrentChange(cpage) {
      this.currentPage = cpage
      this.handleDataApi()
    },

    // 分页
    handleSizeChange(psize) {
      this.pagesize = psize
      localStorage.setItem('flowPagesize', psize)
      this.handleDataApi()
    }
  }
}
</script>
<style scoped lang="less">
.roles {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  .roles-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    background-color: #fafafa;
    overflow: hidden;
    .mappingTemplate {
      height: 60px;
      line-height: 60px;
      padding-left: 12px;
      font-size: 16px;
      font-weight: bold;
      color: #333;
      box-sizing: border-box;
      border-bottom: 1px solid #dedee4;
      background-color: #fff;
      box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.1);
    }
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 10px;

      .search-bar {
        display: flex;
        align-items: center;
        height: 50px;
        .item {
          margin-right: 10px;
        }
      }
      // .el-button {
      // 	padding: 4px 15px;
      // }
    }
    .table-box {
      flex: 1;
      overflow: hidden;
      padding: 0 10px 10px 10px;
      display: flex;
      flex-direction: column;
      font-size: 12px;
      .role-table {
        flex: 1;
        overflow: hidden;
        .name {
          color: #48b6e2;
          cursor: pointer;
        }
        .name:hover {
          text-decoration: underline;
        }
      }
      .el-button.is-disabled {
        color: #c0c4cc;
      }
      // .el-button--text {
      // 	padding-left: 10px;
      // 	// color: #606266;
      // }
      .el-button + .el-button {
        margin-left: 12px;
      }
      .el-pagination {
        width: 100%;
        padding-top: 10px;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        text-align: right;
        overflow: hidden;
        z-index: 999;
      }
    }
  }
}
</style>
<style lang="less">
.roles {
  .topbar-buttons {
    .el-button {
      font-size: 12px;
      color: #666;
      background-color: #f5f5f5;
    }
  }
  .search-bar {
    .input-with-select {
      .el-select .el-input {
        width: 100px;
      }
    }
  }
  .table-box {
    .role-table {
      color: #333;
      th {
        padding: 2px 0;
        background: #f5f5f5;
      }
      th,
      td {
        &:first-child {
          padding-left: 10px;
        }
      }
    }
    .el-table--border td {
      border-right: 0;
    }
    .el-table--border th {
      border-right: 1px solid #dcdfe6;
    }

    .el-button {
      font-size: 12px;
    }
  }
  .userBox {
    .el-select,
    .el-input {
      width: 100%;
    }
    .num {
      padding-top: 10px;
    }
  }
  .el-dialog__body {
    padding: 30px;
  }
  .dialog-footer {
    .el-button {
      width: 80px;
    }
  }
}
</style>
