<template>
	<section class="data-verification-form">
		<h1 class="title">新建校验</h1>
		<el-form inline class="base-form" size="mini">
			<el-form-item label="选择任务">
				<el-select v-model="form.flowId" placeholder="选择任务" :loading="!flowOptions">
					<el-option v-for="opt in flowOptions" :key="opt.id" :label="opt.name" :value="opt.id"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item style="float: right;">
				<span style="color: #48B6E2;" v-show="form.active">已启用</span>
				<span style="color: #9a9a9a;" v-show="!form.active">已禁止</span>
				<el-switch v-model="form.active"></el-switch>
			</el-form-item>
		</el-form>
		<div class="panel-conditions">
			<div class="condition-label">
				<span>校验条件</span>
				<el-button size="mini" @click="clear">清空</el-button>
			</div>
			<ul class="condition-container">
				<li class="condition-item" v-for="(item, index) in form.conditions" :key="index">
					<div class="condition-setting">
						<div class="setting-item">
							<label class="item-label"></label>
							<el-radio size="mini" v-model="item.mode" label="row_count">行数校验</el-radio>
							<el-radio size="mini" v-model="item.mode" label="field">内容校验</el-radio>
						</div>
						<div class="setting-item">
							<label class="item-label is-required">待校验表</label>
							<div class="item-table">
								<el-select
									class="table-selector"
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
							</div>
							<span class="item-icon">
								<i class="el-icon-right"></i>
							</span>
							<div class="item-table">
								<el-select
									class="table-selector"
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
						</div>
						<div class="setting-item" v-show="item.mode === 'feild'">
							<label class="item-label is-required">索引字段</label>
							<div class="item-table">
								<el-select
									class="table-selector"
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
							</div>
							<span class="item-icon"></span>
							<div class="item-table">
								<el-select
									class="table-selector"
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
					</div>
					<el-button-group class="setting-buttons">
						<el-button size="mini" icon="el-icon-close" @click="removeItem(index)"></el-button>
						<el-button size="mini" icon="el-icon-plus"></el-button>
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
				type: 'row',
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
				target: Object.assign({}, TABLE_PARAMS),
				fullMatch: true
			});
		},
		removeItem(idx) {
			this.form.conditions.splice(idx, 1);
		},
		clear() {
			this.form.conditions = [];
		}
	}
};
</script>

<style lang="less">
.data-verification-form {
	padding: 15px 30px;
	max-width: 1000px;
	.title {
		font-size: 16px;
		font-weight: 400;
		color: #343434;
	}
	.base-form {
		padding: 20px 0;
		.el-form-item__label {
			vertical-align: top;
		}
		.el-form-item {
			margin-bottom: 0;
		}
	}
	.panel-conditions {
		background: #f5f5f5;
		font-size: 12px;
		.condition-label {
			padding: 5px 10px;
			display: flex;
			justify-content: space-between;
			align-items: center;
			border-bottom: 1px solid #dedee4;
		}
		.condition-container {
			padding: 10px;
			.condition-item {
				display: flex;
				margin-bottom: 10px;
				.condition-setting {
					flex: 1;
					background: #fff;
					padding: 5px 10px;
					.setting-item {
						display: flex;
						align-items: center;
						padding: 5px 0;
						.item-label {
							padding: 0 10px;
							width: 120px;
							text-align: right;
						}
						.item-icon {
							width: 20px;
							text-align: center;
						}
						.item-table {
							flex: 1;
							.table-selector {
								width: 100%;
							}
						}
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
	}
}
</style>
