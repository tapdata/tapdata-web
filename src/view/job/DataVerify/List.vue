<template>
	<div class="data-verify">
		<div class="back-btn-box">
			<el-button class="back-btn-icon-box" @click="GoBack"
				><i class="iconfont icon-you2 back-btn-icon"></i
			></el-button>
			<span class="back-btn-text">{{ $t('dataVerify.dataVerify') }}</span>
		</div>
		<div class="table-box">
			<el-table :data="tableData" border class="dv-table" style="width: 100%">
				<el-table-column prop="type" :label="$t('dataVerify.dataWay')" width="150">
					<template slot-scope="scope">
						<span>
							{{ $t('dataVerify.' + scope.row.type) }}
						</span>
					</template>
				</el-table-column>
				<el-table-column
					prop="condition.value"
					:label="$t('dataVerify.range')"
					width="100"
					:formatter="formatterRange"
				>
				</el-table-column>
				<el-table-column prop="source.tableName" :label="$t('dataVerify.source')">
					<template slot-scope="scope">
						<el-tooltip class="item" effect="dark" content="SQL/MQL" placement="top-end">
							<span>
								<span v-if="scope.row.source.filter" class="dv-tag"></span>
								<span> {{ scope.row.source.tableName }} </span>
							</span>
						</el-tooltip>
					</template>
				</el-table-column>
				<el-table-column prop="target.tableName" :label="$t('dataVerify.target')">
					<template slot-scope="scope">
						<el-tooltip class="item" effect="dark" content="SQL/MQL" placement="top-end">
							<span>
								<span v-if="scope.row.validateCode" class="dv-tagJS"></span>
								<span v-if="scope.row.target.filter" class="dv-tag"></span>
								<span> {{ scope.row.target.tableName }} </span>
							</span>
						</el-tooltip>
					</template>
				</el-table-column>
				<el-table-column width="80" :label="$t('dataVerify.operate')">
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
			<el-form class="dv-add-form" :model="formData">
				<div class="dv-add-form-text">
					{{ $t('dataVerify.dataWay') }}
				</div>
				<el-form-item>
					<el-radio-group v-model="type" size="mini" class="dv-radio" @change="changeType">
						<el-radio border label="row" width="150px">{{ $t('dataVerify.row') }}</el-radio>
						<el-radio border label="hash" width="150px">{{ $t('dataVerify.hash') }}</el-radio>
						<el-radio border label="advance" width="150px">{{ $t('dataVerify.advance') }}</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item v-show="type !== 'row'">
					<div class="dv-add-form-text">
						{{ $t('dataVerify.condition') }}
					</div>
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
				<el-form-item>
					<div class="dv-add-form-text">
						{{ $t('dataVerify.source') }}
					</div>
					<el-row>
						<el-col :span="24">
							<el-select
								size="mini"
								style="width: 100%"
								v-model="formData.sourceTageId"
								:placeholder="$t('dataVerify.sourceText')"
								@input="handleForceUpdate"
								@change="changeSourceTable"
							>
								<el-option
									v-for="item in sourceList"
									:label="item.tableName"
									:value="item.stageId + item.tableName"
									v-bind:key="item.stageId"
								>
								</el-option>
							</el-select>
						</el-col>
					</el-row>
					<el-row v-show="type !== 'advance'">
						<el-checkbox v-model="checkedSource"></el-checkbox>
						<span class="JS-label displayInline" v-if="opSource[0] && opSource[0].databaseType == 'mongodb'"
							>MQL {{ $t('dataVerify.filter') }}</span
						>
						<span v-else class="JS-label displayInline">SQL {{ $t('dataVerify.filter') }}</span>
					</el-row>
					<el-row v-show="checkedSource && type !== 'advance'">
						<span
							v-if="opSource[0] && opSource[0].databaseType !== 'mongodb'"
							class="JS-label displayInline"
							>{{ `seclect count(1) from ${opSource[0].tableName} where` }}</span
						>
						<span
							v-if="opSource[0] && opSource[0].databaseType === 'mongodb'"
							class="JS-label displayInline"
							>{{ `db.${opSource[0].tableName}.find ({` }}</span
						>
						<el-col :span="24">
							<el-input
								:rows="7"
								type="textarea"
								v-model="formData.sourceFilter"
								@input="handleForceUpdate"
								:placeholder="$t('dataVerify.SQL')"
							></el-input>
						</el-col>
						<div v-if="opSource[0] && opSource[0].databaseType == 'mongodb'" class="JS-label">})</div>
					</el-row>
				</el-form-item>
				<el-form-item>
					<div class="dv-add-form-text">
						{{ $t('dataVerify.target') }}
					</div>
					<el-row>
						<el-col :span="24">
							<el-select
								size="mini"
								style="width: 100%"
								v-model="formData.targetTageId"
								@input="handleForceUpdate"
								@change="changeTargetTable"
								:placeholder="$t('dataVerify.targetText')"
							>
								<el-option
									v-for="item in targetList"
									:label="item.tableName"
									:value="item.stageId + item.tableName"
									v-bind:key="item.stageId"
								>
								</el-option>
							</el-select>
						</el-col>
					</el-row>
					<el-row v-show="type === 'row'">
						<el-checkbox v-model="checkedTarget"></el-checkbox>
						<span v-if="opTarget[0] && opTarget[0].databaseType == 'mongodb'">
							<span class="JS-label displayInline">MQL {{ $t('dataVerify.filter') }}</span>
						</span>
						<span v-else class="JS-label displayInline">SQL {{ $t('dataVerify.filter') }}</span>
					</el-row>
					<el-row v-show="checkedTarget && type === 'row'">
						<span
							v-if="opTarget[0] && opTarget[0].databaseType == 'mongodb' && formData.type !== 'hash'"
							class="JS-label displayInline"
							>{{ `db.${opTarget[0].tableName}.find ({` }}</span
						>
						<span
							v-if="opTarget[0] && opTarget[0].databaseType !== 'mongodb' && formData.type !== 'hash'"
							class="JS-label displayInline"
							>{{ `seclect count(1) from ${opTarget[0].tableName} where` }}</span
						>
						<el-col :span="24">
							<el-input
								type="textarea"
								v-model="formData.targetFilter"
								@input="handleForceUpdate"
								:rows="7"
								:placeholder="$t('dataVerify.SQL')"
							></el-input>
						</el-col>
						<div v-if="opTarget[0] && opTarget[0].databaseType == 'mongodb'" class="JS-label">})</div>
					</el-row>
				</el-form-item>
				<el-form-item>
					<div v-show="type === 'advance'" class="dv-add-form-text">
						JS
					</div>
					<el-row v-show="type === 'advance'">
						<span class="JS-label displayInline">
							function validate(sourceRow){
						</span>
						<el-col :span="24">
							<el-input
								type="textarea"
								v-model="formData.validateCode"
								:rows="18"
								@input="handleForceUpdate"
							></el-input>
							<span class="JS-label displayInline">
								}
							</span>
						</el-col>
					</el-row>
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
import { EditorEventType } from '../../../editor/lib/events';
import getUrlSearch from './getUrlSearch';
const dataFlows = factory('DataFlows');
import Drawer from '@/components/Drawer';

