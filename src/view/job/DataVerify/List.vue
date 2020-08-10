<template>
	<div class="data-verify">
		<div class="back-btn-box">
			<el-button class="back-btn-icon-box" @click="GoBack"
				><i class="iconfont icon-you2 back-btn-icon"></i
			></el-button>
			<span class="back-btn-text">{{ $t('dataVerify.dataVerify') }}</span>
		</div>
		<div class="operation">
			<span>{{ `条目：${this.tableData.length}` }}</span>
			<span @click="handleClear" class="clear-btn">清空</span>
		</div>
		<div class="table-box">
			<el-table :data="tableData" border class="dv-table" v-loading="loading">
				<el-table-column prop="type" :label="$t('dataVerify.dataWay')" width="80">
					<template slot-scope="scope">
						<span>
							{{ $t('dataVerify.' + scope.row.type) }}
						</span>
					</template>
				</el-table-column>
				<el-table-column
					prop="condition.value"
					:label="$t('dataVerify.range')"
					width="80"
					:formatter="formatterRange"
				>
				</el-table-column>
				<el-table-column prop="source.tableName" :label="$t('dataVerify.source')">
					<template slot-scope="scope">
						<el-tooltip
							class="item"
							effect="dark"
							:content="scope.row.source.tableName + ' / ' + scope.row.source.databaseName"
							placement="top-end"
						>
							<div>
								<div style="color: #bbb">
									{{ scope.row.source ? scope.row.source.databaseName : '' }}
								</div>
								<div>
									{{ scope.row.source ? scope.row.source.tableName : '' }}
								</div>
							</div>
						</el-tooltip>
					</template>
				</el-table-column>
				<el-table-column prop="target.tableName" :label="$t('dataVerify.target')">
					<template slot-scope="scope">
						<el-tooltip
							class="item"
							effect="dark"
							:content="scope.row.target.tableName + ' / ' + scope.row.target.databaseName"
							placement="top-end"
						>
							<div>
								<div style="color: #bbb">
									{{ scope.row.target ? scope.row.target.databaseName : '' }}
								</div>
								<div>
									{{ scope.row.target ? scope.row.target.tableName : '' }}
								</div>
							</div>
						</el-tooltip>
					</template>
				</el-table-column>
				<el-table-column width="70" :label="$t('dataVerify.operate')">
					<template slot-scope="scope">
						<span class="el-icon-edit" @click="handleEdit(scope.$index)"></span>
						<span class="el-icon-close" @click="handleDelete(scope.$index)"></span>
					</template>
				</el-table-column>
			</el-table>
		</div>
		<el-button
			class="dv-btn"
			size="mini"
			icon="el-icon-plus"
			@click="handleShowDrawer"
			:disabled="editIndex !== -1"
		></el-button>
		<div class="dv-btn-footer-wrapper">
			<div class="dv-btn-footer-box">
				<el-button size="mini" class="dv-btn-footer" type="primary" @click="handleLoading">{{
					$t('dataVerify.start')
				}}</el-button>
				<el-button size="mini" class="dv-btn-footer" @click="showResult" :disabled="firstVerify">{{
					$t('dataVerify.cancel')
				}}</el-button>
			</div>
		</div>
		<Drawer ref="drawer" :visible.sync="disabledDrawer" :title="$t('dataVerify.dataVerifySetting')">
			<el-form class="dv-add-form" :model="formData" label-position="top">
				<el-form-item :label="$t('dataVerify.dataWay')">
					<el-radio-group v-model="formData.type" size="mini" class="dv-radio" @change="changeType">
						<el-radio border label="row" width="150px">{{ $t('dataVerify.row') }}</el-radio>
						<el-radio border label="hash" width="150px">{{ $t('dataVerify.hash') }}</el-radio>
						<el-radio border label="advance" width="150px">{{ $t('dataVerify.advance') }}</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item v-show="formData.type !== 'row'" :label="$t('dataVerify.condition')">
					<el-row :gutter="5">
						<el-col :span="12">
							<el-select size="mini" v-model="formData.condition.type" @change="changeConditionType">
								<el-option value="rows" :label="$t('dataVerify.rows')"></el-option>
								<el-option value="sampleRate" :label="$t('dataVerify.sampleRate')"></el-option>
							</el-select>
						</el-col>
						<el-col :span="12" class="condition-value">
							<el-input
								@change="handleCondition"
								size="mini"
								type="number"
								v-model="formData.condition.value"
							>
								<template slot="append" v-if="formData.condition.type === 'rows'">{{
									$t('dataVerify.psc')
								}}</template>
								<template slot="append" v-if="formData.condition.type === 'sampleRate'">%</template>
							</el-input>
						</el-col>
					</el-row>
				</el-form-item>
				<el-form-item :label="$t('dataVerify.sourceDatabase')">
					<el-select
						size="mini"
						style="width: 100%"
						v-model="formData.source.connectionId"
						:placeholder="$t('dataVerify.sourceDatabaseText')"
						@input="handleForceUpdate"
						@change="changeSourceTable"
					>
						<el-option
							v-for="item in sourceDatabase"
							:label="item.databaseName"
							:value="item.connectionId"
							v-bind:key="item.connectionId"
						>
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item :label="$t('dataVerify.source')">
					<el-select
						size="mini"
						style="width: 100%"
						v-model="formData.source.stageId"
						:placeholder="$t('dataVerify.sourceText')"
						@input="handleForceUpdate"
					>
						<el-option
							v-for="item in sourceList"
							:label="item.tableName"
							:value="item.stageId"
							v-bind:key="item.stageId"
						>
						</el-option>
					</el-select>
					<el-row v-show="formData.type !== 'advance'">
						<div v-if="formData.source.databaseType === 'mongodb'">
							<el-checkbox v-model="formData.source.checkedSource"></el-checkbox>
							<span>MQL {{ $t('dataVerify.filter') }}</span>
							<div v-show="formData.source.checkedSource">
								<el-input
									:rows="7"
									type="textarea"
									v-model="formData.source.filter"
									@input="handleForceUpdate"
									:placeholder="
										formData.type === 'hash'
											? $t('dataVerify.exampleHashMQL')
											: $t('dataVerify.exampleMQL')
									"
								></el-input>
							</div>
						</div>
						<div v-else>
							<el-checkbox v-model="formData.source.checkedSource"></el-checkbox>
							<span>SQL {{ $t('dataVerify.filter') }}</span>
							<div v-show="formData.source.checkedSource">
								<el-input
									:rows="7"
									type="textarea"
									v-model="formData.source.filter"
									@input="handleForceUpdate"
									:placeholder="
										formData.type === 'hash'
											? $t('dataVerify.exampleHashSQL')
											: $t('dataVerify.exampleSQL')
									"
								></el-input>
							</div>
						</div>
					</el-row>
				</el-form-item>
				<el-form-item :label="$t('dataVerify.targetDatabase')">
					<el-select
						size="mini"
						style="width: 100%"
						v-model="formData.target.connectionId"
						@input="handleForceUpdate"
						@change="changeTargetTable"
						:placeholder="$t('dataVerify.targetDatabaseText')"
					>
						<el-option
							v-for="item in targetDatabase"
							:label="item.databaseName"
							:value="item.connectionId"
							v-bind:key="item.connectionId"
						>
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item :label="$t('dataVerify.target')">
					<el-select
						size="mini"
						style="width: 100%"
						v-model="formData.target.stageId"
						:placeholder="$t('dataVerify.targetText')"
						@input="handleForceUpdate"
					>
						<el-option
							v-for="item in targetList"
							:label="item.tableName"
							:value="item.stageId"
							v-bind:key="item.stageId"
						>
						</el-option>
					</el-select>
					<el-row v-show="formData.type === 'row'">
						<div v-if="formData.target.databaseType === 'mongodb'">
							<el-checkbox v-model="formData.target.checkedTarget"></el-checkbox>
							<span>MQL {{ $t('dataVerify.filter') }}</span>
							<div v-show="formData.target.checkedTarget">
								<el-input
									:rows="7"
									type="textarea"
									v-model="formData.target.filter"
									@input="handleForceUpdate"
									:placeholder="$t('dataVerify.exampleMQL')"
								></el-input>
							</div>
						</div>
						<div v-else>
							<el-checkbox v-model="formData.target.checkedTarget"></el-checkbox>
							<span>SQL {{ $t('dataVerify.filter') }}</span>
							<div v-show="formData.target.checkedTarget">
								<el-input
									:rows="7"
									type="textarea"
									v-model="formData.target.filter"
									@input="handleForceUpdate"
									:placeholder="$t('dataVerify.exampleSQL')"
								></el-input>
							</div>
						</div>
					</el-row>
				</el-form-item>
				<el-form-item label="JS" v-show="formData.type === 'advance'">
					<span class="JS-label displayInline">
						{{ $t('dataVerify.exampleJS') }}
					</span>
					<el-input
						type="textarea"
						v-model="formData.validateCode"
						:rows="10"
						@input="handleForceUpdate"
					></el-input>
				</el-form-item>
				<el-form-item v-show="formData.type === 'advance'">
					<div :span="24" class="example-js">
						<span>Example:</span>
						<span>function validate(sourceRow) { </span>
						<span>var targetRow = target.executeQuery({</span>
						<span>sql: "select * from VALIDATE_TEST where ID = "+sourceRow.ID});</span>
						<span>var result="";</span>
						<span>var message="";</span>
						<span>if(JSONUtil.obj2Json(sourceRow) === JSONUtil.obj2Json(targetRow)){</span>
						<span>result="passed";</span>
						<span>message="记录一致";</span>
						<span>} else {</span>
						<span>result="failed";</span>
						<span>message="记录不一致";</span>
						<span>}</span>
						<span>return {</span>
						<span>result: result,</span>
						<span>message: message,</span>
						<span>data: targetRow,</span>
						<span>};</span>
						<span>}</span>
					</div>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button size="mini" type="primary" :loading="testing" @click="handleAdd">
					{{ $t('dataVerify.confirm') }}
				</el-button>
				<el-button
					size="mini"
					@click="
						disabledDrawer = false;
						editIndex = -1;
					"
					>{{ $t('dataForm.cancel') }}</el-button
				>
			</span>
		</Drawer>
	</div>
