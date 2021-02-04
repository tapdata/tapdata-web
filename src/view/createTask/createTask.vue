<template>
	<el-container class="CT-task-wrap" v-if="steps[activeStep]">
		<el-container style="overflow: hidden;flex: 1;">
			<el-header class="step-header" height="42px">
				<span>创建同步任务</span>
				<ul class="step-box">
					<li v-for="(step, index) in steps" :key="index" :class="{ active: activeStep >= index }">
						<span class="step-index">{{ index + 1 }}</span>
						<span>{{ step.text }}</span>
					</li>
				</ul>
			</el-header>
			<el-container style="overflow: hidden;flex: 1;">
				<el-container>
					<el-main class="CT-task-main">
						<!-- 步骤1 -->
						<div class="body" v-if="steps[activeStep].index === 1">
							<div class="title">选择实例</div>
							<div class="desc">
								用户需要先选择一个实例用于运行同步任务，任务创建后不支持更换实例，如果需要创建新的实例请点击创建实例
							</div>
							<form-builder ref="instance" v-model="instanceModel" :config="config"></form-builder>
						</div>
						<!--步骤2-->
						<div class="body" v-if="steps[activeStep].index === 2">
							<div class="title">选择源端与目标端连接</div>
							<div class="desc">
								选择已创建的源端/目标端的数据库连接，具体的源端与目标端库的支持类型请参考右侧说明或点击查看帮助文档,
								点击此处创建数据连接
							</div>
							<form-builder ref="dataSource" v-model="dataSourceModel" :config="config">
								<div slot="source">源端连接</div>
								<div slot="target">目标端连接</div>
							</form-builder>
						</div>
						<!-- 步骤3 -->
						<div class="body step-3" v-if="steps[activeStep].index === 3">
							<div class="title">任务设置</div>
							<div class="desc">
								用户可以在任务设置步骤对任务名称、同步类型、遇错处理等进行设置，具体配置说明请查看帮助文档
							</div>
							<form-builder ref="setting" v-model="settingModel" :config="config">
								<div slot="needToCreateIndex">
									自动DDL操作支持字段和索引的重命名以及新增、删除、更新等操作
								</div>
							</form-builder>
						</div>
						<!-- 步骤4 -->
						<div class="body step-4" v-if="steps[activeStep].index === 4">
							<div class="title">映射设置</div>
							<div class="desc">
								用户可以在此页面勾选源端待同步表，点击中间向右的箭头按钮，将这些表移动到待同步表队列中（任务执行后将对这些表执行同步传输），鼠标移入表名可以对表进行改名操作，点击完成按钮即成功创建同步任务。
							</div>
							<div class="CT-task-transfer">
								<Transfer ref="transfer" :transferData="transferData"></Transfer>
							</div>
						</div>
					</el-main>
					<el-footer class="CT-task-footer" height="80px">
						<el-button class="btn-step" v-if="steps[activeStep].index > 1" @click="back()">
							{{ $t('guide.btn_back') }}
						</el-button>
						<el-button
							v-if="steps[activeStep].index !== 4"
							type="primary"
							class="btn-step"
							:loading="loading"
							@click="next()"
						>
							<span>{{ $t('guide.btn_next') }}</span>
						</el-button>
						<el-button v-else type="primary" class="btn-step" :loading="loading" @click="save()">
							完成
						</el-button>
					</el-footer>
				</el-container>
			</el-container>
		</el-container>
	</el-container>
</template>
<script>
import formConfig from './config';
import Transfer from '@/components/Transfer';
import _ from 'lodash';
import { SETTING_MODEL, DATASOURCE_MODEL } from './util';
import { uuid } from '../../editor/util/Schema';

