<template>
  <div class="database-link nodeStyle">
    <head class="head">
      <span
        @click="hanleClose"
        class="headIcon iconfont icon-you2"
        type="primary"
      ></span>
      <span class="txt">{{ $t('editor.cell.link.mappingRelations') }}</span>
    </head>
    <div class="nodeBody">
      <!-- <div class="head-btns">
				<el-button v-if="disabled" class="e-button" type="primary" @click="seeMonitor">
					{{ $t('dataFlow.button.viewMonitoring') }}
				</el-button>
			</div> -->
      <el-form
        :disabled="disabled"
        class="e-form"
        label-position="top"
        label-width="160px"
        :model="model"
        ref="form"
        action="javascript:void(0);"
      >
        <el-form-item>
          <div class="e-label">
            <label class="el-form-item__label">{{
              $t('editor.cell.link.copySourceDatabase')
            }}</label>
            <el-popover
              class="aggtip"
              placement="top-start"
              width="400"
              trigger="hover"
            >
              <span>{{ $t('editor.cell.link.formTip') }}</span>
              <span class="icon iconfont icon-tishi1" slot="reference"></span>
            </el-popover>
          </div>

          <el-checkbox v-model="model.selectSourceDatabase.table" disabled
            >Table
            <el-popover placement="top-start" width="400" trigger="hover">
              <span>{{ $t('editor.cell.link.tableTip') }}</span>
              <span class="icon iconfont icon-tishi1" slot="reference"></span>
            </el-popover>
          </el-checkbox>

          <el-checkbox
            v-model="model.selectSourceDatabase.view"
            :disabled="mysqlDisable"
            @change="changeView"
            >View
            <el-popover placement="top-start" width="400" trigger="hover">
              <span>{{ $t('editor.cell.link.viewTip') }}</span>
              <span class="icon iconfont icon-tishi1" slot="reference"></span>
            </el-popover>
          </el-checkbox>

          <el-checkbox
            v-model="model.selectSourceDatabase.function"
            :disabled="mysqlDisable"
            >Function</el-checkbox
          >
          <el-checkbox
            v-model="model.selectSourceDatabase.procedure"
            :disabled="mysqlDisable"
            >Procedure</el-checkbox
          >
        </el-form-item>
        <el-form-item :label="$t('editor.cell.link.existingSchema.label')">
          <el-select v-model="model.dropType" size="mini">
            <el-option
              :label="$t('editor.cell.link.existingSchema.keepSchema')"
              value="no_drop"
            ></el-option>
            <el-option
              :label="$t('editor.cell.link.existingSchema.keepExistedData')"
              value="drop_data"
            ></el-option>
            <el-option
              v-if="targetDatabaseType === 'mongodb'"
              :label="$t('editor.cell.link.existingSchema.removeSchema')"
              value="drop_schema"
            ></el-option>
          </el-select>
        </el-form-item>
        <div class="database-tableBox" v-loading="transferLoading">
          <div class="box-text">
            <h3>
              {{ $t('editor.cell.link.migrationSetting')
              }}<i style="color: red"> *</i>
            </h3>
            <div class="box-btn">
              <el-button
                class="e-button"
                size="mini"
                :disabled="model.selectSourceDatabase.view"
                @click="handDialog"
                >{{ $t('dataFlow.changeName') }}</el-button
              >
              <el-button
                size="mini"
                class="e-button"
                :disabled="disabled || model.selectSourceDatabase.view"
                @click="handleReduction"
                >{{ $t('editor.cell.link.reduction') }}</el-button
              >
            </div>
          </div>
          <div class="transfer">
            <el-transfer
              filterable
              :titles="titles"
              :filter-method="filterMethod"
              :filter-placeholder="$t('editor.cell.link.searchContent')"
              v-model="model.selectSourceArr"
              :data="sourceData"
              @change="handleChangeTransfer"
              @right-check-change="handleSelectTable"
            >
              <span class="box" slot-scope="{ option }">
                <span
                  class="text"
                  :title="option.label"
                  :class="[{ active: option.label !== option.key }, 'text']"
                  >{{ option.label }}</span
                >
                <!-- <span class="nameStyle" @click="handleChageTransfer(option)">{{
								$t('dataFlow.changeName')
							}}</span> -->
              </span>
            </el-transfer>
          </div>
        </div>
      </el-form>
    </div>
    <el-dialog
      :title="$t('editor.cell.link.batchRename')"
      :visible.sync="dialogVisible"
      :modal-append-to-body="false"
      custom-class="databaseLinkDialog"
      :close-on-click-modal="false"
    >
      <el-form :model="model" :disabled="disabled">
        <el-row :gutter="80" class="e-row">
          <el-col :span="12">
            <el-form-item :label="$t('editor.cell.link.prefixPlaceholder')">
              <el-input
                v-model="model.table_prefix"
                autocomplete="off"
                maxlength="20"
                show-word-limit
                :placeholder="$t('editor.cell.link.prefixPlaceholder')"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('editor.cell.link.suffixPlaceholder')">
              <el-input
                v-model="model.table_suffix"
                autocomplete="off"
                maxlength="20"
                show-word-limit
                :placeholder="$t('editor.cell.link.suffixPlaceholder')"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="text">
        {{ $t('editor.cell.link.tableNameExample') }}: {{ model.table_prefix
        }}{{ exampleName }}{{ model.table_suffix }}
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">{{
          $t('dataVerify.cancel')
        }}</el-button>
        <el-button type="primary" @click="confirm">{{
          $t('dataVerify.confirm')
        }}</el-button>
      </div>
    </el-dialog>
    <!-- <el-dialog
			:title="$t('message.modifyName')"
			:visible.sync="modifyNameDialog"
			custom-class="modifyNameDialog"
			:close-on-click-modal="false"
		>
			<el-form>
				<el-form-item :label="$t('message.modifyName')">
					<el-input
						v-model="databaseName"
						autocomplete="off"
						:placeholder="$t('message.modifyName')"
					></el-input>
				</el-form-item>
			</el-form>

			<div slot="footer" class="dialog-footer">
				<el-button @click="modifyNameDialog = false">{{ $t('dataVerify.cancel') }}</el-button>
				<el-button type="primary" @click="confirmName">{{ $t('dataVerify.confirm') }}</el-button>
			</div>
		</el-dialog> -->
  </div>
