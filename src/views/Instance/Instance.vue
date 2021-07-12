<template>
  <section class="instance-wrapper main-container" v-loading="loading" v-if="$route.name === 'Instance'">
    <div class="main">
      <div class="instance-operation">
        <div class="instance-operation-left">
          <ul>
            <li>
              <ElSelect v-model="searchParams.status" @input="search()">
                <ElOption label="全部状态" value=""></ElOption>
                <ElOption v-for="(value, label) in statusOptions" :key="value" :label="label" :value="value"></ElOption>
              </ElSelect>
            </li>
            <li class="ml-3">
              <ElInput
                width="200"
                v-model="searchParams.keyword"
                placeholder="按ID/实例名称搜索"
                @input="fetch(1, 800)"
              >
                <i slot="prefix" class="iconfont td-icon-sousuo el-input__icon"></i>
              </ElInput>
            </li>
            <li class="ml-3">
              <ElButton plain class="btn-refresh" @click="fetch()">
                <i class="iconfont td-icon-shuaxin"></i>
              </ElButton>
            </li>
          </ul>
        </div>
        <div v-if="VUE_APP_INSTANCE_TEST_BTN === 'true'" class="instance-operation-right">
          <ElButton type="primary" @click="createAgent">
            <i class="iconfont td-icon-dinggou" style="margin-right: 5px;"></i>
            <span>创建 Agent</span>
          </ElButton>
          <ElButton type="primary" @click="toOldPurchase">
            <i class="iconfont td-icon-dinggou mr-1"></i>
            <span>订购托管实例</span>
          </ElButton>
          <ElButton type="primary" @click="toPurchase">
            <i class="iconfont td-icon-dinggou mr-1"></i>
            <span>实例订购</span>
          </ElButton>
        </div>
      </div>
      <El-table class="instance-table  table-border mt-3" height="100%" :data="list" @sort-change="sortChange">
        <ElTableColumn min-width="200px" label="实例ID/名称">
          <template slot-scope="scope">
            <ElLink class="agent-link" type="primary" @click="handleDetails(scope.row)">{{ scope.row.id }}</ElLink>
            <ClipButton :value="scope.row.id"></ClipButton>
            <InlineInput
              style="display: block;"
              :value="scope.row.name"
              @save="updateName($event, scope.row.id)"
            ></InlineInput>
          </template>
        </ElTableColumn>
        <ElTableColumn label="状态" width="120">
          <template slot-scope="scope">
            <StatusTag type="text" :status="scope.row.status"></StatusTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="任务数" width="120">
          <template slot-scope="scope">
            <ElTooltip effect="dark" placement="top" :disabled="!scope.row.metric || !scope.row.metric.runningTaskNum">
              <div slot="content">
                <template v-for="(item, index) in scope.row.metric.dataFlows">
                  <div v-if="index < 3" :key="item.id">任务名称：{{ item.name }}</div>
                </template>
                <ElLink
                  v-if="scope.row.metric.runningTaskNum > 3"
                  class="block text-center"
                  type="primary"
                  @click="toDataFlow(scope.row.tmInfo.agentId)"
                  >查看更多</ElLink
                >
              </div>
              <ElLink type="primary" @click="toDataFlow(scope.row.tmInfo.agentId)">{{
                scope.row.metric ? scope.row.metric.runningTaskNum : 0
              }}</ElLink>
            </ElTooltip>
          </template>
        </ElTableColumn>
        <ElTableColumn label="版本" width="200">
          <template slot-scope="scope">
            <div class="flex align-center">
              <span>{{ scope.row.spec && scope.row.spec.version }}</span>
              <ElTooltip
                v-if="scope.row.spec && version && scope.row.spec.version !== version"
                class="ml-1"
                effect="dark"
                content="点击升级到最新版本"
                placement="top-start"
              >
                <VIcon v-if="false" class="pointer" size="20" @click="showUpgradeDialogFnc(scope.row)">upgrade</VIcon>
                <img class="upgrade-img pointer" :src="upgradeImg" alt="" @click="showUpgradeDialogFnc(scope.row)" />
              </ElTooltip>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="createAt" sortable="custom" label="创建时间" width="150">
          <template slot-scope="scope">
            <span>{{ $moment(scope.row.createAt).format('YYYY-MM-DD HH:mm:ss') }}</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="120" fixed="right">
          <template slot-scope="scope">
            <ElLink type="primary" class="mr-2" :disabled="scope.row.deployDisable" @click="toDeploy">部署</ElLink>
            <ElLink
              type="primary"
              class="mr-2"
              :disabled="scope.row.status !== 'Running'"
              @click="handleStop(scope.row)"
              >停止</ElLink
            >
            <ElLink type="danger" class="mr-2" @click="handleDel(scope.row)" :disabled="scope.row.status !== 'Offline'"
              >删除</ElLink
            >
          </template>
        </ElTableColumn>
        <div class="instance-table__empty" slot="empty">
          <i class="el-icon-folder-opened"></i>
          <span class="ml-1" v-if="!searchParams.keyword && !searchParams.status">暂无数据</span>
          <span v-else> 没有查到符合条件的结果，<ElLink type="primary" @click="reset">返回列表</ElLink> </span>
        </div>
      </El-table>
      <ElPagination
        background
        class="mt-3"
        layout="total, sizes, ->, prev, pager, next, jumper"
        :current-page.sync="page.current"
        :page-sizes="[10, 20, 50, 100]"
        :page-size.sync="page.size"
        :total="page.total"
        @size-change="fetch(1)"
        @current-change="fetch"
      >
      </ElPagination>
      <ElDialog :visible.sync="upgradeDialog" width="450px" top="30vh" center>
        <div class="dialog-content">
          Agent版本有更新，您可以通过以下方式将您的Agent升级到最新版本。升级过程中将无法运行任务。
        </div>
        <div class="dialog-btn flex justify-evenly mt-6">
          <div class="text-center">
            <ElButton type="primary" :disabled="agentStatus !== 'running'" @click="autoUpgradeFnc">自动升级</ElButton>
            <div v-if="agentStatus !== 'running'" class="mt-1 fs-8" @click="manualUpgradeFnc">
              (Agent离线时无法使用自动升级)
            </div>
          </div>
          <div>
            <ElButton type="primary" @click="manualUpgradeFnc">手动升级</ElButton>
          </div>
        </div>
      </ElDialog>
    </div>
  </section>
  <RouterView v-else></RouterView>
