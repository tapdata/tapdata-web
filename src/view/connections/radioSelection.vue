<template>
	<el-radio-group v-model="radioValue" size="small" class="form-connection" @change="handleChange">
		<el-radio :label="item.value" border v-for="item in options" :key="item">
			<div>
				<div class="label">{{ item.label }}</div>
				<div class="tip">{{ item.tip }}</div>
			</div>
		</el-radio>
	</el-radio-group>
</template>

<script>
export default {
	name: 'redioSelection',
	props: {
		options: {
			value: Array
		},
		field: {
			required: true,
			value: ['String', 'Boolean']
		}
	},
	data() {
		return {
			radioValue: this.field
		};
	},
	methods: {
		handleChange(val) {
			this.$emit('update:field', val);
		}
	}
};
</script>

<style lang="less">
.form-connection {
	width: 100%;
	.el-radio {
		margin-right: 0;
	}
	.el-radio--small.is-bordered {
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
	.tip {
		margin-bottom: 10px;
		margin-top: 5px;
		padding-right: 10px;
		color: #999;
		line-height: 19px;
		white-space: pre-wrap;
		word-break: break-word;
	}
}
</style>