</template>

<script>
import factory from '../../../api/factory';
import log from '../../../log';
import Drawer from '@/components/Drawer';
import getUrlSearch from './getUrlSearch';
const dataFlows = factory('DataFlows');
import { DEFAULT_DATAVERIFY } from './constants';
import _ from 'lodash';

export default {
	components: {
		Drawer
	},
	data() {
		return {
			id: '',
			editIndex: -1,
			disabledDrawer: false,
			sourceList: [],
			targetList: [],
			sourceDatabase: [],
			targetDatabase: [],
			formData: _.cloneDeep(DEFAULT_DATAVERIFY),
			colorMap: {
				row: '#48B6E2',
				hash: '#62A569',
				advance: '#9889D8'
			},
			loading: true,
			tableData: [],
			firstVerify: false
		};
	},
	created() {
		this.id = getUrlSearch.getUrlSearch('id');
		this.getData();
		this.getSourceList('conn');
	},
	methods: {
		getData() {
			dataFlows
				.get([this.id], {
					fields: ['validationSettings', 'dataFlowId', 'validateStatus']
				})
				.then(res => {
					if (res.statusText === 'OK' || res.status === 200) {
						this.loading = false;
						if (res.data) {
							this.tableData = res.data.validationSettings ? res.data.validationSettings : [];
							if (!res.data.validateStatus) {
								this.firstVerify = true;
							}
							log('dataVerify.tableData', this.tableData);
						}
					}
				});
		},
		handleClose() {
			this.disabledDrawer = false;
			this.formData = _.cloneDeep(DEFAULT_DATAVERIFY);
		},
		handleShowDrawer() {
			this.disabledDrawer = true;
		},
		handleAdd() {
			if (this.formData.source.connectionId === '' || !this.formData.source.connectionId) {
				this.$message.error('please select source database');
				return;
			}
			if (this.formData.source.stageId === '' || !this.formData.source.stageId) {
				this.$message.error('please select source');
				return;
			}
			if (this.formData.target.connectionId === '' || !this.formData.target.connectionId) {
				this.$message.error('please select target database');
				return;
			}
			if (this.formData.target.stageId === '' || !this.formData.target.stageId) {
				this.$message.error('please select target');
				return;
			}
			if (
				(this.formData.source.filter === '' || !this.formData.source.filter) &&
				this.formData.source.checkedSource &&
				this.type !== 'advance'
			) {
				this.$message.error('please select source SQL/MQL');
				return;
			}
			if (
				(this.formData.target.filter === '' || !this.formData.target.filter) &&
				this.formData.target.checkedTarget &&
				this.type === 'row'
			) {
				this.$message.error('please select target SQL/MQL');
				return;
			}

			if (this.editIndex !== -1) {
				this.tableData.splice(this.editIndex, 1); // 不是编辑 先删除后新增 -1非编辑模式
			}
			this.tableData = this.tableData || [];
			let source = this.sourceList.filter(item => item.stageId === this.formData.source.stageId);
			if (source.length > 0) this.formData.source.tableName = source[0].tableName;
			let target = this.targetList.filter(item => item.stageId === this.formData.target.stageId);
			if (target.length > 0) this.formData.target.tableName = target[0].tableName;
			this.tableData.push(this.formData);
			let data = {
				validationSettings: this.tableData
			};
			this.editIndex = -1;
			dataFlows.patchId(this.id, data).then(res => {
				if (res.statusText === 'OK' || res.status === 200) {
					this.handleClose();
					this.getData();
				}
			});
		},
		handleClear() {
			let data = {
				validationSettings: []
			};
			this.deleteConfirm(() => {
				dataFlows.patchId(this.id, data).then(res => {
					if (res.statusText === 'OK' || res.status === 200) {
						this.getData();
						this.$message.success(this.$t('message.deleteOK'));
					} else {
						this.$message.info(this.$t('message.deleteFail'));
					}
				});
			});
		},
		deleteConfirm(callback) {
			this.$confirm(this.$t('message.deteleMessage'), this.$t('dataFlow.importantReminder'), {
				confirmButtonText: this.$t('metaData.deleteNode'),
				cancelButtonText: this.$t('message.cancel'),
				type: 'warning'
			}).then(callback);
		},
		handleLoading() {
			if (this.tableData.length === 0) {
				this.$message.info('please add data verify');
				return;
			}
			this.handleClose();
			let self = this;
			// 状态修改为 waiting
			let data = {
				validateStatus: 'waiting',
				validateBatchId: new Date().valueOf(),
				lastValidateBatchId: ''
			};
			dataFlows
				.get([this.id], {
					fields: ['validateBatchId']
				})
				.then(res => {
					if (res.statusText === 'OK' || res.status === 200) {
						data.lastValidateBatchId = res.data.validateBatchId ? res.data.validateBatchId : '';
						dataFlows.patchId(this.id, data).then(res => {
							if (res.statusText === 'OK' || res.status === 200) {
								self.editor.showResult(true);
							}
						});
					}
				});
		},
		handleDelete(index) {
			this.tableData.splice(index, 1);
			let data = {
				validationSettings: this.tableData
			};
			dataFlows.patchId(this.id, data).then(res => {
				if (res.statusText === 'OK' || res.status === 200) {
					this.handleClose();
					this.getData();
				}
			});
		},
		handleCondition(value) {
			if (this.formData.condition.type === 'sampleRate') {
				if (value <= 0 || value > 100) {
					this.formData.condition.value = 5;
					this.$message.error('sampleRate 1~100');
				}
			}
		},
		handleEdit(index) {
			this.editIndex = index;
			this.formData = this.tableData[index];
			this.disabledDrawer = true;
			this.changeSourceTable();
			this.changeTargetTable();
		},
		GoBack() {
			this.editor.showMonitor();
			this.handleClose();
		},
		showResult() {
			this.handleClose();
			this.editor.showResult();
		},
		changeConditionType(type) {
			if (type === 'sampleRate') {
				this.formData.condition.value = 5;
			} else {
				this.formData.condition.value = 1000;
			}
		},
		handleForceUpdate() {
			this.$forceUpdate();
		},
		changeSourceTable() {
			let type = 'table';
			dataFlows.getSourceList(this.id, type, this.formData.source.connectionId).then(res => {
				if (res.statusText === 'OK' || res.status === 200) {
					this.sourceList = res.data || [];
				}
			});
			let source = this.sourceDatabase.filter(item => item.connectionId === this.formData.source.connectionId);
			if (source.length > 0) {
				this.formData.source.databaseType = source[0].databaseType;
				this.formData.source.databaseName = source[0].databaseName;
			}
		},
		changeTargetTable() {
			let type = 'table';
			dataFlows.getSourceList(this.id, type, this.formData.target.connectionId).then(res => {
				if (res.statusText === 'OK' || res.status === 200) {
					this.targetList = res.data || [];
				}
			});
			let opTarget = this.targetDatabase.filter(item => item.connectionId === this.formData.target.connectionId);
			if (opTarget.length > 0) {
				this.formData.target.databaseType = opTarget[0].databaseType;
				this.formData.target.databaseName = opTarget[0].databaseName;
			}
		},
		getSourceList(type) {
			dataFlows.getSourceList(this.id, type).then(res => {
				if (res.statusText === 'OK' || res.status === 200) {
					this.sourceDatabase = res.data.source || [];
					this.targetDatabase = res.data.target || [];
				}
			});
		},
		formatterRange(row) {
			if (row.condition.type === 'rows' && row.type !== 'row') {
				return row.condition.value + this.$t('dataVerify.psc');
			} else if (row.condition.type === 'sampleRate') {
				return row.condition.value + '%';
			} else if (row.condition.type === 'rows' && row.type === 'row') {
				return this.$t('dataVerify.all');
			}
		}
	}
};
</script>
<style lang="less" scoped>
.dv-add-header {
	width: 100%;
	height: 35px;
	font-size: 12px;
	line-height: 35px;
	padding-left: 20px;
	background: rgba(245, 245, 245, 1);
	border: 1px solid rgba(222, 222, 228, 1);
}
.operation {
	display: flex;
	justify-content: flex-end;
	span {
		font-size: 12px;
		line-height: 24px;
		color: #aaa;
	}
	.clear-btn {
		display: inline-block;
		margin-left: 10px;
		margin-right: 10px;
		line-height: 24px;
		color: #5fa9ee;
		cursor: pointer;
	}
}
.data-verify {
	position: relative;
	font-family: 'Microsoft YaHei';
}
.dv-header {
	line-height: 32px;
	font-size: 12px;
	font-weight: 400;
	padding-left: 12px;
	color: rgba(51, 51, 51, 1);
	background: #fafafa;
	border: 1px solid #ebeef5;
	border-bottom: none;
}
.table-box {
	margin: 10px;
	overflow: auto;
	max-height: calc(100vh - 150px);
}
.dv-btn {
	margin-left: 10px;
	padding: 0;
	width: 28px;
	height: 28px;
}
.dv-btn-footer-wrapper {
	width: 600px;
	position: fixed;
	bottom: 10px;
}
.dv-btn-footer-box {
	display: flex;
	justify-content: center;
}
.dv-btn-footer {
	width: 100px;
	float: left;
}
.dv-add-form {
	margin-left: 20px;
	margin-right: 20px;
}
.dv-add-form-text {
	font-size: 12px;
	color: rgba(51, 51, 51, 1);
}
.dv-tag {
	width: 8px;
	height: 8px;
	margin: 0 auto;
	text-align: center;
	display: inline-block;
	background: rgba(98, 165, 105, 1);
	border-radius: 50%;
}
.dv-tagJS {
	width: 8px;
	height: 8px;
	margin: 0 auto;
	text-align: center;
	display: inline-block;
	background: #48b6e2;
	border-radius: 50%;
}
.back-btn-box {
	width: 100%;
	height: 29px;
	background: #f5f5f5;
	border-bottom: 1px solid #dedee4;
}
.back-btn-text {
	font-size: 12px;
}
.back-btn-icon-box {
	width: 30px;
	height: 30px;
	display: inline-block;
	border-radius: 0;
	line-height: 1;
	white-space: nowrap;
	cursor: pointer;
	background: #48b6e2;
	border: 0;
	color: red;
	-webkit-appearance: none;
	text-align: center;
	-webkit-box-sizing: border-box;
	box-sizing: border-box;
	outline: 0;
	margin: 0;
	-webkit-transition: 0.1s;
	transition: 0.1s;
	font-weight: normal;
	padding: 0;
	font-size: 14px;
}
.back-btn-icon-box:hover {
	background: #6dc5e8;
}
.back-btn-icon {
	color: #fff;
}
.condition-value {
	margin-top: 6px;
}
.JS-label {
	color: #999;
	font-size: 12px;
	margin-top: 0px;
}
.example-js {
	span {
		display: block;
		color: #999;
		font-size: 12px;
		line-height: 16px;
	}
}
.displayInline {
	display: inline-block;
	line-height: 16px;
}
</style>
<style lang="less">
:focus {
	outline: 0px;
}
.dv-add-form {
	.el-form-item {
		margin-bottom: 10px;
	}
	.el-form-item__label {
		line-height: 20px;
		padding: 0;
		font-size: 12px;
	}
}
.dv-radio .el-radio {
	color: #606266;
	cursor: pointer;
	margin-right: 0;
}
.dv-table thead {
	color: #333;
	th {
		padding: 0;
		background: #fafafa;
		.cell {
			height: 32px;
			line-height: 32px;
		}
	}
}
.el-table__empty-block {
	height: 32px !important;
	min-height: 32px;
}
</style>
