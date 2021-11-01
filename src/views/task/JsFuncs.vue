<template>
  <section class="js-funcs-warp">
    <TablePage
      ref="table"
      row-key="id+indexName"
      class="js-funcs-list"
      :title="$t('app_menu_' + $route.name)"
      :remoteMethod="getData"
      @sort-change="handleSortTable"
    >
      <div slot="operation">
        <el-button class="btn btn-create" size="mini" @click="openCreateDialog">
          <i class="iconfont icon-jia add-btn-icon"></i>
          <span>{{ $t('js_func_create') }}</span>
        </el-button>
      </div>
      <el-table-column :label="$t('js_func_name')" prop="function_name" sortable="function_name"> </el-table-column>
      <el-table-column :label="$t('js_func_parameters')" prop="parameters" sortable="parameters"> </el-table-column>
      <el-table-column :label="$t('js_func_function_body')" prop="function_body"> </el-table-column>
      <el-table-column :label="$t('js_func_last_update')" prop="last_updated"> </el-table-column>

      <el-table-column :label="$t('timeToLive.header.operate')">
        <template slot-scope="scope">
          <el-button size="mini" type="text" style="color: #f56c6c" @click="remove(scope.row)">{{
            $t('button.delete')
          }}</el-button>
          <el-button size="mini" type="text" @click="edit(scope.row)">{{ $t('button.edit') }}</el-button>
        </template>
      </el-table-column>
    </TablePage>
    <el-dialog
      width="600px"
      custom-class="create-dialog"
      :title="dialogTitle"
      :close-on-click-modal="false"
      :visible.sync="createDialogVisible"
    >
      <el-form ref="form" :model="model">
        <el-checkbox v-model="model.lineNumbers" class="e-checkbox">{{ $t('js_func_dialog_Linenumbers') }}</el-checkbox>
        <CodeEditor v-model="model.jsonDoc" lang="javascript" theme="dark" height="300"></CodeEditor>
        <ul v-if="jsonDocHint.length > 0">
          <li v-for="item in jsonDocHint" :key="item">{{ msg }}</li>
        </ul>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button
          @click="
            createDialogVisible = false
            editDocId = ''
          "
          size="small"
          >{{ $t('message.cancel') }}</el-button
        >
        <el-button type="primary" @click="createSave()" size="small">{{ $t('message.confirm') }}</el-button>
      </span>
    </el-dialog>
  </section>
</template>
<script>
import { nanoid } from 'nanoid'
import TablePage from '@/components/TablePage'
import CodeEditor from 'web-core/components/CodeEditor'
const parser = require('esprima')
const escodegen = require('escodegen')

export default {
  name: 'JsFuncs',
  components: { TablePage, CodeEditor },
  data() {
    return {
      order: 'last_updated',
      dialogTitle: '',
      createDialogVisible: false,
      editDocId: '',
      jsonDocHint: [],
      model: {
        jsonDoc: '',
        lineNumbers: true
      }
    }
  },
  computed: {
    table() {
      return this.$refs.table
    }
  },
  methods: {
    // 获取列表数据
    getData({ page }) {
      let { current, size } = page

      let filter = {
        order: this.order,
        limit: size,
        skip: (current - 1) * size
      }
      return Promise.all([
        this.$api('Javascript_functions').count(),
        this.$api('Javascript_functions').get({
          filter: filter
        })
      ]).then(([countRes, res]) => {
        return {
          total: countRes.data.count,
          data: res.data
        }
      })
    },
    // 创建
    openCreateDialog() {
      this.dialogTitle = this.$t('js_func_dialog_create_title')
      let code = `function f${nanoid(9)} (){}` //=> "fpY8C0PKJh"
      this.model.jsonDoc = escodegen.generate(parser.parse(code))
      this.createDialogVisible = true
    },
    // 编辑
    edit(item) {
      this.editDocId = item.id
      this.jsonDocHint.splice(0, this.jsonDocHint.length)
      this.format()
      this.dialogTitle = this.$t('js_func_dialog_edit_title')
      let code = `function ${item.function_name} (${item.parameters}) ${item.function_body}`
      this.model.jsonDoc = code
      this.createDialogVisible = true
    },
    // 保存
    createSave() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          this.createConnection()
        }
        let uid = this.$cookie.get('user_id')
        let doc = this.format()
        if (doc) {
          this.jsonDocHint.splice(0, this.jsonDocHint.length)
          let allAst = parser.parse(doc)
          let esqueryReq = require('esquery')
          let esquery = esqueryReq.default || esqueryReq
          let funcsSelector = esquery.parse('Program > FunctionDeclaration')
          let funcsMatches = esquery.match(allAst, funcsSelector)

          if (funcsMatches.length == 0) {
            this.jsonDocHint.push(this.$t('js_func_dialog_nofunctions'))
            return
          }

          let method = '',
            jsfm
          if (this.editDocId) {
            jsfm = {}
            jsfm.id = this.editDocId
            method = 'patch'
            makeModel(jsfm, funcsMatches[0])
          } else {
            method = 'post'
            jsfm = []

            funcsMatches.forEach(item => {
              let m = {}
              makeModel(m, item)
              jsfm.push(m)
            })
          }
          let doubleName = []
          let functionNames = []
          if (Array.isArray(jsfm)) {
            jsfm.forEach(v => {
              if (functionNames.indexOf(v.function_name) === -1) {
                functionNames.push(v.function_name)
              } else {
                doubleName.push(v.function_name)
              }
            })
          }
          if (doubleName.length > 0) {
            this.jsonDocHint.push(this.$t('js_func_function_name_repeat') + ':' + doubleName.join(','))
            return
          }

          this.$api('Javascript_functions')
            [method](jsfm)
            .then(res => {
              if (res) {
                this.editDocId = null
                this.table.fetch()
                this.$message.success(this.$t('message.saveOK'))
              }
            })
            .catch(e => {
              this.jsonDocHint.push(e.response.msg)
            })
          this.createDialogVisible = false
        } else {
          this.jsonDocHint.push(this.$t('js_func_dialog_nofunctions'))
        }

        function makeModel(m, ast) {
          m.function_body = escodegen.generate(ast.body)
          m.function_name = ast.id.name
          m.parameters = ast.params
            .map(function (p) {
              return p.name
            })
            .join()
          m.last_updated = new Date()
          m.user_id = uid
        }
      })
    },
    // 移除
    remove(item) {
      const h = this.$createElement
      let message = h('p', [
        this.$t('message.deleteOrNot') + ' ',
        h('span', { style: { color: '#409EFF' } }, item.function_name)
      ])
      this.$confirm(message, this.$t('message.prompt'), {
        type: 'warning'
      }).then(resFlag => {
        if (!resFlag) {
          return
        }
        this.$api('Javascript_functions')
          .delete(item.id)
          .then(res => {
            if (res) this.table.fetch()
          })
      })
    },
    format() {
      if (this.model.jsonDoc) {
        try {
          let syntax = parser.parse(this.model.jsonDoc)
          this.model.jsonDoc = escodegen.generate(syntax)
          this.jsonDocHint.splice(0, this.jsonDocHint.length)
          return this.model.jsonDoc
        } catch (e) {
          this.jsonDocHint.push(e.message)
        }
      }
      return false
    },
    // 表格排序
    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'last_updated'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
      this.table.fetch(1)
    }
  }
}
</script>
<style scoped lang="scss">
.js-funcs-warp {
  height: 100%;
  .js-funcs-list {
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
.e-checkbox {
  padding-bottom: 20px;
}
</style>
