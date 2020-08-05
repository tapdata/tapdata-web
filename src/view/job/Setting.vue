<template>
	<div class="data-flow-setting">
		<head class="head">
			<el-button class="back-btn-icon-box" @click="GoBack"
				><i class="iconfont icon-you2 back-btn-icon"></i
			></el-button>
			<span class="back-btn-text">{{ $t('dataVerify.dataVerify') }}</span>
		</head>
		<!-- <div class="head-btns">
			<el-button v-if="disabled" class="e-button" type="primary" @click="seeMonitor">
				{{ $t('dataFlow.button.viewMonitoring') }}
			</el-button>
		</div> -->
		<el-form
			class="e-form"
			label-position="right"
			label-width="100px"
			:data="formData"
			:disabled="disabled"
			:rules="rules"
		>
			<el-form-item :label="$t('dataFlow.sync_type')">
				<el-radio-group v-model="formData.sync_type" size="mini" @change="changeSyncType">
					<el-radio label="initial_sync+cdc"
						>{{ $t('dataFlow.initial_sync') + '+' + $t('dataFlow.cdc') }}
					</el-radio>
					<el-radio label="initial_sync">{{ $t('dataFlow.initial_sync') }}</el-radio>
					<el-radio label="cdc">{{ $t('dataFlow.cdc') }}</el-radio>
				</el-radio-group>
			</el-form-item>
			<!-- <el-row>
				<el-col :span="12">
					<el-form-item>
						<div>{{ $t('dataFlow.mission') }}</div>
						<el-input
							v-model="formData.description"
							type="textarea"
							:autosize="{ minRows: 2, maxRows: 6 }"
						></el-input>
					</el-form-item>
				</el-col>
			</el-row> -->
			<!-- style="border-top: 1px solid #dedee4" -->
			<el-form-item :label="$t('dataFlow.setting.distinctWriteType')">
				<!-- <div>
					{{ $t('dataFlow.setting.distinctWriteType') }}
					<el-popover class="aggtip" placement="top-start" trigger="hover">
						<div>{{ $t('dataFlow.setting.intellectTip') }}</div>
						<div>{{ $t('dataFlow.setting.compelTip') }}</div>
						<span class="icon iconfont icon-tishi1" slot="reference"></span>
					</el-popover>
				</div> -->

				<el-select v-model="formData.distinctWriteType" size="mini" placeholder="请选择">
					<el-option v-for="item in dataWriteList" :key="item.value" :label="item.label" :value="item.value">
					</el-option>
				</el-select>
				<el-popover class="aggtip" placement="top-start" trigger="hover">
					<div>{{ $t('dataFlow.setting.intellectTip') }}</div>
					<div>{{ $t('dataFlow.setting.compelTip') }}</div>
					<span class="icon iconfont icon-tishi1" slot="reference"></span>
				</el-popover>
			</el-form-item>
			<el-form-item :label="$t('dataFlow.send_email')">
				<el-checkbox-group v-model="formData.emailWaring">
					<el-checkbox class="setBtn" label="paused">{{ $t('dataFlow.stopped') }} </el-checkbox>
					<el-checkbox class="setBtn" label="error">{{ $t('dataFlow.error') }} </el-checkbox>
					<el-checkbox class="setBtn" label="edited">{{ $t('dataFlow.edited') }} </el-checkbox>
					<el-checkbox class="setBtn" label="started">{{ $t('dataFlow.started') }} </el-checkbox>
				</el-checkbox-group>
			</el-form-item>
			<el-form-item :label="$t('dataFlow.run_custom_sql')" v-show="formData.sync_type === 'initial_sync'">
				<!-- 重复运行自定义SQL -->
				<el-switch
					v-model="formData.increment"
					:active-text="formData.increment ? $t('dataFlow.yes') : $t('dataFlow.no')"
				></el-switch>
				<!-- <el-radio-group v-model="formData.increment" size="mini">
					<el-radio-button :label="true">{{ $t('dataFlow.yes') }}</el-radio-button>
					<el-radio-button :label="false">{{ $t('dataFlow.no') }}</el-radio-button>
				</el-radio-group> -->
			</el-form-item>
			<el-form-item :label="$t('dataFlow.stop_on_error')">
				<!-- 遇到错误时停止同步 -->
				<el-switch
					v-model="formData.stopOnError"
					:active-text="formData.stopOnError ? $t('dataFlow.yes') : $t('dataFlow.no')"
				></el-switch>
			</el-form-item>
			<el-form-item :label="$t('dataFlow.need_to_create_Index')">
				<!-- 自动创建目标索引 -->
				<el-switch
					v-model="formData.needToCreateIndex"
					:active-text="formData.needToCreateIndex ? $t('dataFlow.yes') : $t('dataFlow.no')"
				></el-switch>
			</el-form-item>
			<el-form-item :label="$t('dataFlow.is_schedule')" v-show="formData.sync_type === 'initial_sync'">
				<!-- 定期调度任务 -->
				<el-switch
					v-model="formData.isSchedule"
					:active-text="formData.isSchedule ? $t('dataFlow.yes') : $t('dataFlow.no')"
				></el-switch>
			</el-form-item>
			<el-form-item
				v-show="formData.isSchedule === true && formData.sync_type === 'initial_sync'"
				prop="cronExpression"
			>
				<!-- 定期调度任务 -->
				<el-input
					v-model="formData.cronExpression"
					:placeholder="$t('dataFlow.cronExpression')"
					size="mini"
				></el-input>
			</el-form-item>

			<el-form-item :label="$t('dataFlow.isOpenAutoDDL')" v-show="formData.sync_type !== 'initial_sync'">
				<!-- 自动处理DDL操作 -->
				<el-switch
					v-model="formData.isOpenAutoDDL"
					:active-text="formData.increment ? $t('dataFlow.yes') : $t('dataFlow.no')"
				></el-switch>
			</el-form-item>
			<el-form-item :label="$t('dataFlow.read_cdc_interval')">
				<!-- <div>{{ $t('dataFlow.read_cdc_interval') }}</div> -->
				<el-input v-model="formData.readCdcInterval" size="mini">
					<template slot="append">ms</template>
				</el-input>
			</el-form-item>
			<el-form-item :label="$t('dataFlow.read_batch_size')">
				<!-- <div>{{ $t('dataFlow.read_batch_size') }}</div> -->
				<el-input v-model="formData.readBatchSize" size="mini">
					<template slot="append">row</template>
				</el-input>
			</el-form-item>
			<!-- 定期调度任务 -->
			<!-- <el-form-item
				v-show="formData.isSchedule === true && formData.sync_type === 'initial_sync'"
				prop="cronExpression"
			>
				<div>{{ $t('dataFlow.cronExpression') }}</div>

				<el-input v-model="formData.cronExpression" size="mini"></el-input>
			</el-form-item> -->
			<el-form-item :label="$t('dataFlow.processorConcurrency')">
				<!-- <div>{{ $t('dataFlow.processorConcurrency') }}</div> -->
				<!-- 处理器线程 -->
				<el-input-number v-model="formData.processorConcurrency" :min="1" size="mini"></el-input-number>
			</el-form-item>
			<el-form-item :label="$t('dataFlow.transformerConcurrency')" v-show="formData.sync_type !== 'cdc'">
				<!-- <div>{{ $t('dataFlow.transformerConcurrency') }}</div> -->
				<!-- 目标写入线程 -->
				<el-input-number v-model="formData.transformerConcurrency" :min="1" size="mini"></el-input-number>
			</el-form-item>
			<el-form-item :label="$t('dataFlow.SyncPoint')" v-show="formData.sync_type === 'cdc'" size="mini">
				<div class="labelTxt">
					{{ $t('dataFlow.cdcLabel') }}
					<!-- <el-tooltip placement="right-end">
						<div slot="content">
							<div>{{ $t('dataFlow.SyncInfo.current') }}</div>
							<div>{{ $t('dataFlow.SyncInfo.localTZ') }}</div>
							<div>{{ $t('dataFlow.SyncInfo.connTZ') }}</div>
						</div>
						<i class="e-primary el-icon-warning-outline"></i>
					</el-tooltip> -->
				</div>
				<el-row v-for="item in formData.syncPoints" :key="item.name" style="margin-top: 10px">
					<!-- <el-col :span="8">
						<div class="dataBase-name">
							<el-tooltip :content="item.name || item.connectionId" placement="left-start">
								<span>{{ item.name || item.connectionId }}</span>
							</el-tooltip>
						</div>
					</el-col> -->
					<el-col :span="12" style="margin-right: 10px">
						<el-select v-model="item.type" placeholder="请选择">
							<el-option v-for="op in options" :key="op.value" :label="op.label" :value="op.value">
							</el-option>
						</el-select>
					</el-col>
					<el-col :span="10" v-if="item.type !== 'current'">
						<el-date-picker
							format="yyyy-MM-dd HH:mm:ss"
							style="width: 95%;"
							v-model="item.date"
							type="datetime"
							:disabled="item.type === 'current'"
						></el-date-picker>
					</el-col>
				</el-row>
			</el-form-item>
		</el-form>
	</div>
