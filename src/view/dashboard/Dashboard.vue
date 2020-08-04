<template>
	<section class="dashboard" v-if="isNew">
		Dashboard
	</section>
	<iframe v-else src="/old/index.html#/dashboard" frameborder="0" style="height:100%; width: 100%;"></iframe>
</template>

<script>
export default {
	data() {
		return {
			// isNew: v !== 'DK',
			// isNew: window._TAPDATA_OPTIONS_.platform === 'DAAS'
			isNew: false
		};
	}
};
</script>

<style lang="less" scoped></style>
