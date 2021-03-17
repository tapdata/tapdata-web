<template>
  <section class="data-quality-wrap">
    <TablePage
      ref="table"
      :title="$t('dataQuality.title')"
      :desc="$t('dataQuality.desc')"
      :remoteMethod="getData"
    >
      <div slot="search">
        <ul class="search-bar">
          <li>
            <el-input
              clearable
              class="input-with-select"
              size="mini"
              suffix-icon="el-icon-search"
              v-model="searchParams.keyword"
              :placeholder="$t('dataQuality.keywordTip')"
              @input="table.fetch(1, 800)"
            >
              <el-select
                style="width: 120px;"
                slot="prepend"
                v-model="searchParams.isFuzzy"
                @input="table.fetch(1)"
              >
                <el-option :label="$t('connection.fuzzyQuery')" :value="true"></el-option>
                <el-option :label="$t('connection.PreciseQuery')" :value="false"></el-option>
              </el-select>
            </el-input>
          </li>
          <template v-if="searchParams.keyword">
            <li>
              <el-button size="mini" type="text" @click="reset()">{{ $t('button.query') }}</el-button>
            </li>
            <li>
              <el-button size="mini" type="text" @click="reset('reset')">{{
                $t('button.reset')
              }}</el-button>
            </li>
          </template>
        </ul>
      </div>

      <el-table-column :label="$t('dataQuality.sourceName')" prop="name">
        <template slot-scope="scope">
          {{ scope.row.source ? scope.row.source.name : '' }}
          <div class="gray">{{ scope.row.collection }}</div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('dataQuality.totalDocs')" prop="total_docs">
        <template slot-scope="scope">
          {{ scope.row.total_docs }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('dataQuality.violatedDocs')" prop="violated_docs">
        <template slot-scope="scope">
          {{ scope.row.violated_docs }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('dataQuality.violatePercentage')" prop="violate_percentage">
        <template slot-scope="scope">
          {{ scope.row.total_docs && scope.row.violated_docs
             ? (scope.row.violated_docs / scope.row.total_docs * 100).toFixed(2)
             : 0
          }} %
        </template>
      </el-table-column>
      <el-table-column :label="$t('dataQuality.createTime')" prop="create_time">
        <template slot-scope="scope">
          {{ $moment(scope.row.create_time).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('dataQuality.actions')">
        <template slot-scope="scope">
          <el-button
            class="btn-text"
            type="text"
            >
            {{ $t('dataQuality.view') }}
          </el-button>
        </template>
      </el-table-column>
    </TablePage>    
  </section>
</template>

<script>
import TablePage from '@/components/TablePage';
import { toRegExp } from '../../util/util';

export default {
  name: 'DataQuality',

  components: {
    TablePage
  },

  data () {
    return {
      searchParams: { // 搜索参数
        keyword: '',
        isFuzzy: true,
      },
      order: 'last_updated DESC',
    }
  },

  computed: {
    table() {
      return this.$refs.table;
    }
  },

  created () {

  },

  mounted () {
    
  },
  methods: {
    getData({ page }) {
      let { current, size } = page;
      let { isFuzzy, keyword } = this.searchParams;
      let where = {};

      if (keyword && keyword.trim()) {
        let filterObj = isFuzzy ? { like: toRegExp(keyword), options: 'i' } : keyword;
        // where.or = [ {'source.name': filterObj }, { collection: filterObj }];
        where['source.name']='v15 mongo'
      }

      let filter = {
        order: this.order,
        limit: size,
        // fields: fields,
        skip: (current - 1) * size,
        where
      };
      return Promise.all([
        this.$api('DataQuality').count({ where }),
        this.$api('DataQuality').get({
          filter: JSON.stringify(filter)
        })
      ]).then(([countRes, res]) => {
        this.table.setCache({
          isFuzzy,
          keyword
        });
        return {
          total: countRes.data.count,
          data: res.data
        };
      });
    },
    reset(name) { // 重置表单
      if (name === 'reset') {
        this.searchParams = {
          keyword: '',
          isFuzzy: true
        }
      }

      this.table.fetch(1);
    },
  }
}

</script>

<style lang="less" scoped>
  .data-quality-wrap {
    height: 100%;
    .search-bar {
      display: flex;
      li + li {
        margin-left: 10px;
      }
    }
    .gray {
      color: #bbb;
    }
  }
</style>
