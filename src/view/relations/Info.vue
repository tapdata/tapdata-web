<template>
	<div class="lineage-info-wrap" v-show="model.previewVisible">
		<div class="bar">
			<el-button class="back-btn-icon-box" @click="goBack"
				><i class="iconfont icon-right-circle back-btn-icon"></i
			></el-button>
		</div>
		<div class="lineage-info-content">
			<template v-if="model.level === 'table'">
				<header class="header">
					<span>{{ tableName }}</span>
					<div class="connection" @click="goConnection">{{ connections.name }}</div>
				</header>
				<el-tabs v-model="activeName" type="card" class="lineage-info-tab">
					<el-tab-pane :label="$t('relations.field')" name="first">
						<div class="relation-btn-wrap">
							<el-button class="relation-btn" type="text" @click="handleFields">{{
								$t('dataMap.fieldLevel')
							}}</el-button>
						</div>
						<el-input
							class="customize-field"
							size="mini"
							:placeholder="$t('relations.customFields')"
							v-model="customFields"
						></el-input>
						<div class="table-wrap">
							<el-table
								class="field-table"
								ref="multipleTable"
								:data="fields"
								@selection-change="handleSelectionChange"
							>
								<el-table-column type="selection"></el-table-column>
								<el-table-column prop="name" :label="$t('relations.label')">
									<template slot-scope="scope">
										<div class="database-img">
											<img :src="getImgByType(scope.row.java_type)" />
										</div>
										<div class="database-text">
											{{ scope.row.field_name }}
										</div>
									</template>
								</el-table-column>
							</el-table>
						</div>
					</el-tab-pane>
					<el-tab-pane :label="$t('relations.attributes')" name="second">
						<ul>
							<li v-for="(value, key) in metaData" :key="key">
								<span class="label">{{ metaDataFields[key] }}</span>
								<span v-if="['createTime', 'last_updated'].includes(key)">{{
									$moment(value).format('YYYY-MM-DD HH:mm:ss')
								}}</span>
								<span v-else>{{ value }}</span>
							</li>
							<li v-for="(value, key) in connections" :key="`ii_${key}`">
								<span class="label">{{ connectionsFields[key] }}</span>
								<span>{{ value }}</span>
							</li>
						</ul>
					</el-tab-pane>
				</el-tabs>
			</template>
			<template v-else>
				<header class="header">
					<span class="text">{{ model.sourceName }} -> {{ model.targetName }}</span>
				</header>
				<el-menu class="el-menu-vertical-lineage" :default-openeds="defaultOpeneds">
					<template v-for="(item, index1) in model.dataFlows">
						<el-submenu :key="item.id" :index="`${index1 + 1}`" class="parentMenu">
							<template slot="title">
								<span slot="title">
									<span>{{ $t('relations.task') }}[ {{ item.name }} ]</span>
									<span class="keywords" @click="goJob(item.id)">{{
										$t('relations.viewTaskInfo')
									}}</span>
								</span>
							</template>
							<template v-for="(processor, index2) in item.processors">
								<el-submenu
									v-if="processor.operations || processor.aggregations"
									:key="processor.id"
									:index="`${index1 + 1}-${index2 + 1}`"
								>
									<template slot="title">
										<span slot="title">{{
											`${processorMap[processor.type]} [${processor.name}]`
										}}</span>
									</template>
									<div v-if="processor.type === 'field_processor'">
										<template v-for="(op, index3) in processor.operations">
											<el-menu-item
												:index="`${index1 + 1}-${index2 + 1}-${index3 + 1}`"
												:key="op.id"
											>
												<span v-if="['CREATE'].includes(op.op)">
													<span class="label">{{ $t('relations.add') }}</span>
													<span class="value"> : {{ op.field }}</span>
												</span>
												<span v-if="['REMOVE'].includes(op.op)">
													<span class="label">{{ $t('relations.delete') }}</span>
													<span class="value"> : {{ op.field }}</span>
												</span>
												<span v-if="['RENAME'].includes(op.op)">
													<span class="label">{{ $t('relations.rename') }}</span>
													<span class="value"> : {{ op.field }} -> {{ op.operand }}</span>
												</span>
												<span v-if="['CONVERT'].includes(op.op)">
													<span class="label">{{ $t('relations.changeType') }}</span>
													<span class="value">
														: {{ op.originalDataType }} -> {{ op.operand }}</span
													>
												</span>
												<span v-if="['JS'].includes(op.op)">
													<span class="label">{{ $t('relations.script') }}</span>
													<span class="keywords" @click="handleShowScript(op.script)">
														: {{ $t('relations.fieldScript') }}</span
													>
												</span>
											</el-menu-item>
										</template>
									</div>
									<div v-if="processor.type === 'aggregation_processor'">
										<template v-for="(op, index3) in processor.aggregations">
											<el-menu-item
												:key="op.id"
												:index="`${index1 + 1}-${index2 + 1}-${index3 + 1}`"
											>
												<span v-if="['COUNT'].includes(op.aggFunction)">
													<span class="label">{{ $t('relations.count') }}</span>
													<span
														v-if="op.groupByExpression && op.groupByExpression.length > 0"
													>
														, {{ $t('relations.group')
														}}{{ op.groupByExpression.join(',') }}</span
													>
												</span>
												<span v-if="['SUM'].includes(op.aggFunction)">
													<span class="label">{{ $t('relations.sum') }}</span>
													<span
														v-if="op.groupByExpression && op.groupByExpression.length > 0"
													>
														, {{ $t('relations.group')
														}}{{ op.groupByExpression.join(',') }}</span
													>
												</span>
												<span v-if="['AVG'].includes(op.aggFunction)">
													<span class="label">{{ $t('relations.average') }}</span>
													<span
														v-if="op.groupByExpression && op.groupByExpression.length > 0"
													>
														, {{ $t('relations.group')
														}}{{ op.groupByExpression.join(',') }}</span
													>
												</span>
												<span v-if="['MAX'].includes(op.aggFunction)">
													<span class="label">{{ $t('relations.MAX') }}</span>
													<span
														v-if="op.groupByExpression && op.groupByExpression.length > 0"
													>
														, {{ $t('relations.group')
														}}{{ op.groupByExpression.join(',') }}</span
													>
												</span>
												<span v-if="['MIN'].includes(op.aggFunction)">
													<span class="label">{{ $t('relations.min') }}</span>
													<span
														v-if="op.groupByExpression && op.groupByExpression.length > 0"
													>
														, {{ $t('relations.group')
														}}{{ op.groupByExpression.join(',') }}</span
													>
												</span>
											</el-menu-item>
										</template>
									</div>
								</el-submenu>
								<div v-if="processor.type === 'js_processor'" :key="processor.id">
									<el-menu-item :index="`${index1 + 1}-${index2 + 1}`">
										<span
											v-if="processor.script"
											class="keywords"
											@click="handleShowScript(processor.script)"
											>{{ $t('relations.script') }}[function process(record){...}]</span
										>
									</el-menu-item>
								</div>
							</template>
						</el-submenu>
					</template>
				</el-menu>
			</template>
		</div>
		<el-dialog :visible.sync="showScriptVisible" width="60%" :before-close="handleCloseScript">
			<JsEditor :code.sync="showScript" ref="jsEditor" width="100%" v-if="showScriptVisible"></JsEditor>
		</el-dialog>
	</div>
