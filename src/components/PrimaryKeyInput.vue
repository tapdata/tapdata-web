<template>
	<div class="primary-key-input">
		<el-select
			size="mini"
			:value="values"
			multiple
			filterable
			allow-create
			default-first-option
			:placeholder="placeholder"
			@input="inputHandler"
		>
			<el-option v-for="opt in options.filter(i => !!i)" :key="opt" :label="opt" :value="opt"> </el-option>
		</el-select>
		<el-tooltip
			class="item"
			placement="top"
			manual
			content="已复制"
			popper-class="copy-tooltip"
			:value="showTooltip"
		>
			<i
				class="el-icon-document-copy"
				v-clipboard:copy="this.value"
				v-clipboard:success="onCopy"
				@mouseleave="showTooltip = false"
			></i>
		</el-tooltip>
	</div>
</template>

<script>
export default {
	props: {
		value: {
			type: [String],
			required: true
		},
		options: Array,
		placeholder: String
	},
	data() {
		return {
			showTooltip: false
		};
	},
	computed: {
		values() {
			let value = this.value;
			return value.length ? value.split(',') : [];
		}
	},
	methods: {
		inputHandler(values) {
			//过滤空字符串并去重，之后使用逗号分隔
			this.$emit('input', Array.from(new Set(values.filter(v => !!v.trim()))).join(','));
		},
		onCopy() {
			this.showTooltip = true;
		}
	}
};
</script>

<style lang="less" scoped>
.primary-key-input {
	display: flex;
	align-items: center;
	.el-icon-document-copy {
		color: #999;
		margin-left: 10px;
		cursor: pointer;
		&:hover {
			color: #333;
		}
	}
}
</style>
<style lang="less">
.el-tooltip__popper.is-dark.copy-tooltip {
	background: #303133 !important;
	color: #fff !important;
}
</style>
