<template>
  <section class="validation-list-wrap">
    <div class="table-page-operation-bar">
      <el-button type="primary" size="mini" class="btn btn-create" @click="openCreateDialog">
        <!-- <i class="iconfont icon-jia add-btn-icon"></i> -->
        <span>{{ $t('metadata_details_validation_create') }}</span>
      </el-button>
    </div>

    <!-- 数据验证表格 start -->
    <el-table ref="table" class="table-page-table" :data="validationTableData">
      <el-table-column :label="$t('metadata_details_validation_field_name')" prop="field_name"> </el-table-column>
      <el-table-column :label="$t('metadata_details_validation_rule')" prop="rule">
        <template v-slot="scope">
          {{ scope.row.rule_def && scope.row.rule_def.rules ? scope.row.rule_def.rules : '' }}
        </template>
      </el-table-column>

      <el-table-column :label="$t('metadata_details_opera')" width="120">
        <template v-slot="scope">
          <!-- v-if="scope.row.name !== '_id_' && scope.row.status === 'created'" -->
          <el-button size="mini" type="text" style="color: #f56c6c" @click="remove(scope.row)">{{
            $t('button_delete')
          }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 数据验证表格 end -->
    <!-- 数据验证弹窗 start -->
    <el-dialog
      width="660px"
      custom-class="create-dialog"
      :title="$t('metadata_details_validation_create')"
      :close-on-click-modal="false"
      v-model="createDialogVisible"
    >
      <!-- 数据验证弹窗表单 start -->
      <el-form ref="form" :model="createForm" class="dataRule-form">
        <el-form-item :label="$t('metadata_details_validation_field_name')">
          <el-select
            v-model="createForm.field_name"
            size="mini"
            filterable
            allow-create
            default-first-option
            :placeholder="$t('dataRule_pleaseSelect') + $t('metadata_details_validation_field_name')"
          >
            <el-option v-for="item in fieldsArr" :key="item.value" :label="item.name" :value="item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('metadata_details_validation_ruleTem')">
          <el-select
            v-model="createForm.rule_def"
            size="mini"
            filterable
            default-first-option
            clearable
            :placeholder="$t('dataRule_pleaseSelect') + $t('metadata_details_validation_ruleTem')"
          >
            <el-option-group v-for="group in rulesArr" :key="group.label" :label="group.label">
              <el-option v-for="item in group.rulesData" :key="item.name" :label="item.name" :value="item.name">
              </el-option>
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('dataRule_rule')" required>
          <div class="template-box">
            <el-row>
              <el-col :span="0"></el-col>
              <el-col :span="6">
                <el-form-item
                  :rules="{
                    required: true,
                    message: $t('dictionary_isMappedvalue'),
                    trigger: 'blur'
                  }"
                >
                  <el-select
                    v-model="createForm.ruleType"
                    clearable
                    size="mini"
                    :placeholder="$t('dataRule_pleaseSelect') + $t('dataRule_classification')"
                  >
                    <el-option
                      v-for="item in ruleTypes"
                      :key="item.id"
                      :label="item.label"
                      :value="item.value"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="1"></el-col>
              <template v-if="createForm.ruleType === 'exists' || createForm.ruleType === 'nullable'">
                <el-col :span="17">
                  <el-form-item
                    prop="rule.checked"
                    :rules="{
                      required: true,
                      message: $t('dataRule_data_type_required'),
                      trigger: 'blur'
                    }"
                  >
                    <el-checkbox v-model="createForm.rule.checked"></el-checkbox>
                  </el-form-item>
                </el-col>
              </template>
              <template v-if="createForm.ruleType === 'type'">
                <el-col :span="17">
                  <el-form-item
                    prop="rule.dataType"
                    :rules="{
                      required: true,
                      message: $t('dataRule_data_type_required'),
                      trigger: 'blur'
                    }"
                  >
                    <el-select
                      v-model="createForm.rule.dataType"
                      size="mini"
                      :placeholder="$t('dataRule_pleaseSelect') + $t('dataRule_classification')"
                    >
                      <el-option
                        v-for="item in dataTypes"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
              </template>
              <template v-if="createForm.ruleType === 'regex'">
                <el-col :span="17">
                  <el-form-item
                    prop="rule.dataRegex"
                    :rules="{
                      required: true,
                      message: $t('dataRule_data_regex_required'),
                      trigger: 'blur'
                    }"
                  >
                    <el-input
                      v-model="createForm.rule.dataRegex"
                      size="mini"
                      :placeholder="$t('dataRule_pleaseInput') + $t('dataRule_data_Regex')"
                    ></el-input>
                  </el-form-item>
                </el-col>
              </template>
              <template v-if="createForm.ruleType === 'enum'">
                <el-col :span="17">
                  <el-form-item
                    prop="rule.enumData"
                    :rules="{
                      required: true,
                      message: $t('dataRule_enum_required'),
                      trigger: 'blur'
                    }"
                  >
                    <el-input
                      v-model="createForm.rule.enumData"
                      size="mini"
                      :placeholder="$t('dataRule_pleaseInput') + $t('dataRule_data_Enum')"
                    ></el-input>
                  </el-form-item>
                </el-col>
              </template>
              <template v-if="createForm.ruleType === 'range'">
                <el-col :span="createForm.rule.gt !== 'none' ? 3 : 4">
                  <el-form-item
                    prop="rule.gt"
                    :rules="{
                      required: true,
                      message: $t('dataRule_required'),
                      trigger: 'blur'
                    }"
                  >
                    <el-select
                      v-model="createForm.rule.gt"
                      size="mini"
                      :placeholder="$t('dataRule_pleaseSelect') + $t('dataRule_greater_that')"
                    >
                      <el-option label=">" value="gt"></el-option>
                      <el-option label=">=" value="gte"></el-option>
                      <el-option label="None" value="none"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="1"></el-col>
                <el-col :span="4" v-if="createForm.rule.gt !== 'none'">
                  <el-form-item prop="rule.gtData" :rules="gtDataRules">
                    <el-input
                      v-model.number="createForm.rule.gtData"
                      size="mini"
                      :placeholder="$t('dataRule_pleaseNum')"
                    ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="1" v-if="createForm.rule.gt !== 'none'"></el-col>
                <el-col :span="createForm.rule.lt !== 'none' ? 3 : 4">
                  <el-form-item
                    prop="rule.lt"
                    :rules="{
                      required: true,
                      message: $t('dataRule_required'),
                      trigger: 'blur'
                    }"
                  >
                    <el-select
                      v-model="createForm.rule.lt"
                      size="mini"
                      :placeholder="$t('dataRule_pleaseSelect') + $t('dataRule_less_that')"
                    >
                      <el-option label="<" value="lt"></el-option>
                      <el-option label="<=" value="lte"></el-option>
                      <el-option label="None" value="none"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="1"></el-col>
                <el-col :span="4" v-if="createForm.rule.lt !== 'none'">
                  <el-form-item prop="rule.ltData" :rules="ltDataRules">
                    <el-input
                      v-model.number="createForm.rule.ltData"
                      size="mini"
                      :placeholder="$t('dataRule_pleaseNum')"
                    ></el-input>
                  </el-form-item>
                </el-col>
              </template>
            </el-row>
          </div>
        </el-form-item>
      </el-form>
      <!-- 数据验证弹窗表单 end -->
      <template v-slot:footer>
        <span class="dialog-footer">
          <el-button @click="createDialogVisible = false" size="small">{{ $t('message_cancel') }}</el-button>
          <el-button type="primary" @click="createNewModel()" size="small">{{ $t('message_confirm') }}</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 数据验证弹窗 end -->
  </section>
