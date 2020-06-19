<template>
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
		<el-option v-for="opt in options" :key="opt" :label="opt" :value="opt"> </el-option>
	</el-select>
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
		}
	}
};
</script>

<style></style>
