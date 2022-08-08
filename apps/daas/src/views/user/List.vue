<template>
  <section class="user-list-wrap classify-wrap">
    <TablePage
      ref="table"
      row-key="id"
      class="user-list"
      :classify="{ authority: 'user_category_management', types: ['user'] }"
      :remoteMethod="getData"
      @selection-change="handleSelectionChange"
      @classify-submit="handleOperationClassify"
      @sort-change="handleSortTable"
    >
      <div class="tapNav" slot="nav">
        <ElTabs v-model="activePanel" @tab-click="handleTapClick">
          <ElTabPane v-for="item in muneList" :key="item.icon" :name="item.key">
            <span slot="label"
              >{{ item.name }}
              <ElBadge
                class="item-badge"
                v-if="item.key + 'Count' == 'notActivatedCount'"
                :value="notActivatedCount"
                :max="99"
                :hidden="!notActivatedCount"
              >
              </ElBadge>
              <ElBadge
                class="item-badge"
                v-if="item.key + 'Count' == 'notVerifiedCount'"
                :value="notVerifiedCount"
                :max="99"
                :hidden="!notVerifiedCount"
              >
              </ElBadge>
              <ElBadge
                class="item-badge"
                v-if="item.key + 'Count' == 'rejectedCount'"
                :value="rejectedCount"
                :max="99"
                :hidden="!rejectedCount"
              >
              </ElBadge>
            </span>
          </ElTabPane>
        </ElTabs>
      </div>
      <div slot="search" class="search-bar">
        <FilterBar v-model="searchParams" :items="filterItems" @fetch="table.fetch(1)"> </FilterBar>
      </div>
      <div slot="operation" class="pt-4">
        <el-button
          v-readonlybtn="'user_category_application'"
          size="mini"
          class="btn"
          v-show="multipleSelection.length > 0"
          @click="$refs.table.showClassify(handleSelectTag())"
        >
          <span> {{ $t('button_bulk_tag') }}</span>
        </el-button>
        <el-dropdown
          @command="handleCommand($event)"
          v-readonlybtn="'user_edition'"
          v-show="multipleSelection.length > 0"
        >
          <el-button class="btn btn-dropdowm" size="mini">
            <i class="iconfont icon-piliang back-btn-icon"></i>
            <span> {{ $t('button_bulk_operation') }}</span>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="activated" v-readonlybtn="'user_edition'">{{
              $t('user_list_bulk_activation')
            }}</el-dropdown-item>
            <el-dropdown-item command="rejected" v-readonlybtn="'user_edition'">{{
              $t('user_list_bulk_freeze')
            }}</el-dropdown-item>
            <el-dropdown-item command="notActivated" v-readonlybtn="'user_edition'">{{
              $t('user_list_bulk_check')
            }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <el-button
          v-readonlybtn="'new_model_creation'"
          class="btn btn-create"
          type="primary"
          size="mini"
          @click="openCreateDialog"
        >
          <span>{{ $t('user.creatUser') }}</span>
        </el-button>
      </div>
      <el-table-column type="selection" width="45" :reserve-selection="true"></el-table-column>
      <el-table-column :label="$t('user_list_user_name')" prop="username" sortable="username">
        <template slot-scope="scope">
          <div class="metadata-name">
            <p>{{ scope.row.username }}</p>
            <div class="parent ellipsis">
              {{ scope.row.email }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('user_list_role')" prop="roleMappings">
        <template slot-scope="scope">
          {{ permissionsmethod(scope.row.roleMappings) }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('user_list_change_time')" prop="last_updated" sortable="last_updated">
        <template slot-scope="scope">
          {{ scope.row.lastUpdatedFmt }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('user_list_source')" prop="source">
        <template slot-scope="scope">
          {{ scope.row.source ? $t('user_status_' + scope.row.source) : '' }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('user_list_status')" prop="status" sortable="status">
        <template slot-scope="scope">
          <span :class="['status-' + scope.row.status, 'status']">
            {{ scope.row.status ? $t('user_status_' + scope.row.status) : '' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('column_operation')" width="210">
        <template slot-scope="scope">
          <div>
            <el-button
              v-readonlybtn="'user_edition'"
              size="mini"
              type="text"
              v-if="['rejected', 'notActivated'].includes(scope.row.status)"
              :disabled="$disabledByPermission('user_edition_all_data', scope.row.user_id)"
              @click="handleActive(scope.row)"
            >
              {{ $t('user_list_activation') }}
            </el-button>
            <ElDivider v-if="['rejected', 'notActivated'].includes(scope.row.status)" direction="vertical"></ElDivider>
            <el-button
              v-readonlybtn="'user_edition'"
              size="mini"
              type="text"
              v-if="!['rejected'].includes(scope.row.status)"
              :disabled="$disabledByPermission('user_edition_all_data', scope.row.user_id)"
              @click="handleFreeze(scope.row)"
            >
              {{ $t('user_list_freeze') }}
            </el-button>
            <ElDivider v-if="!['rejected'].includes(scope.row.status)" direction="vertical"></ElDivider>
            <el-button
              v-readonlybtn="'user_edition'"
              size="mini"
              type="text"
              v-if="['notVerified'].includes(scope.row.status)"
              :disabled="$disabledByPermission('user_edition_all_data', scope.row.user_id)"
              @click="handleCheck(scope.row)"
              >{{ $t('user_list_check') }}</el-button
            >
            <ElDivider v-if="['notVerified'].includes(scope.row.status)" direction="vertical"></ElDivider>
            <el-button
              v-readonlybtn="'user_edition'"
              size="mini"
              type="text"
              v-if="['activated', 'rejected'].includes(scope.row.status)"
              :disabled="$disabledByPermission('user_edition_all_data', scope.row.user_id)"
              @click="edit(scope.row)"
              >{{ $t('button_edit') }}</el-button
            >
            <ElDivider v-if="['activated', 'rejected'].includes(scope.row.status)" direction="vertical"></ElDivider>
            <el-button
              v-readonlybtn="'user_delete'"
              size="mini"
              type="text"
              :disabled="$disabledByPermission('user_delete_all_data', scope.row.user_id)"
              @click="remove(scope.row)"
              >{{ $t('button_delete') }}</el-button
            >
          </div>
        </template>
      </el-table-column>
    </TablePage>
    <el-dialog
      width="600px"
      :title="createForm.id ? $t('user_list_edit_user') : $t('user_list_creat_user')"
      :close-on-click-modal="false"
      :visible.sync="createDialogVisible"
      custom-class="creatDialog"
    >
      <FormBuilder ref="form" v-model="createForm" :config="createFormConfig"></FormBuilder>
      <div>
        <span class="label">{{ $t('user_form_activation_code') }}</span>
        <span style="padding-right: 30px">{{ createForm.accesscode || '-' }}</span>
        <el-button @click="resetAccesCode" type="text" size="mini">{{ $t('button_reset') }}</el-button>
        <el-tooltip
          placement="top"
          manual
          :content="$t('dialog_tip_copied')"
          popper-class="copy-tooltip"
          :value="showTooltip"
          v-if="createForm.accesscode"
        >
          <span
            class="pl-4"
            v-clipboard:copy="createForm.accesscode"
            v-clipboard:success="onCopy"
            @mouseleave="showTooltip = false"
          >
            <el-button type="text" size="mini">{{ $t('button_copy') }}</el-button>
          </span>
        </el-tooltip>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="createDialogVisible = false" size="mini">{{ $t('button_cancel') }}</el-button>
        <el-button type="primary" @click="createNewUser()" size="mini">{{ $t('button_confirm') }}</el-button>
      </span>
    </el-dialog>
  </section>
</template>

<script>
import dayjs from 'dayjs'

import { usersApi, roleApi, roleMappingsApi } from '@tap/api'
import { FilterBar } from '@tap/component'
import { TablePage } from '@tap/business'

import { toRegExp } from '../../utils/util'

export default {
  components: {
    TablePage,
    FilterBar
  },
  data() {
    return {
      searchParams: {
        keyword: '',
        isFuzzy: true
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
        { name: this.$t('user_list_all'), key: 'all' },
        { name: this.$t('user_status_notActivated'), key: 'notActivated', count: 0 },
        { name: this.$t('user_status_notVerified'), key: 'notVerified', count: 0 },
        { name: this.$t('user_status_rejected'), key: 'rejected', count: 0 }
      ],
      notActivatedCount: 0,
      notVerifiedCount: 0,
      rejectedCount: 0,
      createForm: {
        username: '',
        email: '',
        password: '',
        roleusers: [],
        status: 'activated',
        accesscode: ''
      },
      createFormConfig: {
        form: {
          labelPosition: 'right',
          labelWidth: '100px',
          size: 'small',
          inlineMessage: true
        },
        items: [
          {
            type: 'input',
            label: this.$t('user_list_user_name'),
            field: 'username',
            maxlength: 100,
            required: true,
            showWordLimit: true
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
                    return callback(new Error(this.$t('user_form_password_null')))
                  } else if (!/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/.test(v)) {
                    // eslint-disable-line
                    return callback(new Error(this.$t('user_form_email_must_valid')))
                  } else {
                    return callback()
                  }
                }
              }
            ],
            dependOn: [
              {
                triggerOptions: [
                  {
                    field: 'id',
                    value: undefined
                  }
                ],
                triggerConfig: {
                  mode: 'form'
                }
              }
            ]
          },
          {
            type: 'input',
            field: 'password',
            label: this.$t('user_form_password'),
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
                    return callback(new Error(this.$t('user_form_password_null')))
                  } else if (v.length < 5 || v.length > 32) {
                    return callback(new Error(this.$t('user_form_pass_hint')))
                  } else if (/[\s\u4E00-\u9FA5]/.test(v)) {
                    return callback(new Error(this.$t('user_form_password_not_cn')))
                  } else {
                    return callback()
                  }
                }
              }
            ]
          },
          {
            type: 'select',
            label: this.$t('user_form_role'),
            field: 'roleusers',
            multiple: true,
            options: [],
            required: true
          },
          {
            type: 'select',
            label: this.$t('user_form_status'),
            field: 'status',
            options: [
              { label: this.$t('user_status_notVerified'), value: 'notVerified' },
              { label: this.$t('user_status_notActivated'), value: 'notActivated' },
              { label: this.$t('user_status_activated'), value: 'activated' },
              { label: this.$t('user_status_rejected'), value: 'rejected' }
            ],
            required: true
          }
        ]
      },
      count1: 0,
      count2: 0,
      userRole: []
    }
  },
  created() {
    this.getDbOptions()
    // this.getCount();
    this.getFilterItems()
  },
  computed: {
    table() {
      return this.$refs.table
    }
  },
  methods: {
    // 重置
    reset(name) {
      if (name === 'reset') {
        this.searchParams = {
          keyword: '',
          isFuzzy: true
        }
      }
      this.table.fetch(1)
    },
    // 获取数据
    getData({ page, tags }) {
      let { current, size } = page
      let { isFuzzy, keyword } = this.searchParams
      let where = {}
      if (keyword && keyword.trim()) {
        let filterObj = isFuzzy ? { like: toRegExp(keyword), options: 'i' } : keyword
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
          in: tags
        }
      }
      let filter = {
        order: this.order,
        limit: size,
        skip: (current - 1) * size
      }
      if (JSON.stringify(where) !== '{}') {
        filter.where = where
      }
      return usersApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(data => {
          this.getCount()
          let list = data?.items || []
          return {
            total: data?.total,
            data: list.map(item => {
              if (!item.emailVerified) {
                item.status = 'notVerified'
              } else {
                if (item.account_status === 1) {
                  item.status = 'activated'
                } else {
                  item.status = 'notActivated'
                }
              }
              if (item.account_status === 0) {
                item.status = 'rejected'
              }
              item.lastUpdatedFmt = dayjs(item.last_updated).format('YYYY-MM-DD HH:mm:ss')
              return item
            })
          }
        })
    },
    getCount() {
      Promise.all([
        usersApi.count({
          where: JSON.stringify({
            where: { emailVerified: true, account_status: 2 }
          })
        }),
        usersApi.count({
          where: JSON.stringify({
            where: { emailVerified: false, account_status: { neq: 0 } }
          })
        }),
        usersApi.count({
          where: JSON.stringify({
            where: { account_status: 0 }
          })
        })
      ]).then(([notActivatedCount, notVerifiedCount, rejectedCount]) => {
        this.notActivatedCount = notActivatedCount.count
        this.notVerifiedCount = notVerifiedCount.count
        this.rejectedCount = rejectedCount.count
      })
    },
    // 获取角色下拉值
    getDbOptions() {
      roleApi.get({}).then(data => {
        let items = data?.items || []
        let options = []
        items.forEach(db => {
          if (db.name !== 'admin') {
            options.push({
              label: db.name,
              value: db.id
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
      let tagList = {}
      this.multipleSelection.forEach(row => {
        if (row.listtags && row.listtags.length > 0) {
          tagList[row.listtags[0].id] = {
            value: row.listtags[0].value
          }
        }
      })
      return tagList
    },
    // 分类设置保存
    handleOperationClassify(listtags) {
      let ids = this.multipleSelection.map(item => {
        return item.id
      })
      let where = {
        id: {
          inq: ids
        }
      }
      usersApi.update(where, { listTags: listtags }).then(() => {
        this.table.fetch()
      })
    },
    // 获取角色关联的用户的数据
    getMappingModel(id) {
      let filter = {
        where: {
          principalId: id
        }
      }
      roleMappingsApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(data => {
          let items = data?.items || []
          this.roleMappding = items
          this.createForm.roleusers = items.map(item => item.roleId)
        })
    },
    // 创建用户弹窗
    openCreateDialog() {
      this.createDialogVisible = true
      let roleusers = []
      let parmas = {
        filter: {
          where: {
            register_user_default: true
          }
        }
      }
      roleApi.get(parmas).then(data => {
        let items = data?.items || []
        items.forEach(item => {
          roleusers.push(item.id)
        })
      })
      this.createForm = {
        username: '',
        email: '',
        password: '',
        roleusers: roleusers,
        status: 'activated',
        accesscode: '',
        emailVerified: true,
        account_status: 1
      }
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    },
    // 编辑用户
    edit(item) {
      this.createDialogVisible = true

      this.createForm = {
        id: item.id,
        username: item.username,
        email: item.email,
        password: '',
        roleusers: item.roleusers,
        status: item.status ? item.status : '',
        accesscode: item.accesscode,
        emailVerified: item.emailVerified,
        account_status: item.account_status
      }
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
      this.getMappingModel(item.id)
    },
    // 保存用户表单
    createNewUser() {
      let that = this

      this.$refs.form.validate(valid => {
        if (that.createForm.id) {
          this.$refs.form.clearValidate('password')
        }
        if (valid) {
          let params = that.createForm

          if (!params.id) {
            params.source = 'create'
          }

          switch (that.createForm.status) {
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
          that
            .$api('users')
            [that.createForm.id ? 'patch' : 'post'](params)
            .then(data => {
              if (data) {
                // 过滤不存在角色
                let roleIdArr = []
                if (data.roleMappings?.length) {
                  that.createFormConfig.items[3].options.filter(item => {
                    if (that.createForm.roleusers.indexOf(item.value) > -1) {
                      roleIdArr.push(item.value)
                    }
                  })
                } else {
                  roleIdArr = that.createForm.roleusers
                }

                // 删除以前角色id
                that.roleMappding.forEach(rolemapping => {
                  that.$api('roleMapping').delete(rolemapping.id)
                })

                let newRoleMappings = []
                roleIdArr.forEach(roleuser => {
                  newRoleMappings.push({
                    principalType: 'USER',
                    principalId: data.id,
                    roleId: roleuser
                  })
                })
                that
                  .$api('roleMapping')
                  .saveAll(newRoleMappings)
                  .then(() => {
                    that.$message.success(this.$t('message_save_ok'))
                  })
                this.table.fetch()
              }
            })
            .finally(() => {
              that.createDialogVisible = false
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
                this.$message.success(this.$t('message.deleteOK'))
                this.table.fetch()
                done()
              })
              .finally(() => {
                instance.confirmButtonLoading = false
              })
          } else {
            done()
          }
        }
      })
    },
    // 激活
    handleActive(item) {
      let params = {
        id: item.id,
        account_status: 1
      }
      let successMsg = this.$t('user_list_activetion_success')
      let errorMsg = this.$t('user_list_activetion_error')
      this.$confirm(
        this.$t('user_list_activetion_user', [item.username]),
        this.handleStatus(params, successMsg, errorMsg, this.$t('user_list_activation'))
      )
    },
    // 冻结
    handleFreeze(item) {
      let params = {
        id: item.id,
        account_status: 0
      }
      let successMsg = this.$t('user_list_freeze_success')
      let errorMsg = this.$t('user_list_freeze_error')
      this.$confirm(
        this.$t('user_list_freeze_user', [item.username]),
        this.handleStatus(params, successMsg, errorMsg, this.$t('user_list_freeze'))
      )
    },
    // 校验
    handleCheck(item) {
      let params = {
        id: item.id,
        emailVerified: true
      }
      let successMsg = this.$t('user_list_check_success')
      let errorMsg = this.$t('user_list_check_error')
      this.$confirm(
        this.$t('user_list_check_user', [item.username]),
        this.handleStatus(params, successMsg, errorMsg, this.$t('user_list_check'))
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
        }
      }
    },
    // 批量操作处理
    handleCommand(command) {
      let ids = this.multipleSelection.map(item => {
        return item.id
      })
      let where = {
        id: {
          inq: ids
        }
      }
      let params = {}
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
        this.$message.success(this.$t('message_operation_succuess'))
      })
    },
    // 关联用户
    permissionsmethod(data) {
      let html = ''
      if (data && data.length) {
        data.forEach(item => {
          if (item.role && item.role.name) {
            html += ' ' + item.role.name + ','
          }
        })
      }
      return html.substring(0, html.lastIndexOf(','))
    },
    // 重置激活码
    resetAccesCode() {
      const S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
      }
      const NewGuid = function () {
        return S4() + S4() + '' + S4() + '' + S4() + '' + S4() + '' + S4() + S4() + S4()
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
          type: 'input'
        }
      ]
    }
  }
}
</script>
<style lang="scss" scoped>
.user-list-wrap {
  .tapNav {
    height: 28px;
    ::v-deep {
      .el-tabs__nav-scroll {
        padding-left: 20px;
      }
    }
    // background-color: rgba(239, 241, 244, 100);
    // .mune {
    //   display: inline-block;
    //   height: 28px;
    //   line-height: 25px;
    //   font-size: 12px;
    //   // border-radius: 0px 3px 0px 0px;
    //   // background-color: rgba(244, 245, 247, 100);
    //   // box-shadow: 0 -1px 10px 0px rgba(0, 0, 0, 0.15);
    //   li {
    //     float: left;
    //     width: 100px;
    //     height: 28px;
    //     color: map-get($fontColor, light);
    //     cursor: pointer;
    //     text-align: center;
    //     border-right: 1px solid #dedee4;

    //     &:last-child {
    //       border-right: 0;
    //     }
    //   }
    //   li.active {
    //     height: 29px;
    //     border-radius: 3px 3px 0px 0px;
    //     background-color: map-get($bgColor, white);
    //     border-right: 0;
    //     border-left: 0;
    //     // box-shadow: 1px -1px 3px 0px rgba(0, 0, 0, 0.15);
    //   }
    // }
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
      padding: 7px;
      i.iconfont {
        font-size: 12px;
      }
      &.btn-dropdowm {
        margin-left: 10px;
      }
      &.btn-create {
        margin-left: 10px;
      }
    }
    .metadata-name {
      .name {
        color: map-get($color, primary);
        a {
          color: inherit;
          cursor: pointer;
        }
      }
      .parent {
        color: map-get($color, disable);
      }
    }
  }
}
</style>
<style lang="scss">
.user-list-wrap {
  .table-page-container {
    .table-page-body {
      box-shadow: 0 7px 15px -10px rgba(0, 0, 0, 0.1);
      .table-page-topbar {
        padding: 20px 20px 0;
        background-color: map-get($bgColor, white);
        .search-bar {
          padding-top: 10px;
        }
      }
      .el-table {
        padding: 0 20px;
        box-sizing: border-box;
        overflow: hidden;
      }
      .table-page-pagination {
        margin-top: 0;
        padding: 5px 20px;
        background-color: map-get($bgColor, white);
        box-sizing: border-box;
      }
      .status {
        padding: 5px 10px;
        border-radius: 4px;
      }
    }
  }
}
.creatDialog {
  .el-dialog__body {
    padding: 30px;
    .el-form {
      .el-form-item {
        // margin-bottom: 22px;
        .el-form-item__label {
          text-align: left;
        }
        // .el-form-item__error {
        //   line-height: 12px;
        // }
      }
    }
    .label {
      display: inline-block;
      width: 100px;
      padding-right: 12px;
      text-align: left;
      font-size: 12px;
      box-sizing: border-box;
    }
  }
}
// .user-confirm {
//   width: 500px;
//   padding-bottom: 20px;
//   .el-message-box__content {
//     padding: 20px 30px;
//   }
//   .delConfirmbtn {
//     background-color: #f56c6c;
//     border: 1px solid #f56c6c;
//   }
// }
</style>
