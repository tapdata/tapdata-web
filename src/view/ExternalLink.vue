<template>
	<iframe :src="url" frameborder="0" style="height:100%; width: 100%;"></iframe>
</template>

<script>
export default {
	data() {
		return {
			url: ''
		};
	},
	created() {
		this.url = this.$route.meta.url;
	},
	watch: {
		'$route.meta.url'(url) {
			this.url = url;
		}
	}
};
</script>

<style lang="less" scoped></style>
