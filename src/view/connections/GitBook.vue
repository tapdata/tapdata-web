<template>
	<div class="git-book markdown-body" v-html="htmlMD"></div>
</template>

<script>
export default {
	name: 'GitBook',
	data() {
		return {
			htmlMD: ''
		};
	},
	mounted() {
		this.getHtmlMD(this.$route.query.databaseType);
	},
	methods: {
		getHtmlMD(type) {
			this.htmlMD = require(`./GitBook/${type.toLowerCase()}.md`);
		}
	}
};
</script>

<style lang="less">
.git-book {
	max-width: 550px;
	padding: 10px 20px;
	overflow-y: auto;
	background-color: rgba(250, 250, 250, 100);
	border: 1px solid rgba(222, 222, 228, 100);
	border-top: none;
}
</style>
