<template>
  <el-dialog
    width="600px"
    custom-class="create-dialog"
    :before-close="handleClose"
    :title="
      createForm && createForm.id
        ? $t('dataRule.editRule')
        : $t('dataRule.creatRule')
    "
    :close-on-click-modal="false"
    :append-to-body="true"
    :visible.sync="dialogVisible"
  >
    <el-form ref="form" :model="createForm" class="dataRule-form">
      <el-form-item :label="$t('dataRule.classification')">
        <el-select
          v-model="createForm.classification"
          size="mini"
          filterable
          allow-create
          default-first-option
          :placeholder="
            $t('dataRule.pleaseSelect') + $t('dataRule.classification')
          "
        >
          <el-option
            v-for="item in classificationArr"
            :key="item"
            :label="item"
            :value="item"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        :label="$t('dataRule.name')"
        prop="name"
        :rules="{
          required: true,
          message: $t('dataRule.nameCheck'),
          trigger: 'blur'
        }"
      >
        <el-input
          v-model="createForm.name"
          size="mini"
          :placeholder="$t('dataRule.pleaseInput') + $t('dataRule.name')"
        ></el-input>
      </el-form-item>
      <el-form-item :label="$t('dataRule.rule')" required>
        <div class="template-box">
          <el-row>
            <el-col :span="0"></el-col>
            <el-col :span="6">
              <el-form-item
                :rules="{
                  required: true,
                  message: $t('dictionary.isMappedvalue'),
                  trigger: 'blur'
                }"
              >
                <el-select
                  v-model="createForm.ruleType"
                  size="mini"
                  :placeholder="
                    $t('dataRule.pleaseSelect') + $t('dataRule.classification')
                  "
                >
                  <el-option
                    v-for="item in ruleTypes"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="1"></el-col>
            <template
              v-if="
                createForm.ruleType === 'exists' ||
                createForm.ruleType === 'nullable'
              "
            >
              <el-col :span="17">
                <el-form-item
                  prop="rule.checked"
                  :rules="{
                    required: true,
                    message: $t('dataRule.data_type_required'),
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
                    message: $t('dataRule.data_type_required'),
                    trigger: 'blur'
                  }"
                >
                  <el-select
                    v-model="createForm.rule.dataType"
                    size="mini"
                    :placeholder="
                      $t('dataRule.pleaseSelect') +
                      $t('dataRule.classification')
                    "
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
                    message: $t('dataRule.data_regex_required'),
                    trigger: 'blur'
                  }"
                >
                  <el-input
                    v-model="createForm.rule.dataRegex"
                    size="mini"
                    :placeholder="
                      $t('dataRule.pleaseInput') + $t('dataRule.data_Regex')
                    "
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
                    message: $t('dataRule.enum_required'),
                    trigger: 'blur'
                  }"
                >
                  <el-input
                    v-model="createForm.rule.enumData"
                    size="mini"
                    :placeholder="
                      $t('dataRule.pleaseInput') + $t('dataRule.data_Enum')
                    "
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
                    message: $t('dataRule.required'),
                    trigger: 'blur'
                  }"
                >
                  <el-select
                    v-model="createForm.rule.gt"
                    size="mini"
                    :placeholder="
                      $t('dataRule.pleaseSelect') + $t('dataRule.greater_that')
                    "
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
                    :placeholder="$t('dataRule.pleaseNum')"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="1" v-if="createForm.rule.gt !== 'none'"></el-col>
              <el-col :span="createForm.rule.lt !== 'none' ? 3 : 4">
                <el-form-item
                  prop="rule.lt"
                  :rules="{
                    required: true,
                    message: $t('dataRule.required'),
                    trigger: 'blur'
                  }"
                >
                  <el-select
                    v-model="createForm.rule.lt"
                    size="mini"
                    :placeholder="
                      $t('dataRule.pleaseSelect') + $t('dataRule.less_that')
                    "
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
                    :placeholder="$t('dataRule.pleaseNum')"
                  ></el-input>
                </el-form-item>
              </el-col>
            </template>
          </el-row>
        </div>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose" size="small">{{
        $t('message.cancel')
      }}</el-button>
      <el-button type="primary" @click="saveSubmit()" size="small">{{
        $t('message.confirm')
      }}</el-button>
    </span>
  </el-dialog>
