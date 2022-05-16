<template>
  <section class="js-funcs-warp">
    <TablePage
      ref="table"
      row-key="id+indexName"
      class="js-funcs-list"
      :title="$t('app_menu_' + $route.name)"
      :remoteMethod="getData"
    >
      <div slot="operation">
        <el-button class="btn btn-create" type="primary" size="mini" @click="openCreateDialog">
          <i class="iconfont icon-jia add-btn-icon"></i>
          <span>{{ $t('function_button_create') }}</span>
        </el-button>
      </div>
      <el-table-column :label="$t('function_name_label')" prop="function_name"> </el-table-column>
      <el-table-column :label="$t('function_parameters_label')" prop="parameters"> </el-table-column>
      <el-table-column :label="$t('function_body_label')" prop="function_body"> </el-table-column>
      <el-table-column :label="$t('function_last_update_label')" prop="last_updated"> </el-table-column>

      <el-table-column :label="$t('timeToLive.header.operate')">
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="edit(scope.row)">{{ $t('button.edit') }}</el-button>
          <el-button size="mini" type="text" style="color: #f56c6c" @click="remove(scope.row)">{{
            $t('button.delete')
          }}</el-button>
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
      <el-form
        ref="form"
        status-icon
        label-width="100px"
        label-position="left"
        :model="model"
        :validate-on-rule-change="false"
        :rules="model.type === 'jar' ? rules : {}"
      >
        <el-form-item :label="$t('function_type_label') + ':'">
          <el-select v-model="model.type" size="small">
            <el-option :label="$t('function_type_option_custom')" value="custom"></el-option>
            <el-option :label="$t('function_type_option_jar')" value="jar"></el-option>
          </el-select>
        </el-form-item>
        <div v-show="model.type === 'jar'">
          <el-form-item prop="function_name" :label="$t('function_name_label') + ':'">
            <el-input
              v-model="model.function_name"
              size="small"
              :placeholder="$t('function_name_placeholder')"
            ></el-input>
          </el-form-item>
          <el-form-item prop="className" :label="$t('function_class_label') + ':'">
            <el-input v-model="model.className" size="small" :placeholder="$t('function_class_placeholder')"></el-input>
          </el-form-item>
          <el-form-item prop="fileId" :label="$t('function_file_label') + ':'">
            <el-upload
              action="api/file/upload"
              accept=".jar"
              :file-list="fileList"
              :on-change="fileChange"
              :on-remove="fileRemove"
            >
              <el-button style="margin-right: 10px" size="small" type="primary">{{
                $t('function_button_file_upload')
              }}</el-button>
            </el-upload>
          </el-form-item>
          <!-- <el-form-item :label="$t('function_body_label') + ':'">
            <el-input
              v-model="model.function_body"
              size="small"
              :placeholder="$t('function_body_placeholder')"
            ></el-input>
          </el-form-item>
          <el-form-item :label="$t('function_parameters_describe_label') + ':'">
            <el-input
              v-model="model.parameters"
              size="small"
              :placeholder="$('function_parameters_describe_placeholder')"
            ></el-input>
          </el-form-item>
          <el-form-item :label="$t('function_return_value_label') + ':'">
            <el-input
              v-model="model.return_value"
              size="small"
              :placeholder="$t('function_return_value_placeholder')"
            ></el-input>
          </el-form-item> -->
        </div>
        <!-- <el-form-item :label="$t('function_describe_label') + ':'">
          <el-input
            v-model="model.describe"
            type="textarea"
            size="small"
            :placeholder="$t('function_describe_placeholder')"
          ></el-input>
        </el-form-item> -->
        <ElFormItem v-if="model.type === 'custom'" size="mini" label="JS引擎版本：">
          <ElSelect v-model="model.jsEngineName">
            <ElOption label="新版" value="graal.js"></ElOption>
            <ElOption label="旧版" value="nashorn"></ElOption>
          </ElSelect>
        </ElFormItem>
        <el-form-item v-if="model.type === 'custom'">
          <el-checkbox v-model="lineNumbers" class="e-checkbox" @input="showGutter">{{
            $t('function_checkbox_Line_number')
          }}</el-checkbox>
          <CodeEditor v-model="model.jsonDoc" ref="editor" lang="javascript" height="300"></CodeEditor>
          <ul v-if="jsonDocHint.length > 0">
            <li v-for="item in jsonDocHint" :key="item">{{ item }}</li>
          </ul>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button v-if="model.type === 'custom'" type="primary" size="small" @click="format">{{
          $t('function_button_code_format')
        }}</el-button>
        <el-button
          @click="
            createDialogVisible = false
            editDocId = ''
          "
          size="small"
          >{{ $t('message.cancel') }}</el-button
        >
        <el-button type="primary" size="small" @click="createSave()">{{ $t('message.confirm') }}</el-button>
      </span>
    </el-dialog>
  </section>
