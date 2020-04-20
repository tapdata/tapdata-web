<template>
	<div class="database nodeStye">
		<head>
			<span class="headIcon iconfont icon-you2" type="primary"></span>
			<span class="txt">{{$t("editor.nodeSettings")}}</span>
		</head>
		<div class="nodeBody">
			<el-form class="e-form" label-position="top" label-width="160px" :model="model" ref="form">
				<el-form-item
						class="e-form" :label="$t('editor.cell.data_node.database.form.label')"
						prop="connectionId" :rules="rules" required>
					<el-select
							filterable v-model="model.connectionId" @change="getSelectType"
							:placeholder="$t('editor.cell.data_node.database.form.placeholder')" size="mini">
						<el-option
								v-for="(item, idx) in databases"
								:label="`${item.name} (${$t('connection.status.' + item.status) || item.status})`"
								:value="item.id"
								v-bind:key="idx"></el-option>
					</el-select>
				</el-form-item>
				<div class="databaseInfo">
					<span v-show="database_type">{{database_type}}</span>
				</div>
			</el-form>
		</div>
		<div class="processingBody">
			<div class="allCheck" v-if="activeName ==='first'">
				<el-checkbox v-model="allChecked" @change='checkedAll'></el-checkbox>
				<span @click="bulkRemoval()">批量移除</span>
			</div>

			<div class="allCheck" v-if="activeName ==='second'">
				<el-checkbox v-model="allChecked" @change='checkedAll'></el-checkbox>
				<span @click="bulkRevocation()">批量撤销</span>
			</div>

			<el-tabs class="e-tabs" v-model="activeName" @tab-click="handleClick">

				<el-tab-pane :label="'待复制队列' + '('+tables.length+')'" name="first">
					<el-row class="list"
							v-for="(item,index) in tables"
							:key="item.id"
							:gutter="20">
						<el-col :span="2">
							<el-checkbox v-model="item.checked" @change='checkedOne(item,index)'></el-checkbox>
						</el-col>
						<el-col :span="17">
							<i class="iconfont icon-table2"></i>
							<span class="tableName">{{item.table_name}}</span>
						</el-col>
						<el-col :span="5">
							<el-button type="text" @click="removeTable(item,index)">移除</el-button>
						</el-col>
					</el-row>
				</el-tab-pane>

				<el-tab-pane :label="'已移除表' + '('+model.excludeTables.length+')'" name="second">
					<el-row class="list"
							v-for="(item,index) in model.excludeTables"
							:key="item.id"
							:gutter="20">
						<el-col :span="2">
							<el-checkbox v-model="item.checked" @change='checkedOne(item,index)'></el-checkbox>
						</el-col>
						<el-col :span="17">
							<i class="iconfont icon-table2"></i>
							<span class="tableName">{{item.table_name}}</span>
						</el-col>
						<el-col :span="5">
							<el-button type="text" @click="undotble(item,index)">撤销</el-button>
						</el-col>
					</el-row>
				</el-tab-pane>
			</el-tabs>
		</div>

	</div>
</template>

