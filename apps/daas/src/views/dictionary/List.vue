<template>
  <section class="dictionary-list-wrap section-wrap">
    <TablePage ref="table" row-key="id" class="process-list" :remoteMethod="getData" @sort-change="handleSortTable">
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
              <el-select style="width: 120px" slot="prepend" v-model="searchParams.isFuzzy" @input="table.fetch(1)">
                <el-option :label="$t('connection.fuzzyQuery')" :value="true"></el-option>
                <el-option :label="$t('connection.PreciseQuery')" :value="false"></el-option>
              </el-select>
            </el-input>
          </li>

          <li v-if="searchParams.keyword">
            <el-button size="mini" type="text" @click="reset()">{{ $t('button.query') }}</el-button>
          </li>

          <li v-if="searchParams.keyword">
            <el-button size="mini" type="text" @click="reset('reset')">{{ $t('button.reset') }}</el-button>
          </li>
        </ul>
      </div>
      <div slot="operation">
        <el-button v-readonlybtn="'dictionary'" class="btn btn-create" size="mini" @click="openCreateDialog">
          <i class="iconfont icon-jia add-btn-icon"></i>
          <span>{{ $t('dictionary.creatDictionary') }}</span>
        </el-button>
      </div>
      <el-table-column :label="$t('dictionary.classification')" prop="type" sortable="type"></el-table-column>
      <el-table-column :label="$t('dictionary.name')" prop="name" sortable="name"></el-table-column>
      <el-table-column :label="$t('dictionary.data_type')" prop="dataType" sortable="dataType"></el-table-column>
      <el-table-column :label="$t('dictionary.isdatatype')" prop="typearr" sortable="typearr">
        <template slot-scope="scope">
          <span v-for="(key, index) in scope.row.typearr" :key="index">{{ key.key }}:{{ key.value }} </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('column_operation')" width="120">
        <template slot-scope="scope">
          <el-button
            v-readonlybtn="'dictionary'"
            size="mini"
            type="text"
            :disabled="$disabledByPermission('dictionary_all_data', scope.row.user_id)"
            @click="edit(scope.row)"
            >{{ $t('message.edit') }}</el-button
          >
          <el-button
            v-readonlybtn="'dictionary'"
            size="mini"
            type="text"
            style="color: #f56c6c"
            :disabled="$disabledByPermission('dictionary_all_data', scope.row.user_id)"
            @click="remove(scope.row)"
            >{{ $t('message.delete') }}</el-button
          >
        </template>
      </el-table-column>
    </TablePage>
    <el-dialog
      width="600px"
      custom-class="create-dialog"
      :title="createForm.id ? $t('dictionary.editDictionary') : $t('dictionary.creatDictionary')"
      :close-on-click-modal="false"
      :visible.sync="createDialogVisible"
    >
      <el-form ref="form" :model="createForm">
        <el-form-item :label="$t('dictionary.classification')">
          <el-select
            v-model="createForm.type"
            size="mini"
            filterable
            allow-create
            default-first-option
            :placeholder="$t('dictionary.pleaseSelect') + $t('dictionary.classification')"
          >
            <el-option v-for="item in classificationArr" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          :label="$t('dictionary.name')"
          prop="name"
          :rules="{
            required: true,
            message: $t('dictionary.nameCheck'),
            trigger: 'blur'
          }"
        >
          <el-input
            v-model="createForm.name"
            size="mini"
            :placeholder="$t('dictionary.pleaseInput') + $t('dictionary.name')"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('dictionary.data_type')" required>
          <el-select
            v-model="createForm.dataType"
            size="mini"
            :placeholder="$t('dictionary.pleaseSelect') + $t('dictionary.data_type')"
          >
            <el-option :label="$t('dictionary.baseFloating')" value="double"></el-option>
            <el-option :label="$t('dictionary.baseString')" value="string"></el-option>
            <el-option :label="$t('dictionary.baseBoolean')" value="bool"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('dictionary.template')" required>
          <div class="template-box">
            <template v-if="createForm.dataType === 'string'">
              <el-row v-for="(item, index) in createForm.stringArr" :key="index">
                <el-col :span="0"></el-col>
                <el-col :span="10">
                  <el-form-item
                    :prop="'stringArr.' + index + '.key'"
                    :rules="{
                      required: true,
                      message: $t('dictionary.isInitialvalue'),
                      trigger: 'blur'
                    }"
                  >
                    <el-input v-model="item.key" size="mini" :placeholder="$t('dictionary.initial')"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="2"></el-col>
                <el-col :span="10">
                  <el-form-item
                    :prop="'stringArr.' + index + '.value'"
                    :rules="{
                      required: true,
                      message: $t('dictionary.isMappedvalue'),
                      trigger: 'blur'
                    }"
                  >
                    <el-input v-model="item.value" size="mini" :placeholder="$t('dictionary.mapping')"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="2" style="text-align: center">
                  <el-button
                    plain
                    style="padding: 0"
                    v-if="createForm.stringArr.length > 1"
                    @click="removeRow(item, index)"
                  >
                    <i class="iconfont icon-quxiao remove"></i>
                  </el-button>
                </el-col>
              </el-row>
            </template>
            <template v-if="createForm.dataType === 'double'">
              <el-row v-for="(item, index) in createForm.numberarr" :key="index">
                <el-col :span="0"></el-col>
                <el-col :span="10">
                  <el-form-item :prop="'numberarr.' + index + '.key'" :rules="rule.numberRules">
                    <el-input v-model="item.key" size="mini" :placeholder="$t('dictionary.initialNum')"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="2"></el-col>
                <el-col :span="10">
                  <el-form-item
                    :prop="'numberarr.' + index + '.value'"
                    :rules="{
                      required: true,
                      message: $t('dictionary.isMappedvalue'),
                      trigger: 'blur'
                    }"
                  >
                    <el-input v-model="item.value" size="mini" :placeholder="$t('dictionary.mapping')"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="2" style="text-align: center">
                  <el-button
                    plain
                    style="padding: 0"
                    v-if="createForm.numberarr.length > 1"
                    @click="removeRow(item, index)"
                  >
                    <i class="iconfont icon-quxiao remove"></i>
                  </el-button>
                </el-col>
              </el-row>
            </template>
            <template v-if="createForm.dataType === 'bool'">
              <el-row v-for="(item, index) in createForm.boolarr" :key="index">
                <el-col :span="11">
                  <el-form-item>
                    <el-input v-model="item.key" disabled size="mini"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="2"></el-col>
                <el-col :span="11">
                  <el-form-item
                    :prop="`boolarr.${index}.value`"
                    :rules="{
                      required: true,
                      message: $t('dictionary.isMappedvalue'),
                      trigger: 'blur'
                    }"
                  >
                    <el-input v-model="item.value" size="mini" :placeholder="$t('dictionary.mapping')"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </template>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="text" v-if="createForm.dataType !== 'bool'" style="padding: 0" @click="addTelRow()">
            {{ $t('dataForm.form.file.addPath') }}
          </el-button>
        </el-form-item>
      </el-form>
      <!-- <FormBuilder
        ref="form"
        v-model="createForm"
        :config="createFormConfig"
      ></FormBuilder> -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="createDialogVisible = false" size="small">{{ $t('message.cancel') }}</el-button>
        <el-button type="primary" @click="saveSubmit()" size="small">{{ $t('message.confirm') }}</el-button>
      </span>
    </el-dialog>
  </section>
