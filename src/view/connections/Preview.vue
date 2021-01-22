<template>
	<el-drawer
		class="connection-drawer"
		ref="drawer"
		:visible.sync="visible"
		:title="$t('dataForm.title')"
		size="40%"
		:modal="false"
		:withHeader="false"
		:before-close="handleClose"
	>
		<head data-v-4c16474d="" class="head">
			<button
				data-v-4c16474d=""
				type="button"
				class="el-button back-btn-icon-box el-button--default"
				@click="handleClose"
			>
				<span>
					<i data-v-4c16474d="" class="iconfont icon-you2 back-btn-icon"></i>
				</span>
			</button>
			<span class="back-btn-text">{{ $t('connection.info') }}</span>
		</head>
		<header class="header">
			<div class="tab">
				<div class="img-box">
					<img :src="getImgByType(type)" />
				</div>
				<div class="content">
					<div>{{ name }}</div>
					<div class="status">
						<span class="error" v-if="['invalid'].includes(status)">
							<i class="el-icon-error"></i>
							<span>
								{{ $t('connection.status.invalid') }}
							</span>
						</span>
						<span class="success" v-if="['ready'].includes(status)">
							<i class="el-icon-success"></i>
							<span>
								{{ $t('connection.status.ready') }}
							</span>
						</span>
						<span class="warning" v-if="['testing'].includes(status)">
							<i class="el-icon-warning"></i>
							<span>
								{{ $t('connection.status.testing') }}
							</span>
						</span>
						<span class="schema-load"
							>{{ $t('connection.preview.reloadName') }} :
							{{
								data.last_updated ? $moment(data.last_updated).format('YYYY-MM-DD HH:mm:ss') : ''
							}}</span
						>
					</div>
					<div class="panelBtn">
						<ul>
							<li class="item">
								<el-button
									class="btn"
									size="mini"
									v-readonlybtn="'datasource_edition'"
									:disabled="$disabledByPermission('datasource_edition_all_data', userId)"
									@click="edit(id, type)"
								>
									<i class="iconfont icon-edit"> {{ $t('connection.preview.edit') }}</i>
								</el-button>
							</li>
							<li class="item">
								<el-button
									class="btn"
									size="mini"
									v-readonlybtn="'datasource_edition'"
									@click="reload()"
									:disabled="
										$disabledByPermission('datasource_edition_all_data', userId) ||
											!['ready'].includes(this.status)
									"
								>
									<i class="iconfont icon-kujitongbucopy">{{
										$t('connection.preview.reloadName')
									}}</i>
								</el-button>
							</li>
							<li class="item">
								<el-button
									class="btn"
									size="mini"
									v-readonlybtn="'datasource_edition'"
									:disabled="$disabledByPermission('datasource_edition_all_data', userId)"
									@click="beforeTest(id)"
								>
									<i class="iconfont icon-lianjie1"> {{ $t('connection.preview.test') }} </i>
								</el-button>
							</li>
						</ul>
					</div>
				</div>
			</div>
			<el-progress
				type="line"
				class="test-progress"
				:text-inside="true"
				:stroke-width="26"
				:percentage="progress"
				v-if="showProgress"
			></el-progress>
		</header>
		<ul class="info-list">
			<li v-for="item in form" :key="item.label" v-show="item.show">
				<span class="label">{{ item.label }}</span>
				<span class="value align-center" :class="{ 'align-top': item.label && item.label.length > 15 }">{{
					item.value
				}}</span>
			</li>
			<li v-show="data.database_port && data.database_type !== 'file'">
				<span class="label">{{ $t('dataForm.form.port') }}</span>
				<span class="value align-center"> {{ data.database_port }}</span>
			</li>
			<div
				v-for="(item, index) in data.file_sources"
				:key="index"
				v-show="
					data.database_type === 'file' &&
						data.connection_type === 'source' &&
						data.file_sources &&
						data.file_sources[0].path
				"
			>
				<li>
					<span class="label">{{ $t('dataForm.form.file.fileUrl') + (index + 1) }}</span>
					<span class="value align-center"> {{ item.path }}</span>
				</li>
				<li>
					<span class="label">{{ $t('dataForm.form.file.recursive') }}</span>
					<span class="value align-center"> {{ item.recursive }}</span>
				</li>
			</div>
		</ul>
		<Test
			ref="test"
			:dialogTestVisible.sync="dialogTestVisible"
			:formData="data"
			@returnTestData="returnTestData"
		></Test>
	</el-drawer>
