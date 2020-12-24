<template>
	<div class="agentDown">
		<el-dialog
			:visible.sync="dialogVisible"
			custom-class=""
			:close-on-click-modal="false"
			@close="closeDownAgent"
			width="60%"
		>
			<template slot="title">
				<div class="header">
					<h1>{{ $t('dialog.downAgent.headTitle') }}</h1>
					<span>{{ $t('dialog.downAgent.headInterpretation') }}</span>
				</div>
			</template>
			<section class="agent-main">
				<div class="title">
					<i class="iconLable"></i>
					<span>{{ $t('dialog.downAgent.downloadInstall') }}</span>
					<span class="downLoadText"
						>( {{ $t('dialog.downAgent.agentNum') }}: <i>{{ downLoadNum }}</i> )</span
					>
				</div>
				<div class="down-type">
					<div
						v-for="down in downType"
						:key="down.value"
						:class="{ active: downLoadType === down.value }"
						@click="chooseDownLoadType(down.value)"
					>
						<span>{{ down.name }}</span>
						<span class="choose" v-if="downLoadType === down.value">
							<i class="el-icon-upload-success el-icon-check"></i>
						</span>
					</div>
				</div>
				<div class="prompt">
					<span style="word-break: break-word" v-if="downLoadType === 'Linux'">{{
						$t('dialog.downAgent.text')
					}}</span>
					<div v-else @click="handleDownLoad">
						<span class="operaKey">
							<i class="iconfont icon-xiazai clickIcont"></i>
							{{ $t('dialog.downAgent.downLoadAgent') }}</span
						>
						<span style="word-break: break-word">{{ $t('dialog.downAgent.windowsText') }}</span>
					</div>

					<el-tooltip
						placement="top"
						manual
						:content="$t('dialog.downAgent.copied')"
						popper-class="copy-tooltip"
						:value="showTooltip"
					>
						<span
							class="operaKey"
							v-clipboard:copy="downLoadType === 'Linux' ? LinuxLink : windowLink"
							v-clipboard:success="onCopy"
							@mouseleave="showTooltip = false"
						>
							<i class="iconfont icon-fuzhi1 clickIcont"></i>{{ $t('dialog.downAgent.copy') }}
						</span>
					</el-tooltip>
				</div>

				<div class="copy-down-link">
					<span v-if="downLoadType === 'Linux'">{{ LinuxLink }}</span>
					<span v-else>{{ windowLink }}</span>
				</div>

				<div class="title">
					<i class="iconLable"></i>
					<span>{{ $t('dialog.downAgent.downloadInstallInstructions') }}</span>
				</div>
				<ul class="installation-notes" v-if="downLoadType === 'Linux'">
					<li style="color: #F56C6C;">{{ $t('dialog.downAgent.linuxInstructionsText1') }}</li>
					<li>{{ $t('dialog.downAgent.linuxInstructionsText2') }}</li>
					<li>{{ $t('dialog.downAgent.linuxInstructionsText3') }}</li>
				</ul>
				<ul class="installation-notes" v-else>
					<li style="color: #F56C6C;">{{ $t('dialog.downAgent.windowsInstructionsText1') }}</li>
					<li>{{ $t('dialog.downAgent.windowsInstructionsText2') }}</li>
					<li>{{ $t('dialog.downAgent.windowsInstructionsText3') }}</li>
					<li style="padding-top: 10px;">{{ $t('dialog.downAgent.important') }}</li>
					<li>{{ $t('dialog.downAgent.windowsInstructionsText5') }}</li>
					<li>{{ $t('dialog.downAgent.windowsInstructionsText4') }}</li>
				</ul>
			</section>
			<span slot="footer" class="dialog-footer">
				<!-- <el-button type="primary" size="mini" @click="handleRefresh">
					<i class="el-icon-loading" v-if="refreshLoading"></i>
					{{ $t('dialog.downAgent.refresh') }}</el-button
				> -->
				<el-button size="mini" type="primary" class="install" v-if="lastDataNum > 0">
					{{ $t('dialog.downAgent.agentRun') }}
				</el-button>
				<el-button size="mini" class="install" v-else>
					{{ $t('dialog.downAgent.waitingInstall') }}
					<el-image style="width: 32px; height: 15px;" src="static/editor/wating.svg"></el-image>
				</el-button>
			</span>
		</el-dialog>

		<el-dialog
			:visible.sync="installSuccessDialog"
			:close-on-click-modal="false"
			@close="closeSuccessDialog"
			width="40%"
		>
			<div class="success-main">
				<i class="el-icon-success"></i>
				<p>
					{{ $t('dialog.downAgent.dfsSuccessText') }}
					<span class="active" @click="handlepageJump">{{ $t('dialog.downAgent.clickView') }}</span>
				</p>
				<!-- <p>
					{{ $t('dialog.downAgent.dfsSuccessText1') }}
					<span class="active"> {{ $t('dialog.downAgent.creatTask') }}, </span
					>{{ $t('dialog.downAgent.dfsSuccessText2') }}
				</p> -->
			</div>
			<span slot="footer" class="dialog-footer">
				<!-- <span class="operaKey" @click="handleRefresh">
					<i class="iconfont icon-shuaxin3 clickIcont" v-if="refreshLoading"></i>
					<i class="el-icon-loading" v-else></i>
					{{ $t('dialog.downAgent.refresh') }}
				</span> -->
				<el-button class="e-button" type="primary" size="mini" @click="closeSuccessDialog">{{
					$t('dialog.downAgent.ok')
				}}</el-button>
			</span>
		</el-dialog>

		<el-dialog :visible.sync="startUpTaskDialog" :close-on-click-modal="false" width="40%" @close="closeTaskDialog">
			<div class="success-main">
				<i class="el-icon-success"></i>
				<p>
					{{ $t('dialog.downAgent.dfsSuccessText3') }}{{ $t('dialog.downAgent.dfsSuccessText4') }}
					<!-- <span class="active">{{ $t('dialog.downAgent.clickView') }}</span> -->
				</p>
				<!-- <p>
					{{ $t('dialog.downAgent.dfsSuccessText1') }}
					<span class="active"> {{ $t('dialog.downAgent.creatTask') }}, </span
					>{{ $t('dialog.downAgent.dfsSuccessText2') }}
				</p> -->
			</div>
			<span slot="footer" class="dialog-footer">
				<el-button class="e-button" type="primary" size="mini" @click="closeTaskDialog">{{
					$t('dialog.downAgent.ok')
				}}</el-button>
			</span>
		</el-dialog>
	</div>
