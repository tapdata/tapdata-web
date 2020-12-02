<template>
	<div class="cluster">
		<!-- 服务集群管理 -->
		<div class="cluster-box">
			<el-row class="fun-area" :gutter="10">
				<el-col :span="12">
					<div class="demo-input-suffix">
						<span>{{ $t('message.sourchName') }}</span>
						<el-input
							:placeholder="$t('message.placeholderServer')"
							clearable
							@keyup.enter="screenFn"
							v-model="sourch"
						>
						</el-input>
						<el-button type="primary" @click="screenFn">{{ $t('message.filter') }}</el-button>
					</div>
				</el-col>
				<el-col class="text-rf screen" :span="2" :offset="9"> </el-col>
			</el-row>

			<div class="content" v-if="waterfallData.length > 0">
				<el-row :gutter="20" class="waterfall">
					<el-col class="list" :md="12" :sm="24" v-for="(element, i) in waterfallData" :key="i">
						<div class="grid-content listBox" v-for="item in element" :key="item.ip">
							<div class="boxTop">
								<div class="fl" style="width: 60%;">
									<i class="circular" :class="item.status !== 'running' ? 'bgred' : 'bggreen'"></i>
									<h2 class="name">{{ item.systemInfo.hostname }}</h2>
									<div class="uuid">{{ item.systemInfo.uuid }}</div>
									<span>{{ item.systemInfo.ip }}</span>
								</div>
								<div class="fr" style="width: 40%;" v-readonlybtn="'Cluster_operation'">
									<el-button size="mini" class="fr addBtn" @click="addServeFn(item)">{{
										$t('message.addServerMon')
									}}</el-button>
								</div>
								<!--  -->
							</div>
							<div class="boxBottom">
								<el-row :gutter="20" class="data-list">
									<el-col :span="8">
										<span class="txt"
											><i class="icon iconfont iconhoutai"></i>{{ $t('message.manageSys') }}</span
										>
									</el-col>
									<el-col :span="4">
										<span :class="item.management.status == 'stopped' ? 'red' : 'green'">{{
											item.management.status
										}}</span>
									</el-col>
									<el-col :span="12">
										<div class="btn fr" v-readonlybtn="'Cluster_operation'">
											<el-button
												:type="item.management.status == 'stopped' ? 'primary' : 'info'"
												:disabled="item.management.status == 'stopped' ? false : true"
												@click="startFn(item, item.management.status, 'management', 'start')"
												>{{ $t('message.startUp') }}</el-button
											>
											<el-button
												:type="item.management.status == 'running' ? 'danger' : 'info'"
												:disabled="item.management.status == 'running' ? false : true"
												@click="closeFn(item, item.management.status, 'management', 'stop')"
												>{{ $t('message.close') }}</el-button
											>
											<el-button
												type="text"
												:disabled="item.management.status == 'running' ? false : true"
												@click="
													restartFn(item, item.management.status, 'management', 'restart')
												"
												>{{ $t('message.restart') }}</el-button
											>
										</div>
									</el-col>
								</el-row>
								<el-row :gutter="20" class="data-list">
									<el-col :span="8">
										<span class="txt"
											><i class="icon iconfont icontongbu"></i>{{ $t('message.syncGover') }}</span
										>
									</el-col>
									<el-col :span="4">
										<span :class="item.engine.status == 'stopped' ? 'red' : 'green'">{{
											item.engine.status
										}}</span>
									</el-col>
									<el-col :span="12">
										<div class="btn fr" v-readonlybtn="'Cluster_operation'">
											<el-button
												:type="item.engine.status == 'stopped' ? 'primary' : 'info'"
												:disabled="item.engine.status == 'stopped' ? false : true"
												@click="startFn(item, item.engine.status, 'engine')"
												>{{ $t('message.startUp') }}</el-button
											>
											<el-button
												:type="item.engine.status == 'running' ? 'danger' : 'info'"
												:disabled="item.engine.status == 'running' ? false : true"
												@click="closeFn(item, item.engine.status, 'engine')"
												>{{ $t('message.close') }}</el-button
											>
											<el-button
												type="text"
												:disabled="item.engine.status == 'running' ? false : true"
												@click="restartFn(item, item.engine.status, 'engine')"
												>{{ $t('message.restart') }}</el-button
											>
										</div>
									</el-col>
								</el-row>
								<el-row :gutter="20" class="data-list">
									<el-col :span="8">
										<span class="txt"><i class="icon iconfont iconAPI"></i>API server</span>
									</el-col>
									<el-col :span="4">
										<span :class="item.apiServer.status == 'stopped' ? 'red' : 'green'">{{
											item.apiServer.status
										}}</span>
									</el-col>
									<el-col :span="12">
										<div class="btn fr" v-readonlybtn="'Cluster_operation'">
											<el-button
												:type="item.apiServer.status == 'stopped' ? 'primary' : 'info'"
												:disabled="item.apiServer.status == 'stopped' ? false : true"
												@click="startFn(item, item.apiServer.status, 'apiServer')"
												>{{ $t('message.startUp') }}</el-button
											>
											<el-button
												:type="item.apiServer.status == 'running' ? 'danger' : 'info'"
												:disabled="item.apiServer.status == 'running' ? false : true"
												@click="closeFn(item, item.apiServer.status, 'apiServer')"
												>{{ $t('message.close') }}</el-button
											>
											<el-button
												type="text"
												:disabled="item.apiServer.status == 'running' ? false : true"
												@click="restartFn(item, item.apiServer.status, 'apiServer')"
												>{{ $t('message.restart') }}</el-button
											>
										</div>
									</el-col>
								</el-row>
								<el-row
									:gutter="20"
									class="data-list"
									v-for="child in item.customMonitorStatus"
									:key="child.id"
								>
									<el-col :span="7" :offset="1">
										<span class="txt">{{ child.name }}</span>
									</el-col>
									<el-col :span="4">
										<span :class="item.apiServer.status == 'stopped' ? 'red' : 'green'">{{
											child.status
										}}</span>
									</el-col>
									<el-col :span="7" :offset="5" v-readonlybtn="'BTN_AUTHS'">
										<div class="btn fr">
											<el-button type="text" @click="delServe(child, item.status)">{{
												$t('message.delete')
											}}</el-button>
											<el-button type="text" @click="editServe(child, item.status, item)">{{
												$t('message.edit')
											}}</el-button>
										</div>
									</el-col>
								</el-row>
							</div>
						</div>
					</el-col>
				</el-row>
			</div>
			<div v-else class="noText">
				<i class="iconfont icon iconkongyemian_zanwuwendang" style="font-size: 174px"></i>
			</div>
		</div>
		<el-dialog
			:title="$t('message.addServerMon')"
			custom-class="serverDialog"
			:visible.sync="dialogForm"
			:append-to-body="true"
			:lock-scroll="false"
			:close-on-click-modal="false"
			width="600px"
			@close="closeDialogForm()"
		>
			<addServe :data="currentData" :editItem="editItem" ref="childRules"></addServe>
			<div slot="footer" class="dialog-footer">
				<el-button size="small" @click="closeDialogForm()">{{ $t('message.cancel') }}</el-button>
				<el-button size="small" type="primary" @click="submitForm('ruleForm')">{{
					$t('message.confirm')
				}}</el-button>
			</div>
		</el-dialog>
	</div>
