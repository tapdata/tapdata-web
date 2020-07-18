<template>
	<div>
		<div v-if="loading">
			<div v-loading="loading" style="margin-top: 100px;padding-bottom:100px"></div>
			<div class="btn-box">
				<el-button @click="getValidateBatchId" size="mini">{{ $t('dataVerify.refresh') }}</el-button>
				<el-button @click="handleVerifyCancel" size="mini">{{ $t('dataVerify.cancel') }}</el-button>
			</div>
		</div>
		<div class="back-btn-box" v-if="!loading">
			<el-button class="back-btn-icon-box" @click="GoBack"
				><i class="iconfont icon-you2 back-btn-icon"></i
			></el-button>
			<span class="back-btn-text">{{ $t('dataVerify.dataVerify') }}</span>
		</div>
		<div class="data-contPreView" v-if="!loading">
			<div class="dv-pre-btn">
				<el-button size="mini" type="primary" @click="handleAddList"> {{ $t('dataVerify.again') }}</el-button>
			</div>
			<div class="clear"></div>
			<el-alert
				v-if="validateFailedMSG && validateFailedMSG !== ''"
				:title="validateFailedMSG"
				:closable="false"
				type="error"
				class="el-alert"
			>
			</el-alert>
			<div class="dv-pre-box">
				<div class="dv-pre-label">
					{{ $t('dataVerify.overView') }}
					<div class="dv-pre-right">
						<span>{{ $t('dataVerify.time') }}: {{ overview.createTime }} </span>
						<span> {{ $t('dataVerify.duration') }}: {{ overview.costTime }}</span>
					</div>
				</div>
				<div class="dv-pre-rowTotal">
					<p>
						{{ $t('dataVerify.row') }}: <span>{{ overview.validateRows }}</span>
					</p>
					<p>
						{{ $t('dataVerify.hash') }}: <span>{{ overview.validateHashRows }}</span>
					</p>
					<p>
						{{ $t('dataVerify.advance') }}: <span>{{ overview.validateJsRows }}</span>
					</p>
				</div>
				<div class="dv-pre-dataBox">
					<div class="dv-pre-rowCheck">
						<p>{{ $t('dataVerify.linageDifference') }}</p>
						<div
							class="dv-pre-dataBox-item"
							v-if="overview.rowsDiffer !== 0 || overview.rowsDiffer == -1"
							style="color: rgb(245, 108, 108);"
						>
							{{ overview.rowsDiffer }}
						</div>
						<div class="dv-pre-dataBox-item" v-else>
							{{ overview.rowsDiffer }}
						</div>
					</div>
					<div class="dv-pre-rowCheck">
						<p>{{ $t('dataVerify.errorTotal') }}</p>
						<div
							class="dv-pre-dataBox-item"
							v-if="overview.rowsMismatch !== 0 || overview.rowsMismatch == -1"
							style="color: rgb(245, 108, 108);"
						>
							{{ overview.rowsMismatch }}
						</div>
						<div class="dv-pre-dataBox-item" v-else>
							{{ overview.rowsMismatch }}
						</div>
					</div>
					<div class="dv-pre-rowCheck">
						<p>{{ $t('dataVerify.accuracyRate') }}</p>
						<div
							class="dv-pre-dataBox-item"
							v-if="overview.consistencyRate !== '--'"
							style="color: rgb(245, 108, 108);"
						>
							{{ overview.consistencyRate }}
						</div>
						<div class="dv-pre-dataBox-item" v-else>
							{{ overview.consistencyRate }}
						</div>
					</div>
				</div>
			</div>
			<div class="dv-contrast-table">
				<el-table border :data="validateStats" height="250" style="width: 100%">
					<el-table-column prop="sourceTableName" :label="$t('dataVerify.source')" width="180">
					</el-table-column>
					<el-table-column prop="validateType" :label="$t('dataVerify.dataWay')" width="80">
						<template slot-scope="scope">
							<span :style="`color: ${colorMap[scope.row.validateType]};`">
								{{ $t('dataVerify.' + scope.row.validateType) }}
							</span>
						</template>
					</el-table-column>
					<el-table-column prop="rows" :label="$t('dataVerify.range')"> </el-table-column>
					<el-table-column prop="rowsDiffer" :label="$t('dataVerify.result')"> </el-table-column>
					<el-table-column prop="consistencyRate" :label="$t('dataVerify.accuracyRate')">
						<template slot-scope="scope">
							<span>
								{{ scope.row.consistencyRate == '-1' ? '--' : scope.row.consistencyRate }}
							</span>
						</template>
					</el-table-column>
				</el-table>
			</div>
			<div>
				<div class="dv-contrast-box">
					<div class="dv-contrast-header">
						<div class="dv-pre-right">
							<span style="color: #F56C6C"> error :{{ count }}</span>
							<el-pagination
								class="dv-result-pagination"
								:pager-count="0"
								layout="prev, next"
								:total="count"
								:page-size="pageSize"
								@current-change="handleCurrentChange"
							>
							</el-pagination>
						</div>
						{{ $t('dataVerify.errorComparison') }}
						<el-select
							size="mini"
							v-model="source.tableName"
							class="dv-pre-right"
							@change="getFailedRow"
							clearable
						>
							<el-option
								v-for="item in validateStats"
								:key="item.sourceTableName"
								:label="item.sourceTableName"
								:value="item.sourceTableName"
							>
							</el-option>
						</el-select>
					</div>
					<el-table border :data="failedRow" class="dv-result-fail-table" style="width: 100%">
						<el-table-column prop="sourceTableData" :label="$t('dataVerify.source')"> </el-table-column>
						<el-table-column prop="targetTableData" :label="$t('dataVerify.target')"> </el-table-column>
						<el-table-column prop="message" label="MSQ" width="100"> </el-table-column>
					</el-table>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import factory from '../../../api/factory';
