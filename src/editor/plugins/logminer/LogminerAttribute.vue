<template>
	<div class="logminer">
		<div class="head-btns">
			<el-button v-if="disabled" class="e-button" type="primary" @click="seeMonitor">
				{{ $t('dataFlow.button.viewMonitoring') }}
			</el-button>
		</div>
		  <el-select
			v-model="value"
			multiple
			filterable
			remote
			reserve-keyword
			placeholder="请输入关键词"
			:remote-method="remoteMethod"
			:loading="loading">
			<el-option
			v-for="item in options"
			:key="item"
			:label="item"
			:value="item">
			</el-option>
		</el-select>
		<el-form ref="form" :model="form" label-position="top" label-width="200px" :disabled="disabled">
			<el-col :span="21" class="aggregateName">
				<el-form-item :label="$t('dataFlow.nodeName')" required>
					<el-input v-model="form.name" maxlength="20" show-word-limit></el-input>
				</el-form-item>
			</el-col>
			<el-row :gutter="30">
				<el-col :span="11">
					<el-form-item :label="$t('editor.cell.data_node.logminer.miningLogTime')" required>
						<el-select v-model="form.syncPoint.type">
							<el-option
								v-for="item in timeZoneList"
								:key="item"
								:label="item"
								:value="item"
							>
							</el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="11">
					<el-form-item style="margin-top: 26px;">
						<el-date-picker
							v-model="form.syncPoint.date"
							type="date"
							placeholder="选择日期"
							format="yyyy - MM - dd"
							value-format="yyyy-MM-dd">
						</el-date-picker>
					</el-form-item>
				</el-col>
			</el-row>
			<el-col :span="21" class="aggregateName">
				<el-form-item :label="'Oracle' + $t('editor.cell.data_node.logminer.logSaveTime')" required>
					<el-select v-model="form.logTtl" @change="changeAggFunction(item, index)">
						<el-option
							v-for="item in logSaveList"
							:key="item"
							:label="item + $t('editor.cell.data_node.logminer.day')"
							:value="item"
						>
						</el-option>
					</el-select>
				</el-form-item>
			</el-col>
			<el-row :gutter="20" class="loopFrom" v-for="(item, index) in form.logCollectorSettings" :key="item.connectionId">
				<el-col :span="21" class="fromLoopBox">
					<el-form-item
						:label="$t('editor.cell.data_node.logminer.logSourceSetting')"
						:prop="'logCollectorSettings.' + index + '.connectionId'"
						required
					>
						<el-select
						v-model="item.connectionId"
						:placeholder="$t('editor.cell.data_node.logminer.tableFilter.placeSletSource')"
						@change="changeConnectionId(item.connectionId)">
							<el-option
								v-for="item in connectionList"
								:key="item.value"
								:label="item.label"
								:value="item.value"
							>
							</el-option>
						</el-select>
					</el-form-item>
					<el-form-item
						:prop="'logCollectorSettings.' + index + '.selectType'"
						required
					>
						<el-select v-model="item.selectType" @change="changeTableType(item)">
							<el-option
								v-for="item in tableTypeList"
								:key="item.value"
								:label="item.label"
								:value="item.value"
							>
							</el-option>
						</el-select>
					</el-form-item>
					<el-form-item
						v-if="item.selectType !=='allTables'"
						:prop="'logCollectorSettings.' + index + '.selectTables'"
						required
					>
						<el-select
							v-model="item.selectTables"
							:value-key="item.connectionId"
							multiple
							@change="changeIncludeTables"
							allow-create
							filterable
							default-first-option
							:placeholder="item.selectType ==='reservationTable'?
							$t('editor.cell.data_node.logminer.tableFilter.tableFilter'):
							$t('editor.cell.data_node.logminer.tableFilter.placeholderDelete')"
							>
							<el-option
								v-for="(childItem, childIndex) in item.includeTablesList"
								:key="childIndex"
								:label="childItem + childIndex"
								:value="childItem"
							>
							</el-option>
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="2" class="right">
					<span @click="removeRow(item, index)" class="iconfont icon-quxiao remove"></span>
				</el-col>
			</el-row>
			<el-form-item class="btnClass">
				<el-button @click="addRow">+ {{ $t('editor.cell.data_node.logminer.add') }}</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script>
import _ from 'lodash';
import log from '../../../log';
import { mergeJoinTablesToTargetSchema } from '../../util/Schema';
import PrimaryKeyInput from '../../../components/PrimaryKeyInput';
import factory from '../../../api/factory';
let connectionApi = factory('connections');

