<template>
	<div id="app">
		<!-- <img src="./assets/logo.png"> -->
		<router-view />
	</div>
</template>

<script>
export default {
	name: 'App'
};
</script>
<style lang="less">
@import 'assets/style/index.less';

#app {
	width: 100%;
	height: 100%;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}
/*滚动条整体样式*/
#app::-webkit-scrollbar {
	width: 10px;
	height: 1px;
}

/*滚动条滑块*/
#app::-webkit-scrollbar-thumb {
	border-radius: 10px;
	box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
	background: #535353;
}

/*滚动条轨道*/
#app::-webkit-scrollbar-track {
	box-shadow: inset 0 0 1px rgba(0, 0, 0, 0);
	border-radius: 10px;
	background: #ccc;
}
.markdown-body {
	padding: 20px;
	min-width: 200px;
	max-width: 900px;
	font-size: 12px;
	ul,
	ol,
	li {
		list-style: unset;
	}
	blockquote {
		border-color: #48b6e2;
	}
	table {
		display: table;
		width: 100%;
		max-width: 100%;
		margin-bottom: 20px;
	}
}
</style>
