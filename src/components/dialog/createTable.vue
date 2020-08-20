<template>
	<div class="createTable">
		<el-dialog :title="dialog.title" :visible.sync="dialog.visible" width="30%">
			<el-input
				v-model="dialog.newTable"
				:placeholder="dialog.placeholder"
				maxlength="50"
				show-word-limit
			></el-input>
			<span slot="footer" class="dialog-footer">
				<el-button @click="dialog.visible = false">{{ $t('dataVerify.cancel') }}</el-button>
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
	methods: {
		confirm() {
			this.dialog.visible = false;
			this.$emit('handleTable', this.dialog.newTable);
		}
	}
};
</script>
