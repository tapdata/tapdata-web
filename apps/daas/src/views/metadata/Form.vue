<template>
  <el-dialog
    :title="title"
    :close-on-click-modal="false"
    :before-close="handleClose"
    :visible.sync="dialogFormVisible"
    custom-class="dialogInfo-form"
  >
    <el-form :model="form" :rules="rules" ref="form" label-width="120" class="e-form" label-position="left">
      <div class="box">
        <el-form-item :label="$t('metadata_details_filedName')" prop="field_name" required>
          <el-input
            v-model="form.field_name"
            :placeholder="$t('public_input_placeholder') + $t('metadata_details_filedName')"
            autocomplete="off"
            :disabled="fieldNameDisabled"
            size="mini"
            maxlength="50"
            show-word-limit
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('metadata_details_alias')">
          <el-input
            v-model="form.alias_name"
            :placeholder="$t('public_input_placeholder') + $t('metadata_details_alias')"
            autocomplete="off"
            size="mini"
            maxlength="50"
            show-word-limit
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('public_description')">
          <el-input
            type="textarea"
            :placeholder="$t('public_input_placeholder') + $t('public_description')"
            v-model="form.comment"
            maxlength="50"
            show-word-limit
          >
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('metadata_details_fieldType')" prop="data_type" required>
          <ElAutocomplete
            :disabled="fieldNameDisabled"
            v-model="form.data_type"
            class="inline-input"
            style="width: 350px"
            :fetch-suggestions="querySearchPdkType"
          ></ElAutocomplete>
          <div class="mt-3 fs-8">{{ getPdkEditValueType() }}</div>
        </el-form-item>
        <el-form-item style="margin-left: 100px">
          <el-checkbox v-model="form.is_auto_allowed">{{ $t('metadata_details_allowOverwrite') }}</el-checkbox>
          <el-checkbox v-model="form.autoincrement">{{ $t('metadata_details_selfIncreasing') }}</el-checkbox>
          <el-checkbox v-model="form.primary_key">{{ $t('metadata_details_primaryKey') }}</el-checkbox>
        </el-form-item>
        <!--        <el-form-item :label="$t('metadata_details_fieldLength')">-->
        <!--          <el-input-number v-model="form.columnSize" :min="0" size="mini"></el-input-number>-->
        <!--        </el-form-item>-->
        <!--        <el-form-item :label="$t('metadata_details_accuracy')">-->
        <!--          <el-input-number v-model="form.scale" :min="0" size="mini"></el-input-number>-->
        <!--        </el-form-item>-->
        <!--        <el-form-item :label="$t('metadata_details_numberLength')">-->
        <!--          <el-input-number v-model="form.precision" :min="0" size="mini"></el-input-number>-->
        <!--        </el-form-item>-->
      </div>
      <!-- 字典模板 -->
      <!-- <div class="box">
        <h2>{{ $t('metadata_details_dictionarySettings') }}</h2>
        <el-table :data="form.dictionary" border class="e-table" style="width: 100%">
          <el-table-column prop="key" :label="$t('metadata_details_initialValue')">
            <template slot-scope="scope">
              <el-input v-model="scope.row.key" size="mini"> </el-input>
            </template>
          </el-table-column>
          <el-table-column prop="value" :label="$t('metadata_details_mappedValue')">
            <template slot-scope="scope">
              <el-input v-model="scope.row.value" size="mini"> </el-input>
            </template>
          </el-table-column>
          <el-table-column prop="address" :label="$t('public_operation')" width="60">
            <template slot-scope="scope">
              <el-button
                @click="delDictionary(scope.$index, 0)"
                type="text"
                class="iconfont icon-quxiao"
                size="mini"
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="addBtn">
          <el-button @click="addDictionary" size="mini">+ {{ $t('metadata_details_newMapping') }}</el-button>
          <el-button @click="handleSelectTemplate(form)" size="mini">{{
            $t('metadata_details_chooseTemplate')
          }}</el-button>
        </div>
      </div> -->
      <!-- 外键设置 -->
      <div class="box">
        <h2>{{ $t('metadata_details_foreignKeySetting') }}</h2>
        <el-table :data="form.relation" border class="e-table" style="width: 100%">
          <el-table-column prop="table_name" :label="$t('metadata_details_associationTable')">
            <template slot-scope="scope">
              <el-select v-model="scope.row.table_name" @change="changeRecordTable($event)" size="mini">
                <el-option
                  v-for="item in getAvailableTable(scope.$index)"
                  :label="item.original_name"
                  :value="item.original_name"
                  :key="item.id"
                ></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="field_name" :label="$t('metadata_details_associationField')">
            <template slot-scope="scope">
              <el-select v-model="scope.row.field_name" @focus="changeRecordTable(scope.row.table_name)" size="mini">
                <el-option
                  v-for="item in fieldList"
                  :label="item.field_name"
                  :value="item.field_name"
                  :key="item.field_name"
                ></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="rel" :label="$t('metadata_details_connectionRelation')">
            <template slot-scope="scope">
              <el-select v-model="scope.row.rel" size="mini">
                <el-option
                  v-for="item in relationshipList"
                  :label="item.name"
                  :value="item.key"
                  :key="item.key"
                ></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="address" :label="$t('public_operation')" width="60">
            <template slot-scope="scope">
              <el-button
                @click="delRelation(scope.$index, 0)"
                type="text"
                class="iconfont icon-quxiao"
                size="mini"
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="addBtn">
          <el-button @click="addRelation" class="add" size="mini"
            >+ {{ $t('metadata_details_addRelatedTable') }}</el-button
          >
        </div>
      </div>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button class="cancel" @click="handleClose()" size="mini">
        {{ $t('public_button_cancel') }}
      </el-button>
      <el-button type="primary" @click="save()" size="mini">{{ $t('public_button_save') }}</el-button>
    </div>
    <el-dialog
      :title="$t('metadata_details_chooseTemplate')"
      :close-on-click-modal="false"
      :visible.sync="dialogDictionaryVisible"
      :append-to-body="true"
      custom-class="dialogDictionary"
    >
      <el-radio-group v-model="selectDictionaryTem">
        <el-radio v-for="item in dictionaryList" :key="item.id" :label="item.name"></el-radio>
      </el-radio-group>
      <!-- <ul>
				<li
					v-for="(item, index) in dictionaryList"
					:key="item.id"
					:class="{ active: activeIndex === index }"
					@dblclick="handleSelectDictionary(item, index)"
				>
					{{ item.name }}
				</li>
			</ul> -->
      <div slot="footer" class="dialog-footer">
        <el-button class="cancel" @click="dialogDictionaryVisible = false" size="mini">{{
          $t('public_button_cancel')
        }}</el-button>
        <el-button type="primary" @click="handleSelectDictionary" size="mini">{{ $t('public_button_confirm') }}</el-button>
      </div>
    </el-dialog>
  </el-dialog>
