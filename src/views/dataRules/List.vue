<template>
  <section class="dataRule-list-wrap">
    <TablePage
      ref="table"
      row-key="id"
      class="dataRule-list"
      :title="$t('app.menu.' + $route.name)"
      :remoteMethod="getData"
      @sort-change="handleSortTable"
    >
      <div slot="search">
        <ul class="search-bar">
          <li>
            <el-input
              clearable
              class="input-with-select"
              size="mini"
              v-model="searchParams.keyword"
              :placeholder="$t('dictionary.name')"
              @input="table.fetch(1, 800)"
            >
              <el-select
                style="width: 120px"
                slot="prepend"
                v-model="searchParams.isFuzzy"
                @input="table.fetch(1)"
              >
                <el-option
                  :label="$t('connection.fuzzyQuery')"
                  :value="true"
                ></el-option>
                <el-option
                  :label="$t('connection.PreciseQuery')"
                  :value="false"
                ></el-option>
              </el-select>
            </el-input>
          </li>

          <li v-if="searchParams.keyword">
            <el-button size="mini" type="text" @click="reset()">{{
              $t('button.query')
            }}</el-button>
          </li>

          <li v-if="searchParams.keyword">
            <el-button size="mini" type="text" @click="reset('reset')">{{
              $t('button.reset')
            }}</el-button>
          </li>
        </ul>
      </div>
      <div slot="operation">
        <el-button
          v-readonlybtn="'data_rule_management'"
          class="btn btn-create"
          size="mini"
          @click="openCreateDialog"
        >
          <i class="iconfont icon-jia add-btn-icon"></i>
          <span>{{ $t('dataRule.creatRule') }}</span>
        </el-button>
      </div>
      <el-table-column
        :label="$t('dataRule.classification')"
        prop="classification"
        sortable="classification"
      ></el-table-column>
      <el-table-column
        :label="$t('dataRule.name')"
        prop="name"
        sortable="name"
      ></el-table-column>
      <el-table-column :label="$t('message.operator')" width="120">
        <template slot-scope="scope">
          <el-button
            v-readonlybtn="'data_rule_management'"
            size="mini"
            type="text"
            :disabled="
              $disabledByPermission(
                'data_rule_management_all_data',
                scope.row.user_id
              )
            "
            @click="edit(scope.row)"
            >{{ $t('message.edit') }}</el-button
          >
          <el-button
            v-readonlybtn="'data_rule_management'"
            size="mini"
            type="text"
            style="color: #f56c6c"
            :disabled="
              $disabledByPermission(
                'data_rule_management_all_data',
                scope.row.user_id
              )
            "
            @click="remove(scope.row)"
            >{{ $t('message.delete') }}</el-button
          >
        </template>
      </el-table-column>
    </TablePage>
    <Form
      ref="createForm"
      :formData="createForm"
      :createDialogVisible="createDialogVisible"
      @createDialogVisible="handleDialogVisible"
      v-if="createDialogVisible"
    ></Form>
    <!-- <el-dialog
      width="600px"
      custom-class="create-dialog"
      :title="
        createForm && createForm.id
          ? $t('dataRule.editRule')
          : $t('dataRule.creatRule')
      "
      :close-on-click-modal="false"
      :visible.sync="createDialogVisible"
    >
      <Form ref="form"></Form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="createDialogVisible = false" size="small">{{
          $t('message.cancel')
        }}</el-button>
        <el-button type="primary" @click="saveSubmit()" size="small">{{
          $t('message.confirm')
        }}</el-button>
      </span>
    </el-dialog> -->
  </section>
</template>

