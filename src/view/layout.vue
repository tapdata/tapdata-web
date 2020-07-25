<template>
	<el-container class="layout-container">
		<el-header class="layout-header" height="48px">
			<a class="logo" href="/">
				<img src="static/icon/logo.png" />
			</a>
			<div class="button-bar">
				<!-- <el-button class="btn-create" type="primary" size="mini">
					<i class="el-icon-plus"></i>
					<span>新建</span>
				</el-button> -->
				<a class="btn" @click="command('download')"><i class="el-icon-download"></i></a>
				<el-dropdown class="btn" @command="command">
					<i class="el-icon-question"></i>
					<el-dropdown-menu slot="dropdown">
						<el-dropdown-item command="help">帮助文档</el-dropdown-item>
						<el-dropdown-item command="question">在线咨询</el-dropdown-item>
						<!-- <el-dropdown-item>操作引导</el-dropdown-item> -->
					</el-dropdown-menu>
				</el-dropdown>
				<a class="btn" @click="command('setting')"><i class="el-icon-s-tools"></i></a>
				<el-dropdown class="menu-user" @command="command">
					<el-button class="menu-button" size="mini"
						>用户名<i class="el-icon-caret-bottom el-icon--right"></i
					></el-button>
					<el-dropdown-menu slot="dropdown">
						<el-dropdown-item command="version">系统版本</el-dropdown-item>
						<el-dropdown-item command="home">官网</el-dropdown-item>
						<el-dropdown-item command="signOut">退出登录</el-dropdown-item>
					</el-dropdown-menu>
				</el-dropdown>
			</div>
		</el-header>
		<el-container style="width: 100%;flex: 1; overflow:hidden;">
			<el-aside class="layout-aside" width="auto">
				<el-menu
					class="menu"
					router
					:default-active="activeMenu"
					:collapse="isCollapse"
					@select="isCollapse = true"
				>
					<template v-for="menu in menus">
						<el-submenu v-if="menu.children && !menu.hidden" :key="menu.name" :index="menu.name">
							<template slot="title">
								<i :class="`el-icon-${menu.icon}`"></i>
								<span slot="title">{{ menu.label }}</span>
							</template>
							<template v-for="cMenu in menu.children">
								<el-menu-item :key="cMenu.name" :index="cMenu.path" v-if="!cMenu.hidden">
									<span style="display: block; padding-left: 12px;">{{ cMenu.label }}</span>
								</el-menu-item>
							</template>
						</el-submenu>
						<el-menu-item v-else-if="!menu.hidden" :key="menu.name" :index="menu.path">
							<i :class="`el-icon-${menu.icon}`"></i>
							<span slot="title">{{ menu.label }}</span>
						</el-menu-item>
					</template>
				</el-menu>
				<div class="menu-footer" @click="isCollapse = !isCollapse">
					<i class="el-icon-d-arrow-left btn-collapse" :class="{ 'is-collapse': isCollapse }"></i>
				</div>
			</el-aside>
			<el-main class="layout-main">
				<router-view />
			</el-main>
		</el-container>
	</el-container>
</template>

