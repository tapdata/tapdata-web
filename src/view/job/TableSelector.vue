<template>
	<div class="box">
		<div class="box-head">
			<el-input class="search" v-model="filterText" clearable @change="handleSearchTree()"
				><i slot="prefix" class="el-input__icon el-icon-search"></i
			></el-input>
			<i class="iconfont icon-xiangshanghebing2" @click="handleDefault_expanded"></i>
			<i class="el-icon-refresh" v-if="!loading" @click="loadDataBase"></i>
			<i class="el-icon-loading" v-if="loading"></i>
		</div>
		<div class="treeBox" v-loading="loading" :element-loading-text="$t('dataFlow.dataLoading')">
			<el-tree
				:data="data"
				:props="props"
				node-key="id"
				:expand-on-click-node="false"
				lazy
				:load="loadTables"
				icon-class="ts-icon iconfont icon-hebing-copy "
				:filter-node-method="filterNode"
				ref="tree"
				class="ts-tree"
			>
				<span class="custom-tree-node" slot-scope="{ node, data }">
					<span @click="handleGraph(data)">
						<span
							v-if="data.meta_type !== 'database'"
							:class="`iconfont filter-icon-table ${mapping[data.meta_type]}`"
						></span>
						<span
							v-if="['database', 'directory', 'ftp', 'apiendpoint'].includes(data.meta_type)"
							:class="
								`iconfont filter-icon-table ${
									mapping[data.source.database_type]
										? mapping[data.source.database_type]
										: mapping['database']
								} `
							"
						></span>
						<span class="table-label">
							<el-tooltip class="table-tooltip" effect="dark" :content="node.label" placement="right">
								<span>{{ node.label }}</span>
							</el-tooltip>
						</span>
					</span>
					<!--          <span @click="handleGraph(data)" class="iconfont icon-xiayibu1 filter-icon filter-Graph"></span>-->
				</span>
			</el-tree>
			<div class="noData" v-if="loadingError">
				<div>
					{{ $t("dataFlow.loadingError")}}<span class="clickLoad" @click="clickLoad">{{ $t("dataVerify.refresh") }}</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import factory from "../../api/factory";
import log from "../../log";

const MetadataInstances = factory("MetadataInstances");

