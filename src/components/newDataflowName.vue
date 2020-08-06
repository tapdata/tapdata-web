<template>
	<el-dialog title="任务设置" :visible.sync="dialogVisibleSetting" width="40%" :before-close="handleClose">
		<el-form label-width="200px" :model="form">
			<el-form-item label="任务名称">
				<el-input></el-input>
			</el-form-item>
			<el-form-item :label="$t('dataFlow.sync_type')">
				<el-radio-group v-model="form.sync_type" size="mini">
					<el-radio-button label="initial_sync+cdc"
						>{{ $t('dataFlow.initial_sync') + '+' + $t('dataFlow.cdc') }}
					</el-radio-button>
					<el-radio-button label="initial_sync">{{ $t('dataFlow.initial_sync') }}</el-radio-button>
					<el-radio-button label="cdc">{{ $t('dataFlow.cdc') }}</el-radio-button>
				</el-radio-group>
			</el-form-item>
			<el-form-item :label="$t('dataFlow.stop_on_error')">
				<el-radio-group v-model="form.stopOnError" size="mini">
					<el-radio-button :label="true">{{ $t('dataFlow.yes') }}</el-radio-button>
					<el-radio-button :label="false">{{ $t('dataFlow.no') }}</el-radio-button>
				</el-radio-group>
			</el-form-item>
			<el-form-item :label="$t('dataFlow.need_to_create_Index')">
				<el-radio-group v-model="form.needToCreateIndex" size="mini">
					<el-radio-button :label="true">{{ $t('dataFlow.yes') }}</el-radio-button>
					<el-radio-button :label="false">{{ $t('dataFlow.no') }}</el-radio-button>
				</el-radio-group>
			</el-form-item>
		</el-form>
		<span slot="footer" class="dialog-footer">
			<el-button @click="handleClose">取 消</el-button>
			<el-button type="primary" @click="handleClose">确 定</el-button>
		</span>
	</el-dialog>
</template>

<script>
export default {
	name: 'newDataFlow',
	props: {
		dialogVisible: {
			required: true,
			value: Boolean
		}
	},
	data() {
		return {
			dialogVisibleSetting: false,
			form: {
				sync_type: '',
				stopOnError: '',
				needToCreateIndex: ''
			}
		};
	},
	methods: {
		handleClose() {
			this.dialogVisible = false;
			this.$emit('dialogVisible', false);
		}
	}
};
</script>

<style scoped lang="less">
@color: #999999;
.item {
	display: flex;
	justify-content: space-between;
	padding: 0 20px;
	li {
		width: 30%;
	}
	li:nth-child(2) {
		margin-top: 30px;
	}
	.divider {
		border-right: 1px solid #dedee4;
	}
	.model {
		display: block;
		color: @color;
		margin-bottom: 10px;
	}
	li {
		.content {
			display: flex;
			justify-content: space-between;
			cursor: pointer;
			padding: 20px;
			.iconfont {
				display: inline-block;
				font-size: 36px;
				margin-right: 10px;
			}
			&:hover {
				background: rgba(250, 250, 250, 1);
				border: 1px solid rgba(222, 222, 228, 1);
				box-shadow: 0px 0px 7px 0px rgba(0, 0, 0, 0.21);
				border-radius: 5px;
			}
			.tag {
				display: block;
				font-size: 16px;
				color: #48b6e2;
				font-weight: 400;
				margin-bottom: 10px;
			}
		}
	}
}
</style>