</template>

<script>
import { getImgByType } from './util';
import formConfig from './config';
import Test from './Test';

export default {
	name: 'Preview',
	components: { Test },
	props: {
		id: {
			required: true,
			value: String
		},
		databaseType: {
			required: true,
			value: String
		},
		visible: {
			required: true,
			value: String
		}
	},
	data() {
		return {
			form: {},
			data: {},
			name: '',
			type: '',
			status: '',
			progress: 0,
			timer: null,
			showProgress: false,
			dialogTestVisible: false,
			userId: ''
		};
	},
	watch: {
		visible: {
			handler() {
				if (this.visible) {
					this.getData(this.id, this.databaseType);
				}
				this.showProgress = false;
			}
		}
	},
	beforeDestroy() {
		this.clearInterval();
	},
	destroyed() {
		this.form = {};
		this.clearInterval();
	},
	methods: {
		getImgByType,
		returnTestData(data) {
			if (!data.status || data.status === null) return;
			this.status = data.status;
		},
		clearInterval() {
			// 清除定时器
			clearInterval(this.timer);
			this.timer = null;
		},
		async getData(id, type) {
			let result = null;
			if (['mongodb', 'gridfs'].includes(type)) {
				result = await this.$api('connections').customQuery([id]);
			} else {
				result = await this.$api('connections').get([id]);
			}
			if (result && result.data) {
				let data = result.data;
				this.data = result.data;
				this.name = data.name;
				this.type = data.database_type;
				this.status = data.status;
				this.userId = data.user_id;
				this.loadFieldsStatus = data.loadFieldsStatus;
				if (['ready'].includes(this.status) && data.loadFieldsStatus !== 'finished' && data.tableCount) {
					this.progress = Math.round((data.loadCount / data.tableCount) * 10000) / 100;
					this.showProgress = true;
					this.reloadApi();
				}
				let func = formConfig[this.type];
				if (func) {
					let config = func(this);
					let items = config.items.map(it => {
						let node = {
							label: it.label,
							value: data[it.field] || '-',
							field: it.field,
							show: true
						};
						return node;
					});
					items = items || [];
					items = items.filter(item => item.label); //清掉undefined

					// 文件预览显示
					if (data.database_type === 'file') {
						items.forEach(el => {
							if (data.connection_type === 'target') {
								if (data.file_source_protocol === 'localFile') {
									if (
										![
											'file_source_protocol',
											'fileDefaultCharset',
											'connection_type',
											'vc_mode',
											'file_upload_chunk_size',
											'file_upload_mode',
											'overwriteSetting',
											'extendSourcePath',
											'outputPath'
										].includes(el.field)
									) {
										el.show = false;
									}
								} else if (data.file_source_protocol === 'ftp') {
									if (
										![
											'file_source_protocol',
											'fileDefaultCharset',
											'connection_type',
											'vc_mode',
											'database_host',
											'database_port',
											'database_username',
											'plain_password',
											'ftp_passive',
											'connection_timeout_seconds',
											'data_timeout_seconds',
											'file_upload_chunk_size',
											'file_upload_mode',
											'overwriteSetting',
											'extendSourcePath',
											'outputPath'
										].includes(el.field)
									) {
										el.show = false;
									}
								} else {
									if (
										![
											'file_source_protocol',
											'fileDefaultCharset',
											'connection_type',
											'vc_mode',
											'database_host',
											'database_port',
											'database_username',
											'plain_password',
											'file_upload_chunk_size',
											'file_upload_mode',
											'overwriteSetting',
											'extendSourcePath',
											'outputPath'
										].includes(el.field)
									) {
										el.show = false;
									}
								}
							} else {
								if (data.file_source_protocol === 'localFile') {
									if (
										![
											'file_source_protocol',
											'fileDefaultCharset',
											'connection_type',
											'vc_mode'
										].includes(el.field)
									) {
										el.show = false;
									}
								} else if (data.file_source_protocol === 'ftp') {
									if (
										![
											'file_source_protocol',
											'fileDefaultCharset',
											'connection_type',
											'vc_mode',
											'database_host',
											'database_port',
											'database_username',
											'plain_password',
											'ftp_passive',
											'connection_timeout_seconds',
											'data_timeout_seconds'
										].includes(el.field)
									) {
										el.show = false;
									}
								} else {
									if (
										![
											'file_source_protocol',
											'fileDefaultCharset',
											'connection_type',
											'vc_mode',
											'database_host',
											'database_port',
											'database_username',
											'plain_password'
										].includes(el.field)
									) {
										el.show = false;
									}
								}
							}
						});
					}
					this.form = items;
				}
			}
		},
		handleClose() {
			this.form = {};
			this.clearInterval();
			this.$emit('previewVisible', false);
		},
		async beforeTest() {
			let result = await this.$api('Workers').getAvailableAgent();
			if (!result.data.result || result.data.result.length === 0) {
				this.$message.error(this.$t('dataForm.form.agentMsg'));
			} else {
				//先将管理端状态改为testing
				this.$api('connections')
					.updateById(this.data.id, {
						status: 'testing'
					})
					.then(() => {
						this.dialogTestVisible = true;
						this.$refs.test.start();
					});
			}
		},
		edit(id, type) {
			if (
				[
					'mysql',
					'oracle',
					'mongodb',
					'sqlserver',
					'postgres',
					'elasticsearch',
					'redis',
					'db2',
					'file',
					'kafka',
					'maria',
					'mysqlpxc'
				].includes(type)
			) {
				this.$router.push('connections/' + id + '/edit?databaseType=' + type);
			} else {
				top.location.href = '/#/connection/' + id;
				localStorage.setItem('connectionDatabaseType', type);
			}
		},
		async reload() {
			let result = await this.$api('Workers').getAvailableAgent();
			if (!result.data.result || result.data.result.length === 0) {
				this.$message.error(this.$t('dataForm.form.agentMsg'));
			} else {
				let config = {
					title: this.$t('connection.reloadTittle'),
					Message: this.$t('connection.reloadMsg'),
					confirmButtonText: this.$t('message.confirm'),
					cancelButtonText: this.$t('message.cancel'),
					name: this.data.name,
					id: this.data.id
				};
				this.confirm(
					() => {
						this.showProgress = true;
						this.progress = 0;
						this.reloadApi('first');
					},
					() => {},
					config
				);
			}
		},
		confirm(callback, catchCallback, config) {
			this.$confirm(config.Message + config.name + '?', config.title, {
				confirmButtonText: config.confirmButtonText,
				cancelButtonText: config.cancelButtonText,
				type: 'warning',
				closeOnClickModal: false
			})
				.then(callback)
				.catch(catchCallback);
		},
		reloadApi(type) {
			this.clearInterval();
			let parms;
			if (type === 'first') {
				parms = {
					loadCount: 0,
					loadFieldsStatus: 'loading'
				};
				this.loadFieldsStatus = 'loading';
			}
			this.$api('connections')
				.updateById(this.data.id, parms)
				.then(result => {
					if (result.data) {
						let data = result.data;
						this.loadFieldsStatus = data.loadFieldsStatus; //同步reload状态
						if (type === 'first') {
							this.$refs.test.start(true);
						}
						if (data.loadFieldsStatus === 'finished') {
							this.progress = 100;
							setTimeout(() => {
								this.showProgress = false;
								this.progress = 0; //加载完成
							}, 800);
						} else {
							let progress = Math.round((data.loadCount / data.tableCount) * 10000) / 100;
							this.progress = progress ? progress : 0;
							this.timer = setInterval(() => {
								this.reloadApi();
							}, 800);
						}
					}
				})
				.catch(() => {
					this.$message.error(this.$t('connection.reloadFail'));
					this.showProgress = false;
					this.progress = 0; //加载完成
				});
		},
		//test
		handleTestVisible() {
			this.dialogTestVisible = false;
		},
		//检测agent 是否可用
		async checkTestConnectionAvailable() {
			let result = await this.$api('Workers').getAvailableAgent();
			if (!result.data.result || result.data.result.length === 0) {
				this.$message.error(this.$t('dataForm.form.agentMsg'));
			}
		}
	}
};
</script>

