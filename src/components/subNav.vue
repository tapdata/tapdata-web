<template>
	<div class="notification-left-sidebar">
		<div class="title">{{ $t('notification.noticeCenter') }}</div>
		<el-menu
			default-active="1"
			class="el-menu-vertical-demo"
			background-color="#fafafa"
			text-color="#666"
			active-text-color="#666"
			router
		>
			<el-menu-item index="/notification/setting" route="notification/setting">
				<i class="iconfont icon-lingdang"></i>
				<span slot="title">{{ $t('notification.setting') }}</span>
			</el-menu-item>
			<!--			<el-menu-item index="/dataVerification/setting" route="/dataVerification/setting">-->
			<!--				<i class="iconfont icon-duibi-s"></i>-->
			<!--				<span slot="title">{{ $t('dataVerify.setting.verifySetting') }}</span>-->
			<!--			</el-menu-item>-->
		</el-menu>
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
}
</style>
<style lang="less">
.notification-left-sidebar .el-menu-vertical-demo {
	.el-menu-item is-active {
		background-color: #eee;
	}
}
</style>