</template>
<script>
export default {
  name: 'dataRuleForm',
  props: {
    createDialogVisible: {
      require: true,
      value: Boolean
    },
    formData: {
      value: Object
    }
  },
  data() {
    // 范围校验
    let validateisGt = (rule, value, callback) => {
      if (
        value === 'none' ||
        parseFloat(value) > parseFloat(this.createForm.rule.ltData)
      ) {
        callback(new Error(this.$t('dataRule.correct_rules')))
      } else {
        callback()
      }
    }
    let validateisLt = (rule, value, callback) => {
      if (
        value === 'none' ||
        parseFloat(this.createForm.rule.gtData) > parseFloat(value)
      ) {
        callback(new Error(this.$t('dataRule.correct_rules')))
      } else {
        callback()
      }
    }
    return {
      dialogVisible: this.createDialogVisible || false,
      classificationArr: [],
      createForm: {
        classification: '',
        name: '',
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
        { label: this.$t('dataRule.data_type'), value: 'type' },
        { label: this.$t('dataRule.data_Range'), value: 'range' },
        { label: this.$t('dataRule.data_Enum'), value: 'enum' },
        { label: this.$t('dataRule.data_Regex'), value: 'regex' },
        { label: this.$t('dataRule.data_Nullable'), value: 'nullable' }
      ],
      dataTypes: [
        { label: this.$t('dataRule.dataType.baseFloating'), value: 'double' },
        { label: this.$t('dataRule.dataType.baseObject'), value: 'Object' },
        { label: this.$t('dataRule.dataType.baseString'), value: 'string' },
        { label: this.$t('dataRule.dataType.baseArray'), value: 'array' },
        {
          label: this.$t('dataRule.dataType.baseBinarydata'),
          value: 'binData'
        },
        {
          label: this.$t('dataRule.dataType.baseUndefined'),
          value: 'undefined'
        },
        { label: 'ObjectId', value: 'objectId' },
        { label: this.$t('dataRule.dataType.baseBoolean'), value: 'bool' },
        { label: this.$t('dataRule.dataType.basedate'), value: 'date' },
        { label: this.$t('dataRule.dataType.baseNull'), value: 'null' },
        {
          label: this.$t('dataRule.dataType.baseRegularexpression'),
          value: 'regex'
        },
        { label: 'JavaScript', value: 'javascript' },
        { label: 'JavaScript (with scope)', value: 'javascriptWithScope' },
        { label: this.$t('dataRule.dataType.baseShorttype'), value: 'int' },
        {
          label: this.$t('dataRule.dataType.baseTimestamp'),
          value: 'timestamp'
        },
        { label: this.$t('dataRule.dataType.baseLonginteger'), value: 'long' },
        { label: 'Decimal128', value: 'decimal' }
      ],
      gtDataRules: [
        {
          required: true,
          message: this.$t('dataRule.required')
        },
        {
          type: 'number',
          message: this.$t('dataRule.pleaseNum')
        },
        {
          validator: validateisGt,
          trigger: 'blur'
        }
      ],
      ltDataRules: [
        {
          required: true,
          message: this.$t('dataRule.required')
        },
        {
          type: 'number',
          message: this.$t('dataRule.pleaseNum')
        },
        {
          validator: validateisLt,
          trigger: 'blur'
        }
      ]
    }
  },
  created() {
    if (this.formData && this.formData.id) {
      this.createForm = Object.assign({}, this.formData)
    }
  },
  methods: {
    handleClose() {
      this.dialogVisible = false
      this.$emit('createDialogVisible', false)
      this.$emit('update:createDialogVisible', false)
    },
    saveSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const id = this.createForm.id
          const method = id ? 'patch' : 'post'
          let rule = {}

          if (
            this.createForm.ruleType === 'exists' ||
            this.createForm.ruleType === 'nullable'
          ) {
            rule.rules = {
              [this.createForm.ruleType]: this.createForm.rule.checked
            }
          }
          if (this.createForm.ruleType === 'type') {
            rule.rules = { type: this.createForm.rule.dataType }
          }

          if (rule.ruleType === 'regex') {
            rule.rules = { regex: this.createForm.rule.dataRegex }
          }

          if (this.createForm.ruleType === 'range') {
            if (this.createForm.rule.gt === this.createForm.rule.lt) {
              this.$message.error(this.$t('dataRule.gt_lt_none'))
              return false
            }
            this.createForm.gtData =
              this.createForm.rule.gt === 'none'
                ? '0'
                : this.createForm.rule.gtData
            this.createForm.rule.ltData =
              this.createForm.rule.lt === 'none'
                ? '0'
                : this.createForm.rule.ltData
            rule.rules = {
              range: {
                [this.createForm.rule.gt]: this.createForm.rule.gtData,
                [this.createForm.rule.lt]: this.createForm.rule.ltData
              }
            }
          }
          if (this.createForm.ruleType === 'enum') {
            rule.rules = { enum: this.createForm.rule.enumData.split(',') }
          }

          let rules = JSON.stringify(rule.rules)
          rule.name = this.createForm.name.trim()
          rule.classification = this.createForm.classification.trim()
          rule.rules = rules
          if (this.createForm.id) {
            rule.id = this.createForm.id
          }

          this.$api('DataRule')
            [method](rule)
            .then(() => {
              this.$emit('createDialogVisible', true)
              this.$emit('update:createDialogVisible', true)
              this.$message.success(this.$t('message.saveOK'))
            })
            .catch(() => {
              this.$message.error(this.$t('message.saveFail'))
            })
        }
      })
    }
  }
}
</script>
<style lang="scss">
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
</style>
