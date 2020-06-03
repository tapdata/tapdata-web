<template>
	<div class="data-flow-setting">
		<el-form label-width="40px" :data="formData">
			<el-row>
				<el-col :span="24">
					<el-form-item>
						<div>{{ $t("dataFlow.sync_type") }}</div>
						<el-radio-group v-model="formData.sync_type" size="mini" @change="changeSyncType">
							<el-radio-button label="initial_sync+cdc">{{
								$t("dataFlow.initial_sync") + "+" + $t("dataFlow.cdc")
								}}
							</el-radio-button>
							<el-radio-button label="initial_sync">{{ $t("dataFlow.initial_sync") }}</el-radio-button>
							<el-radio-button label="cdc">{{ $t("dataFlow.cdc") }}</el-radio-button>
						</el-radio-group>
					</el-form-item>
				</el-col>
			</el-row>
			<el-row>
				<el-col :span="12">
					<el-form-item>
						<div>{{ $t("dataFlow.mission") }}</div>
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
					<div>{{ $t("dataFlow.send_email") }}</div>
					<el-checkbox-button border class="setBtn" v-model="formData.emailWaring.paused">{{
						$t("dataFlow.paused")
						}}
					</el-checkbox-button>
					<el-checkbox-button border class="setBtn" v-model="formData.emailWaring.error">{{
						$t("dataFlow.error")
						}}
					</el-checkbox-button>
					<el-checkbox-button border class="setBtn" v-model="formData.emailWaring.edited">{{
						$t("dataFlow.edited")
						}}
					</el-checkbox-button>
					<el-checkbox-button border class="setBtn" v-model="formData.emailWaring.started">{{
						$t("dataFlow.started")
						}}
					</el-checkbox-button>
				</el-form-item>
			</el-row>
			<el-row>
				<el-col :span="12">
					<el-form-item>
						<div>{{ $t("dataFlow.send_email_when_replication") }}</div>
						<el-input v-model="formData.notificationWindow" size="mini"></el-input>
						<div>{{ $t("dataFlow.send_email_at_most_one_replication") }}</div>
						<el-input v-model="formData.notificationInterval" size="mini"></el-input>
					</el-form-item>
					<el-form-item>
						<div>{{ $t("dataFlow.read_cdc_interval") }}</div>
						<el-input v-model="formData.readCdcInterval" size="mini">
							<template slot="append">ms</template>
						</el-input>
					</el-form-item>
					<el-form-item>
						<div>{{ $t("dataFlow.read_batch_size") }}</div>
						<el-input v-model="formData.readBatchSize" size="mini">
							<template slot="append">row</template>
						</el-input>
					</el-form-item>

					<el-form-item v-show="formData.sync_type === 'cdc'" size="mini">
						<div>{{ $t("dataFlow.SyncPoint") }}</div>
						<el-radio-group v-model="formData.syncPoint">
							<el-radio-button label="current">{{ $t("dataFlow.Current") }}</el-radio-button>
							<el-radio-button label="sync_time">{{ $t("dataFlow.SyncTime") }}</el-radio-button>
						</el-radio-group>

						<el-row v-if="formData.syncPoint === 'sync_time'">
							<el-col :span="12" style="margin-top: 10px">
								<el-date-picker format="yyyy-MM-dd" style="width: 100%;"
												v-model="formData.syncDatePicker"></el-date-picker>
							</el-col>
							<el-col :span="12" style="margin-top: 10px">
								<el-time-picker format="HH:mm:ss" style="width: 100%;"
												v-model="formData.syncTimePicker"></el-time-picker>
							</el-col>
						</el-row>
					</el-form-item>
					<el-form-item>
						<div>{{$t('dataFlow.processorConcurrency')}}</div> <!-- 自动处理DDL操作 -->
						<el-input-number v-model="formData.processorConcurrency" controls-position="right" :min="1"
										 size="mini"></el-input-number>
					</el-form-item>
					<el-form-item v-show="formData.sync_type !== 'cdc' ">
						<div>{{$t('dataFlow.transformerConcurrency')}}</div> <!-- 自动处理DDL操作 -->
						<el-input-number v-model="formData.transformerConcurrency" controls-position="right" :min="1"
										 size="mini"></el-input-number>
					</el-form-item>

					`
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
						<div>{{ $t("dataFlow.run_custom_sql") }}</div>
						<el-radio-group v-model="formData.increment" size="mini">
							<!-- 重复运行自定义SQL -->
							<el-radio-button :label="true">{{ $t("dataFlow.yes") }}</el-radio-button>
							<el-radio-button :label="false">{{ $t("dataFlow.no") }}</el-radio-button>
						</el-radio-group>
					</el-form-item>
					<el-form-item>
						<div>{{ $t("dataFlow.stop_on_error") }}</div>
						<!-- 遇到错误时停止同步 -->
						<el-radio-group v-model="formData.stopOnError" size="mini">
							<el-radio-button :label="true">{{ $t("dataFlow.yes") }}</el-radio-button>
							<el-radio-button :label="false">{{ $t("dataFlow.no") }}</el-radio-button>
						</el-radio-group>
					</el-form-item>
					<el-form-item v-show="formData.sync_type === 'initial_sync'">
						<div>{{ $t("dataFlow.is_schedule") }}</div>
						<!-- 定期调度任务 -->
						<el-radio-group v-model="formData.isSchedule" size="mini">
							<el-radio-button :label="true">{{ $t("dataFlow.yes") }}</el-radio-button>
							<el-radio-button :label="false">{{ $t("dataFlow.no") }}</el-radio-button>
						</el-radio-group>
					</el-form-item>
					<el-form-item v-show="formData.isSchedule === true">
						<div>{{ $t("dataFlow.cron_expression") }}</div>
						<!-- 定期调度任务 -->
						<el-input v-model="formData.cronExpression" size="mini"></el-input>
					</el-form-item>
					<el-form-item>
						<div>{{ $t("dataFlow.need_to_create_Index") }}</div>
						<!-- 自动创建目标索引 -->
						<el-radio-group v-model="formData.needToCreateIndex" size="mini">
							<el-radio-button :label="true">{{ $t("dataFlow.yes") }}</el-radio-button>
							<el-radio-button :label="false">{{ $t("dataFlow.no") }}</el-radio-button>
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
						<div>{{ $t("dataFlow.isOpenAutoDDL") }}</div>
						<!-- 自动处理DDL操作 -->
						<el-radio-group v-model="formData.isOpenAutoDDL" size="mini">
							<el-radio-button :label="true">{{ $t("dataFlow.yes") }}</el-radio-button>
							<el-radio-button :label="false">{{ $t("dataFlow.no") }}</el-radio-button>
						</el-radio-group>
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>
	</div>
</template>

<script>
	import {DEFAULT_SETTING} from "../../editor/constants";
	import _ from "lodash";
	import * as moment from "moment";

	export default {
		name: "Setting.vue",
		data() {
			return {
				formData: _.cloneDeep(DEFAULT_SETTING)
			};
		},
		mounted() {
			// this.formData = this.dataFlow;
		},
		watch: {
			formData: {
				deep: true,
				handler() {
					if (this.formData.initial_sync === "initial_sync") {
						this.formData.isOpenAutoDDL = false;
					} else {
						this.formData.run_custom_sql = false;
					}
					this.$emit("dataChanged", this.getData());
				}
			}
		},
		methods: {
			setData(data) {
				if (data) {
					Object.keys(data).forEach(key => (this.formData[key] = data[key]));
				}
			},
			getData() {
				let result = _.cloneDeep(this.formData);
				if (result.syncPoint === "sync_time") {
					let dateStr = moment(result.syncDatePicker).format("YYYY-MM-DD");
					let timeStr = moment(result.syncTimePicker).format("HH:mm:ss");
					result.syncTime = `${dateStr} ${timeStr}`;
				} else {
					result.syncTime = "";
				}

				return result;
			},
			changeSyncType(type) {
				if (type === "initial_sync") {
					this.formData.isOpenAutoDDL = false;
				} else {
					this.formData.run_custom_sql = false;
					this.formData.isSchedule = false;
					this.formData.cronExpression = '';
				}
			}
		}
	};
</script>
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
