<template>
	<div class="data-flow-setting">
		<el-form label-width="40px" :data="formData" >
			<el-row>
				<el-col :span="24">
					<el-form-item>
						<div>{{$t('dataFlow.sync_type')}}</div>
						<el-radio-group v-model="formData.sync_type" size="mini">
							<el-radio-button label="initial_sync+cdc" >{{$t('dataFlow.initial_sync') +'+'+ $t('dataFlow.cdc')}}</el-radio-button>
							<el-radio-button label="initial_sync" >{{$t('dataFlow.initial_sync')}}</el-radio-button>
							<el-radio-button label="cdc" >{{$t('dataFlow.cdc')}}</el-radio-button>
						</el-radio-group>
					</el-form-item>
				</el-col>
			</el-row>
			<el-row>
				<el-col :span="12">
					<el-form-item>
						<div>{{$t('dataFlow.mission')}}</div>
						<el-input v-model="formData.description" type="textarea"  :autosize="{ minRows: 2, maxRows: 6}"></el-input>
					</el-form-item>
				</el-col>
			</el-row>
			<el-row style="border-top: 1px solid #dedee4">
				<el-col :span="12">
					<el-form-item >
						<div>{{$t('dataFlow.notification_lag')}}</div>
						<el-input v-model="formData.notificationWindow" size="mini">
							<template slot="prepend">发送间隔</template>
							<template slot="append">ms</template>
						</el-input>
						<el-input v-model="formData.notificationInterval" size="mini">
							<template slot="append">秒后取消发送</template>
						</el-input>
					</el-form-item>
					<el-form-item>
						<div>{{$t('dataFlow.read_cdc_interval')}}</div>
						<el-input v-model="formData.readCdcInterval" size="mini">
							<template slot="append">ms</template>
						</el-input>
					</el-form-item>
					<el-form-item>
						<div>{{$t('dataFlow.read_batch_size')}}</div>
						<el-input v-model="formData.readBatchSize" size="mini">
							<template slot="append">ms</template>
						</el-input>
					</el-form-item>
<!--					<el-form-item>-->
<!--						<div>{{$t('dataFlow.mission')}}</div>-->
<!--						<el-input v-model="formData.description"></el-input>-->
<!--					</el-form-item>-->
				</el-col>
				<el-col :span="12">
					<el-form-item>
						<div>{{$t('dataFlow.send_email')}}</div>
							<el-checkbox-button border class="setBtn" v-model="formData.emailWaring.stopped">{{$t('dataFlow.stopped')}}</el-checkbox-button>
							<el-checkbox-button border class="setBtn" v-model="formData.emailWaring.error">{{$t('dataFlow.error')}}</el-checkbox-button>
							<el-checkbox-button border class="setBtn" v-model="formData.emailWaring.edited">{{$t('dataFlow.edited')}}</el-checkbox-button>
							<el-checkbox-button border class="setBtn" v-model="formData.emailWaring.started">{{$t('dataFlow.started')}}</el-checkbox-button>
					</el-form-item>
					<el-form-item v-show="formData.sync_type !== 'initial_sync+cdc'">
						<div>{{$t('dataFlow.drop_target_before_start')}}</div>  <!-- 开启任务前是否删除目标表-->
						<el-radio-group v-model="formData.drop_target" size="mini">
							<el-radio-button label="true">{{$t('dataFlow.yes')}}</el-radio-button>
							<el-radio-button label="false">{{$t('dataFlow.no')}}</el-radio-button>
						</el-radio-group>
					</el-form-item>
					<el-form-item v-show="formData.sync_type === 'initial_sync' ">
						<div>{{$t('dataFlow.run_custom_sql')}}</div>
						<el-radio-group v-model="formData.increment" size="mini"> <!-- 重复运行自定义SQL -->
							<el-radio-button label="true">{{$t('dataFlow.yes')}}</el-radio-button>
							<el-radio-button label="false">{{$t('dataFlow.no')}}</el-radio-button>
						</el-radio-group>
					</el-form-item>
					<el-form-item>
						<div>{{$t('dataFlow.stop_on_error')}}</div> <!-- 遇到错误时停止同步 -->
						<el-radio-group v-model="formData.stopOnError" size="mini">
							<el-radio-button label="true">{{$t('dataFlow.yes')}}</el-radio-button>
							<el-radio-button label="false">{{$t('dataFlow.no')}}</el-radio-button>
						</el-radio-group>
					</el-form-item>
					<el-form-item v-show="formData.sync_type === 'initial_sync' ">
						<div>{{$t('dataFlow.is_schedule')}}</div> <!-- 定期调度任务 -->
						<el-radio-group v-model="formData.isSchedule" size="mini">
							<el-radio-button label="true">{{$t('dataFlow.yes')}}</el-radio-button>
							<el-radio-button label="false">{{$t('dataFlow.no')}}</el-radio-button>
						</el-radio-group>
					</el-form-item>
					<el-form-item>
						<div>{{$t('dataFlow.need_to_create_Index')}}</div> <!-- 自动创建目标索引 -->
						<el-radio-group v-model="formData.needToCreateIndex" size="mini">
							<el-radio-button label="true">{{$t('dataFlow.yes')}}</el-radio-button>
							<el-radio-button label="false">{{$t('dataFlow.no')}}</el-radio-button>
						</el-radio-group>
					</el-form-item>
<!--					<el-form-item>-->
<!--						<div>{{$t('dataFlow.data_quality_tag')}}</div> &lt;!&ndash; 添加数据质量标签 &ndash;&gt;-->
<!--						<el-radio-group v-model="radio3" size="mini">-->
<!--							<el-radio-button label="true">{{$t('dataFlow.yes')}}</el-radio-button>-->
<!--							<el-radio-button label="false">{{$t('dataFlow.no')}}</el-radio-button>-->
<!--						</el-radio-group>-->
<!--					</el-form-item>-->
<!--					<el-form-item>-->
<!--						<div>{{$t('dataFlow.isOpenAutoDDL')}}</div> &lt;!&ndash; 自动处理DDL操作 &ndash;&gt;-->
<!--						<el-radio-group v-model="isOpenAutoDDL" size="mini">-->
<!--							<el-radio-button label="true">{{$t('dataFlow.yes')}}</el-radio-button>-->
<!--							<el-radio-button label="false">{{$t('dataFlow.no')}}</el-radio-button>-->
<!--						</el-radio-group>-->
<!--					</el-form-item>-->
				</el-col>
			</el-row>
		</el-form>
	</div>
</template>

<script>
	import {DEFAULT_SETTING} from "../../editor/constants";
	import _ from 'lodash';

	export default {
		name: "Setting.vue",
		data() {
			return {
				formData: _.cloneDeep(DEFAULT_SETTING)
			};
		},
		mounted() {
			//this.formData = this.dataFlow;
		},
		watch: {
			formData: {
				deep: true,
				handler(){
					this.$emit('dataChanged', this.formData);
				}
			}
		},
		methods: {
			setData(data){
				if( data ){
					Object.keys(data).forEach(key => this.formData[key] = data[key]);
				}
			},
		}
	};
</script>
<style lang="less" >
/*.data-flow-setting{*/
/*	height: calc(100vh - 50px);*/
/*	overflow: auto;*/
/*}*/
.setBtn{
	.el-checkbox-button__inner{
		padding: 6px 10px ;
		border-left: 1px solid #DCDFE6;
		margin: -2px
	}
}
</style>
