<template>
	<el-container class="layout-container">
		<div class="agentNot" v-if="agentTipFalg">
			<i class="el-icon-warning"></i>
			{{ $t('dialog.downAgent.noAgent')
			}}<span @click="downLoadInstall">{{ $t('dialog.downAgent.clickDownLoad') }}</span>
			<i class="el-icon-close close" @click="handleCloseAgentTip"></i>
		</div>
		<CustomerService v-model="isShowCustomerService"></CustomerService>
		<newDataFlow :dialogVisible="dialogVisible" v-on:dialogVisible="handleDialogVisible"></newDataFlow>
		<el-header class="layout-header" height="48px">
			<a class="logo" href="/">
				<img :src="logoUrl" />
			</a>
			<div class="button-bar">
				<span class="expire-msg" v-if="licenseExpireAble">
					<span v-if="licenseExpire <= 1">{{
						$t('app.menu.licenseBefore') + licenseExpire + $t('app.menu.licenseAfterOneDay')
					}}</span>
					<span v-if="licenseExpire > 1">{{
						$t('app.menu.licenseBefore') + licenseExpire + $t('app.menu.licenseAfter')
					}}</span>
				</span>
				<el-button class="btn-create" type="primary" size="mini" @click="command('newDataFlow')">
					<i class="el-icon-plus"></i>
					<span>{{ $t('dataFlow.createNew') }}</span>
				</el-button>
				<el-dropdown v-if="platform === 'DAAS'" class="btn" placement="bottom">
					<el-badge :value="unRead" :max="99" class="item-badge" v-show="unRead > 0">
						<i class="iconfont icon-lingdang" @click="command('notification')"></i>
					</el-badge>
					<i class="iconfont icon-lingdang" @click="command('notification')" v-show="unRead === 0"></i>
					<el-dropdown-menu slot="dropdown" placement="bottom-start">
						<DropdownNotification
							:dialogVisible="notificationVisible"
							v-on:unread="handleUnread"
						></DropdownNotification>
						<!-- <el-dropdown-item>操作引导</el-dropdown-item> -->
					</el-dropdown-menu>
				</el-dropdown>
				<a v-if="platform === 'DAAS'" class="btn" @click="command('download')"
					><i class="iconfont icon-shangchuan-copy"></i
				></a>
				<el-dropdown v-if="platform === 'DAAS'" class="btn" placement="bottom" @command="command">
					<i class="iconfont icon-bangzhu1-copy"></i>
					<el-dropdown-menu slot="dropdown">
						<el-dropdown-item command="help">{{ $t('app.document') }}</el-dropdown-item>
						<el-dropdown-item command="question">{{ $t('app.qa') }}</el-dropdown-item>
						<!-- <el-dropdown-item>操作引导</el-dropdown-item> -->
					</el-dropdown-menu>
				</el-dropdown>
				<el-dropdown v-if="platform === 'DAAS'" class="btn" placement="bottom" @command="command">
					<i class="iconfont icon-shezhi1"></i>
					<el-dropdown-menu slot="dropdown">
						<el-dropdown-item command="settings">{{ $t('app.menu.settings') }}</el-dropdown-item>
						<el-dropdown-item command="setting">{{ $t('notification.setting') }}</el-dropdown-item>
						<!--						<el-dropdown-item command="verifySetting">{{-->
						<!--							$t('dataVerify.setting.verifySetting')-->
						<!--						}}</el-dropdown-item>-->
					</el-dropdown-menu>
				</el-dropdown>
				<el-dropdown v-if="showLang !== 'false'" class="btn" placement="bottom" @command="changeLanguage">
					<i
						class="iconfont"
						:class="{
							'icon-zhongwen1': lang === 'sc',
							'icon-yingwen1': lang === 'en',
							'icon-fanti': lang === 'tc'
						}"
						style="font-size: 18px"
					></i>
					<el-dropdown-menu slot="dropdown">
						<el-dropdown-item v-for="(value, key) in languages" :key="key" :command="key">
							{{ value }}
						</el-dropdown-item>
						<!-- <el-dropdown-item>操作引导</el-dropdown-item> -->
					</el-dropdown-menu>
				</el-dropdown>
				<el-dropdown class="menu-user" placement="bottom" @command="command">
					<el-button class="menu-button" size="mini">
						{{ userName }}<i class="el-icon-caret-bottom el-icon--right"></i>
					</el-button>
					<el-dropdown-menu slot="dropdown">
						<el-dropdown-item command="version">{{ $t('app.version') }}</el-dropdown-item>
						<el-dropdown-item command="license" v-if="licenseExpireAble">{{
							$t('app.menu.license')
						}}</el-dropdown-item>
						<el-dropdown-item v-if="platform === 'DAAS'" command="home">
							{{ $t('app.home') }}
						</el-dropdown-item>
						<el-dropdown-item command="signOut">{{ $t('app.signOut') }}</el-dropdown-item>
					</el-dropdown-menu>
				</el-dropdown>
			</div>
		</el-header>
		<el-container style="width: 100%;flex: 1; overflow:hidden;">
			<el-aside class="layout-aside" width="auto">
				<el-menu class="menu" :default-active="activeMenu" :collapse="isCollapse" @select="menuHandler($event)">
					<template v-for="menu in menus">
						<el-submenu
							v-if="menu.children && !menu.hidden"
							:key="menu.alias || menu.name"
							:index="menu.name"
						>
							<template slot="title">
								<i :class="`iconfont icon-${menu.icon}`"></i>
								<span slot="title">{{ menu.label }}</span>
							</template>
							<template v-for="cMenu in menu.children">
								<el-menu-item
									:key="cMenu.alias || cMenu.name"
									:index="cMenu.path + (cMenu.query || '')"
									:route="cMenu"
									v-if="!cMenu.hidden"
								>
									<div class="submenu-item">{{ cMenu.label }}</div>
								</el-menu-item>
							</template>
						</el-submenu>
						<el-menu-item
							v-else-if="!menu.hidden"
							:key="menu.alias || menu.name"
							:index="menu.path + (menu.query || '')"
							:route="menu"
						>
							<i :class="`iconfont icon-${menu.icon}`"></i>
							<span slot="title">{{ menu.label }}</span>
						</el-menu-item>
					</template>
					<el-submenu v-if="favMenus.length" index="favorite">
						<template slot="title">
							<i class="iconfont icon-shoucang"></i>
							<span slot="title">{{ $t('app.menu.favorite') }}</span>
						</template>
						<el-menu-item
							v-for="(menu, index) in favMenus"
							:key="menu.name + '_' + menu.meta.title"
							:index="'#favorite_' + index"
						>
							<div class="submenu-item">
								<span>{{ menu.meta.title }}</span>
								<span class="btn-del-fav-menu" @click.stop="delFavMenu(index)">
									<i class="el-icon-remove"></i>
								</span>
							</div>
						</el-menu-item>
					</el-submenu>
				</el-menu>
				<div class="menu-footer" @click="isCollapse = !isCollapse">
					<i class="el-icon-d-arrow-left btn-collapse" :class="{ 'is-collapse': isCollapse }"></i>
				</div>
			</el-aside>
			<el-main class="layout-main">
				<router-view />
			</el-main>
		</el-container>

		<DownAgent
			v-if="downLoadAgetntdialog"
			:downLoadNum="downLoadNum"
			type="dashboard"
			:lastDataNum="firstNum"
			@closeAgentDialog="closeAgentDialog"
		></DownAgent>
		<!-- @refreAgent="handleRefreAgent" -->
	</el-container>
