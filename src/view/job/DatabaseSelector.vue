<template>
	<div class="box">
		<div class="box-head">
			<div class="metadata-header-btns" style="width: 100%">
				<i class="iconfont icon-fangdajing" @click="isActive = !isActive"></i>
				<i class="iconfont icon-xiangshanghebing2" @click="handleDefault_expanded"></i>
				<i class="el-icon-refresh" v-if="!loading" @click="loadDataBase"></i>
				<i class="el-icon-loading" v-if="loading"></i>
			</div>
		</div>
		<div class="box-head-search" v-show="!isActive">
			<el-input
				placeholder="请输入内容"
				v-model="filterText"
				style="width: 210px"
				clearable
				@change="handleSearchTree()"
				@keyup.enter.native="handleSearchTree()"
				size="mini"
			>
				<el-select
					placeholder="搜表"
					v-model="databseType"
					slot="prepend"
					size="mini"
					class="box-head-select"
					@change="handleSearchTree()"
				>
					<el-option label="DB" value="db"></el-option>
					<el-option label="Table" value="table"></el-option>
				</el-select>
			</el-input>
		</div>
		<div class="treeBox" v-loading="loading" :element-loading-text="$t('dataFlow.dataLoading')">
			<div class="noData" v-if="loadingError">
				<ul>
					<li></li>
				</ul>
				<div>
					{{ $t('dataFlow.loadingError')
					}}<span class="clickLoad" @click="clickLoad">{{ $t('dataVerify.refresh') }}</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import factory from '../../api/factory';
import log from '../../log';
import { getUrlSearch } from '../../util/util';

const MetadataInstances = factory('MetadataInstances');

export default {
	name: 'TableSelector',
	data() {
		return {
			loadingError: false,
			count: 0,
			filterText: '',
			data: [],
			default_expanded: false,
			isActive: true,
			props: {
				children: 'children',
				label: 'label',
				isLeaf: 'leaf'
			},
			mapping: {
				mongodb: 'icon-database',
				mongo_view: 'icon-database',
				view: 'icon-table2'
			},
			loading: false
		};
	},
	mounted() {
		this.loadDataBase();
	},
	destroyed() {
		if (this.$el && this.$el.parentNode) {
			this.$el.parentNode.removeChild(this.$el);
		}
	},
	methods: {
		// 点击加载
		clickLoad() {
			this.loadDataBase();
		},
		loadDataBase() {
			let self = this;
			let mappingTemplate = getUrlSearch('mapping');
			let filter = {
				where: {
					'source.database_type': {
						in: [mappingTemplate]
					},
					is_deleted: false
				},
				order: 'original_name ASC',
				fields: {
					id: true,
					label: true,
					meta_type: true,
					original_name: true,
					source: true,
					'source._id': true,
					'source.user_id': true,
					'source.name': true,
					'source.database_type': true,
					'source.status': true
				}
			};
			if (this.$cookie.get('isAdmin') == 0)
				filter.where['source.user_id'] = { like: this.$cookie.get('user_id') };
			let params = {
				filter: JSON.stringify(filter)
			};
			self.loading = true;
			MetadataInstances.get(params)
				.then(res => {
					if (res.statusText === 'OK' || res.status === 200) {
						if (res.data) {
							// self.data.splice(0, self.data.length);
							self.data = [];
							res.data.forEach(record => {
								self.data.push({
									id: record.id,
									label: record.name || record.original_name,
									meta_type: record.meta_type,
									source: record.source || ''
								});
							});
							log('TableSelector.loadDataBase', self.data);
						}
					}
					self.loading = false;
					self.loadingError = false;
				})
				.catch(() => {
					self.loadingError = true;
					this.$message.error('MetadataInstances error');
					self.loading = false;
				});
		},
		filterNode(value, data) {
			if (!value) return true;
			return data.label.indexOf(value) !== -1;
		},
		handleGraph(data) {
			log('tableSelect handleGraph', data);
			let mapping = {
				collection: 'app.Collection',
				table: 'app.Table',
				database: 'app.Database',
				mongodb: 'app.Database',
				mongo_view: 'app.Collection',
				view: 'app.Table',
				'dummy db': 'app.Dummy',
				elasticsearch: 'app.ESNode',
				file: 'app.FileNode',
				gridfs: 'app.GridFSNode',
				'rest api': 'app.ApiNode',
				custom_connection: 'app.CustomNode'
			};

			let formData = {};
			let schema = {};
			if (data.meta_type === 'database') {
				if (
					data.source.database_type &&
					['dummy db', 'gridfs', 'file', 'elasticsearch', 'rest api', 'custom_connection', 'redis'].includes(
						data.source.database_type
					)
				) {
					formData = {
						connectionId: data.source._id,
						name: data.source.name || data.label,
						type: data.source.database_type
					};
				} else {
					formData = {
						connectionId: data.source._id,
						name: data.source.name || data.label
					};
				}
			} else if (data.meta_type === 'directory' || data.meta_type === 'ftp') {
				formData = {
					connectionId: data.source._id || data.source.id,
					name: data.source.name || data.label,
					type: data.source.database_type
				};
			} else if (['table', 'view', 'collection', 'mongo_view'].includes(data.meta_type)) {
				// let primaryKeys = '';
				if (data.fields) {
					// primaryKeys = data.fields
					// 	.filter(item => item.primary_key_position > 0)
					// 	.map(item => item.field_name)
					// 	.join(',');

					data.fields.forEach(
						item => (item.original_field_name = item.original_field_name || item.field_name)
					);
				}
				// log('primaryKeys', primaryKeys);
				formData = {
					connectionId: data.source._id || data.source.id,
					databaseType: data.database_type,
					tableName: data.original_name,
					sql: '',
					dropTable: false,
					type: data.meta_type,
					// primaryKeys: primaryKeys,
					name: data.label || data.original_name
				};
				schema = {
					table_name: data.name || data.original_name,
					cdc_enabled: true,
					meta_type: 'table',
					fields: data.fields
				};
			}

			this.count = this.count + 50;
			let cell = '';
			if (['database', 'directory', 'ftp', 'apiendpoint'].includes(data.meta_type)) {
				if (
					data.source.database_type &&
					['dummy db', 'gridfs', 'file', 'elasticsearch', 'rest api', 'custom_connection', 'redis'].includes(
						data.source.database_type
					)
				) {
					let dataType = data.source.database_type;
					cell = this.editor.graph.createCell(mapping[dataType], formData, schema);
				} else {
					cell = this.editor.graph.createCell(mapping[data.meta_type], formData, schema);
				}
			} else {
				cell = this.editor.graph.createCell(mapping[data.meta_type], formData, schema);
			}
			let coordinates = this.editor.graph.getClientOffset();
			cell.position(coordinates.x + 400, coordinates.y + this.count + 160);
			this.editor.graph.addCell(cell);
		}
	}
};
</script>

