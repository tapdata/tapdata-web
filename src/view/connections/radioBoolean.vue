<template>
	<div slot="bottomTip">
		<el-radio-group v-model="field" size="small" class="form-connection">
			<el-radio :label="item.value" border v-for="item in options" :key="item">
				<div>
					<div>{{ item.label }}</div>
					<div>{{ item.tip }}</div>
				</div>
			</el-radio>
		</el-radio-group>
	</div>
</template>

<script>
export default {
	name: 'redioBoolean',
	props: {
		options: {
			required: true,
			value: Array
		},
		field: {
			required: true,
			value: String
		}
	}
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
