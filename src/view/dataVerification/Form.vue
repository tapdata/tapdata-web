<template>
	<section class="data-verification-form">
		<div class="form-container">
			<div class="form-body">
				<h1 class="title">
					<span>{{ $route.params.id ? $t('dataVerification.edit') : $t('dataVerification.newVerify') }}</span>
					<div style="font-size: 12px;" v-show="form.mode === 'cron'">
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
							<label class="item-label">{{ $t('dataVerification.verifytype') }}</label>
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
					<ul class="panel-container" id="data-verification-form">
						<li class="condition-item" v-for="(item, index) in form.tasks" :key="index">
							<div class="condition-setting">
								<div class="setting-item">
									<label class="item-label is-required">{{ $t('dataVerification.table') }}</label>
									<el-cascader
										class="item-select"
										:class="{ red: !item.sourceTable }"
										size="mini"
										v-model="item.sourceTable"
										:options="item.sourceTree"
										@input="tableChangeHandler(item, 'source', index)"
									></el-cascader>
									<span class="item-icon">
										<i class="el-icon-right"></i>
									</span>
									<el-cascader
										class="item-select"
										size="mini"
										:class="{ red: !item.targetTable }"
										v-model="item.targetTable"
										:options="item.targetTree"
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
									<el-checkbox
										style="margin-left: 10px;"
										v-model="item.showAdvancedVerification"
										v-show="form.inspectMethod === 'field'"
										>{{ $t('dataVerification.advanceVerify') }}</el-checkbox
									>
								</div>
								<div class="setting-item" v-if="item.showAdvancedVerification">
									<label class="item-label is-required">{{
										$t('dataVerification.JSVerifyLogic')
									}}</label>
									<el-button
										v-if="!item.webScript || item.webScript === ''"
										size="mini"
										icon="el-icon-plus"
										@click="addScript(index)"
										>{{ $t('dataVerification.addJS') }}</el-button
									>
									<span v-if="item.webScript && item.webScript !== ''">
										<el-input
											class="item-select item-textarea"
											type="textarea"
											v-model="item.webScript"
											disabled
										></el-input>
										<el-button-group class="setting-buttons">
											<el-button
												size="mini"
												icon="el-icon-edit"
												@click="editScript(index)"
											></el-button>
										</el-button-group>
										<el-button-group class="setting-buttons">
											<el-button
												size="mini"
												icon="el-icon-close"
												@click="removeScript(index)"
											></el-button>
										</el-button-group>
									</span>
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
			<el-button type="primary" size="mini" @click="nextStep()">{{ $t('app.save') }}</el-button>
		</div>
		<el-dialog
			:title="$t('dataVerification.JSVerifyLogic')"
			:visible.sync="dialogAddScriptVisible"
			width="60%"
			:before-close="handleAddScriptClose"
		>
			<div class="js-wrap">
				<div class="jsBox">
					<div class="js-fixText">
						<span style="color: #0000ff;">function </span><span> validate(sourceRow){</span>
					</div>
					<JsEditor
						v-if="dialogAddScriptVisible"
						:code.sync="webScript"
						ref="jsEditor"
						:width.sync="width"
					></JsEditor>
					<div class="js-fixText">}</div>
				</div>
				<div class="example markdown-body" v-html="htmlMD"></div>
			</div>
			<span slot="footer" class="dialog-footer">
				<el-button @click="handleAddScriptClose" size="mini">{{ $t('dataForm.cancel') }}</el-button>
				<el-button type="primary" @click="submitScript" size="mini">{{ $t('message.confirm') }}</el-button>
			</span>
		</el-dialog>
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
	'fields.primary_key_position': true
};
import MultiSelection from './MultiSelection.vue';
import JsEditor from '@/components/JsEditor';
import _ from 'lodash';
export default {
	components: { MultiSelection, JsEditor },
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
			htmlMD: '',
			removeVisible: false,
			isDbClone: false,
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
				tasks: []
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
			flowOptions: null,
			dialogAddScriptVisible: false,
			formIndex: '',
			webScript: '',
			width: '600'
		};
	},
	created() {
		this.getFlowOptions();
		this.htmlMD = require(`./functionInfo.md`);
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
								t.source = Object.assign({}, TABLE_PARAMS, t.source);
								t.target = Object.assign({}, TABLE_PARAMS, t.target);
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
			// if (!parseInt(this.$cookie.get('isAdmin')) && localStorage.getItem('BTN_AUTHS') !== 'BTN_AUTHS')
			// 	where.user_id = { regexp: `^${this.$cookie.get('user_id')}$` };
			this.$api('DataFlows')
				.get({
					filter: JSON.stringify({
						where: where,
						fields: {
							id: true,
							name: true
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
					this.isDbClone = flowData.mappingTemplate === 'cluster-clone';
					if (this.isDbClone) {
						this.dealDBFlow(flowData, this.getTaskTree);
					} else {
						this.dealCustomFlow(flowData, this.getTaskTree);
					}
				});
			let flow = this.flowOptions.find(item => item.id === this.form.flowId) || {};
			this.form.name = this.form.name || flow.name;
			this.form['dataFlowName'] = flow.name;
		},
		//处理db克隆的情况
		dealDBFlow(flowData, callback) {
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
						callback();
					});
			}
		},
		//处理普通表同步的情况
		dealCustomFlow(flowData, callback) {
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
									this.getTree(this.sourceTree, stg);
								}
								if (stg.inputLanes.length) {
									this.getTree(this.targetTree, stg);
								}
							}
						});
						callback();
					});
			}
		},
		//获取源表和目标表数据
		getTree(tree, stage) {
			let parent = tree.find(c => c.value === stage.connectionId);
			if (!parent) {
				parent = {
					label: stage.connectionName,
					value: stage.connectionId,
					level: 1,
					children: []
				};
				tree.push(parent);
			}
			if (parent.children.every(t => t.value !== stage.tableName)) {
				parent.children.push({
					label: stage.tableName,
					value: stage.tableName,
					level: 2
				});
			}
		},
		getTreeForDBFlow(type, tables, stage, targetStage) {
			let includeTableNames = [];
			let getTableNames = (objects, prefix = '', suffix = '') => {
				let obj = objects.find(obj => obj.type === 'table');
				if (obj) {
					includeTableNames = obj.objectNames.map(tName => {
						return prefix + tName + suffix;
					});
				}
			};
			if (type === 'source' && targetStage.syncObjects) {
				getTableNames(targetStage.syncObjects);
			}
			if (type === 'target' && stage.syncObjects) {
				getTableNames(stage.syncObjects, stage.table_prefix, stage.table_suffix);
			}
			let includeTables = tables.filter(tb => {
				let flag = true;
				if (includeTableNames.length) {
					flag = includeTableNames.includes(tb.original_name);
				}
				return tb.source.id === stage.connectionId && flag;
			});

			let parent = {
				label: includeTables[0].source.name,
				value: stage.connectionId,
				children: []
			};
			let index = this[type + 'Tree'].findIndex(it => it.value === stage.connectionId);
			if (index >= 0) {
				parent = this[type + 'Tree'].splice(index, 1)[0];
			}
			includeTables.forEach(table => {
				if (!parent.children.find(child => child.value === table.original_name)) {
					parent.children.push({
						label: table.original_name,
						value: table.original_name
					});
					let outputLanes = targetStage
						? [
								targetStage.connectionId +
									targetStage.table_prefix +
									table.original_name +
									targetStage.table_suffix
						  ]
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
				}
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
			let sMap = {};
			stages.forEach(stg => {
				if (stg.outputLanes.length && ['table', 'collection'].includes(stg.type)) {
					let stage = sMap[stg.connectionId + stg.tableName] || {};
					let stgId = stage.id || stg.id;
					let outputLanes = map[stgId] || [];
					outputLanes.push(...checkOutputLanes(stg.outputLanes));
					map[stgId] = outputLanes;
					sMap[stg.connectionId + stg.tableName] = stg;
				}
			});
			this.stageMap = map;
		},
		getTaskTree() {
			let sourceTree = this.sourceTree;
			let map = this.stageMap;
			let stages = this.flowStages;

			if (this.form.tasks && this.form.tasks.length) {
				this.form.tasks.forEach((t, idx) => {
					let targetTree = [];
					let sourceTable = t.sourceTable;
					if (sourceTable && sourceTable[0] && sourceTable[1]) {
						let stageKey = null;
						if (this.isDbClone) {
							stageKey = sourceTable.join('');
						} else {
							let stage = stages.find(
								stg => stg.connectionId === sourceTable[0] && stg.tableName === sourceTable[1]
							);
							if (stage) {
								stageKey = stage.id;
							}
						}
						if (stageKey) {
							let outputLanes = map[stageKey];
							if (outputLanes && outputLanes.length) {
								let tree = [];
								outputLanes.forEach(id => {
									let stg = stages.find(stg => stg.id === id);
									this.getTree(tree, stg);
								});
								targetTree = tree;
							}
						}
					}
					this.form.tasks[idx].sourceTree = sourceTree;
					this.form.tasks[idx].targetTree = targetTree;
				});
			}
		},
		//根据表的连线关系自动添加校验条件
		autoAddTable() {
			this.form.tasks = [];
			let stages = this.flowStages;
			let map = this.stageMap;
			for (const key in map) {
				const lanes = map[key];
				let stg = stages.find(stg => stg.id === key);
				lanes.forEach(id => {
					let targetStage = stages.find(it => it.id === id);
					let task = {
						source: this.setTable(stg),
						target: Object.assign({}, TABLE_PARAMS),
						sourceTable: [stg.connectionId, stg.tableName],
						showAdvancedVerification: false,
						script: '', //后台使用 需要拼接function头尾
						webScript: '' //前端使用 用于页面展示
					};
					if (targetStage) {
						this.setTarget(task, targetStage);
					}
					this.form.tasks.push(task);
				});
			}
			this.getTaskTree();
		},
		setTarget(task, targetStage) {
			let stages = this.flowStages;
			let source = task.source;
			if (source && source.connectionId) {
				let sourceStage = stages.find(
					stg => stg.connectionId === source.connectionId && stg.tableName === source.table
				);
				if (sourceStage) {
					task.target = this.setTable(targetStage);
					task.targetTable = [targetStage.connectionId, targetStage.tableName];
					if (targetStage.joinTables) {
						let joinTable = targetStage.joinTables.find(ts => ts.stageId === sourceStage.id);
						if (joinTable) {
							let sourceSortColumn = [];
							let targetSortColumn = [];
							joinTable.joinKeys.forEach(obj => {
								sourceSortColumn.push(obj.source);
								targetSortColumn.push(obj.target);
							});
							task.source.sortColumn = sourceSortColumn.join(',');
							task.target.sortColumn = targetSortColumn.join(',');
						}
					}
				}
			}
		},
		setTable(stage) {
			let sortColumn = '';
			if (stage && stage.fields && stage.fields.length) {
				let pkField = stage.fields.find(f => f.primary_key_position > 0);
				if (pkField) {
					sortColumn = pkField.field_name;
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
				target: Object.assign({}, TABLE_PARAMS),
				showAdvancedVerification: false,
				script: '', //后台使用 需要拼接function头尾
				webScript: '' //前端使用 用于页面展示
			});
			this.getTaskTree();
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
		tableChangeHandler(item, type, index) {
			let stages = this.flowStages;
			let values = item[type + 'Table'];
			if (values && values.length) {
				let sourceStage = stages.find(stg => stg.connectionId === values[0] && stg.tableName === values[1]);
				if (sourceStage) {
					item[type] = this.setTable(sourceStage);
					if (type === 'source') {
						let task = this.form.tasks[index];
						task.target = Object.assign({}, TABLE_PARAMS);
						task.targetTable = ['', ''];
						this.$nextTick(() => {
							this.getTaskTree();
							this.$nextTick(() => {
								let targetTree = task.targetTree;
								if (targetTree.length === 1 && targetTree[0].children.length === 1) {
									let targetStage = stages.find(
										stg =>
											stg.connectionId === targetTree[0].value &&
											stg.tableName === targetTree[0].children[0].value
									);
									this.setTarget(task, targetStage);
								}
							});
						});
					}
				}
			}
		},
		handleAddScriptClose() {
			this.webScript = '';
			this.formIndex = '';
			this.dialogAddScriptVisible = false;
		},
		addScript(index) {
			this.formIndex = index;
			this.webScript = '';
			this.dialogAddScriptVisible = true;
		},
		removeScript(index) {
			this.$confirm(this.$t('message.verifyConfirm'), this.$t('message.delete')).then(() => {
				this.form.tasks[index].webScript = '';
			});
		},
		editScript(index) {
			this.formIndex = index;
			let script = _.cloneDeep(this.form.tasks[this.formIndex].webScript);
			this.webScript = script;
			this.dialogAddScriptVisible = true;
		},
		submitScript() {
			let script = _.cloneDeep(this.webScript);
			let formIndex = _.cloneDeep(this.formIndex);
			this.form.tasks[formIndex].webScript = script;
			this.webScript = '';
			this.formIndex = '';
			this.dialogAddScriptVisible = false;
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
					if (this.form && this.form.createTime && this.form.last_updated) {
						delete this.form.createTime;
						delete this.form.last_updated;
					}
					this.$api('Inspects')
						[this.form.id ? 'patch' : 'post'](
							Object.assign({}, this.form, {
								fullMatchKeep: this.form.keep,
								status: this.form.mode === 'manual' ? 'scheduling' : 'waiting',
								ping_time: 0,
								tasks: this.form.tasks.map(
									({ source, target, fullMatch, showAdvancedVerification, script, webScript }) => {
										if (webScript && webScript !== '') {
											script = 'function validate(sourceRow){' + webScript + '}';
										}
										return {
											source,
											target,
											fullMatch,
											showAdvancedVerification,
											script,
											webScript
										};
									}
								)
							})
						)
						.then(res => {
							if (res.data) {
								this.$router.back();
							}
						})
						.catch(err => {
							if (err.response.msg === 'duplication for names') {
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
			display: inline-block;
			margin: 0 auto;
			padding: 15px 30px;
			box-sizing: border-box;
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
				.item-textarea {
					font-size: 12px;
					font-family: element-icons;
					line-height: 16px;
					color: #aaa;
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
<style lang="less">
.js-wrap {
	display: flex;
	flex-wrap: nowrap;
	flex-direction: row;
	.jsBox {
		width: 70%;
		height: 478px;
		.js-fixText {
			line-height: 25px;
			margin-left: 28px;
		}
		.js-fixContent {
			margin-left: 60px;
		}
	}
	.example {
		width: calc(100% - 70%);
		height: 478px;
		overflow-y: auto;
		padding-right: 10px;
	}
}
</style>
