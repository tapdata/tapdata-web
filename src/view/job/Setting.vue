<template>
	<div class="data-flow-setting">
		<el-form label-width="40px" :data="formData" >
			<el-row>
				<el-col :span="12">
					<el-form-item>
						<div>{{$t('dataFlow.taskName')}}</div>
						<el-input
								:placeholder="$t('dataFlow.searchPlaceholder')" v-model="formData.name"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="11">
					<el-form-item>
						<div>{{$t('dataFlow.taskName')}}</div>
						<el-input type="textarea"  :autosize="{ minRows: 5, maxRows: 6}"></el-input>
					</el-form-item>
				</el-col>
			</el-row>
			<el-row>
				<el-col>
					<el-form-item>
						<div>{{$t('dataFlow.sync_type')}}</div>
						<el-radio-group v-model="formData.sync_type" size="mini">
							<el-radio-button label="3" >{{$t('dataFlow.initial_sync') +' '+ $t('dataFlow.cdc')}}</el-radio-button>
							<el-radio-button label="1" >{{$t('dataFlow.initial_sync')}}</el-radio-button>
							<el-radio-button label="2" >{{$t('dataFlow.cdc')}}</el-radio-button>
						</el-radio-group>
					</el-form-item>
				</el-col>
			</el-row>
			<el-row style="border-top: 1px solid #dedee4">
				<el-col :span="12">
					<el-form-item >
						<div>{{$t('dataFlow.notification_lag')}}</div>
						<el-input v-model="formData.readBatchSize"></el-input>
						<el-input v-model="formData.readCdcInterval"></el-input>
					</el-form-item>
					<el-form-item>
						<div>{{$t('dataFlow.read_cdc_interval')}}</div>
						<el-input></el-input>
					</el-form-item>
					<el-form-item>
						<div>{{$t('dataFlow.read_batch_size')}}</div>
						<el-input></el-input>
					</el-form-item>
					<el-form-item>
						<div>{{$t('dataFlow.mission')}}</div>
						<el-input></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item>
						<div>{{$t('dataFlow.send_email')}}</div>
						<el-checkbox v-model="formData.emailWaring.stopped">{{$t('dataFlow.stopped')}}</el-checkbox>
						<el-checkbox v-model="formData.emailWaring.error">{{$t('dataFlow.error')}}</el-checkbox>
						<el-checkbox v-model="formData.emailWaring.edited">{{$t('dataFlow.edited')}}</el-checkbox>
						<el-checkbox v-model="formData.emailWaring.started">{{$t('dataFlow.started')}}</el-checkbox>
					</el-form-item>
					<el-form-item v-show="formData.sync_type !== '2'">
						<div>{{$t('dataFlow.drop_target_before_start')}}</div>  <!-- 开启任务前是否删除目标表-->
						<el-radio-group v-model="radio3" size="mini">
							<el-radio-button label="true">{{$t('dataFlow.yes')}}</el-radio-button>
							<el-radio-button label="false">{{$t('dataFlow.no')}}</el-radio-button>
						</el-radio-group>
					</el-form-item>
					<el-form-item v-show="formData.sync_type === '1' ">
						<div>{{$t('dataFlow.run_custom_sql')}}</div>
						<el-radio-group v-model="radio3" size="mini"> <!-- 重复运行自定义SQL -->
							<el-radio-button label="true">{{$t('dataFlow.yes')}}</el-radio-button>
							<el-radio-button label="false">{{$t('dataFlow.no')}}</el-radio-button>
						</el-radio-group>
					</el-form-item>
					<el-form-item>
						<div>{{$t('dataFlow.stop_on_error')}}</div> <!-- 遇到错误时停止同步 -->
						<el-radio-group v-model="radio3" size="mini">
							<el-radio-button label="true">{{$t('dataFlow.yes')}}</el-radio-button>
							<el-radio-button label="false">{{$t('dataFlow.no')}}</el-radio-button>
						</el-radio-group>
					</el-form-item>
					<el-form-item v-show="formData.sync_type === '1' ">
						<div>{{$t('dataFlow.is_schedule')}}</div> <!-- 定期调度任务 -->
						<el-radio-group v-model="radio3" size="mini">
							<el-radio-button label="true">{{$t('dataFlow.yes')}}</el-radio-button>
							<el-radio-button label="false">{{$t('dataFlow.no')}}</el-radio-button>
						</el-radio-group>
					</el-form-item>
					<el-form-item>
						<div>{{$t('dataFlow.need_to_create_Index')}}</div> <!-- 自动创建目标索引 -->
						<el-radio-group v-model="radio3" size="mini">
							<el-radio-button label="true">{{$t('dataFlow.yes')}}</el-radio-button>
							<el-radio-button label="false">{{$t('dataFlow.no')}}</el-radio-button>
						</el-radio-group>
					</el-form-item>
					<el-form-item>
						<div>{{$t('dataFlow.data_quality_tag')}}</div> <!-- 添加数据质量标签 -->
						<el-radio-group v-model="radio3" size="mini">
							<el-radio-button label="true">{{$t('dataFlow.yes')}}</el-radio-button>
							<el-radio-button label="false">{{$t('dataFlow.no')}}</el-radio-button>
						</el-radio-group>
					</el-form-item>
					<el-form-item>
						<div>{{$t('dataFlow.isOpenAutoDDL')}}</div> <!-- 自动处理DDL操作 -->
						<el-radio-group v-model="radio3" size="mini">
							<el-radio-button label="true">{{$t('dataFlow.yes')}}</el-radio-button>
							<el-radio-button label="false">{{$t('dataFlow.no')}}</el-radio-button>
						</el-radio-group>
					</el-form-item>
				</el-col>
			</el-row>
		</el-form>
	</div>
</template>

<script>
	export default {
		name: "Setting.vue",
		props: {
			dataFlow: {
				type: Object,
				required: true
			}
		},
		data() {
			return {
				formData: {
					name: '',
					sync_type: '3',
					readBatchSize:25000,
					notificationWindow:0,
					readCdcInterval:500,
					emailWaring: {        // 发送告警邮件
						edited: true,            // 当任务被编辑时
						started: false,      // 当任务启动时
						error: true,      // 当任务出错
						paused: false      // 任务停止
					},
					stopOnError:false,
				},
				checkboxGroup1: ['1','3'],
				radio3:true,
			};
		},
		mounted() {
			this.formData = this.dataFlow;
		},
		watch: {
			dataFlow: {
				deep: true,
				handler(){
					this.$emit('dataChanged', this.dataFlow);
				}
			}
		},
	};
</script>

<style lang="less" scoped>
.data-flow-setting{
	height: calc(100vh - 50px);
	overflow: auto;
}
</style>