<script>
let menuSetting = [
	{ name: 'dashboard', icon: 'user' },
	{
		name: 'dataSource',
		icon: 'user',
		children: [{ name: 'connections' }, { name: 'connection' }]
	},
	{ name: 'dataFlows', icon: 'user' },
	{
		name: 'dataGovernance',
		icon: 'user',
		children: [
			{ name: 'metadataDefinition' },
			{ name: 'dataQuality' },
			{ name: 'timeToLive' },
			{ name: 'dataMap' },
			{ name: 'dataRules' },
			{ name: 'dictionary' }
		]
	},
	{
		name: 'dataPublish',
		icon: 'user',
		children: [
			{ name: 'modules' },
			{ name: 'dataExplorer' },
			{ name: 'apiDocAndTest' },
			{ name: 'apiAnalysis' },
			{ name: 'applications' },
			{ name: 'apiServers' }
		]
	},
	{
		name: 'oldDataCollect',
		icon: 'user',
		children: [{ name: 'dataCollect' }]
	},
	{
		name: 'system',
		icon: 'user',
		children: [
			{ name: 'tasks' },
			{ name: 'agentdownload' },
			{ name: 'clusterManagement' },
			{ name: 'agents' },
			{ name: 'serversOversee' },
			{ name: 'users' },
			{ name: 'journal' },
			{ name: 'roles' },
			{ name: 'settings' }
		]
	}
];
export default {
	data() {
		return {
			isCollapse: false,
			menus: [],
			activeMenu: ''
		};
	},
	created() {
		this.activeMenu = this.$route.path;
		this.getMenus();
	},
	watch: {
		'$route.name'() {
			this.activeMenu = this.$route.path;
		}
	},
	methods: {
		getMenus() {
			let permissions = sessionStorage.getItem('tapdata_permissions');
			permissions = JSON.parse(permissions);
			let routerMap = {};
			let routes = this.$router.options.routes.find(r => r.name === 'layout').children;
			routes.forEach(r => {
				routerMap[r.name] = r;
			});

			let formatMenu = items => {
				return items.map(item => {
					let router = routerMap[item.name];
					let menu = Object.assign({}, item, router);
					menu.label = this.$t('app.menu.' + menu.name);

					let matched = permissions.some(p => p.name === menu.name || p.path === menu.path);

					if (menu.children) {
						menu.children = formatMenu(menu.children);
						if (menu.children.every(m => m.hidden)) {
							menu.hidden = true;
						}
					} else if (!matched) {
						menu.hidden = true;
					}
					return menu;
				});
			};
			this.menus = formatMenu(menuSetting);
		},
		command(command) {
			switch (command) {
				case 'help':
					window.open('https://docs.tapdata.io/', '_blank');
					break;
				case 'question':
					break;
				case 'version':
					this.$message.info('DAAS_BUILD_NUMBER');
					break;
				case 'home':
					window.open('https://tapdata.net/', '_blank');
					break;
				case 'signOut':
					this.signOut();
					break;
				case 'setting':
					this.$router.push({
						name: 'settings'
					});
					break;
				default:
					this.$message.info('Coming soon!');
					break;
			}
		},
		signOut() {
			this.$cookie.delete('email');
			this.$cookie.delete('isAdmin');
			this.$cookie.delete('login');
			this.$cookie.delete('token');
			this.$cookie.delete('user_id');
			this.$cookie.delete('username');
			this.$router.replace({
				name: 'login'
			});
		}
	}
};
</script>

<style lang="less">
.layout-container {
	height: 100%;
	background: rgba(250, 250, 250, 1);
	.layout-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 7px;
		background: rgba(54, 54, 54, 1);
		.logo {
			margin-left: 8px;
			display: block;
			height: 14px;
			width: 99px;
			img {
				display: block;
				height: 100%;
				width: 100%;
				object-fit: contain;
			}
		}
		.button-bar {
			display: flex;
			align-items: center;
			.btn-create {
				margin-right: 5px;
			}
			.btn {
				margin-left: 8px;
				color: #999;
				cursor: pointer;
				i {
					line-height: 28px;
					text-align: center;
					height: 28px;
					width: 28px;
				}
				&:hover {
					color: #fff;
				}
			}
			.menu-user {
				margin-left: 15px;
				.menu-button {
					color: rgba(204, 204, 204, 1);
					background: rgba(85, 85, 85, 1);
					border: none;
				}
			}
		}
	}
	.layout-aside {
		position: relative;
		display: flex;
		height: 100%;
		overflow: hidden;
		.menu {
			width: 260px;
			flex: 1;
			padding-bottom: 48px;
			background: rgba(250, 250, 250, 1);
			[class*=' el-icon-'],
			[class^='el-icon-'] {
				color: rgba(51, 51, 51, 1);
			}
			overflow-y: auto;
			user-select: none;
			&.el-menu--collapse {
				width: 64px;
			}
			.el-menu-item,
			.el-submenu__title {
				height: 50px;
				line-height: 50px;
				color: rgba(51, 51, 51, 1);
				&:hover {
					background: rgba(241, 241, 241, 1);
				}
				&.is-active {
					color: #48b6e2;
					background: rgba(241, 241, 241, 1);
				}
			}
			.is-active .el-submenu__title {
				background: rgba(241, 241, 241, 1);
			}
		}
		.menu-footer {
			position: absolute;
			bottom: 0;
			right: 0;
			width: 100%;
			height: 48px;
			line-height: 48px;
			border: 1px solid #eee;
			box-sizing: border-box;
			text-align: right;
			overflow: hidden;
			background: rgba(250, 250, 250, 1);
			cursor: pointer;
			&:hover {
				background: rgba(241, 241, 241, 1);
			}
			.btn-collapse {
				padding: 10px;
				color: #666;
				transition: all 0.4s;
				&.is-collapse {
					padding: 10px 24px;
					transform: rotate(-180deg);
				}
			}
		}
	}
	.layout-main {
		background: #fff;
	}
}
</style>
