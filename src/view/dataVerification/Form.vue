<template>
	<section class="data-verification-form">
		<div class="form-container">
			<div class="form-body">
				<h1 class="title">
					<span>新建校验</span>
					<div style="font-size: 12px;">
						<span style="color: #48B6E2;" v-show="form.active">已启用</span>
						<span style="color: #9a9a9a;" v-show="!form.active">已禁止</span>
						<el-switch size="mini" v-model="form.active"></el-switch>
					</div>
				</h1>
				<div class="form-panel">
					<div class="panel-label">
						<span>基本设置</span>
					</div>
					<div class="panel-container" style="padding: 10px 20px;">
						<div class="setting-item">
							<label class="item-label">校验类型</label>
							<el-radio-group v-model="form.func" style="margin-left: 10px;">
								<el-radio label="row_count">行数校验</el-radio>
								<el-radio label="field">内容校验</el-radio>
							</el-radio-group>
						</div>
						<div class="setting-item">
							<label class="item-label">选择任务</label>
							<el-select
								class="item-select"
								size="mini"
								v-model="form.flowId"
								placeholder="选择任务"
								:loading="!flowOptions"
							>
								<el-option
									v-for="opt in flowOptions"
									:key="opt.id"
									:label="opt.name"
									:value="opt.id"
								></el-option>
							</el-select>
						</div>
						<div class="setting-item">
							<label class="item-label">校验频次</label>
							<el-radio-group v-model="form.mode" style="margin-left: 10px;">
								<el-radio label="manual">单词校验</el-radio>
								<el-radio label="cron">重复校验</el-radio>
							</el-radio-group>
						</div>
						<div class="setting-item" v-show="form.mode === 'cron'">
							<label class="item-label">校验间隔</label>
							<el-input class="item-input" size="mini" v-model="form.interval">
								<template slot="append">分钟</template>
							</el-input>
						</div>
						<div class="setting-item" v-show="form.mode === 'cron'">
							<label class="item-label">持续时间</label>
							<el-input class="item-input" size="mini" v-model="form.duration">
								<template slot="append">天</template>
							</el-input>
						</div>
						<div class="setting-item">
							<label class="item-label">开始时间</label>
							<el-select class="item-select" size="mini" v-model="form.timeType">
								<el-option value="now" label="此刻"></el-option>
								<el-option value="future" label="指定时间"></el-option>
							</el-select>
						</div>
						<div class="setting-item" v-show="form.timeType === 'future'">
							<label class="item-label"></label>
							<el-date-picker
								size="mini"
								class="item-time-picker"
								v-model="form.time"
								type="datetime"
								placeholder="选择日期时间"
							>
							</el-date-picker>
						</div>
						<div class="setting-item">
							<label class="item-label">错误信息保存条数</label>
							<el-select class="item-select" size="mini" v-model="form.errorSaveNum">
								<el-option :value="100" label="100条"></el-option>
								<el-option :value="1000" label="1000条"></el-option>
								<el-option :value="10000" label="10000条"></el-option>
							</el-select>
						</div>
					</div>
				</div>
				<div class="form-panel">
					<div class="panel-label">
						<span>校验条件</span>
						<el-button style="height:24px;line-height: 24px;padding: 0 10px;" size="mini" @click="clear">
							清空
						</el-button>
					</div>
					<ul class="panel-container">
						<li class="condition-item" v-for="(item, index) in form.conditions" :key="index">
							<div class="condition-setting">
								<div class="setting-item">
									<label class="item-label is-required">待校验表</label>
									<el-select
										class="item-select"
										size="mini"
										v-model="item.sourceTable"
										placeholder="请选择源表"
										:loading="!tableList"
									>
										<el-option
											v-for="table in tableList"
											:key="table.id"
											:label="table.name"
											:value="table.id"
										></el-option>
									</el-select>
									<span class="item-icon">
										<i class="el-icon-right"></i>
									</span>
									<el-select
										class="item-select"
										size="mini"
										v-model="item.targetTable"
										placeholder="请选择目标表"
										:loading="!tableList"
									>
										<el-option
											v-for="table in tableList"
											:key="table.id"
											:label="table.name"
											:value="table.id"
										></el-option>
									</el-select>
								</div>
								<div class="setting-item" v-show="form.func === 'field'">
									<label class="item-label is-required">索引字段</label>
									<el-select
										class="item-select"
										size="mini"
										v-model="item.sourceTable"
										placeholder="请选索引或主键字段"
										:loading="!tableList"
									>
										<el-option
											v-for="table in tableList"
											:key="table.id"
											:label="table.name"
											:value="table.id"
										></el-option>
									</el-select>
									<span class="item-icon"></span>
									<el-select
										class="item-select"
										size="mini"
										v-model="item.targetTable"
										placeholder="请选索引或主键字段"
										:loading="!tableList"
									>
										<el-option
											v-for="table in tableList"
											:key="table.id"
											:label="table.name"
											:value="table.id"
										></el-option>
									</el-select>
								</div>
							</div>
							<el-button-group class="setting-buttons">
								<el-button size="mini" icon="el-icon-close" @click="removeItem(index)"></el-button>
							</el-button-group>
						</li>
						<li style="color: #ccc;" v-show="!form.conditions.length">
							点下方按钮添加校验表
						</li>
					</ul>
				</div>
				<div style="margin-top: 10px;">
					<el-button size="mini" icon="el-icon-plus" @click="addTable()">添加表</el-button>
					<el-button size="mini" icon="el-icon-plus">自动添加</el-button>
				</div>
			</div>
		</div>
		<div class="footer">
			<el-button type="primary" size="mini" @click="nextStep()">下一步</el-button>
		</div>
	</section>