</template>

<script>
import CustomerService from '@/components/CustomerService';
import newDataFlow from '@/components/newDataFlow';
import DropdownNotification from './notification/DropdownNotification';
import DownAgent from './downAgent/agentDown';
import { signOut } from '../util/util';
import factory from '@/api/factory';
const cluster = factory('cluster');

const Languages = {
	sc: '中文 (简)',
	en: 'English',
	tc: '中文 (繁)'
};
let menuSetting = [
	{ name: 'dashboard', icon: 'shouye' },
	{ name: 'connections', icon: 'shujukus1' },
	{
		name: 'dataTransmission',
		icon: 'chengbenguanlixitong',
		children: [
			{ name: 'dataFlows', alias: 'dataFlowsClusterClone', query: '?mapping=cluster-clone' },
			{ name: 'dataFlows', alias: 'dataFlowsCustom', query: '?mapping=custom' },
			{ name: 'dataVerification' }
		]
	},
	{
		name: 'dataGovernance',
		icon: 'yuanshuju1',
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
		icon: 'API11',
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
		name: 'dataCollect',
		icon: 'shujucaiji'
	},
	{
		name: 'system',
		icon: 'jiekoufuwu',
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
	components: { CustomerService, newDataFlow, DropdownNotification, DownAgent },
	data() {
		return {
			platform: window._TAPDATA_OPTIONS_.platform,
			logoUrl: window._TAPDATA_OPTIONS_.logoUrl,
			showLang: window._TAPDATA_OPTIONS_.showLang,
			languages: Languages,
			lang: localStorage.getItem('tapdata_localize_lang') || 'en',
			isCollapse: false,
			menus: [],
			activeMenu: '',
			favMenus: [],
			userName: '',
			dialogVisible: false,
			isShowCustomerService: false,
			notificationVisible: true,
			unRead: 0,
			downLoadAgetntdialog: false,
			agentTipFalg: false,
			timer: '',
			downLoadNum: 0,
			firstNum: undefined,
			licenseExpire: '',
			licenseExpireAble: false,
			licenseExpireDate: ''
		};
	},
	created() {
		this.activeMenu = this.$route.fullPath;
		this.getMenus();
		this.getFavMenus();
		this.$root.$on('updateMenu', () => {
			this.getFavMenus();
		});
		window.iframeRouterChange = route => {
			this.$router.push(route);
		};
		let self = this;
		window.stateChange = (key, data) => {
			self.$store.commit(key, data);
		};

		window.getFormLocal = data => {
			return self.$store.state[data];
		};

		this.getDataApi();
		if (!this.downLoadNum) {
			self.timer = setInterval(() => {
				self.getDataApi();
				if (this.downLoadNum) {
					clearInterval(self.timer);
				}
			}, 5000);
		}
		this.getLicense();
	},
	destroyed() {
		this.$root.$off('updateMenu');
	},
	watch: {
		'$route.name'() {
			this.activeMenu = this.$route.path;
		},
		$route() {
			if (this.$route.meta) {
				this.isCollapse = this.$route.meta.isCollapse;
			}
		}
	},
	methods: {
		async getFavMenus() {
			let userId = this.$cookie.get('user_id');
			let result = await this.$api('users').get([userId]);
			if (result.status === 200) {
				let user = result.data || {};
				this.favMenus = user.favorites || [];
				this.userName = user.email.split('@')[0] || '';
			}
		},
		delFavMenu(idx) {
			this.$confirm(
				this.$t('message.comfirm') + this.$t('app.menu.delFavMenu'),
				this.$t('app.menu.delFavMenu')
			).then(async () => {
				this.favMenus.splice(idx, 1);
				let result = await this.$api('users').updateById(this.$cookie.get('user_id'), {
					favorites: this.favMenus
				});
				if (result.status === 200) {
					this.$message.success(this.$t('message.saveOK'));
				}
			});
		},
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
					menu.label = this.$t('app.menu.' + (item.alias || menu.name));

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
				case 'notification':
					this.$router.push({
						name: 'notification'
					});
					break;
				case 'setting':
					this.$router.push({
						path: '/notification/setting'
					});
					break;
				case 'verifySetting':
					this.$router.push({
						path: '/dataVerification/setting'
					});
					break;
				case 'newDataFlow':
					this.dialogVisible = true;
					break;
				case 'help':
					window.open('https://docs.tapdata.io/', '_blank');
					break;
				case 'question':
					this.isShowCustomerService = !this.isShowCustomerService;
					break;
				case 'version':
					this.$message.info('DAAS_BUILD_NUMBER');
					break;
				case 'license':
					this.$message.info(this.$t('app.menu.licenseDate') + ': ' + this.licenseExpireDate);
					break;
				case 'home':
					window.open('https://tapdata.net/', '_blank');
					break;
				case 'signOut':
					this.$confirm(this.$t('app.signOutMsg'), this.$t('app.signOut')).then(() => {
						this.signOut();
					});
					break;
				case 'settings':
					this.$router.push({
						name: 'settings'
					});
					break;
				default:
					this.downLoadAgetntdialog = true;
					// window.open('https://cloud.tapdata.net/agent/download.html', '_blank');
					break;
			}
		},
		signOut() {
			signOut();
		},
		menuHandler(index) {
			this.isCollapse = true;
			if (index.includes('#favorite_')) {
				let i = index.split('#favorite_')[1];
				let router = this.favMenus[i];
				if (this.$route.name === router.name) {
					this.$router.replace(router);
				}
				this.$router.push(router);
			} else {
				this.$router.push(index);
			}
		},
		changeLanguage(lang) {
			localStorage.setItem('tapdata_localize_lang', lang);
			location.reload();
		},
		handleDialogVisible() {
			this.dialogVisible = false;
		},
		handleNotificationVisible(type) {
			this.notificationVisible = type;
		},
		handleUnread(data) {
			this.unRead = '';
			this.unRead = data;
		},

		// 下载安装Agent
		downLoadInstall() {
			this.downLoadAgetntdialog = true;
		},

		// 关闭下载安装Agent提示
		handleCloseAgentTip() {
			this.agentTipFalg = false;
		},

		// 获取Agent是否安装
		getDataApi() {
			let params = null;
			if (!parseInt(this.$cookie.get('isAdmin'))) {
				params = {
					filter: {
						where: {
							'systemInfo.username': {
								inq: [this.$cookie.get('user_id'), this.$cookie.get('username')]
							}
						}
					}
				};
			}
			cluster.get(params).then(res => {
				if (res.statusText === 'OK' || res.status === 200) {
					if (res.data) {
						if (!this.firstNum) {
							this.firstNum = res.data.length || 0;
							this.downLoadNum = 0;
						}
						if (this.firstNum) {
							this.downLoadNum = res.data.length;
						}
						if (res.data.length > 0) {
							this.agentTipFalg = false;
						} else {
							this.agentTipFalg = true;
						}
					}
				}
			});
		},

		// 关闭agent下载弹窗返回参数
		closeAgentDialog() {
			this.downLoadAgetntdialog = false;
		},

		// // 刷新agent
		// handleRefreAgent() {
		// 	this.getDataApi();
		// },

		async getLicense() {
			let timeStamp = this.$api('TimeStamp');
			let stime = '';
			await timeStamp.get().then(res => {
				stime = res.data || new Date().getTime();
			});
			let filter = {
				where: {}
			};
			if (this.$cookie.get('isAdmin') == 0)
				filter.where['source.user_id'] = { like: this.$cookie.get('user_id') };
			let params = {
				filter: JSON.stringify(filter)
			};
			this.$api('Licenses')
				.get(params)
				.then(res => {
					let expires_on = res.data.expires_on || '';
					let endTime = expires_on - stime;
					endTime = parseInt(endTime / 1000 / 60 / 60 / 24); //相差天数
					if (endTime <= 90 && this.$cookie.get('isAdmin') != 0) {
						this.licenseExpireAble = true;
					}
					this.licenseExpire = endTime;
					this.licenseExpireDate = this.$moment(expires_on).format('YYYY-MM-DD HH:mm:ss');
				});
		}
	}
};
</script>
<style scoped lang="less">
.unread {
	width: 25px;
	height: 17px;
	display: inline-block;
	line-height: 17px;
	white-space: nowrap;
	cursor: pointer;
	background: red;
	color: #fff;
	-webkit-appearance: none;
	text-align: center;
	-webkit-box-sizing: border-box;
	box-sizing: border-box;
	outline: 0;
	margin: 0;
	-webkit-transition: 0.1s;
	transition: 0.1s;
	font-weight: 500;
	padding: 0px 5px;
	font-size: 12px;
	border-radius: 4px;
	float: right;
	margin-top: 15px;
	margin-right: 15px;
}
.layout-container {
	overflow: hidden;
	.agentNot {
		width: calc(100% - 10px);
		height: 30px;
		margin: 5px;
		line-height: 30px;
		box-sizing: border-box;
		font-size: 12px;
		text-align: center;
		color: #ec8205;
		user-select: none;
		border: 1px solid #ec8205;
		background-color: rgb(255, 233, 207);
		span {
			color: #48b6e2;
			cursor: pointer;
		}
		.close {
			float: right;
			padding: 8px 20px 0;
			cursor: pointer;
		}
	}
}
</style>