<style scoped lang="less">
.connection-drawer {
	.header {
		display: flex;
		flex-direction: column;
		margin: 20px 0;
		border-bottom: 1px solid #eee;
	}
	.test-progress {
		width: 94.5%;
		margin: 0 10px 10px 30px;
	}
	.tab {
		display: flex;
		justify-content: flex-start;
		padding-bottom: 10px;
		padding-top: 10px;
		.img-box {
			display: flex;
			width: 60px;
			height: 60px;
			justify-content: center;
			align-items: center;
			background: #fff;
			//border: 1px solid #dedee4;
			border-radius: 3px;
			margin-left: 30px;
			margin-right: 20px;
			img {
				width: 100%;
			}
		}
		.content {
			margin-left: 10px;
			font-weight: 500;
			margin-top: 4px;
			width: 100%;
		}
		.status {
			font-size: 12px;
			padding-bottom: 2px;
			margin-top: 4px;
			border-top-width: 2px;
			.error {
				color: #f56c6c;
			}
			.success {
				color: #67c23a;
			}
			.warning {
				color: #e6a23c;
			}
		}
		.panelBtn {
			display: flex;
			align-items: center;
			width: 60%;
			margin-top: 10px;
			.item {
				margin-right: 10px;
				float: right;
			}
			.iconfont {
				display: inline-block;
				font-size: 12px;
				transform: rotate(00deg);
			}
		}
		.panelBtn:hover {
			color: #48b6e2;
		}
		.btn + .btn {
			margin-left: 5px;
		}
		.btn {
			padding: 4px 7px;
			background: #f5f5f5;
			i.iconfont {
				font-size: 12px;
			}
		}
	}
	.label {
		color: #999;
		font-size: 12px;
		display: inline-block;
		width: 110px;
		margin-right: 15px;
		text-align: right;
	}
	.value {
		width: 62%;
		color: #666;
		font-size: 12px;
		display: inline-block;
		word-break: break-all;
	}
	.align-top {
		vertical-align: top;
	}
	.align-center {
		vertical-align: center;
	}
	.schema-load {
		color: #999;
		display: inline-block;
		margin-left: 20px;
		font-size: 12px;
		font-weight: normal;
	}
	.info-list {
		overflow-y: auto;
		max-height: 690px;
		margin: 0 auto;
		margin-left: 56px;
		width: 100%;
		li {
			margin-bottom: 20px;
		}
	}
	.head {
		display: block !important;
		width: 100%;
		height: 30px;
		background: #f5f5f5;
		border-bottom: 1px solid #dedee4;
	}
	.back-btn-icon-box {
		width: 30px;
		height: 30px;
		margin: 0;
		padding: 0;
		line-height: 1;
		font-weight: normal;
		font-size: 14px;
		color: red;
		text-align: center;
		white-space: nowrap;
		cursor: pointer;
		outline: 0;
		border: 0;
		border-radius: 0;
		box-sizing: border-box;
		background: #48b6e2;
		transition: 0.1s;
		-webkit-appearance: none;
		-webkit-box-sizing: border-box;
		-webkit-transition: 0.1s;
	}
	.back-btn-icon-box:hover {
		background: #6dc5e8;
	}
	.back-btn-icon {
		color: #fff;
	}
	.back-btn-text {
		font-size: 12px;
	}
}
</style>
<style lang="less">
.connection-drawer {
	.el-drawer {
		box-shadow: -2px 0px 8px 0px rgba(0, 0, 0, 0.1);
	}
	.el-drawer.rtl {
		top: 48px;
	}
}
.test-progress {
	.el-progress-bar__outer {
		border-radius: 0;
	}
	.el-progress-bar__inner {
		border-radius: 0;
	}
	margin-bottom: 10px;
}
</style>
