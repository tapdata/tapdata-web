<template>
	<section :class="['fast-download', 'down-page']">
		<TheHeader></TheHeader>
		<main class="page-main block">
			<div class="title">Agent 版本升级</div>
			<p class="title-text pt-10">
				系统检测到您的Agent不是最新版本，请按照指引进行升级
			</p>

			<div class="down-type">
				<div
					v-for="down in downType"
					:key="down.value"
					:class="{ active: downLoadType === down.value }"
					@click="chooseDownLoadType(down.value)"
				>
					<span>{{ down.name }}</span>
				</div>
			</div>
			<!--			<div class="text-style">升级前准备</div>-->
			<!--			<div class="box title-text"></div>-->
			<div class="content-container">
				<div class="py-2 text-style">升级前准备</div>
				<div>1.停止运行旧版本Agent,在Agent安装目录下执行</div>
				<div class="box title-text">./tapdata stop -f</div>
				<div>2.将旧版本的Agent备份</div>
				<div class="box title-text">mv /old_agent /old_agent_ba</div>
				<div>
					3.下载新版的升级安装包，并将安装包放入要安装Agent的目录。
					<ElLink @click="handleDownLoad">点击下载</ElLink>
				</div>
				<div class="py-2 text-style">开始升级</div>
				<div>
					1.将下载好的Tapdata Agent放入要安装Agent的目录，并通过cmd窗口在目录下执行下方命令即可实现Tapdata
					Agent的自动部署及启动
				</div>
				<div>
					<div class="box title-text">
						{{ comUrl }}
						<ElTooltip placement="top" manual content="已复制" popper-class="copy-tooltip" :value="showTooltip">
							<span
								class="operaKey"
								v-clipboard:copy="comUrl"
								v-clipboard:success="onCopy"
								@mouseleave="showTooltip = false"
							>
								<i class="click-style">复制</i>
							</span>
						</ElTooltip>
					</div>
				</div>
				<div>2.待上方命令执行完毕后，出现如下图所示日志则代表Agent启动成功：</div>
				<div><img src="../../assets/image/upgradeVersionSuccess.png" alt="" /></div>
				<div class="py-2 text-style">版本回退</div>
				<div>1.如果升级失败，您可以通过备份进行版本回退</div>
				<div class="box title-text">mv /old_agent_bak /old_agent</div>
				<div class="box title-text">./tapdata start</div>
			</div>
			<template v-if="downLoadType === 'Linux'">
				<ul class="pt-5 ul-style">
					<li>1. 部署前请确认你的本地环境中已安装 java</li>
					<li>
						2. 请复制下方命令并在本地部署环境执行，其包含 Tapdata Agent 的下载、自动部署及启动
					</li>
					<li>3. 下载、部署 Tapdata Agent 无需 root 权限</li>
					<li>4. 我们非常建议在一个独立、干净的文件夹内部署 Tapdata Agent</li>
					<li>
						<h4 class="s-title">
							<ElTooltip placement="top" manual content="已复制" popper-class="copy-tooltip" :value="showTooltip">
								<span
									class="operaKey"
									v-clipboard:copy="LinuxLink"
									v-clipboard:success="onCopy"
									@mouseleave="showTooltip = false"
								>
									<i class="click-style">复制</i>
								</span>
							</ElTooltip>
						</h4>
					</li>
					<li class="box title-text">{{ LinuxLink }}</li>

					<li>
						5. 待上方命令执行完毕后，Tapdata Agent 会处于启动状态，你可以通过以下命令对 Tapdata Agent 进行管理
					</li>
				</ul>
			</template>
			<template v-if="downLoadType === 'Docker'">
				<ul class="pt-5 ul-style">
					<li>1. 我们提供了包含 Tapdata Agent 运行所需环境的镜像</li>
					<li>
						2. 请复制下方命令并在本地部署环境执行，其包含镜像的下载及运行，Tapdata Agent 的下载、自动部署及启动
					</li>
					<li>3. 下载、部署 Tapdata Agent 无需 root 权限</li>
					<li>4. 我们非常建议在一个独立、干净的文件夹内部署 Tapdata Agent</li>
					<li>
						<h4 class="s-title">
							<ElTooltip placement="top" manual content="已复制" popper-class="copy-tooltip" :value="showTooltip">
								<span
									class="operaKey"
									v-clipboard:copy="dockerLink"
									v-clipboard:success="onCopy"
									@mouseleave="showTooltip = false"
								>
									<i class="click-style">复制</i>
								</span>
							</ElTooltip>
						</h4>
					</li>
					<li class="box title-text">{{ dockerLink }}</li>

					<li>
						5. 待上方命令执行完毕后，Tapdata Agent 会处于启动状态，你可以通过以下命令对 Tapdata Agent 进行管理
					</li>
				</ul>
			</template>
		</main>
	</section>
