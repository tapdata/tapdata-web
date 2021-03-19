<template>
  <section class="data-quality-detail-wrap">
    <TablePage
      ref="table"
      :title="$t('dataQuality.title')"
      :desc="$t('dataQuality.desc')"
      :remoteMethod="getData"
    >
      <!-- 面包屑 -->
      <div slot="header">
        <a 
          class="page-header-title link"  
          @click="$router.push({ name: 'dataQuality' })"
        >
          {{$t('dataQuality.title')}}
        </a>
        /
        <span class="page-header-title">{{ $route.query.source_name }}</span>
        <div class="page-header-desc">{{ $t('dataQuality.desc') }}</div>
      </div>

      <!-- 过滤项 -->
      <div slot="search">
        <ul class="search-bar">
          <li>
            <el-select
              clearable
              size="mini"
              v-model="searchParams.rule"
              :placeholder="'选择违反的质量规则'"
              @input="ruleChange"
            >
              <el-option
                v-for="opt in qualityRules"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              ></el-option>
            </el-select>
          </li>
        </ul>
      </div>

      <!-- 页面操作 -->
      <div slot="operation">
        <el-button
          class="action-btn"
          size="mini"
          @click="filterOpen"
        >
          <i class="iconfont icon-daoru back-btn-icon"/>
          <span>列过滤</span>
        </el-button>

        <el-button
          v-readonlybtn="'new_model_creation'"
          class="action-btn"
          size="mini"
          @click="batchOpen"
        >
          <i class="iconfont icon-daoru back-btn-icon"/>
          <span>批量修改</span>
        </el-button>
      </div>

      <!-- 列表项 -->
      <el-table-column :label="'字段1'" prop="name">
        <template slot-scope="scope">
          {{ scope.row.source ? scope.row.source.name : '' }}
          <div class="gray">{{ scope.row.collection }}</div>
        </template>
      </el-table-column>
      <el-table-column :label="'字段2'" prop="total_docs">
        <template slot-scope="scope">
          {{ scope.row.total_docs }}
        </template>
      </el-table-column>
      <el-table-column :label="'字段3'" prop="violated_docs">
        <template slot-scope="scope">
          <a 
            target="_blank" 
            :class="{ link: scope.row.violated_docs }" 
            @click="violationData(scope.row)"
          >
            {{ scope.row.violated_docs }}
          </a>
        </template>
      </el-table-column>
      <el-table-column :label="'字段4'" prop="violate_percentage">
        <template slot-scope="scope">
          {{ scope.row.total_docs && scope.row.violated_docs
             ? (scope.row.violated_docs / scope.row.total_docs * 100).toFixed(2)
             : 0
          }} %
        </template>
      </el-table-column>
      <el-table-column :label="'字段5'" prop="create_time">
        <template slot-scope="scope">
          {{ $moment(scope.row.create_time).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('dataQuality.actions')">
        <template slot-scope="scope">
          <el-button
            class="btn-text"
            type="text"
            size="small"
            @click="detailVisible = true"
          >
            浏览详情
          </el-button>

          <el-button
            class="btn-text"
            type="text"
            size="small"
            @click="remove(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </TablePage>

    <!-- 批量修改弹框 -->
    <el-dialog
      width="500px"
      :title="'批量修改'"
      :close-on-click-modal="false"
      :visible.sync="batchVisible"
    >
      <FormBuilder ref="form" v-model="batchForm" :config="batchFormConfig" />

      <span slot="footer" class="dialog-footer">
        <el-button 
          size="mini"
          @click="batchVisible = false" 
        >
          {{ $t('message.cancel') }}
        </el-button>

        <el-button 
          size="mini"
          type="primary" 
          @click="batchOk" 
        >
          {{ $t('message.confirm') }}
        </el-button>
      </span>
    </el-dialog>

    <!-- 列过滤弹框 -->
    <el-dialog
      width="520px"
      custom-class="data-quality-detail-filter-dialog"
      :title="'字段过滤'"
      :close-on-click-modal="false"
      :visible.sync="filterVisible"
    >
      <div class="text-rf">
        <el-switch
          active-text="全选"
          v-model="all"
        >
        </el-switch>
      </div>

      <el-table
        :data="filterArr"
        class="filter-table"
      >
        <el-table-column
          prop="date"
          label="字段名"
          width="330"
        >
          <template slot-scope="scope">
            字段名{{scope.row.id}}
          </template>
        </el-table-column>
        <el-table-column
          prop="name"
          label="操作">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.check"
              :active-text="scope.row.check ? '显示' : '不显示'"
            >
            </el-switch>
          </template>
        </el-table-column>
      </el-table>

      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="filterVisible = false">取 消</el-button>
        <el-button size="small" type="primary" @click="filterOk">保 存</el-button>
      </div>
    </el-dialog>

    <!-- 详情弹框 -->
    <el-dialog
      custom-class="data-quality-detail-json-dialog"
      title="业务数据"
      :visible.sync="detailVisible"
    >
      <div class="json-box">
        <Jsonviewer 
          :value="jsonData" 
          :preview-mode="true" 
        />
      </div>
    </el-dialog>

  </section>
</template>

<script>
import TablePage from '@/components/TablePage';
import { toRegExp } from '../../util/util';
import Jsonviewer from 'vue-json-viewer';

export default {
  name: 'DataQuality',

  components: {
    TablePage,
    Jsonviewer
  },

  data () {
    return {
      searchParams: { // 搜索参数
        rule: '', // 所选规则
      },
      qualityRules: [], // 可选的违反规则
      order: 'last_updated DESC', // 默认排序方法
      detailVisible: false, // 是否显示详情弹框
      jsonData: { // 行的详情
        total: 25,
        limit: 10,
        skip: 0,
        links: {
          previous: undefined,
          next: function () {},
        },
        data: [
          {
            id: '5968fcad629fa84ab65a5247',
            firstname: 'Ada',
            lastname: 'Lovelace',
            awards: null,
            known: [
              'mathematics',
              'computing'
            ],
            position: {
              lat: 44.563836,
              lng: 6.495139
            },
            description: `Augusta Ada King, Countess of Lovelace (née Byron; 10 December 1815 – 27 November 1852) was an English mathematician and writer,
            chiefly known for her work on Charles Babbage's proposed mechanical general-purpose computer,
            the Analytical Engine. She was the first to recognise that the machine had applications beyond pure calculation,
            and published the first algorithm intended to be carried out by such a machine.
            As a result, she is sometimes regarded as the first to recognise the full potential of a "computing machine" and the first computer programmer.`,
            bornAt: '1815-12-10T00:00:00.000Z',
            diedAt: '1852-11-27T00:00:00.000Z'
          }, {
            id: '5968fcad629fa84ab65a5246',
            firstname: 'Grace',
            lastname: 'Hopper',
            awards: [
              'Defense Distinguished Service Medal',
              'Legion of Merit',
              'Meritorious Service Medal',
              'American Campaign Medal',
              'World War II Victory Medal',
              'National Defense Service Medal',
              'Armed Forces Reserve Medal',
              'Naval Reserve Medal',
              'Presidential Medal of Freedom'
            ],
            known: null,
            position: {
              lat: 43.614624,
              lng: 3.879995
            },
            description: `Grace Brewster Murray Hopper (née Murray; December 9, 1906 – January 1, 1992)
            was an American computer scientist and United States Navy rear admiral.
            One of the first programmers of the Harvard Mark I computer,
            she was a pioneer of computer programming who invented one of the first compiler related tools.
            She popularized the idea of machine-independent programming languages, which led to the development of COBOL,
            an early high-level programming language still in use today.`,
            bornAt: '1815-12-10T00:00:00.000Z',
            diedAt: '1852-11-27T00:00:00.000Z'
          }
        ]
      },
      batchVisible: false, // 是否显示批量修改弹框
      batchForm: {
        rule: '', // 规则
        content: '', // 修改的内容
      },
      batchFormConfig: {
        items: [
          {
            type: 'select',
            label: '选择违反的质量规则',
            field: 'rule',
            options: [
              { value: 1, label: '规则1' }, 
              { value: 2, label: '规则2' }
            ],
            rules: [
              { required: true, message: '请选择违反的质量规则' }
            ]
          },
          {
            type: 'input',
            label: '输入要修改的内容',
            field: 'content',
            required: true,
            rules: [
              { required: true, message: '请输入修改内容' }
            ]
          }
        ]
      },
      filterVisible: false, // 是否显示字段过滤弹框
      filterArr: [], // 当前所有字段
    }
  },

  computed: {
    // table组件dom实体
    table() {
      return this.$refs.table;
    },
    // 是否全选字段
    all: {
      get() {
        return this.filterArr.filter(v => v.check).length === this.filterArr.length
      },
      set(val) {
        this.filterArr = this.filterArr.map(v => ({
          ...v,
          check: val
        }))
      }
    }
  },

  created() {
    const { collection_name, connection_id } = this.$route.query

    this.$api('modules').getByCollectionName({
      connection_id,
      collection_name
    }).then(({data}) => {
      
      console.log(data)
    })
  },

  mounted() {
    this.filterArr = [{id: 1, check: true},{id: 2, check: true},{id: 3, check: true},{id: 4, check: true}]
  },

  methods: {
    // 获取列表数据
    getData({ page }) { 
      let { current, size } = page;
      let { isFuzzy, keyword } = this.searchParams;
      let where = {}; // 查询条件

      if (keyword && keyword.trim()) {
        let filterObj = isFuzzy ? { like: toRegExp(keyword), options: 'i' } : keyword;
        where.or = [ {'source.name': filterObj }, { collection: filterObj }];
      }

      let filter = {
        order: this.order,
        limit: size,
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
    // 删除行
    remove(item) {
      this.$confirm('是否删除当前行？', this.$t('message.prompt'), {
        type: 'warning',
        closeOnClickModal: false,
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true;
            // this.$api('MetadataInstances')
            //   .delete(item.id)
            //   .then(() => {
            //     this.$message.success(this.$t('message.deleteOK'));
            //     this.table.fetch();
            //     done();
            //   })
            //   .catch(() => {
            //     this.$message.info(this.$t('message.deleteFail'));
            //   })
            //   .finally(() => {
            //     instance.confirmButtonLoading = false;
            //   });
          } else {
            done();
          }
        }
      });
    },
    // 打开批量修改弹框
    batchOpen() {
      this.batchVisible = true
    },
    // 确认提交批量修改表单 
    batchOk() {
      this.$refs.form.validate(valid => {
        if (valid) {
          console.log(this.batchForm)
        }
      })
    },
    // 打开批量过滤弹框
    filterOpen() {
      this.filterVisible = true
    },
    // 确认提交批量过滤表单 
    filterOk() {
      console.log(this.filterArr)
    },
    // 跳转详情页(暂时跳老页面)
    violationData(item){
      if (item.violated_docs ) {
        this.$router.push({ 
          name: 'dataQualityDetail', 
          params: { id: item.id }, 
          query: {
            collection_name: item.collection, 
            connection_id: item.connection_id
          }
        })        
      }
    },
    // 改变规则更新列表
    ruleChange() {

    },
    // 重置表单
    reset(name) {
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

<style lang="less">
  .data-quality-detail-filter-dialog {
    .el-dialog__body {
      padding: 20px;
      .filter-table {
        margin-top: 10px;
        thead tr th{
          background-color: #efefef;
        }
        .el-switch__label {
          font-size: 12px;
        }
      }
    }
  }
  .data-quality-detail-json-dialog {
    .json-box {
      margin-top: -20px;
      .jv-light {
        background-color: #f8f8f8;
      }
    }
  }
</style>

<style lang="less" scoped>
  .data-quality-detail-wrap {
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
    .link {
      cursor: pointer;
      color: #F56C6C;
    }
    .iconfont {
      font-size: 12px;
    }
    .action-btn {
      padding: 7px;
      background-color: #f5f5f5;
    }
  }
</style>