</template>

<script>
import { DEFAULT_SETTING } from '../../editor/constants';
import _ from 'lodash';
import * as moment from 'moment';
import factory from '../../api/factory';
const connections = factory('connections');
export default {
	name: 'Setting.vue',
	data() {
		return {
			disabled: false,
			systemTimeZone: '',
			formData: _.cloneDeep(DEFAULT_SETTING),
			rules: {
				cronExpression: [
					{
						required: true,
						validator: (rule, v, callback) => {
							let value = this.formData.cronExpression;
							if (!value || !value.trim()) {
								callback(this.$t('dataFlow.cronExpression'));
							} else {
								callback();
							}
						},
						trigger: 'blur'
					}
				]
			},
			options: [
				{
					label: this.$t('dataFlow.SyncInfo.localTZType'),
					value: 'localTZ'
				},
				{
					label: this.$t('dataFlow.SyncInfo.connTZType'),
					value: 'connTZ'
				},
				{
					label: this.$t('dataFlow.SyncInfo.currentType'),
					value: 'current'
				}
			],
			dataWriteList: [
				{
					label: this.$t('dataFlow.setting.intellect'),
					value: 'intellect'
				},
				{
					label: this.$t('dataFlow.setting.compel'),
					value: 'compel'
				}
			]
		};
	},

	mounted() {
		let timeZone = new Date().getTimezoneOffset() / 60;
		if (timeZone > 0) {
			this.systemTimeZone = 0 - timeZone;
		} else {
			this.systemTimeZone = '+' + -timeZone;
		}
	},

	watch: {
		formData: {
			deep: true,
			handler() {
				if (this.formData.initial_sync === 'initial_sync') {
					this.formData.isOpenAutoDDL = false;
				} else {
					this.formData.run_custom_sql = false;
				}
				this.$emit('dataChanged', this.getData());
			}
		}
	},

	methods: {
		setData(data) {
			if (data) {
				Object.keys(data).forEach(key => (this.formData[key] = data[key]));
				if (data.editDisable) this.disabled = data.editDisable;
			}
			let map = this.updateSyncNode(this.formData.syncPoints);
			if (map) {
				this.formData.syncPoints = Object.values(map);
			}
		},
		getData() {
			let result = _.cloneDeep(this.formData);
			if (result.syncPoints) {
				result.syncPoints.forEach(point => {
					point.date = point.date ? moment(point.date).format('YYYY-MM-DD HH:mm:ss') : '';
				});
			}
			return result;
		},

		// seeMonitor() {
		// 	this.editor.initMonitor();
		// },
		changeSyncType(type) {
			if (type === 'initial_sync') {
				this.formData.isOpenAutoDDL = false;
				this.formData.syncPoints = [
					{
						connectionId: '',
						type: 'current', // localTZ: 本地时区； connTZ：连接时区
						time: '',
						date: '',
						name: '',
						timezone: this.systemTimeZone // 当type为localTZ时有该字段
					}
				];
			} else if (type === 'cdc') {
				let map = this.updateSyncNode(this.formData.syncPoints);
				if (map) {
					this.formData.syncPoints = Object.values(map);
				}
			} else {
				this.formData.run_custom_sql = false;
				this.formData.syncPoints = [
					{
						connectionId: '',
						type: 'current', // localTZ: 本地时区； connTZ：连接时区
						time: '',
						date: '',
						name: '',
						timezone: this.systemTimeZone // 当type为localTZ时有该字段
					}
				];
			}
		},
		getAllConnectionIds() {
			//获取所有节点的collectionId ;
			let dataCells = this.editor.getAllCells();
			let targetCell = this.editor.getSinks();
			let targetCellIds = [];
			if (targetCell && targetCell.length > 0) {
				targetCell.forEach(cell => {
					let formData = typeof cell.getFormData === 'function' ? cell.getFormData() : null;
					targetCellIds.push(formData.connectionId);
				});
			}
			if (dataCells && dataCells.length > 0) {
				return dataCells
					.map(cell => {
						let formData = typeof cell.getFormData === 'function' ? cell.getFormData() : null;
						let index = targetCellIds.indexOf(formData.connectionId);
						if (index >= 0) {
							targetCellIds.splice(index, 1);
							return;
						} else {
							return formData.connectionId;
						}
					})
					.filter(v => !!v);
			}
		},
		async getAllConnectionName(connectionIds) {
			let result = await connections.get({
				filter: JSON.stringify({
					where: {
						_id: {
							inq: connectionIds
						}
					},
					fields: {
						name: true,
						id: true
					}
				})
			});
			if (result.data && result.data.length > 0) {
				result.data.forEach(name => {
					this.formData.syncPoints.forEach(point => {
						if (name.id === point.connectionId) {
							point.name = name.name;
						}
					});
				});
			}
		},
		updateSyncNode(syncPoints) {
			syncPoints = syncPoints || [];
			let connectionIds = this.getAllConnectionIds();
			if (connectionIds && connectionIds.length > 0) {
				this.getAllConnectionName(connectionIds)
					.then(() => {})
					.catch(() => {});
				syncPoints = syncPoints.filter(point => connectionIds.includes(point.connectionId));
				let map = {};
				// connectionId -> syncPoint
				syncPoints.forEach(s => (map[s.connectionId] = s));

				connectionIds.forEach(connectionId => {
					if (!map[connectionId]) {
						map[connectionId] = {
							connectionId: connectionId,
							type: 'current', // localTZ: 本地时区； connTZ：连接时区
							time: '',
							date: '',
							timezone: this.systemTimeZone,
							name: ''
						};
					}
				});
				return map;
			}
		},

		// 返回
		GoBack() {
			debugger;
			if (!this.disabled) {
				this.editor.showSetting(false);
			} else {
				this.editor.initMonitor();
			}
		}
	}
};
</script>
<style scoped lang="less">
.data-flow-setting {
	.head {
		display: block !important;
		width: 100%;
		height: 29px;
		background: #f5f5f5;
		border-bottom: 1px solid #dedee4;
	}
	.back-btn-icon-box {
		width: 30px;
		height: 30px;
		margin: 0;
		padding: 0;
		line-height: 1;
		font-weight: normal;
		font-size: 14px;
		color: red;
		text-align: center;
		white-space: nowrap;
		cursor: pointer;
		outline: 0;
		border: 0;
		border-radius: 0;
		box-sizing: border-box;
		background: #48b6e2;
		transition: 0.1s;
		-webkit-appearance: none;
		-webkit-box-sizing: border-box;
		-webkit-transition: 0.1s;
	}
	.back-btn-icon-box:hover {
		background: #6dc5e8;
	}
	.back-btn-icon {
		color: #fff;
	}
	.back-btn-text {
		font-size: 12px;
	}
	.e-form {
		padding: 20px;
		box-sizing: border-box;
		font-size: 12px;
		.labelTxt {
			font-size: 12px;
		}
	}
	// height: calc(100vh - 50px);
	// overflow: auto;
}
.e-button {
	margin: 10px 10px 0 0;
}
.dataBase-name {
	margin-right: 5px;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}
</style>
<style lang="less">
.data-flow-setting {
	.el-form-item__label,
	.el-checkbox__label,
	.el-radio__label,
	.el-switch__label span {
		font-size: 12px;
	}
	.el-form-item {
		margin-bottom: 10px;
		.el-form-item__content .el-input-group {
			vertical-align: middle;
		}
		.el-checkbox-group {
			line-height: 34px;
		}
		.el-input.el-input-group,
		.el-input-number--mini {
			width: 230px;
		}
	}
}
.setBtn {
	.el-checkbox-button__inner {
		padding: 6px 10px;
		border-left: 1px solid #dcdfe6;
		margin: -2px;
	}
}
</style>