</template>
<script>
import factory from '@/api/factory';
const cluster = factory('cluster');
export default {
	name: 'agentDown',
	props: {
		// downLoadNum: {
		// 	type: Number
		// },
		// lastDataNum: {
		// 	type: Number
		// },
		type: {
			type: String
		}
	},
	data() {
		return {
			dialogVisible: false,
			downLoadType: 'windows',
			showTooltip: false,
			installSuccessDialog: false,
			startUpTaskDialog: false,
			windowLink: '',
			LinuxLink: '',
			refreshLoading: false,
			downLoadNum: 0,
			lastDataNum: 0,
			downType: [
				{ name: 'Windows (64 bit)', value: 'windows' },
				{ name: 'Linux (64 bit)', value: 'Linux' }
			]
		};
	},
	mounted() {
		let self = this;
		let version = window._TAPDATA_OPTIONS_.version;
		this.windowLink =
			'tapdata start backend --downloadUrl ' +
			`http://resource.tapdata.net/package/feagent/${version}/ --token ` +
			this.$cookie.get('token') +
			' ' +
			this.$cookie.get('user_id');
		this.LinuxLink =
			'wget "' +
			`http://resource.tapdata.net/package/feagent/${version}/tapdata` +
			'" && chmod +x tapdata && ./tapdata start backend --downloadUrl ' +
			`http://resource.tapdata.net/package/feagent/${version}/ --token ` +
			this.$cookie.get('token') +
			' ' +
			this.$cookie.get('user_id');

		// 是否允许下载agent
		if (this.$window.getSettingByKey('ALLOW_DOWNLOAD_AGENT')) {
			this.getDataApi('firstAgent');
			self.timer = setInterval(() => {
				self.getDataApi();
				if (self.downLoadNum > 0) {
					clearInterval(self.timer);
					self.timer = null;
				}
			}, 5000);
		}
	},

	watch: {
		downLoadNum(num) {
			if (num > 0 && this.dialogVisible) {
				if (this.type === 'dashboard') {
					this.installSuccessDialog = true;
				} else {
					this.startUpTaskDialog = true;
				}
				this.refreshLoading = false;
			}
		}
	},

	methods: {
		// 获取Agent是否安装
		getDataApi(type) {
			let that = this;
			let params = {};
			if (!parseInt(this.$cookie.get('isAdmin')) && localStorage.getItem('BTN_AUTHS') !== 'BTN_AUTHS') {
				params['filter[where][systemInfo.username][regexp]'] = `^${that.$cookie.get('user_id')}$`;
			}
			cluster.get(params).then(res => {
				if (res.data) {
					if (type === 'firstAgent') {
						that.lastDataNum = res.data.length || 0;
					}
					if (res.data.length) {
						this.$emit('closeAgentTip');
					}
					that.downLoadNum = res.data.length;
				}
			});
			return that.downLoadNum;
		},
		// 选择下载安装类型
		chooseDownLoadType(val) {
			this.downLoadType = val;
		},

		// windows下载
		handleDownLoad() {
			let version = window._TAPDATA_OPTIONS_.version;
			window.location = `http://resource.tapdata.net/package/feagent/${version}/tapdata.exe`;
		},

		// 复制命令行
		onCopy() {
			this.showTooltip = true;
		},

		// // 刷新
		// handleRefresh() {
		// 	this.refreshLoading = true;
		// 	this.$emit('refreAgent');
		// },

		// 关闭agent弹窗回调
		closeDownAgent() {
			this.dialogVisible = false;
			this.$emit('closeAgentDialog');
		},

		// 关闭下载成功弹窗
		closeSuccessDialog() {
			this.installSuccessDialog = false;
			this.dialogVisible = false;
		},

		// 关闭任务弹窗
		closeTaskDialog() {
			this.startUpTaskDialog = false;
			this.dialogVisible = false;
		},

		// 页面跳转
		handlepageJump() {
			this.$router.push({
				name: 'clusterManagement'
			});
			this.dialogVisible = false;
			this.installSuccessDialog = false;
		}
	},

	destroyed() {
		clearInterval(this.timer);
		this.timer = null;
	}
};
</script>
<style scoped lang="less">
.agentDown {
	// width: 100%;
	// height: 100%;
	.header {
		user-select: none;
		h1 {
			display: inline-block;
			font-size: 18px;
			color: #000;
		}
		span {
			font-size: 12px;
			color: #aaa;
		}
	}
	.agent-main {
		.title {
			font-size: 12px;
			color: #666;
			i.iconLable {
				display: inline-block;
				width: 6px;
				height: 13px;
				vertical-align: middle;
				background-color: #48b6e2;
				border-radius: 1px;
			}
			span {
				display: inline-block;
				vertical-align: middle;
			}
			.downLoadText {
				color: #9a9a9a;
				i {
					color: #48b6e2;
				}
			}
		}
		.down-type {
			padding: 20px 0;
			div {
				position: relative;
				display: inline-block;
				overflow: hidden;
				margin-right: 20px;
				padding: 10px 50px;
				font-size: 12px;
				cursor: pointer;
				border: 1px solid #eee;
			}
			.active {
				border: 1px solid #48b6e2;
				.choose {
					display: block;
					position: absolute;
					right: -13px;
					bottom: -13px;
					width: 32px;
					height: 26px;
					background: #48b6e2;
					text-align: center;
					transform: rotate(-40deg);
					box-shadow: 0 1px 1px #ccc;
					i {
						display: block;
						color: #fff;
						font-size: 12px;
						margin-bottom: 12px;
						transform: rotate(42deg);
					}
				}
			}
		}
		.prompt {
			padding-bottom: 8px;
			font-size: 12px;
			color: #666;
			.operaKey {
				padding: 0 10px;
				color: #48b6e2;
				cursor: pointer;
			}
			div {
				display: inline-block;
			}
			.clickIcont {
				font-size: 14px;
			}
		}
		.copy-down-link {
			padding: 20px;
			margin-bottom: 20px;
			font-size: 12px;
			color: #666;
			border-radius: 3px;
			border: 1px solid #dedee4;
		}
		.installation-notes {
			padding-top: 10px;
			font-size: 12px;
			color: #aaa;
			li {
				padding: 5px 0;
			}
		}
		.dialog-footer {
			text-align: center;
		}
	}

	.success-main {
		padding: 0 50px;
		font-size: 12px;
		color: #666;
		i {
			float: left;
			display: inline-block;
			padding-top: 4px;
			font-size: 18px;
			color: rgb(141, 196, 122);
		}
		p {
			padding: 5px 30px;
		}

		.active {
			color: #48b6e2;
			cursor: pointer;
		}
		.dialog-footer {
			text-align: center;
			.install {
				user-select: none;
			}
		}
	}
}
</style>
<style lang="less">
.agentDown {
	.el-dialog__footer {
		text-align: center;
		.e-button {
			padding: 7px 30px !important;
		}
		.install {
			user-select: none;
			cursor: no-drop;
		}
	}
}
</style>
