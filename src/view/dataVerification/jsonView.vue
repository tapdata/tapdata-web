<template>
	<el-dialog
		:title="$t('connection.createNewDataSource')"
		:visible.sync="visible"
		:append-to-body="true"
		width="770px"
		:before-close="handleClose"
	>
		<section class="json-box">
			<div class="item-box">
				<span>源表数据</span>
				<JsonViewer :value="data.source"></JsonViewer>
			</div>
			<div class="item-box">
				<span>返回data值</span>
				<JsonViewer :value="data.target"></JsonViewer>
			</div>
		</section>
		<span slot="footer" class="dialog-footer">
			<el-button size="mini" type="primary" @click="handleClose()">{{ $t('dataForm.close') }}</el-button>
		</span>
	</el-dialog>
</template>

<script>
import JsonViewer from 'vue-json-viewer';
export default {
	name: 'jsonView',
	components: { JsonViewer },
	props: {
		data: {
			required: true
		},
		visible: {
			required: true,
			value: Boolean
		}
	}
};
</script>

<style scoped lang="less">
.json-box {
	display: flex;
	justify-content: space-between;
	.item-box {
		flex: 1;
	}
}
</style>
