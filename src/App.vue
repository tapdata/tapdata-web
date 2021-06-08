<template>
	<div id="app">
		<router-view />
	</div>
</template>

<script>
export default {
	name: 'app'
}
</script>

<style lang="scss">
#app {
	height: 100%;
	min-width: 1000px;
	font-size: 12px;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
		'Helvetica Neue', sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}
.second-line .el-radio-button__inner {
	margin-top: 10px;
	border-left: 1px solid #dcdfe6;
}
.second-line + .second-line {
	.el-radio-button__inner {
		border-left: 0;
	}
}
</style>
