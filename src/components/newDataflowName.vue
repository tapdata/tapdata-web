<template>
	<el-dialog
		class="sp-setting"
		:title="$t('editor.ui.sidebar.setting')"
		:visible.sync="dialogVisibleSetting"
		width="40%"
		:before-close="handleClose"
	>
		<el-form label-width="200px">
			<el-form-item :label="$t('dataFlow.taskName')">
				<el-input v-model="dataflow.name"></el-input>
			</el-form-item>
			<el-form-item :label="$t('dataFlow.sync_type')">
				<el-radio-group v-model="dataflow.setting.sync_type" size="mini">
					<el-radio-button label="initial_sync+cdc"
						>{{ $t('dataFlow.initial_sync') + '+' + $t('dataFlow.cdc') }}
					</el-radio-button>
					<el-radio-button label="initial_sync">{{ $t('dataFlow.initial_sync') }}</el-radio-button>
					<el-radio-button label="cdc">{{ $t('dataFlow.cdc') }}</el-radio-button>
				</el-radio-group>
			</el-form-item>
			<el-form-item :label="$t('dataFlow.stop_on_error')">
				<el-radio-group v-model="dataflow.setting.stopOnError" size="mini">
					<el-radio-button :label="true">{{ $t('dataFlow.yes') }}</el-radio-button>
					<el-radio-button :label="false">{{ $t('dataFlow.no') }}</el-radio-button>
				</el-radio-group>
			</el-form-item>
			<el-form-item :label="$t('dataFlow.need_to_create_Index')">
				<el-radio-group v-model="dataflow.setting.needToCreateIndex" size="mini">
					<el-radio-button :label="true">{{ $t('dataFlow.yes') }}</el-radio-button>
					<el-radio-button :label="false">{{ $t('dataFlow.no') }}</el-radio-button>
				</el-radio-group>
			</el-form-item>
			<el-form-item>
				<div @click="showSetting" class="advance-setting">{{ $t('dataFlow.advanceSetting') }}</div>
			</el-form-item>
		</el-form>
		<span slot="footer" class="dialog-footer">
			<el-button @click="handleClose">{{ $t('dataFlow.previous') }}</el-button>
			<el-button type="primary" @click="save">{{ $t('dataFlow.execution') }}</el-button>
		</span>
	</el-dialog>
</template>

<script>
export default {
	name: 'newDataFlow',
	props: {
		dataflows: {
			required: true,
			value: Object
		}
	},
	watch: {
		dataflow: {
			handler() {
				this.dataflows.name = this.dataflow.name;
			},
			deep: true
		}
	},
	data() {
		return {
			dataflow: {
				name: '',
				setting: {
					sync_type: '',
					stopOnError: '',
					needToCreateIndex: ''
				}
			},
			dialogVisibleSetting: true
		};
	},
	mounted() {
		this.dataflow.name = this.dataflows.name;
		this.dataflow.setting = this.dataflows.setting;
	},
	methods: {
		handleClose() {
			this.dialogVisibleSetting = false;
			this.$parent.simpleGoNext(2);
			this.$parent.$refs.simpleScene.activeStep = 2;
		},
		save() {
			this.dialogVisibleSetting = false;
			this.$parent.editor.ui.setName(this.dataflows.name);
			this.$parent.editor.graph.setSettingData(this.dataflow.setting);
			this.$parent.start();
		},
		showSetting() {
			this.dialogVisibleSetting = false;
			this.$parent.showSetting();
		}
	}
};
</script>

<style lang="less">
.advance-setting {
	color: #48b6e2;
}
.sp-setting {
	font-size: 12px;
	.el-input__inner {
		height: 28px;
		width: 300px;
	}
	.el-form-item {
		margin-bottom: 0;
	}
}
</style>