</template>

<script>
import TablePage from '@/components/TablePage'
import { toRegExp } from '../../utils/util'
export default {
  components: {
    TablePage
  },
  data() {
    // let doubleRules = (rule, value, callback) => {
    //   if (!value) {
    //     callback(new Error(this.$t('dictionary.isInitialvalue')))
    //   } else if (!/^[0-9]*$/.test(value)) {
    //     callback(new Error(this.$t('dictionary.initialNum')))
    //   }
    // }
    return {
      searchParams: {
        keyword: '',
        isFuzzy: true
      },
      order: 'start_time DESC',
      list: null,
      createDialogVisible: false,
      classificationArr: [],
      createForm: {
        type: '',
        name: '',
        dataType: 'bool',
        typearr: [],
        stringArr: [{ key: '', value: '' }],
        numberarr: [{ key: '', value: '' }],
        boolarr: [
          { key: 'true', value: '' },
          { key: 'false', value: '' }
        ]
      },
      rule: {
        numberRules: [
          {
            required: true,
            message: this.$t('dictionary.isInitialvalue'),
            trigger: 'blur'
          },
          {
            pattern: /^(-?\d+)(\.\d+)?$/,
            message: this.$t('dictionary.initialNum'),
            trigger: 'blur'
          }
        ]
      }
    }
  },
  computed: {
    table() {
      return this.$refs.table
    }
  },
  watch: {
    'createForm.dataType'() {
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
    }
  },
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
        let filterObj = isFuzzy ? { like: toRegExp(keyword), options: 'i' } : keyword
        where.or = [{ name: filterObj }]
      }
      let filter = {
        order: _this.order,
        limit: size,
        skip: (current - 1) * size,
        where
      }
      return _this
        .$api('Dictionary')
        .get({
          filter: JSON.stringify(filter)
        })
        .then(res => {
          if (res.data?.items?.length) {
            res.data.items.filter(item => {
              if (item.type) {
                _this.classificationArr.push(item.type)
              }
            })
          }
          _this.classificationArr = _this.classificationArr.filter((item, index, self) => self.indexOf(item) === index)
          return {
            total: res.data.total,
            data: res.data.items
          }
        })
    },

    // 删除字典模板表格数据
    remove(item) {
      const h = this.$createElement
      let message = h('p', [
        this.$t('message.deleteOrNot') + ' ',
        h('span', { style: { color: '#409EFF' } }, item.name)
      ])
      this.$confirm(message, this.$t('message_title_prompt'), {
        type: 'warning',
        closeOnClickModal: false
      }).then(res => {
        if (res) {
          this.$api('Dictionary')
            .delete(item.id, item.name)
            .then(() => {
              this.$message.success(this.$t('message.deleteOK'))
              this.table.fetch()
            })
            .catch(() => {
              this.$message.info(this.$t('message.deleteFail'))
            })
        }
      })
    },
    // 创建字典模板弹窗开启
    openCreateDialog() {
      this.createDialogVisible = true
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
      this.createForm = {
        type: '',
        name: '',
        dataType: 'bool',
        typearr: [],
        stringArr: [{ key: '', value: '' }],
        numberarr: [{ key: '', value: '' }],
        boolarr: [
          { key: 'true', value: '' },
          { key: 'false', value: '' }
        ]
      }
    },

    // 编辑
    edit(item) {
      this.createDialogVisible = true
      this.createForm = item
      switch (item.dataType) {
        case 'string':
          this.createForm.stringArr = item.typearr
          break
        case 'double':
          this.createForm.numberarr = item.typearr
          break
        default:
          this.createForm.boolarr = item.typearr
      }
    },

    // 添加模板
    addTelRow() {
      if (this.createForm.dataType === 'double') {
        this.createForm.numberarr.push({ key: '', value: '' })
      } else if (this.createForm.dataType === 'string') {
        this.createForm.stringArr.push({ key: '', value: '' })
      }
    },

    // 删除模板
    removeRow(item, index) {
      if (this.createForm.dataType === 'string') {
        if (this.createForm.stringArr.length > 1) {
          if (index !== -1) {
            this.createForm.stringArr.splice(index, 1)
          }
        }
      } else if (this.createForm.dataType === 'double') {
        if (this.createForm.numberarr.length > 1) {
          if (index !== -1) {
            this.createForm.numberarr.splice(index, 1)
          }
        }
      }
    },

    // 保存模板
    saveSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const id = this.createForm.id
          const method = id ? 'patch' : 'post'
          let typearr = []

          if (this.createForm.dataType === 'string') {
            typearr = this.createForm.stringArr
          } else if (this.createForm.dataType === 'bool') {
            typearr = this.createForm.boolarr
          } else {
            typearr = this.createForm.numberarr
          }
          delete this.createForm.stringArr
          delete this.createForm.boolarr
          delete this.createForm.numberarr
          this.createForm.typearr = typearr
          this.$api('Dictionary')
            [method](this.createForm)
            .then(() => {
              this.table.fetch()
              this.$message.success(this.$t('message_save_ok'))
            })
            .catch(e => {
              if (e.response.msg.indexOf('Dictionary already exists') !== -1) {
                this.$message.error(this.$t('dictionary.alreadyExists'))
              } else {
                this.$message.error(this.$t('message_save_fail'))
              }
            })
            .finally(() => {
              this.createDialogVisible = false
            })
        }
      })
    },

    handleSortTable({ order, prop }) {
      this.order = `${order ? prop : 'last_updated'} ${order === 'ascending' ? 'ASC' : 'DESC'}`
      this.table.fetch(1)
    }
  }
}
</script>
<style lang="scss" scoped>
.dictionary-list-wrap {
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
        color: map-get($fontColor, light);
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
        background-color: map-get($bgColor, white);
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
      background: map-get($bgColor, main);
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
.dictionary-list-wrap {
  .el-form {
    .el-form-item {
      margin-bottom: 5px;
      .el-form-item__label {
        width: 100px;
        font-size: 14px;
        text-align: left;
      }
      .el-form-item__content {
        margin-left: 100px;
        .el-row {
          display: flex;
          justify-content: space-between;
        }
        .el-select {
          width: 100%;
        }
        .el-form-item__error {
          top: 82%;
        }
      }
    }
  }
  .el-dialog__wrapper {
    // overflow: hidden;
    .el-dialog__body {
      .template-box {
        padding: 5px 0 8px;
        max-height: 350px;
        overflow-y: auto;
        .el-row {
          padding-bottom: 5px;
        }
        .el-form-item__content {
          line-height: initial;
          margin: 0;
          .el-form-item__error {
            top: 100%;
          }
        }
      }
    }
  }
}
</style>
