<template>
	<el-radio-group v-model="model.connection_type" size="small" class="form-connection">
		<el-radio label="1" border>
			<div>
				<div>备选项2</div>
				<div>我是用来解释用的</div>
			</div>
		</el-radio>
		<el-radio label="2" border>备选项2</el-radio>
	</el-radio-group>
</template>

<script>
export default {
	name: 'redioHorizonta'
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
	.el-radio--small.is-bordered {
		display: flex;
		flex-direction: row;
		height: 100%;
	}
	.el-radio--mini.is-bordered .el-radio__label,
	.el-radio--small.is-bordered .el-radio__label {
		display: flex;
	}
	.el-radio__input {
		display: flex;
	}
	div {
		margin-bottom: 10px;
	}
}
</style>