</template>
<script>
import { typeMappingApi, metadataInstancesApi } from '@tap/api'
export default {
  props: {
    data: {
      required: true,
      value: Object
    },
    metadata: {
      required: true,
      value: Object
    },
    dialogVisible: {
      required: true,
      value: Boolean
    }
  },
  data() {
    return {
      title: this.data.id ? this.$t('metadata_details_editFild') : this.$t('metadata_details_createFiled'),
      dialogFormVisible: this.dialogVisible,
      selectDictionaryTem: '',
      fieldNameDisabled: false,
      form: {
        field_name: '',
        alias_name: '',
        comment: '',
        data_type: '',
        is_auto_allowed: false,
        autoincrement: 0,
        primary_key: false,
        primary_key_position: 0,
        dictionary: [{ name: '', key: '', value: '' }],
        relation: [{ table_name: '', field_name: '', rel: '' }]
      },
      rules: {
        field_name: [
          {
            required: true,
            trigger: 'blur',
            message: this.$t('metadata_details_msgFiledName')
          }
        ]
      },
      typeMapping: [],
      relationshipList: [
        { name: this.$t('metadata_details_oneone'), key: 'oneone' },
        { name: this.$t('metadata_details_onemany'), key: 'onemany' },
        { name: this.$t('metadata_details_manyone'), key: 'manyone' }
      ],
      fieldList: [],
      getTableData: [],
      dialogDictionaryVisible: false,
      dictionaryList: [],
      activeIndex: -1
    }
  },
  created() {
    this.form = this.data && this.data.field_name ? this.data : this.form
    this.form.dictionary = this.data.dictionary || []
    this.form.relation = this.data.relation || []
    this.fieldNameDisabled = this.data && this.data.id ? true : false
    this.getMetadataTable()
    this.getTypeMapping(this.metadata?.source?.database_type)
  },
  methods: {
    // 获取外键表数据
    async getMetadataTable() {
      let params = {
        where: {
          databaseId: {
            regexp: `^${this.metadata.databaseId}$`
          },
          meta_type: this.metadata.meta_type,

          'relation.table_name': {
            neq: this.metadata.original_name
          }
        },

        fields: {
          histories: false,
          original_name: true,
          id: true
        }
      }
      if (this.data.id) {
        params['where.id'] = {
          neq: this.data.id
        }
      }

      let resultData = await metadataInstancesApi.get({
        filter: JSON.stringify(params)
      })

      if (resultData?.items) {
        this.getTableData = resultData?.items
      }
    },
    //获取typeMapping
    getTypeMapping(type) {
      typeMappingApi.pdkDataType(type).then(data => {
        let targetObj = JSON.parse(data || '{}')
        for (let key in targetObj) {
          this.typeMapping.push({
            dbType: key,
            rules: targetObj[key]
          })
        }
      })
    },
    querySearchPdkType(queryString, cb) {
      let result = this.typeMapping.map(t => {
        return {
          value: t.dbType
        }
      })
      cb(result)
    },
    getPdkEditValueType() {
      let findOne = this.typeMapping.find(t => t.dbType === this.form.data_type)
      return findOne?.rules || ''
    },
    // 获取有效表
    getAvailableTable(index) {
      let result = []
      let unavailableTable = []
      for (let i = 0; i < this.form.relation.length; i++) {
        if (index !== i) {
          unavailableTable.push(this.form.relation[i].table_name)
        }
      }
      this.getTableData &&
        this.getTableData.length &&
        this.getTableData.forEach(val => {
          if (unavailableTable.indexOf(val.original_name) >= 0) {
            return
          }
          result.push(val)
        })
      return result
    },
    // 获取关联字段数据
    async changeRecordTable(name) {
      this.fieldList = []
      let _this = this,
        id = ''
      this.getTableData.forEach(item => {
        if (item.original_name === name) {
          id = item.id
        }
      })
      let params = {
        filter: {
          fields: {
            id: true,
            original_name: true,
            fields: true,
            'fields.field_name': true,
            'fields.original_field_name': true
          }
        }
      }
      let data = await metadataInstancesApi.getId(id, params)
      let duplicateName = []
      if (_this.metadata.relation && _this.metadata.relation.length) {
        _this.metadata.relation.forEach(item => {
          item.fields.forEach(fieldName => {
            duplicateName.push(fieldName.local)
          })
        })
      }
      if (data) {
        let fieldsList = []
        for (let i = 0; i < _this.form.relation.length; i++) {
          if (_this.form.relation[i].table_name) {
            let index = data.original_name.indexOf(_this.form.relation[i].table_name)
            if (index > -1) {
              data.fields.forEach(field => fieldsList.push(field))
              fieldsList.map(item => {
                let isname = duplicateName.indexOf(item.field_name)
                if (isname == -1) {
                  _this.fieldList.push(item)
                }
              })
            }
          } else {
            _this.fieldList = data.fields
          }
        }
      }
    },

    // 获取字典模板数据
    async handleSelectTemplate(item) {
      let that = this
      if (
        ['String', 'Integer', 'Boolean', 'Short', 'Long', 'Float', 'Double', 'BigDecimal'].includes(
          that.form.data_type
        ) &&
        this.form.field_name
      ) {
        that.dialogDictionaryVisible = true

        that.dictionaryList = []
        let fieldsType

        if (item.data_type == 'String') {
          fieldsType = 'string'
        } else if (item.data_type == 'Boolean') {
          fieldsType = 'bool'
        } else {
          fieldsType = 'double'
        }
        let filter = {
          where: {
            dataType: fieldsType
          }
        }
        let result = await that.$api('Dictionary').get({ filter: JSON.stringify(filter) })
        if (result.data?.items) {
          that.dictionaryList = result.data.items || []
        }
      } else {
        if (!that.form.field_name) {
          that.$message.error(that.$t('metadata_details_fieldNameNo'))
        } else {
          that.$message.error(that.$t('metadata_details_dictionary_typeNo'))
        }
      }
    },

    // 选中字典模板数据
    handleSelectDictionary() {
      if (this.selectDictionaryTem) {
        this.dialogDictionaryVisible = false
        this.dictionaryList.forEach(item => {
          if (item.name === this.selectDictionaryTem) {
            this.form.dictionary = item.typearr
          }
        })
      }
    },

    // 新增字典模板
    addDictionary() {
      if (
        ['String', 'Integer', 'Boolean', 'Short', 'Long', 'Float', 'Double', 'BigDecimal'].includes(
          this.form.data_type
        ) &&
        this.form.field_name
      ) {
        this.form.dictionary.push({
          name: this.form.field_name,
          key: '',
          value: ''
        })
      } else {
        if (!this.form.field_name) {
          this.$message.error(this.$t('metadata_details_fieldNameNo'))
        } else {
          this.$message.error(this.$t('metadata_details_dictionary_typeNo'))
        }
      }
    },
    // 删除字典模板
    delDictionary(index) {
      this.form.dictionary.splice(index, 1)
    },
    // 添加关联行
    addRelation() {
      let list = {
        table_name: '', //关联表id
        rel: '', //关联关系
        field_name: ''
      }
      if (!this.form.relation) {
        this.form.relation = []
      }
      this.form.relation.push(list)
    },
    //删除关联行
    delRelation(index) {
      this.form.relation.splice(index, 1)
    },

    // 关闭弹窗
    handleClose() {
      this.dialogFormVisible = false
      this.$emit('dialogVisible', false)
      this.$emit('update:dialogVisible', false)
    },

    // 保存数据
    save() {
      let groupRelation = {},
        fieldsArr = [],
        falg = false
      this.metadata.fields = this.metadata.fields?.length ? this.metadata.fields : []
      if (this.metadata.fields.includes(this.form.field_name)) {
        falg = true
      }
      let maxNum = Math.max.apply(
        Math,
        this.metadata.fields.map(field => {
          return field.primary_key_position
        })
      )
      // 主键值修改
      let primary_key_position_mum = this.form.primary_key_position
      if (this.form.primary_key) {
        this.form.primary_key_position = maxNum + 1
      } else {
        this.form.primary_key_position = 0
      }

      if (!this.data.id) {
        this.metadata.fields.push(this.form)
      }

      let fields = this.metadata.fields

      if (fields && fields.length) {
        fields.forEach(field => {
          if (!this.form.primary_key) {
            if (this.form.primary_key && field.primary_key_position * 1 > primary_key_position_mum * 1) {
              field.primary_key_position = field.primary_key_position - 1
            }
          }
          if (field.primary_key) {
            fieldsArr.push(field.field_name)
          }
          field.relation &&
            field.relation.length &&
            field.relation.forEach(item => {
              let key = item.table_name + item.rel
              if (groupRelation[key]) {
                groupRelation[key].fields.push({
                  local: item.field_name,
                  foreign: field.field_name
                })
              } else {
                groupRelation[key] = {
                  table_name: item.table_name,
                  rel: item.rel,
                  fields: [
                    {
                      local: item.field_name,
                      foreign: field.field_name
                    }
                  ]
                }
              }
            })
        })
      }
      let relation = Object.values(groupRelation)

      this.$refs.form.validate(async valid => {
        if (valid) {
          let params = {
            // field_name: this.form.field_name,
            // alias_name: this.form.alias_name,
            // comment: this.form.comment,
            // data_type: this.form.data_type,
            // is_auto_allowed: this.form.is_auto_allowed,
            // autoincrement: this.form.autoincrement,
            // primary_key_position: this.form.primary_key_position,
            // columnSize: this.form.columnSize,
            // precision: this.form.precision,
            // scale: this.form.scale,
            // dictionary: this.form.dictionary,
            fields: this.metadata.fields,
            relation: relation
          }
          if (!falg) {
            metadataInstancesApi.patchId(this.metadata.id, params).then(() => {
              this.dialogFormVisible = false
              this.$emit('dialogVisible', false)
              this.$message.success(this.$t('metadata_details_success_Release'))
            })
            // .catch(() => {
            // })
          } else {
            this.$message.error(this.$t('metadata_details_filedName_repeat'))
          }
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.e-form {
  width: 100%;
  font-size: 12px;
  overflow: hidden;
  .box {
    padding: 10px 20px;
    margin-bottom: 10px;
    background-color: map-get($bgColor, white);
    border-radius: 4px;
    box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.1);
    h2 {
      padding-bottom: 10px;
      font-weight: bold;
    }
    .addBtn {
      padding-top: 10px;
    }

    ::v-deep {
      .el-table {
        .el-table__body-wrapper {
          border: 1px solid #ebeef5;
        }
      }
    }
  }
}
</style>
<style lang="scss">
.metadata-info {
  .dialogInfo-form {
    min-width: 600px;
    height: 90%;
    margin: 50px auto 0 !important;
    overflow: hidden;
    .el-dialog__body {
      height: calc(100% - 120px);
      padding: 10px 20px 0;
      overflow: hidden;
      overflow-y: auto;
      background-color: rgba(238, 240, 243, 100);
      .cell {
        padding: 0;
        .el-input {
          .el-input__inner {
            border: 0;
          }
        }
        .el-button {
          padding-left: 10px;
        }
      }
      .el-form-item__label {
        width: 100px;
      }
      .el-form-item__content {
        display: inline-block;
        width: calc(100% - 100px);
      }
      .el-form-item {
        margin-bottom: 10px;
        .el-select {
          width: 100%;
        }
      }
      .e-table {
        th {
          padding: 4px 10px;
          // color: map-get($fontColor, light);
          // background-color: #eff1f4;
        }
        td {
          padding: 0;
        }
        .el-table__body-wrapper {
          border-bottom: 1px solid #ececec;
        }
      }
    }
    .el-dialog__footer {
      padding-top: 20px;
    }
  }
}
.dialogDictionary {
  max-height: 90%;
  overflow: hidden;
  .el-dialog__body {
    min-height: calc(100% - 126px);
    height: calc(100% - 126px);
    overflow: hidden;
    overflow-y: auto;
    background-color: map-get($bgColor, white);
  }
  li {
    padding: 5px 10px;
    cursor: pointer;
  }
  .active {
    background-color: rgba(238, 240, 243, 100);
  }
}
</style>