</template>

<script>
import _ from 'lodash'
import log from '../../../log'
import factory from '../../../api/factory'
let connections = factory('connections')
let editorMonitor = null
let selectKeepArr = []
export default {
  name: 'databaseLink',

  data() {
    return {
      mysqlDisable: false,
      transferLoading: false,
      currentName: null,
      databaseName: '',
      modifyNameDialog: false,
      dialogVisible: false,
      disabled: false,
      logsFlag: false,
      exampleName: 'tableName',

      configJoinTable: false,
      sourceData: [],
      targetDatabaseType: '',
      model: {
        // label: '',
        table_prefix: '',
        table_suffix: '',
        dropType: 'no_drop',
        type: 'databaseLink',
        selectSourceArr: [],
        selectSourceDatabase: {
          table: true,
          view: false,
          function: false,
          procedure: false
        }
      },

      titles: [
        this.$t('editor.cell.link.migrationObjece'),
        this.$t('editor.cell.link.chosen')
      ]
    }
  },

  watch: {
    model: {
      deep: true,
      handler() {
        this.$emit('dataChanged', this.getData())
      }
    }
  },

  methods: {
    setData(data, cell, isSourceDataNode, vueAdapter) {
      if (data) {
        _.merge(this.model, data)
        // this.model.selectSourceDatabase = data.selectSourceDatabase;
      }
      this.cell = cell

      if (cell.getSourceCell()) {
        let sourceCell = this.cell.getSourceCell(),
          targetCell = this.cell.getTargetCell(),
          sourceDatabaseType = sourceCell.getFormData().database_type,
          targetDatabaseType =
            targetCell && targetCell.getFormData().database_type
              ? targetCell.getFormData().database_type
              : '',
          connectionId = sourceCell.getFormData().connectionId
        this.targetDatabaseType = targetDatabaseType
        this.mysqlDisable =
          sourceDatabaseType === 'mysql' && targetDatabaseType === 'mysql'
            ? false
            : true
        if (this.mysqlDisable) {
          this.model.selectSourceDatabase = {
            table: true,
            view: false,
            function: false,
            procedure: false
          }
        }
        // 获取目标节点的数据显示右侧选择表
        if (targetCell && this.model.selectSourceArr.length === 0) {
          let targetFormData = targetCell.getFormData()
          let selectTargetType = []
          debugger
          this.model.table_prefix = targetFormData.table_prefix
          this.model.table_suffix = targetFormData.table_suffix
          if (targetFormData.syncObjects && targetFormData.syncObjects.length) {
            targetFormData.syncObjects.forEach((item) => {
              selectTargetType.push(item.type)
              if (item.type === 'table') {
                this.model.selectSourceArr = item.objectNames
              }
            })
          }

          if (selectTargetType.length) {
            Object.keys(this.model.selectSourceDatabase).forEach((key) => {
              this.model.selectSourceDatabase[key] = selectTargetType.includes(
                key
              )
            })
          }
        }

        this.loadDataModels(connectionId)
      }

      editorMonitor = vueAdapter.editor
      this.configJoinTable = cell.configJoinTable && cell.configJoinTable()

      if (!this.configJoinTable) return
    },

    getData() {
      let result = JSON.parse(JSON.stringify(this.model))

      let includeTables = []
      for (let i = 0; i < this.sourceData.length; i++) {
        for (let j = 0; j < this.model.selectSourceArr.length; j++) {
          if (this.sourceData[i].key === this.model.selectSourceArr[j]) {
            includeTables.push(this.sourceData[i].key)
          }
        }
      }

      if (this.cell) {
        let targetCell = this.cell.getTargetCell()
        if (targetCell && targetCell.getFormData()) {
          let targetFormData = targetCell.getFormData()

          if (targetFormData) {
            targetFormData.dropType = this.model.dropType
            targetFormData.table_prefix = this.model.table_prefix
            targetFormData.table_suffix = this.model.table_suffix
            targetFormData.syncObjects = []
            if (this.model.selectSourceDatabase) {
              Object.keys(this.model.selectSourceDatabase).forEach((key) => {
                if (this.model.selectSourceDatabase[key]) {
                  targetFormData.syncObjects.push({
                    type: key,
                    objectNames:
                      key === 'table' ? this.model.selectSourceArr : []
                  })
                }
              })
            }
          }
        }
      }

      return result
    },

    // 改变view
    changeView(val) {
      if (val) {
        this.handleReduction()
      }
    },

    // 关闭当前页
    hanleClose() {
      editorMonitor.getRightSidebar().hide()
    },

    // 是否是编辑模式
    setDisabled(disabled) {
      this.disabled = disabled
    },

    // // 查看监控按钮
    // seeMonitor() {
    // 	editorMonitor.goBackMontior();
    // },

    // 修改名称
    handleChageTransfer(data) {
      this.modifyNameDialog = true
      this.currentName = data
    },

    // 穿梭框值改变的时候
    handleChangeTransfer() {
      this.sourceData.forEach((el) => {
        if (selectKeepArr.length && selectKeepArr.includes(el.key)) {
          el.label = el.key
        }
      })
      this.preFixSuffixData()
    },

    // 穿梭框搜索
    filterMethod(query, item) {
      return item.label.indexOf(query) > -1
    },

    // 已选择的表
    handleSelectTable(data) {
      selectKeepArr = data
    },

    // 添加前后缀弹窗开关
    handDialog() {
      this.dialogVisible = true
    },

    // 弹窗确认
    confirm() {
      this.dialogVisible = false
      this.preFixSuffixData()
    },

    // 添加前后缀数据处理
    preFixSuffixData() {
      if (this.sourceData.length && this.model.selectSourceArr.length) {
        let selectSourceArr = []
        this.model.selectSourceArr = Array.from(
          new Set(this.model.selectSourceArr)
        )
        this.sourceData.forEach((sourceName) => {
          this.model.selectSourceArr.map((k) => {
            if (k == sourceName.key) {
              selectSourceArr.push(k)
            }
          })
        })
        this.model.selectSourceArr = selectSourceArr
      }
      if (
        this.sourceData &&
        this.sourceData.length &&
        this.model.selectSourceArr.length
      ) {
        for (let i = 0; i < this.sourceData.length; i++) {
          for (let j = 0; j < this.model.selectSourceArr.length; j++) {
            if (this.sourceData[i].key === this.model.selectSourceArr[j]) {
              this.sourceData[i].label =
                this.model.table_prefix +
                this.sourceData[i].key +
                this.model.table_suffix
            }
          }
        }
      }
    },

    // 还原
    handleReduction() {
      this.model.table_suffix = ''
      this.model.table_prefix = ''
      if (this.sourceData.length) {
        for (let i = 0; i < this.sourceData.length; i++) {
          // for (let j = 0; j < selectKeepArr.length; j++) {
          for (let k = 0; k < this.model.selectSourceArr.length; k++) {
            if (
              // this.sourceData[i].label === selectKeepArr[j] &&
              this.sourceData[i].key === this.model.selectSourceArr[k]
            ) {
              this.sourceData[i].label = this.sourceData[i].key
              // this.sourceData[i].key = this.sourceData[i].label;
              // this.model.selectSourceArr[k] = this.sourceData[i].value;
            }
            // 	}
          }
        }
      }
    },

    // 获取表名称
    loadDataModels(connectionId) {
      let self = this
      if (!connectionId) {
        return
      }
      this.transferLoading = true
      connections
        .customQuery([connectionId], { schema: true })
        .then((result) => {
          if (result.data) {
            self.databaseInfo = result.data
            let tables = (result.data.schema && result.data.schema.tables) || []
            tables = tables.sort((t1, t2) =>
              t1.table_name > t2.table_name
                ? 1
                : t1.table_name === t2.table_name
                ? 0
                : -1
            )

            if (tables && tables.length) {
              this.sourceData = tables.map((table) => ({
                label: table.table_name,
                key: table.table_name,
                // value: table.table_name,
                disabled: this.disabled
              }))
              if (this.sourceData.length) {
                this.preFixSuffixData()
              }
            }
            self.$forceUpdate()
          }
        })
        .finally(() => {
          this.transferLoading = false
        })
    }

    // 修改名称弹窗返回
    // confirmName() {
    // 	let self = this;
    // 	for (let i = 0; i < this.sourceData.length; i++) {
    // 		for (let j = 0; j < self.model.selectSourceArr.length; j++) {
    // 			if (
    // 				this.sourceData[i].label === self.model.selectSourceArr[j] &&
    // 				this.sourceData[i].label === self.currentName.label
    // 			) {
    // 				this.sourceData[i].label = self.model.selectSourceArr[j] = this.sourceData[i].key =
    // 					self.databaseName;
    // 				this.sourceData[i].key = this.sourceData[i].label;
    // 			}
    // 		}
    // 	}

    // 	this.modifyNameDialog = false;
    // },
  },

  destroyed() {
    log('DatabaseLink.destroyed')
    if (this.unwatch) this.unwatch()
    if (this.targetCell) {
      this.targetCell.off('change:outputSchema', this.renderSchema, this)
    }
    delete this.unwatch
    delete this.cell
    delete this.targetCell
  }
}
</script>

