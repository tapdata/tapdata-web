<template>
	<el-drawer
		class="drawer"
		ref="drawer"
		:visible.sync="visible"
		:title="$t('dataForm.title')"
		:append-to-body="true"
		size="40%"
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
					</div>
				</div>
				<div class="panelBtn">
					<ul>
						<li class="item">
							<el-button class="btn" size="mini" @click="edit(id, type)">
								<i class="iconfont icon-edit"> {{ $t('connection.preview.edit') }}</i>
							</el-button>
						</li>
						<li class="item">
							<el-button class="btn" size="mini" @click="reload()">
								<i class="iconfont icon-kujitongbucopy">{{ $t('connection.preview.reloadName') }}</i>
							</el-button>
						</li>
						<li class="item">
							<el-button class="btn" size="mini" @click="beforeTest(id)">
								<i class="iconfont icon-lianjie1"> {{ $t('connection.preview.test') }} </i>
							</el-button>
						</li>
					</ul>
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
			<li v-for="item in form" :key="item.label">
				<span class="label">{{ item.label }}</span>
				<span class="value">{{ item.value }}</span>
			</li>
		</ul>
		<Test
			@dialogTestVisible="handleTestVisible"
			:dialogTestVisible="testData.dialogTestVisible"
			:testData="testData"
		></Test>
	</el-drawer>
</template>

<script>
import { getImgByType, handleProgress } from './util';
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
			testData: {
				testLogs: null,
				testResult: '',
				progress: 0,
				dialogTestVisible: false
			}
		};
	},
	watch: {
		visible: {
			handler() {
				if (this.visible) {
					this.getData(this.id, this.databaseType);
				}
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
				if (
					!data.loadCount &&
					!data.tableCount &&
					data.tableCount !== 0 &&
					!['invalid'].includes(this.status)
				) {
					let progress = Math.round((data.loadCount / data.tableCount) * 10000) / 100;
					this.progress = progress ? progress : 0;
					if (this.progress !== 100) {
						this.showProgress = true;
					}
				}
				let func = formConfig[this.type];
				if (func) {
					let config = func(this);
					let items = config.items.map(it => {
						let node = {
							label: it.label,
							value: data[it.field]
						};
						return node;
					});
					//过滤value空值 undefined
					items = items || [];
					items = items.filter(item => item.value && item.value !== '');
					this.form = items;
				}
			}
		},
		handleClose() {
			this.form = {};
			this.clearInterval();
			this.$emit('previewVisible', false);
		},
		beforeTest(id) {
			let params = {
				response_body: {},
				status: 'testing',
				id: id
			};
			this.$api('connections')
				.patchId(params)
				.then(() => {
					this.testData.dialogTestVisible = true;
					this.test(id);
				});
		},
		async test(id) {
			let result = null;
			this.testData.testResult = this.status['testing'];
			this.testData.estLogs = [];
			this.clearInterval();
			if (this.data.database_type === 'mongodb') {
				result = await this.$api('connections').customQuery([this.data.id]);
			} else {
				result = await this.$api('connections').get([this.data.id]);
			}
			if (result.data) {
				const data = result.data;
				let validate_details = data.response_body && data.response_body.validate_details;
				this.testData.testLogs = validate_details || [];
				this.testData.testResult = this.status[data.status] || this.status['testing'];
				this.testData.progress = handleProgress(this.testData.testLogs);
				if (['testing'].includes(data.status)) {
					this.timer = setInterval(() => {
						this.test(id);
					}, 3000);
				}
			}
		},
		edit(id, type) {
			if (
				['mysql', 'oracle', 'mongodb', 'sqlserver', 'postgres', 'elasticsearch', 'redis', 'db2'].includes(type)
			) {
				this.$router.push('connections/create?id=' + id + '&databaseType=' + type);
			} else {
				top.location.href = '/#/connection/' + id;
				localStorage.setItem('connectionDatabaseType', type);
			}
		},
		reload() {
			this.progress = 0;
			this.showProgress = false;
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
					this.$api('connections')
						.updateById(this.data.id, {
							status: 'testing',
							name: this.data.name
						})
						.then(result => {
							if (result.data) {
								let data = result.data;
								if (
									!data.loadCount &&
									!data.tableCount &&
									data.tableCount !== 0 &&
									!['invalid'].includes(this.status)
								) {
									let progress = Math.round((data.loadCount / data.tableCount) * 10000) / 100;
									this.progress = progress ? progress : 0;
									if (this.progress !== 100) {
										this.showProgress = true;
									}
								}
							}
						})
						.catch(() => {
							this.$message.error(this.$t('connection.reloadFail'));
						});
				},
				() => {},
				config
			);
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
		//test
		handleTestVisible() {
			this.testData.dialogTestVisible = false;
		}
	}
};
</script>

<style scoped lang="less">
.drawer {
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
			width: 54px;
			height: 54px;
			justify-content: center;
			align-items: center;
			background: #fff;
			border: 1px solid #dedee4;
			border-radius: 3px;
			margin-left: 30px;
			img {
				width: 60%;
			}
		}
		.content {
			margin-left: 10px;
			font-weight: 500;
			margin-top: 4px;
			width: 60%;
		}
		.status {
			font-size: 12px;
			margin-top: 2px;
			.error {
				color: #d54e21;
			}
			.success {
				color: #0ab300;
			}
			.warning {
				color: #e6a23c;
			}
		}
		.panelBtn {
			display: flex;
			align-items: center;
			width: 60%;
			justify-content: flex-end;
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
			padding: 7px;
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
		width: 200px;
		margin-right: 10px;
		text-align: right;
	}
	.value {
		width: 62%;
		color: #666;
		font-size: 12px;
		display: inline-block;
		word-break: break-all;
	}
	.info-list {
		overflow-y: auto;
		max-height: 640px;
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
