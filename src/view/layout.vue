<template>
	<div class="layout">
		<div class="main">
			<router-view />
		</div>
	</div>
</template>

<script>
export default {};
</script>

<style lang="less" scoped>
.layout {
	height: 100%;
	width: 100%;
	.main {
		height: 100%;
	}
}
</style>
