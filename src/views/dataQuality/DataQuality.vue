<template>
  <section class="data-quality-wrap">
    <TablePage
      ref="table"
      :title="$t('dataQuality.title')"
      :desc="$t('dataQuality.desc')"
      :remoteMethod="getData"
      :classify="{
        authority: 'data_catalog_category_management',
        types: metaType
      }"
    >
      <!-- 过滤项 -->
      <div slot="search">
        <ul class="search-bar">
          <li>
            <el-input
              clearable
              class="input-with-select"
              size="mini"
              suffix-icon="el-icon-search"
              v-model="searchParams.keyword"
              :placeholder="$t('dataQuality.sourceName')"
              @input="table.fetch(1, 800)"
            >
              <el-select style="width: 120px" slot="prepend" v-model="searchParams.isFuzzy" @input="table.fetch(1)">
                <el-option :label="$t('connection.fuzzyQuery')" :value="true"></el-option>
                <el-option :label="$t('connection.PreciseQuery')" :value="false"></el-option>
              </el-select>
            </el-input>
          </li>
          <template>
            <!-- <li>
							<el-button size="mini" type="text" @click="reset()">{{ $t('button.query') }}</el-button>
						</li> -->
            <li>
              <el-button size="mini" type="text" @click="reset('reset')">{{ $t('button.reset') }}</el-button>
            </li>
          </template>
        </ul>
      </div>

      <!-- 操作项 -->
      <div slot="operation" class="operation">
        <el-button @click="countVisible = true" v-readonlybtn="'new_model_creation'" class="btn btn-create" size="mini">
          <i class="iconfont icon-tongji" style="font-size: 12px"></i>
          <span>{{ $t('dataQuality.countTitle') }}</span>
        </el-button>
      </div>

      <!-- 列表项 -->
      <el-table-column :label="$t('dataQuality.sourceName')" prop="name">
        <template slot-scope="scope">
          {{ scope.row.collection }}
          <span v-if="scope.row.asset_desc && scope.row.asset_desc !== scope.row.collection"
            >（{{ scope.row.asset_desc }}）</span
          >
          <div class="gray">
            {{ scope.row.source ? scope.row.source.name : '' }}
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('dataQuality.totalDocs')" prop="total_docs">
        <template slot-scope="scope">
          {{ scope.row.total_docs }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('dataQuality.violatedDocs')" prop="violated_docs">
        <template slot-scope="scope">
          <a target="_blank" :class="{ link: scope.row.violated_docs }" @click="violationData(scope.row)">
            {{ scope.row.violated_docs }}
          </a>
        </template>
      </el-table-column>
      <el-table-column :label="$t('dataQuality.violatePercentage')" prop="violate_percentage">
        <template slot-scope="scope">
          {{
            scope.row.total_docs && scope.row.violated_docs
              ? ((scope.row.violated_docs / scope.row.total_docs) * 100).toFixed(2)
              : 0
          }}
          %
        </template>
      </el-table-column>
      <el-table-column :label="$t('dataQuality.createTime')" prop="create_time">
        <template slot-scope="scope">
          {{ $moment(scope.row.create_time).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
      </el-table-column>
    </TablePage>

    <!-- 重新统计 -->
    <el-dialog
      width="500px"
      :title="$t('dataQuality.countTitle')"
      :close-on-click-modal="false"
      :visible.sync="countVisible"
      @close="countCancel"
    >
      <el-select
        v-model="connection"
        style="width: 100%"
        multiple
        size="mini"
        filterable
        :placeholder="$t('message.placeholderSelect')"
      >
        <el-option v-for="item in connections" :key="item.id" :label="item.name" :value="item.id"> </el-option>
      </el-select>

      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="countCancel">
          {{ $t('message.cancel') }}
        </el-button>

        <el-button size="mini" type="primary" :loading="countLoading" @click="countOk">
          {{ $t('message.confirm') }}
        </el-button>
      </span>
    </el-dialog>
  </section>
</template>

<script>
import TablePage from '@/components/TablePage'
import { toRegExp } from '@/utils/util'

export default {
  name: 'DataQuality',

  components: {
    TablePage
  },

  data() {
    return {
      searchParams: {
        // 搜索参数
        keyword: '', // 关键词
        isFuzzy: true // 是否模糊查询
      },
      order: { last_updated: -1 }, // 默认排序方法
      countVisible: false, // 是否显示重新统计弹框
      connection: [], // 当前选择的重新统计的连接
      connections: [], // 可供选择的重新统计的连接
      countLoading: false // 重新统计确认loading
    }
  },

  computed: {
    // table组件dom实体
    table() {
      return this.$refs.table
    },
    metaType() {
      let metaType = this.searchParams.metaType
      if (metaType) {
        return [metaType]
      } else {
        return this.$route.meta.types || []
      }
    }
  },

  methods: {
    // 获取列表数据
    getData({ page, tags }) {
      let { current, size } = page
      let { isFuzzy, keyword } = this.searchParams
      let where = { violated_docs: { gt: 0 } } // 查询条件

      if (keyword && keyword.trim()) {
        let filterObj = isFuzzy ? { like: toRegExp(keyword), options: 'i' } : keyword
        where.or = [{ 'source.name': filterObj }, { collection: filterObj }]
      }

      // 分类
      if (tags && tags.length) {
        where['listtags.id'] = {
          in: tags
        }
      }

      let filter = {
        order: this.order,
        limit: size,
        skip: (current - 1) * size,
        where
      }

      return Promise.all([
        this.$api('DataQuality').getCount({ filter: JSON.stringify(filter) }),
        this.$api('DataQuality').getList({
          filter: JSON.stringify(filter)
        })
      ]).then(([{ data: countRes }, { data: res }]) => {
        this.table.setCache({
          isFuzzy,
          keyword
        })
        return {
          total: countRes && countRes.length ? countRes[0].count || 0 : 0,
          data: res && res.length ? res : []
        }
      })
    },
    // 跳转详情页(暂时跳老页面)
    violationData(item) {
      if (item.violated_docs) {
        this.$router.push({
          name: 'dataQualityDetail',
          params: {
            id: item._id
          },
          query: {
            collection_name: item.collection,
            asset_desc: item.asset_desc,
            connection_id: item.connection_id,
            source_name: item.source.name
          }
        })
      }
    },
    // 重置表单
    reset(name) {
      if (name === 'reset') {
        this.searchParams = {
          keyword: '',
          isFuzzy: true
        }
      }

      this.table.fetch(1)
    },
    // 获取数据源
    getConnections() {
      this.$api('connections')
        .get({
          filter: {
            fields: {
              name: true,
              id: true
            },
            where: {
              database_type: {
                inq: ['mongodb']
              }
            }
          }
        })
        .then(({ data }) => {
          this.connections = data || []
        })
    },
    // 重新统计弹框确认
    countOk() {
      if (!this.connection || !this.connection.length) {
        this.$message.info(this.$t('dataQuality.connectTip'))
      }
      this.countLoading = true
      this.$api('DataQuality')
        .analyzeByConnId({ ids: this.connection })
        .then(() => {
          this.$message.success(this.$t('dataQuality.countTip'))
          this.countCancel()
        })
        .catch(() => {
          this.countLoading = false
        })
    },
    // 重新统计弹框取消
    countCancel() {
      this.connection = []
      this.countLoading = false
      this.countVisible = false
    }
  },

  created() {
    this.getConnections()
  },

  mounted() {
    // 初始化缓存搜索参数
    this.searchParams = Object.assign(this.searchParams, this.table.getCache())
  }
}
</script>

<style lang="scss">
.data-quality-wrap {
}
</style>

<style lang="scss" scoped>
.data-quality-wrap {
  height: 100%;
  .operation {
    .btn {
      padding: 7px;
      background: #f5f5f5;
    }
  }
  .search-bar {
    display: flex;
    li + li {
      margin-left: 10px;
    }
  }
  .gray {
    color: #bbb;
  }
  .link {
    cursor: pointer;
    color: #f56c6c;
  }
}
</style>