</template>
<script>
import TheHeader from '@/components/TheHeader'
export default {
	name: 'UpgradeVersion',
	components: { TheHeader },
	data() {
		return {
			downLoadType: 'windows',
			downType: [
				{ name: 'Windows (64 bit)', value: 'windows' },
				{ name: 'Linux (64 bit)', value: 'Linux' },
				{ name: 'Docker', value: 'Docker' }
			],
			showTooltip: false,
			windowLink: '',
			LinuxLink: '',
			dockerLink: '',
			agentId: '',
			version: '',
			token: ''
			// user: window.__USER_INFO__ || {}
		}
	},
	computed: {
		comUrl() {
			let version = this.version
			let token = this.token
			let map = {
				windows:
					'tapdata start backend --downloadUrl ' +
					`http://resource.tapdata.net/package/feagent/${version}/ --token ` +
					token,
				Linux:
					'wget "' +
					`http://resource.tapdata.net/package/feagent/${version}/tapdata` +
					'" && chmod +x tapdata && ./tapdata start backend --downloadUrl ' +
					`http://resource.tapdata.net/package/feagent/${version}/ --token ` +
					token,
				Docker:
					'docker run -itd ' +
					`ccr.ccs.tencentyun.com/tapdata/flow-engine:0.1 '` +
					'wget "' +
					`http://resource.tapdata.net/package/feagent/${version}/tapdata` +
					'" && chmod +x tapdata && ./tapdata start backend --downloadUrl ' +
					`http://resource.tapdata.net/package/feagent/${version}/ --token ` +
					token +
					`'`
			}
			return map[this.downLoadType]
		}
	},
	created() {
		// let filter = {
		// 	where: {},
		// 	size: 1,
		// 	page: 0,
		// 	sort: ['createAt desc']
		// }
		// this.$axios.get('api/tcm/agent?filter=' + encodeURIComponent(JSON.stringify(filter))).then(async data => {
		// 	// 不存在版本号
		// 	if (!this.version) {
		// 		let getVersion = await this.getVersion()
		// 		this.version = getVersion?.version
		// 	}
		// 	console.log('version', this.version, data.items[0])
		// 	if (data.items && data.items.length) {
		// 		this.handleGetUrl(data.items[0].tmInfo, data.items[0].spec)
		// 	} else {
		// 		this.getOrders()
		// 	}
		// })
		this.loadData()
	},
	methods: {
		loadData() {
			let agentId = this.$route.query.agentId
			this.$axios.get('api/tcm/config/version/latest/' + agentId).then(data => {
				this.version = data.version
				this.token = data.token
			})
		},

		// 获取下载地址
		getUrlLinks(id) {
			let where = {}
			if (id) {
				where.id = id
			}
			let filter = {
				where
			}
			this.this.$axios.get('api/tcm/agent?filter=' + encodeURIComponent(JSON.stringify(filter))).then(data => {
				if (data) {
					let tmInfo = '',
						spec = ''
					if (data.items && data.items.length > 0) {
						tmInfo = data.items[0].tmInfo
						spec = data.items[0].spec
					}

					this.handleGetUrl(tmInfo, spec)
				}
			})
		},
		// 获取路径地址
		handleGetUrl(data, spec) {
			if (!data || !spec) {
				return
			}
			let version = this.version
			this.windowLink =
				'tapdata start backend --downloadUrl ' +
				`http://resource.tapdata.net/package/feagent/${version}/ --token ` +
				data.token
			this.LinuxLink =
				'wget "' +
				`http://resource.tapdata.net/package/feagent/${version}/tapdata` +
				'" && chmod +x tapdata && ./tapdata start backend --downloadUrl ' +
				`http://resource.tapdata.net/package/feagent/${version}/ --token ` +
				data.token
			this.dockerLink =
				'docker run -itd ' +
				`ccr.ccs.tencentyun.com/tapdata/flow-engine:0.1 '` +
				'wget "' +
				`http://resource.tapdata.net/package/feagent/${version}/tapdata` +
				'" && chmod +x tapdata && ./tapdata start backend --downloadUrl ' +
				`http://resource.tapdata.net/package/feagent/${version}/ --token ` +
				data.token +
				`'`
		},
		// windows下载
		handleDownLoad() {
			// window.location = this.windowDownloadUrl
			// let version = ' window._TAPDATA_OPTIONS_.version';
			let version = this.version
			window.location = `https://resource.tapdata.net/package/feagent/${version}/tapdata.exe`
		},
		// 选择下载安装类型
		chooseDownLoadType(val) {
			this.downLoadType = val
		},
		// 复制命令行
		onCopy() {
			this.showTooltip = true
		},
		handleNextSetp() {
			this.$router.push({ name: 'Instance' })
		}
	}
}
</script>
<style lang="scss" scoped>
.fast-download {
	display: flex;
	flex: 1;
	flex-direction: column;
	width: 100%;
	height: 100%;
	padding-top: 68px;
	overflow: hidden;
	background-color: #fff;
	box-sizing: border-box;
	.page-main {
		width: 100%;
		//height: calc(100% - 80px);
		margin: 0 auto;
		padding: 0 20% 100px;
		box-sizing: border-box;
		overflow: auto;

		.title {
			padding-top: 60px;
			font-size: 28px !important;
			font-weight: bold;
			color: #333;
			text-align: center;
		}
		.title-text {
			line-height: 22px;
			font-size: 12px;
			color: #666;
		}
		.text-style {
			font-size: 12px;
			color: #333;
			font-weight: bold;
		}
		.ul-style {
			padding-left: 10px;
			li {
				padding: 3px 0;
				overflow-x: auto;
			}
		}
		.box {
			padding: 10px 20px;
			background-color: #fafafa;
		}
		.box.title-text {
			padding: 10px 20px;
		}
		.click-style {
			padding-left: 10px;
			font-size: 12px;
			font-style: normal;
			color: map-get($color, primary);
			font-weight: normal;
			cursor: pointer;
		}
		.text-style {
			font-size: 12px;
			color: #333;
			font-weight: bold;
		}
		.down-type {
			padding: 50px 0;
			div {
				position: relative;
				display: inline-block;
				overflow: hidden;
				margin-right: 20px;
				padding: 10px 50px;
				font-size: 12px;
				cursor: pointer;
				color: #666;
				border: 1px solid #dedee4;
				border-radius: 3px;
			}
			.active {
				border: 1px solid map-get($color, primary);
				background-color: map-get($color, primary);
				color: #fff;
			}
		}
		.line {
			margin: 20px 0 0 15px;
			border-left: 3px solid map-get($color, primary);
			p {
				padding-top: 5px;
			}
		}
	}
	.footer {
		display: flex;
		justify-content: center;
		align-items: center;
		position: absolute;
		left: 0;
		bottom: 0;
		width: 100%;
		height: 80px;
		margin: auto;
		border-top: 1px solid #dedee4;
		background-color: #fff;
		.el-button {
			width: 250px;
			height: 42px;
			font-size: 14px;
		}
		.el-button + .el-button {
			margin-left: 30px;
			background-color: map-get($color, primary);
		}
		.el-button + .el-button:hover {
			background-color: map-get($color, lprimary);
		}
	}
}
.content-container {
	> div {
		margin-bottom: 10px;
	}
}
</style>