<script>
	import factory from '../../api/factory';
	import _ from 'lodash';

	let connections = factory('connections');

	export default {
		name: "Database",

		props: {
			connection_type: {
				type: String,
				default: 'source'
			}
		},

		data() {
			return {
				allChecked: false,
				checkList: [],
				hoverIndex: -1,
				tables: [],
				databases: [],
				activeName: 'first',
				rules: {
					connectionId: [
						{
							required: true,
							trigger: 'blur',
							message: this.$t('editor.cell.data_node.database.form.placeholder')
						},
					]
				},
				model: {
					connectionId: "",
					excludeTables: [],
				},
				database_type: ''
			};
		},

		async mounted() {
			let result = await connections.get({
				filter: JSON.stringify({
					where: {
						database_type: {nin: ['file', 'dummy', 'gridfs', 'rest api']}
					},
					fields: {
						name: 1, id: 1, database_type: 1, connection_type: 1, status: 1
					},
					order: 'name ASC'
				})
			});

			if (result.data) {
				this.databases = result.data;
			}
		},

		watch: {
			model: {
				deep: true,
				handler() {
					this.$emit('dataChanged', this.getData());
				}
			},
			'model.connectionId': {
				immediate: true,
				handler() {
					this.loadDataModels(this.model.connectionId);
				}
			},
		},

		methods: {
			// 获取表名称
			loadDataModels(connectionId) {
				if (!connectionId) {
					return;
				}
				let _this = this;

				connections.get([connectionId]).then(result => {
					if (result.data) {
						let tables = result.data.schema && result.data.schema.tables || [];
						tables = tables.sort((t1, t2) => t1.table_name > t2.table_name ? 1 : t1.table_name === t2.table_name ? 0 : -1);
						tables.forEach(item => {
							_this.$set(item, 'checked', false);
						});

						let remove_tableName = this.model.excludeTables.map(item => item.table_name);
						_this.tables = tables.filter(item => !remove_tableName.includes(item.table_name));
					}
				});
			},

			//获取databse下拉的信息
			getSelectType(id) {
				this.databases.forEach(item => {
					if (id === item.id) {
						this.database_type = item.database_type;
					}
				})
			},

			//切换标签
			handleClick(tab, event) {
				this.checkList = [];
				this.allChecked = false;
				if (tab.name === "second") {
					this.model.excludeTables.forEach(item => {
						if (item.checked) {
							item.checked = false;
						}
					})
				} else {
					this.tables.forEach(item => {
						if (item.checked) {
							item.checked = false;
						}
					});
				}
			},

			// 批量撤销
			bulkRevocation() {
				let removeArr = [];
				removeArr = this.model.excludeTables.filter(item => item.checked === true);
				this.model.excludeTables = this.model.excludeTables.filter(item => item.checked === false);
				this.tables.push(...removeArr);
				if (this.model.excludeTables.length === 0) {
					this.allChecked = false;
				}
			},

			// 批量移除
			bulkRemoval(arr) {
				let removeArr = this.tables.filter(item => item.checked === true);
				this.tables = this.tables.filter(item => item.checked === false);
				this.model.excludeTables.push(...removeArr);
				if (this.tables.length === 0) {
					this.allChecked = false;
				}
			},

			// 撤销
			undotble(item, index) {
				this.tables.push(item);
				this.model.excludeTables.splice(index, 1);
			},

			// 移除
			removeTable(item, index) {
        this.model.excludeTables.push(item);
				this.tables.splice(index, 1);
			},

			// 单选
			checkedOne(item, index) {
				if (item.checked) {
					this.checkList.push(item.id);
				} else {
					this.checkList.forEach((el, childIndex) => {
						if (!el.checked && item.id === el) {
							this.checkList.splice(childIndex, 1);
						}
					});
				}

				if (this.tables.length === this.checkList.length) {
					this.allChecked = true;
				} else {
					this.allChecked = false;
				}

			},

			// 全选
			checkedAll(val) {
				this.checkList = [];
				if (val) {
					this.tables.forEach(item => {
						item.checked = true;
						this.checkList.push(item.id);
					});
				} else {
					this.tables.forEach(item => {
						item.checked = false;
					});
					this.checkList = [];
				}

			},

			setData(data) {
				if (data) {
					Object.keys(data).forEach(key => this.model[key] = data[key]);
				}
			},
			getData() {
				let result = _.cloneDeep(this.model);
				if (result.connectionId) {
					let database = this.databases.filter(db => db.id === result.connectionId);
					if (database && database.length > 0) {
						result.name = database[0].name;
					}
				}
				return result;
			}
		}
	};
</script>
<style lang="less">
	.database {
		.processingBody {
			position: relative;
			height: calc(100% - 165px);

			.allCheck {
				position: absolute;
				right: 25px;
				line-height: 36px;
				z-index: 2;
				font-size: 12px;

				span {
					padding-left: 3px;
					cursor: pointer;
				}

				span:hover {
					color: #48b6e2;
				}
			}

			.el-tabs {
				height: 100%;

				.el-tabs__nav {
					margin: 0 25px;

					.el-tabs__item {
						font-size: 12px;
					}

					.el-tabs__active-bar {
						height: 4px;
					}
				}

				.el-tabs__content {
					height: calc(100% - 55px);
				}

				.el-tab-pane {
					height: 100%;
					overflow: auto;
				}

				.list {
					width: 100%;
					height: 36px;
					line-height: 36px;
					padding: 0 25px;
					font-size: 12px;
					overflow: hidden;

					.el-button--text {
						font-size: 12px;
						opacity: 0;
						visibility: hidden;
					}

					.el-checkbox {
						opacity: 0;
						visibility: hidden;
					}
				}

				.list {
					.iconfont {
						color: #4AAF47;
					}

					.tableName {
						color: #48b6e2;
					}

					background-color: #E7F5FA;

					.el-checkbox {
						opacity: 1;
						visibility: visible;
					}

					.el-button--text {
						opacity: 1;
						visibility: visible;
					}
				}
			}
		}

		.databaseInfo {
			span {
				margin-right: 20px;
				padding: 5px 10px;
				font-size: 12px;
				color: #666;
				background: #eee;
				border-radius: 10px;
			}
		}
	}
</style>
