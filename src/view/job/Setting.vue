<template>
	<div class="data-flow-setting">
		<div class="head-btns">
			<el-button v-if="disabled" class="e-button" type="primary" @click="seeMonitor">
				{{ $t('dataFlow.button.viewMonitoring') }}
			</el-button>
		</div>
		<el-form label-width="40px" :data="formData" :disabled="disabled" :rules="rules">
			<el-row>
				<el-col :span="24">
					<el-form-item>
						<div>{{ $t('dataFlow.sync_type') }}</div>
						<el-radio-group v-model="formData.sync_type" size="mini" @change="changeSyncType">
							<el-radio-button label="initial_sync+cdc"
								>{{ $t('dataFlow.initial_sync') + '+' + $t('dataFlow.cdc') }}
							</el-radio-button>
							<el-radio-button label="initial_sync">{{ $t('dataFlow.initial_sync') }}</el-radio-button>
							<el-radio-button label="cdc">{{ $t('dataFlow.cdc') }}</el-radio-button>
						</el-radio-group>
					</el-form-item>
				</el-col>
			</el-row>
			<el-row>
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
			</el-row>
			<el-row style="border-top: 1px solid #dedee4">
				<el-form-item>
					<div>{{ $t('dataFlow.send_email') }}</div>
					<el-checkbox-button border class="setBtn" v-model="formData.emailWaring.paused"
						>{{ $t('dataFlow.stopped') }}
					</el-checkbox-button>
					<el-checkbox-button border class="setBtn" v-model="formData.emailWaring.error"
						>{{ $t('dataFlow.error') }}
					</el-checkbox-button>
					<el-checkbox-button border class="setBtn" v-model="formData.emailWaring.edited"
						>{{ $t('dataFlow.edited') }}
					</el-checkbox-button>
					<el-checkbox-button border class="setBtn" v-model="formData.emailWaring.started"
						>{{ $t('dataFlow.started') }}
					</el-checkbox-button>
				</el-form-item>
			</el-row>
			<el-row>
				<el-col :span="12">
					<el-form-item>
						<div>{{ $t('dataFlow.send_email_when_replication') }}</div>
						<el-input v-model="formData.notificationWindow" size="mini"></el-input>
						<div>{{ $t('dataFlow.send_email_at_most_one_replication') }}</div>
						<el-input v-model="formData.notificationInterval" size="mini"></el-input>
					</el-form-item>
					<el-form-item>
						<div>{{ $t('dataFlow.read_cdc_interval') }}</div>
						<el-input v-model="formData.readCdcInterval" size="mini">
							<template slot="append">ms</template>
						</el-input>
					</el-form-item>
					<el-form-item>
						<div>{{ $t('dataFlow.read_batch_size') }}</div>
						<el-input v-model="formData.readBatchSize" size="mini">
							<template slot="append">row</template>
						</el-input>
					</el-form-item>
					<el-form-item>
						<div>{{ $t('dataFlow.processorConcurrency') }}</div>
						<!-- 自动处理DDL操作 -->
						<el-input-number
							v-model="formData.processorConcurrency"
							controls-position="right"
							:min="1"
							size="mini"
						></el-input-number>
					</el-form-item>
					<el-form-item v-show="formData.sync_type !== 'cdc'">
						<div>{{ $t('dataFlow.transformerConcurrency') }}</div>
						<!-- 自动处理DDL操作 -->
						<el-input-number
							v-model="formData.transformerConcurrency"
							controls-position="right"
							:min="1"
							size="mini"
						></el-input-number>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<!--					<el-form-item v-show="formData.sync_type !== 'initial_sync+cdc'">-->
					<!--						<div>{{$t('dataFlow.drop_target_before_start')}}</div>  &lt;!&ndash; 开启任务前是否删除目标表&ndash;&gt;-->
					<!--						<el-radio-group v-model="formData.drop_target" size="mini">-->
					<!--							<el-radio-button label="true">{{$t('dataFlow.yes')}}</el-radio-button>-->
					<!--							<el-radio-button label="false">{{$t('dataFlow.no')}}</el-radio-button>-->
					<!--						</el-radio-group>-->
					<!--					</el-form-item>-->
					<el-form-item v-show="formData.sync_type === 'initial_sync'">
						<div>{{ $t('dataFlow.run_custom_sql') }}</div>
						<el-radio-group v-model="formData.increment" size="mini">
							<!-- 重复运行自定义SQL -->
							<el-radio-button :label="true">{{ $t('dataFlow.yes') }}</el-radio-button>
							<el-radio-button :label="false">{{ $t('dataFlow.no') }}</el-radio-button>
						</el-radio-group>
					</el-form-item>
					<el-form-item>
						<div>{{ $t('dataFlow.stop_on_error') }}</div>
						<!-- 遇到错误时停止同步 -->
						<el-radio-group v-model="formData.stopOnError" size="mini">
							<el-radio-button :label="true">{{ $t('dataFlow.yes') }}</el-radio-button>
							<el-radio-button :label="false">{{ $t('dataFlow.no') }}</el-radio-button>
						</el-radio-group>
					</el-form-item>
					<el-form-item v-show="formData.sync_type === 'initial_sync'">
						<div>{{ $t('dataFlow.is_schedule') }}</div>
						<!-- 定期调度任务 -->
						<el-radio-group v-model="formData.isSchedule" size="mini">
							<el-radio-button :label="true">{{ $t('dataFlow.yes') }}</el-radio-button>
							<el-radio-button :label="false">{{ $t('dataFlow.no') }}</el-radio-button>
						</el-radio-group>
					</el-form-item>
					<el-form-item
						v-show="formData.isSchedule === true && formData.sync_type === 'initial_sync'"
						prop="cronExpression"
					>
						<div>{{ $t('dataFlow.cronExpression') }}</div>
						<!-- 定期调度任务 -->
						<el-input v-model="formData.cronExpression" size="mini"></el-input>
					</el-form-item>
					<el-form-item>
						<div>{{ $t('dataFlow.need_to_create_Index') }}</div>
						<!-- 自动创建目标索引 -->
						<el-radio-group v-model="formData.needToCreateIndex" size="mini">
							<el-radio-button :label="true">{{ $t('dataFlow.yes') }}</el-radio-button>
							<el-radio-button :label="false">{{ $t('dataFlow.no') }}</el-radio-button>
						</el-radio-group>
					</el-form-item>
					<!--					<el-form-item>-->
					<!--						<div>{{$t('dataFlow.data_quality_tag')}}</div> &lt;!&ndash; 添加数据质量标签 &ndash;&gt;-->
					<!--						<el-radio-group v-model="radio3" size="mini">-->
					<!--							<el-radio-button label="true">{{$t('dataFlow.yes')}}</el-radio-button>-->
					<!--							<el-radio-button label="false">{{$t('dataFlow.no')}}</el-radio-button>-->
					<!--						</el-radio-group>-->
					<!--					</el-form-item>-->
					<el-form-item v-show="formData.sync_type !== 'initial_sync'">
						<div>{{ $t('dataFlow.isOpenAutoDDL') }}</div>
						<!-- 自动处理DDL操作 -->
						<el-radio-group v-model="formData.isOpenAutoDDL" size="mini">
							<el-radio-button :label="true">{{ $t('dataFlow.yes') }}</el-radio-button>
							<el-radio-button :label="false">{{ $t('dataFlow.no') }}</el-radio-button>
						</el-radio-group>
					</el-form-item>
				</el-col>
			</el-row>
			<el-form-item v-show="formData.sync_type === 'cdc'" size="mini">
				<div>
					{{ $t('dataFlow.SyncPoint') }}
					<el-tooltip placement="right-end">
						<div slot="content">
							<div>{{ $t('dataFlow.SyncInfo.current') }}</div>
							<div>{{ $t('dataFlow.SyncInfo.localTZ') }}</div>
							<div>{{ $t('dataFlow.SyncInfo.connTZ') }}</div>
						</div>
						<i class="e-primary el-icon-warning-outline"></i>
					</el-tooltip>
				</div>
				<el-row v-for="item in formData.syncPoints" :key="item.name" style="margin-top: 10px">
					<el-col :span="8">
						<div class="dataBase-name">
							<el-tooltip :content="item.name || item.connectionId" placement="left-start">
								<span>{{ item.name || item.connectionId }}</span>
							</el-tooltip>
						</div>
					</el-col>
					<el-col :span="7" style="margin-right: 10px">
						<el-select v-model="item.type" placeholder="请选择">
							<el-option v-for="op in options" :key="op.value" :label="op.label" :value="op.value">
							</el-option>
						</el-select>
					</el-col>
					<el-col :span="8">
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
			]
		};
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

		seeMonitor() {
			this.editor.initMonitor();
		},
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
						timezone: '+08:00' // 当type为localTZ时有该字段
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
						timezone: '+08:00' // 当type为localTZ时有该字段
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
							timezone: '+08:00',
							name: ''
						};
					}
				});
				return map;
			}
		}
	}
};
</script>
<style scoped>
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
/*.data-flow-setting{*/
/*	height: calc(100vh - 50px);*/
/*	overflow: auto;*/
/*}*/
.setBtn {
	.el-checkbox-button__inner {
		padding: 6px 10px;
		border-left: 1px solid #dcdfe6;
		margin: -2px;
	}
}
</style>