<style lang="scss" scoped>
.database-link {
  .head {
    display: block;
  }
  .nodeBody {
    height: calc(100% - 30px);
    overflow: hidden;
  }
  .database-tableBox {
    padding-top: 10px;
    height: 640px;
    box-sizing: border-box;
    .box-text {
      display: flex;
      padding-bottom: 10px;
      justify-content: space-between;
      font-size: 12px;
      color: #333;
      h3 {
        color: #606266;
      }
      .box-btn {
        color: #48b6e2;
        cursor: pointer;
        .e-button {
          padding: 4px 10px;
          color: #666;
          background-color: #f5f5f5;
        }
      }
    }
  }
}
</style>
<style lang="scss">
.database-link {
  .database-tableBox {
    .el-checkbox__label {
      height: 30px;
      font-size: 12px !important;
      padding-right: 6px;
    }
    .el-transfer {
      height: 100%;
      .el-transfer-panel {
        width: 298px;
        .el-transfer-panel__body {
          .box {
            display: inline-block;
            .nameStyle {
              display: none;
              color: #48b6e2;
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
          background: #f5f5f5;
          .el-checkbox {
            height: 28px;
            line-height: 28px;
            overflow: hidden;
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
          background-color: #f5f5f5;
        }
      }
      .el-transfer-panel:nth-child(3) {
        .el-transfer-panel__body {
          .el-transfer-panel__item .el-checkbox__label:hover {
            .box .nameStyle {
              display: block;
            }
            .active {
              color: rgb(253, 176, 28) !important;
            }
          }
        }
      }
      .el-transfer__buttons {
        padding: 0 20px;
      }
    }
    .el-transfer-panel__item:hover {
      color: #666 !important;
    }
    .transfer {
      height: calc(100% - 32px) !important;
    }
    .el-transfer,
    .el-transfer-panel {
      height: 100% !important;
    }
    .el-transfer-panel__body {
      height: calc(100% - 38px) !important;
    }
    .el-checkbox-group {
      height: calc(100% - 32px);
      padding-bottom: 5px;
      box-sizing: border-box;
    }
    .el-transfer-panel__item {
      width: 100%;
      margin-right: 10px !important;
      box-sizing: border-box;
    }
  }
  .aggtip {
    vertical-align: middle;
    .iconfont {
      display: inline-block;
      color: #999;
      cursor: pointer;
      transform: rotate(-180deg);
    }
  }
}
.databaseLinkDialog {
  .e-row {
    padding: 0 50px;
  }
  .text {
    padding: 0 50px;
    color: #666;
  }
}
</style>
