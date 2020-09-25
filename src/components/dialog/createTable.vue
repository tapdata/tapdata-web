<template>
	<div class="createTable">
		<el-dialog
			:title="dialog.title"
			:close-on-click-modal="false"
			:visible.sync="dialog.visible"
			@close="closeDialogForm"
			width="30%"
		>
			<el-form :model="ruleForm" :rules="rules" ref="ruleForm">
				<el-form-item prop="newTable">
					<el-input
						v-model="ruleForm.newTable"
						:placeholder="dialog.placeholder"
						maxlength="50"
						show-word-limit
					></el-input>
				</el-form-item>
			</el-form>

			<span slot="footer" class="dialog-footer">
				<el-button @click="closeDialogForm">{{ $t('dataVerify.cancel') }}</el-button>
				<el-button type="primary" @click="confirm">{{ $t('dataVerify.confirm') }}</el-button>
			</span>
		</el-dialog>
	</div>
</template>
<script>
export default {
	name: 'DialogCreateTable',
	props: {
		dialog: {
			type: Object,
			default: null
		}
	},
	data() {
		return {
			flag: null,
			ruleForm: {
				newTable: ''
			},
			rules: {
				newTable: [
					{
						pattern: /^[a-zA-Z][0-9a-zA-Z_\.\-]*$/, //eslint-disable-line
						trigger: 'blur',
						message:
							this.dialog.type === 'table'
								? this.$t('dialog.tableValidateTip')
								: this.$t('dialog.collectionValidateTip')
					}
				]
			}
		};
	},
	methods: {
		closeDialogForm() {
			// 父组件关闭弹窗，子组件清除验证
			this.dialog.visible = false;
			this.ruleForm.newTable = '';
			this.$refs.ruleForm.clearValidate();
		},
		// 子组件校验，传递到父组件
		validateForm() {
			let flag = null;
			this.$refs['ruleForm'].validate(valid => {
				if (valid) {
					flag = true;
				} else {
					flag = false;
				}
			});
			return flag;
		},
		confirm() {
			let flag = this.validateForm();
			if (flag) {
				this.dialog.visible = false;
				this.$emit('handleTable', this.ruleForm.newTable);
			}
		}
	}
};
</script>