</template>

<script>
import { dataRuleApi, metadataInstancesApi } from '@tap/api'
export default {
  props: {
    validaData: {
      type: Object,
      required: true
    }
  },
  data() {
    // 范围校验
    let validateisGt = (rule, value, callback) => {
      if (value === 'none' || parseFloat(value) > parseFloat(this.createForm.rule.ltData)) {
        callback(new Error(this.$t('dataRule_correct_rules')))
      } else {
        callback()
      }
    }
    let validateisLt = (rule, value, callback) => {
      if (value === 'none' || parseFloat(this.createForm.rule.gtData) > parseFloat(value)) {
        callback(new Error(this.$t('dataRule_correct_rules')))
      } else {
        callback()
      }
    }
    return {
      validationTableData: [],
      validationLevel: '',
      createDialogVisible: false,
      fieldsArr: [],
      rulesArr: [],
      createForm: {
        field_name: '',
        rule_def: '',
        ruleType: '',
        rule: {
          checked: true,
          dataType: '',
          dataRegex: '',
          gt: 'none',
          gtData: '',
          lt: 'none',
          ltData: '',
          enumData: '',
          instatus: 0
        }
      },
      ruleTypes: [
        { label: this.$t('dataRule_data_type'), value: 'type' },
        { label: this.$t('dataRule_data_Range'), value: 'range' },
        { label: this.$t('dataRule_data_Enum'), value: 'enum' },
        { label: this.$t('dataRule_data_Regex'), value: 'regex' },
        { label: this.$t('dataRule_data_Nullable'), value: 'nullable' }
      ],
      dataTypes: [
        { label: this.$t('dataRule_dataType_baseFloating'), value: 'double' },
        { label: this.$t('dataRule_dataType_baseObject'), value: 'Object' },
        { label: this.$t('dataRule_dataType_baseString'), value: 'string' },
        { label: this.$t('dataRule_dataType_baseArray'), value: 'array' },
        {
          label: this.$t('dataRule_dataType_baseBinarydata'),
          value: 'binData'
        },
        {
          label: this.$t('dataRule_dataType_baseUndefined'),
          value: 'undefined'
        },
        { label: 'ObjectId', value: 'objectId' },
        { label: this.$t('dataRule_dataType_baseBoolean'), value: 'bool' },
        { label: this.$t('dataRule_dataType_basedate'), value: 'date' },
        { label: this.$t('dataRule_dataType_baseNull'), value: 'null' },
        {
          label: this.$t('dataRule_dataType_baseRegularexpression'),
          value: 'regex'
        },
        { label: 'JavaScript', value: 'javascript' },
        { label: 'JavaScript (with scope)', value: 'javascriptWithScope' },
        { label: this.$t('dataRule_dataType_baseShorttype'), value: 'int' },
        {
          label: this.$t('dataRule_dataType_baseTimestamp'),
          value: 'timestamp'
        },
        { label: this.$t('dataRule_dataType_baseLonginteger'), value: 'long' },
        { label: 'Decimal128', value: 'decimal' }
      ],
      gtDataRules: [
        {
          required: true,
          message: this.$t('dataRule_required')
        },
        {
          type: 'number',
          message: this.$t('dataRule_pleaseNum')
        },
        {
          validator: validateisGt,
          trigger: 'blur'
        }
      ],
      ltDataRules: [
        {
          required: true,
          message: this.$t('dataRule_required')
        },
        {
          type: 'number',
          message: this.$t('dataRule_pleaseNum')
        },
        {
          validator: validateisLt,
          trigger: 'blur'
        }
      ]
    }
  },
  created() {
    this.validationTableData = this.validaData.data_rules?.rules || []
    this.validationLevel = this.validaData.validationLevel || 'off'
  },
  mounted() {
    if (this.validaData.fields?.length) {
      this.fieldsArr = this.validaData.fields.map(item => {
        return {
          name: item.alias_name || item.field_name,
          value: item.field_name
        }
      })
      let object = {}
      this.fildsArr =
        this.fildsArr?.length &&
        this.fildsArr.reduce((cur, next) => {
          if (!object[next.name]) {
            object[next.name] = true
            cur.push(next)
          }
          return cur
        }, [])
    }
  },
  watch: {
    'createForm.rule_def': {
      deep: true,

      handler(val) {
        let rules = {},
          _this = this
        if (_this.rulesArr && _this.rulesArr.length) {
          _this.rulesArr.forEach(item => {
            item.rulesData.forEach(childItem => {
              if (childItem.name === val) {
                rules = childItem
              }
            })
          })
        }
        this.applyRule(rules)
      }
    }
  },
  methods: {
    // 获取规则
    handleGetDataRule() {
      let _this = this
      let filter = {
        order: 'name ASC'
      }
      dataRuleApi
        .get({
          filter: JSON.stringify(filter)
        })
        .then(data => {
          let groupData = {}
          data?.items.forEach(v => {
            let key = v.classification || '__ungroup'
            if (!groupData[key]) {
              groupData[key] = []
            }
            groupData[key].push(v)
          })
          for (let [key, value] of Object.entries(groupData)) {
            if (key === '__ungroup') {
              key = _this.$t('metadata_details_validation_ungrouped')
            }
            _this.rulesArr.push({ label: key, rulesData: value })
          }
        })
    },
    // 创建数据校验弹窗
    openCreateDialog() {
      this.createDialogVisible = true
      this.handleGetDataRule()
      this.$nextTick(() => {
        this.$refs.form.clearValidate()
      })
      this.createForm = {
        field_name: '',
        rule_def: '',
        ruleType: '',
        rule: {}
      }
    },
    // 保存创建数据规则
    createNewModel() {
      let _this = this
      this.$refs.form.validate(valid => {
        if (valid) {
          let rule = {}

          if (_this.createForm.ruleType === 'exists' || _this.createForm.ruleType === 'nullable') {
            rule.rules = {
              [_this.createForm.ruleType]: _this.createForm.rule.checked
            }
          }
          if (_this.createForm.ruleType === 'type') {
            rule.rules = { type: _this.createForm.rule.dataType }
          }

          if (_this.createForm.ruleType === 'regex') {
            rule.rules = { regex: _this.createForm.rule.dataRegex }
          }

          if (_this.createForm.ruleType === 'range') {
            if (_this.createForm.rule.gt === _this.createForm.rule.lt) {
              _this.$message.error(_this.$t('dataRule_gt_lt_none'))
              return false
            }
            _this.createForm.gtData = _this.createForm.rule.gt === 'none' ? '0' : _this.createForm.rule.gtData
            _this.createForm.rule.ltData = _this.createForm.rule.lt === 'none' ? '0' : _this.createForm.rule.ltData
            rule.rules = {
              range: {
                [_this.createForm.rule.gt]: _this.createForm.rule.gtData,
                [_this.createForm.rule.lt]: _this.createForm.rule.ltData
              }
            }
          }
          if (_this.createForm.ruleType === 'enum') {
            rule.rules = { enum: this.createForm.rule.enumData.split(',') }
          }

          let rules = JSON.stringify(rule.rules)
          let data = {
            field_name: this.createForm.field_name,
            rule_def: Object.assign({}, this.createForm.rule, { rules: rules })
            //nullable: this.nullable
          }
          _this.validationTableData.push(data)

          this.doSave()
          this.createDialogVisible = false
          this.$message.success(this.$t('message_save_ok'))
        }
      })
    },

    async doSave() {
      let result = await metadataInstancesApi.patchId(this.validaData.id, {
        data_rules: { rules: this.validationTableData }
      })
      return result
    },

    applyRule(ruleData) {
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
      let rules = JSON.parse(ruleData.rules)
      if (rules && rules.hasOwnProperty('exists')) {
        // eslint-disable-line
        this.createForm.ruleType = 'exists'
        rule.checked = rules.exists
      } else if (rules.hasOwnProperty('nullable')) {
        // eslint-disable-line
        this.createForm.ruleType = 'nullable'
        rule.checked = rules.nullable
      } else if (rules && rules.hasOwnProperty('type')) {
        // eslint-disable-line
        this.createForm.ruleType = 'type'
        rule.dataType = rules.type
      } else if (rules && rules.hasOwnProperty('regex')) {
        // eslint-disable-line
        this.createForm.ruleType = 'regex'
        rule.dataRegex = rules.regex
      } else if (rules && rules.hasOwnProperty('range')) {
        // eslint-disable-line
        this.createForm.ruleType = 'range'
        let range = rules.range
        if (range.hasOwnProperty('lt')) {
          // eslint-disable-line
          rule.lt = 'lt'
        }
        if (range.hasOwnProperty('lte')) {
          // eslint-disable-line
          rule.lt = 'lte'
        }
        if (range.hasOwnProperty('gt')) {
          // eslint-disable-line
          rule.gt = 'gt'
        }
        if (range.hasOwnProperty('gte')) {
          // eslint-disable-line
          rule.gt = 'gte'
        }
        rule.ltData = parseFloat(range.lt) || parseFloat(range.lte) || range.none
        rule.gtData = parseFloat(range.gt) || parseFloat(range.gte) || range.none
      } else if (rules.hasOwnProperty('enum')) {
        // eslint-disable-line
        this.createForm.ruleType = 'enum'
        rule.enumData = rules.enum.join(',')
      }
      this.createForm.rule = rule
    },
    // 删除验证规则
    remove(item) {
      const h = this.$createElement
      let _this = this
      let message = h('p', [this.$t('message_deleteOrNot') + ' ' + item.field_name])
      this.$confirm(message, this.$t('message_title_prompt'), {
        type: 'warning',
        closeOnClickModal: false
      }).then(action => {
        if (action) {
          let idx = -1
          let i = 0
          _this.validationTableData?.length &&
            _this.validationTableData.forEach(v => {
              if (v.field_name === item.field_name) {
                idx = i
              }
              i++
            })
          _this.validationTableData.splice(idx, 1)
          this.doSave()
          this.$message.success(this.$t('message_deleteOK'))
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.validation-list-wrap {
  height: 100%;
  .table-page-operation-bar {
    margin-bottom: 10px;
    overflow: hidden;
    .btn-create {
      float: right;
      padding: 7px;
      // background: map-get($bgColor, main);
      i.iconfont {
        font-size: 12px;
      }
      &.btn-create {
        margin-left: 5px;
      }
    }
  }
}
</style>

<style lang="scss">
.validation-list-wrap {
  .create-dialog {
    .el-dialog__body {
      padding: 30px;
      .dataRule-form {
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
              justify-content: left;
            }
            .el-select {
              width: 100%;
            }
            .el-form-item__error {
              top: 82%;
            }
            .template-box {
              padding: 5px 0 8px;
              max-height: 350px;
              min-height: 50px;
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
    }
  }
}
</style>