<style scoped lang="less">
.box {
	width: 234px;
}
.custom-tree-node {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-size: 11px;
	padding-right: 8px;
}

.el-checkbox-button .el-checkbox-button__inner {
	padding: 6px 12px;
}

.filter-icon {
	font-size: 14px;
	color: #48b6e2;
}

.filter-icon-table {
	font-size: 13px;
	color: #4aaf47;
}

.filter-Graph {
	display: inline-block;
	margin-right: 12px;
}
.table-label {
	display: inline-block;
	width: 180px;
	overflow: hidden;
	text-overflow: ellipsis;
}
.box-head-search {
	display: flex;
	justify-content: space-around;
	margin-top: 8px;
	font-size: 12px;
	margin-left: -10px;
	.box-head-select {
		width: 58px;
		font-size: 12px;
	}
}
.box-head {
	overflow: hidden;
	margin-top: 5px;
	margin-left: 160px;
	position: absolute;
	left: 0px;
	z-index: 100;
	top: -29px;
}
.ts-icon {
	color: #333;
}
.ts-tree {
	/*设置文字不能被选中     以下为css样式*/
	-webkit-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	user-select: none;
}
.table-tooltip {
	display: inline-block;
	width: 180px;
}
</style>
<style scoped>
/*头部样式*/
.metadata-header {
	width: 232px;
	height: 31px;
	background: #f1f1f1;
	border-bottom: 1px solid #dedee4;
	font-size: 12px;
	line-height: 31px;
	padding-left: 8px;
	display: flex;
}
</style>
<style lang="less">
.box-head {
	.el-input .el-input__inner {
		height: 24px;
		line-height: 30px;
	}
	.el-input .el-input__icon {
		line-height: 30px;
	}
	.el-input__suffix {
		left: 125px;
	}
	.el-input__icon {
		height: 100%;
		width: 0;
		text-align: center;
		-webkit-transition: all 0.3s;
		transition: all 0.3s;
		line-height: 40px;
	}
	.el-select .el-input {
		width: 120px;
	}
	.input-with-select .el-input-group__prepend {
		background-color: #fff;
	}
}
.box-head-search {
	.el-input-group__append,
	.el-input-group__prepend {
		padding: 0 18px;
	}
	.el-input__icon {
		width: 12px;
	}
	.el-input--mini .el-input__inner {
		height: 22px;
		line-height: 28px;
	}
	.el-input--mini .el-input__icon {
		line-height: 23px;
	}

	.el-input--suffix .el-input__inner {
		padding-right: 11px;
	}
	.el-input__inner {
		padding: 0 5px;
	}
}
.el-tree-node__expand-icon {
	color: #333;
}
.table-label {
	vertical-align: bottom;
}
.el-tree-node__content > .el-tree-node__expand-icon {
	padding: 6px;
	padding-right: 0;
}
.el-tree-node__content {
	height: 30px;
}

.treeBox {
	.el-loading-text {
		font-size: 12px;
		color: #666 !important;
	}
	.el-loading-spinner {
		margin-top: 70px;
	}
	.noData {
		height: calc(100% - 60px);
		padding-top: 9%;
		color: #999;
		font-size: 12px;
		background-color: #fff;
		div {
			text-align: center;
		}
		.clickLoad {
			cursor: pointer;
			color: #48b6e2;
		}
	}
}
</style>
