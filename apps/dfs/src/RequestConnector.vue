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
          <ElTable ref="table" row-key="id" :data="list">
            <el-table-column label="数据源">
              <template #default="{ row }">
                {{ row.metadata.type }}<ElTag class="ml-2" type="info">{{ row.metadata.qcType }}</ElTag>
              </template>
            </el-table-column>
            <el-table-column label="预计使用时间">
              <template #default="{ row }">
                {{ dayMap[row.hoursOfAvailability] || row.hoursOfAvailability }}
              </template>
            </el-table-column>
            <el-table-column label="申请人手机" prop="phone"> </el-table-column>
            <el-table-column label="申请人邮箱" prop="email"> </el-table-column>
            <el-table-column label="状态" prop="status" width="220">
              <template #default="{ row }">
                <ElTag v-if="statusMap[row.status]" :type="statusMap[row.status].type">{{
                  statusMap[row.status].text
                }}</ElTag>
                <span v-else>{{ row.status }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <div class="flex gap-2">
                  <ElLink :disabled="row.status !== 'PENDING'" @click="handleApprove(row)" type="primary">通过</ElLink>
                  <ElLink :disabled="row.status !== 'PENDING'" @click="handleReject(row)" type="danger">拒绝</ElLink>
                </div>
              </template>
            </el-table-column>
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
  </ElContainer>
</template>

<script>
import { TablePage } from '@tap/business'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'RequestConnector',
  components: { TablePage },
  data() {
    return {
      mockUserId: null,
      list: [],
      page: {
        current: 1,
        size: this.defaultPageSize,
        total: 0,
      },
      dayMap: {
        5: '5天',
        180: '半年',
        365: '1年',
      },
      statusMap: {
        PENDING: {
          text: '待审批',
          type: 'primary',
        },
        APPROVED: {
          text: '已通过',
          type: 'success',
        },
        REJECTED: {
          text: '已拒绝',
          type: 'danger',
        },
        EXPIRED: {
          text: '已过期',
          type: 'warning',
        },
      },
    }
  },
  computed: {
    ...mapGetters(['isDomesticStation']),
    ...mapState(['user']),
  },
  created() {
    this.getData()
  },
  methods: {
    async getData(current = this.page.current) {
      let { size } = this.page
      let filter = {
        limit: size,
        skip: size * (current - 1),
        sort: ['createAt desc'],
        where: {},
      }
      const result = await this.$axios.get(`api/tcm/feature/connector`, {
        params: {
          filter: JSON.stringify(filter),
        },
      })
      this.list = result.items
      this.page.total = result.total
    },

    async handleApprove({ id }) {
      await this.$axios.post(`api/tcm/feature/connector/approved`, {
        id,
      })
      this.$message.success('已审批')
      this.getData()
    },
    async handleReject({ id }) {
      await this.$axios.post(`api/tcm/feature/connector/rejected`, {
        id,
      })
      this.$message.success('已拒绝')
      this.getData()
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
  background: map-get($color, submenu);

  .left-aside {
    // border-right: 1px map-get($borderColor, aside) solid;
    background: map-get($color, submenu);

    .el-menu {
      background-color: map-get($color, submenu);
    }

    ::v-deep {
      .el-menu-item,
      .el-submenu__title {
        height: 50px;
        line-height: 50px;

        .v-icon {
          color: map-get($iconFillColor, normal);
        }

        &.is-active,
        &:hover {
          background-color: map-get($color, white);
          color: map-get($color, primary);
          border-radius: 8px;
        }

        &.is-active,
        &:hover {
          ::v-deep .v-icon {
            color: map-get($color, primary);
          }
        }

        .submenu-item {
          padding-left: 12px;
        }
      }
    }

    .product-name {
      padding-left: 20px;
      font-size: 14px;
      font-weight: 700;
      line-height: 60px;
      color: map-get($fontColor, normal);
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

      ::v-deep {
        .el-breadcrumb__inner {
          color: #000;
        }
      }
    }

    ::v-deep {
      .el-breadcrumb__separator {
        color: map-get($fontColor, sub);
      }
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
  background: map-get($color, submenu);
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
      color: map-get($fontColor, light);

      &:hover {
        color: map-get($color, primary);
        background-color: map-get($color, white);
        border-radius: 4px;

        &.icon {
          color: map-get($color, primary);
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
</style>
