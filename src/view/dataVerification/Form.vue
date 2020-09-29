<template>
	<section class="data-verification-form">
		<div class="form-container">
			<div class="form-body">
				<h1 class="title">
					<span>{{ $route.params.id ? $t('dataVerification.edit') : $t('dataVerification.newVerify') }}</span>
					<div style="font-size: 12px;">
						<span style="color: #48B6E2;" v-show="form.enabled">{{ $t('dataVerification.enable') }}</span>
						<span style="color: #9a9a9a;" v-show="!form.enabled">{{ $t('dataVerification.disable') }}</span>
						<el-switch size="mini" v-model="form.enabled"></el-switch>
					</div>
				</h1>
				<div class="form-panel">
					<div class="panel-label">
						<span>{{ $t('dataVerification.BasicSettings') }}</span>
					</div>
					<el-form
						inline-message
						ref="baseForm"
						:model="form"
						:rules="rules"
						class="panel-container"
						label-position="right"
						style="padding: 10px 20px;"
					>
						<el-form-item class="setting-item" prop="flowId">
							<label class="item-label is-required">{{ $t('dataVerification.chooseJob') }}</label>
							<el-select
								filterable
								class="item-select"
								size="mini"
								v-model="form.flowId"
								:placeholder="$t('dataVerification.chooseJob')"
								:loading="!flowOptions"
								@input="flowChangeHandler"
							>
								<el-option
									v-for="opt in flowOptions"
									:key="opt.id"
									:label="opt.name"
									:value="opt.id"
								></el-option>
							</el-select>
						</el-form-item>
						<el-form-item class="setting-item">
							<label class="item-label">{{ $t('dataVerification.verifyType') }}</label>
							<el-radio-group v-model="form.inspectMethod" style="margin-left: 10px;">
								<el-radio label="row_count">
									{{ $t('dataVerification.rowVerify') }}
									<el-tooltip
										class="item"
										effect="dark"
										:content="$t('dataVerification.fastCountTip')"
										placement="top"
									>
										<i class="el-icon-warning-outline"></i>
									</el-tooltip>
								</el-radio>
								<el-radio label="field">
									{{ $t('dataVerification.contentVerify') }}
									<el-tooltip
										class="item"
										effect="dark"
										:content="$t('dataVerification.contentVerifyTip')"
										placement="top"
									>
										<i class="el-icon-warning-outline"></i>
									</el-tooltip>
								</el-radio>
								<el-radio label="jointField">
									{{ $t('dataVerification.jointVerify') }}
									<el-tooltip
										class="item"
										effect="dark"
										:content="$t('dataVerification.jointFieldTip')"
										placement="top"
									>
										<i class="el-icon-warning-outline"></i>
									</el-tooltip>
								</el-radio>
							</el-radio-group>
						</el-form-item>
						<el-form-item class="setting-item" prop="name">
							<label class="item-label is-required">{{ $t('dataVerification.verifyJobName') }}</label>
							<el-input class="item-input" size="mini" v-model="form.name"></el-input>
						</el-form-item>
						<el-form-item class="setting-item">
							<label class="item-label">{{ $t('dataVerification.frequency') }}</label>
							<el-select class="item-select" v-model="form.mode" size="mini" placeholder="请选择">
								<el-option :label="$t('dataVerification.singleVerify')" value="manual"></el-option>
								<el-option :label="$t('dataVerification.repeatingVerify')" value="cron"></el-option>
							</el-select>
						</el-form-item>
						<el-form-item class="setting-item" prop="timing.start" v-show="form.mode === 'cron'">
							<label class="item-label">{{ $t('dataVerification.startAndStopTime') }}</label>
							<el-date-picker
								class="item-select"
								size="mini"
								:value="[form.timing.start, form.timing.end]"
								type="datetimerange"
								range-separator="-"
								:start-placeholder="$t('dataVerification.startTime')"
								:end-placeholder="$t('dataVerification.LastTime')"
								align="right"
								:default-time="['00:00:00', '23:59:59']"
								value-format="timestamp"
								@input="timingChangeHandler"
							>
							</el-date-picker>
						</el-form-item>
						<el-form-item class="setting-item" prop="timing.intervals" v-show="form.mode === 'cron'">
							<label class="item-label">{{ $t('dataVerification.verifyInterval') }}</label>
							<el-input
								class="item-input"
								size="mini"
								v-model="form.timing.intervals"
								onkeyup="this.value=this.value.replace(/[^\d]/g,'') "
								onafterpaste="this.value=this.value.replace(/[^\d]/g,'') "
							>
								<template slot="append">
									<el-select style="width: 100px;" size="mini" v-model="form.timing.intervalsUnit">
										<el-option
											v-for="unit in timeUnitOptions"
											:key="unit"
											:label="unit"
											:value="unit"
										></el-option>
									</el-select>
								</template>
							</el-input>
						</el-form-item>
						<el-form-item class="setting-item">
							<label class="item-label">{{ $t('dataVerification.inconsistent') }}</label>
							<el-select class="item-select" size="mini" v-model="form.limit.keep">
								<el-option :value="100" label="100(rows)"></el-option>
								<el-option :value="1000" label="1000(rows)"></el-option>
								<el-option :value="10000" label="10000(rows)"></el-option>
							</el-select>
						</el-form-item>
					</el-form>
				</div>
				<div class="form-panel" v-if="flowStages">
					<div class="panel-label">
						<span>{{ $t('dataVerification.verifyCondition') }}</span>
						<el-button style="height:24px;line-height: 24px;padding: 0 10px;" size="mini" @click="clear">
							{{ $t('dataVerification.clear') }}
						</el-button>
					</div>
					<ul class="panel-container" v-loading="!flowStages.length" id="data-verification-form">
						<li class="condition-item" v-for="(item, index) in form.tasks" :key="index">
							<div class="condition-setting">
								<div class="setting-item">
									<label class="item-label is-required">{{ $t('dataVerification.table') }}</label>
									<el-cascader
										class="item-select"
										:class="{ red: !item.sourceTable }"
										size="mini"
										v-model="item.sourceTable"
										:options="sourceTree"
										@input="tableChangeHandler(item, 'source')"
									></el-cascader>
									<span class="item-icon">
										<i class="el-icon-right"></i>
									</span>
									<el-cascader
										class="item-select"
										size="mini"
										:class="{ red: !item.targetTable }"
										v-model="item.targetTable"
										:options="targetTree"
										@input="tableChangeHandler(item, 'target')"
									></el-cascader>
								</div>
								<div class="setting-item" v-show="form.inspectMethod !== 'row_count'">
									<label class="item-label is-required">{{
										$t('dataVerification.indexField')
									}}</label>
									<MultiSelection
										v-model="item.source.sortColumn"
										:options="item.source.fields"
										:class="{ red: !item.source.sortColumn }"
										:placeholder="$t('dataVerification.ChoosePKField')"
										:id="'itemSource' + index"
									></MultiSelection>
									<span class="item-icon"></span>
									<MultiSelection
										v-model="item.target.sortColumn"
										:class="{ red: !item.target.sortColumn }"
										:options="item.target.fields"
										:placeholder="$t('dataVerification.ChoosePKField')"
									></MultiSelection>
								</div>
							</div>
							<el-button-group class="setting-buttons">
								<el-button size="mini" icon="el-icon-close" @click="removeItem(index)"></el-button>
							</el-button-group>
						</li>
						<li style="color: #ccc;" v-show="!form.tasks.length">
							{{ $t('dataVerification.clickVerified') }}
						</li>
					</ul>
				</div>
				<div style="margin-top: 10px;" v-if="flowStages">
					<el-button size="mini" icon="el-icon-plus" @click="addTable()">{{
						$t('dataVerification.addTable')
					}}</el-button>
					<el-button size="mini" icon="el-icon-plus" @click="autoAddTable()">{{
						$t('dataVerification.automaticallyAdd')
					}}</el-button>
				</div>
			</div>
		</div>
		<div class="footer">
			<el-button size="mini" @click="goBack()">{{ $t('dataVerification.back') }}</el-button>
			<el-button type="primary" size="mini" @click="nextStep()">{{ $t('dataVerification.next') }}</el-button>
		</div>
	</section>
