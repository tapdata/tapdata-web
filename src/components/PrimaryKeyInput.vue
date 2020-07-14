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
		<ClipButton :value="value"></ClipButton>
	</div>
</template>

<script>
import ClipButton from './ClipButton';
export default {
	components: {
		ClipButton
	},
	props: {
		value: {
			type: [String],
			required: true
		},
		options: Array,
		placeholder: String
	},
	computed: {
		values() {
			let value = this.value;
			return value && value.length ? value.split(',') : [];
		}
	},
	methods: {
		inputHandler(values) {
			//过滤空字符串并去重，之后使用逗号分隔
			this.$emit('input', Array.from(new Set(values.filter(v => !!v.trim()))).join(','));
		}
	}
};
</script>

<style lang="less" scoped>
.primary-key-input {
	display: flex;
	align-items: center;
}
</style>
<style lang="less">
.primary-key-input .el-select__input.is-mini {
	height: 16px;
}
</style>
