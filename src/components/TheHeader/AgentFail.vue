<template>
	<ElDialog
		:visible.sync="value"
		width="500"
		:close-on-click-modal="false"
		:show-close="false"
		custom-class="agentErrorDialog"
	>
		<h1>
			<i class="el-icon-warning"></i>
			Agent 服务状态异常
		</h1>

		<div class="dialogBox">
			<h3>异常原因:</h3>
			<p>
				{{ !agentEngineVisible ? 'Agnet 进程所在环境断开连接' : 'Agnet 服务进程被干掉' }}
			</p>
			<h3>解决方案:</h3>
			<p>
				{{ !agentEngineVisible ? 'WINDOWS：启动服务器并执行命令' : 'WINDOWS：在安装Agent环境下执行命令' }}
				<i>tapdata start backend</i> 以重启进程
			</p>
			<p>
				{{ !agentEngineVisible ? 'LINUX：启动服务器并执行命令' : 'LINUX：在安装Agent环境下执行命令' }}
				<i>./tapdata start backend</i> 以重启进程
			</p>
		</div>
		<div slot="footer" class="dialog-footer">
			<span class="text">进程已重启？请点击</span>
			<el-button type="primary" size="small" @click="handleAgent()">刷新</el-button>
		</div>
	</ElDialog>
</template>
<script>
export default {
	props: {
		value: Boolean,
		isClose: Boolean
	},
	data() {
		return {
			agentEngineVisible: false
		}
	},
	watch: {
		isClose(val) {
			if (!val) {
				this.$emit('input', false)
			}
		}
	},
	methods: {
		handleAgent() {
			// 	let params = {};
			// 	params['filter[where][systemInfo.username][regexp]'] = `^${this.$cookie.get('user_id')}$`;
			// 	this.$api('cluster')
			// 		.get(params)
			// 		.then(res => {
			// 			if (res.data.length && res.data[0].status !== 'running') {
			// 				if (res.data[0].engine.status !== 'running') {
			// 					this.agentEngineVisible = true;
			// 				} else {
			// 					this.agentEngineVisible = false;
			// 				}
			// 			} else {
			// 				this.$emit('input', false);
			// 			}
			// 		});
		}
	}
}
</script>
<style lang="scss">
.agentErrorDialog {
	.el-dialog__body {
		padding: 0 30px 30px;
		h1 {
			font-size: 18px;
			color: #333;
			i {
				padding-right: 10px;
				font-size: 22px;
				color: #fe983d;
			}
		}
		.dialogBox {
			padding: 10px 30px 0;
			margin: 0;
			h3 {
				margin: 0;
				padding: 10px 0;
				font-size: 14px;
				color: #333;
				font-weight: bold;
			}
			p {
				padding: 10px 0;
				font-size: 12px;
				color: #555;
				i {
					display: inline-block;
					padding: 2px 10px;
					color: #666;
					font-style: normal;
					background-color: #f1f1f1;
				}
			}
		}
	}
	.dialog-footer {
		.text {
			padding-right: 10px;
			font-size: 12px;
			color: #666;
		}
	}
}
</style>