</template>

<script>
import JsEditor from '@/components/JsEditor';
import _ from 'lodash';
export default {
	name: 'Info',
	components: { JsEditor },
	props: {
		model: {
			required: true
		}
	},
	data() {
		return {
			activeName: 'first',
			metaData: {},
			connections: {},
			fields: [],
			multipleSelection: [],
			tableName: '',
			customFields: '',
			showScript: '',
			showScriptVisible: false,
			defaultOpeneds: [],
			metaDataFields: {
				name: this.$t('relations.originalName'),
				qualified_name: this.$t('relations.qualified_name'),
				meta_type: this.$t('relations.meta_type'),
				create_source: this.$t('relations.create_source'),
				createTime: this.$t('relations.createTime'),
				last_updated: this.$t('relations.last_updated'),
				last_user_name: this.$t('relations.last_user_name')
			},
			connectionsFields: {
				name: this.$t('relations.field_processor'),
				database_host: this.$t('relations.database_host'),
				database_port: this.$t('relations.database_port'),
				database_username: this.$t('relations.database_username'),
				database_name: this.$t('relations.database_name'),
				database_owner: this.$t('relations.database_owner')
			},
			processorMap: {
				field_processor: this.$t('relations.field_processor'),
				js_processor: this.$t('relations.js_processor'),
				aggregation_processor: this.$t('relations.aggregation_processor')
			},
			statusBtMap: {
				// scheduled, draft, running, stopping, error, paused, force stopping
				run: { draft: true, error: true, paused: true },
				stop: { running: true },
				delete: { draft: true, error: true, paused: true },
				edit: { draft: true, error: true, paused: true },
				reset: { draft: true, error: true, paused: true },
				forceStop: { stopping: true }
			}
		};
	},
	watch: {
		'model.previewVisible': {
			handler() {
				if (!this.model.previewVisible) {
					this.clear();
				}
			}
		},
		'model.connectionId': {
			handler() {
				if (this.model.connectionId) {
					this.getConnections();
				}
			}
		},
		'model.tableId': {
			handler() {
				if (this.model.tableId) {
					this.getMetaData();
				}
			}
		}
	},
	methods: {
		getImgByType(type) {
			if (!type) {
				type = 'default';
			}
			return require(`../../../static/image/types/${type.toLowerCase()}.png`);
		},
		goBack() {
			this.$emit('previewVisible', false);
		},
		//清空数据
		clear() {
			this.customFields = '';
			this.$refs.multipleTable && this.$refs.multipleTable.clearSelection();
		},
		getMetaData() {
			let params = {
				filter: {
					where: {
						qualified_name: this.model.tableId
					}
				}
			};
			this.$api('MetadataInstances')
				.get(params)
				.then(result => {
					let data = result.data || [];
					if (data && data.length !== 0) {
						this.metaData = {
							name: data[0].name ? `${data[0].name}(${data[0].original_name})` : data[0].original_name,
							qualified_name: data[0].qualified_name,
							meta_type: data[0].meta_type,
							create_source: data[0].source.name,
							createTime: data[0].createTime,
							last_updated: data[0].last_updated,
							last_user_name: data[0].last_user_name
						};
						this.tableName = data[0].name || data[0].original_name;
						this.fields = data[0].fields;
					}
				});
		},
		getConnections() {
			this.$api('connections')
				.get([this.model.connectionId])
				.then(result => {
					let data = result.data || {};
					if (data) {
						this.connections = {
							name: data.database_username || '',
							database_host: data.database_host,
							database_port: data.database_port,
							database_username: data.database_username
						};
					}
				});
		},
		//表格所选中的fields
		handleSelectionChange(val) {
			this.multipleSelection = val;
		},
		handleFields() {
			if (this.multipleSelection.length === 0 && this.customFields === '') {
				this.$message.error('请选择字段或者输入自定义字段');
				return;
			}
			let customField = [];
			if (this.customFields !== '') {
				customField = this.customFields.split(',');
			}
			let fields = [];
			fields = this.multipleSelection.map(field => field.field_name);
			//合并数组
			fields = Array.from(new Set([...fields, ...customField]));
			this.$emit('previewVisible', false);
			this.$emit('handleFields', this.model.tableId, fields);
		},
		//显示脚本
		handleShowScript(script) {
			this.showScript = _.cloneDeep(script);
			this.showScriptVisible = true;
		},
		handleCloseScript() {
			this.showScript = '';
			this.showScriptVisible = false;
		},
		//跳转到任务列表
		async goJob(id) {
			let result = await this.$api('DataFlows').get([id]);
			if (result.data) {
				let isMoniting = !this.statusBtMap['edit'][result.data.status];
				let routeUrl = this.$router.resolve({
					path: '/job',
					query: { id: id, isMoniting: isMoniting, mapping: result.data.mappingTemplate }
				});
				window.open(routeUrl.href, 'monitor_' + id);
			} else {
				this.$message.error('当前选中任务被删除或者是不存在,id为:' + id);
			}
		},
		goConnection() {
			this.$router.push('/connections');
		},

		// 打开所有菜单
		handleOpenAllFlows() {
			this.$nextTick(() => {
				const { dataFlows } = this.model;
				let opened = [];
				dataFlows.forEach((item, i) => {
					if (item.processors) {
						opened.push(`${i + 1}`);
						item.processors.forEach((processor, ii) => {
							(processor.operations || processor.aggregations) && opened.push(`${i + 1}-${ii + 1}`);
						});
					}
				});
				this.defaultOpeneds = opened;
			});
		}
	}
};
</script>

