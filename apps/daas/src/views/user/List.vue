<script>
import { roleApi, roleMappingsApi, usersApi } from '@tap/api'
import { TablePage } from '@tap/business'

import PageContainer from '@tap/business/src/components/PageContainer.vue'
import { FilterBar } from '@tap/component'
import dayjs from 'dayjs'
import { escapeRegExp } from 'lodash-es'

export default {
  components: {
    PageContainer,
    TablePage,
    FilterBar,
  },
  data() {
    return {
      searchParams: {
        keyword: '',
        isFuzzy: true,
        // time: ''
      },
      showTooltip: false,
      order: 'last_updated DESC',
      list: null,
      multipleSelection: [],
      roleMappding: [],
      createDialogVisible: false,
      activePanel: 'all',
      muneList: [
        { name: this.$t('public_select_option_all'), key: 'all' },
        {
          name: this.$t('user_status_notActivated'),
          key: 'notActivated',
          count: 0,
        },
        {
          name: this.$t('user_status_notVerified'),
          key: 'notVerified',
          count: 0,
        },
        { name: this.$t('user_status_rejected'), key: 'rejected', count: 0 },
      ],
      notActivatedCount: 0,
      notVerifiedCount: 0,
      rejectedCount: 0,
      filterItems: [],
      createForm: {
        username: '',
        email: '',
        password: '',
        roleusers: [],
        status: 'activated',
        accesscode: '',
      },
      createFormConfig: {
        form: {
          labelPosition: 'top',
          labelWidth: '100px',
          size: 'small',
          inlineMessage: true,
        },
        items: [
          {
            type: 'input',
            label: this.$t('user_list_user_name'),
            field: 'username',
            maxlength: 100,
            required: true,
            showWordLimit: true,
          },
          {
            type: 'input',
            label: this.$t('user_form_email'),
            field: 'email',
            required: true,
            maxlength: 100,
            showWordLimit: true,
            mode: 'text',
            rules: [
              {
                required: true,
                validator: (rule, v, callback) => {
                  if (!v || !v.trim()) {
                    return callback(
                      new Error(this.$t('user_form_password_null')),
                    )
                  } else if (
                    !/^[\w.-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z0-9]{2,6}$/i.test(
                      v,
                    )
                  ) {
                    return callback(
                      new Error(this.$t('user_form_email_must_valid')),
                    )
                  } else {
                    return callback()
                  }
                },
              },
            ],
            dependOn: [
              {
                triggerOptions: [
                  {
                    field: 'id',
                    value: undefined,
                  },
                ],
                triggerConfig: {
                  mode: 'form',
                },
              },
            ],
          },
          {
            type: 'input',
            field: 'password',
            label: this.$t('public_connection_form_password'),
            domType: 'password',
            maxlength: 32,
            showPassword: true,
            rules: [
              {
                required: true,
                validator: (rule, v, callback) => {
                  if (this.createForm.id) {
                    return callback()
                  }
                  if (!v || !v.trim()) {
                    return callback(
                      new Error(this.$t('user_form_password_null')),
                    )
                  } else if (v.length < 5 || v.length > 32) {
                    return callback(new Error(this.$t('user_form_pass_hint')))
                  } else if (/[\s\u4E00-\u9FA5]/.test(v)) {
                    return callback(
                      new Error(this.$t('user_form_password_not_cn')),
                    )
                  } else {
                    return callback()
                  }
                },
              },
            ],
          },
          {
            type: 'select',
            label: this.$t('user_form_role'),
            field: 'roleusers',
            multiple: true,
            options: [],
            required: true,
          },
          {
            type: 'select',
            label: this.$t('user_form_status'),
            field: 'status',
            options: [
              {
                label: this.$t('user_status_notVerified'),
                value: 'notVerified',
              },
              {
                label: this.$t('user_status_notActivated'),
                value: 'notActivated',
              },
              { label: this.$t('user_status_activated'), value: 'activated' },
              { label: this.$t('user_status_rejected'), value: 'rejected' },
            ],
            required: true,
          },
        ],
      },
      count1: 0,
      count2: 0,
      userRole: [],
      roleList: [],
    }
  },
  computed: {
    table() {
      return this.$refs.table
    },
  },
  watch: {
    '$route.query': function () {
      this.searchParams = this.$route.query
      this.table.fetch(1)
    },
  },
  created() {
    this.getDbOptions()
    // this.getCount();
    this.getFilterItems()
  },
  methods: {
    // 重置
    reset(name) {
      if (name === 'reset') {
        this.searchParams = {
          keyword: '',
          isFuzzy: true,
        }
      }
      this.table.fetch(1)
    },
    // 获取数据
    getData({ page, tags }) {
      const { current, size } = page
      const { isFuzzy, keyword } = this.searchParams
      const where = {}
      if (keyword && keyword.trim()) {
        const filterObj = isFuzzy
          ? { like: escapeRegExp(keyword), options: 'i' }
          : keyword
        where.or = [{ username: filterObj }, { email: filterObj }]
      }
      if (this.activePanel !== 'all') {
        switch (this.activePanel) {
          case 'notActivated':
            where.emailVerified = true
            where.account_status = 2
            break
          case 'notVerified':
            where.emailVerified = false
            where.account_status = { neq: 0 }
            break
          case 'rejected':
            where.account_status = 0
        }
      }

      if (tags && tags.length) {
        where['listtags.id'] = {
          in: tags,
        }
      }
      const filter = {
        order: this.order,
        limit: size,
        skip: (current - 1) * size,
      }
      if (JSON.stringify(where) !== '{}') {
        filter.where = where
      }
      return usersApi
        .get({
          filter: JSON.stringify(filter),
        })
        .then((data) => {
          const list = data?.items || []
          return {
            total: data?.total,
            data: list.map((item) => {
              if (!item.emailVerified) {
                item.status = 'notVerified'
              } else if (item.account_status === 1) {
                item.status = 'activated'
              } else {
                item.status = 'notActivated'
              }
              if (item.account_status === 0) {
                item.status = 'rejected'
              }
              item.lastUpdatedFmt = item.last_updated
                ? dayjs(item.last_updated).format('YYYY-MM-DD HH:mm:ss')
                : ''
              return item
            }),
          }
        })
    },
    getCount() {
      Promise.all([
        usersApi.count({
          where: JSON.stringify({
            where: { emailVerified: true, account_status: 2 },
          }),
        }),
        usersApi.count({
          where: JSON.stringify({
            where: { emailVerified: false, account_status: { neq: 0 } },
          }),
        }),
        usersApi.count({
          where: JSON.stringify({
            where: { account_status: 0 },
          }),
        }),
      ]).then(([notActivatedCount, notVerifiedCount, rejectedCount]) => {
        this.notActivatedCount = notActivatedCount.count
        this.notVerifiedCount = notVerifiedCount.count
        this.rejectedCount = rejectedCount.count
      })
    },
    // 获取角色下拉值
    getDbOptions() {
      const filter = {
        limit: 500,
        skip: 0,
      }
      roleApi.get({ filter: JSON.stringify(filter) }).then((data) => {
        const items = data?.items || []
        this.roleList = items
        const options = []
        items.forEach((db) => {
          if (db.name !== 'admin') {
            options.push({
              label: db.name,
              value: db.id,
            })
          }
        })
        this.createFormConfig.items[3].options = options
      })
    },
    // taps标签页切换
    handleTapClick() {
      this.table.fetch(1)
    },
    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'last_updated'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
      this.table.fetch(1)
    },
    // 选中数据
    handleSelectionChange(val) {
      this.multipleSelection = val
    },

    // 选择分类
    handleSelectTag() {
      const tagList = {}
      this.multipleSelection.forEach((row) => {
        if (row.listtags && row.listtags.length > 0) {
          tagList[row.listtags[0].id] = {
            value: row.listtags[0].value,
          }
        }
      })
      return tagList
    },
    // 分类设置保存
    handleOperationClassify(listtags) {
      const ids = this.multipleSelection.map((item) => {
        return item.id
      })
      const where = {
        id: {
          inq: ids,
        },
      }
      usersApi.update(where, { listTags: listtags }).then(() => {
        this.table.fetch()
      })
    },
    // 获取角色关联的用户的数据
    getMappingModel(id) {
      const filter = {
        where: {
          principalId: id,
        },
      }
      roleMappingsApi
        .get({
          filter: JSON.stringify(filter),
        })
        .then((data) => {
          const items = data?.items || []
          this.roleMappding = items
          this.createForm.roleusers = items.map((item) => item.roleId)
        })
    },
    // 创建用户弹窗
    openCreateDialog() {
      this.createDialogVisible = true
      //过滤出默认角色register_user_default
      const data = this.roleList.filter((it) => it.register_user_default)
      const roleusers = data.map((it) => it.id) || []
      this.createForm = {
        username: '',
        email: '',
        password: '',
        roleusers,
        status: 'activated',
        accesscode: '',
        emailVerified: true,
        account_status: 1,
      }
      this.createFormConfig.items.find((item) => item.field === 'email').show =
        true
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    },
    // 编辑用户
    edit(item) {
      this.createDialogVisible = true

      this.createFormConfig.items.find((item) => item.field === 'email').show =
        !!item.email

      this.createForm = {
        id: item.id,
        username: item.username,
        email: item.email,
        password: '',
        roleusers: item.roleusers,
        status: item.status ? item.status : '',
        accesscode: item.accesscode,
        emailVerified: item.emailVerified,
        account_status: item.account_status,
      }
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
      //this.getMappingModel(item.id)
    },
    // 保存用户表单
    createNewUser() {
      this.$refs.form.validate((valid) => {
        if (this.createForm.id) {
          this.$refs.form.clearValidate('password')
        }
        if (valid) {
          const params = this.createForm

          if (!params.id) {
            params.source = 'create'
          }

          switch (this.createForm.status) {
            case 'notVerified':
              params.emailVerified = false
              params.account_status = 2
              break
            case 'notActivated':
              params.emailVerified = true
              params.emailVerified_from_frontend = true
              params.account_status = 2
              break
            case 'activated':
              params.emailVerified = true
              params.emailVerified_from_frontend = true
              params.account_status = 1
              break
            case 'rejected':
              params.emailVerified = true
              params.emailVerified_from_frontend = true
              params.account_status = 0
              break
          }
          // delete params.status;
          usersApi[this.createForm.id ? 'patch' : 'post'](params)
            .then((data) => {
              if (data) {
                this.$message.success(this.$t('public_message_save_ok'))
                this.table.fetch()
              }
            })
            .finally(() => {
              this.createDialogVisible = false
            })
        }
      })
    },
    // 删除用户
    remove(item) {
      this.$confirm(this.$t('user_list_del_user', [item.username]), '', {
        type: 'warning',
        closeOnClickModal: false,
        showClose: false,
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            usersApi
              .delete(item.id)
              .then(() => {
                this.$message.success(this.$t('public_message_delete_ok'))
                this.table.fetch()
                done()
              })
              .finally(() => {
                instance.confirmButtonLoading = false
              })
          } else {
            done()
          }
        },
      })
    },
    // 激活
    handleActive(item) {
      const params = {
        id: item.id,
        account_status: 1,
      }
      const successMsg = this.$t('user_list_activetion_success')
      const errorMsg = this.$t('user_list_activetion_error')
      this.$confirm(
        this.$t('user_list_activetion_user', [item.username]),
        this.handleStatus(
          params,
          successMsg,
          errorMsg,
          this.$t('user_list_activation'),
        ),
      )
    },
    // 冻结
    handleFreeze(item) {
      const params = {
        id: item.id,
        account_status: 0,
      }
      const successMsg = this.$t('user_list_freeze_success')
      const errorMsg = this.$t('user_list_freeze_error')
      this.$confirm(
        this.$t('user_list_freeze_user', [item.username]),
        this.handleStatus(
          params,
          successMsg,
          errorMsg,
          this.$t('user_list_freeze'),
        ),
      )
    },
    // 校验
    handleCheck(item) {
      const params = {
        id: item.id,
        emailVerified: true,
      }
      const successMsg = this.$t('user_list_check_success')
      const errorMsg = this.$t('user_list_check_error')
      this.$confirm(
        this.$t('user_list_check_user', [item.username]),
        this.handleStatus(
          params,
          successMsg,
          errorMsg,
          this.$t('user_list_check'),
        ),
      )
    },
    // 改变状态提示
    handleStatus(data, successMsg, errorMsg, confirmButton) {
      return {
        type: 'warning',
        closeOnClickModal: false,
        confirmButtonText: confirmButton,
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            usersApi
              .patch(data)
              .then(() => {
                this.$message.success(successMsg)
                this.table.fetch()
                done()
              })
              // .catch(() => {
              //   this.$message.info(errorMsg)
              // })
              .finally(() => {
                instance.confirmButtonLoading = false
              })
          } else {
            done()
          }
        },
      }
    },
    // 批量操作处理
    handleCommand(command) {
      const ids = this.multipleSelection.map((item) => {
        return item.id
      })
      const where = {
        id: {
          inq: ids,
        },
      }
      const params = {}
      switch (command) {
        case 'activated':
          params.account_status = 1
          break
        case 'rejected':
          params.account_status = 0
          break
        case 'notActivated':
          params.emailVerified = true
          break
      }
      usersApi.update(where, params).then(() => {
        this.table.fetch()
        this.$message.success(this.$t('public_message_operation_success'))
      })
    },
    // 关联用户
    permissionsmethod(data = [], roleusers = []) {
      let html = ''
      if (data && data.length) {
        roleusers.forEach((item) => {
          const roleName = data.find((t) => t.roleId === item)?.role?.name
          if (roleName) {
            html += ` ${roleName},`
          }
        })
      }
      return html.slice(0, Math.max(0, html.lastIndexOf(',')))
    },
    // 重置激活码
    resetAccesCode() {
      const S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).slice(1)
      }
      const NewGuid = function () {
        return `${S4() + S4()}${S4()}${S4()}${S4()}${S4()}${S4()}${S4()}`
      }
      this.createForm.accesscode = NewGuid()
    },
    // 复制激活码
    onCopy() {
      this.showTooltip = true
    },
    getFilterItems() {
      this.filterItems = [
        {
          placeholder: this.$t('user_list_user_name_email'),
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
      <el-button
        v-show="multipleSelection.length > 0"
        v-readonlybtn="'user_category_application'"
        class="btn"
        @click="$refs.table.showClassify(handleSelectTag())"
      >
        <span> {{ $t('public_button_bulk_tag') }}</span>
      </el-button>
      <el-dropdown
        v-show="multipleSelection.length > 0"
        v-readonlybtn="'user_edition'"
        @command="handleCommand($event)"
      >
        <el-button class="btn btn-dropdowm">
          <i class="iconfont icon-piliang back-btn-icon" />
          <span> {{ $t('public_button_bulk_operation') }}</span>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-readonlybtn="'user_edition'"
              command="activated"
              >{{ $t('user_list_bulk_activation') }}</el-dropdown-item
            >
            <el-dropdown-item
              v-readonlybtn="'user_edition'"
              command="rejected"
              >{{ $t('user_list_bulk_freeze') }}</el-dropdown-item
            >
            <el-dropdown-item
              v-readonlybtn="'user_edition'"
              command="notActivated"
              >{{ $t('user_list_bulk_check') }}</el-dropdown-item
            >
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-button
        v-readonlybtn="'new_model_creation'"
        class="btn btn-create"
        type="primary"
        @click="openCreateDialog"
      >
        <span>{{ $t('public_button_create') }}</span>
      </el-button>
    </template>

    <TablePage
      ref="table"
      row-key="id"
      class="user-list"
      :classify="{ authority: 'user_category_management', types: ['user'] }"
      :remote-method="getData"
      @selection-change="handleSelectionChange"
      @classify-submit="handleOperationClassify"
      @sort-change="handleSortTable"
    >
      <template #nav>
        <div class="tapNav">
          <ElTabs v-model="activePanel" @tab-click="handleTapClick">
            <ElTabPane
              v-for="item in muneList"
              :key="item.icon"
              :name="item.key"
            >
              <template #label>
                <span
                  >{{ item.name }}
                  <ElBadge
                    v-if="`${item.key}Count` == 'notActivatedCount'"
                    class="item-badge"
                    :value="notActivatedCount"
                    :max="99"
                    :hidden="!notActivatedCount"
                  />
                  <ElBadge
                    v-if="`${item.key}Count` == 'notVerifiedCount'"
                    class="item-badge"
                    :value="notVerifiedCount"
                    :max="99"
                    :hidden="!notVerifiedCount"
                  />
                  <ElBadge
                    v-if="`${item.key}Count` == 'rejectedCount'"
                    class="item-badge"
                    :value="rejectedCount"
                    :max="99"
                    :hidden="!rejectedCount"
                  />
                </span>
              </template>
            </ElTabPane>
          </ElTabs>
        </div>
      </template>
      <template #search>
        <div class="search-bar">
          <FilterBar
            v-model:value="searchParams"
            :items="filterItems"
            @fetch="table.fetch(1)"
          />
        </div>
      </template>

      <el-table-column type="selection" width="45" :reserve-selection="true" />
      <el-table-column
        :label="$t('user_list_user_name')"
        prop="username"
        sortable="username"
      >
        <template #default="scope">
          <div class="metadata-name">
            <p>{{ scope.row.username }}</p>
            <div class="parent ellipsis">
              {{ scope.row.email }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('user_list_role')" prop="roleMappings">
        <template #default="scope">
          {{ permissionsmethod(scope.row.roleMappings, scope.row.roleusers) }}
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('user_list_change_time')"
        prop="last_updated"
        sortable="last_updated"
      >
        <template #default="scope">
          {{ scope.row.lastUpdatedFmt }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('user_list_source')" prop="source">
        <template #default="scope">
          {{ scope.row.source ? $t(`user_status_${scope.row.source}`) : '' }}
        </template>
      </el-table-column>
      <el-table-column
        :label="$t('user_list_status')"
        prop="status"
        sortable="status"
      >
        <template #default="scope">
          <span
            class="px-2 py-1 rounded-4 inline-block"
            :class="[`status-${scope.row.status}`, 'status']"
          >
            {{ scope.row.status ? $t(`user_status_${scope.row.status}`) : '' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('public_operation')" width="210">
        <template #default="scope">
          <div>
            <el-button
              v-if="['rejected', 'notActivated'].includes(scope.row.status)"
              v-readonlybtn="'user_edition'"
              text
              type="primary"
              :disabled="
                $disabledByPermission(
                  'user_edition_all_data',
                  scope.row.user_id,
                )
              "
              @click="handleActive(scope.row)"
            >
              {{ $t('user_list_activation') }}
            </el-button>
            <ElDivider
              v-if="['rejected', 'notActivated'].includes(scope.row.status)"
              class="mx-1"
              direction="vertical"
            />
            <el-button
              v-if="!['rejected'].includes(scope.row.status)"
              v-readonlybtn="'user_edition'"
              text
              type="primary"
              :disabled="
                $disabledByPermission(
                  'user_edition_all_data',
                  scope.row.user_id,
                )
              "
              @click="handleFreeze(scope.row)"
            >
              {{ $t('user_list_freeze') }}
            </el-button>
            <ElDivider
              v-if="!['rejected'].includes(scope.row.status)"
              class="mx-1"
              direction="vertical"
            />
            <el-button
              v-if="['notVerified'].includes(scope.row.status)"
              v-readonlybtn="'user_edition'"
              text
              type="primary"
              :disabled="
                $disabledByPermission(
                  'user_edition_all_data',
                  scope.row.user_id,
                )
              "
              @click="handleCheck(scope.row)"
              >{{ $t('user_list_check') }}</el-button
            >
            <ElDivider
              v-if="['notVerified'].includes(scope.row.status)"
              class="mx-1"
              direction="vertical"
            />
            <el-button
              v-if="['activated', 'rejected'].includes(scope.row.status)"
              v-readonlybtn="'user_edition'"
              text
              type="primary"
              :disabled="
                $disabledByPermission(
                  'user_edition_all_data',
                  scope.row.user_id,
                )
              "
              @click="edit(scope.row)"
              >{{ $t('public_button_edit') }}</el-button
            >
            <ElDivider
              v-if="['activated', 'rejected'].includes(scope.row.status)"
              class="mx-1"
              direction="vertical"
            />
            <el-button
              v-readonlybtn="'user_delete'"
              text
              type="primary"
              :disabled="
                $disabledByPermission('user_delete_all_data', scope.row.user_id)
              "
              @click="remove(scope.row)"
              >{{ $t('public_button_delete') }}</el-button
            >
          </div>
        </template>
      </el-table-column>
    </TablePage>
    <el-dialog
      v-model="createDialogVisible"
      width="600px"
      :title="
        createForm.id ? $t('user_list_edit_user') : $t('user_list_creat_user')
      "
      :close-on-click-modal="false"
      class="creatDialog"
    >
      <el-form
        ref="form"
        :model="createForm"
        :label-position="createFormConfig.form.labelPosition"
        :label-width="createFormConfig.form.labelWidth"
        :rules="createFormConfig.rules"
      >
        <div class="flex gap-4">
          <!-- 用户名 -->
          <el-form-item
            :label="$t('user_list_user_name')"
            prop="username"
            required
            class="flex-1"
          >
            <el-input
              v-model="createForm.username"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>

          <!-- 邮箱 -->
          <el-form-item
            :label="$t('user_form_email')"
            prop="email"
            required
            class="flex-1"
          >
            <el-input
              v-if="!createForm.id"
              v-model="createForm.email"
              maxlength="100"
              show-word-limit
            />
            <span v-else>{{ createForm.email }}</span>
          </el-form-item>
        </div>

        <!-- 密码 -->
        <el-form-item
          :label="$t('public_connection_form_password')"
          prop="password"
        >
          <el-input
            v-model="createForm.password"
            type="password"
            maxlength="32"
            show-password
          />
        </el-form-item>

        <!-- 角色 -->
        <el-form-item :label="$t('user_form_role')" prop="roleusers" required>
          <el-select v-model="createForm.roleusers" multiple>
            <el-option
              v-for="option in createFormConfig.items[3].options"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>

        <!-- 状态 -->
        <el-form-item :label="$t('user_form_status')" prop="status" required>
          <el-select v-model="createForm.status">
            <el-option
              v-for="option in createFormConfig.items[4].options"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('user_form_activation_code')">
          <div class="flex w-100 align-center gap-3">
            <el-input
              readonly
              class="flex-1"
              :model-value="createForm.accesscode || '-'"
            />
            <el-button text type="primary" @click="resetAccesCode">{{
              $t('public_button_reset')
            }}</el-button>
            <el-tooltip
              v-if="createForm.accesscode"
              :visible="showTooltip"
              placement="top"
              :content="$t('public_message_copied')"
            >
              <span
                v-clipboard:copy="createForm.accesscode"
                v-clipboard:success="onCopy"
                @mouseleave="showTooltip = false"
              >
                <el-button text type="primary">{{
                  $t('public_button_copy')
                }}</el-button>
              </span>
            </el-tooltip>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createDialogVisible = false">{{
            $t('public_button_cancel')
          }}</el-button>
          <el-button type="primary" @click="createNewUser()">{{
            $t('public_button_confirm')
          }}</el-button>
        </span>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<style lang="scss" scoped>
.user-list-wrap {
  .tapNav {
    :deep(.el-tabs__header) {
      margin-bottom: 0;
    }
  }
  .user-list {
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
      &.btn-dropdowm {
        margin-left: 10px;
      }
      &.btn-create {
        margin-left: 10px;
      }
    }
    .metadata-name {
      .name {
        color: map.get($color, primary);
        a {
          color: inherit;
          cursor: pointer;
        }
      }
      .parent {
        color: map.get($color, disable);
      }
    }
  }
}
</style>

<style lang="scss">
.user-list-wrap {
  .table-page-container {
    .table-page-body {
      .table-page-topbar {
        padding-inline: 16px;
        background-color: map.get($bgColor, white);
      }
      .el-table,
      .el-pagination {
        padding-inline: 16px;
        box-sizing: border-box;
        overflow: hidden;
      }
      .table-page-pagination {
        margin-top: 0;
        //padding: 5px 20px;
        background-color: map.get($bgColor, white);
        box-sizing: border-box;
      }
      .status {
        padding: 5px 10px;
        border-radius: 4px;
      }
    }
  }
  .classification {
    margin-left: 16px;
  }
}
</style>