let counter = 0;
let editorMonitor = null;
let tempSchemas = [];
export default {
	name: 'Aggregate',
	components: {PrimaryKeyInput},
	data() {
		return {
			value: [],
        options: ["Alabama", "Alaska", "Arizona",
        "Arkansas", "California", "Colorado",
        "Connecticut", "Delaware", "Florida",
        "Georgia", "Hawaii", "Idaho", "Illinois",
        "Indiana", "Iowa", "Kansas", "Kentucky",
        "Louisiana", "Maine", "Maryland",
        "Massachusetts", "Michigan", "Minnesota",
        "Mississippi", "Missouri", "Montana",
        "Nebraska", "Nevada", "New Hampshire",
        "New Jersey", "New Mexico", "New York",
        "North Carolina", "North Dakota", "Ohio",
        "Oklahoma", "Oregon", "Pennsylvania",
        "Rhode Island", "South Carolina",
        "South Dakota", "Tennessee", "Texas",
        "Utah", "Vermont", "Virginia",
        "Washington", "West Virginia", "Wisconsin",
        "Wyoming"],
			form: {
				name: '',
				logTtl: 0,
				syncPoint: {},
				// date: '',
				// timezone: '',
				// type: '',
				logCollectorSettings: [
					{
						connectionId: '',
						selectType: '',
						includeTables: [],      // 保留表
						selectTables: [],		// 排除表
						includeTablesList: [],   // 表数组
					}
				]
			},
			disabled: false,
			connectionList:[],       // 连接数组

			logSaveList: [1,2,3,4,5,6,7],
			timeZoneList : ['connTZ','localTZ','current'],
			tableTypeList: [
				{label: this.$t('editor.cell.data_node.logminer.allTables'), value: 'allTables'},
				{label: this.$t('editor.cell.data_node.logminer.reservationTable'), value: 'reservationTable'},
				{label: this.$t('editor.cell.data_node.logminer.exclusionTable'), value: 'exclusionTable'}
			]
		};
	},
	async mounted() {
		await this.loadDataSource();
		// this.$moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
		// this.form.aggregations.forEach(item => {
		// 	if (item.aggFunction === 'COUNT') {
		// 		item.aggExpression = '';
		// 	}
		// });
	},

	watch: {
		form: {
			deep: true,
			handler() {
				this.$emit('dataChanged', this.getData());
			}
		}
	},

	methods: {
		changeAggFunction(data) {
			console.log(data)
			// if (data.aggFunction !== 'COUNT') {
			// 	data.aggExpression = '1';
			// }
			// let aggFunctionArr = [];
			// for (let i = 0; i < this.form.aggregations.length; i++) {
			// 	let item = this.form.aggregations[i];
			// 	aggFunctionArr.push(item.name);
			// 	if (new Set(aggFunctionArr).size !== aggFunctionArr.length) {
			// 		this.countObj[data.aggFunction]++;
			// 	}
			// 	if (this.countObj[data.aggFunction] === 0) {
			// 		data.name = data.aggFunction;
			// 	} else {
			// 		data.name = data.aggFunction + '_' + this.countObj[data.aggFunction];
			// 	}
			// }
		},

		/**改变表类型**/
		changeTableType(data) {
			// this.changeIncludeTables(data);
		},

		/**改变连接**/
		changeConnectionId(val) {
			this.loadDataModels([val]);
		},

		/**获取表数据**/
		changeIncludeTables(data) {
			// let includeArr = [];
			// if (data.selectType === 'exclusionTable') {
			// 	includeArr = data.includeTablesList.filter(item =>{
			// 		return data.selectTables.indexOf(item) == -1
			// 	})
			// 	data.includeTables = includeArr;
			// } else if(data.selectType === 'reservationTable') {
			// 	data.includeTables  = data.selectTables;
			// }

			console.log(data,data.selectTables,'========')
		},

		/**获取连接信息**/
		async loadDataSource() {
			// this.databaseSelectConfig.loading = true;
			let result = await connectionApi.get({
				filter: JSON.stringify({
					where: {
						database_type: { in: ['mongodb'] }
					},
					fields: {
						name: 1,
						id: 1,
						database_type: 1,
						connection_type: 1,
						status: 1
					}
				})
			});

			// this.databaseSelectConfig.loading = false;
			if (result.data) {
				this.connectionList = result.data.map(item => {
					return {
						id: item.id,
						name: item.name,
						label: `${item.name} (${item.status})`,
						value: item.id
					};
				});
			}
		},

		/**获取连接表**/
		loadDataModels(ids) {
			if (!ids || !ids.length) {
				return;
			}
			let self = this,includeTablesList =[];

			connectionApi
				.get(ids)
				.then(result => {
					if (result.data) {
						let schemas = (result.data.schema && result.data.schema.tables) || [];
						if (schemas.length) {
							tempSchemas = schemas.sort((t1, t2) =>
								t1.table_name > t2.table_name ? 1 : t1.table_name === t2.table_name ? 0 : -1
							);
							tempSchemas.forEach(item => {
								includeTablesList.push(item.table_name)
							});
							// self.includeTablesList = [...new Set(self.includeTablesList)];
							self.form.logCollectorSettings.forEach( i => {
								if (i.connectionId === ids[0]) {
									i.includeTablesList = includeTablesList;
								}
							})

						}
					}
				})
		},

		addRow() {
			let list = {
				connectionId: '',
				selectType: 'allTables',
				includeTables: [],
				selectTables: [],
				includeTablesList: []
			};
			this.form.logCollectorSettings.push(list);
			// this.changeAggFunction(list);
			log('length', this.form.aggregations.length);
		},

		removeRow(item, index) {
			this.index = this.form.logCollectorSettings.indexOf(item);
			if (index !== -1) {
				this.form.logCollectorSettings.splice(index, 1);
			}
		},

		setData(data, cell, isSourceDataNode, vueAdapter) {
			this.form = {
				name: 'Orcle' + this.$t('editor.cell.data_node.logminer.name'),
				syncPoint:{
					type:  'localTZ',
					date: this.$moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
				},
				logTtl: 3,
				logCollectorSettings: [
					{
						connectionId: '',
						selectType: 'allTables',
						includeTables: [],
						selectTables: [],
						includeTablesList: [],
					}
				]
			};
			let self = this;
			if (data) {
				_.merge(this.form, data);

				// self.form.logCollectorSettings.map((item, index) => {
				// 	let exclusionTable = [];
				// 	if (item.selectType === 'reservationTable') {
				// 		item.selectTables = item.includeTables
				// 	}
				// });
			}

			// let inputSchemas = cell.getInputSchema();
			// let schema = mergeJoinTablesToTargetSchema(null, inputSchemas);
			// let object = {};
			// this.groupList = schema.fields ? schema.fields.sort((v1, v2) => (v1 > v2 ? 1 : v1 === v2 ? 0 : -1)) : [];
			// if (!!this.groupList && this.groupList.length > 0) {
			// 	this.groupList = this.groupList.reduce((cur, next) => {
			// 		if (!object[next.field_name]) {
			// 			object[next.field_name] = true;
			// 			cur.push(next);
			// 		}
			// 		return cur;
			// 	}, []);
			// }
			// this.expressionList = this.groupList;
			// log('Aggregate.setData.inputSchemas', inputSchemas, schema.fields);

			// if (!this.form.name) {
			// 	this.form.name = 'Orcle' + this.$t('editor.cell.data_node.logminer.name');
			// }

			editorMonitor = vueAdapter.editor;
		},

		getData() {
			return _.cloneDeep(this.form);
		},

		setDisabled(disabled) {
			this.disabled = disabled;
		},

		seeMonitor() {
			editorMonitor.goBackMontior();
		}
	}
};
</script>

