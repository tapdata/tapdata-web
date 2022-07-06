<template>
  <section class="tapdata-transfer-wrap">
    <div class="box-btn" v-show="!showOperationBtn">
      <el-button class="e-button" size="mini" @click="dialogVisible = true">{{ $t('dataFlow.changeName') }} </el-button>
      <el-button size="mini" class="e-button" @click="handleReduction"
        >{{ $t('editor.cell.link.reduction') }}
      </el-button>
    </div>
    <el-transfer
      filterable
      :titles="titles"
      :filter-method="filterMethod"
      :filter-placeholder="$t('editor.cell.link.searchContent')"
      v-model="selectSourceArr"
      :data="sourceData"
      @change="handleChangeTransfer"
      @right-check-change="handleSelectTable"
    >
      <span slot-scope="{ option }">
        <span> {{ option.label }}</span>
      </span>
    </el-transfer>
    <el-dialog
      title="字段映射"
      :visible.sync="dialogFileVisible"
      :modal-append-to-body="true"
      custom-class="databaseLinkDialog"
      :close-on-click-modal="false"
      width="70%"
    >
      <el-transfer
        filterable
        :titles="transferTitles"
        :filter-method="filterMethod"
        :filter-placeholder="$t('editor.cell.link.searchContent')"
        v-model="selectSourceFileArr"
        :data="sourceFileData"
        @change="handleChangeFileTransfer"
        class="field-transfer"
      >
        <span slot-scope="{ option }">
          <span v-show="!option.showInput"> {{ option.label }}</span>
          <span v-show="option.showInput" class="field-transfer__input">
            <el-input
              v-model="option.label"
              autofocus
              maxlength="50"
              minlength="1"
              @keyup.13.native="checkInput(option)"
              :ref="option.id"
            ></el-input>
            <i class="el-icon-close" @click.stop.prevent="closeInput(option)"></i>
            <VIcon class="v-icon-check" size="14" @click.stop.prevent="checkInput(option)">check</VIcon>
          </span>
          <span
            v-if="selectSourceFileArr.includes(option.key)"
            @click.stop.prevent="rename(option)"
            class="el-icon-edit field-transfer__icon"
          ></span>
        </span>
      </el-transfer>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelFileOperations">{{ $t('dataVerify.cancel') }}</el-button>
        <el-button type="primary" @click="saveFileOperations">{{ $t('dataVerify.confirm') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :title="$t('editor.cell.link.batchRename')"
      :visible.sync="dialogVisible"
      :modal-append-to-body="false"
      custom-class="databaseLinkDialog"
      :close-on-click-modal="false"
    >
      <el-form :rules="rules" ref="form" :model="formData">
        <el-row :gutter="80" class="e-row">
          <el-col :span="12">
            <el-form-item :label="$t('editor.cell.link.prefixPlaceholder')" prop="table_prefix">
              <el-input
                v-model="formData.table_prefix"
                autocomplete="off"
                maxlength="50"
                show-word-limit
                size="mini"
                :placeholder="$t('editor.cell.link.prefixPlaceholder')"
              ></el-input>
            </el-form-item>
            <div class="tip">
              <span>以英文字母开头，仅支持英文、数字、下划线、点、中划线，限0~50字符</span>
              <div>前缀不允许以 system 开头</div>
            </div>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('editor.cell.link.suffixPlaceholder')" prop="table_suffix">
              <el-input
                v-model="formData.table_suffix"
                autocomplete="off"
                maxlength="50"
                show-word-limit
                size="mini"
                :placeholder="$t('editor.cell.link.suffixPlaceholder')"
              ></el-input>
            </el-form-item>
            <div class="tip">
              <span>以英文字母、下划线开头，仅支持英文、数字、下划线、点、中划线，限0~50字符</span>
            </div>
          </el-col>
        </el-row>
      </el-form>
      <div class="text">
        {{ `${$t('editor.cell.link.tableNameExample')}: ${formData.table_prefix}tablename${formData.table_suffix}` }}
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">{{ $t('dataVerify.cancel') }} </el-button>
        <el-button type="primary" @click="changeName">{{ $t('dataVerify.confirm') }} </el-button>
      </div>
    </el-dialog>
  </section>
</template>

<script>
let selectKeepArr = []
import { cloneDeep } from 'lodash'
import VIcon from '@/components/VIcon'
import { connectionsApi, metadataInstancesApi } from '@tap/api'
export default {
  components: { VIcon },
  props: ['transferData', 'isTwoWay'],
  data() {
    var validatePrefix = (rule, value, callback) => {
      if (value === '') {
        callback()
      } else if (!/^[a-zA-Z]([a-zA-Z0-9_\-.])*$/.test(value)) {
        callback(new Error('请按照以下规则输入: '))
      } else if (/^(system).*/.test(value)) {
        callback(new Error('请按照以下规则输入: '))
      } else {
        callback()
      }
    }
    var validateSuffix = (rule, value, callback) => {
      if (value === '') {
        callback()
      } else if (!/^[a-zA-Z_][a-zA-Z0-9_\-.]*$/.test(value)) {
        callback(new Error('请按照以下规则输入: '))
      } else {
        callback()
      }
    }
    return {
      transferLoading: false,
      showOperationBtn: false,
      sourceData: [],
      selectSourceArr: [],
      titles: [this.$t('editor.cell.link.migrationObjece'), this.$t('editor.cell.link.chosen')],
      formData: {
        table_prefix: '',
        table_suffix: ''
      },
      dialogVisible: false,
      type: '',
      rules: {
        table_prefix: [{ validator: validatePrefix, trigger: 'blur' }],
        table_suffix: [{ validator: validateSuffix, trigger: 'blur' }]
      },
      dialogFileVisible: false,
      transferTitles: ['待映射字段', '已映射字段'],
      selectSourceFileArr: [],
      sourceFileData: [],
      currentTableId: '',
      currentTableName: '',
      operations: [], //存储字段改名操作,
      field_process: []
    }
  },
  methods: {
    //获取左边数据
    getTable(id, bidirectional) {
      this.transferLoading = true
      connectionsApi
        .customQuery([id], { schema: true })
        .then(result => {
          if (result) {
            let tables = (result?.schema && result?.schema.tables) || []
            tables = tables.sort((t1, t2) =>
              t1.table_name > t2.table_name ? 1 : t1.table_name === t2.table_name ? 0 : -1
            )
            if (tables && tables.length) {
              this.sourceData = tables.map(table => ({
                label: table.table_name,
                key: table.table_name,
                disabled: this.disabled,
                id: table.id
              }))
            }
            //初始化数据
            if (this.transferData) {
              this.formData.table_prefix = this.transferData.table_prefix
              this.formData.table_suffix = this.transferData.table_suffix
              this.selectSourceArr = this.transferData.selectSourceArr
              this.field_process = this.transferData.field_process
            }
            if (bidirectional && (this.transferData.table_prefix !== '' || this.transferData.table_suffix !== '')) {
              //true 表示 双向且有修改过前后缀
              this.formData.table_prefix = ''
              this.formData.table_suffix = ''
              this.selectSourceArr = []
              this.field_process = []
            }
            this.preFixSuffixData()
            this.$forceUpdate()
          }
        })
        .finally(() => {
          this.transferLoading = false
        })
    },
    //是否支持改名
    showOperation(showOperationBtn) {
      this.showOperationBtn = showOperationBtn
    },
    //点开字段处理
    handleFiled(option) {
      this.currentTableId = option.id
      this.currentTableName = option.key
      this.dialogFileVisible = true
      this.operations = [] //上一次的操作先清空
      this.getSchema(option.id)
    },
    //请求files
    getSchema(id) {
      let params = {
        filter: JSON.stringify({
          where: {
            id: id,
            is_deleted: false
          }
        })
      }
      metadataInstancesApi.schema(params).then(data => {
        if (data) {
          let fields = data?.records[0]?.schema?.tables[0]?.fields
          // 初始化所有字段都映射 只取顶级字段
          fields = fields.filter(field => field.field_name.indexOf('.') === -1)
          this.sourceFileData = fields.map(field => ({
            label: field.field_name,
            key: field.field_name,
            id: field.id,
            type: field.javaType,
            table_name: field.table_name,
            primary_key_position: field.primary_key_position,
            showInput: false
          }))
          this.selectSourceFileArr = fields.map(field => field.field_name)
          //初始化已有字段处理
          let field_process = this.field_process.filter(process => process.table_id === id)
          if (field_process.length > 0) {
            this.operations = cloneDeep(field_process[0].operations) || []
          }
          //解析operations
          if (this.operations.length === 0) return
          this.operations.forEach(operand => {
            if (operand.op === 'RENAME') {
              this.sourceFileData.forEach(file => {
                if (file.id === operand.id) {
                  file.label = operand.operand
                }
              })
            } else {
              this.selectSourceFileArr.forEach((check, index) => {
                if (check === operand.field) {
                  this.selectSourceFileArr.splice(index, 1)
                }
              })
            }
          })
        }
      })
    },
    //字段rename
    rename(option) {
      this.sourceFileData.forEach(file => {
        if (file.id === option.id) {
          file.showInput = true
        }
      })
      //将输入框自动获取焦点
      this.$nextTick(() => {
        this.$refs[option.id].focus()
      })
    },
    closeInput(option) {
      //是否改过名 在operations 查找
      let ops = []
      if (this.operations && this.operations.length > 0) {
        ops = this.operations.filter(v => v.id === option.id && v.op === 'RENAME')
      }
      this.sourceFileData.forEach(file => {
        if (file.id === option.id) {
          file.showInput = false
          file.label = ops.length > 0 ? ops[0].operand : option.key
        }
      })
    },
    //rename操作
    checkInput(option) {
      let existsName = this.handleExistsName(option) //检查是否重名
      if (existsName) {
        this.closeInput()
        return
      }
      //字段名限制
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(option.label)) {
        this.$message.error('以英文字母、下划线开头，仅支持英文、数字、下划线，限1~50字符')
        return
      }
      //rename类型
      let op = {
        op: 'RENAME',
        id: option.id,
        field: option.key,
        operand: option.label, //改过名的字段
        table_name: option.table_name,
        type: option.type,
        primary_key_position: option.primary_key_position,
        label: option.label
      }
      let ops = this.operations.filter(v => v.id === option.id && v.op === 'RENAME')
      if (ops.length === 0) {
        this.operations.push(op)
      } else {
        op = ops[0]
        op.operand = option.label
        op.label = option.label
      }
      this.sourceFileData.forEach(file => {
        if (file.id === option.id) {
          file.showInput = false
        }
      })
    },
    handleExistsName(option) {
      // 改名前查找同级中是否重名，若有则return且还原改动并提示
      let exist = false
      let filterData = this.sourceFileData.filter(
        v => option.label === v.label && this.selectSourceFileArr.includes(v.key)
      )
      if (filterData.length > 1) {
        this.$message.error(option.label + this.$t('message.exists_name'))
        exist = true
      }
      return exist
    },
    //删除操作
    remove(option) {
      for (let i = 0; i < this.operations.length; i++) {
        // 删除所有的rename的操作
        let ops = this.operations[i]
        if (ops.id === option.id && ops.op === 'RENAME') {
          this.operations.splice(i, 1)
        }
      }
      //若rename 还原name
      this.closeInput(option)
      //删除类型
      let op = {
        op: 'REMOVE',
        id: option.id,
        field: option.key,
        operand: true,
        table_name: option.table_name,
        type: option.type,
        primary_key_position: option.primary_key_position,
        label: option.label
      }
      this.operations.push(op)
    },
    cancelRemove(option) {
      for (let i = 0; i < this.operations.length; i++) {
        // 撤销删除操作
        let ops = this.operations[i]
        if (ops.id === option.id && ops.op === 'REMOVE') {
          this.operations.splice(i, 1)
        }
      }
      //若rename 还原name
      this.closeInput(option)
    },
    handleChangeFileTransfer(keys, direction, checkData) {
      checkData.forEach(file => {
        this.sourceFileData.forEach(v => {
          if (v.key === file && direction === 'left') {
            this.remove(v)
          } else if (v.key === file && direction === 'right') {
            //当前选中的值与右边的比较 重名则不允许移动
            let result = this.checkLeftFile(file)
            if (result) {
              this.$message.error(file + '与右边的字段有重复名称，不允许再移动')
              this.selectSourceFileArr.splice(
                this.selectSourceFileArr.findIndex(item => item === file),
                1
              ) //再将值塞回去
            } else this.cancelRemove(v)
          }
        })
      })
    },
    //左边过滤字段是否与右边重名（右边重名过）
    checkLeftFile(file) {
      let result = false
      let targetFile = this.sourceFileData.filter(v => v.key !== file && v.label === file)
      if (targetFile.length > 0) {
        result = true
      }
      return result
    },
    // 穿梭框值改变的时候 (重命名 或者还原)
    handleChangeTransfer() {
      this.sourceData.forEach(el => {
        if (selectKeepArr.length && selectKeepArr.includes(el.key)) {
          el.label = el.key
        }
      })
      this.preFixSuffixData()
    },
    saveFileOperations() {
      //如果右边为空  则提示不可以保存
      if (this.selectSourceFileArr.length === 0) {
        this.$message.error('映射字段不能为空')
        return
      }
      this.dialogFileVisible = false
      let field_process = {
        table_id: this.currentTableId,
        table_name: this.currentTableName,
        operations: this.operations
      }
      if (this.field_process && this.field_process.length > 0) {
        let process = this.field_process.filter(fields => fields.table_id === this.currentTableId)
        if (process.length > 0) {
          field_process = process[0]
          field_process.table_id = this.currentTableId
          field_process.table_name = this.currentTableName
          field_process.operations = this.operations
        } else this.field_process.push(field_process)
      } else this.field_process.push(field_process)
    },
    cancelFileOperations() {
      this.dialogFileVisible = false
      this.operations = []
      this.sourceFileData = []
      this.currentTableId = ''
      this.currentTableName = ''
      this.selectSourceFileArr = []
    },
    // 穿梭框搜索
    filterMethod(query, item) {
      if (!!~item.label.indexOf(query) || !!~item.label.toUpperCase().indexOf(query.toUpperCase())) {
        return true
      }
      //return item.label.indexOf(query) > -1
    },
    // 已选择的表
    handleSelectTable(data) {
      selectKeepArr = data
    },
    changeName() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.dialogVisible = false
          this.preFixSuffixData()
        }
      })
    },
    handleCancel() {
      this.formData.table_suffix = ''
      this.formData.table_prefix = ''
      this.$refs.form.clearValidate()
      this.dialogVisible = false
    },
    //还原
    handleReduction() {
      this.formData.table_suffix = ''
      this.formData.table_prefix = ''
      if (this.sourceData.length) {
        for (let i = 0; i < this.sourceData.length; i++) {
          for (let k = 0; k < this.selectSourceArr.length; k++) {
            if (this.sourceData[i].key === this.selectSourceArr[k]) {
              this.sourceData[i].label = this.sourceData[i].key
            }
          }
        }
      }
    },
    // 添加前后缀数据处理
    preFixSuffixData() {
      if (this.sourceData.length && this.selectSourceArr.length) {
        let selectSourceArr = []
        this.selectSourceArr = Array.from(new Set(this.selectSourceArr))
        this.sourceData.forEach(sourceName => {
          this.selectSourceArr.map(k => {
            if (k === sourceName.key) {
              selectSourceArr.push(k)
            }
          })
        })
        this.selectSourceArr = selectSourceArr
      }
      if (this.sourceData && this.sourceData.length && this.selectSourceArr.length) {
        for (let i = 0; i < this.sourceData.length; i++) {
          for (let j = 0; j < this.selectSourceArr.length; j++) {
            if (this.sourceData[i].key === this.selectSourceArr[j]) {
              this.sourceData[i].label =
                this.formData.table_prefix + this.sourceData[i].key + this.formData.table_suffix
            }
          }
        }
      }
    },
    returnData() {
      return {
        selectSourceArr: this.selectSourceArr,
        table_prefix: this.formData.table_prefix,
        table_suffix: this.formData.table_suffix,
        field_process: this.field_process || []
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.tapdata-transfer-wrap {
  display: flex;
  flex-direction: column;

  .box-btn {
    display: flex;
    justify-content: flex-end;
    width: 88.5%;
    margin-bottom: 10px;
    padding: 4px 10px;
  }

  .tip {
    color: map-get($fontColor, light);
    font-size: 12px;
    margin-bottom: 10px;
  }
  .field-transfer__icon {
    display: inline-block;
    margin-left: 15px;
  }
}
.field-transfer {
  .el-icon-close {
    display: inline-block;
    position: absolute;
    right: 30px;
    top: 10px;
  }
  .v-icon-check {
    display: inline-block;
    position: absolute;
    right: 10px;
    top: 10px;
  }
  .field-transfer__icon {
    display: inline-block;
    margin-left: 15px;
  }
}
</style>
<style lang="scss">
.tapdata-transfer-wrap {
  height: 100%;

  .el-transfer-panel .el-transfer-panel__header .el-checkbox .el-checkbox__label {
    height: 30px;
    font-size: 12px;
    padding-right: 6px;
  }

  .el-transfer {
    height: 100%;

    .el-transfer-panel {
      width: 300px;

      .el-transfer-panel__body {
        .box {
          display: inline-block;

          .nameStyle {
            display: none;
            color: map-get($color, primary);
            float: right;
            font-size: 12px;
            padding-left: 10px;
          }

          .text {
            width: 230px;
            display: inline-block;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }

      .el-transfer-panel__header {
        height: 28px;
        line-height: 28px;
        background: map-get($bgColor, main);

        .el-checkbox {
          height: 28px;
          line-height: 28px;
        }
      }

      .el-transfer-panel__filter {
        margin: 10px;

        .el-input__inner {
          border-radius: 3px;
        }
      }

      .el-transfer__button {
        border-radius: 3px;
      }

      .el-transfer__button.is-disabled,
      .el-transfer__button.is-disabled:hover {
        background-color: map-get($bgColor, main);
      }
    }

    .el-transfer-panel:nth-child(3) {
      .el-transfer-panel__body {
        .el-transfer-panel__item .el-checkbox__label:hover {
          .box .nameStyle {
            display: block;
          }

          .active {
            color: rgb(253, 176, 28);
          }
        }
      }
    }

    .el-transfer__buttons {
      padding: 0 20px;
    }
  }

  .el-transfer-panel__item:hover {
    color: map-get($fontColor, light);
  }

  .transfer {
    height: calc(100% - 32px);
  }

  .el-transfer,
  .el-transfer-panel {
    height: 100%;
  }

  .el-transfer-panel__body {
    height: calc(100% - 38px);
  }

  .el-checkbox-group {
    height: calc(100% - 32px);
    padding-bottom: 5px;
    box-sizing: border-box;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .el-transfer-panel__item {
    width: 100%;
    margin-right: 10px;
    box-sizing: border-box;
  }

  .el-transfer-panel__list.is-filterable {
    height: calc(100% - 38px);
  }
  .field-transfer {
    .el-transfer-panel {
      width: 39%;
      .el-transfer-panel__body {
        height: 520px;
        .box {
          display: inline-block;

          .nameStyle {
            display: none;
            color: map-get($color, lprimary);
            float: right;
            font-size: 12px;
            padding-left: 10px;
          }

          .text {
            width: 230px;
            display: inline-block;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }

      .el-transfer-panel__header {
        height: 28px;
        line-height: 28px;
        background: map-get($bgColor, disable) !important;

        .el-checkbox {
          height: 28px;
          line-height: 28px;
        }
      }

      .el-transfer-panel__filter {
        margin: 10px;

        .el-input__inner {
          border-radius: 3px;
        }
      }

      .el-transfer__button {
        border-radius: 3px;
      }

      .el-transfer__button.is-disabled,
      .el-transfer__button.is-disabled:hover {
        background-color: map-get($bgColor, main);
      }
    }
    .field-transfer__input {
      .el-input__inner {
        height: 22px;
        line-height: 22px;
        font-size: 12px;
        width: 70%;
      }
    }
  }
}
</style>
