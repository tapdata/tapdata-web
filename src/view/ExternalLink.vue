<template>
	<iframe src="/old/index.html#/" frameborder="0" style="height:100%; width: 100%;"></iframe>
</template>

<script>
let count = 0;
export default {
	created() {
		this.getUrl();
		window.updateFavMenu = () => {
			this.$root.$emit('updateMenu');
		};
	},
	watch: {
		$route() {
			this.getUrl();
		}
	},
	methods: {
		getUrl() {
			let route = this.$route;
			this.$nextTick(() => {
				let router = window.frames[0].window.gRouter;
				count += 1;
				if (router) {
					router.replace({
						name: route.name,
						query: Object.assign(route.query, { isNext: count }),
						params: route.params
					});
				} else {
					setTimeout(this.getUrl, 500);
				}
			});
		}
	}
};
</script>

<style lang="less" scoped></style>