export default {
	components: {
		Drawer
	},
	data() {
		return {
			id: '',
			editIndex: -1,
			widthDrawer: '',
			disabledDrawer: false,
			direction: 'rtl',
			checkedSource: false,
			checkedTarget: false,
			sourceList: [],
			targetList: [],
			formData: {
				condition: {
					type: 'rows', // # rows：按行数参与校验，sampleRate：按采样率参与校验
					// # type为rows时表示行数；type为sampleRate时，表示采样率，如：
					value: '1000'
				},
				sourceTageId: '',
				targetTageId: '',
				sourceFilter: '',
				targetFilter: '',
				validateCode: ''
			},
			type: 'advance', // row: 行数 hash：哈希  advance：高级校验
			colorMap: {
				row: '#48B6E2',
				hash: '#62A569',
				advance: '#9889D8'
			},
			tableData: [],
			opSource: [],
			opTarget: [],
			firstVerify: false
		};
	},
	created() {
		this.id = getUrlSearch.getUrlSearch('id');
		this.getData();
		this.getSourceList();
	},
	mounted() {
		let self = this;
		this.$on(EditorEventType.RESIZE, width => {
			self.widthDrawer = width;
		});
	},
	methods: {
		getData() {
			dataFlows
				.get([this.id], {
					fields: ['validationSettings', 'dataFlowId', 'validateStatus']
				})
				.then(res => {
					if (res.statusText === 'OK' || res.status === 200) {
						if (res.data) {
							this.tableData = res.data.validationSettings ? res.data.validationSettings : [];
							if (!res.data.validateStatus) {
								this.firstVerify = true;
							}
							this.changeSourceTable();
							this.changeTargetTable();
							log('dataVerify.tableData', this.tableData);
						}
					}
				});
		},
		handleClose() {
			this.disabledDrawer = false;
		},
		handleShowDrawer() {
			this.disabledDrawer = false;
			this.formData = {
				condition: {
					type: 'rows', // # rows：按行数参与校验，sampleRate：按采样率参与校验
					// # type为rows时表示行数；type为sampleRate时，表示采样率，如：
					value: '1000'
				}
			};
			this.type = 'advance';
			this.checkedSource = false;
			this.checkedTarget = false;
			this.disabledDrawer = true;
		},
		changeType(type) {
			if (type !== 'advance') {
				this.formData.validateCode = '';
			}
		},
		handleAdd() {
			if (
				(this.formData.sourceFilter === '' || !this.formData.sourceFilter) &&
				this.checkedSource &&
				this.type !== 'advance'
			) {
				this.$message.error('please select source SQL/MQL');
				return;
			}
			if (this.formData.sourceTageId === '' || !this.formData.sourceTageId) {
				this.$message.error('please select source');
				return;
			}
			if (this.formData.targetTageId === '' || !this.formData.targetTageId) {
				this.$message.error('please select target');
				return;
			}
			if (
				(this.formData.targetFilter === '' || !this.formData.targetFilter) &&
				this.checkedTarget &&
				this.type === 'row'
			) {
				this.$message.error('please select target SQL/MQL');
				return;
			}
			if (!this.checkedTarget) {
				this.formData.targetFilter === '';
			}
			if (!this.checkedSource) {
				this.formData.sourceFilter === '';
			}
			log('edit_edit', this.editIndex);

			if (this.editIndex !== -1) {
				this.tableData.splice(this.editIndex, 1); // 不是编辑 先删除后新增 -1非编辑模式
			}
			let opSource = this.sourceList.filter(item => item.stageId + item.tableName === this.formData.sourceTageId);
			let opTarget = this.targetList.filter(item => item.stageId + item.tableName === this.formData.targetTageId);
			if (opSource.length !== 0 && opSource[0]) opSource[0]['filter'] = this.formData.sourceFilter;
			if (opTarget.length !== 0 && opTarget[0]) opTarget[0]['filter'] = this.formData.targetFilter;

			let add = {
				type: this.type, // row: 行数 hash：哈希  advance：高级校验
				condition: this.formData.condition,
				source: opSource[0],
				target: opTarget[0],
				validateCode: this.formData.validateCode
			};

			if (!this.tableData) {
				this.tableData = [];
				this.tableData.push(add); // 判断tabledata 是否存在
			} else {
				this.tableData.push(add);
			}

			let data = {
				validationSettings: this.tableData
			};
			log('data', data);

			dataFlows.patchId(this.id, data).then(res => {
				if (res.statusText === 'OK' || res.status === 200) {
					this.disabledDrawer = false;
					this.editIndex = -1;
					this.getData();
				}
			});
		},
		handleLoading() {
			if (this.tableData.length === 0) {
				this.$message.info('please add data verify');
				return;
			}
			if (this.disabledDrawer) {
				this.disabledDrawer = false;
			}
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
					this.disabledDrawer = false;
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
			this.disabledDrawer = false;
			this.disabledDrawer = true;
			this.editIndex = index;
			this.formData = this.tableData[index];
			this.formData.sourceTageId = this.tableData[index].source.stageId + this.tableData[index].source.tableName;
			this.formData.targetTageId = this.tableData[index].target.stageId + this.tableData[index].target.tableName;
			if (this.tableData[index].target.filter) {
				this.formData.targetFilter = this.tableData[index].target.filter;
				this.checkedTarget = true;
			}
			if (this.tableData[index].source.filter) {
				this.formData.sourceFilter = this.tableData[index].source.filter;
				this.checkedSource = true;
			}
			this.type = this.tableData[index].type;
			this.changeSourceTable();
			this.changeTargetTable();
		},
		getSourceList() {
			dataFlows.getSourceList(this.id).then(res => {
				if (res.statusText === 'OK' || res.status === 200) {
					this.sourceList = res.data.source;
					this.targetList = res.data.target;
					log('source.list', res.data);
				}
			});
		},
		GoBack() {
			this.editor.showMonitor();
		},
		showResult() {
			this.disabledDrawer = false;
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
			this.opSource = this.sourceList.filter(
				item => item.stageId + item.tableName === this.formData.sourceTageId
			);
		},
		changeTargetTable() {
			this.opTarget = this.targetList.filter(
				item => item.stageId + item.tableName === this.formData.targetTageId
			);
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
.displayInline {
	display: inline-block;
}
</style>
<style lang="less">
:focus {
	outline: 0px;
}
.dv-add-form .el-form-item {
	margin-bottom: 0;
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
