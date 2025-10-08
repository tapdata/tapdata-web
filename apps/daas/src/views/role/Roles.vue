<script>
import { permissionsApi, roleApi, roleMappingsApi, usersApi } from '@tap/api'
import PageContainer from '@tap/business/src/components/PageContainer.vue'
import TablePage from '@tap/business/src/components/TablePage.vue'
import { FilterBar } from '@tap/component/src/filter-bar'
import { escapeRegExp } from 'lodash-es'
import ApiAccessDialog from './ApiAccessDialog.vue'

export default {
  components: {
    PageContainer,
    TablePage,
    FilterBar,
    ApiAccessDialog,
  },
  data() {
    return {
      searchParams: {
        keyword: '',
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
        register_user_default: false,
      },
      roleId: '',
      filterItems: [],
    }
  },
  computed: {
    table() {
      return this.$refs.table
    },
  },
  watch: {
    '$route.query': function () {
      this.table.fetch(1)
    },
  },
  created() {
    this.getUserData()
    this.getFilterItems()
  },
  methods: {
    // 获取数据
    getData({ page }) {
      const { current, size } = page
      const { keyword } = this.searchParams
      const where = {}
      if (keyword && keyword.trim()) {
        const filterObj = { like: escapeRegExp(keyword), options: 'i' }
        where.or = [{ name: filterObj }]
      }
      const filter = {
        order: this.order,
        limit: size,
        skip: (current - 1) * size,
        where,
      }
      return usersApi
        .role({
          filter: JSON.stringify(filter),
        })
        .then((data) => {
          return {
            total: data?.total || 0,
            data: data?.items || [],
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
          register_user_default: item.register_user_default,
        }
      } else {
        this.roleId = ''
        this.form = {
          name: '',
          description: '',
          register_user_default: false,
        }
        permissionsApi.get({}).then((data) => {
          if (data && data?.length) {
            this.permissions = data
          }
        })
        // this.table.fetch()
      }
    },
    // 设置权限
    handleSettingPermissions(id, name) {
      this.$router.push({ name: 'role', query: { id, name } })
    },
    // 设置API访问
    handleSettingApi(id, name) {
      this.$refs.apiAccessDialog.open(id, name)
    },
    // 确认删除角色
    handleDelete(item) {
      this.$confirm(this.$t('role_list_delete_remind', [item.name])).then(
        (flag) => {
          if (flag) {
            roleApi.delete(item.id, item.name).then(() => {
              this.table.fetch()
              this.$message.success(this.$t('role_list_delete_success'))
            })
          }
        },
      )
    },
    // 查看删除角色权限
    delLinkRole(id) {
      this.$router.push({ name: 'role', query: { id } })
    },

    // 创建保存
    createSave() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const record = {
            name: this.form.name,
            description: this.form.description,
            register_user_default: this.form.register_user_default,
          }
          const method = this.roleId ? 'patch' : 'post'
          if (this.roleId) {
            record.id = this.roleId
          }
          roleApi[method](record)
            .then((data) => {
              if (data) {
                this.$message.success(this.$t('public_message_save_ok'))
                this.table.fetch()
              }
            })
            .finally(() => {
              this.dialogFormVisible = false
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
      this.roleusers = []
      this.oldUser = []
      const filter = {
        where: {
          roleId: id,
          principalType: 'USER',
        },
        limit: 999,
      }
      await roleMappingsApi
        .get({
          filter: JSON.stringify(filter),
        })
        .then((data) => {
          if (data?.length) {
            this.roleusers = data.map((item) => item.principalId)
            this.oldUser = data
          }
        })
    },

    // 获取用户列表
    async getUserData() {
      await usersApi
        .get({
          filter: JSON.stringify({
            limit: 999,
          }),
        })
        .then((data) => {
          if (data?.items) {
            data?.items.forEach((item) => {
              if (!item.role) {
                this.userGroup.push(item)
              }
            })
          }
        })
    },

    // 保存关联用户
    saveUser() {
      const newRoleMappings = []
      this.oldUser.forEach((delRolemapping) => {
        roleMappingsApi.delete(delRolemapping.id)
      })
      // _this.oldUser
      this.roleusers.forEach((roleuser) => {
        if (roleuser) {
          newRoleMappings.push({
            principalType: 'USER',
            principalId: roleuser,
            roleId: this.roleId,
          })
        }
      })
      roleMappingsApi.saveAll(newRoleMappings).then((data) => {
        if (data) {
          this.roleusers = []
          data.forEach((item) => {
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
        register_user_default: data.register_user_default,
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
          type: 'input',
        },
      ]
    },
  },
}
</script>

<template>
  <PageContainer>
    <template #actions>
      <ElButton
        v-readonlybtn="'role_creation'"
        type="primary"
        class="btn btn-create"
        @click="openCreateDialog()"
      >
        <span>{{ $t('role_list_create') }}</span>
      </ElButton>
    </template>

    <TablePage
      ref="table"
      row-key="id"
      class="roles-list"
      :remote-method="getData"
      @sort-change="handleSortTable"
    >
      <template #search>
        <div class="search-bar">
          <FilterBar
            v-model:value="searchParams"
            :items="filterItems"
            @fetch="table.fetch(1)"
          />
        </div>
      </template>

      <ElTableColumn
        :label="$t('role_list_role_name')"
        :show-overflow-tooltip="true"
      >
        <template #default="scope">
          <div>{{ scope.row.name }}</div>
        </template>
      </ElTableColumn>
      <ElTableColumn
        :label="$t('role_list_description')"
        :show-overflow-tooltip="true"
      >
        <template #default="scope">
          <div>{{ scope.row.description }}</div>
        </template>
      </ElTableColumn>
      <ElTableColumn :label="$t('role_list_associat_users')" width="100">
        <template #default="scope">
          <span>{{ scope.row.userCount }}</span>
        </template>
      </ElTableColumn>
      <ElTableColumn :label="$t('public_creator')">
        <template #default="scope">
          <div>
            {{ scope.row.userEmail }}
          </div>
        </template>
      </ElTableColumn>
      <ElTableColumn :label="$t('role_list_default_role')" width="90">
        <template #default="scope">
          <ElSwitch
            v-model="scope.row.register_user_default"
            :disabled="!$has('role_edition')"
            @change="changeRowDefault(scope.row)"
          />
        </template>
      </ElTableColumn>
      <ElTableColumn :label="$t('public_operation')" width="350">
        <template #default="scope">
          <ElButton
            v-readonlybtn="'role_edition'"
            text
            type="primary"
            :disabled="
              $disabledByPermission('role_edition_all_data', scope.row.user_id)
            "
            @click="handleSettingPermissions(scope.row.id, scope.row.name)"
          >
            {{ $t('role_list_setting_permissions') }}
          </ElButton>
          <ElDivider class="mx-1" direction="vertical" />
          <ElButton
            v-readonlybtn="'role_edition'"
            type="text"
            :disabled="
              $disabledByPermission('role_edition_all_data', scope.row.user_id)
            "
            @click="handleSettingApi(scope.row.id, scope.row.name)"
          >
            {{ $t('role_list_setting_api') }}
          </ElButton>
          <ElDivider class="mx-1" direction="vertical" />
          <ElButton
            v-readonlybtn="'role_edition'"
            text
            type="primary"
            :disabled="
              $disabledByPermission(
                'role_edition_all_data',
                scope.row.user_id,
              ) || scope.row.name === 'admin'
            "
            @click="handleAssociatUsers(scope.row.id)"
          >
            {{ $t('role_list_associat_users') }}
          </ElButton>
          <ElDivider class="mx-1" direction="vertical" />
          <ElButton
            v-readonlybtn="'role_edition'"
            text
            type="primary"
            :disabled="
              $disabledByPermission('role_edition_all_data', scope.row.user_id)
            "
            @click="openCreateDialog(scope.row.id, scope.row)"
          >
            {{ $t('public_button_edit') }}
          </ElButton>
          <ElDivider class="mx-1" direction="vertical" />
          <ElButton
            v-readonlybtn="'role_delete'"
            text
            type="primary"
            :disabled="
              $disabledByPermission(
                'role_delete_all_data',
                scope.row.user_id,
              ) || scope.row.name === 'admin'
            "
            @click="handleDelete(scope.row)"
          >
            {{ $t('public_button_delete') }}
          </ElButton>
        </template>
      </ElTableColumn>
    </TablePage>
    <!-- 创建角色 -->
    <ElDialog
      v-model="dialogFormVisible"
      :title="roleId ? $t('role_list_edit') : $t('role_list_create')"
      :close-on-click-modal="false"
      class="create-role"
      width="600px"
    >
      <ElForm ref="form" :model="form" label-width="120px">
        <ElFormItem
          :label="$t('role_list_role_name')"
          prop="name"
          :rules="[
            { required: true, message: $t('role_null'), trigger: 'blur' },
          ]"
        >
          <ElInput
            v-model="form.name"
            :placeholder="$t('role_list_select_role_name')"
          />
        </ElFormItem>
        <ElFormItem
          :label="$t('role_list_description')"
          prop="description"
          :rules="[
            {
              required: true,
              message: $t('role_form_description'),
              trigger: 'blur',
            },
          ]"
        >
          <ElInput
            v-model="form.description"
            type="textarea"
            autocomplete="off"
            maxlength="200"
            show-word-limit
          />
        </ElFormItem>
        <ElFormItem :label="$t('role_list_default_role')">
          <ElSwitch
            v-model="form.register_user_default"
            inactive-color="#dcdfe6"
            :active-text="
              form.register_user_default
                ? $t('role_form_yes')
                : $t('role_form_no')
            "
            style="margin-right: 20px"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="dialogFormVisible = false"
            >{{ $t('public_button_cancel') }}
          </ElButton>
          <ElButton type="primary" @click="createSave"
            >{{ $t('public_button_confirm') }}
          </ElButton>
        </div>
      </template>
    </ElDialog>

    <!-- 关联用户 -->
    <ElDialog
      v-model="dialogUserVisible"
      :title="$t('role_list_associat_users')"
      :close-on-click-modal="false"
      width="600px"
    >
      <div class="userBox">
        <ElSelect
          v-model="roleusers"
          filterable
          multiple
          :placeholder="$t('role_form_selectUser')"
        >
          <ElOption
            v-for="item in userGroup"
            :key="item.id"
            :label="item.email"
            :value="item.id"
          />
        </ElSelect>
        <div class="num fs-8 mt-2 font-color-sslight">
          {{ $t('role_form_connected') }}: {{ roleusers.length }}
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="dialogUserVisible = false">{{
            $t('public_button_cancel')
          }}</ElButton>
          <ElButton type="primary" @click="saveUser">{{
            $t('public_button_confirm')
          }}</ElButton>
        </span>
      </template>
    </ElDialog>
    <ApiAccessDialog ref="apiAccessDialog" />
  </PageContainer>
</template>

<style lang="scss" scoped>
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
      background: var(--bg-main);

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
