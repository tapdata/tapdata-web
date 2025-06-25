<template>
  <ElContainer class="layout-wrap">
    <!-- 头部导航 -->
    <ElHeader class="layout-header dfs-header__body" :class="{ isMockUser: mockUserId }">
      <ElLink class="logo" href="/">
        <img src="./assets/image/logo.svg" alt="" />
      </ElLink>
      <div class="dfs-header__button button-bar pr-4 fs-7 flex gap-4 align-center">
        <div class="menu-user rounded-4">
          <div class="username flex align-items-center">
            <img
              v-if="user.avatar"
              :src="user.avatar"
              alt=""
              class="mr-2"
              style="width: 30px; height: 30px; border-radius: 50%"
            />
            <VIcon v-else class="mr-2" size="20">account</VIcon>
            <span>{{ user.username || user.nickname || user.phone || user.email }}</span>
          </div>
        </div>
      </div>
    </ElHeader>
    <ElContainer direction="vertical" class="layout-main position-relative">
      <ElMain class="main rounded-lg">
        <div class="g-panel-container flex-fill overflow-x-hidden flex flex-column">
          <FilterBar
            v-model="searchParams"
            class="mb-3 flex flex-wrap align-center"
            :items="filterItems"
            :changeRoute="false"
            @fetch="lazyLoadData(1)"
          />

          <ElTable
            ref="table"
            row-key="id"
            :data="list"
            height="100%"
            v-loading="loading"
            :default-sort="sort"
            @sort-change="handleSortTable"
          >
            <el-table-column :label="$t('packages_business_connection_form_data_source')">
              <template #default="{ row }">
                {{ row.metadata.type }}
                <ElTag class="ml-2" type="info">{{ row.metadata.qcType }}</ElTag>
              </template>
            </el-table-column>
            <el-table-column
              :label="$t('dfs_agent_download_subscriptionmodeldialog_zhuyaoshiyongchang')"
              prop="summary"
            >
            </el-table-column>
            <el-table-column :label="$t('packages_business_request_connector_use_time')">
              <template #default="{ row }">
                {{ dayMap[row.hoursOfAvailability] || row.hoursOfAvailability }}
              </template>
            </el-table-column>
            <el-table-column :label="$t('dfs_apply_user')" prop="createUser"></el-table-column>
            <el-table-column :label="$t('dfs_user_contactus_lianxifangshi')" prop="phone">
              <template #default="{ row }">
                {{ row.phone || row.email }}
              </template>
            </el-table-column>
            <el-table-column :label="$t('dfs_apply_time')" prop="submitTime" sortable="custom"></el-table-column>
            <el-table-column :label="$t('dfs_apply_auditor')" prop="reviewer"></el-table-column>
            <el-table-column
              :label="$t('dfs_apply_audit_time')"
              prop="approvalTime"
              sortable="custom"
            ></el-table-column>
            <el-table-column :label="$t('public_status')" prop="status" width="120">
              <template #default="{ row }">
                <ElTag v-if="statusMap[row.status]" :type="statusMap[row.status].type"
                  >{{ statusMap[row.status].text }}
                </ElTag>
                <span v-else>{{ row.status }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="$t('public_operation')" width="200">
              <template #default="{ row }">
                <div class="flex gap-2">
                  <ElLink @click="handleApprove(row, $event)" :disabled="row.status !== 'PENDING'" type="primary"
                    >{{ $t('dfs_apply_pass') }}
                  </ElLink>
                  <ElLink :disabled="row.status !== 'PENDING'" @click="handleReject(row, $event)" type="danger"
                    >{{ $t('dfs_apply_reject') }}
                  </ElLink>
                  <ElLink @click="openRemark(row)" type="primary">{{ $t('dfs_apply_comment') }}</ElLink>
                </div>
              </template>
            </el-table-column>

            <template #empty>
              <div v-if="searchParams.status === 'PENDING'" class="flex flex-column gap-3 lh-base">
                👍 {{ $t('dfs_all_approvals_completed') }}
                <ElLink @click="handleViewAll" type="primary">{{ $t('public_view_all') }}</ElLink>
              </div>
              <span v-else>{{ $t('public_data_no_data') }}</span>
            </template>
          </ElTable>
          <el-pagination
            background
            class="table-page-pagination mt-3"
            layout="->,total, sizes,  prev, pager, next, jumper"
            v-model:current-page="page.current"
            :page-sizes="[10, 20, 50, 100]"
            v-model:page-size="page.size"
            :total="page.total"
            @size-change="getData(1)"
            @current-change="getData"
          >
          </el-pagination>
        </div>
      </ElMain>
    </ElContainer>

    <ElDialog
      :title="$t('dfs_apply_comment')"
      :model-value="dialog.visible"
      :close-on-click-modal="false"
      @update:model-value="dialog.visible = $event"
      @close="handleClose"
      @closed="afterClose"
      :append-to-body="true"
      width="520px"
    >
      <el-timeline>
        <el-timeline-item v-for="(item, i) in dialog.list" :key="i" :timestamp="item.datetime" placement="top">
          <el-card shadow="hover">
            <h4 class="text-prewrap">{{ item.remark }}</h4>
            <p class="mt-3 font-color-sslight" style="font-size: 13px">{{ item.amUser }}</p>
          </el-card>
          <IconButton @click="handleDeleteComment(item, i)" class="timeline-btn position-absolute end-0" sm
            >delete</IconButton
          >
        </el-timeline-item>
      </el-timeline>
      <div class="">
        <ElInput v-model="dialog.remark" :placeholder="$t('dfs_apply_comment_placeholder')" type="textarea"></ElInput>
      </div>

      <template #footer>
        <el-button @click="handleClose">{{ $t('public_button_cancel') }}</el-button>
        <el-button type="primary" :loading="dialog.saving" @click="handleSubmit">{{
          $t('public_button_submit')
        }}</el-button>
      </template>
    </ElDialog>
  </ElContainer>
</template>

<script>
import { FilterBar, IconButton } from '@tap/component'
import { mapGetters, mapState } from 'vuex'
import dayjs from 'dayjs'
import i18n from '@/i18n'
import { escapeRegExp, debounce } from 'lodash-es'

export default {
  name: 'RequestConnector',
  components: { FilterBar, IconButton },
  data() {
    const statusMap = {
      PENDING: {
        text: i18n.t('dfs_status_to_be_approved'),
        type: 'primary',
      },
      APPROVED: {
        text: i18n.t('dfs_status_approved'),
        type: 'success',
      },
      REJECTED: {
        text: i18n.t('dfs_status_rejected'),
        type: 'danger',
      },
      EXPIRED: {
        text: i18n.t('dfs_status_expired'),
        type: 'warning',
      },
    }
    const statusOptions = Object.keys(statusMap).map((key) => {
      return {
        value: key,
        label: statusMap[key].text,
      }
    })
    return {
      lazyLoadData: null,
      loading: false,
      mockUserId: null,
      list: [],
      page: {
        current: 1,
        size: 20,
        total: 0,
      },
      order: 'submitTime DESC',
      sort: { prop: 'submitTime', order: 'descending' },
      dayMap: {
        5: i18n.t('packages_business_request_connector_use_time_option1'),
        180: i18n.t('packages_business_request_connector_use_time_option2'),
        365: i18n.t('packages_business_request_connector_use_time_option3'),
      },
      statusMap,

      searchParams: {
        status: 'PENDING',
      },

      filterItems: [
        {
          label: this.$t('public_status'),
          key: 'status',
          border: true,
          type: 'select-inner',
          items: statusOptions,
          debounce: 0,
        },
        {
          placeholder: i18n.t('dfs_apply_user') + '/' + i18n.t('dfs_user_contactus_lianxifangshi'),
          key: 'createUser',
          type: 'input',
          width: '240px',
        },
      ],
      dialog: {
        remark: '',
        list: [],
        visible: false,
        saving: false,
        callback: null,
      },
    }
  },
  watch: {
    searchParams: {
      deep: true,
      handler() {
        this.lazyLoadData(1)
      },
    },
  },
  computed: {
    ...mapGetters(['isDomesticStation']),
    ...mapState(['user']),
  },
  created() {
    this.getData()
    this.lazyLoadData = debounce(this.getData, 200)
  },
  methods: {
    async getData(current = this.page.current) {
      let { size } = this.page
      let { createUser, status } = this.searchParams
      let filter = {
        sort: [this.getOrder()],
        limit: size,
        skip: size * (current - 1),
        where: {
          status,
        },
      }

      createUser = createUser?.trim()
      if (createUser) {
        createUser = escapeRegExp(createUser)
        filter.where.$or = [
          { createUser: { $regex: createUser, $options: 'i' } },
          { phone: { $regex: createUser, $options: 'i' } },
          { email: { $regex: createUser, $options: 'i' } },
        ]
      }

      this.loading = true
      const result = await this.$axios.get(`api/tcm/feature/connector`, {
        params: {
          filter: JSON.stringify(filter),
        },
      })
      this.loading = false
      this.list = result.items.map((item) => {
        item.submitTime = item.submitTime ? dayjs(item.submitTime).format('YYYY-MM-DD HH:mm:ss') : '-'
        item.approvalTime = item.approvalTime ? dayjs(item.approvalTime).format('YYYY-MM-DD HH:mm:ss') : '-'
        item.reviewer = item.reviewer || '-'

        if (item.returnVisits) {
          item.returnVisits.forEach((v) => {
            v.datetime = v.datetime ? dayjs(v.datetime).format('YYYY-MM-DD HH:mm:ss') : '-'
          })
        }

        return item
      })
      this.page.total = result.total
    },

    async handleApprove(row, ev) {
      await this.handleOpen(row)

      await this.$axios
        .post(`api/tcm/feature/connector/approved`, {
          id: row.id,
          remark: this.dialog.remark?.trim(),
        })
        .finally(() => {
          this.dialog.saving = false
        })

      this.$message.success(this.$t('dfs_status_approved'))
      this.handleClose()
      this.getData()
    },
    async handleReject(row) {
      await this.handleOpen(row)
      await this.$axios
        .post(`api/tcm/feature/connector/rejected`, {
          id: row.id,
          remark: this.dialog.remark?.trim(),
        })
        .finally(() => {
          this.dialog.saving = false
        })

      this.$message.success(this.$t('dfs_status_rejected'))
      this.handleClose()
      this.getData()
    },
    getOrder() {
      const { order, prop } = this.sort
      return `${order ? prop : 'submitTime'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
    },
    handleSortTable({ order, prop }) {
      Object.assign(this.sort, { order, prop })
      this.getData(1)
    },
    async handleOpen(row) {
      this.dialog.visible = true
      this.dialog.rowId = row.id
      this.dialog.list = row.returnVisits || []
      await new Promise((resolve) => {
        this.dialog.callback = resolve
      })
    },
    async openRemark(row) {
      await this.handleOpen(row)
      await this.$axios
        .patch(`api/tcm/feature/connector/${row.id}`, {
          remark: this.dialog.remark?.trim(),
        })
        .finally(() => {
          this.dialog.saving = false
        })
      this.handleClose()
      this.getData()
    },
    handleClose() {
      this.dialog.visible = false
      this.dialog.saving = false
      this.dialog.remark = ''
      this.dialog.callback = null
      this.dialog.rowId = null
    },
    afterClose() {},
    handleSubmit() {
      this.dialog.saving = true
      this.dialog.callback()
    },
    async handleDeleteComment(item, index) {
      this.commentLoading = true
      await this.$axios.delete(`api/tcm/feature/connector/${this.dialog.rowId}/${item.id}`)
      this.commentLoading = false
      this.$message.success(this.$t('public_status_deleted'))
      this.dialog.list.splice(index, 1)
    },
    handleViewAll() {
      this.searchParams.status = undefined
    },
  },
}
</script>

<style lang="scss" scoped>
.layout-menu {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 90%;
}

.layout-main {
  padding: 0 16px 16px 16px;
}

.layout-wrap {
  height: 100%;
  word-wrap: break-word;
  word-break: break-word;
  background: var(--color-submenu);

  .left-aside {
    // border-right: 1px var(--border-aside) solid;
    background: var(--color-submenu);

    .el-menu {
      background-color: var(--color-submenu);
    }

    :deep(.el-menu-item),
    :deep(.el-submenu__title) {
      height: 50px;
      line-height: 50px;

      .v-icon {
        color: var(--icon-n2);
      }

      &.is-active,
      &:hover {
        background-color: var(--color-white);
        color: var(--color-primary);
        border-radius: 8px;
      }

      &.is-active,
      &:hover {
        :deep(.v-icon) {
          color: var(--color-primary);
        }
      }

      .submenu-item {
        padding-left: 12px;
      }
    }

    .product-name {
      padding-left: 20px;
      font-size: 14px;
      font-weight: 700;
      line-height: 60px;
      color: var(--text-normal);
    }
  }

  .header {
    display: flex;
    align-items: center;
    font-size: 14px;
  }

  .main {
    display: flex;
    flex-direction: column;
    flex-basis: 0%;
    margin: 0;
    padding: 0;
    //background: rgba(239, 241, 244, 1);
  }

  .breadcrumb {
    padding: 24px 0 24px 24px;
    //height: 40px;
    box-sizing: border-box;

    &.one-breadcrumb {
      font-size: 18px;

      :deep(.el-breadcrumb__inner) {
        color: #000;
      }
    }

    :deep(.el-breadcrumb__separator) {
      color: var(--text-light);
    }
  }

  .btn-back {
    padding: 0;
    width: 24px;
    height: 24px;
    font-size: 12px;
  }

  .el-menu-item.is-active .agent-warning-icon {
    display: none;
  }
}
</style>
<style lang="scss" scoped>
.isMockUser {
  background: red !important;
}

.discount-hot-icon {
  color: #ff7d00;
  right: -12px;
  top: -12px;
  font-size: 24px;
}

.dfs-header {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 52px !important;
  padding: 0 7px;
  background: var(--color-submenu);
  box-sizing: border-box;

  .current {
    font-weight: 400;
    font-size: 10px;
    line-height: 14px;
    border: 1px solid rgba(255, 255, 255, 0.45);
    border-radius: 2px;
    padding: 4px;
  }

  .pointer {
    cursor: pointer;
  }

  .logo {
    display: block;
    width: 177px;
    height: 30px;
    margin-left: -12px;

    img {
      display: block;
      height: 100%;
      width: 100%;
      object-fit: contain;
    }
  }

  .button-bar {
    display: flex;
    align-items: center;

    .command-item {
      padding: 4px 8px;
      cursor: pointer;
      color: var(--text-light);

      &:hover {
        color: var(--color-primary);
        background-color: var(--color-white);
        border-radius: 4px;

        &.icon {
          color: var(--color-primary);
        }
      }
    }

    .agent-status {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-right: 5px;
      padding: 0 15px 0 10px;
      height: 24px;
      line-height: 24px;
      color: #fff;
      font-size: 12px;
      border-radius: 20px;
      cursor: pointer;
      background-color: rgba(255, 255, 255, 0.1);

      i.status-color {
        display: inline-block;
        width: 12px;
        height: 12px;
        margin-right: 5px;
        vertical-align: middle;
        border-radius: 50%;
      }
    }

    .btn-create {
      margin-right: 20px;
    }

    .btn {
      margin-left: 8px;
      color: #999;
      cursor: pointer;

      i {
        display: inline-block;
        line-height: 28px;
        text-align: center;
        height: 28px;
        width: 28px;
        font-size: 18px;
      }

      &:hover {
        color: #fff;
      }
    }

    .menu-user {
      .menu-button {
        color: rgba(204, 204, 204, 1);
        background: rgba(85, 85, 85, 1);
        border: none;
      }
    }

    .img {
      width: 17px;
      height: 17px;
    }
  }
}

.dfs-header__body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 52px !important;
}

.dfs-header__dialog {
  .fixed-novice-guide-dialog {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    padding-top: 30vh;
    overflow: auto;
    transform: scale(0);
    transition: transform 0.5s;
    transform-origin: top right;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 3004;
    box-sizing: border-box;

    &.active {
      transform: scale(1);
    }

    .guide-mark {
      img {
        width: 67px;
        height: 67px;
      }
    }

    .guide-operation {
      img {
        width: 195px;
        height: 56px;
        cursor: pointer;
      }
    }

    .no-show-checkbox {
      top: 30px;
      right: 0;
    }
  }
}

.timeline-btn {
  top: -2px;
  visibility: hidden;
  opacity: 0;
  transition:
    0.3s cubic-bezier(0.25, 0.8, 0.5, 1),
    visibility 0s;
}

.el-timeline-item:hover .timeline-btn {
  opacity: 1;
  visibility: visible;
}
</style>