</template>

<script>
const TABLE_PARAMS = {
	connectionId: '',
	table: '',
	sortColumn: ''
};
export default {
	data() {
		return {
			form: {
				flowId: '',
				mode: 'manual',
				func: 'row_count',
				timeType: 'now',
				interval: 24 * 60,
				duration: 30,
				errorSaveNum: 100,
				active: true,
				conditions: []
			},
			tableList: null,
			flowOptions: null
		};
	},
	created() {
		this.getFlowOptions();
		this.getTableList();
	},
	methods: {
		getFlowOptions() {
			setTimeout(() => {
				this.flowOptions = [];
			}, 1000);
		},
		getTableList() {
			setTimeout(() => {
				this.tableList = [];
			}, 1000);
		},
		addTable() {
			this.form.conditions.push({
				source: Object.assign({}, TABLE_PARAMS),
				target: Object.assign({}, TABLE_PARAMS)
			});
		},
		removeItem(idx) {
			this.form.conditions.splice(idx, 1);
		},
		clear() {
			this.form.conditions = [];
		},
		nextStep() {
			debugger;
			// console.log(this.form);
		}
	}
};
</script>

<style lang="less">
.data-verification-form {
	position: relative;
	height: 100%;
	overflow: hidden;
	box-sizing: border-box;
	padding-bottom: 68px;
	.el-form-item__label,
	.el-form-item__content,
	.el-radio__label {
		font-size: 12px;
	}
	.el-radio {
		line-height: 16px;
	}
	.form-container {
		height: 100%;
		overflow: auto;
		.form-body {
			margin: 0 auto;
			padding: 15px 30px;
			box-sizing: border-box;
			max-width: 1000px;
		}
	}
	.title {
		display: flex;
		align-items: start;
		justify-content: space-between;
		line-height: 28px;
		font-size: 16px;
		font-weight: 400;
		color: #343434;
		margin-bottom: 10px;
	}
	.form-panel {
		background: #fafafa;
		font-size: 12px;
		border: 1px solid #dedee4;
		color: #666;
		margin-bottom: 10px;
		.panel-label {
			padding: 2px 10px;
			display: flex;
			justify-content: space-between;
			align-items: center;
			border-bottom: 1px solid #dedee4;
		}
		.panel-container {
			padding: 10px;
			.condition-item {
				display: flex;
				margin-bottom: 10px;
			}
			.condition-setting {
				flex: 1;
				background: #fff;
				padding: 5px 10px;
				border: 1px solid #dedee4;
			}
			.setting-item {
				display: flex;
				align-items: center;
				padding: 5px 0;
				.is-required::before {
					content: '*';
					color: #f56c6c;
					margin-right: 3px;
				}
				.item-label {
					padding: 0 10px;
					width: 120px;
					text-align: right;
				}
				.item-icon {
					width: 20px;
					text-align: center;
				}
				.item-time-picker,
				.item-input,
				.item-select {
					width: 300px;
				}
			}
			.setting-buttons {
				margin-left: 10px;
				.el-button {
					padding: 7px;
				}
			}
		}
	}
	.footer {
		position: absolute;
		bottom: 0;
		left: 0;
		padding: 20px;
		text-align: center;
		width: 100%;
		box-sizing: border-box;
		background: #fff;
		overflow: hidden;
	}
}
</style>
