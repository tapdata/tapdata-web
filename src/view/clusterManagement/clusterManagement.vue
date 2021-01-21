<template>
	<section class="clusterManagement-container">
		<div class="header">
			<div class="page-header-title">
				<span class="title">{{ $t('message.serviceCluMange') }}</span>
				<div class="logBtn" v-readonlybtn="'status_log'" @click="goDailyRecord">
					{{ $t('message.statusLog') }}
				</div>
			</div>
		</div>
		<div class="main">
			<ul class="search-bar">
				<li>
					<el-input
						clearable
						size="mini"
						v-model="sourch"
						:debounce="800"
						:placeholder="$t('message.placeholderServer')"
						@input="screenFn"
					>
					</el-input>
				</li>
				<li>
					<el-button type="text" class="restBtn" size="mini" @click="rest()">
						{{ $t('dataFlow.reset') }}
					</el-button>
				</li>
			</ul>
			<div class="content" v-if="waterfallData.length > 0">
				<el-row :gutter="20" class="waterfall">
					<el-col class="list" :md="12" :sm="24" v-for="(element, i) in waterfallData" :key="i">
						<div class="grid-content listBox" v-for="item in element" :key="item.ip">
							<div class="boxTop">
								<div class="fl" style="width: 60%;">
									<i class="circular" :class="item.status !== 'running' ? 'bgred' : 'bggreen'"></i>
									<h2 class="name">
										{{ item.agentName ? item.agentName : item.systemInfo.hostname }}
									</h2>
									<span>{{ item.systemInfo.ip }}</span>
									<span class="uuid">{{ item.systemInfo.uuid }}</span>
								</div>
								<div class="operation-bar">
									<i
										class="iconfont icon-icon_tianjia"
										v-if="managementType === 'cluster'"
										v-readonlybtn="'Cluster_operation'"
										@click="addServeFn(item)"
									></i>
									<i class="iconfont icon-icon_shezhi" @click="editAgent(item)"></i>
									<i
										v-show="item.status !== 'running'"
										class="iconfont icon-shanchu"
										@click="delConfirm(item)"
									></i>
								</div>
							</div>
							<div class="boxBottom">
								<el-row :gutter="20" class="data-list" v-if="managementType === 'cluster'">
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
												size="mini"
												:type="item.management.status == 'stopped' ? 'primary' : 'info'"
												:disabled="item.management.status == 'stopped' ? false : true"
												@click="startFn(item, item.management.status, 'management', 'start')"
												>{{ $t('message.startUp') }}</el-button
											>
											<el-button
												size="mini"
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
												size="mini"
												:type="item.engine.status == 'stopped' ? 'primary' : 'info'"
												:disabled="item.engine.status == 'stopped' ? false : true"
												@click="startFn(item, item.engine.status, 'engine')"
												>{{ $t('message.startUp') }}</el-button
											>
											<el-button
												size="mini"
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
								<el-row :gutter="20" class="data-list" v-if="managementType === 'cluster'">
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
												size="mini"
												:type="item.apiServer.status == 'stopped' ? 'primary' : 'info'"
												:disabled="item.apiServer.status == 'stopped' ? false : true"
												@click="startFn(item, item.apiServer.status, 'apiServer')"
												>{{ $t('message.startUp') }}</el-button
											>
											<el-button
												size="mini"
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
									<el-col :span="7" :offset="5" v-readonlybtn="'Cluster_operation'">
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
		<el-dialog
			:title="$t('message.agentSetting')"
			custom-class="serverDialog"
			:visible.sync="editAgentDialog"
			:lock-scroll="false"
			:close-on-click-modal="false"
			width="600px"
			@close="editAgentDialog = false"
		>
			<el-form ref="editAgentForm" label-width="100px" class="editAgentForm">
				<el-form-item :label="$t('message.serverName')">
					<div class="name-box">
						<el-input
							style="width: 85%"
							v-model="agentName"
							size="mini"
							show-word-limit
							:placeholder="$t('message.placeholderMonServer')"
						></el-input>
						<span class="restBtn" @click="editNameRest">还原</span>
					</div>
				</el-form-item>
				<el-form-item :label="$t('message.iPDisplay')" prop="command">
					<el-select v-model="custIP" :placeholder="$t('message.iPDisplay')" size="mini" style="width: 85%">
						<el-option v-for="item in ips" :key="item" :label="item" :value="item"> </el-option>
					</el-select>
					<div class="ipTip">{{ $t('message.ipTip') }}</div>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button size="small" @click="editAgentDialog = false">{{ $t('message.cancel') }}</el-button>
				<el-button size="small" type="primary" @click="submitEditAgent('editAgentForm')">{{
					$t('message.confirm')
				}}</el-button>
			</div>
		</el-dialog>
		<el-dialog
			:title="$t('message.delTittle')"
			:close-on-click-modal="false"
			:visible.sync="deleteDialogVisible"
			width="30%"
		>
			<p>
				{{ $t('message.delMessage') }}
				<span style="color:#48B6E2;cursor: pointer">
					{{ delData.agentName }}
				</span>
				?
			</p>
			<span slot="footer" class="dialog-footer">
				<el-button @click="deleteDialogVisible = false" size="mini">{{ $t('message.cancel') }}</el-button>
				<el-button type="primary" @click="removeNode(delData)" size="mini">{{
					$t('message.confirm')
				}}</el-button>
			</span>
		</el-dialog>
	</section>
