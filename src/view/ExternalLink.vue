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
		this.getUrl();
		window.updateFavMenu = () => {
			this.$root.$emit('updateMenu');
		};
	},
	watch: {
		'$route.meta.url'(url) {
			this.getUrl(url);
		}
	},
	methods: {
		getUrl(url) {
			let query = this.$route.query;
			let queryStr = '';
			if (query) {
				queryStr = '?';
				let arr = [];
				for (let key in query) {
					if (query.hasOwnProperty(key)) {
						let value = query[key];
						arr.push(key + '=' + value);
					}
				}
				queryStr += arr.join('&');
			}
			url = url || this.$route.meta.url;
			this.url = url + queryStr;
		}
	}
};
</script>

<style lang="less" scoped></style>