import log from '../../../log';
import getUrlSearch from './getUrlSearch';
const dataFlows = factory('DataFlows');
const ValidationResults = factory('validationResults');
import * as moment from 'moment';

export default {
	data() {
		return {
			loading: true,
			overview: {
				id: '',
				// overview校验结果总览，tableOverview：按表统计，failedRow: 校验失败的记录
				type: '',
				validateTime: '', // #执行校验时间
				costTime: '', // #校验耗时
				validateRows: '0', // #行数校验条数
				validateHashRows: '0', // #哈希校验条数
				validateJsRows: '0', // #高级校验条数
				rowsDiffer: '--', // #总体行数差
				rowsMismatch: '--', // #不匹配条数
				consistencyRate: '--', // #一致率（0-100）
				dataFlowId: '', // #该记录所属的dataFlow ID，
				validateType: '',
				source: ''
			},
			failedRow: [],
			validateStats: [],
			count: '',
			source: {
				tableName: ''
			},
			colorMap: {
				row: '#48B6E2',
				hash: '#62A569',
				advance: '#9889D8'
			},
			timer: '',
			validateFailedMSG: '',
			currentPage: 1,
			pageSize: 10,
			validateBatchId: ''
		};
	},
	created() {
		this.id = getUrlSearch.getUrlSearch('id');
		this.getValidateBatchId();
		this.timer = setInterval(() => {
			this.getValidateBatchId();
		}, 2000);
	},
	destroyed() {
		// 清除定时器
		clearInterval(this.timer);
		this.timer = null;
	},
	methods: {
		handleAddList() {
			this.editor.showDataVerify(true);
		},
		getValidateBatchId() {
			dataFlows
				.get([this.id], {
					fields: ['validateBatchId', 'validateStatus', 'validateFailedMSG']
				})
				.then(res => {
					if (res.statusText === 'OK' || res.status === 200) {
						if (res.data.validateStatus === 'completed' || res.data.validateStatus === 'error') {
							this.validateBatchId = res.data.validateBatchId ? res.data.validateBatchId.toString() : '';
							this.validateFailedMSG = res.data.validateFailedMSG;
							// 清除定时器
							clearInterval(this.timer);
							this.timer = null;
							this.getData();
							this.getFailedRow();
						} else {
							this.loading = true;
						}
					}
				});
		},
		getData() {
			let where = {
				filter: {
					where: {
						validateBatchId: this.validateBatchId,
						dataFlowId: {
							regexp: `^${this.id}$`
						},
						type: {
							inq: ['tableOverview', 'overview']
						}
					}
				}
			};
			ValidationResults.get(where).then(res => {
				if (res.statusText === 'OK' || res.status === 200) {
					if (res.data) {
						this.loading = false;
						if (res.data[1]) {
							this.overview = res.data[1];
							this.overview.createTime = this.overview.createTime
								? moment(this.overview.createTime).format('YYYY-MM-DD HH:mm:ss')
								: '';
							this.overview.consistencyRate =
								this.overview.consistencyRate == -1 ? '--' : this.overview.consistencyRate;
							this.overview.costTime = this.overview.costTime ? this.overview.costTime / 1000 + ' s' : '';
						}
						if (res.data[0]) {
							this.validateStats = res.data[0].validateStats;
							this.validateStats.sourceTableData = this.validateStats.sourceTableData
								? JSON.parse(this.validateStats.sourceTableData)
								: '';
							this.validateStats.targetTableData = this.validateStats.targetTableData
								? JSON.parse(this.validateStats.targetTableData)
								: '';
						}
						log('dataVerify.result', res.data);
					}
				} else {
					this.loading = false;
				}
			});
			let whereCount = {
				where: {
					validateBatchId: this.validateBatchId,
					dataFlowId: {
						regexp: `^${this.id}$`
					},
					type: {
						inq: ['failedRow']
					}
				}
			};
			ValidationResults.count(whereCount).then(res => {
				if (res.statusText === 'OK' || res.status === 200) {
					if (res.data) {
						this.count = res.data.count;
						log('dataVerify.count', res.data.count);
					}
				}
			});
		},
		handleCurrentChange(cpage) {
			this.currentPage = cpage;
			this.getFailedRow(this.validateBatchId);
		},
		getFailedRow() {
			let whereFailedRow = {
				filter: {
					where: {
						validateBatchId: this.validateBatchId,
						dataFlowId: {
							regexp: `^${this.id}$`
						},
						type: {
							inq: ['failedRow']
						}
					},
					limit: this.pageSize,
					skip: (this.currentPage - 1) * this.pageSize
				}
			};
			if (this.source.tableName && this.source.tableName !== '') {
				whereFailedRow.filter.where['sourceStage.tableName'] = this.source.tableName;
			}
			ValidationResults.get(whereFailedRow).then(res => {
				if (res.statusText === 'OK' || res.status === 200) {
					if (res.data) {
						this.failedRow = res.data;
						log('dataVerify.error', res.data);
					}
				}
			});
		},
		handleVerifyCancel() {
			let self = this;
			// 状态修改为 interrupted 停止校验
			let data = {
				validateStatus: 'interrupted'
			};
			dataFlows.patchId(this.id, data).then(res => {
				if (res.statusText === 'OK' || res.status === 200) {
					self.editor.showMonitor();
				}
			});
		},
		GoBack() {
			this.editor.showMonitor();
		}
	}
};
</script>
<style lang="less" scoped>
.dv-pre-box {
	width: 100%;
	height: 180px;
	margin-bottom: 10px;
	margin-top: 10px;
	font-size: 12px;
	border: 1px solid rgba(220, 223, 230, 1);
	box-shadow: 2px 2px 7px 0px rgba(0, 0, 0, 0.1);
	background: rgba(255, 255, 255, 1);
}
.data-contPreView {
	margin-left: 20px;
	margin-right: 20px;
}
.dv-pre-rowCheck p {
	font-size: 14px;
	font-weight: 400;
	color: rgba(153, 153, 153, 1);
	line-height: 58px;
}
.dv-pre-label {
	height: 39px;
	line-height: 39px;
	padding-left: 10px;
	background: rgba(250, 250, 250, 1);
	border-bottom: 1px solid rgba(220, 223, 230, 1);
}
.dv-pre-right {
	float: right;
	margin-right: 10px;
	color: #999;
}
.dv-pre-rowTotal {
	float: left;
	width: 24%;
	font-size: 12px;
	line-height: 40px;
	height: auto;
	margin-top: 10px;
	margin-left: 10px;
	border-right: 1px solid rgba(220, 223, 230, 1);
}
.dv-pre-dataBox {
	float: left;
	width: 72%;
	display: flex;
	margin-left: 10px;
	justify-content: space-around;
}
.dv-pre-dataBox-item {
	font-size: 50px;
	font-weight: 400;
	color: rgba(72, 182, 226, 1);
	line-height: 56px;
	text-align: center;
}
.dv-contrast-table {
	margin-bottom: 10px;
	box-shadow: 2px 2px 7px 0px rgba(0, 0, 0, 0.1);
	min-height: 100px;
	max-height: 250px;
}
.dv-contrast-box {
	width: 100%;
	margin-top: 10px;
	background: rgba(255, 255, 255, 1);
	//border:1px solid rgba(220, 223, 230, 1);
	box-shadow: 2px 2px 7px 0px rgba(0, 0, 0, 0.1);
	border-radius: 4px;
}
.dv-contrast-header {
	height: 39px;
	line-height: 39px;
	font-size: 14px;
	padding-left: 10px;
	background: rgba(250, 250, 250, 1);
	border-top: 1px solid rgba(220, 223, 230, 1);
	border-left: 1px solid rgba(220, 223, 230, 1);
	border-right: 1px solid rgba(220, 223, 230, 1);
}
.dv-contrast-content {
	display: flex;
	justify-content: space-around;
}
.dv-contrast-content-item-tip {
	height: 39px;
	line-height: 39px;
	padding-left: 10px;
	background: rgba(250, 250, 250, 1);
	border-bottom: 1px solid rgba(220, 223, 230, 1);
	color: #666;
}
.dv-contrast-content-item-text {
	padding: 10px;
	color: #666;
}
.dv-contrast-content :first-child {
	border-left: none;
}
.dv-contrast-content-item {
	width: 33%;
	font-size: 12px;
	border-left: 1px solid #dedee4;
}
.dv-pre-btn {
	margin-top: 10px;
	float: right;
}
.clear {
	clear: both;
}
.el-alert {
	margin-top: 10px;
}
.btn-box {
	display: flex;
	justify-content: center;
	margin-top: 30px;
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
.dv-pre-rowText {
	display: inline-block;
	padding-left: 20px;
}
</style>
<style lang="less">
.dv-pre-right .el-pagination {
	white-space: nowrap;
	padding: 0;
	font-weight: 700;
	display: inline-block;
	background: #fafafa;
	height: 16px;
}
.dv-pre-right .el-pagination button:disabled {
	background-color: #fafafa;
}
.dv-pre-right .el-pagination button:disabled {
	background-color: #fafafa;
}
.dv-pre-right .el-pagination .btn-next {
	padding-left: 0;
}
.dv-pre-right .el-pagination .btn-next,
.el-pagination .btn-prev {
	background-color: #fafafa;
}
.el-pagination button,
.el-pagination span:not([class*='suffix']) {
	height: 39px;
}
.dv-result-fail-table td .cell,
.el-table th .cell {
	white-space: normal;
}
</style>