<style lang="less">
.btn-del-fav-menu {
	display: none;
	position: absolute;
	right: 10px;
	top: 50%;
	transform: translate(0, -50%);
	width: 30px;
	height: 30px;
	line-height: 30px;
	text-align: center;
	cursor: pointer;
	[class^='el-icon-'] {
		margin: 0;
		color: #f56c6c !important;
	}
}
.el-menu--inline .el-menu-item:hover .btn-del-fav-menu {
	display: block;
}
.layout-container {
	height: 100%;
	background: rgba(250, 250, 250, 1);
	.iconfont {
		font-size: 18px;
	}
	.layout-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 7px;
		background: rgba(54, 54, 54, 1);
		.logo {
			margin-left: 8px;
			display: block;
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
					display: inline-block;
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
		.el-menu--popup .submenu-item .btn-del {
			display: none;
		}
		.menu {
			width: 260px;
			flex: 1;
			padding-bottom: 48px;
			background: rgba(250, 250, 250, 1);
			.iconfont {
				display: inline-block;
				margin-right: 5px;
				width: 24px;
				text-align: center;
				color: rgba(51, 51, 51, 1);
				font-size: 18px;
			}
			overflow-y: auto;
			user-select: none;
			.el-menu-item .el-tooltip {
				outline: none;
			}
			&.el-menu--collapse {
				width: 64px;
			}
			.el-menu-item,
			.el-submenu__title {
				height: 50px;
				line-height: 50px;
				color: rgba(51, 51, 51, 1);
				.submenu-item {
					padding-left: 12px;
				}
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
	.item-badge {
		.el-badge__content {
			height: 15px;
			line-height: 13px;
			padding: 0 5px;
			border: none;
		}
		.el-badge__content.is-fixed {
			right: 18px;
			top: 3px;
		}
	}
	.layout-main {
		padding: 0;
		background: #fff;
	}
	.expire-msg {
		display: inline-block;
		color: #fff;
		margin-right: 10px;
	}
}
</style>
