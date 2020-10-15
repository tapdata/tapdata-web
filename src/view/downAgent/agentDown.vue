<template>
	<div class="agentDown">
		<el-dialog :visible.sync="dialogVisible" width="70%">
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
					<span class="downLoadText">( {{ $t('dialog.downAgent.agentNum') }}: <i>0</i> )</span>
				</div>
				<div class="down-type">
					<div
						v-for="down in downType"
						:key="down"
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
					<span v-if="downLoadType === 'Linux'">{{ $t('dialog.downAgent.text') }}</span>
					<div v-else>
						<span class="operaKey">{{ $t('dialog.downAgent.downLoadAgent') }}</span>
						<span>{{ $t('dialog.downAgent.windowsText') }}</span>
					</div>
					<span class="operaKey">{{ $t('dialog.downAgent.copy') }}</span>
					<span class="operaKey">{{ $t('dialog.downAgent.refresh') }}</span>
				</div>

				<div class="copy-down-link">
					wget "https://demo.tapdata.net/static/tapdata" && chmod +x tapdata && ./tapdata start backend token
					ci5fQUoDL95lZKUKdDwMupJeAAxN 3Vn10yLF8pF6wjQReCrYhNTEvcEV8dLmsmOE 5e6ca61a708029ab07f98390
				</div>

				<div class="title">
					<i class="iconLable"></i>
					<span>{{ $t('dialog.downAgent.downloadInstallInstructions') }}</span>
				</div>
				<ul class="installation-notes" v-if="downLoadType === 'Linux'">
					<li>{{ $t('dialog.downAgent.linuxInstructionsText1') }}</li>
					<li>{{ $t('dialog.downAgent.linuxInstructionsText2') }}</li>
					<li>{{ $t('dialog.downAgent.linuxInstructionsText3') }}</li>
				</ul>
				<ul class="installation-notes" v-else>
					<li>{{ $t('dialog.downAgent.windowsInstructionsText1') }}</li>
					<li>{{ $t('dialog.downAgent.windowsInstructionsText2') }}</li>
					<li>{{ $t('dialog.downAgent.windowsInstructionsText3') }}</li>
					<li>{{ $t('dialog.downAgent.windowsInstructionsText4') }}</li>
					<li>{{ $t('dialog.downAgent.windowsInstructionsText5') }}</li>
				</ul>
			</section>
			<span slot="footer" class="dialog-footer">
				<el-button size="mini">{{ $t('dialog.downAgent.waitingInstall') }}</el-button>
			</span>
		</el-dialog>
		<!-- <head>
			<h1>Agent下载与安装</h1>
			<span>Tapdata DFS云版需要在本地安装agent以确保连接数据库和传输服务正常运行</span>
		</head> -->
	</div>
</template>
<script>
export default {
	name: 'agentDown',
	data() {
		return {
			dialogVisible: true,
			downLoadType: 'windows',
			downType: [
				{ name: 'Windows (64b it)', value: 'windows' },
				{ name: 'Linux (64 bit)', value: 'Linux' }
			]
		};
	},
	methods: {
		chooseDownLoadType(val) {
			this.downLoadType = val;
		}
	}
};
</script>
<style scoped lang="less">
.agentDown {
	width: 100%;
	height: 100%;
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
				background-color: #48b6e2;
				border-radius: 1px;
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
				color: #48b6e2;
				cursor: pointer;
			}
			div {
				display: inline-block;
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
}
</style>
<style lang="less">
.agentDown {
	.el-dialog__footer {
		text-align: center;
	}
}
</style>