<script>
import TablePage from '@/components/TablePage'
import Form from './Form'
import { toRegExp } from '../../utils/util'
export default {
  components: {
    TablePage,
    Form
  },
  data() {
    return {
      searchParams: {
        keyword: '',
        isFuzzy: true
      },
      order: 'start_time DESC',
      list: null,
      createDialogVisible: false,
      createForm: null
    }
  },
  created() {},
  mounted() {
    this.searchParams = Object.assign(this.searchParams, this.table.getCache())
  },
  computed: {
    table() {
      return this.$refs.table
    }
  },
  // watch: {
  //   'createForm.dataType'() {
  //     this.$nextTick(() => {
  //       this.$refs.form.clearValidate()
  //     })
  //   }
  // },
  methods: {
    // 重置
    reset(name) {
      if (name === 'reset') {
        this.searchParams = {
          keyword: '',
          state: 'all'
        }
      }
      this.table.fetch(1)
    },
    // 获取数据
    getData({ page }) {
      let _this = this
      let { current, size } = page
      let { isFuzzy, keyword } = this.searchParams
      let where = {}
      _this.classificationArr = []
      if (keyword && keyword.trim()) {
        let filterObj = isFuzzy
          ? { like: toRegExp(keyword), options: 'i' }
          : keyword
        where.or = [{ name: filterObj }]
      }
      let filter = {
        order: _this.order,
        limit: size,
        skip: (current - 1) * size,
        where
      }
      return Promise.all([
        _this.$api('DataRule').count({ where: where }),
        _this.$api('DataRule').get({
          filter: JSON.stringify(filter)
        })
      ]).then(([countRes, res]) => {
        if (res.data && res.data.length) {
          res.data.filter(item => {
            if (item.type) {
              _this.classificationArr.push(item.type)
            }
          })
        }
        _this.classificationArr = _this.classificationArr.filter(
          (item, index, self) => self.indexOf(item) === index
        )
        return {
          total: countRes.data.count,
          data: res.data
        }
      })
    },

    // 删除规则
    remove(item) {
      const h = this.$createElement
      let message = h('p', [
        this.$t('message.deleteOrNot') + ' ',
        h('span', { style: { color: '#48b6e2' } }, item.name)
      ])
      this.$confirm(message, this.$t('message.prompt'), {
        type: 'warning',
        closeOnClickModal: false,
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            this.$api('DataRule')
              .delete(item.id, item.name)
              .then(() => {
                this.$message.success(this.$t('message.deleteOK'))
                this.table.fetch()
                done()
              })
              .catch(() => {
                this.$message.info(this.$t('message.deleteFail'))
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
    // 创建字典模板弹窗开启
    openCreateDialog() {
      this.createDialogVisible = true
      this.createForm = {
        classification: '',
        name: '',
        ruleType: ''
      }
    },

    // 关闭弹窗
    handleDialogVisible(falg) {
      if (falg) {
        this.table.fetch()
      }
      this.createDialogVisible = false
    },

    // 编辑
    edit(item) {
      this.createDialogVisible = true
      this.createForm = item
      let rule = {
        checked: true,
        dataType: '',
        dataRegex: '',
        gt: 'none',
        gtData: 0,
        lt: 'none',
        ltData: 0,
        enumData: '',
        instatus: 0
      }

      let rules = JSON.parse(item.rules)
      if (rules.hasOwnProperty('exists')) { // eslint-disable-line
        this.createForm.ruleType = 'exists'
        rule.checked = rules.exists
      } else if (rules.hasOwnProperty('type')) { // eslint-disable-line
        this.createForm.ruleType = 'type'
        rule.dataType = rules.type
      } else if (rules.hasOwnProperty('regex')) { // eslint-disable-line
        this.createForm.ruleType = 'regex'
        rule.dataRegex = rules.regex
      } else if (rules.hasOwnProperty('range')) { // eslint-disable-line
        this.createForm.ruleType = 'range'
        let range = rules.range
        if (range.hasOwnProperty('lt')) { // eslint-disable-line
          rule.lt = 'lt'
        }
        if (range.hasOwnProperty('lte')) { // eslint-disable-line
          rule.lt = 'lte'
        }
        if (range.hasOwnProperty('gt')) { // eslint-disable-line
          rule.gt = 'gt'
        }
        if (range.hasOwnProperty('gte')) { // eslint-disable-line
          rule.gt = 'gte'
        }
        rule.ltData =
          parseFloat(range.lt) || parseFloat(range.lte) || range.none
        rule.gtData =
          parseFloat(range.gt) || parseFloat(range.gte) || range.none
      } else if (rules.hasOwnProperty('enum')) { // eslint-disable-line
        this.createForm.ruleType = 'enum'
        rule.enumData = rules.enum.join(',')
      }
      this.createForm.rule = rule
    },

    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'last_updated'} ${
        order === 'ascending' ? 'ASC' : 'DESC'
      }`
      this.table.fetch(1)
    }
  }
}
</script>
<style lang="scss" scoped>
.dataRule-list-wrap {
  height: 100%;

  .tapNav {
    height: 28px;
    background-color: rgba(239, 241, 244, 100);
    .mune {
      display: inline-block;
      height: 28px;
      line-height: 25px;
      font-size: 12px;
      border-radius: 0px 3px 0px 0px;
      background-color: rgba(244, 245, 247, 100);
      box-shadow: 0 -1px 10px 0px rgba(0, 0, 0, 0.15);
      li {
        float: left;
        width: 100px;
        height: 28px;
        color: #666;
        cursor: pointer;
        text-align: center;
        border-right: 1px solid #dedee4;

        &:last-child {
          border-right: 0;
        }
      }
      li.active {
        height: 29px;
        border-radius: 3px 3px 0px 0px;
        background-color: #fff;
        border-right: 0;
        border-left: 0;
        // box-shadow: 1px -1px 3px 0px rgba(0, 0, 0, 0.15);
      }
    }
  }
  .process-list {
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
      background: #f5f5f5;
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
.dataRule-list-wrap {
  .table-page-container {
    .table-page-body {
      box-shadow: 0 7px 15px -10px rgba(0, 0, 0, 0.1);
      .table-page-topbar {
        padding: 10px 10px 0 10px;
        background-color: #fff;
      }
      .el-table {
        box-sizing: border-box;
      }
      .table-page-pagination {
        margin-top: 0;
        padding: 5px 20px;
        background-color: #fff;
        box-sizing: border-box;
      }
    }
  }
  .el-dialog__wrapper {
    // overflow: hidden;
    .el-dialog__body {
    }
  }
}
</style>
