<template>
	<div class="setting-center">
		<div class="setting-left-sidebar">
			<div class="title">{{ $t('account.setCenter') }}</div>
			<ul>
				<li
					:class="activePanel === 'settings' ? 'active' : ''"
					v-if="authoritySetting"
					@click="changeName('settings')"
				>
					<i class="iconfont icon-shezhi1"></i>
					<span slot="title">{{ this.$t('account.systemSetting') }}</span>
				</li>
				<li
					v-for="item in settingList"
					:key="item.icon"
					:class="activePanel === item.key ? 'active' : ''"
					@click="changeName(item.key)"
				>
					<i :class="['iconfont', item.icon]"></i>
					<span slot="title">{{ item.name }}</span>
				</li>
			</ul>
		</div>
		<div class="setting-main">
			<router-view></router-view>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			settingList: [
				// {
				// 	icon: 'icon-shezhi1',
				// 	name: this.$t('account.systemSetting'),
				// 	key: 'settings'
				// },
				{ icon: 'icon-lingdang', name: this.$t('notification.setting'), key: 'notificationSetting' },
				{ icon: 'icon-gerenzhongxin', name: this.$t('account.accountSettings'), key: 'accountSetting' }
			],
			activePanel: '',
			authoritySetting: this.$has('system_settings') && this.$has('system_settings_menu')
		};
	},
	watch: {
		$route(route) {
			this.activePanel = route.name;
		}
	},
	created() {
		this.activePanel = this.$route.name;
	},
	methods: {
		changeName(name) {
			this.activePanel = name;
			this.$router.push({
				name
			});
		}
	}
};
</script>

<style scoped lang="less">
.setting-center {
	height: 100%;
	font-size: 12px;
	display: flex;
	justify-content: space-between;
	height: 100%;
	.setting-left-sidebar {
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
				cursor: pointer;
				i {
					color: #666;
				}
			}
			.active {
				background: #eeeeee;
			}
			// &:hover {
			// 	background: #eeeeee;
			// }
		}
	}

	.setting-main {
		width: 100%;
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
}
</style>
<style lang="less">
.setting-left-sidebar .el-menu-vertical-demo {
	.el-menu-item is-active {
		background-color: #eee;
	}
}
</style>
