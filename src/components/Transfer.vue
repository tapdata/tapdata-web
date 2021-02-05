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
			<el-form>
				<el-row :gutter="80" class="e-row">
					<el-col :span="12">
						<el-form-item :label="$t('editor.cell.link.prefixPlaceholder')">
							<el-input
								v-model="table_prefix"
								autocomplete="off"
								maxlength="20"
								show-word-limit
								size="mini"
								:placeholder="$t('editor.cell.link.prefixPlaceholder')"
							></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item :label="$t('editor.cell.link.suffixPlaceholder')">
							<el-input
								v-model="table_suffix"
								autocomplete="off"
								maxlength="20"
								show-word-limit
								size="mini"
								:placeholder="$t('editor.cell.link.suffixPlaceholder')"
							></el-input>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
			<div class="text">
				{{ `${$t('editor.cell.link.tableNameExample')}: ${table_prefix} table name ${table_suffix}` }}
			</div>
			<div slot="footer" class="dialog-footer">
				<el-button @click="dialogVisible = false">{{ $t('dataVerify.cancel') }}</el-button>
				<el-button type="primary" @click="changeName">{{ $t('dataVerify.confirm') }}</el-button>
			</div>
		</el-dialog>
	</section>
</template>

<script>
export default {
	props: {
		transferData: Array
	},
	data() {
		return {
			transferLoading: false,
			sourceData: [],
			selectSourceArr: [],
			titles: [this.$t('editor.cell.link.migrationObjece'), this.$t('editor.cell.link.chosen')],
			table_prefix: '',
			table_suffix: '',
			dialogVisible: false,
			type: ''
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
							this.table_prefix = this.transferData.table_prefix;
							this.table_suffix = this.transferData.table_suffix;
							this.selectSourceArr = this.transferData.selectSourceArr;
						}
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
				if (this.selectSourceArr.length && this.selectSourceArr.includes(el.key)) {
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
			this.selectSourceArr = data;
		},
		changeName() {
			this.dialogVisible = false;
			this.preFixSuffixData();
		},
		//还原
		handleReduction() {
			this.table_suffix = '';
			this.table_prefix = '';
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
							this.sourceData[i].label = this.table_prefix + this.sourceData[i].key + this.table_suffix;
						}
					}
				}
			}
		},
		returnData() {
			return {
				selectSourceArr: this.selectSourceArr,
				table_prefix: this.table_prefix,
				table_suffix: this.table_suffix
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
	}
	.el-transfer-panel__item {
		width: 100%;
		margin-right: 10px;
		box-sizing: border-box;
	}
}
</style>