<style scoped lang="less">
.logminer {
	width: 100%;
	height: 100%;
	padding: 20px;
	overflow: auto;
	box-sizing: border-box;
	background-color: #fafafa;

	.loopFrom {
		margin: 0 !important;

		.fromLoopBox {
			padding: 10px;
			margin-bottom: 12px;
			box-sizing: border-box;
			background-color: #fff;
			border: 1px solid #dedee4;
		}

		.remove {
			font-weight: bold;
			cursor: pointer;
			border: 1px solid #dedee4;
		}
	}
}
</style>
<style lang="less">
.logminer {
	.aggtip {
		position: absolute;
		top: -34px;
		left: 120px;
		.iconfont {
			display: inline-block;
			color: #999;
			cursor: pointer;
			transform: rotate(-180deg);
		}
	}
	.el-form--label-top .el-form-item__label {
		padding: 0;
		line-height: 26px;
	}

	.el-select {
		width: 100%;
	}

	.el-form-item {
		margin-bottom: 0;
		.el-form-item__label,
		.el-input__inner {
			font-size: 12px;
		}
		.el-input__inner {
			height: 30px;
			line-height: 30px;
		}
	}

	.aggregateName .el-form-item__content {
		z-index: 2;
	}

	.el-form-item__content {
		.el-button {
			padding: 8px 15px;
			font-size: 12px;
		}
		.el-input__inner[style='height: 40px;'] {
			height: 30px !important;
		}
	}
	.btnClass .el-form-item__content {
		line-height: 30px !important;
	}
}
</style>
