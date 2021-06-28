<template>
	<ElContainer class="layout-wrap">
		<TheHeader ref="theHeader"></TheHeader>
		<ElAside class="left-aside" width="200px">
			<ElMenu :default-active="activeMenu" @select="menuTrigger">
				<ElMenuItem v-for="m in menus" :key="m.name" :index="m.path">
					<span class="mr-4" slot v-if="m.meta.icon"
						><VIcon class="v-icon" size="12">{{ m.meta.icon }}</VIcon></span
					>
					<span slot="title">{{ m.meta.title }}</span>
				</ElMenuItem>
			</ElMenu>
		</ElAside>
		<ElContainer direction="vertical">
			<ElHeader class="header" v-if="breadcrumbData.length > 1" height="40px">
				<ElBreadcrumb class="breadcrumb" separator-class="el-icon-arrow-right">
					<ElBreadcrumbItem v-for="item in breadcrumbData" :key="item.name" :to="item.to">
						{{ item.name }}
					</ElBreadcrumbItem>
				</ElBreadcrumb>
			</ElHeader>
			<ElMain class="main">
				<RouterView
					@show-guide="showGuide"
					@create-task="createTask"
					@select-connection-type="selectConnectionType"
				></RouterView>
			</ElMain>
		</ElContainer>
		<ElDialog title="选择数据源类型" :visible.sync="dialogVisible">
			<ConnectionTypeSelector
				:types="['mysql', 'oracle', 'sqlserver', 'mongodb', 'postgres', 'elasticsearch']"
				:comingTypes="['db2', 'sybase ase', 'kafka', 'gbase-8s']"
				@select="createConnection"
			></ConnectionTypeSelector>
		</ElDialog>
	</ElContainer>
</template>

<script>
import TheHeader from '@/components/TheHeader'
import VIcon from '@/components/VIcon'
export default {
	components: {
		TheHeader,
		VIcon
	},
	data() {
		return {
			activeMenu: '',
			menus: [],
			dfsMenus: ['Workbench', 'Instance', 'Connection', 'Task'],
			breadcrumbData: [],
			dialogVisible: false
		}
	},
	created() {
		this.activeMenu = this.$route.path
		let menus = this.$router.options.routes.find(r => r.path === '/').children?.filter(item => !item.hidden)
		this.menus = this.dfsMenus.map(name => {
			return menus.find(item => item.name === name)
		})
		this.getBreadcrumb(this.$route)
	},
	watch: {
		$route(route) {
			this.activeMenu = route.path
			this.getBreadcrumb(route)
		}
	},
	methods: {
		createConnection(type) {
			this.dialogVisible = false
			this.$router.push({ name: 'ConnectionCreate', query: { databaseType: type } })
		},
		selectConnectionType() {
			this.dialogVisible = true
		},
		showGuide(key) {
			this.$refs.theHeader?.showGuide?.(key)
		},
		createTask() {
			this.$refs.theHeader?.createTask?.()
		},
		menuTrigger(path) {
			if (this.$route.path === path) {
				return
			}
			this.$router.push(path)
		},
		getBreadcrumb(route) {
			let matched = route.matched.slice(1)
			let data = []
			if (matched.length) {
				data = matched.map(route => {
					return {
						name: route.meta.title,
						to: {
							name: route.name === this.$route.name ? null : route.name
						}
					}
				})
			}
			this.breadcrumbData = data
		},
		back() {
			this.$router.back()
		}
	}
}
</script>

<style lang="scss" scoped>
.layout-wrap {
	height: 100%;
	padding-top: 68px;
	//&.dfs {
	//	.left-aside {
	//		background-color: rgba(0, 0, 0, 0.05);
	//		.el-menu {
	//			background-color: unset;
	//		}
	//		.el-menu-item {
	//			border-left: 3px solid transparent;
	//			&.is-active {
	//				color: #337dff;
	//				border-color: #337dff;
	//				background-color: #fff;
	//			}
	//		}
	//	}
	//}
	.left-aside {
		border-right: 1px solid #f2f4f6;
		background: #fff;
		.el-menu-item {
			::v-deep .v-icon {
				color: #888;
			}
			&.is-active {
				::v-deep .v-icon {
					color: map-get($color, primary);
				}
			}
		}
		.product-name {
			padding-left: 20px;
			font-size: 14px;
			font-weight: 700;
			line-height: 60px;
			color: map-get($fontColor, normal);
		}
	}
	.header {
		display: flex;
		align-items: center;
		font-size: 14px;
	}
	.main {
		display: flex;
		flex-direction: column;
		flex-basis: 0%;
		margin: 0;
		padding: 0;
	}
	.breadcrumb {
		padding-top: 20px;
		height: 40px;
		box-sizing: border-box;
	}
	.btn-back {
		padding: 0;
		width: 24px;
		height: 24px;
		font-size: 12px;
	}
}
</style>
