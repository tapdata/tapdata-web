<template>
	<div slot="bottomTip">
		<el-radio-group v-model="model.connection_type" size="small" class="form-connection">
			<el-radio label="1" border>备选项1</el-radio>
			<el-radio label="2" border>备选项2</el-radio>
		</el-radio-group>
	</div>
</template>

<script>
export default {
	name: 'redioBoolean'
};
</script>

<style lang="less">
.form-connection {
	.el-radio--small.is-bordered {
		width: 440px;
		margin-bottom: 10px;
	}
	.el-radio.is-bordered + .el-radio.is-bordered {
		margin-left: 0;
	}
}
</style>