export default {
	name: "TableSelector",
	data() {
		return {
			loadingError: false,
			count: 0,
			filterText: "",
			data: [],
			default_expanded: false,
			props: {
				children: "children",
				label: "label",
				isLeaf: "leaf"
			},
			mapping: {
				collection: "icon-collection",
				table: "icon-table2",
				database: "icon-database",
				mongodb: "icon-database",
				mongo_view: "icon-database",
				view: "icon-table2",
				"dummy db": "icon-dummy1",
				elasticsearch: "icon-elastic-search-clust",
				file: "icon-file1",
				gridfs: "icon-gridfs2",
				"rest api": "icon-api",
				custom_connection: "icon-custom1"
			},
			loading: false
		};
	},
	mounted() {
		this.loadDataBase();
	},

	methods: {
		// 点击加载
		clickLoad() {
			this.loadDataBase();
		},
		handleSearchTree() {
			let self = this;
			let params = {
				filter: JSON.stringify({
					where: {
						meta_type: {
							in: ["database", "directory", "ftp", "apiendpoint", "table", "collection"]
						},
						original_name: {
							like: self.filterText,
							options: "i"
						},
						is_deleted: false
					},
					order: "original_name ASC"
				})
			};
			self.loading = true;
			MetadataInstances.get(params)
				.then(res => {
					if (res.statusText === "OK" || res.status === 200) {
						if (res.data) {
							// self.data.splice(0, self.data.length);
							self.data = [];
							res.data.forEach(record => {
								let node = {
									id: record.id,
									label: record.name || record.original_name,
									meta_type: record.meta_type,
									source: record.source || ""
								};
								if (["collection", "table", "mongo_view", "view"].includes(record.meta_type)) {
									node.leaf = true;
								}
								self.data.push(node);
							});
						}
					}
					self.loading = false;
					self.loadingError = false;
				})
				.catch(e => {
					self.loadingError = true;
					this.$message.error("MetadataInstances error");
					self.loading = false;
				});
		},
		loadDataBase() {
			let self = this;
			this.filterText = "";
			let params = {
				filter: JSON.stringify({
					where: {
						// 'source.database_type':{
						// 	nin:["file","dummy db","gridfs","rest api"]
						// },
						// meta_type: {
						// 	in: ['database']
						// },
						meta_type: {
							in: ["database", "directory", "ftp", "apiendpoint"]
						},
						is_deleted: false
					},
					order: "original_name ASC"
				})
			};
			self.loading = true;
			MetadataInstances.get(params)
				.then(res => {
					if (res.statusText === "OK" || res.status === 200) {
						if (res.data) {
							// self.data.splice(0, self.data.length);
							self.data = [];
							res.data.forEach(record => {
								self.data.push({
									id: record.id,
									label: record.name || record.original_name,
									meta_type: record.meta_type,
									source: record.source || ""
								});
							});
							log("TableSelector.loadDataBase", self.data);
						}
					}
					self.loading = false;
					self.loadingError = false;
				})
				.catch(e => {
					self.loadingError = true;
					this.$message.error("MetadataInstances error");
					self.loading = false;
				});
		},
		loadTables(node, resolve) {
			if (node.level === 0) {
				return resolve(this.data);
			}
			if (node.level > 1) {
				return resolve([]);
			}
			if (
				["dummy db", "gridfs", "file", "elasticsearch", "rest api", "custom_connection"].includes(
					node.data.source.database_type
				)
			) {
				return resolve([]);
			}
			let params = {
				filter: JSON.stringify({
					where: {
						meta_type: {
							in: ["collection", "table", "mongo_view", "view"]
						},
						databaseId: {
							regexp: `^${node.key}$`
						},
						is_deleted: false
					},
					order: "original_name ASC" || "name ASC"
				})
			};
			MetadataInstances.get(params)
				.then(res => {
					if (res.statusText === "OK" || res.status === 200) {
						if (res.data) {
							let childNodes = [];
							res.data.forEach(record => {
								childNodes.push({
									id: record.id,
									_id: record.source._id,
									label: record.name || record.original_name,
									expanded: true,
									leaf: true,
									meta_type: record.meta_type,
									database_type: record.source.database_type || "",
									original_name: record.original_name || "",
									fields: record.fields
								});
							});
							resolve(childNodes);
							log("childNodes", childNodes);
						}
					}
				})
				.catch(e => {
					// TODO: alert error
				});
		},
		handleDefault_expanded() {
			let self = this;
			let treeList = this.data;
			for (let i = 0; i < treeList.length; i++) {
				self.$refs.tree.store.nodesMap[treeList[i].id].expanded = false;
			}
		},
		filterNode(value, data) {
			if (!value) return true;
			return data.label.indexOf(value) !== -1;
		},
		handleGraph(data) {
			log("tableSelect handleGraph", data);
			let mapping = {
				collection: "app.Collection",
				table: "app.Table",
				database: "app.Database",
				mongodb: "app.Database",
				mongo_view: "app.Collection",
				view: "app.Table",
				"dummy db": "app.Dummy",
				elasticsearch: "app.ESNode",
				file: "app.FileNode",
				gridfs: "app.GridFSNode",
				"rest api": "app.ApiNode",
				custom_connection: "app.CustomNode"
			};

			let formData = {};
			let schema = {};
			if (data.meta_type === "database") {
				if (
					data.source.database_type &&
					["dummy db", "gridfs", "file", "elasticsearch", "rest api", "custom_connection"].includes(
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
			}else if(data.meta_type === "directory" || data.meta_type === "ftp"){
				formData = {
					connectionId: data.source._id,
					name: data.source.name || data.label,
					type: data.source.database_type
				};
			} else if (["table", "view", "collection", "mongo_view"].includes(data.meta_type)) {
				let primaryKeys = "";
				if (data.fields) {
					primaryKeys = data.fields
						.filter(item => item.primary_key_position > 0)
						.map(item => item.field_name)
						.join(",");

					data.fields.forEach(
						item => (item.original_field_name = item.original_field_name || item.field_name)
					);
				}
				log("primaryKeys", primaryKeys);
				formData = {
					connectionId: data._id || data.id,
					databaseType: data.database_type,
					tableName: data.original_name,
					sql: "",
					dropTable: false,
					type: data.meta_type,
					primaryKeys: primaryKeys,
					name: data.label || data.original_name
				};
				schema = {
					table_name: data.name || data.original_name,
					cdc_enabled: true,
					meta_type: "table",
					fields: data.fields
				};
			}

			this.count = this.count + 50;
			let cell = "";
			if (["database", "directory", "ftp", "apiendpoint"].includes(data.meta_type)) {
				if (
					data.source.database_type &&
					["dummy db", "gridfs", "file", "elasticsearch", "rest api", "custom_connection"].includes(
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

<style scoped>
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

.editor-container .editor .e-body .e-vue-component-wrap {
	overflow: auto;
}

.el-checkbox-button .el-checkbox-button__inner {
	padding: 6px 12px;
}

.search {
	width: 77% !important;
	margin-bottom: 10px;
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
.box-head {
	position: fixed;
	z-index: 2;
	background: #fff;
	overflow: hidden;
	width: 217px;
	padding-left: 5px;
}
.el-tree {
	padding-top: 40px;
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
		line-height: 24px;
	}
	.el-input .el-input__icon {
		line-height: 24px;
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