</template>
<script>
import TablePage from '@/components/TablePage'
import CodeEditor from '@/components/CodeEditor'
import 'prismjs'
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
        type: 'custom',
        function_name: '',
        jsEngineName: 'graal.js',
        className: '',
        fileId: '',
        fileName: '', // 保存文件名
        function_body: '',
        parameters: '',
        return_value: '',
        describe: '',
        jsonDoc: ''
      },
      lineNumbers: true,
      rules: {
        function_name: [
          { required: true, message: this.$t('function_name_placeholder') },
          { validator: this.validateFuncName, trigger: 'blur' }
        ],
        className: [{ required: true, message: this.$t('function_class_placeholder') }],
        fileId: [{ required: true, message: this.$t('function_file_upload_tips') }]
      },
      fileList: []
    }
  },
  computed: {
    table() {
      return this.$refs.table
    }
  },
  methods: {
    fileRemove() {
      this.fileList = []
      this.$api('file')
        .removeFile(this.model.fileId)
        .then(() => {})
      this.model.fileId = ''
      this.model.fileName = ''
    },
    fileChange(file) {
      if (file.status === 'ready') {
        this.model.fileId = ''
      }
      if (file.response) {
        let code = file.response.code
        if (code === 'ok') {
          this.$message.success(this.$t('function_file_upload_success'))
          this.model.fileId = file.response.data.id
          this.model.fileName = file.name
        }
        this.fileList = [file]
      }
      if (file.status === 'fail') {
        this.$message.error(this.$t('function_file_upload_fail'))
      }
    },
    showGutter(val) {
      this.$refs.editor.editor.setOption('showGutter', val)
    },
    // 获取列表数据
    getData({ page }) {
      let { current, size } = page

      let filter = {
        order: this.order,
        limit: size,
        skip: (current - 1) * size
      }
      return this.$api('Javascript_functions')
        .get({
          filter: filter
        })
        .then(res => {
          return {
            total: res.data?.total || 0,
            data: res.data?.items || []
          }
        })
    },
    // 创建
    openCreateDialog() {
      this.fileList = []
      this.dialogTitle = this.$t('function_button_create')
      let code = `function f${this.$util.uuid().slice(0, 8)} () {}`
      this.model = {
        type: 'custom',
        function_name: '',
        jsEngineName: 'graal.js',
        className: '',
        fileId: '',
        fileName: '',
        function_body: '',
        parameters: '',
        return_value: '',
        describe: '',
        jsonDoc: code
      }
      this.lineNumbers = true
      this.createDialogVisible = true
    },
    // 编辑
    edit(item) {
      this.editDocId = item.id
      this.editFuncName = item.function_name // 存放编辑的函数名，判断是否改名，改名跑校验
      this.jsonDocHint.splice(0, this.jsonDocHint.length)
      this.format()
      this.dialogTitle = this.$t('button_edit')
      let code = `function ${item.function_name} (${item.parameters}) ${item.function_body}`
      this.model.jsonDoc = code
      let {
        function_name,
        className,
        fileId,
        fileName,
        describe,
        function_body,
        parameters,
        return_value,
        jsEngineName
      } = item
      this.model = {
        type: item.type || 'custom',
        function_name,
        className,
        jsEngineName: jsEngineName || 'nashorn',
        fileId,
        fileName: fileName || fileId + '.jar', // 历史数据没有保存文件名，默认id.jar
        describe,
        function_body,
        parameters,
        return_value,
        jsonDoc: code
      }
      this.lineNumbers = true
      this.createDialogVisible = true
      this.fileList = [{ name: this.model.fileName }]
    },
    // 保存
    createSave() {
      let uid = this.$cookie.get('user_id')
      let makeModel = (m, ast) => {
        let escodegen = require('escodegen')
        m.function_body = escodegen.generate(ast.body)
        m.parameters = ast.params
          .map(function (p) {
            return p.name
          })
          .join()
        m.last_updated = new Date()
        m.user_id = uid
        let model = this.model
        m.jsEngineName = model.jsEngineName
        m.className = model.className
        m.fileId = model.fileId
        m.describe = model.describe
        m.return_value = model.return_value
        m.type = model.type
        m.function_name = m.type === 'custom' ? ast.id.name : model.function_name
        m.fileName = model.fileName
      }
      this.$refs.form.validate(valid => {
        if (!valid) {
          return
        }
        let doc = this.format()
        if (doc) {
          this.jsonDocHint.splice(0, this.jsonDocHint.length)

          let allAst = parser.parse(doc)
          let esqueryReq = require('esquery')
          let esquery = esqueryReq.default || esqueryReq
          let funcsSelector = esquery.parse('Program > FunctionDeclaration')
          let funcsMatches = esquery.match(allAst, funcsSelector)

          if (funcsMatches.length == 0) {
            this.jsonDocHint.push(this.$t('function_tips_empty'))
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
            this.jsonDocHint.push(this.$t('function_tips_name_repeat') + ':' + doubleName.join(','))
            return
          }

          this.$api('Javascript_functions')
            [method](jsfm)
            .then(res => {
              if (res) {
                this.editDocId = null
                this.table.fetch()
                this.$message.success(this.$t('message_save_ok'))
                this.createDialogVisible = false
              }
            })
            .catch(e => {
              if (this.model.type === 'jar') {
                this.$message.error(e.response.msg)
              } else {
                this.jsonDocHint.push(e.response.msg)
              }
            })
        } else {
          this.jsonDocHint.push(this.$t('function_tips_empty'))
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
      this.$confirm(message, this.$t('message_title_prompt'), {
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

    /**
     * 函数名称重名校验
     * @param rule
     * @param value
     * @param callback
     * @returns {Promise<*>}
     */
    async validateFuncName(rule, value, callback) {
      value = value.trim()
      if (this.editDocId && value === this.editFuncName) return callback() // 如果是编辑且函数名没变则不跑重名校验
      const result = await this.$api('Javascript_functions').count({
        where: {
          function_name: value
        }
      })
      if (result.data.count > 0) {
        callback(new Error(this.$t('function_name_repeat')))
      } else {
        callback()
      }
    }
  }
}
</script>
<style scoped lang="scss">
.js-funcs-warp {
  height: 100%;
  .js-funcs-list {
    .btn {
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
