<template>
	<div class="database-link nodeStyle" @scroll="$refs.mappingComp.position()">
		<head class="head">
			<span @click="hanleClose" class="headIcon iconfont icon-you2" type="primary"></span>
			<span class="txt">{{ $t('editor.cell.link.mappingRelations') }}</span>
		</head>
		<div class="nodeBody">
			<div class="head-btns">
				<el-button v-if="disabled" class="e-button" type="primary" @click="seeMonitor">
					{{ $t('dataFlow.button.viewMonitoring') }}
				</el-button>
			</div>
			<el-form
				:disabled="disabled"
				class="e-form"
				label-position="top"
				label-width="160px"
				:model="model"
				ref="form"
				action="javascript:void(0);"
			>
				<!-- <el-form-item :label="$t('editor.cell.link.form.label.label')">
					<el-input
						v-model="model.label"
						:placeholder="$t('editor.cell.link.form.label.placeholder')"
						size="mini"
						maxlength="50"
						show-word-limit
					>
					</el-input>
				</el-form-item> -->

				<el-form-item :label="$t('editor.cell.link.copySourceDatabase')">
					<el-checkbox v-model="model.selectSourceDatabase.table">Table</el-checkbox>
					<el-checkbox v-model="model.selectSourceDatabase.view">View</el-checkbox>
					<el-checkbox v-model="model.selectSourceDatabase.function">Function</el-checkbox>
					<el-checkbox v-model="model.selectSourceDatabase.procedure">Procedure</el-checkbox>
					<!-- <el-checkbox-group v-model="model.selectSourceDatabase">
						<el-checkbox label="table">Table</el-checkbox>
						<el-checkbox label="view">View</el-checkbox>
						<el-checkbox label="function">Function</el-checkbox>
						<el-checkbox label="procedure">Procedure</el-checkbox>
					</el-checkbox-group> -->
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
							:label="$t('editor.cell.link.existingSchema.removeSchema')"
							value="drop_schema"
						></el-option>
					</el-select>
				</el-form-item>
			</el-form>

			<div class="database-tableBox">
				<div class="box-text">
					<h3>{{ $t('editor.cell.link.migrationSetting') }}</h3>
					<div class="box-btn">
						<span @click="handDialog">{{ $t('editor.cell.link.prefixAndSuffix') }}</span>
						<span @click="handleReduction">{{ $t('editor.cell.link.reduction') }}</span>
					</div>
				</div>
				<div class="transfer">
					<el-transfer
						filterable
						:titles="titles"
						:filter-method="filterMethod"
						:filter-placeholder="$t('editor.cell.link.searchContent')"
						v-model="model.selectSourceArr"
						:data="model.sourceData"
						@change="handleChangeTransfer"
						@right-check-change="handleSelectTable"
					>
						<span class="box" slot-scope="{ option }">
							<span :class="[{ active: option.label !== option.value }, 'text']">{{ option.label }}</span>
							<!-- <span class="nameStyle" @click="handleChageTransfer(option)">{{
								$t('dataFlow.changeName')
							}}</span> -->
						</span>
					</el-transfer>
				</div>
			</div>
		</div>
		<el-dialog
			:title="$t('editor.cell.link.batchRename')"
			:visible.sync="dialogVisible"
			custom-class="databaseLinkDialog"
			:close-on-click-modal="false"
		>
			<el-form :model="model">
				<el-row :gutter="80" class="e-row">
					<el-col :span="12">
						<el-form-item :label="$t('editor.cell.link.prefixPlaceholder')">
							<el-input
								v-model="model.table_prefix"
								@input="handlePrefix"
								autocomplete="off"
								:placeholder="$t('editor.cell.link.prefixPlaceholder')"
							></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item :label="$t('editor.cell.link.suffixPlaceholder')">
							<el-input
								v-model="model.table_suffix"
								@input="handleSuffix"
								autocomplete="off"
								:placeholder="$t('editor.cell.link.suffixPlaceholder')"
							></el-input>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
			<div class="text">{{ $t('editor.cell.link.tableNameExample') }}: {{ exampleName }}</div>
			<div slot="footer" class="dialog-footer">
				<el-button @click="dialogVisible = false">{{ $t('dataVerify.cancel') }}</el-button>
				<el-button type="primary" @click="confirm">{{ $t('dataVerify.confirm') }}</el-button>
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
import _ from 'lodash';
import log from '../../../log';
let editorMonitor = null;
let selectKeepArr = [];
export default {
	name: 'databaseLink',

	data() {
		return {
			currentName: null,
			databaseName: '',
			modifyNameDialog: false,
			dialogVisible: false,
			disabled: false,
			logsFlag: false,
			exampleName: 'tableName',

			configJoinTable: false,
			model: {
				// label: '',
				table_prefix: '',
				table_suffix: '',
				dropType: 'no_drop',
				type: 'databaseLink',
				sourceData: [],
				selectSourceArr: [],
				selectSourceDatabase: {
					table: true,
					view: false,
					function: false,
					procedure: false
				}

				// selectSourceDatabase: ['table']
			},

			titles: [this.$t('editor.cell.link.migrationObjece'), this.$t('editor.cell.link.chosen')]
		};
	},

	watch: {
		model: {
			deep: true,
			handler() {
				this.$emit('dataChanged', this.getData());
			}
		}
	},

	methods: {
		setData(data, cell, isSourceDataNode, vueAdapter) {
			if (data) {
				_.merge(this.model, data);
				// this.model.selectSourceDatabase = data.selectSourceDatabase;
			}
			this.cell = cell;
			this.model.sourceData = [];
			if (cell.getSourceCell()) {
				let sourceCell = this.cell.getSourceCell(),
					// targetCell = this.cell.getTargetCell(),
					sourceTable = sourceCell ? sourceCell.getFormData().databaseTables : [];

				if (sourceTable && sourceTable.length) {
					sourceTable.forEach(table => {
						this.model.sourceData.push({
							label: table,
							key: table,
							value: table
						});
					});
				}
				// }
			}

			editorMonitor = vueAdapter.editor;
			this.configJoinTable = cell.configJoinTable && cell.configJoinTable();

			if (!this.configJoinTable) return;
		},

		getData() {
			let result = JSON.parse(JSON.stringify(this.model));

			let includeTables = [];
			for (let i = 0; i < this.model.sourceData.length; i++) {
				for (let j = 0; j < this.model.selectSourceArr.length; j++) {
					if (this.model.sourceData[i].label === this.model.selectSourceArr[j]) {
						includeTables.push(this.model.sourceData[i].value);
					}
				}
			}

			if (this.cell) {
				// let linkFormData = null;
				let targetCell = this.cell.getTargetCell();
				let targetFormData = targetCell.getFormData();
				// if (targetCell.length && targetCell[0].getFormData()) {
				// 	linkFormData = targetCell[0].getFormData();
				// }

				if (targetFormData) {
					targetFormData.dropType = this.model.dropType;
					targetFormData.table_prefix = this.model.table_prefix;
					targetFormData.table_suffix = this.model.table_suffix;
					targetFormData.syncObjects = [];
					if (this.model.selectSourceDatabase) {
						Object.keys(this.model.selectSourceDatabase).forEach(key => {
							if (this.model.selectSourceDatabase[key]) {
								targetFormData.syncObjects.push({
									type: key,
									objectNames: key === 'table' ? includeTables : []
								});
							}
						});
					}
				}
			}

			return result;
		},

		// 关闭当前页
		hanleClose() {
			editorMonitor.getRightSidebar().hide();
		},

		// 是否是编辑模式
		setDisabled(disabled) {
			this.disabled = disabled;
		},

		// 查看监控按钮
		seeMonitor() {
			editorMonitor.goBackMontior();
		},

		// 修改名称
		handleChageTransfer(data) {
			this.modifyNameDialog = true;
			this.currentName = data;
		},

		// 穿梭框值改变的时候
		handleChangeTransfer() {
			this.model.sourceData.forEach(el => {
				if (selectKeepArr.length && selectKeepArr.includes(el.label)) {
					el.label = el.key = el.value;
				}
			});
		},

		//

		// 修改名称弹窗返回
		// confirmName() {
		// 	let self = this;
		// 	for (let i = 0; i < this.model.sourceData.length; i++) {
		// 		for (let j = 0; j < self.model.selectSourceArr.length; j++) {
		// 			if (
		// 				this.model.sourceData[i].label === self.model.selectSourceArr[j] &&
		// 				this.model.sourceData[i].label === self.currentName.label
		// 			) {
		// 				this.model.sourceData[i].label = self.model.selectSourceArr[j] = this.model.sourceData[i].key =
		// 					self.databaseName;
		// 				this.model.sourceData[i].key = this.model.sourceData[i].label;
		// 			}
		// 		}
		// 	}

		// 	this.modifyNameDialog = false;
		// },

		// 穿梭框搜索
		filterMethod(query, item) {
			return item.label.indexOf(query) > -1;
		},

		// 已选择的表
		handleSelectTable(data) {
			selectKeepArr = data;
		},

		// 添加前后缀弹窗开关
		handDialog() {
			this.dialogVisible = true;
		},

		// 前缀输入框改变
		handlePrefix(val) {
			this.exampleName = 'tableName';
			if (val) {
				this.exampleName = val + this.exampleName + this.model.table_suffix;
			}
		},

		// 后缀输入改变
		handleSuffix(val) {
			this.exampleName = 'tableName';
			if (val) {
				this.exampleName = this.model.table_prefix + this.exampleName + val;
			}
		},

		// 弹窗确认
		confirm() {
			this.dialogVisible = false;
			// this.handleSelectTable(selectKeepArr);

			for (let i = 0; i < this.model.sourceData.length; i++) {
				for (let j = 0; j < this.model.selectSourceArr.length; j++) {
					if (this.model.sourceData[i].label === this.model.selectSourceArr[j]) {
						this.model.sourceData[i].label =
							this.model.table_prefix + this.model.sourceData[i].value + this.model.table_suffix;
						this.model.sourceData[i].key = this.model.sourceData[i].label;

						this.model.selectSourceArr[j] = this.model.sourceData[i].label;
					}
				}
			}
			// for (let j = 0; j < this.model.selectSourceArr.length; j++) {
			// 	// for (let i = 0; i < selectKeepArr.length; i++) {
			// 	// if (this.model.selectSourceArr[j] === selectKeepArr[i]) {
			// 	this.model.selectSourceArr[j] =
			// 		this.model.table_prefix + this.model.selectSourceArr[j] + this.model.table_suffix;
			// 	// }
			// 	// }
			// }
		},

		// 还原
		handleReduction() {
			this.model.table_suffix = '';
			this.model.table_prefix = '';
			if (this.model.sourceData.length) {
				for (let i = 0; i < this.model.sourceData.length; i++) {
					// for (let j = 0; j < selectKeepArr.length; j++) {
					for (let k = 0; k < this.model.selectSourceArr.length; k++) {
						if (
							// this.model.sourceData[i].label === selectKeepArr[j] &&
							this.model.sourceData[i].label === this.model.selectSourceArr[k]
						) {
							this.model.sourceData[i].label = this.model.sourceData[i].value;
							this.model.sourceData[i].key = this.model.sourceData[i].label;
							this.model.selectSourceArr[k] = this.model.sourceData[i].value;
						}
						// 	}
					}
				}
			}
		}
	},

	destroyed() {
		log('Link.destroyed');
		if (this.unwatch) this.unwatch();
		if (this.targetCell) {
			this.targetCell.off('change:outputSchema', this.renderSchema, this);
		}
		delete this.unwatch;
		delete this.cell;
		delete this.targetCell;
	}
};
</script>

<style lang="less" scoped>
.database-link {
	.head {
		display: block;
	}
	.database-tableBox {
		padding-top: 10px;
		height: 630px;
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
			}
		}
	}
}
</style>
<style lang="less">
.database-link {
	.database-tableBox {
		.el-checkbox__label {
			height: 30px;
			font-size: 12px !important;
			padding-right: 6px;
		}
		.el-transfer {
			.el-transfer-panel {
				width: 300px;
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
							width: 119px;
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
		.transfer,
		.el-transfer,
		.el-transfer-panel {
			height: 100% !important;
		}
		.el-checkbox-group {
			height: 594px;
		}
		.el-transfer-panel__item {
			width: 100%;
			margin-right: 10px !important;
			box-sizing: border-box;
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