</template>
<script>
// import vueWaterfallEasy from 'vue-waterfall-easy';
import addServe from './component/addServe';
import factory from '../../api/factory';
const cluster = factory('cluster');
export default {
	name: 'clusterManagement',
	components: { addServe },
	data() {
		return {
			waterfallData: [],
			currentData: null,
			dialogForm: false,
			activeIndex: '1',
			sourch: '',
			serveStatus: '',
			isStop: false,
			engineState: '',
			managementState: '',
			apiServerState: '',
			list: [],
			editItem: {},
			timer: null
		};
	},
	created() {
		// 这是一个定时器
		let that = this;
		this.timer = setInterval(() => {
			that.getDataApi();
		}, 5000);

		if (this.$window.getSettingByKey('ALLOW_DOWNLOAD_AGENT')) {
			this.getDataApi();
		}
	},

	methods: {
		// 提交
		async submitForm() {
			let getFrom = this.$refs.childRules.ruleForm;
			let status = this.$refs.childRules.data.status;
			let flag = this.$refs['childRules'].validateForm();
			if (status === 'running') {
				if (flag) {
					let data = {
						uuid: this.currentData.uuid,
						name: getFrom.name,
						command: getFrom.command,
						arguments: getFrom.arguments ? getFrom.arguments : ''
					};
					if (getFrom.id === '') {
						await cluster
							.addMonitor(data)
							.then(() => {
								this.dialogForm = false;
								this.getDataApi();
								this.$message.success(this.$t('message.saveOK'));
							})
							.catch(() => {
								this.$message.error(this.$t('message.saveFail'));
							})
							.finally(() => {
								this.dialogForm = false;
							});
					} else {
						data.id = getFrom.id;
						await cluster
							.editMonitor(data)
							.then(() => {
								this.dialogForm = false;
								this.getDataApi();
								this.$message.success(this.$t('message.saveOK'));
							})
							.catch(() => {
								this.$message.error(this.$t('message.saveFail'));
							})
							.finally(() => {
								this.dialogForm = false;
							});
					}
				}
			} else {
				this.$message.error(this.$t('message.startupAfter_add'));
			}
		},
		editServe(item, status, data) {
			this.currentData = data;
			this.editItem = item;
			this.dialogForm = true;
		},
		// 删除
		delServe(data, status) {
			let params = {
				uuid: data.uuid,
				id: data.id
			};

			if (status === 'running') {
				this.$confirm(this.$t('message.deleteOrNot') + '?', {
					confirmButtonText: this.$t('message.confirm'),
					cancelButtonText: this.$t('message.cancel')
				}).then(() => {
					cluster
						.removeMonitor(params)
						.then(() => {
							this.getDataApi();
							this.$message.success(this.$t('message.deleteOK'));
						})
						.catch(() => {
							this.$message.error(this.$t('message.deleteFail'));
						});
				});
			} else {
				this.$message.error(this.$t('message.startupAfter_delete'));
			}
		},
		addServeFn(item) {
			this.currentData = item;
			this.editItem = {};
			this.dialogForm = true;
		},
		// 启动
		startFn(item, status, server) {
			if (status === 'stopped') {
				let data = {
					uuid: item.uuid,
					server: server,
					operation: 'start'
				};
				this.$confirm(this.$t('message.confirm') + ' ' + name + ' ' + this.$t('message.restartServer'), {
					confirmButtonText: this.$t('message.confirm'),
					cancelButtonText: this.$t('message.cancel'),
					closeOnClickModal: false
				}).then(() => {
					this.operationFn(data);
				});
			}
		},
		// 关闭
		closeFn(item, status, server) {
			let name;
			if (server === 'apiServer') {
				name = 'API SEVER';
			} else if (server === 'engine') {
				name = this.$t('message.syncGover');
			} else {
				name = this.$t('message.manageSys');
			}
			if (status === 'running') {
				let data = {
					uuid: item.uuid,
					server: server,
					operation: 'stop'
				};
				this.$confirm(this.$t('message.confirm') + ' ' + name + ' ' + this.$t('message.startServer'), {
					confirmButtonText: this.$t('message.confirm'),
					cancelButtonText: this.$t('message.cancel'),
					closeOnClickModal: false
				}).then(() => {
					this.operationFn(data);
				});
			}
		},
		restartFn(item, status, server) {
			let name;
			if (server === 'apiServer') {
				name = 'API SEVER';
			} else if (server === 'engine') {
				name = this.$t('message.syncGover');
			} else {
				name = this.$t('message.manageSys');
			}
			if (status === 'running') {
				let data = {
					uuid: item.uuid,
					server: server,
					operation: 'restart'
				};
				this.$confirm(this.$t('message.confirm') + ' ' + name + ' ' + this.$t('message.restartServer'), {
					confirmButtonText: this.$t('message.confirm'),
					cancelButtonText: this.$t('message.cancel'),
					closeOnClickModal: false
				}).then(() => {
					this.operationFn(data);
				});
			}
		},
		// 重启---关闭---启动
		async operationFn(data) {
			await cluster.updateStatus(data).then(res => {
				if (res.status === 200) {
					this.getDataApi();
				}
			});
		},
		// 筛选
		screenFn() {
			if (this.sourch) {
				this.getDataApi();
			} else {
				this.getDataApi();
			}
			this.sourch = '';
		},

		// 获取数据
		getDataApi() {
			let params = {};
			if (this.sourch) {
				params['filter[where][or][0][systemInfo.hostname][like]'] = this.sourch;
				params['filter[where][or][1][systemInfo.ip][like]'] = this.sourch;
			}
			// 是否能看到所有集群
			if (
				this.$window.getSettingByKey('ALLOW_DOWNLOAD_AGENT') &&
				!parseInt(this.$cookie.get('isAdmin')) &&
				localStorage.getItem('BTN_AUTHS') !== 'BTN_AUTHS'
			) {
				params['filter[where][systemInfo.username][regexp]'] = `^${this.$cookie.get('user_id')}$`;
			}
			cluster.get(params).then(res => {
				if (res.data) {
					this.list = res.data;
					let [...waterfallData] = this.list;
					let [...newWaterfallData] = [[], []];
					waterfallData.forEach((item, index) => {
						if (index % 2) {
							newWaterfallData[1].push(item);
						} else {
							newWaterfallData[0].push(item);
						}
					});
					this.waterfallData = newWaterfallData;
				}
			});
		},
		// 关闭弹窗并且清空验证
		closeDialogForm() {
			this.dialogForm = false;
			this.$refs.childRules.closeDialogForm();
		}
	},

	destroyed() {
		clearInterval(this.timer);
		this.timer = null;
	}
};
</script>
<style lang="less" scoped>
.cluster {
	width: 100%;
	height: 100%;
	font-size: 12px;
	background-color: #f8f6fa;
	.cluster-box {
		height: 100%;
		background-color: #fff;
	}

	.content {
		width: 100%;
		height: calc(100% - 60px);
		padding: 10px;
		box-sizing: border-box;
		overflow-y: auto;
		.list {
			padding: 5px 0 10px 0;
			overflow: hidden;
			box-sizing: border-box;
			.listBox {
				position: relative;
				margin-bottom: 20px;
				padding: 0 25px 10px 50px;
				background-color: #fff;
				box-shadow: 0.707px 0.707px 3px rgba(0, 0, 0, 0.13);
				.boxTop {
					padding-top: 15px;
					overflow: hidden;
					.circular {
						display: inline-block;
						position: absolute;
						left: 20px;
						top: 18px;
						width: 13px;
						height: 13px;
						border-radius: 50%;
						background-color: #f00;
					}
					.name {
						margin: 0;
						font-size: 18px;
						color: #48b6e2;
						white-space: nowrap;
						text-overflow: ellipsis;
						overflow: hidden;
					}
					.uuid {
						padding: 5px 0;
						font-size: 12px;
					}
					span {
						font-size: 14px;
						color: #555;
					}
					.addBtn {
						span {
							font-size: 12px;
						}
					}
				}
				.boxTop {
					// .el-button {
					//   span { font-size: 12px;}
					// }
				}
				.boxBottom {
					padding-top: 10px;
					.data-list {
						width: 100%;
						height: 30px;
						margin-bottom: 5px;
						line-height: 30px;
						background-color: #f0fafe;
						list-style: none;
						.txt {
							display: inline-block;
							width: 120px;
							padding-left: 15px;
							font-size: 12px;
							color: #000;
							text-overflow: ellipsis;
							white-space: nowrap;
							i {
								padding-right: 5px;
							}
						}

						.btn {
							display: inline;
						}
						.popover-tip {
							display: inline-block;
							color: #f00;
							transform: rotate(180deg);
							cursor: pointer;
						}
					}
				}
			}
		}
	}

	.screen {
		padding-right: 15px;
	}
	.red {
		color: #ee5353;
	}
	.bgred {
		background-color: #ee5353 !important;
	}
	.green {
		color: #48b6e2;
	}
	.bggreen {
		background-color: #71c179 !important;
	}
	.noText {
		display: flex;
		height: calc(100% - 60px);
		align-items: center;
		justify-content: center;
		color: #1976d2;
		font-size: 16px;
		background-color: #fff;
	}
}
</style>
<style lang="less">
.cluster {
	width: 100%;
	.content {
		padding: 10px;
		width: 100%;
		height: 100%;
		.el-row {
			margin-bottom: 20px;
		}
		.boxBottom {
			.el-button {
				padding: 4px 10px;
				font-size: 12px;
			}
		}
	}
}

.popover-box {
	color: #333;
	h5 {
		margin: 0;
		padding-bottom: 5px;
	}
	div {
		font-size: 12px;
	}
}

.serverDialog {
	.el-dialog__body {
		padding: 30px 50px 0 20px;
	}
	.el-dialog__footer {
		padding: 10px 50px 20px;
	}
}
</style>