export default {
	components: { Transfer },
	data() {
		return {
			loading: false,
			logoUrl: window._TAPDATA_OPTIONS_.logoUrl,
			steps: [],
			activeStep: 0,
			errorMsg: '',
			showConnectDialog: false,
			instanceModel: {},
			dataSourceModel: _.cloneDeep(DATASOURCE_MODEL),
			settingModel: _.cloneDeep(SETTING_MODEL),
			mappingModel: {},
			stepMap: {
				2: {
					title: this.$t('guide.step_2_title'),
					desc: this.$t('guide.step_2_desc'),
					selectedConnection: {},
					connectionList: [],
					btnLabel: this.$t('guide.step_2_btn_label')
				},
				3: {
					title: this.$t('guide.step_3_title'),
					desc: this.$t('guide.step_3_desc'),
					selectedConnection: {},
					connectionList: [],
					btnLabel: this.$t('guide.step_3_btn_label')
				}
			},
			config: {
				form: {
					labelPosition: 'right',
					labelWidth: '200px',
					itemStyle: 'margin-bottom: 16px;',
					size: 'small'
				},
				items: []
			},
			transferData: '',
			taskType: 'cluster-clone',
			dialogTestVisible: false,
			status: '',
			mdHtml: ''
		};
	},
	created() {
		this.getSteps(false);
		this.getFormConfig();
		//this.intiData();
	},
	methods: {
		//初始化数据
		intiData() {
			let id = '601bed336cada30058b2c49b';
			this.$api('DataFlows')
				.get([id])
				.then(result => {
					if (result && result.data) {
						this.settingModel = result.data.setting;
						let stages = result.data.stages;
						this.dataSourceModel.s_connectionId = stages[0].connectionId;
						this.dataSourceModel.t_connectionId = stages[1].connectionId;
						this.transferData = {
							table_prefix: stages[1].table_prefix,
							table_suffix: stages[1].table_suffix,
							selectSourceArr: stages[1].syncObjects[0].objectNames
						};
					}
				});
		},
		// 是否是企业版
		getSteps(hasDownloadAgent) {
			const steps = [
				{ index: 1, text: '选择实例', type: 'instance' },
				{ index: 2, text: '选择源端与目标端连接', type: 'dataSource' },
				{ index: 3, text: '任务设置', type: 'setting' },
				{ index: 4, text: '映射设置', type: 'mapping' }
			];
			if (hasDownloadAgent) {
				this.steps = steps.slice(1, 4);
			} else {
				this.steps = steps.concat();
			}
		},
		next() {
			this.activeStep += 1;
			let type = this.steps[this.activeStep].type || 'instance';
			this.getFormConfig();
			this.$nextTick(() => {
				if (type === 'mapping') {
					let id = this.dataSourceModel.s_connectionId || '';
					this.$refs.transfer.getTable(id);
				}
			});
		},
		back() {
			this.activeStep -= 1;
			this.getFormConfig();
			//将复制表内容存起来
			this.transferData = this.$refs.transfer.returnData();
		},
		// 根据步骤获取不同的表单项目
		getFormConfig() {
			let type = this.steps[this.activeStep].type || 'instance';
			if (type === 'dataSource') {
				this.getConnection();
			}
			let func = formConfig[type];
			if (func) {
				let config = func(this);
				this.config = config;
			}
		},
		//获取数据源
		getConnection() {
			this.$api('connections')
				.get({
					filter: JSON.stringify({
						where: {
							database_type: { nin: ['file', 'dummy', 'gridfs', 'rest api', 'custom_connection'] }
						},
						fields: {
							name: 1,
							id: 1,
							database_type: 1,
							connection_type: 1,
							status: 1
						},
						order: ['status DESC', 'name ASC']
					})
				})
				.then(data => {
					this.changeConfig(data.data || []);
				});
		},
		//change config
		changeConfig(data) {
			let items = this.config.items;
			let s_connectionId = items.find(it => it.field === 's_connectionId');
			if (s_connectionId) {
				s_connectionId.options = data.map(item => {
					return {
						id: item.id,
						name: item.name,
						label: item.name,
						value: item.id
					};
				});
			}
			let t_connectionId = items.find(it => it.field === 't_connectionId');
			if (t_connectionId) {
				t_connectionId.options = data.map(item => {
					return {
						id: item.id,
						name: item.name,
						label: item.name,
						value: item.id
					};
				});
			}
		},
		//save
		save() {
			let postData = {
				name: this.settingModel.name,
				description: '',
				status: 'draft',
				executeMode: 'normal',
				category: '数据库克隆',
				stopOnError: false,
				mappingTemplate: 'cluster-clone',
				stages: [],
				setting: this.settingModel,
				dataFlowType: 'normal' //区分创建方式
			};
			let stageDefault = {
				connectionId: '',
				dataQualityTag: false,
				distance: 1,
				freeTransform: false,
				id: '',
				inputLanes: [],
				joinTables: [],
				name: '',
				outputLanes: [],
				type: ''
			};
			let source = this.dataSourceModel;
			let target = this.dataSourceModel;
			let sourceId = uuid();
			let targetId = uuid();
			this.transferData = this.$refs.transfer.returnData();
			//第四步 数据组装
			let selectTable = [];
			if (this.transferData && this.transferData.selectSourceArr.length > 0) {
				selectTable.push({
					objectNames: this.transferData.selectSourceArr,
					type: 'table'
				});
			}
			postData.stages = [
				Object.assign({}, stageDefault, {
					id: sourceId,
					connectionId: source.s_connectionId,
					outputLanes: [targetId],
					distance: 1,
					name: 'table',
					type: 'database',
					database_type: 'mysql',
					dropType: 'no_drop',
					readBatchSize: 1000,
					readCdcInterval: 500
				}),
				Object.assign({}, stageDefault, {
					id: targetId,
					connectionId: target.t_connectionId,
					inputLanes: [sourceId],
					distance: 0,
					syncObjects: selectTable,
					name: 'table',
					table_prefix: this.transferData.table_prefix,
					table_suffix: this.transferData.table_suffix,
					type: 'database',
					readBatchSize: 1000,
					readCdcInterval: 500,
					dropTable: false,
					dropType: 'no_drop',
					database_type: 'mysql'
				})
			];
			this.$api('DataFlows')
				.post(postData)
				.then(() => {
					this.$message.success('保存成功');
				});
		}
	}
};
</script>
<style lang="less">
.select-connection-popper {
	.el-select-dropdown__item {
		height: 64px;
		padding: 10px;
	}
	.select-connection-option {
		display: flex;
		align-items: center;
		.img {
			padding: 6px;
			width: 44px;
			height: 44px;
			line-height: 32px;
			border: 1px solid #dedee4;
			border-radius: 3px;
			box-sizing: border-box;
			text-align: center;
			color: #999;
			img {
				display: block;
				width: 100%;
				height: 100%;
			}
		}
		.name {
			margin-left: 10px;
		}
	}
}
</style>
<style lang="less" scoped>
.CT-task-wrap {
	height: 100%;
	background: rgba(250, 250, 250, 1);
	.step-header {
		display: flex;
		justify-content: center;
		align-items: center;
		background: #fff;
		border-bottom: 1px solid #dedee4;
		color: rgba(102, 102, 102, 100);
		font-size: 12px;
		.step-box {
			margin-left: 20px;
			display: flex;
			align-items: center;
			li + li {
				margin-left: 54px;
				&::before {
					content: '';
					position: absolute;
					top: 10px;
					left: -42px;
					height: 1px;
					width: 30px;
					background: #bbb;
				}
			}
			li {
				position: relative;
				display: flex;
				align-items: center;
				&.active {
					color: #48b6e2;
					&::before {
						background: #48b6e2;
					}
					.step-index {
						border-color: #fff;
						background: #48b6e2;
						color: #fff;
					}
				}
				.step-index {
					margin-right: 7px;
					width: 20px;
					height: 20px;
					line-height: 16px;
					text-align: center;
					border: 1px solid #aaa;
					border-radius: 50%;
					font-family: Roboto;
					font-weight: bold;
					box-sizing: border-box;
				}
			}
		}
	}
	.right-aside {
		background: #fafafa;
		border-left: 1px solid #dedee4;
	}
	.CT-task-main {
		background: #fff;
		overflow: auto;
		.body {
			margin: 0 auto;
			padding-bottom: 50px;
			width: 850px;
			.title {
				padding: 20px 200px;
				color: rgba(51, 51, 51, 100);
				font-size: 28px;
				font-weight: bold;
				text-align: left;
			}
			.desc {
				padding: 0 200px;
				margin-bottom: 20px;
				color: #999;
				font-size: 12px;
			}
			.CT-task-transfer {
				margin-left: 200px;
				height: 500px;
			}
		}
		.step-4 {
			width: 1050px;
		}
	}
	.CT-task-footer {
		display: flex;
		justify-content: center;
		align-items: center;
		border-top: 1px solid #dedee4;
	}
	.btn-step {
		width: 212px;
		position: relative;
		.btn-pass {
			position: absolute;
			top: 50%;
			right: -20px;
			transform: translate(100%, -50%);
		}
	}
	.btn-step + .btn-step {
		margin-left: 32px;
	}
	.select-connection {
		display: block;
		width: 450px;
	}
	.database-type {
		padding: 0 200px;
		display: flex;
		align-items: center;
		.img {
			padding: 10px;
			width: 54px;
			height: 54px;
			border: 1px solid #dedee4;
			box-sizing: border-box;
			img {
				display: block;
				width: 100%;
				height: 100%;
			}
		}
		.database-name {
			margin-left: 15px;
			font-size: 28px;
		}
		.btn-change {
			margin-top: 10px;
			margin-left: 15px;
		}
	}
	.create-form {
		margin-top: 20px;
		padding-right: 200px;
	}
	.btn-test {
		padding-left: 200px;
		.status {
			margin-left: 10px;
			font-size: 12px;
			&.invalid {
				color: #f56c6c;
				.el-icon-error {
					display: inline-block;
				}
			}
			&.ready {
				color: #67c23a;
				.el-icon-success {
					display: inline-block;
				}
			}
			&.testing {
				color: #e6a23c;
				.el-icon-warning {
					display: inline-block;
				}
			}
			.status-icon {
				display: none;
			}
		}
	}
	.error-msg {
		padding: 0 200px;
		line-height: 26px;
		color: rgba(238, 83, 83, 100);
		font-size: 14px;
	}
	.task-type-radio {
		padding: 0 200px;
		box-sizing: border-box;
	}
	.step-1 {
		.os-buttons {
			margin-top: 66px;
			display: flex;
			justify-content: space-between;
			.el-button {
				position: relative;
				width: 260px;
				font-family: Roboto;
				&.active {
					color: #48b6e2;
					border-color: #c8e9f6;
					background-color: #edf8fc;
				}
				i {
					position: absolute;
					left: 19px;
					top: 9px;
					font-size: 19px;
				}
			}
		}
	}
}
</style>