<style scoped lang="less">
.lineage-info-wrap {
	position: absolute;
	right: -21px;
	top: 40px;
	background: #fff;
	height: calc(100% - 44px);
	width: 430px;
	overflow: hidden;
	border: 1px solid rgba(255, 255, 255, 100);
	.header {
		padding-top: 20px;
		padding-left: 20px;
		margin-bottom: 10px;
		color: rgba(72, 182, 226, 100);
		font-size: 18px;
		text-align: left;
		font-weight: bold;
		span {
			white-space: pre-line;
			word-break: break-all;
			word-wrap: break-word;
		}
	}
	.connection {
		color: #999;
		font-size: 12px;
		margin-bottom: 10px;
		cursor: pointer;
	}
	.bar {
		height: 30px;
		font-size: 12px;
		background: #f5f5f5;
		border: 1px solid #dedee4;
		line-height: 30px;
		.back-btn-icon-box {
			width: 30px;
			height: 30px;
			display: inline-block;
			border-radius: 0;
			line-height: 1;
			white-space: nowrap;
			cursor: pointer;
			background: #48b6e2;
			border: 0;
			-webkit-appearance: none;
			text-align: center;
			-webkit-box-sizing: border-box;
			box-sizing: border-box;
			outline: 0;
			margin: 0;
			-webkit-transition: 0.1s;
			transition: 0.1s;
			font-weight: normal;
			padding: 0;
			font-size: 14px;
		}
		.back-btn-icon-box:hover {
			background: #6dc5e8;
		}
		.back-btn-icon {
			color: #fff;
		}
	}
	/*.parentMenu {*/
	/*	background-color: #f5f5f5;*/
	/*}*/
	.el-menu-vertical-lineage {
		.keywords {
			color: rgba(72, 182, 226, 100);
			cursor: pointer;
		}
		.label {
			display: inline-block;
			font-weight: bold;
		}
		.value {
			white-space: pre-line;
			word-break: break-all;
			word-wrap: break-word;
		}
	}
	.lineage-info-tab {
		padding: 0 20px;
		ul {
			font-size: 12px;
			color: #666;
			padding-left: 20px;
			margin-top: 10px;
			li {
				margin-bottom: 10px;
			}
			.label {
				display: inline-block;
				text-align: left;
				width: 100px;
			}
		}
		.relation-btn-wrap {
			display: flex;
			margin-top: 10px;
			justify-content: flex-end;
			.relation-btn {
				padding: 0;
			}
		}
		.customize-field {
			margin: 10px 10px 10px 0;
		}
		.table-wrap {
			display: flex;
			flex: 1;
			overflow: hidden;
			.field-table {
				overflow: auto;
				max-height: 442px;
			}
			.database-img {
				vertical-align: middle;
				width: 28px;
				height: 28px;
				background: #ffffff;
				border-radius: 3px;
				display: flex;
				justify-content: center;
				align-items: center;
				float: left;
				img {
					width: 60%;
				}
			}
			.database-text {
				float: left;
				margin-left: 10px;
			}
		}
	}
}
</style>
<style lang="less">
.lineage-info-drawer {
	.el-drawer {
		box-shadow: -2px 0px 8px 0px rgba(0, 0, 0, 0.1);
	}
	.el-drawer.rtl {
		top: 48px;
	}
}
.lineage-info-wrap {
	.el-tabs--card > .el-tabs__header .el-tabs__item:focus.is-active.is-focus:not(:active) {
		box-shadow: none;
		border-radius: 0;
	}
	.field-table table thead tr th {
		padding: 0px;
		line-height: 30px;
		background: rgb(250, 250, 250);
		color: rgb(153, 153, 153);
		cursor: pointer;
	}
	.lineage-info-tab {
		.el-tabs__item {
			height: 24px;
			line-height: 24px;
			font-size: 12px;
		}
		.el-tabs__header {
			margin: 0;
		}
	}
	.el-menu-vertical-lineage {
		.el-menu-item,
		.el-submenu__title {
			height: 30px;
			line-height: 30px;
			font-size: 12px;
		}
		.el-menu-item:focus,
		.el-menu-item:hover {
			background-color: #fff;
		}
		.el-submenu__title:hover {
			background-color: #fff;
		}
		.el-menu-item.is-active {
			color: #303133;
		}
		/*.parentMenu .el-submenu__title :hover {*/
		/*	background-color: #f5f5f5*/
		/*}*/
	}

	.lineage-info-content {
		overflow-y: auto;
		height: calc(100% - 32px);
	}
}
</style>
