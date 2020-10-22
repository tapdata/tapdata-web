<template>
	<div class="notification-left-sidebar">
		<div class="title">{{ $t('notification.noticeCenter') }}</div>
		<ul>
			<li>
				<i class="iconfont icon-lingdang"></i>
				<span slot="title">{{ $t('notification.setting') }}</span>
			</li>
		</ul>
	</div>
</template>

<script>
export default {
	name: 'subNav.vue'
};
</script>

<style scoped lang="less">
.notification-left-sidebar {
	background: rgba(250, 250, 250, 1);
	border: 1px solid rgba(230, 230, 232, 1);
	width: 250px;
	.title {
		height: 14px;
		font-size: 14px;
		font-weight: bold;
		color: rgba(51, 51, 51, 1);
		line-height: 34px;
		margin: 30px 20px;
	}
	ul {
		li {
			height: 44px;
			line-height: 44px;
			padding-left: 20px;
			background: #eeeeee;
			cursor: pointer;
		}
		&:hover {
			background: #eeeeee;
		}
	}
}
</style>
<style lang="less">
.notification-left-sidebar .el-menu-vertical-demo {
	.el-menu-item is-active {
		background-color: #eee;
	}
}
</style>