</template>

<script>
import { delayTrigger } from '../../util'
import InlineInput from '../../components/InlineInput'
import StatusTag from '../../components/StatusTag'
import ClipButton from '../../components/ClipButton'
import VIcon from '../../components/VIcon'
import { INSTANCE_STATUS_MAP } from '../../const'
import upgradeSvg from '@/assets/icons/svg-colorful/upgrade.svg'
import upgradeImg from '../../assets/image/upgrade.png'

export default {
  components: {
    InlineInput,
    StatusTag,
    ClipButton,
    VIcon
  },
  data() {
    return {
      loading: true,
      searchParams: {
        status: '',
        keyword: ''
      },
      list: [],
      page: {
        current: 0,
        size: 10,
        total: 0
      },
      order: 'createAt desc',
      statusMap: INSTANCE_STATUS_MAP,
      VUE_APP_INSTANCE_TEST_BTN: process.env.VUE_APP_INSTANCE_TEST_BTN,
      upgradeDialog: false,
      selectedRow: {},
      agentStatus: 'stop',
      version: '',
      upgradeList: [], // 升级列表
      upgradeSvg,
      upgradeImg
    }
  },
  computed: {
    statusOptions() {
      let options = {}
      let map = this.statusMap
      let dfsFilter = ['Running', 'Stopped', 'Error']
      for (const key in map) {
        const item = map[key]
        let value = key
        if (options[item.text]) {
          value = options[item.text] + ',' + value
        }
        // dfs只保留 运行中、已停止、异常 Running Stopped Error
        if (dfsFilter.indexOf(value) > -1) {
          options[item.text] = value
        }
      }
      return options
    }
  },
  watch: {
    '$route.query'(query) {
      this.searchParams.status = query.status || ''
      this.fetch(1)
    }
  },
  created() {
    let query = this.$route.query
    this.searchParams.status = query.status || ''
    this.fetch()
  },
  methods: {
    async getVersion(id) {
      return this.$axios.get('api/tcm/config/version/latest/' + id)
    },
    // async getUpgradeList() {
    // 	return await this.$axios.get('api/tcm/getUpgradeList').then(data => {
    // 	})
    // },
    search() {
      let { status } = this.searchParams
      this.$router.replace({
        name: 'Instance',
        query: {
          status
        }
      })
    },
    fetch(pageNum, debounce, hideLoading) {
      delayTrigger(async () => {
        if (!hideLoading) {
          this.loading = true
        }
        let current = pageNum || this.page.current
        let { keyword, status } = this.searchParams
        let where = {}
        if (keyword && keyword.trim()) {
          where.$or = [{ name: { $regex: keyword, $options: 'i' } }, { clusterId: { $regex: keyword, $options: 'i' } }]
        }
        if (status) {
          where.status = {
            $in: status.split(',')
          }
        }
        let filter = {
          where,
          size: this.page.size,
          page: current,
          sort: [this.order]
        }

        // 升级状态
        // let getUpgradeList = await this.getUpgradeList()
        this.$axios
          .get('api/tcm/agent?filter=' + encodeURIComponent(JSON.stringify(filter)))
          .then(async data => {
            let list = data.items || []
            this.list = list.map(item => {
              item.status = item.status === 'Running' ? 'Running' : 'Offline'
              item.updataStatus = ''
              item.deployDisable = item.tmInfo.pingTime || false
              return item
            })
            // 不存在版本号
            if (!this.version) {
              let getVersion = await this.getVersion(this.list[0]?.id)
              this.version = getVersion?.version
            }

            this.page.total = data.total
            if (!list.length && data.total > 0) {
              setTimeout(() => {
                this.fetch(this.page.current - 1)
              }, 0)
            }
          })
          .finally(() => {
            if (!hideLoading) {
              this.loading = false
            }
          })
      }, debounce)
    },
    sortChange({ prop, order }) {
      this.order = `${order ? prop : 'createAt'} ${order === 'ascending' ? 'asc' : 'desc'}`
      this.fetch(1)
    },
    toOldPurchase() {
      this.$confirm('确认后跳转订购托管实例页面', '是否确认订购托管实例？', {
        type: 'warning'
      }).then(res => {
        if (!res) {
          return
        }
        let downloadUrl = window.App.$router.resolve({
          name: 'Purchase'
        })
        window.open(downloadUrl.href, '_blank')
      })
    },
    toPurchase() {
      this.$confirm('确认后跳转下载页面', '是否确认订购实例？', {
        type: 'warning'
      }).then(res => {
        if (!res) {
          return
        }
        let downloadUrl = window.App.$router.resolve({
          name: 'FastDownload'
        })

        window.open(downloadUrl.href, '_blank')
      })
    },
    toDeploy() {
      let downloadUrl = window.App.$router.resolve({
        name: 'FastDownload'
      })

      window.open(downloadUrl.href, '_blank')
    },
    // 停止
    handleStop(row) {
      let flag = false
      if (row.metric?.runningTaskNum) {
        flag = true
      }
      let message = flag
        ? '当前Agent有任务正在运行，强行停止Agent可能会导致任务出现异常，是否要强行停止！'
        : 'Agent停止后将无法再继续运行任务，您需要去Agent安装目录下才能再次启动Agent，是否确认停止？'
      this.$confirm(message, '是否停止', {
        type: 'warning'
      }).then(res => {
        if (res) {
          this.$axios
            .patch('api/tcm/agent/stop', {
              id: row.id
            })
            .then(() => {
              this.$message.success('Agent 已停止')
              this.fetch()
            })
            .catch(() => {
              this.$message.error('Agent 停止失败')
              this.loading = false
            })
        }
      })
    },
    // 删除
    handleDel(row) {
      this.$confirm('删除后该Agent将无法再继续使用，是否确认删除？', '是否删除', {
        type: 'warning'
      }).then(res => {
        if (res) {
          this.$axios
            .patch('api/tcm/agent/delete', {
              id: row.id
            })
            .then(() => {
              this.$message.success('Agent 删除成功')
              this.fetch()
            })
            .catch(() => {
              this.$message.error('Agent 删除失败')
              this.loading = false
            })
        }
      })
    },

    updateName(val, id) {
      this.loading = true
      this.$axios
        .post('api/tcm/agent', {
          id,
          name: val
        })
        .then(() => {
          this.$message.success('修改成功')
          this.fetch()
        })
        .catch(() => {
          this.loading = false
        })
    },
    reset() {
      this.searchParams = {
        status: '',
        keyword: ''
      }
      this.fetch(1)
    },
    toDataFlow(id) {
      this.$router.push({
        name: 'Task',
        query: {
          agentId: id,
          status: 'running'
        }
      })
    },
    showUpgradeDialogFnc(row) {
      // this.upgradeDialog = true
      // this.selectedRow = row
      if (row.metric?.runningTaskNum) {
        this.$alert('检测到您有任务正在运行，请先停止所有任务再进行升级操作!')
      } else {
        this.manualUpgradeFnc(row)
      }
    },
    autoUpgradeFnc() {},
    manualUpgradeFnc(row) {
      let routeUrl = this.$router.resolve({
        name: 'UpgradeVersion',
        query: {
          agentId: row.id
        }
      })
      window.open(routeUrl.href, '_blank')
    },
    // agent详情
    handleDetails(data) {
      this.$router.push({
        name: 'InstanceDetails',
        query: {
          id: data.id
        }
      })
    },
    // 创建Agent
    createAgent() {
      this.$confirm('是否创建 Agent？', '创建 Agent', {
        type: 'warning'
      }).then(res => {
        if (res) {
          this.$axios
            .post('api/tcm/orders', {
              agentType: 'Local'
            })
            .then(() => {
              this.fetch()
            })
            .catch(() => {
              this.$router.replace('/500')
            })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.instance-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  .pointer {
    cursor: pointer;
  }
  .btn-refresh {
    padding: 0;
    height: 32px;
    line-height: 32px;
    width: 32px;
    font-size: 16px;
  }
  .upgrade-img {
    width: 20px;
    height: 20px;
  }
  .main {
    padding: 20px;
    background: #fff;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .instance-operation {
    display: flex;
    justify-content: space-between;
    .instance-operation-left {
      li {
        float: left;
      }
    }
  }
  .instance-table {
    flex: 1;
    overflow: auto;
    border-bottom: none;
    .agent-link {
      // color: unset;
      // cursor: unset;
    }
  }
  .instance-table__empty {
    color: map-get($fontColor, light);
  }
}
::v-deep {
  .el-dropdown-menu__item.dropdown-item--disabled {
    color: map-get($color, disable);
    cursor: default;
    &:hover {
      background: unset;
      color: map-get($color, disable);
    }
  }
  .tooltip--notenter {
    pointer-events: none;
  }
}
</style>
