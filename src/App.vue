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
.ellipsis {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
.markdown-body-wrap .markdown-body {
	h2 {
		font-size: 18px;
		margin: 1em 0 15px;
		padding-top: 0.8em;
		padding-bottom: 0.8em;
	}
	h3 {
		font-size: 14px;
		margin: 22px 0 16px;
	}
	h4 {
		font-size: 13px;
		margin: 20px 0 16px;
	}
	h5 {
		font-size: 12px;
		margin: 16px 0 16px;
		font-weight: 700;
	}
	p {
		font-size: 12px;
		line-height: 24px;
		color: #666666;
		margin-top: 0px;
		margin: 8px 0;
		margin: 14px 0 14px;
	}
	pre {
		background-color: #eee;
		margin-bottom: 8px;
		margin-top: 8px;
		margin: 12px 0 12px;
	}
	blockquote {
		margin-bottom: 8px;
		margin-top: 8px;
		margin: 14px 0 14px;
		background-color: #eee;
		padding: 16px 16px;
	}
	tr {
		background-color: #f5f5f5;
	}
	code {
		background-color: #eee;
	}
	ul,
	ol,
	li {
		list-style: unset;
		font-size: 12px;
		line-height: 20px;
		color: #666666;
		margin-top: 0px;
		margin: 8px 0;
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
