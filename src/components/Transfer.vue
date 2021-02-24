<template>
	<section class="tapdata-transfer-wrap">
		<div class="box-btn">
			<el-button class="e-button" size="mini" @click="dialogVisible = true">{{
				$t('dataFlow.changeName')
			}}</el-button>
			<el-button size="mini" class="e-button" @click="handleReduction">{{
				$t('editor.cell.link.reduction')
			}}</el-button>
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
		</el-transfer>
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
				{{
					`${$t('editor.cell.link.tableNameExample')}: ${formData.table_prefix}tablename${
						formData.table_suffix
					}`
				}}
			</div>
			<div slot="footer" class="dialog-footer">
				<el-button @click="handleCancel">{{ $t('dataVerify.cancel') }}</el-button>
				<el-button type="primary" @click="changeName">{{ $t('dataVerify.confirm') }}</el-button>
			</div>
		</el-dialog>
	</section>
</template>

<script>
let selectKeepArr = [];
export default {
	props: {
		transferData: Array
	},
	data() {
		var validatePrefix = (rule, value, callback) => {
			if (value === '') {
				callback();
			} else if (!/^[a-zA-Z]([a-zA-Z0-9_\-.])*/.test(value)) {
				callback(new Error('请按照以下规则输入: '));
			} else if (/^(system).*/.test(value)) {
				callback(new Error('请按照以下规则输入: '));
			} else {
				callback();
			}
		};
		var validateSuffix = (rule, value, callback) => {
			if (value === '') {
				callback();
			} else if (!/^[a-zA-Z_][a-zA-Z0-9_\s-.]*$/.test(value)) {
				callback(new Error('请按照以下规则输入: '));
			} else {
				callback();
			}
		};
		return {
			transferLoading: false,
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
			}
		};
	},
	methods: {
		//获取左边数据
		getTable(id) {
			this.transferLoading = true;
			this.$api('connections')
				.customQuery([id], { schema: true })
				.then(result => {
					if (result.data) {
						let tables = (result.data.schema && result.data.schema.tables) || [];
						tables = tables.sort((t1, t2) =>
							t1.table_name > t2.table_name ? 1 : t1.table_name === t2.table_name ? 0 : -1
						);
						if (tables && tables.length) {
							this.sourceData = tables.map(table => ({
								label: table.table_name,
								key: table.table_name,
								disabled: this.disabled
							}));
						}
						//初始化数据
						if (this.transferData) {
							this.formData.table_prefix = this.transferData.table_prefix;
							this.formData.table_suffix = this.transferData.table_suffix;
							this.selectSourceArr = this.transferData.selectSourceArr;
						}
						this.preFixSuffixData();
						this.$forceUpdate();
					}
				})
				.finally(() => {
					this.transferLoading = false;
				});
		},
		// 穿梭框值改变的时候 (重命名 或者还原)
		handleChangeTransfer() {
			this.sourceData.forEach(el => {
				if (selectKeepArr.length && selectKeepArr.includes(el.key)) {
					el.label = el.key;
				}
			});
			this.preFixSuffixData();
		},
		// 穿梭框搜索
		filterMethod(query, item) {
			return item.label.indexOf(query) > -1;
		},
		// 已选择的表
		handleSelectTable(data) {
			selectKeepArr = data;
		},
		changeName() {
			this.$refs['form'].validate(valid => {
				if (valid) {
					this.dialogVisible = false;
					this.preFixSuffixData();
				}
			});
		},
		handleCancel() {
			this.formData.table_suffix = '';
			this.formData.table_prefix = '';
			this.$refs.form.clearValidate();
			this.dialogVisible = false;
		},
		//还原
		handleReduction() {
			this.formData.table_suffix = '';
			this.formData.table_prefix = '';
			if (this.sourceData.length) {
				for (let i = 0; i < this.sourceData.length; i++) {
					for (let k = 0; k < this.selectSourceArr.length; k++) {
						if (this.sourceData[i].key === this.selectSourceArr[k]) {
							this.sourceData[i].label = this.sourceData[i].key;
						}
					}
				}
			}
		},
		// 添加前后缀数据处理
		preFixSuffixData() {
			if (this.sourceData.length && this.selectSourceArr.length) {
				let selectSourceArr = [];
				this.selectSourceArr = Array.from(new Set(this.selectSourceArr));
				this.sourceData.forEach(sourceName => {
					this.selectSourceArr.map(k => {
						if (k === sourceName.key) {
							selectSourceArr.push(k);
						}
					});
				});
				this.selectSourceArr = selectSourceArr;
			}
			if (this.sourceData && this.sourceData.length && this.selectSourceArr.length) {
				for (let i = 0; i < this.sourceData.length; i++) {
					for (let j = 0; j < this.selectSourceArr.length; j++) {
						if (this.sourceData[i].key === this.selectSourceArr[j]) {
							this.sourceData[i].label =
								this.formData.table_prefix + this.sourceData[i].key + this.formData.table_suffix;
						}
					}
				}
			}
		},
		returnData() {
			return {
				selectSourceArr: this.selectSourceArr,
				table_prefix: this.formData.table_prefix,
				table_suffix: this.formData.table_suffix
			};
		}
	}
};
</script>
<style lang="less" scoped>
.tapdata-transfer-wrap {
	display: flex;
	flex-direction: column;
	.box-btn {
		display: flex;
		justify-content: flex-end;
		width: 79.5%;
		margin-bottom: 10px;
		padding: 4px 10px;
	}
	.tip {
		color: #999;
		font-size: 12px;
		margin-bottom: 10px;
	}
}
</style>
<style lang="less">
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
		color: #666;
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
		overflow: hidden;
	}
	.el-transfer-panel__item {
		width: 100%;
		margin-right: 10px;
		box-sizing: border-box;
	}
}
</style>