</template>

<script>
const TABLE_PARAMS = {
	connectionId: '',
	table: '',
	sortColumn: '',
	fields: []
};
const META_INSTANCE_FIELDS = {
	id: true,
	name: true,
	original_name: true,
	source: true,
	'source.id': true,
	'source.name': true,
	fields: true,
	'fields.id': true,
	'fields.field_name': true,
	'fields.primary_key_position': true,
	'fields.original_field_name': true
};
import MultiSelection from './MultiSelection.vue';
export default {
	components: { MultiSelection },
	data() {
		let self = this;
		let requiredValidator = (msg, isCheckMode) => {
			return (rule, value, callback) => {
				let valid = isCheckMode ? self.form.mode === 'cron' : true;
				if (valid && !value) {
					callback(new Error(msg));
				} else {
					callback();
				}
			};
		};
		return {
			timeUnitOptions: ['second', 'minute', 'hour', 'day', 'week', 'month'],
			pickerTimes: [],
			form: {
				flowId: '',
				name: '',
				mode: 'manual',
				inspectMethod: 'row_count',
				timing: {
					intervals: 24 * 60,
					intervalsUnit: 'minute',
					start: new Date().getTime(),
					end: new Date().getTime() + 24 * 60 * 60 * 1000
				},
				limit: {
					keep: 100
				},
				enabled: true,
				tasks: [],
				listtags: []
			},
			rules: {
				flowId: [
					{
						validator: requiredValidator(this.$t('dataVerification.tasksDataFlow'))
					}
				],
				name: [
					{
						validator: requiredValidator(this.$t('dataVerification.tasksJobName'))
					}
				],
				'timing.start': [
					{
						validator: requiredValidator(this.$t('dataVerification.tasksTime'), true)
					}
				],
				'timing.intervals': [
					{
						validator: requiredValidator(this.$t('dataVerification.tasksVerifyInterval'), true)
					}
				]
			},
			sourceTree: [],
			targetTree: [],
			stageMap: {},
			flowStages: null,
			sourceFields: [],
			targetFields: [],
			flowOptions: null
		};
	},
	created() {
		this.getFlowOptions();
	},
	methods: {
		//获取表单数据
		getData(id) {
			if (id) {
				this.$api('Inspects')
					.findOne({
						filter: JSON.stringify({
							where: {
								id: id
							}
						})
					})
					.then(res => {
						let data = res.data;
						if (data) {
							data.tasks = data.tasks.map(t => {
								t.sourceTable = [t.source.connectionId, t.source.table];
								t.targetTable = [t.target.connectionId, t.target.table];
								return t;
							});
							this.form = data;
							this.getFlowStages();
						}
					});
			}
		},
		//获取dataflow数据
		getFlowOptions() {
			let where = {
				status: {
					inq: ['running', 'paused', 'error']
				}
			};
			if (!parseInt(this.$cookie.get('isAdmin'))) where.user_id = { regexp: `^${this.$cookie.get('user_id')}$` };
			this.$api('DataFlows')
				.get({
					filter: JSON.stringify({
						where: where,
						fields: {
							id: true,
							name: true,
							listtags: true
						}
					})
				})
				.then(res => {
					this.flowOptions = res.data || [];
					this.getData(this.$route.params.id);
				});
		},
		//dataflow改变时
		flowChangeHandler() {
			this.form.tasks = [];
			this.sourceTree = [];
			this.targetTree = [];
			this.getFlowStages();
		},
		getFlowStages() {
			this.$api('DataFlows')
				.findOne({
					filter: JSON.stringify({
						where: {
							id: this.form.flowId
						},
						fields: {
							id: true,
							name: true,
							stages: true,
							mappingTemplate: true
						}
					})
				})
				.then(res => {
					let flowData = res.data;
					this.flowStages = [];
					if (flowData.mappingTemplate === 'cluster-clone') {
						this.dealDBFlow(flowData);
					} else {
						this.dealCustomFlow(flowData);
					}
				});
			let flow = this.flowOptions.find(item => item.id === this.form.flowId) || {};
			this.form.name = this.form.name || flow.name;
			this.form.listtags = flow.listtags || [];
		},
		//处理db克隆的情况
		dealDBFlow(flowData) {
			let dbStages = flowData.stages.filter(stg => ['database'].includes(stg.type));
			let connectionIds = dbStages.map(stg => stg.connectionId);
			if (connectionIds.length) {
				this.$api('MetadataInstances')
					.get({
						filter: JSON.stringify({
							where: {
								is_deleted: false,
								meta_type: {
									inq: ['table', 'collection']
								},
								'source.id': {
									inq: Array.from(new Set(connectionIds))
								}
							},
							fields: META_INSTANCE_FIELDS
						})
					})
					.then(res => {
						let tables = res.data || [];
						dbStages.forEach(stage => {
							if (stage.outputLanes.length) {
								let targetDBStage = dbStages.find(stg => stg.id === stage.outputLanes[0]);
								this.getTreeForDBFlow('source', tables, stage, targetDBStage);
							}
							if (stage.inputLanes.length) {
								this.getTreeForDBFlow('target', tables, stage);
							}
						});
					});
			}
		},
		//处理普通表同步的情况
		dealCustomFlow(flowData) {
			this.getStageMap(flowData.stages);
			let flowStages = flowData.stages.filter(stg => ['table', 'collection'].includes(stg.type));
			this.flowStages = flowStages;
			let connectionIds = [];
			let tableNames = [];
			flowStages.forEach(stg => {
				connectionIds.push(stg.connectionId);
				tableNames.push(stg.tableName);
			});
			if (connectionIds.length) {
				this.$api('MetadataInstances')
					.get({
						filter: JSON.stringify({
							where: {
								is_deleted: false,
								meta_type: {
									inq: ['table', 'collection']
								},
								'source.id': {
									inq: Array.from(new Set(connectionIds))
								},
								original_name: {
									inq: Array.from(new Set(tableNames))
								}
							},
							fields: META_INSTANCE_FIELDS
						})
					})
					.then(res => {
						let tables = res.data || [];
						flowStages.forEach(stg => {
							let table = tables.find(
								tb => tb.source.id === stg.connectionId && tb.original_name === stg.tableName
							);
							if (table) {
								stg.connectionName = table.source.name;
								stg.fields = table.fields;
								if (stg.outputLanes.length) {
									this.getTree('source', stg);
								}
								if (stg.inputLanes.length) {
									this.getTree('target', stg);
								}
							}
						});
					});
			}
		},
		//获取源表和目标表数据
		getTree(type, stage) {
			let tree = this[type + 'Tree'];
			let parent = tree.find(c => c.value === stage.connectionId);
			if (!parent) {
				parent = {
					label: stage.connectionName,
					value: stage.connectionId,
					children: []
				};
				tree.push(parent);
			}
			parent.children.push({
				label: stage.tableName,
				value: stage.tableName
			});
		},
		getTreeForDBFlow(type, tables, stage, targetStage) {
			let includeTables = tables.filter(tb => tb.source.id === stage.connectionId);
			let parent = {
				label: includeTables[0].source.name,
				value: stage.connectionId,
				children: []
			};
			includeTables.forEach(table => {
				parent.children.push({
					label: table.original_name,
					value: table.original_name
				});
				let outputLanes = targetStage
					? [targetStage.connectionId + stage.table_prefix + table.original_name + stage.table_suffix]
					: null;
				let key = stage.connectionId + table.original_name;
				if (targetStage) {
					this.stageMap[key] = outputLanes;
				}
				this.flowStages.push({
					id: key,
					connectionId: table.source.id,
					fields: table.fields,
					tableName: table.original_name,
					outputLanes
				});
			});
			this[type + 'Tree'].push(parent);
		},
		//获取表的连线关系
		getStageMap(stages) {
			let checkOutputLanes = lanes => {
				let result = [];
				lanes.forEach(stgId => {
					let targetStg = stages.find(it => it.id === stgId);
					if (targetStg.outputLanes.length && !['table', 'collection'].includes(targetStg.type)) {
						result.push(...checkOutputLanes(targetStg.outputLanes));
					} else {
						result.push(stgId);
					}
				});
				return result;
			};
			let map = {};
			stages.forEach(stg => {
				if (stg.outputLanes.length && ['table', 'collection'].includes(stg.type)) {
					map[stg.id] = checkOutputLanes(stg.outputLanes);
				}
			});
			this.stageMap = map;
		},
		//根据表的连线关系自动添加校验条件
		autoAddTable() {
			this.form.tasks = [];
			let stages = this.flowStages.filter(Boolean);
			let map = this.stageMap;
			stages.forEach(stg => {
				let lanes = map[stg.id];
				if (lanes) {
					lanes.forEach(id => {
						let targetStage = stages.find(it => it.id === id);
						this.form.tasks.push({
							source: stg ? this.setTable(stg) : '',
							target: targetStage ? this.setTable(targetStage) : '',
							sourceTable: [stg.connectionId, stg.tableName],
							targetTable: [
								targetStage ? targetStage.connectionId : '',
								targetStage ? targetStage.tableName : ''
							]
						});
					});
				}
			});
		},
		setTable(stage) {
			let sortColumn = '';
			if (stage && stage.fields && stage.fields.length) {
				let pkField = stage.fields.find(f => f.primary_key_position > 0);
				if (pkField) {
					sortColumn = pkField.original_field_name || pkField.field_name;
				}
			}
			return {
				connectionId: stage.connectionId,
				connectionName: stage.connectionName,
				table: stage.tableName,
				sortColumn,
				fields: stage.fields
			};
		},
		addTable() {
			this.form.tasks.push({
				source: Object.assign({}, TABLE_PARAMS),
				target: Object.assign({}, TABLE_PARAMS)
			});
		},
		removeItem(idx) {
			this.form.tasks.splice(idx, 1);
		},
		clear() {
			this.form.tasks = [];
		},
		timingChangeHandler(times) {
			this.form.timing.start = times[0];
			this.form.timing.end = times[1];
		},
		tableChangeHandler(item, type) {
			let values = item[type + 'Table'];
			this.flowStages.forEach(stg => {
				if (values && values.length && stg.connectionId === values[0] && stg.tableName === values[1]) {
					item[type] = this.setTable(stg);
				}
			});
		},
		goBack() {
			this.$router.push('/dataVerification');
		},
		nextStep() {
			this.$refs.baseForm.validate(valid => {
				if (valid) {
					let tasks = this.form.tasks;
					let index = 0;
					if (!tasks.length) {
						return this.$message.error(this.$t('dataVerification.tasksVerifyCondition'));
					}
					if (
						tasks.some((c, i) => {
							index = i + 1;
							return !c.source.table || !c.target.table;
						})
					) {
						document
							.getElementById('data-verification-form')
							.childNodes[index - 1].querySelector('input')
							.focus();
						return this.$message.error(this.$t('dataVerification.lackSource'));
					}
					index = 0;
					if (
						this.form.inspectMethod !== 'row_count' &&
						tasks.some((c, i) => {
							index = i + 1;
							return !c.source.sortColumn || !c.target.sortColumn;
						})
					) {
						document
							.getElementById('data-verification-form')
							.childNodes[index - 1].querySelector('input')
							.focus();
						return this.$message.error(this.$t('dataVerification.lackIndex'));
					}
					index = 0;
					if (
						this.form.inspectMethod !== 'row_count' &&
						tasks.some((c, i) => {
							index = i + 1;
							return c.source.sortColumn.split(',').length !== c.target.sortColumn.split(',').length;
						})
					) {
						let item = document.getElementById('itemSource' + (index - 1));
						item.querySelector('input').focus();
						return this.$message.error(this.$t('dataVerification.tasksAmount'));
					}
					if (this.form.inspectMethod === 'jointField') {
						tasks.forEach(item => {
							item['fullMatch'] = false;
						});
					} else {
						tasks.forEach(item => {
							item['fullMatch'] = true;
						});
					}
					this.$api('Inspects')
						[this.form.id ? 'patch' : 'post'](
							Object.assign({}, this.form, {
								fullMatchKeep: this.form.keep,
								status: this.form.mode === 'manual' ? 'scheduling' : 'waiting',
								tasks: this.form.tasks.map(({ source, target, fullMatch }) => {
									return {
										source,
										target,
										fullMatch
									};
								})
							})
						)
						.then(res => {
							if (res.data) {
								this.$router.back();
							}
						})
						.catch(err => {
							if (err.response.data === 'duplication for names') {
								this.$message.error(this.$t('message.exists_name'));
							}
						});
				}
			});
		}
	}
};
</script>
<style lang="less">
.el-select-dropdown__item {
	max-width: 600px;
}
.data-verification-form {
	.red .el-input__inner {
		border: none;
		border: 1px solid #ee5353;
		border-radius: 4px;
	}
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
			width: 100%;
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
				margin-bottom: 0;
				.el-form-item__content {
					display: flex;
					align-items: center;
					line-height: 1;
				}
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
					width: 600px;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
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