</template>
<script>
import { delayTrigger } from '../../util/util';
import addServe from './component/addServe';
import factory from '../../api/factory';
const cluster = factory('cluster');
export default {
	components: {
		addServe
	},
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
			editItem: {},
			timer: null,
			downLoadAgetntdialog: false,
			editAgentDialog: false,
			deleteDialogVisible: false,
			downLoadNum: 0,
			ips: [],
			custIP: '',
			custId: '',
			agentName: '',
			currentNde: {},
			delData: '',
			managementType: window.getSettingByKey('SHOW_CLUSTER_OR_AGENT')
		};
	},
	created() {
		this.getDataApi();
		// 这是一个定时器
		// TODO 集群管理轮询替换成webstocek
		let that = this;
		this.timer = setInterval(() => {
			that.getDataApi();
		}, 10000);
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
			delayTrigger(() => {
				this.getDataApi();
			}, 800);
		},
		// 获取数据
		getDataApi() {
			let params = { index: 1 };
			if (this.sourch) {
				params['filter[where][or][0][systemInfo.hostname][like]'] = this.sourch;
				params['filter[where][or][1][systemInfo.ip][like]'] = this.sourch;
			}
			cluster.get(params).then(res => {
				if (res.data) {
					let [...waterfallData] = res.data;
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
		},
		//删除agent
		delConfirm(data) {
			this.deleteDialogVisible = true;
			this.delData = data;
			this.delData.agentName = this.delData.agentName || this.delData.systemInfo.hostname;
		},
		removeNode(id) {
			this.$api('cluster')
				.delete(id)
				.then(() => {
					this.deleteDialogVisible = false;
					this.$message.success('删除成功');
				})
				.catch(() => {
					this.$message.error('删除失败');
				});
		},
		//编辑
		editAgent(item) {
			this.editAgentDialog = true;
			this.custId = item.id;
			this.custIP = item.systemInfo.ip;
			this.ips = item.systemInfo.ips || [];
			this.agentName = item.agentName || item.systemInfo.hostname;
			this.currentNde = item.systemInfo;
		},
		//提交编辑
		submitEditAgent() {
			if (this.agentName === '') {
				this.agentName = this.currentNde.hostname;
				this.$message.error(this.$t('dataForm.form.connectionName') + this.$t('formBuilder.noneText'));
				return;
			}
			let data = {
				custIP: this.custIP,
				agentName: this.agentName
			};
			this.$api('cluster')
				.editAgent(this.custId, data)
				.then(() => {
					this.editAgentDialog = false;
					this.$message.success('编辑成功');
				})
				.catch(() => {
					this.$message.error('编辑失败');
				});
		},
		editNameRest() {
			this.agentName = this.currentNde.hostname;
		},
		//运行日志
		goDailyRecord() {
			this.$router.push('/dailyRecord');
		}
	}
};
</script>
<style lang="less" scoped>
.clusterManagement-container {
	display: flex;
	flex-direction: column;
	height: 100%;
	background: #fafafa;
	.header {
		padding: 15px 10px;
		background: #ffffff;
		overflow: hidden;
		border-bottom: 1px solid #dedee4;
		box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.1);
		box-sizing: border-box;
		.title {
			font-size: 16px;
			color: #333;
			font-weight: 600;
		}
		.logBtn {
			font-size: 14px;
			color: #48b6e2;
			cursor: pointer;
			float: right;
		}
	}
	.main {
		flex: 1;
		padding: 10px;
		display: flex;
		overflow: hidden;
		flex-direction: column;
		.search-bar {
			display: flex;
			li + li {
				margin-left: 10px;
			}
		}
		.content {
			width: 100%;
			padding: 10px;
			box-sizing: border-box;
			overflow-y: auto;
			.list {
				padding: 5px 0 10px 0;
				padding-left: 0;
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
						display: flex;
						flex-direction: row;
						justify-content: space-between;
						.iconfont {
							color: #999;
							cursor: pointer;
							margin-left: 5px;
						}
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
							color: #999;
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
							margin-bottom: 5px;
							line-height: 35px;
							background-color: #f0fafe;
							list-style: none;
							.txt {
								display: inline-block;
								width: 120px;
								//padding-left: 15px;
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
		}
	}
	.noText {
		display: flex;
		height: calc(100% - 60px);
		align-items: center;
		justify-content: center;
		color: #48b6e2;
		font-size: 16px;
		background-color: #fff;
	}
	.editAgentForm {
		.restBtn {
			display: inline-block;
			margin-left: 10px;
			color: #48b6e2;
			cursor: pointer;
		}
		.ipTip {
			color: #999;
			font-size: 12px;
			line-height: 15px;
		}
	}
}
</style>
<style lang="less">
.clusterManagement-container {
	.editAgentForm {
		.el-form-item {
			margin-bottom: 5px;
		}
	}
}
</style>
